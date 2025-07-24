const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all tournaments with filters
router.get('/', [
  query('status').optional().custom(val => {
    const validStatuses = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
    return Array.isArray(val) 
      ? val.every(v => validStatuses.includes(v))
      : validStatuses.includes(val);
  }).withMessage('Status must be one of: UPCOMING, ONGOING, COMPLETED, CANCELLED or an array of these values'),
  query('type').optional().isIn(['LEAGUE', 'KNOCKOUT', 'GROUP_KNOCKOUT']),
  query('search').optional().trim().isLength({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, type, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status) {
      where.status = Array.isArray(status) ? { in: status } : status;
    }
    if (type) where.tournamentType = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        include: {
          _count: {
            select: {
              matches: true,
              tournamentTeams: true
            }
          }
        },
        orderBy: { startDate: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.tournament.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        tournaments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get tournament by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(id) },
      include: {
        tournamentTeams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true,
                city: true,
                country: true
              }
            }
          },
          orderBy: [
            { points: 'desc' },
            { goalsFor: 'desc' },
            { goalsAgainst: 'asc' }
          ]
        },
        matches: {
          include: {
            homeTeam: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true
              }
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true
              }
            }
          },
          orderBy: { matchDate: 'asc' }
        },
        _count: {
          select: {
            matches: true,
            tournamentTeams: true
          }
        }
      }
    });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.json({
      success: true,
      data: { tournament }
    });

  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new tournament (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Tournament name must be between 2-100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('startDate').optional().isISO8601().withMessage('Valid start date required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date required'),
  body('tournamentType').isIn(['LEAGUE', 'KNOCKOUT', 'GROUP_KNOCKOUT']).withMessage('Valid tournament type required'),
  body('maxTeams').optional().isInt({ min: 2, max: 64 }).withMessage('Max teams must be between 2-64'),
  body('prizeMoney').optional().isDecimal().withMessage('Valid prize money required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const tournamentData = { ...req.body };
    
    // Convert dates
    if (tournamentData.startDate) tournamentData.startDate = new Date(tournamentData.startDate);
    if (tournamentData.endDate) tournamentData.endDate = new Date(tournamentData.endDate);
    if (tournamentData.maxTeams) tournamentData.maxTeams = parseInt(tournamentData.maxTeams);
    if (tournamentData.prizeMoney) tournamentData.prizeMoney = parseFloat(tournamentData.prizeMoney);

    // Validate date range
    if (tournamentData.startDate && tournamentData.endDate && tournamentData.startDate >= tournamentData.endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const tournament = await prisma.tournament.create({
      data: tournamentData
    });

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      data: { tournament }
    });

  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update tournament (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('tournamentType').optional().isIn(['LEAGUE', 'KNOCKOUT', 'GROUP_KNOCKOUT']),
  body('status').optional().isIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
  body('maxTeams').optional().isInt({ min: 2, max: 64 }),
  body('prizeMoney').optional().isDecimal()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert dates and numbers
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.maxTeams) updateData.maxTeams = parseInt(updateData.maxTeams);
    if (updateData.prizeMoney) updateData.prizeMoney = parseFloat(updateData.prizeMoney);

    const tournament = await prisma.tournament.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Tournament updated successfully',
      data: { tournament }
    });

  } catch (error) {
    console.error('Update tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add team to tournament (Admin only)
router.post('/:id/teams', authenticateToken, requireRole(['ADMIN']), [
  body('teamId').isInt().withMessage('Team ID required'),
  body('groupName').optional().trim().isLength({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { teamId, groupName } = req.body;

    // Check if tournament exists and has space
    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { tournamentTeams: true }
        }
      }
    });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.maxTeams && tournament._count.tournamentTeams >= tournament.maxTeams) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is full'
      });
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const tournamentTeam = await prisma.tournamentTeam.create({
      data: {
        tournamentId: parseInt(id),
        teamId: parseInt(teamId),
        groupName
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Team added to tournament successfully',
      data: { tournamentTeam }
    });

  } catch (error) {
    console.error('Add team to tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get tournament standings
router.get('/:id/standings', async (req, res) => {
  try {
    const { id } = req.params;

    const standings = await prisma.tournamentTeam.findMany({
      where: { tournamentId: parseInt(id) },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true
          }
        }
      },
      orderBy: [
        { points: 'desc' },
        { goalsFor: 'desc' },
        { goalsAgainst: 'asc' }
      ]
    });

    // Group by group name if it's a group tournament
    const groupedStandings = standings.reduce((groups, team) => {
      const group = team.groupName || 'Main';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push({
        ...team,
        goalDifference: team.goalsFor - team.goalsAgainst
      });
      return groups;
    }, {});

    res.json({
      success: true,
      data: { standings: groupedStandings }
    });

  } catch (error) {
    console.error('Get tournament standings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get tournament statistics
router.get('/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;

    // Get top scorers
    const topScorers = await prisma.playerStatistic.findMany({
      where: { tournamentId: parseInt(id) },
      include: {
        player: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true
              }
            }
          }
        }
      },
      orderBy: { goals: 'desc' },
      take: 10
    });

    // Get top assists
    const topAssists = await prisma.playerStatistic.findMany({
      where: { tournamentId: parseInt(id) },
      include: {
        player: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true
              }
            }
          }
        }
      },
      orderBy: { assists: 'desc' },
      take: 10
    });

    // Get tournament totals
    const totals = await prisma.playerStatistic.aggregate({
      where: { tournamentId: parseInt(id) },
      _sum: {
        goals: true,
        assists: true,
        yellowCards: true,
        redCards: true,
        minutesPlayed: true
      },
      _count: {
        id: true
      }
    });

    // Get match statistics
    const matchStats = await prisma.match.aggregate({
      where: { tournamentId: parseInt(id) },
      _count: {
        id: true
      },
      _sum: {
        homeScore: true,
        awayScore: true
      }
    });

    res.json({
      success: true,
      data: {
        topScorers,
        topAssists,
        totals: {
          totalGoals: totals._sum.goals || 0,
          totalAssists: totals._sum.assists || 0,
          totalYellowCards: totals._sum.yellowCards || 0,
          totalRedCards: totals._sum.redCards || 0,
          totalMinutesPlayed: totals._sum.minutesPlayed || 0,
          totalPlayers: totals._count.id || 0,
          totalMatches: matchStats._count.id || 0,
          totalGoalsScored: (matchStats._sum.homeScore || 0) + (matchStats._sum.awayScore || 0)
        }
      }
    });

  } catch (error) {
    console.error('Get tournament statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
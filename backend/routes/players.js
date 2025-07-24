const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all players with filters
router.get('/', [
  query('search').optional().trim().isLength({ min: 1, max: 100 }),
  query('team').optional().isInt(),
  query('position').optional().isIn(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']),
  query('nationality').optional().trim().isLength({ min: 1, max: 50 }),
  query('status').optional().isIn(['ACTIVE', 'INJURED', 'SUSPENDED', 'TRANSFERRED']),
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

    const { search, team, position, nationality, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (team) where.teamId = parseInt(team);
    if (position) where.position = position;
    if (nationality) where.nationality = { contains: nationality, mode: 'insensitive' };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        include: {
          team: {
            select: {
              id: true,
              name: true,
              shortName: true,
              logoUrl: true
            }
          },
          _count: {
            select: {
              matchEvents: true,
              statistics: true
            }
          }
        },
        orderBy: [
          { team: { name: 'asc' } },
          { jerseyNumber: 'asc' }
        ],
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.player.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        players,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get player by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const player = await prisma.player.findUnique({
      where: { id: parseInt(id) },
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
        },
        statistics: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true
              }
            }
          }
        },
        matchEvents: {
          include: {
            match: {
              select: {
                id: true,
                matchDate: true,
                homeTeam: { select: { name: true, shortName: true } },
                awayTeam: { select: { name: true, shortName: true } },
                tournament: { select: { name: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Last 10 events
        }
      }
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    // Calculate age if date of birth exists
    if (player.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(player.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      player.age = age;
    }

    res.json({
      success: true,
      data: { player }
    });

  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new player (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name required (1-50 characters)'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name required (1-50 characters)'),
  body('teamId').optional().isInt().withMessage('Valid team ID required'),
  body('jerseyNumber').optional().isInt({ min: 1, max: 99 }).withMessage('Jersey number must be between 1-99'),
  body('position').isIn(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']).withMessage('Valid position required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth required'),
  body('nationality').optional().trim().isLength({ max: 50 }),
  body('height').optional().isDecimal().withMessage('Valid height required'),
  body('weight').optional().isDecimal().withMessage('Valid weight required'),
  body('preferredFoot').optional().isIn(['LEFT', 'RIGHT', 'BOTH']),
  body('photoUrl').optional().isURL().withMessage('Valid photo URL required'),
  body('marketValue').optional().isDecimal().withMessage('Valid market value required')
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

    const playerData = { ...req.body };
    
    // Convert string numbers to proper types
    if (playerData.teamId) playerData.teamId = parseInt(playerData.teamId);
    if (playerData.jerseyNumber) playerData.jerseyNumber = parseInt(playerData.jerseyNumber);
    if (playerData.dateOfBirth) playerData.dateOfBirth = new Date(playerData.dateOfBirth);
    if (playerData.height) playerData.height = parseFloat(playerData.height);
    if (playerData.weight) playerData.weight = parseFloat(playerData.weight);
    if (playerData.marketValue) playerData.marketValue = parseFloat(playerData.marketValue);

    const player = await prisma.player.create({
      data: playerData,
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
      message: 'Player created successfully',
      data: { player }
    });

  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update player (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('teamId').optional().isInt(),
  body('jerseyNumber').optional().isInt({ min: 1, max: 99 }),
  body('position').optional().isIn(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']),
  body('dateOfBirth').optional().isISO8601(),
  body('nationality').optional().trim().isLength({ max: 50 }),
  body('height').optional().isDecimal(),
  body('weight').optional().isDecimal(),
  body('preferredFoot').optional().isIn(['LEFT', 'RIGHT', 'BOTH']),
  body('photoUrl').optional().isURL(),
  body('marketValue').optional().isDecimal(),
  body('status').optional().isIn(['ACTIVE', 'INJURED', 'SUSPENDED', 'TRANSFERRED'])
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

    // Convert string numbers to proper types
    if (updateData.teamId) updateData.teamId = parseInt(updateData.teamId);
    if (updateData.jerseyNumber) updateData.jerseyNumber = parseInt(updateData.jerseyNumber);
    if (updateData.dateOfBirth) updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    if (updateData.height) updateData.height = parseFloat(updateData.height);
    if (updateData.weight) updateData.weight = parseFloat(updateData.weight);
    if (updateData.marketValue) updateData.marketValue = parseFloat(updateData.marketValue);

    const player = await prisma.player.update({
      where: { id: parseInt(id) },
      data: updateData,
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

    res.json({
      success: true,
      message: 'Player updated successfully',
      data: { player }
    });

  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete player (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if player has match events
    const player = await prisma.player.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            matchEvents: true,
            statistics: true
          }
        }
      }
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    if (player._count.matchEvents > 0 || player._count.statistics > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete player with existing match events or statistics'
      });
    }

    await prisma.player.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Player deleted successfully'
    });

  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get player statistics
router.get('/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;

    const statistics = await prisma.playerStatistic.findMany({
      where: { playerId: parseInt(id) },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true
          }
        }
      },
      orderBy: {
        tournament: { startDate: 'desc' }
      }
    });

    // Calculate career totals
    const careerTotals = statistics.reduce((totals, stat) => {
      totals.matchesPlayed += stat.matchesPlayed;
      totals.goals += stat.goals;
      totals.assists += stat.assists;
      totals.yellowCards += stat.yellowCards;
      totals.redCards += stat.redCards;
      totals.minutesPlayed += stat.minutesPlayed;
      totals.shotsOnTarget += stat.shotsOnTarget;
      totals.passesCompleted += stat.passesCompleted;
      totals.tacklesWon += stat.tacklesWon;
      return totals;
    }, {
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 0,
      shotsOnTarget: 0,
      passesCompleted: 0,
      tacklesWon: 0
    });

    res.json({
      success: true,
      data: {
        statistics,
        careerTotals
      }
    });

  } catch (error) {
    console.error('Get player statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all teams with filters - PRISMA SCHEMA COMPLIANT VERSION
router.get('/', [
  query('search').optional().trim().isLength({ min: 1, max: 100 }),
  query('status').optional().custom(val => {
    const validStatuses = ['ACTIVE', 'INACTIVE'];
    if (Array.isArray(val)) {
      return val.every(v => validStatuses.includes(v));
    }
    return validStatuses.includes(val);
  }).withMessage('Status must be one of: ACTIVE, INACTIVE or an array of these values'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('orderBy').optional().isIn(['name', 'shortName', 'foundedYear', 'city', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc'])
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

    const { 
      search, 
      status, 
      page = 1, 
      limit = 20, 
      orderBy = 'name', 
      order = 'asc' 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    
    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortName: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause - only use valid Team model fields
    let orderByClause = {};
    if (orderBy === 'name') {
      orderByClause = { name: order };
    } else if (orderBy === 'shortName') {
      orderByClause = { shortName: order };
    } else if (orderBy === 'foundedYear') {
      orderByClause = { foundedYear: order };
    } else if (orderBy === 'city') {
      orderByClause = { city: order };
    } else {
      orderByClause = { createdAt: order };
    }

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        include: {
          _count: {
            select: {
              players: true,
              homeMatches: true,
              awayMatches: true,
              tournamentTeams: true
            }
          },
          tournamentTeams: {
            select: {
              wins: true,
              points: true,
              goalsFor: true,
              goalsAgainst: true
            }
          }
        },
        orderBy: orderByClause,
        skip: skip,
        take: parseInt(limit)
      }),
      prisma.team.count({ where })
    ]);

    // Transform data for frontend compatibility
    const transformedTeams = teams.map(team => {
      // Calculate total wins and stats from all tournaments
      const totalWins = team.tournamentTeams.reduce((sum, tt) => sum + tt.wins, 0);
      const totalPoints = team.tournamentTeams.reduce((sum, tt) => sum + tt.points, 0);
      const totalGoalsFor = team.tournamentTeams.reduce((sum, tt) => sum + tt.goalsFor, 0);
      const totalGoalsAgainst = team.tournamentTeams.reduce((sum, tt) => sum + tt.goalsAgainst, 0);
      
      // Calculate a simple rating based on performance
      const tournamentsPlayed = team.tournamentTeams.length;
      const avgPointsPerTournament = tournamentsPlayed > 0 ? totalPoints / tournamentsPlayed : 0;
      const rating = Math.min(5.0, Math.max(1.0, 1 + (avgPointsPerTournament / 10))); // Scale 1-5

      return {
        ...team,
        playersCount: team._count.players,
        matchesCount: team._count.homeMatches + team._count.awayMatches,
        tournamentsCount: team._count.tournamentTeams,
        logo: team.logoUrl, // Map logoUrl to logo for frontend compatibility
        wins: totalWins,
        totalPoints,
        totalGoalsFor,
        totalGoalsAgainst,
        goalDifference: totalGoalsFor - totalGoalsAgainst,
        rating: parseFloat(rating.toFixed(1)),
        // Remove tournamentTeams from response to keep it clean
        tournamentTeams: undefined
      };
    });

    // Return data in the format expected by frontend
    res.json({
      success: true,
      data: transformedTeams,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        players: {
          where: { status: 'ACTIVE' },
          orderBy: [
            { jerseyNumber: 'asc' }
          ]
        },
        _count: {
          select: {
            homeMatches: true,
            awayMatches: true,
            tournamentTeams: true
          }
        },
        tournamentTeams: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          },
          orderBy: [
            { points: 'desc' }
          ]
        }
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Calculate team statistics
    const totalWins = team.tournamentTeams.reduce((sum, tt) => sum + tt.wins, 0);
    const totalDraws = team.tournamentTeams.reduce((sum, tt) => sum + tt.draws, 0);
    const totalLosses = team.tournamentTeams.reduce((sum, tt) => sum + tt.losses, 0);
    const totalPoints = team.tournamentTeams.reduce((sum, tt) => sum + tt.points, 0);
    const totalGoalsFor = team.tournamentTeams.reduce((sum, tt) => sum + tt.goalsFor, 0);
    const totalGoalsAgainst = team.tournamentTeams.reduce((sum, tt) => sum + tt.goalsAgainst, 0);

    // Transform data for frontend compatibility
    const transformedTeam = {
      ...team,
      logo: team.logoUrl,
      playersCount: team.players.length,
      matchesCount: team._count.homeMatches + team._count.awayMatches,
      tournamentsCount: team._count.tournamentTeams,
      // Team statistics
      totalWins,
      totalDraws,
      totalLosses,
      totalPoints,
      totalGoalsFor,
      totalGoalsAgainst,
      goalDifference: totalGoalsFor - totalGoalsAgainst,
      // Tournament history
      tournaments: team.tournamentTeams.map(tt => ({
        ...tt.tournament,
        teamStats: {
          wins: tt.wins,
          draws: tt.draws,
          losses: tt.losses,
          points: tt.points,
          goalsFor: tt.goalsFor,
          goalsAgainst: tt.goalsAgainst,
          goalDifference: tt.goalsFor - tt.goalsAgainst,
          groupName: tt.groupName
        }
      })),
      // Remove raw tournamentTeams data
      tournamentTeams: undefined
    };

    res.json({
      success: true,
      data: transformedTeam
    });

  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new team (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Team name must be between 2-100 characters'),
  body('shortName').trim().isLength({ min: 2, max: 10 }).withMessage('Short name must be between 2-10 characters'),
  body('logoUrl').optional().isURL().withMessage('Valid logo URL required'),
  body('foundedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Valid founded year required'),
  body('stadium').optional().trim().isLength({ max: 100 }),
  body('stadiumCapacity').optional().isInt({ min: 1 }).withMessage('Stadium capacity must be positive'),
  body('city').optional().trim().isLength({ max: 100 }),
  body('country').optional().trim().isLength({ max: 100 }),
  body('managerName').optional().trim().isLength({ max: 100 }),
  body('teamColors').optional().trim().isLength({ max: 100 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
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

    // Check if team name or short name already exists
    const existingTeam = await prisma.team.findFirst({
      where: {
        OR: [
          { name: req.body.name },
          { shortName: req.body.shortName }
        ]
      }
    });

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team name or short name already exists'
      });
    }

    const teamData = { ...req.body };
    
    // Convert numeric fields
    if (teamData.foundedYear) teamData.foundedYear = parseInt(teamData.foundedYear);
    if (teamData.stadiumCapacity) teamData.stadiumCapacity = parseInt(teamData.stadiumCapacity);

    const team = await prisma.team.create({
      data: teamData
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    });

  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update team (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('shortName').optional().trim().isLength({ min: 2, max: 10 }),
  body('logoUrl').optional().isURL(),
  body('foundedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
  body('stadium').optional().trim().isLength({ max: 100 }),
  body('stadiumCapacity').optional().isInt({ min: 1 }),
  body('city').optional().trim().isLength({ max: 100 }),
  body('country').optional().trim().isLength({ max: 100 }),
  body('managerName').optional().trim().isLength({ max: 100 }),
  body('teamColors').optional().trim().isLength({ max: 100 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE'])
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

    // Convert numeric fields
    if (updateData.foundedYear) updateData.foundedYear = parseInt(updateData.foundedYear);
    if (updateData.stadiumCapacity) updateData.stadiumCapacity = parseInt(updateData.stadiumCapacity);

    // Check if name or shortName conflicts with other teams
    if (updateData.name || updateData.shortName) {
      const conflictConditions = [];
      if (updateData.name) conflictConditions.push({ name: updateData.name });
      if (updateData.shortName) conflictConditions.push({ shortName: updateData.shortName });

      const existingTeam = await prisma.team.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(id) } },
            { OR: conflictConditions }
          ]
        }
      });

      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'Team name or short name already exists'
        });
      }
    }

    const team = await prisma.team.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Team updated successfully',
      data: team
    });

  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete team (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if team has players or matches
    const team = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            players: true,
            homeMatches: true,
            awayMatches: true,
            tournamentTeams: true
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const totalMatches = team._count.homeMatches + team._count.awayMatches;
    if (team._count.players > 0 || totalMatches > 0 || team._count.tournamentTeams > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete team with existing players, matches, or tournament participations'
      });
    }

    await prisma.team.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });

  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get team statistics
router.get('/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;

    // Get team with all tournament statistics
    const team = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        tournamentTeams: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        },
        players: {
          where: { status: 'ACTIVE' },
          include: {
            statistics: {
              include: {
                tournament: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Calculate overall statistics
    const overallStats = {
      totalTournaments: team.tournamentTeams.length,
      totalWins: team.tournamentTeams.reduce((sum, tt) => sum + tt.wins, 0),
      totalDraws: team.tournamentTeams.reduce((sum, tt) => sum + tt.draws, 0),
      totalLosses: team.tournamentTeams.reduce((sum, tt) => sum + tt.losses, 0),
      totalPoints: team.tournamentTeams.reduce((sum, tt) => sum + tt.points, 0),
      totalGoalsFor: team.tournamentTeams.reduce((sum, tt) => sum + tt.goalsFor, 0),
      totalGoalsAgainst: team.tournamentTeams.reduce((sum, tt) => sum + tt.goalsAgainst, 0)
    };

    overallStats.totalMatches = overallStats.totalWins + overallStats.totalDraws + overallStats.totalLosses;
    overallStats.goalDifference = overallStats.totalGoalsFor - overallStats.totalGoalsAgainst;
    overallStats.winPercentage = overallStats.totalMatches > 0 ? 
      ((overallStats.totalWins / overallStats.totalMatches) * 100).toFixed(1) : 0;

    // Get top players statistics
    const playerStats = team.players.map(player => {
      const totalGoals = player.statistics.reduce((sum, stat) => sum + stat.goals, 0);
      const totalAssists = player.statistics.reduce((sum, stat) => sum + stat.assists, 0);
      const totalMatches = player.statistics.reduce((sum, stat) => sum + stat.matchesPlayed, 0);
      
      return {
        id: player.id,
        name: `${player.firstName} ${player.lastName}`,
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        totalGoals,
        totalAssists,
        totalMatches
      };
    }).sort((a, b) => b.totalGoals - a.totalGoals);

    res.json({
      success: true,
      data: {
        team: {
          id: team.id,
          name: team.name,
          shortName: team.shortName,
          logoUrl: team.logoUrl
        },
        overallStats,
        topScorers: playerStats.slice(0, 10),
        tournamentHistory: team.tournamentTeams.map(tt => ({
          tournament: tt.tournament,
          stats: {
            wins: tt.wins,
            draws: tt.draws,
            losses: tt.losses,
            points: tt.points,
            goalsFor: tt.goalsFor,
            goalsAgainst: tt.goalsAgainst,
            goalDifference: tt.goalsFor - tt.goalsAgainst,
            groupName: tt.groupName
          }
        }))
      }
    });

  } catch (error) {
    console.error('Get team statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
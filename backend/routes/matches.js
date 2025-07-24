const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Pusher = require('pusher');

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Get all matches with filters
router.get('/', [
  query('status').optional().isIn(['SCHEDULED', 'LIVE', 'HALFTIME', 'COMPLETED', 'POSTPONED', 'CANCELLED']),
  query('tournament').optional().isInt(),
  query('team').optional().isInt(),
  query('date').optional().isISO8601(),
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

    const { status, tournament, team, date, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (tournament) where.tournamentId = parseInt(tournament);
    if (team) {
      where.OR = [
        { homeTeamId: parseInt(team) },
        { awayTeamId: parseInt(team) }
      ];
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.matchDate = {
        gte: startDate,
        lt: endDate
      };
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          tournament: {
            select: { id: true, name: true }
          },
          homeTeam: {
            select: { id: true, name: true, shortName: true, logoUrl: true }
          },
          awayTeam: {
            select: { id: true, name: true, shortName: true, logoUrl: true }
          },
          liveData: true
        },
        orderBy: { matchDate: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.match.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        matches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get match by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const match = await prisma.match.findUnique({
      where: { id: parseInt(id) },
      include: {
        tournament: {
          select: { id: true, name: true, tournamentType: true }
        },
        homeTeam: {
          select: { 
            id: true, 
            name: true, 
            shortName: true, 
            logoUrl: true,
            players: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jerseyNumber: true,
                position: true,
                photoUrl: true
              }
            }
          }
        },
        awayTeam: {
          select: { 
            id: true, 
            name: true, 
            shortName: true, 
            logoUrl: true,
            players: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jerseyNumber: true,
                position: true,
                photoUrl: true
              }
            }
          }
        },
        events: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jerseyNumber: true
              }
            },
            team: {
              select: {
                id: true,
                name: true,
                shortName: true
              }
            }
          },
          orderBy: [
            { minute: 'asc' },
            { additionalTime: 'asc' },
            { createdAt: 'asc' }
          ]
        },
        liveData: true
      }
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.json({
      success: true,
      data: { match }
    });

  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new match (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('tournamentId').isInt().withMessage('Tournament ID required'),
  body('homeTeamId').isInt().withMessage('Home team ID required'),
  body('awayTeamId').isInt().withMessage('Away team ID required'),
  body('matchDate').isISO8601().withMessage('Valid match date required'),
  body('venue').optional().trim().isLength({ max: 100 }),
  body('referee').optional().trim().isLength({ max: 100 }),
  body('matchStage').optional().trim().isLength({ max: 50 })
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
      tournamentId, 
      homeTeamId, 
      awayTeamId, 
      matchDate, 
      venue, 
      referee, 
      matchStage 
    } = req.body;

    // Validate teams are different
    if (homeTeamId === awayTeamId) {
      return res.status(400).json({
        success: false,
        message: 'Home and away teams must be different'
      });
    }

    const match = await prisma.match.create({
      data: {
        tournamentId: parseInt(tournamentId),
        homeTeamId: parseInt(homeTeamId),
        awayTeamId: parseInt(awayTeamId),
        matchDate: new Date(matchDate),
        venue,
        referee,
        matchStage
      },
      include: {
        tournament: {
          select: { id: true, name: true }
        },
        homeTeam: {
          select: { id: true, name: true, shortName: true, logoUrl: true }
        },
        awayTeam: {
          select: { id: true, name: true, shortName: true, logoUrl: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Match created successfully',
      data: { match }
    });

  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update match (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('status').optional().isIn(['SCHEDULED', 'LIVE', 'HALFTIME', 'COMPLETED', 'POSTPONED', 'CANCELLED']),
  body('homeScore').optional().isInt({ min: 0 }),
  body('awayScore').optional().isInt({ min: 0 }),
  body('matchDate').optional().isISO8601(),
  body('venue').optional().trim().isLength({ max: 100 }),
  body('referee').optional().trim().isLength({ max: 100 })
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

    if (updateData.matchDate) {
      updateData.matchDate = new Date(updateData.matchDate);
    }

    const match = await prisma.match.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        tournament: {
          select: { id: true, name: true }
        },
        homeTeam: {
          select: { id: true, name: true, shortName: true, logoUrl: true }
        },
        awayTeam: {
          select: { id: true, name: true, shortName: true, logoUrl: true }
        },
        liveData: true
      }
    });

    // Send real-time update if score changed
    if (updateData.homeScore !== undefined || updateData.awayScore !== undefined) {
      await pusher.trigger(`match-${id}`, 'score-update', {
        matchId: parseInt(id),
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: match.status,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Match updated successfully',
      data: { match }
    });

  } catch (error) {
    console.error('Update match error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get match events
router.get('/:id/events', async (req, res) => {
  try {
    const { id } = req.params;

    const events = await prisma.matchEvent.findMany({
      where: { matchId: parseInt(id) },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jerseyNumber: true
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            shortName: true
          }
        }
      },
      orderBy: [
        { minute: 'asc' },
        { additionalTime: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: { events }
    });

  } catch (error) {
    console.error('Get match events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add match event (Admin only) - REAL-TIME
router.post('/:id/events', authenticateToken, requireRole(['ADMIN']), [
  body('playerId').optional().isInt(),
  body('teamId').isInt().withMessage('Team ID required'),
  body('eventType').isIn(['GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION_IN', 'SUBSTITUTION_OUT']).withMessage('Valid event type required'),
  body('minute').isInt({ min: 0, max: 120 }).withMessage('Valid minute required'),
  body('additionalTime').optional().isInt({ min: 0, max: 30 }),
  body('description').optional().trim().isLength({ max: 500 })
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
    const { playerId, teamId, eventType, minute, additionalTime = 0, description } = req.body;

    // Create event
    const event = await prisma.matchEvent.create({
      data: {
        matchId: parseInt(id),
        playerId: playerId ? parseInt(playerId) : null,
        teamId: parseInt(teamId),
        eventType,
        minute: parseInt(minute),
        additionalTime: parseInt(additionalTime),
        description
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jerseyNumber: true
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            shortName: true
          }
        }
      }
    });

    // Update match score if it's a goal
    if (eventType === 'GOAL') {
      const match = await prisma.match.findUnique({
        where: { id: parseInt(id) },
        select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true }
      });

      let newHomeScore = match.homeScore;
      let newAwayScore = match.awayScore;

      if (parseInt(teamId) === match.homeTeamId) {
        newHomeScore += 1;
      } else {
        newAwayScore += 1;
      }

      await prisma.match.update({
        where: { id: parseInt(id) },
        data: {
          homeScore: newHomeScore,
          awayScore: newAwayScore
        }
      });

      // Send real-time goal notification
      await pusher.trigger(`match-${id}`, 'goal', {
        matchId: parseInt(id),
        event,
        newScore: {
          home: newHomeScore,
          away: newAwayScore
        },
        timestamp: new Date().toISOString()
      });
    } else {
      // Send real-time event notification
      await pusher.trigger(`match-${id}`, 'match-event', {
        matchId: parseInt(id),
        event,
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Match event added successfully',
      data: { event }
    });

  } catch (error) {
    console.error('Add match event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get live match data
router.get('/:id/live', async (req, res) => {
  try {
    const { id } = req.params;

    const liveData = await prisma.liveMatchData.findUnique({
      where: { matchId: parseInt(id) },
      include: {
        match: {
          select: {
            id: true,
            status: true,
            homeScore: true,
            awayScore: true,
            homeTeam: {
              select: { id: true, name: true, shortName: true }
            },
            awayTeam: {
              select: { id: true, name: true, shortName: true }
            }
          }
        }
      }
    });

    if (!liveData) {
      return res.status(404).json({
        success: false,
        message: 'Live data not found for this match'
      });
    }

    res.json({
      success: true,
      data: { liveData }
    });

  } catch (error) {
    console.error('Get live data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update live match data (Admin only) - REAL-TIME
router.post('/:id/live', authenticateToken, requireRole(['ADMIN']), [
  body('currentMinute').optional().isInt({ min: 0, max: 120 }),
  body('additionalTime').optional().isInt({ min: 0, max: 30 }),
  body('possessionHome').optional().isInt({ min: 0, max: 100 }),
  body('possessionAway').optional().isInt({ min: 0, max: 100 }),
  body('shotsHome').optional().isInt({ min: 0 }),
  body('shotsAway').optional().isInt({ min: 0 }),
  body('cornersHome').optional().isInt({ min: 0 }),
  body('cornersAway').optional().isInt({ min: 0 }),
  body('foulsHome').optional().isInt({ min: 0 }),
  body('foulsAway').optional().isInt({ min: 0 })
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

    // Ensure possession adds up to 100
    if (updateData.possessionHome !== undefined && updateData.possessionAway === undefined) {
      updateData.possessionAway = 100 - updateData.possessionHome;
    } else if (updateData.possessionAway !== undefined && updateData.possessionHome === undefined) {
      updateData.possessionHome = 100 - updateData.possessionAway;
    }

    const liveData = await prisma.liveMatchData.upsert({
      where: { matchId: parseInt(id) },
      update: updateData,
      create: {
        matchId: parseInt(id),
        currentMinute: 0,
        ...updateData
      }
    });

    // Send real-time statistics update
    await pusher.trigger(`match-${id}`, 'stats-update', {
      matchId: parseInt(id),
      liveData,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Live data updated successfully',
      data: { liveData }
    });

  } catch (error) {
    console.error('Update live data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
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

// Get all matches with filters - FIXED VERSION
router.get('/', [
  query('status').optional().custom(val => {
    const validStatuses = ['SCHEDULED', 'LIVE', 'HALFTIME', 'COMPLETED', 'POSTPONED', 'CANCELLED'];
    if (Array.isArray(val)) {
      return val.every(v => validStatuses.includes(v));
    }
    return validStatuses.includes(val);
  }).withMessage('Status must be one of: SCHEDULED, LIVE, HALFTIME, COMPLETED, POSTPONED, CANCELLED or an array of these values'),
  query('tournament').optional().isInt(),
  query('team').optional().isInt(),
  query('date').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('orderBy').optional().isIn(['matchDate', 'homeScore', 'awayScore', 'createdAt']),
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
      status, 
      tournament, 
      team, 
      date, 
      page = 1, 
      limit = 20,
      orderBy = 'matchDate',
      order = 'desc'
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

    // Build orderBy clause
    let orderByClause = {};
    if (orderBy === 'matchDate') {
      orderByClause = { matchDate: order };
    } else if (orderBy === 'homeScore') {
      orderByClause = { homeScore: order };
    } else if (orderBy === 'awayScore') {
      orderByClause = { awayScore: order };
    } else {
      orderByClause = { createdAt: order };
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
          liveData: true,
          _count: {
            select: { events: true }
          }
        },
        orderBy: orderByClause,
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.match.count({ where })
    ]);

    // Transform data for frontend compatibility
    const transformedMatches = matches.map(match => ({
      ...match,
      eventsCount: match._count.events,
      date: match.matchDate, // Alias for frontend compatibility
      venue: match.venue || 'TBD',
      stage: match.matchStage || 'Match'
    }));

    // Return data in the format expected by frontend
    res.json({
      success: true,
      data: transformedMatches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      data: match
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
      data: match
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
      data: match
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
      data: events
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
      data: event
    });

  } catch (error) {
    console.error('Add match event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start live match (Admin only)
router.post('/:id/start', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const match = await prisma.match.update({
      where: { id: parseInt(id) },
      data: { 
        status: 'LIVE',
        liveData: {
          create: {
            currentMinute: 0,
            additionalTime: 0,
            half: 1,
            isActive: true
          }
        }
      },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        liveData: true
      }
    });

    // Send real-time match start notification
    await pusher.trigger(`match-${id}`, 'match-start', {
      matchId: parseInt(id),
      match,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Match started successfully',
      data: match
    });

  } catch (error) {
    console.error('Start match error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update live match time (Admin only)
router.put('/:id/time', authenticateToken, requireRole(['ADMIN']), [
  body('currentMinute').isInt({ min: 0, max: 120 }).withMessage('Valid minute required'),
  body('additionalTime').optional().isInt({ min: 0, max: 30 }),
  body('half').isIn([1, 2]).withMessage('Half must be 1 or 2')
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
    const { currentMinute, additionalTime = 0, half } = req.body;

    const liveData = await prisma.liveMatchData.update({
      where: { matchId: parseInt(id) },
      data: {
        currentMinute: parseInt(currentMinute),
        additionalTime: parseInt(additionalTime),
        half: parseInt(half)
      }
    });

    // Send real-time time update
    await pusher.trigger(`match-${id}`, 'time-update', {
      matchId: parseInt(id),
      currentMinute: parseInt(currentMinute),
      additionalTime: parseInt(additionalTime),
      half: parseInt(half),
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Match time updated successfully',
      data: liveData
    });

  } catch (error) {
    console.error('Update match time error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
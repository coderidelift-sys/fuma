const express = require('express');
const { query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get overall statistics
router.get('/', async (req, res) => {
  try {
    // Get counts for dashboard
    const [
      totalTournaments,
      totalTeams,
      totalPlayers,
      totalMatches,
      activeTournaments,
      liveMatches,
      completedMatches
    ] = await Promise.all([
      prisma.tournament.count(),
      prisma.team.count({ where: { status: 'ACTIVE' } }),
      prisma.player.count({ where: { status: 'ACTIVE' } }),
      prisma.match.count(),
      prisma.tournament.count({ where: { status: 'ONGOING' } }),
      prisma.match.count({ where: { status: 'LIVE' } }),
      prisma.match.count({ where: { status: 'COMPLETED' } })
    ]);

    // Get recent matches
    const recentMatches = await prisma.match.findMany({
      where: { status: 'COMPLETED' },
      include: {
        homeTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        awayTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        tournament: {
          select: { name: true }
        }
      },
      orderBy: { matchDate: 'desc' },
      take: 5
    });

    // Get upcoming matches
    const upcomingMatches = await prisma.match.findMany({
      where: { status: 'SCHEDULED' },
      include: {
        homeTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        awayTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        tournament: {
          select: { name: true }
        }
      },
      orderBy: { matchDate: 'asc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalTournaments,
          totalTeams,
          totalPlayers,
          totalMatches,
          activeTournaments,
          liveMatches,
          completedMatches
        },
        recentMatches,
        upcomingMatches
      }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get player statistics
router.get('/players', [
  query('tournament').optional().isInt(),
  query('team').optional().isInt(),
  query('position').optional().isIn(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']),
  query('sortBy').optional().isIn(['goals', 'assists', 'matches', 'minutes']),
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

    const { tournament, team, position, sortBy = 'goals', limit = 20 } = req.query;

    // Build where clause
    const where = {};
    if (tournament) where.tournamentId = parseInt(tournament);
    if (team) where.player = { teamId: parseInt(team) };
    if (position) where.player = { ...where.player, position };

    // Build order by
    const orderBy = {};
    orderBy[sortBy] = 'desc';

    const playerStats = await prisma.playerStatistic.findMany({
      where,
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
        },
        tournament: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy,
      take: parseInt(limit)
    });

    // Calculate additional metrics
    const enrichedStats = playerStats.map(stat => ({
      ...stat,
      goalsPerMatch: stat.matchesPlayed > 0 ? (stat.goals / stat.matchesPlayed).toFixed(2) : '0.00',
      assistsPerMatch: stat.matchesPlayed > 0 ? (stat.assists / stat.matchesPlayed).toFixed(2) : '0.00',
      minutesPerGoal: stat.goals > 0 ? Math.round(stat.minutesPlayed / stat.goals) : null,
      totalContributions: stat.goals + stat.assists
    }));

    res.json({
      success: true,
      data: { playerStats: enrichedStats }
    });

  } catch (error) {
    console.error('Get player statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get team statistics
router.get('/teams', [
  query('tournament').optional().isInt(),
  query('sortBy').optional().isIn(['points', 'wins', 'goals_for', 'goals_against']),
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

    const { tournament, sortBy = 'points', limit = 20 } = req.query;

    // Build where clause
    const where = {};
    if (tournament) where.tournamentId = parseInt(tournament);

    // Build order by
    const orderBy = {};
    orderBy[sortBy] = 'desc';

    const teamStats = await prisma.tournamentTeam.findMany({
      where,
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
        tournament: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy,
      take: parseInt(limit)
    });

    // Calculate additional metrics
    const enrichedStats = teamStats.map(stat => ({
      ...stat,
      goalDifference: stat.goalsFor - stat.goalsAgainst,
      winPercentage: stat.matchesPlayed > 0 ? ((stat.wins / stat.matchesPlayed) * 100).toFixed(1) : '0.0',
      pointsPerMatch: stat.matchesPlayed > 0 ? (stat.points / stat.matchesPlayed).toFixed(2) : '0.00',
      goalsPerMatch: stat.matchesPlayed > 0 ? (stat.goalsFor / stat.matchesPlayed).toFixed(2) : '0.00',
      cleanSheets: stat.matchesPlayed - stat.losses - stat.draws // Approximation
    }));

    res.json({
      success: true,
      data: { teamStats: enrichedStats }
    });

  } catch (error) {
    console.error('Get team statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get tournament statistics
router.get('/tournaments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get tournament info
    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(id) },
      include: {
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

    // Get top scorers
    const topScorers = await prisma.playerStatistic.findMany({
      where: { tournamentId: parseInt(id) },
      include: {
        player: {
          include: {
            team: {
              select: {
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

    // Get match statistics
    const matchStats = await prisma.match.groupBy({
      by: ['status'],
      where: { tournamentId: parseInt(id) },
      _count: {
        id: true
      }
    });

    // Get total goals
    const totalGoals = await prisma.match.aggregate({
      where: { tournamentId: parseInt(id) },
      _sum: {
        homeScore: true,
        awayScore: true
      }
    });

    // Get cards statistics
    const cardStats = await prisma.matchEvent.groupBy({
      by: ['eventType'],
      where: {
        match: { tournamentId: parseInt(id) },
        eventType: { in: ['YELLOW_CARD', 'RED_CARD'] }
      },
      _count: {
        id: true
      }
    });

    // Format match statistics
    const formattedMatchStats = matchStats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count.id;
      return acc;
    }, {});

    // Format card statistics
    const formattedCardStats = cardStats.reduce((acc, stat) => {
      acc[stat.eventType.toLowerCase()] = stat._count.id;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        tournament,
        topScorers,
        statistics: {
          totalMatches: tournament._count.matches,
          totalTeams: tournament._count.tournamentTeams,
          totalGoals: (totalGoals._sum.homeScore || 0) + (totalGoals._sum.awayScore || 0),
          averageGoalsPerMatch: tournament._count.matches > 0 ? 
            (((totalGoals._sum.homeScore || 0) + (totalGoals._sum.awayScore || 0)) / tournament._count.matches).toFixed(2) : '0.00',
          matchesByStatus: formattedMatchStats,
          cardStatistics: formattedCardStats
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

// Get match statistics
router.get('/matches', [
  query('tournament').optional().isInt(),
  query('team').optional().isInt(),
  query('period').optional().isIn(['week', 'month', 'year']),
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

    const { tournament, team, period = 'month', limit = 20 } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Build where clause
    const where = {
      matchDate: {
        gte: startDate,
        lte: now
      }
    };
    
    if (tournament) where.tournamentId = parseInt(tournament);
    if (team) {
      where.OR = [
        { homeTeamId: parseInt(team) },
        { awayTeamId: parseInt(team) }
      ];
    }

    // Get matches with statistics
    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        awayTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        tournament: {
          select: { name: true }
        },
        events: {
          select: { eventType: true }
        }
      },
      orderBy: { matchDate: 'desc' },
      take: parseInt(limit)
    });

    // Calculate match statistics
    const enrichedMatches = matches.map(match => {
      const goals = match.events.filter(e => e.eventType === 'GOAL').length;
      const yellowCards = match.events.filter(e => e.eventType === 'YELLOW_CARD').length;
      const redCards = match.events.filter(e => e.eventType === 'RED_CARD').length;
      
      return {
        ...match,
        totalGoals: match.homeScore + match.awayScore,
        totalEvents: match.events.length,
        yellowCards,
        redCards,
        isHighScoring: (match.homeScore + match.awayScore) >= 3
      };
    });

    // Calculate period statistics
    const periodStats = {
      totalMatches: matches.length,
      totalGoals: matches.reduce((sum, match) => sum + match.homeScore + match.awayScore, 0),
      averageGoalsPerMatch: matches.length > 0 ? 
        (matches.reduce((sum, match) => sum + match.homeScore + match.awayScore, 0) / matches.length).toFixed(2) : '0.00',
      highScoringMatches: matches.filter(match => (match.homeScore + match.awayScore) >= 3).length,
      completedMatches: matches.filter(match => match.status === 'COMPLETED').length,
      liveMatches: matches.filter(match => match.status === 'LIVE').length
    };

    res.json({
      success: true,
      data: {
        matches: enrichedMatches,
        periodStats
      }
    });

  } catch (error) {
    console.error('Get match statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get comprehensive dashboard statistics
    const [
      totalTournaments,
      totalTeams,
      totalPlayers,
      totalMatches,
      activeTournaments,
      liveMatches,
      completedMatches,
      scheduledMatches
    ] = await Promise.all([
      prisma.tournament.count(),
      prisma.team.count({ where: { status: 'ACTIVE' } }),
      prisma.player.count({ where: { status: 'ACTIVE' } }),
      prisma.match.count(),
      prisma.tournament.count({ where: { status: 'ONGOING' } }),
      prisma.match.count({ where: { status: 'LIVE' } }),
      prisma.match.count({ where: { status: 'COMPLETED' } }),
      prisma.match.count({ where: { status: 'SCHEDULED' } })
    ]);

    // Get today's matches
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayMatches = await prisma.match.findMany({
      where: {
        matchDate: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        homeTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        awayTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        tournament: {
          select: { name: true }
        }
      },
      orderBy: { matchDate: 'asc' }
    });

    // Get recent completed matches (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const recentMatches = await prisma.match.findMany({
      where: {
        status: 'COMPLETED',
        matchDate: {
          gte: sevenDaysAgo,
          lte: today
        }
      },
      include: {
        homeTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        awayTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        tournament: {
          select: { name: true }
        }
      },
      orderBy: { matchDate: 'desc' },
      take: 5
    });

    // Get upcoming matches (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const upcomingMatches = await prisma.match.findMany({
      where: {
        status: 'SCHEDULED',
        matchDate: {
          gte: today,
          lte: sevenDaysFromNow
        }
      },
      include: {
        homeTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        awayTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        tournament: {
          select: { name: true }
        }
      },
      orderBy: { matchDate: 'asc' },
      take: 5
    });

    // Get top scorers (all time)
    const topScorers = await prisma.playerStatistic.findMany({
      where: {
        goals: {
          gt: 0
        }
      },
      include: {
        player: {
          include: {
            team: {
              select: {
                name: true,
                shortName: true,
                logoUrl: true
              }
            }
          }
        },
        tournament: {
          select: {
            name: true
          }
        }
      },
      orderBy: { goals: 'desc' },
      take: 5
    });

    // Calculate match trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const matchTrends = await prisma.match.groupBy({
      by: ['status'],
      where: {
        matchDate: {
          gte: thirtyDaysAgo,
          lte: today
        }
      },
      _count: {
        id: true
      }
    });

    const formattedMatchTrends = matchTrends.reduce((acc, trend) => {
      acc[trend.status.toLowerCase()] = trend._count.id;
      return acc;
    }, {});

    // Get total goals this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const totalGoalsThisMonth = await prisma.match.aggregate({
      where: {
        status: 'COMPLETED',
        matchDate: {
          gte: startOfMonth,
          lte: today
        }
      },
      _sum: {
        homeScore: true,
        awayScore: true
      }
    });

    const monthlyGoals = (totalGoalsThisMonth._sum.homeScore || 0) + (totalGoalsThisMonth._sum.awayScore || 0);

    res.json({
      success: true,
      data: {
        overview: {
          totalTournaments,
          totalTeams,
          totalPlayers,
          totalMatches,
          activeTournaments,
          liveMatches,
          completedMatches,
          scheduledMatches,
          monthlyGoals
        },
        todayMatches,
        recentMatches,
        upcomingMatches,
        topScorers,
        trends: {
          matchTrends: formattedMatchTrends,
          period: 'last_30_days'
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get recent activity
router.get('/recent-activity', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('days').optional().isInt({ min: 1, max: 30 })
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

    const { limit = 20, days = 7 } = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - parseInt(days));

    // Get recent matches
    const recentMatches = await prisma.match.findMany({
      where: {
        matchDate: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        homeTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        awayTeam: {
          select: { name: true, shortName: true, logoUrl: true }
        },
        tournament: {
          select: { name: true }
        }
      },
      orderBy: { matchDate: 'desc' },
      take: parseInt(limit)
    });

    // Get recent goals and events
    const recentEvents = await prisma.matchEvent.findMany({
      where: {
        match: {
          matchDate: {
            gte: startDate,
            lte: now
          }
        },
        eventType: {
          in: ['GOAL', 'RED_CARD', 'YELLOW_CARD']
        }
      },
      include: {
        player: {
          include: {
            team: {
              select: { name: true, shortName: true, logoUrl: true }
            }
          }
        },
        match: {
          include: {
            homeTeam: {
              select: { name: true, shortName: true }
            },
            awayTeam: {
              select: { name: true, shortName: true }
            },
            tournament: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    // Get recent team updates (new teams, status changes)
    const recentTeams = await prisma.team.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get recent player updates
    const recentPlayers = await prisma.player.findMany({
      include: {
        team: {
          select: { name: true, shortName: true, logoUrl: true }
        }
      },
      orderBy: { id: 'desc' }, // Use id instead of createdAt since Player model doesn't have createdAt
      take: 5
    });

    // Get recent tournament updates
    const recentTournaments = await prisma.tournament.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Format activity feed
    const activityFeed = [];

    // Add match activities
    recentMatches.forEach(match => {
      activityFeed.push({
        id: `match_${match.id}`,
        type: 'match',
        action: match.status.toLowerCase(),
        timestamp: match.matchDate,
        data: {
          match,
          description: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
          tournament: match.tournament.name,
          score: match.status === 'COMPLETED' ? `${match.homeScore}-${match.awayScore}` : null
        }
      });
    });

    // Add event activities
    recentEvents.forEach(event => {
      activityFeed.push({
        id: `event_${event.id}`,
        type: 'event',
        action: event.eventType.toLowerCase(),
        timestamp: event.createdAt,
        data: {
          event,
          description: `${event.player.name} - ${event.eventType.replace('_', ' ')}`,
          match: `${event.match.homeTeam.name} vs ${event.match.awayTeam.name}`,
          tournament: event.match.tournament.name
        }
      });
    });

    // Add team activities
    recentTeams.forEach(team => {
      activityFeed.push({
        id: `team_${team.id}`,
        type: 'team',
        action: 'created',
        timestamp: team.createdAt,
        data: {
          team,
          description: `New team: ${team.name}`,
          location: `${team.city}, ${team.country}`
        }
      });
    });

    // Add player activities
    recentPlayers.forEach(player => {
      activityFeed.push({
        id: `player_${player.id}`,
        type: 'player',
        action: 'created',
        timestamp: new Date(), // Use current date since Player model doesn't have createdAt
        data: {
          player,
          description: `New player: ${player.firstName} ${player.lastName}`,
          team: player.team?.name || 'No team',
          position: player.position
        }
      });
    });

    // Add tournament activities
    recentTournaments.forEach(tournament => {
      activityFeed.push({
        id: `tournament_${tournament.id}`,
        type: 'tournament',
        action: 'created',
        timestamp: tournament.createdAt,
        data: {
          tournament,
          description: `New tournament: ${tournament.name}`,
          status: tournament.status
        }
      });
    });

    // Sort by timestamp (most recent first) and limit
    const sortedActivity = activityFeed
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    // Calculate activity summary
    const activitySummary = {
      totalActivities: sortedActivity.length,
      matchActivities: sortedActivity.filter(a => a.type === 'match').length,
      eventActivities: sortedActivity.filter(a => a.type === 'event').length,
      teamActivities: sortedActivity.filter(a => a.type === 'team').length,
      playerActivities: sortedActivity.filter(a => a.type === 'player').length,
      tournamentActivities: sortedActivity.filter(a => a.type === 'tournament').length,
      period: `last_${days}_days`
    };

    res.json({
      success: true,
      data: {
        activities: sortedActivity,
        summary: activitySummary,
        pagination: {
          limit: parseInt(limit),
          total: sortedActivity.length,
          hasMore: activityFeed.length > parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
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

module.exports = router;
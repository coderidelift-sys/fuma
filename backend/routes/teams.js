const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all teams with filters
router.get('/', [
  query('search').optional().trim().isLength({ min: 1, max: 100 }),
  query('status').optional().isIn(['ACTIVE', 'INACTIVE']),
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

    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortName: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        include: {
          _count: {
            select: {
              players: true,
              homeMatches: true,
              awayMatches: true
            }
          }
        },
        orderBy: { name: 'asc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.team.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        teams,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
        }
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    res.json({
      success: true,
      data: { team }
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
  body('foundedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
  body('stadium').optional().trim().isLength({ max: 100 }),
  body('stadiumCapacity').optional().isInt({ min: 1 }),
  body('city').optional().trim().isLength({ max: 100 }),
  body('country').optional().trim().isLength({ max: 100 }),
  body('managerName').optional().trim().isLength({ max: 100 }),
  body('teamColors').optional().trim().isLength({ max: 100 })
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

    const team = await prisma.team.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: { team }
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

    const team = await prisma.team.update({
      where: { id: parseInt(id) },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Team updated successfully',
      data: { team }
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
            awayMatches: true
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
    if (team._count.players > 0 || totalMatches > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete team with existing players or matches'
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

module.exports = router;
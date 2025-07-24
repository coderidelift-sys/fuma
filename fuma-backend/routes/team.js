const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { Team, User, Tournament } = require('../models');

// List team
router.get('/', authenticate, async (req, res) => {
  const teams = await Team.findAll({ include: [ { model: User, as: 'manager' }, Tournament ] });
  res.json(teams);
});
// Detail team
router.get('/:id', authenticate, async (req, res) => {
  const team = await Team.findByPk(req.params.id, { include: [ { model: User, as: 'manager' }, Tournament ] });
  if (!team) return res.status(404).json({ message: 'Team tidak ditemukan' });
  res.json(team);
});
// Create team
router.post('/', authenticate, authorize(['Admin', 'Penyelenggara', 'Manager Tim']), async (req, res) => {
  const team = await Team.create(req.body);
  res.status(201).json(team);
});
// Update team
router.put('/:id', authenticate, authorize(['Admin', 'Penyelenggara', 'Manager Tim']), async (req, res) => {
  const team = await Team.findByPk(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team tidak ditemukan' });
  await team.update(req.body);
  res.json(team);
});
// Delete team
router.delete('/:id', authenticate, authorize(['Admin', 'Penyelenggara', 'Manager Tim']), async (req, res) => {
  const team = await Team.findByPk(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team tidak ditemukan' });
  await team.destroy();
  res.json({ message: 'Team dihapus' });
});

module.exports = router; 
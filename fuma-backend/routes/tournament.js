const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { Tournament, User } = require('../models');

// List tournament
router.get('/', authenticate, async (req, res) => {
  const tournaments = await Tournament.findAll({ include: { model: User, as: 'organizer' } });
  res.json(tournaments);
});
// Detail tournament
router.get('/:id', authenticate, async (req, res) => {
  const tournament = await Tournament.findByPk(req.params.id, { include: { model: User, as: 'organizer' } });
  if (!tournament) return res.status(404).json({ message: 'Tournament tidak ditemukan' });
  res.json(tournament);
});
// Create tournament
router.post('/', authenticate, authorize(['Admin', 'Penyelenggara']), async (req, res) => {
  const tournament = await Tournament.create(req.body);
  res.status(201).json(tournament);
});
// Update tournament
router.put('/:id', authenticate, authorize(['Admin', 'Penyelenggara']), async (req, res) => {
  const tournament = await Tournament.findByPk(req.params.id);
  if (!tournament) return res.status(404).json({ message: 'Tournament tidak ditemukan' });
  await tournament.update(req.body);
  res.json(tournament);
});
// Delete tournament
router.delete('/:id', authenticate, authorize(['Admin', 'Penyelenggara']), async (req, res) => {
  const tournament = await Tournament.findByPk(req.params.id);
  if (!tournament) return res.status(404).json({ message: 'Tournament tidak ditemukan' });
  await tournament.destroy();
  res.json({ message: 'Tournament dihapus' });
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { Player, Team } = require('../models');

// List player
router.get('/', authenticate, async (req, res) => {
  const players = await Player.findAll({ include: Team });
  res.json(players);
});
// Detail player
router.get('/:id', authenticate, async (req, res) => {
  const player = await Player.findByPk(req.params.id, { include: Team });
  if (!player) return res.status(404).json({ message: 'Player tidak ditemukan' });
  res.json(player);
});
// Create player
router.post('/', authenticate, authorize(['Admin', 'Penyelenggara', 'Manager Tim']), async (req, res) => {
  const player = await Player.create(req.body);
  res.status(201).json(player);
});
// Update player
router.put('/:id', authenticate, authorize(['Admin', 'Penyelenggara', 'Manager Tim']), async (req, res) => {
  const player = await Player.findByPk(req.params.id);
  if (!player) return res.status(404).json({ message: 'Player tidak ditemukan' });
  await player.update(req.body);
  res.json(player);
});
// Delete player
router.delete('/:id', authenticate, authorize(['Admin', 'Penyelenggara', 'Manager Tim']), async (req, res) => {
  const player = await Player.findByPk(req.params.id);
  if (!player) return res.status(404).json({ message: 'Player tidak ditemukan' });
  await player.destroy();
  res.json({ message: 'Player dihapus' });
});

module.exports = router; 
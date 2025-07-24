const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { PlayerMatchStats, Match, Player } = require('../models');

router.get('/', authenticate, async (req, res) => {
  const stats = await PlayerMatchStats.findAll({ include: [Match, Player] });
  res.json(stats);
});
router.get('/:id', authenticate, async (req, res) => {
  const stat = await PlayerMatchStats.findByPk(req.params.id, { include: [Match, Player] });
  if (!stat) return res.status(404).json({ message: 'Statistik tidak ditemukan' });
  res.json(stat);
});
router.post('/', authenticate, authorize(['Admin', 'Penyelenggara', 'Panitia']), async (req, res) => {
  const stat = await PlayerMatchStats.create(req.body);
  res.status(201).json(stat);
});
router.put('/:id', authenticate, authorize(['Admin', 'Penyelenggara', 'Panitia']), async (req, res) => {
  const stat = await PlayerMatchStats.findByPk(req.params.id);
  if (!stat) return res.status(404).json({ message: 'Statistik tidak ditemukan' });
  await stat.update(req.body);
  res.json(stat);
});
router.delete('/:id', authenticate, authorize(['Admin', 'Penyelenggara', 'Panitia']), async (req, res) => {
  const stat = await PlayerMatchStats.findByPk(req.params.id);
  if (!stat) return res.status(404).json({ message: 'Statistik tidak ditemukan' });
  await stat.destroy();
  res.json({ message: 'Statistik dihapus' });
});

module.exports = router; 
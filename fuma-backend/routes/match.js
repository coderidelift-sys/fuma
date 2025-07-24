const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { Match, Tournament, Team } = require('../models');

router.get('/', authenticate, async (req, res) => {
  const matches = await Match.findAll({ include: [Tournament, { model: Team, as: 'home_team' }, { model: Team, as: 'away_team' }] });
  res.json(matches);
});
router.get('/:id', authenticate, async (req, res) => {
  const match = await Match.findByPk(req.params.id, { include: [Tournament, { model: Team, as: 'home_team' }, { model: Team, as: 'away_team' }] });
  if (!match) return res.status(404).json({ message: 'Match tidak ditemukan' });
  res.json(match);
});
router.post('/', authenticate, authorize(['Admin', 'Penyelenggara', 'Panitia']), async (req, res) => {
  const match = await Match.create(req.body);
  res.status(201).json(match);
});
router.put('/:id', authenticate, authorize(['Admin', 'Penyelenggara', 'Panitia']), async (req, res) => {
  const match = await Match.findByPk(req.params.id);
  if (!match) return res.status(404).json({ message: 'Match tidak ditemukan' });
  await match.update(req.body);
  res.json(match);
});
router.delete('/:id', authenticate, authorize(['Admin', 'Penyelenggara', 'Panitia']), async (req, res) => {
  const match = await Match.findByPk(req.params.id);
  if (!match) return res.status(404).json({ message: 'Match tidak ditemukan' });
  await match.destroy();
  res.json({ message: 'Match dihapus' });
});

module.exports = router; 
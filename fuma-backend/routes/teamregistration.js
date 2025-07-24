const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { TeamRegistration, Team, Tournament, User } = require('../models');

router.get('/', authenticate, async (req, res) => {
  const regs = await TeamRegistration.findAll({ include: [Team, Tournament, { model: User, as: 'manager' }] });
  res.json(regs);
});
router.get('/:id', authenticate, async (req, res) => {
  const reg = await TeamRegistration.findByPk(req.params.id, { include: [Team, Tournament, { model: User, as: 'manager' }] });
  if (!reg) return res.status(404).json({ message: 'Registrasi tidak ditemukan' });
  res.json(reg);
});
router.post('/', authenticate, authorize(['Admin', 'Penyelenggara', 'Manager Tim']), async (req, res) => {
  const reg = await TeamRegistration.create(req.body);
  res.status(201).json(reg);
});
router.put('/:id', authenticate, authorize(['Admin', 'Penyelenggara', 'Manager Tim']), async (req, res) => {
  const reg = await TeamRegistration.findByPk(req.params.id);
  if (!reg) return res.status(404).json({ message: 'Registrasi tidak ditemukan' });
  await reg.update(req.body);
  res.json(reg);
});
router.delete('/:id', authenticate, authorize(['Admin', 'Penyelenggara', 'Manager Tim']), async (req, res) => {
  const reg = await TeamRegistration.findByPk(req.params.id);
  if (!reg) return res.status(404).json({ message: 'Registrasi tidak ditemukan' });
  await reg.destroy();
  res.json({ message: 'Registrasi dihapus' });
});

module.exports = router; 
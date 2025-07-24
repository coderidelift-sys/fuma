const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { Committee, User, Tournament } = require('../models');

router.get('/', authenticate, async (req, res) => {
  const committees = await Committee.findAll({ include: [User, Tournament] });
  res.json(committees);
});
router.get('/:id', authenticate, async (req, res) => {
  const committee = await Committee.findByPk(req.params.id, { include: [User, Tournament] });
  if (!committee) return res.status(404).json({ message: 'Committee tidak ditemukan' });
  res.json(committee);
});
router.post('/', authenticate, authorize(['Admin', 'Penyelenggara']), async (req, res) => {
  const committee = await Committee.create(req.body);
  res.status(201).json(committee);
});
router.put('/:id', authenticate, authorize(['Admin', 'Penyelenggara']), async (req, res) => {
  const committee = await Committee.findByPk(req.params.id);
  if (!committee) return res.status(404).json({ message: 'Committee tidak ditemukan' });
  await committee.update(req.body);
  res.json(committee);
});
router.delete('/:id', authenticate, authorize(['Admin', 'Penyelenggara']), async (req, res) => {
  const committee = await Committee.findByPk(req.params.id);
  if (!committee) return res.status(404).json({ message: 'Committee tidak ditemukan' });
  await committee.destroy();
  res.json({ message: 'Committee dihapus' });
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { User, Role } = require('../models');

// List user
router.get('/', authenticate, authorize(['Admin']), async (req, res) => {
  const users = await User.findAll({ include: Role });
  res.json(users);
});
// Detail user
router.get('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  const user = await User.findByPk(req.params.id, { include: Role });
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  res.json(user);
});
// Update user
router.put('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  await user.update(req.body);
  res.json(user);
});
// Delete user
router.delete('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  await user.destroy();
  res.json({ message: 'User dihapus' });
});

module.exports = router; 
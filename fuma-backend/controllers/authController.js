const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

exports.register = async (req, res) => {
  try {
    const { full_name, email, whatsapp_number, password, role_id } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email sudah terdaftar' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ full_name, email, whatsapp_number, password_hash: hash, role_id });
    res.status(201).json({ message: 'Registrasi berhasil', user: { user_id: user.user_id, full_name: user.full_name, email: user.email, role_id: user.role_id } });
  } catch (err) {
    res.status(500).json({ message: 'Gagal register', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Email tidak ditemukan' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: 'Password salah' });
    const token = jwt.sign({ user_id: user.user_id, role: 'tot' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { user_id: user.user_id, full_name: user.full_name, email: user.email, role: 'tot' } });
  } catch (err) {
    res.status(500).json({ message: 'Gagal login', error: err.message });
  }
}; 
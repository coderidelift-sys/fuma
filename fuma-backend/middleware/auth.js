const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token tidak ditemukan' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid' });
    req.user = user;
    next();
  });
};

exports.authorize = (roles = []) => (req, res, next) => {
  if (!roles.length) return next();
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Akses ditolak' });
  }
  next();
}; 
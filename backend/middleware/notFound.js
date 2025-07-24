const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/auth/me',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/teams',
      'GET /api/players',
      'GET /api/tournaments',
      'GET /api/matches',
      'GET /api/statistics',
      'GET /health'
    ]
  });
};

module.exports = { notFound };
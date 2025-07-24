const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'FUMA Backend API Ready' });
});

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const tournamentRoutes = require('./routes/tournament');
const teamRoutes = require('./routes/team');
const playerRoutes = require('./routes/player');
const matchRoutes = require('./routes/match');
const committeeRoutes = require('./routes/committee');
const teamRegistrationRoutes = require('./routes/teamregistration');
const playerMatchStatsRoutes = require('./routes/playermatchstats');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/committees', committeeRoutes);
app.use('/api/team-registrations', teamRegistrationRoutes);
app.use('/api/player-match-stats', playerMatchStatsRoutes);

// TODO: Tambahkan routing entitas di sini

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
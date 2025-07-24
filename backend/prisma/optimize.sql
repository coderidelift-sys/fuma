-- Database optimization script
-- Add indexes for better query performance

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Teams table indexes  
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_country ON teams(country);
CREATE INDEX idx_teams_name ON teams(name);

-- Players table indexes
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_nationality ON players(nationality);
CREATE INDEX idx_players_name ON players(first_name, last_name);

-- Tournaments table indexes
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_type ON tournaments(tournament_type);
CREATE INDEX idx_tournaments_dates ON tournaments(start_date, end_date);

-- Tournament teams table indexes
CREATE INDEX idx_tournament_teams_tournament ON tournament_teams(tournament_id);
CREATE INDEX idx_tournament_teams_team ON tournament_teams(team_id);
CREATE INDEX idx_tournament_teams_points ON tournament_teams(points DESC);

-- Matches table indexes
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_home_team ON matches(home_team_id);
CREATE INDEX idx_matches_away_team ON matches(away_team_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);

-- Match events table indexes
CREATE INDEX idx_match_events_match ON match_events(match_id);
CREATE INDEX idx_match_events_player ON match_events(player_id);
CREATE INDEX idx_match_events_team ON match_events(team_id);
CREATE INDEX idx_match_events_type ON match_events(event_type);
CREATE INDEX idx_match_events_minute ON match_events(minute);

-- Player statistics table indexes
CREATE INDEX idx_player_stats_player ON player_statistics(player_id);
CREATE INDEX idx_player_stats_tournament ON player_statistics(tournament_id);
CREATE INDEX idx_player_stats_goals ON player_statistics(goals DESC);
CREATE INDEX idx_player_stats_assists ON player_statistics(assists DESC);

-- Live match data table indexes
CREATE INDEX idx_live_match_data_match ON live_match_data(match_id);

-- Composite indexes for common queries
CREATE INDEX idx_players_team_position ON players(team_id, position);
CREATE INDEX idx_matches_tournament_date ON matches(tournament_id, match_date);
CREATE INDEX idx_match_events_match_minute ON match_events(match_id, minute);
CREATE INDEX idx_tournament_teams_tournament_points ON tournament_teams(tournament_id, points DESC);

-- Full-text search indexes (if MySQL version supports it)
-- ALTER TABLE teams ADD FULLTEXT(name, city);
-- ALTER TABLE players ADD FULLTEXT(first_name, last_name);
-- ALTER TABLE tournaments ADD FULLTEXT(name, description);
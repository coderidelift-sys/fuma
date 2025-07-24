# 🏆 FUMA - Arsitektur Sistem Dinamis & Realtime

## 📋 ANALISIS KEBUTUHAN FITUR

### 1. **BACKEND REQUIREMENTS**

#### **Database Schema:**
```sql
-- Users & Authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    whatsapp VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'viewer') DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Teams
CREATE TABLE teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    logo_url VARCHAR(255),
    founded_year YEAR,
    stadium VARCHAR(100),
    stadium_capacity INT,
    city VARCHAR(100),
    country VARCHAR(100),
    manager_name VARCHAR(100),
    team_colors VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players
CREATE TABLE players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    jersey_number INT,
    position ENUM('goalkeeper', 'defender', 'midfielder', 'forward') NOT NULL,
    date_of_birth DATE,
    nationality VARCHAR(50),
    height DECIMAL(3,2),
    weight DECIMAL(5,2),
    preferred_foot ENUM('left', 'right', 'both'),
    photo_url VARCHAR(255),
    market_value DECIMAL(12,2),
    status ENUM('active', 'injured', 'suspended', 'transferred') DEFAULT 'active',
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    UNIQUE KEY unique_team_jersey (team_id, jersey_number)
);

-- Tournaments
CREATE TABLE tournaments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    tournament_type ENUM('league', 'knockout', 'group_knockout') NOT NULL,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    max_teams INT,
    prize_money DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament Teams (Many-to-Many)
CREATE TABLE tournament_teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT,
    team_id INT,
    group_name VARCHAR(10),
    points INT DEFAULT 0,
    matches_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    draws INT DEFAULT 0,
    losses INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tournament_team (tournament_id, team_id)
);

-- Matches
CREATE TABLE matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT,
    home_team_id INT,
    away_team_id INT,
    match_date DATETIME,
    venue VARCHAR(100),
    referee VARCHAR(100),
    status ENUM('scheduled', 'live', 'halftime', 'completed', 'postponed', 'cancelled') DEFAULT 'scheduled',
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    match_stage VARCHAR(50),
    attendance INT,
    weather_conditions VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (home_team_id) REFERENCES teams(id),
    FOREIGN KEY (away_team_id) REFERENCES teams(id)
);

-- Match Events (Goals, Cards, Substitutions)
CREATE TABLE match_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT,
    player_id INT,
    team_id INT,
    event_type ENUM('goal', 'yellow_card', 'red_card', 'substitution_in', 'substitution_out') NOT NULL,
    minute INT,
    additional_time INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Player Statistics
CREATE TABLE player_statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT,
    tournament_id INT,
    matches_played INT DEFAULT 0,
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    yellow_cards INT DEFAULT 0,
    red_cards INT DEFAULT 0,
    minutes_played INT DEFAULT 0,
    shots_on_target INT DEFAULT 0,
    passes_completed INT DEFAULT 0,
    tackles_won INT DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_player_tournament (player_id, tournament_id)
);

-- Live Match Data (for real-time updates)
CREATE TABLE live_match_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT,
    current_minute INT,
    additional_time INT DEFAULT 0,
    possession_home INT DEFAULT 50,
    possession_away INT DEFAULT 50,
    shots_home INT DEFAULT 0,
    shots_away INT DEFAULT 0,
    corners_home INT DEFAULT 0,
    corners_away INT DEFAULT 0,
    fouls_home INT DEFAULT 0,
    fouls_away INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_match (match_id)
);
```

#### **API Endpoints:**

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

**Teams:**
- `GET /api/teams` - Get all teams (with filters)
- `GET /api/teams/:id` - Get team details
- `POST /api/teams` - Create new team (admin)
- `PUT /api/teams/:id` - Update team (admin)
- `DELETE /api/teams/:id` - Delete team (admin)

**Players:**
- `GET /api/players` - Get all players (with filters)
- `GET /api/players/:id` - Get player details
- `POST /api/players` - Create new player (admin)
- `PUT /api/players/:id` - Update player (admin)
- `DELETE /api/players/:id` - Delete player (admin)

**Tournaments:**
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get tournament details
- `POST /api/tournaments` - Create tournament (admin)
- `PUT /api/tournaments/:id` - Update tournament (admin)

**Matches:**
- `GET /api/matches` - Get all matches (with filters)
- `GET /api/matches/:id` - Get match details
- `POST /api/matches` - Create match (admin)
- `PUT /api/matches/:id` - Update match (admin)
- `GET /api/matches/:id/events` - Get match events
- `POST /api/matches/:id/events` - Add match event (admin)

**Live Data:**
- `GET /api/matches/:id/live` - Get live match data
- `POST /api/matches/:id/live` - Update live match data (admin)

**Statistics:**
- `GET /api/statistics/players` - Player statistics
- `GET /api/statistics/teams` - Team statistics
- `GET /api/statistics/tournaments/:id` - Tournament statistics

### 2. **FRONTEND FRAMEWORK**

#### **Technology Stack:**
- **Backend:** Node.js + Express.js
- **Database:** MySQL/PostgreSQL
- **ORM:** Prisma/Sequelize
- **Authentication:** JWT + bcrypt
- **Real-time:** Pusher/Socket.io
- **Frontend:** Vanilla JS + Bootstrap 5 (maintain current design)
- **File Upload:** Multer + Cloudinary

#### **Real-time Features dengan Pusher:**
```javascript
// Pusher Configuration
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Live Match Events
pusher.trigger('match-' + matchId, 'goal', {
  player: playerName,
  team: teamName,
  minute: currentMinute,
  score: { home: homeScore, away: awayScore }
});

pusher.trigger('match-' + matchId, 'card', {
  player: playerName,
  team: teamName,
  cardType: 'yellow',
  minute: currentMinute
});

pusher.trigger('match-' + matchId, 'substitution', {
  playerOut: playerOutName,
  playerIn: playerInName,
  team: teamName,
  minute: currentMinute
});

// Live Statistics Updates
pusher.trigger('match-' + matchId, 'stats-update', {
  possession: { home: 65, away: 35 },
  shots: { home: 8, away: 3 },
  corners: { home: 4, away: 2 }
});
```

### 3. **REAL-TIME FEATURES**

#### **Live Scoring System:**
1. **Match Timeline** - Real-time events (goals, cards, substitutions)
2. **Live Statistics** - Possession, shots, corners, fouls
3. **Score Updates** - Instant score changes
4. **Match Status** - Live, halftime, full-time notifications
5. **Commentary** - Live text commentary

#### **Admin Dashboard:**
1. **Live Match Control** - Add events in real-time
2. **Score Management** - Update scores instantly
3. **Player Substitutions** - Manage lineups live
4. **Statistics Input** - Update match stats

#### **User Experience:**
1. **Live Notifications** - Browser notifications for goals
2. **Auto Refresh** - Automatic page updates
3. **Sound Alerts** - Audio notifications for events
4. **Mobile Responsive** - Real-time on all devices

### 4. **IMPLEMENTATION PHASES**

#### **Phase 1: Backend Setup (Week 1-2)**
- [ ] Database schema implementation
- [ ] User authentication system
- [ ] Basic CRUD APIs for all entities
- [ ] JWT token management
- [ ] File upload system

#### **Phase 2: Core Features (Week 3-4)**
- [ ] Teams management
- [ ] Players management
- [ ] Tournaments system
- [ ] Match scheduling
- [ ] Basic statistics

#### **Phase 3: Real-time Integration (Week 5-6)**
- [ ] Pusher integration
- [ ] Live match events
- [ ] Real-time score updates
- [ ] Live statistics
- [ ] Admin control panel

#### **Phase 4: Advanced Features (Week 7-8)**
- [ ] Advanced filtering and search
- [ ] Player performance analytics
- [ ] Tournament standings
- [ ] Match predictions
- [ ] Mobile app considerations

### 5. **SECURITY & PERFORMANCE**

#### **Security Measures:**
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- CORS configuration

#### **Performance Optimization:**
- Database indexing
- Query optimization
- Caching with Redis
- Image optimization
- CDN for static assets
- Lazy loading
- Pagination

### 6. **DEPLOYMENT ARCHITECTURE**

```
Frontend (Vercel/Netlify)
    ↓
API Gateway/Load Balancer
    ↓
Backend Servers (Node.js)
    ↓
Database (MySQL/PostgreSQL)
    ↓
File Storage (Cloudinary)
    ↓
Real-time Service (Pusher)
```

### 7. **MONITORING & ANALYTICS**

- **Error Tracking:** Sentry
- **Performance Monitoring:** New Relic
- **Analytics:** Google Analytics
- **Uptime Monitoring:** Pingdom
- **Logging:** Winston + ELK Stack

---

## 🎯 NEXT STEPS

1. **Setup Development Environment**
2. **Initialize Backend Project**
3. **Database Migration Scripts**
4. **API Development**
5. **Frontend Integration**
6. **Pusher Real-time Implementation**
7. **Testing & Deployment**

Apakah Anda ingin saya mulai implementasi dari fase tertentu?
# 🚀 FUMA Setup & Deployment Guide

## 📋 Prerequisites

- Node.js 16+ 
- MySQL 8.0+ or PostgreSQL 13+
- Git
- Pusher account (for real-time features)
- Cloudinary account (for image uploads)

## 🛠️ Development Setup

### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your configurations
# DATABASE_URL="mysql://username:password@localhost:3306/fuma_db"
# JWT_SECRET=your-super-secret-jwt-key-here
# PUSHER_APP_ID=your-pusher-app-id
# PUSHER_KEY=your-pusher-key
# PUSHER_SECRET=your-pusher-secret
# PUSHER_CLUSTER=your-pusher-cluster
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample data (optional)
npx prisma db seed
```

### 3. Start Development Server

```bash
# Start backend server
npm run dev

# Server will run on http://localhost:3000
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies (if using a build tool)
npm install

# For development, you can use a simple HTTP server
npx http-server . -p 3001

# Or use Live Server extension in VS Code
```

## 🔧 Environment Configuration

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/fuma_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Pusher Configuration (Real-time)
PUSHER_APP_ID=1234567
PUSHER_KEY=abcdef123456
PUSHER_SECRET=abcdef123456789
PUSHER_CLUSTER=us2

# Cloudinary Configuration (File Uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Configuration

Update `frontend/js/fuma-app.js`:

```javascript
class FUMAApp {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3000/api'; // Change for production
    // ... rest of configuration
  }
  
  initPusher() {
    this.pusher = new Pusher('your-pusher-key', {
      cluster: 'your-pusher-cluster',
      encrypted: true
    });
  }
}
```

## 🗄️ Database Schema

The application uses the following main tables:

- **users** - User authentication and profiles
- **teams** - Football teams
- **players** - Player information and statistics
- **tournaments** - Tournament management
- **matches** - Match scheduling and results
- **match_events** - Real-time match events (goals, cards, etc.)
- **live_match_data** - Live statistics during matches
- **player_statistics** - Player performance data

## 📡 Real-time Features Setup

### Pusher Configuration

1. Create account at [pusher.com](https://pusher.com)
2. Create new app
3. Get your app credentials:
   - App ID
   - Key
   - Secret
   - Cluster

### Real-time Events

The system broadcasts these real-time events:

- `goal` - When a goal is scored
- `match-event` - Cards, substitutions, etc.
- `score-update` - Score changes
- `stats-update` - Live statistics updates

## 🚀 Production Deployment

### Backend Deployment (Railway/Heroku/DigitalOcean)

1. **Environment Variables**:
```bash
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
FRONTEND_URL=https://your-frontend-domain.com
```

2. **Build Commands**:
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

3. **Health Check**: `GET /health`

### Frontend Deployment (Vercel/Netlify)

1. Update API URL in `fuma-app.js`:
```javascript
this.apiBaseUrl = 'https://your-backend-domain.com/api';
```

2. Update Pusher configuration with production keys

3. Deploy static files to CDN

### Database Deployment

#### MySQL (PlanetScale/Railway)
```bash
# Connection string format
DATABASE_URL="mysql://username:password@host:port/database?sslaccept=strict"
```

#### PostgreSQL (Supabase/Railway)
```bash
# Connection string format
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

## 🔒 Security Configuration

### Production Security Checklist

- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable database SSL
- [ ] Set up monitoring and logging
- [ ] Configure CSP headers
- [ ] Use secure session cookies

### Rate Limiting

Default configuration:
- 100 requests per 15 minutes per IP
- Configurable via environment variables

## 📊 Monitoring & Analytics

### Recommended Tools

- **Error Tracking**: Sentry
- **Performance**: New Relic
- **Uptime**: Pingdom
- **Analytics**: Google Analytics
- **Logs**: ELK Stack or Papertrail

### Health Monitoring

The API provides health check endpoint:

```bash
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2023-06-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

## 🧪 Testing

### Backend Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=auth
```

### API Testing

Use tools like:
- Postman
- Insomnia
- Thunder Client (VS Code)

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run loadtest.yml
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy FUMA

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      working-directory: ./backend
      
    - name: Run tests
      run: npm test
      working-directory: ./backend
      
    - name: Deploy to Railway
      run: railway deploy
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check firewall settings

2. **Pusher Not Working**
   - Verify Pusher credentials
   - Check cluster configuration
   - Ensure HTTPS in production

3. **CORS Errors**
   - Update FRONTEND_URL in backend
   - Check allowed origins

4. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure consistent secret across instances

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development
DEBUG=fuma:*
```

### Database Reset

```bash
# Reset database (development only)
npx prisma migrate reset

# Seed with fresh data
npx prisma db seed
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Core Endpoints

- `GET /api/teams` - List teams
- `GET /api/players` - List players
- `GET /api/tournaments` - List tournaments
- `GET /api/matches` - List matches
- `GET /api/matches/:id/live` - Live match data
- `POST /api/matches/:id/events` - Add match event (admin)

### Real-time Channels

- `match-{id}` - Match-specific events
- `tournament-{id}` - Tournament updates
- `global` - System-wide notifications

## 🎯 Performance Optimization

### Backend Optimization

- Database indexing on frequently queried fields
- Query optimization with Prisma
- Redis caching for frequently accessed data
- CDN for static assets
- Gzip compression

### Frontend Optimization

- Lazy loading for large datasets
- Image optimization
- Minification and bundling
- Service worker for offline support
- Progressive Web App features

## 📱 Mobile Considerations

### Responsive Design
- Bootstrap 5 responsive utilities
- Touch-friendly interface
- Optimized for mobile screens

### PWA Features
- Service worker for offline support
- Web app manifest
- Push notifications
- App-like experience

## 🔮 Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Player performance metrics
   - Team comparison tools
   - Predictive analytics

2. **Mobile App**
   - React Native app
   - Real-time notifications
   - Offline support

3. **Video Integration**
   - Match highlights
   - Live streaming
   - Video analysis

4. **Social Features**
   - User comments
   - Match predictions
   - Social sharing

5. **Advanced Admin Panel**
   - Match management dashboard
   - Real-time statistics input
   - User management

---

## 🆘 Support

For technical support or questions:

1. Check this documentation
2. Review API documentation
3. Check GitHub issues
4. Contact development team

---

**Happy Coding! ⚽🚀**
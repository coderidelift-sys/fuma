# ⚽ FUMA - Football Tournament Management System

<div align="center">

![FUMA Logo](https://img.shields.io/badge/FUMA-Football%20Management-blue?style=for-the-badge&logo=football)

**A comprehensive real-time football tournament management system with live scoring, player statistics, and team management.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue?style=flat-square&logo=mysql)](https://mysql.com/)
[![Pusher](https://img.shields.io/badge/Pusher-Real--time-orange?style=flat-square&logo=pusher)](https://pusher.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

## 🌟 Features

### 🔥 Real-time Features
- **Live Match Scoring** - Real-time goal updates and match events
- **Live Statistics** - Possession, shots, corners, fouls updated in real-time
- **Instant Notifications** - Browser notifications for goals and major events
- **Live Commentary** - Real-time match commentary and updates

### 📊 Management Features
- **Tournament Management** - Create and manage multiple tournaments
- **Team Management** - Complete team profiles with players and statistics
- **Player Profiles** - Detailed player information and performance stats
- **Match Scheduling** - Schedule matches with venues and referees
- **Statistics Tracking** - Comprehensive player and team statistics

### 🔐 User Management
- **Role-based Access** - Admin, Manager, and Viewer roles
- **Secure Authentication** - JWT-based authentication system
- **User Profiles** - Personalized user accounts and preferences

### 📱 Modern Interface
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Real-time Updates** - No page refresh needed for live data
- **Interactive UI** - Modern, intuitive user interface
- **Progressive Web App** - App-like experience with offline support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MySQL 8.0+ or PostgreSQL 13+
- Pusher account (for real-time features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fuma.git
cd fuma
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup Database**
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Setup Frontend**
```bash
cd ../frontend
# Update API URL in js/fuma-app.js
# Serve static files (use Live Server or http-server)
```

### Demo Accounts
- **Admin**: admin@fuma.com / admin123
- **Manager**: manager@fuma.com / demo123  
- **Viewer**: viewer@fuma.com / demo123

## 📖 Documentation

- [📋 Setup Guide](SETUP_GUIDE.md) - Complete setup and deployment guide
- [🏗️ Architecture Plan](ARCHITECTURE_PLAN.md) - System architecture and design
- [🔧 API Documentation](docs/API.md) - Complete API reference
- [🎨 UI Components](docs/COMPONENTS.md) - Frontend component documentation

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **MySQL/PostgreSQL** - Database
- **JWT** - Authentication
- **Pusher** - Real-time communication
- **Cloudinary** - Image storage

### Frontend
- **Vanilla JavaScript** - Core functionality
- **Bootstrap 5** - UI framework
- **Pusher JS** - Real-time client
- **Font Awesome** - Icons
- **Animate.css** - Animations

### DevOps & Deployment
- **Railway/Heroku** - Backend hosting
- **Vercel/Netlify** - Frontend hosting
- **GitHub Actions** - CI/CD pipeline
- **Sentry** - Error monitoring

## 📱 Screenshots

<div align="center">

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Live Match
![Live Match](docs/images/live-match.png)

### Team Management
![Team Management](docs/images/team-management.png)

### Player Statistics
![Player Statistics](docs/images/player-stats.png)

</div>

## 🔄 Real-time Architecture

```mermaid
graph TB
    A[Frontend Client] -->|WebSocket| B[Pusher Service]
    C[Backend API] -->|Trigger Events| B
    B -->|Real-time Updates| A
    C -->|CRUD Operations| D[Database]
    E[Admin Panel] -->|Match Events| C
    C -->|Live Data| F[Match Statistics]
```

## 🎯 API Endpoints

### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
```

### Core Resources
```
GET    /api/teams          # List teams
GET    /api/players        # List players  
GET    /api/tournaments    # List tournaments
GET    /api/matches        # List matches
```

### Real-time Features
```
GET    /api/matches/:id/live    # Live match data
POST   /api/matches/:id/events  # Add match event
WebSocket: match-{id}           # Real-time updates
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="mysql://user:pass@localhost:3306/fuma_db"

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Pusher (Real-time)
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# API testing with coverage
npm run test:coverage

# Load testing
npm run test:load
```

## 🚀 Deployment

### Backend (Railway/Heroku)
```bash
# Set environment variables
railway variables set DATABASE_URL=your-db-url
railway variables set JWT_SECRET=your-secret

# Deploy
railway deploy
```

### Frontend (Vercel/Netlify)
```bash
# Update API URL in fuma-app.js
# Deploy static files
vercel --prod
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bootstrap](https://getbootstrap.com/) for the UI framework
- [Pusher](https://pusher.com/) for real-time functionality
- [Prisma](https://prisma.io/) for the database ORM
- [Font Awesome](https://fontawesome.com/) for icons

## 📞 Support

- 📧 Email: support@fuma.com
- 💬 Discord: [FUMA Community](https://discord.gg/fuma)
- 📖 Documentation: [docs.fuma.com](https://docs.fuma.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/fuma/issues)

## 🗺️ Roadmap

### Version 2.0
- [ ] Mobile app (React Native)
- [ ] Video highlights integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social features (comments, predictions)

### Version 2.1
- [ ] Live streaming integration
- [ ] AI-powered match predictions
- [ ] Advanced player performance metrics
- [ ] Tournament bracket visualization
- [ ] Export functionality (PDF reports)

---

<div align="center">

**Made with ❤️ for football fans worldwide**

[⭐ Star this repo](https://github.com/yourusername/fuma) | [🐛 Report Bug](https://github.com/yourusername/fuma/issues) | [💡 Request Feature](https://github.com/yourusername/fuma/issues)

</div>
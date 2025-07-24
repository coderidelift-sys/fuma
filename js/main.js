/**
 * Main Frontend Application
 * Handles homepage functionality and API integration
 */

class FumaApp {
    constructor() {
        this.stats = {
            totalTeams: 0,
            totalPlayers: 0,
            activeTournaments: 0,
            totalMatches: 0
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.updateAuthUI();
    }

    setupEventListeners() {
        // Navigation handling
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    this.scrollToSection(targetId);
                }
            });
        });

        // Login button handling
        const loginBtn = document.querySelector('a[href="login.html"]');
        if (loginBtn && apiClient.isAuthenticated()) {
            this.updateLoginButton(loginBtn);
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });
    }

    async loadInitialData() {
        try {
            // Load public statistics
            await this.loadPublicStats();
            
            // Load featured content
            await Promise.all([
                this.loadFeaturedTournaments(),
                this.loadTopTeams(),
                this.loadUpcomingMatches(),
                this.loadTopPlayers()
            ]);

        } catch (error) {
            console.error('Error loading initial data:', error);
            // Continue with default content if API fails
        }
    }

    async loadPublicStats() {
        try {
            const response = await apiClient.get('/statistics/public');
            
            if (response.success) {
                this.stats = response.data;
                this.updateStatsDisplay();
            }
        } catch (error) {
            console.error('Error loading public stats:', error);
            // Use default stats if API fails
            this.updateStatsDisplay();
        }
    }

    updateStatsDisplay() {
        // Update stats cards with animation
        const statsElements = {
            tournaments: document.querySelector('.stats-card:nth-child(1) .stats-number'),
            teams: document.querySelector('.stats-card:nth-child(2) .stats-number'),
            players: document.querySelector('.stats-card:nth-child(3) .stats-number'),
            matches: document.querySelector('.stats-card:nth-child(4) .stats-number')
        };

        // Animate numbers
        if (statsElements.tournaments) {
            this.animateNumber(statsElements.tournaments, this.stats.activeTournaments || 15);
        }
        if (statsElements.teams) {
            this.animateNumber(statsElements.teams, this.stats.totalTeams || 120);
        }
        if (statsElements.players) {
            this.animateNumber(statsElements.players, this.stats.totalPlayers || 2500);
        }
        if (statsElements.matches) {
            this.animateNumber(statsElements.matches, this.stats.totalMatches || 380);
        }
    }

    animateNumber(element, targetValue) {
        const startValue = 0;
        const duration = 2000; // 2 seconds
        const increment = targetValue / (duration / 16); // 60 FPS
        let currentValue = startValue;

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(currentValue).toLocaleString();
        }, 16);
    }

    async loadFeaturedTournaments() {
        try {
            const response = await apiClient.getTournaments({ 
                status: 'ONGOING,UPCOMING', 
                limit: 3 
            });

            if (response.success && response.data.tournaments.length > 0) {
                this.renderFeaturedTournaments(response.data.tournaments);
            }
        } catch (error) {
            console.error('Error loading featured tournaments:', error);
        }
    }

    renderFeaturedTournaments(tournaments) {
        const container = document.querySelector('#tournaments .row');
        if (!container) return;

        const tournamentCards = tournaments.map(tournament => `
            <div class="col-lg-4 col-md-6">
                <div class="card h-100 border-0 shadow-sm animate__animated animate__fadeInUp">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-${this.getStatusColor(tournament.status)} small">
                                ${FumaUtils.format.tournamentStatus(tournament.status)}
                            </span>
                            <span class="text-muted small">
                                <i class="far fa-calendar-alt me-1"></i>
                                ${FumaUtils.date.format(tournament.startDate, 'MMM DD')}
                            </span>
                        </div>
                        <h5 class="card-title mb-2">${tournament.name}</h5>
                        <p class="card-text small text-muted mb-3">
                            ${tournament.description || 'Tournament description not available.'}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">
                                <i class="far fa-users me-1"></i>
                                ${tournament._count?.tournamentTeams || 0} Teams
                            </span>
                            <a href="tournament-detail.html?id=${tournament.id}" class="btn btn-sm btn-outline-primary">
                                View
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = tournamentCards;
    }

    async loadTopTeams() {
        try {
            const response = await apiClient.getTeams({ 
                status: 'ACTIVE', 
                sortBy: 'playerCount',
                limit: 4 
            });

            if (response.success && response.data.teams.length > 0) {
                this.renderTopTeams(response.data.teams);
            }
        } catch (error) {
            console.error('Error loading top teams:', error);
        }
    }

    renderTopTeams(teams) {
        const container = document.querySelector('#teams .row');
        if (!container) return;

        const teamCards = teams.map(team => `
            <div class="col-xl-3 col-lg-4 col-md-6">
                <div class="card team-card h-100">
                    <div class="card-body p-3 text-center">
                        <img src="${team.logoUrl || '/images/default-team-logo.png'}" 
                             alt="${team.name}" 
                             class="team-logo-sm mb-2"
                             onerror="this.src='/images/default-team-logo.png'">
                        <h6 class="card-title mb-1">${team.name}</h6>
                        <div class="d-flex justify-content-center small mb-2">
                            <span class="text-muted me-2">
                                <i class="fas fa-trophy text-warning me-1"></i>
                                ${team._count?.tournamentTeams || 0}
                            </span>
                            <span class="text-muted">
                                <i class="fas fa-map-marker-alt me-1"></i>
                                ${team.city || 'Unknown'}
                            </span>
                        </div>
                        <div class="d-flex justify-content-center small mb-2">
                            <span class="badge bg-light text-dark me-1">
                                <i class="fas fa-user me-1"></i>
                                ${team._count?.players || 0}
                            </span>
                            <span class="badge bg-light text-dark">
                                <i class="fas fa-star text-warning me-1"></i>
                                ${(Math.random() * 2 + 3).toFixed(1)}
                            </span>
                        </div>
                        <a href="team-detail.html?id=${team.id}" class="btn btn-sm btn-outline-primary w-100">
                            View Team
                        </a>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = teamCards;
    }

    async loadUpcomingMatches() {
        try {
            const response = await apiClient.getMatches({ 
                status: 'SCHEDULED', 
                limit: 4,
                sortBy: 'matchDate'
            });

            if (response.success && response.data.matches.length > 0) {
                this.renderUpcomingMatches(response.data.matches);
            }
        } catch (error) {
            console.error('Error loading upcoming matches:', error);
        }
    }

    renderUpcomingMatches(matches) {
        const container = document.querySelector('#matches .row');
        if (!container) return;

        const matchCards = matches.slice(0, 2).map(match => `
            <div class="col-md-6">
                <div class="card match-card h-100">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary">${match.matchStage || 'Match'}</span>
                            <small class="text-muted">
                                <i class="fas fa-calendar-alt me-1"></i>
                                ${FumaUtils.date.format(match.matchDate, 'DD/MM HH:mm')}
                            </small>
                        </div>
                        
                        <div class="d-flex align-items-center mb-2">
                            <div class="d-flex align-items-center flex-grow-1">
                                <img src="${match.homeTeam.logoUrl || '/images/default-team-logo.png'}" 
                                     alt="${match.homeTeam.name}" 
                                     class="team-logo-sm me-2">
                                <span class="text-truncate">${match.homeTeam.shortName}</span>
                            </div>
                            
                            <div class="px-2 text-center flex-shrink-0">
                                <div class="vs-badge bg-light rounded-pill px-2 py-0 d-inline-block">
                                    <small class="fw-bold">VS</small>
                                </div>
                            </div>
                            
                            <div class="d-flex align-items-center flex-grow-1 justify-content-end">
                                <span class="text-truncate text-end">${match.awayTeam.shortName}</span>
                                <img src="${match.awayTeam.logoUrl || '/images/default-team-logo.png'}" 
                                     alt="${match.awayTeam.name}" 
                                     class="team-logo-sm ms-2">
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-dark small">
                                <i class="fas fa-map-marker-alt me-1"></i>
                                ${match.venue || 'TBD'}
                            </span>
                            <div>
                                <a href="match-detail.html?id=${match.id}" class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-eye"></i>
                                </a>
                                ${apiClient.isAuthenticated() ? `
                                    <button class="btn btn-sm btn-accent ms-1" onclick="fumaApp.subscribeToMatch(${match.id})">
                                        <i class="fas fa-bell"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = matchCards;
    }

    async loadTopPlayers() {
        try {
            const response = await apiClient.getPlayers({ 
                status: 'ACTIVE', 
                limit: 8,
                sortBy: 'goals' // Assuming we have player stats
            });

            if (response.success && response.data.players.length > 0) {
                this.renderTopPlayers(response.data.players);
            }
        } catch (error) {
            console.error('Error loading top players:', error);
        }
    }

    renderTopPlayers(players) {
        // This would render a top players section if we had one
        // For now, we'll just log the data
        console.log('Top players loaded:', players.length);
    }

    updateAuthUI() {
        const loginLink = document.querySelector('a[href="login.html"]');
        
        if (apiClient.isAuthenticated() && loginLink) {
            // Update login link to show user info
            loginLink.innerHTML = `
                <i class="fas fa-user-circle me-1"></i>
                ${apiClient.user.name}
            `;
            loginLink.href = '#';
            
            // Add dropdown menu
            this.createUserDropdown(loginLink);
        }
    }

    createUserDropdown(loginLink) {
        const dropdownHTML = `
            <div class="dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user-circle me-1"></i>
                    ${apiClient.user.name}
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" onclick="fumaApp.goToDashboard()">
                        <i class="fas fa-tachometer-alt me-2"></i> Dashboard
                    </a></li>
                    <li><a class="dropdown-item" href="#" onclick="fumaApp.showProfile()">
                        <i class="fas fa-user me-2"></i> Profile
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()">
                        <i class="fas fa-sign-out-alt me-2"></i> Logout
                    </a></li>
                </ul>
            </div>
        `;
        
        loginLink.parentElement.innerHTML = dropdownHTML;
    }

    goToDashboard() {
        if (apiClient.isAdmin()) {
            window.location.href = '/admin-dashboard.html';
        } else if (apiClient.isManager()) {
            window.location.href = '/manager-dashboard.html';
        } else {
            window.location.href = '/user-dashboard.html';
        }
    }

    showProfile() {
        // Show user profile modal
        FumaUtils.ui.showToast('Profile feature coming soon', 'info');
    }

    subscribeToMatch(matchId) {
        // Subscribe to match notifications
        FumaUtils.ui.showToast('Match notification subscription coming soon', 'info');
    }

    scrollToSection(targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    getStatusColor(status) {
        const colors = {
            'UPCOMING': 'warning',
            'ONGOING': 'info',
            'COMPLETED': 'success',
            'CANCELLED': 'danger'
        };
        return colors[status] || 'secondary';
    }

    // Public methods for global access
    static async refreshData() {
        if (window.fumaApp) {
            await window.fumaApp.loadInitialData();
            FumaUtils.ui.showToast('Data refreshed', 'success');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fumaApp = new FumaApp();
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    }, observerOptions);

    // Observe cards and sections
    document.querySelectorAll('.card, .stats-card').forEach(el => {
        observer.observe(el);
    });

    // Add navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
});

// Add CSS for navbar scroll effect
const style = document.createElement('style');
style.textContent = `
    .navbar-scrolled {
        background-color: rgba(13, 110, 253, 0.95) !important;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .team-logo-sm {
        width: 30px;
        height: 30px;
        object-fit: contain;
    }
    
    .vs-badge {
        min-width: 40px;
    }
    
    .text-truncate {
        max-width: 100px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .slide-up {
        animation: slideUp 0.6s ease-out;
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
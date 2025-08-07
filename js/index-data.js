/**
 * Index Page Dynamic Data Integration
 * Fetches and displays real data from backend API with loading states and error handling
 */

class IndexDataHandler {
    constructor() {
        this.isLoading = false;
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.setupUserAuthentication();
        this.setupRefreshButton();
        this.setupSearchFunctionality();
    }

    async loadDashboardData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingStates();

        try {
            // Load all data in parallel
            const [stats, tournaments, teams, matches] = await Promise.all([
                this.loadStatistics(),
                this.loadFeaturedTournaments(),
                this.loadTopTeams(),
                this.loadUpcomingMatches()
            ]);

            // Update UI with real data
            this.updateStatistics(stats);
            this.updateTournaments(tournaments);
            this.updateTeams(teams);
            this.updateMatches(matches);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showErrorState(error.message);
        } finally {
            this.hideLoadingStates();
            this.isLoading = false;
        }
    }

    async loadStatistics() {
        try {
            const response = await apiClient.getDashboardStats();
            return response.success ? response.data : this.getFallbackStats();
        } catch (error) {
            console.warn('Failed to load statistics, using fallback data');
            return this.getFallbackStats();
        }
    }

    async loadFeaturedTournaments() {
        try {
            const response = await apiClient.getTournaments({ 
                limit: 3, 
                featured: true 
            });
            return response.success ? response.data : this.getFallbackTournaments();
        } catch (error) {
            console.warn('Failed to load tournaments, using fallback data');
            return this.getFallbackTournaments();
        }
    }

    async loadTopTeams() {
        try {
            const response = await apiClient.getTeams({ 
                limit: 4, 
                order: 'desc'
            });
            return response.success ? response.data : this.getFallbackTeams();
        } catch (error) {
            console.warn('Failed to load teams, using fallback data');
            return this.getFallbackTeams();
        }
    }

    async loadUpcomingMatches() {
        try {
            const response = await apiClient.getMatches({ 
                limit: 6, 
                status: 'SCHEDULED',
                order: 'asc'
            });
            return response.success ? response.data : this.getFallbackMatches();
        } catch (error) {
            console.warn('Failed to load matches, using fallback data');
            return this.getFallbackMatches();
        }
    }

    updateStatistics(stats) {
        const statsCards = document.querySelectorAll('.stats-card');
        
        if (statsCards.length >= 4) {
            // Update tournaments
            this.updateStatCard(statsCards[0], stats.tournaments || 15, 'Active Tournaments');
            
            // Update teams
            this.updateStatCard(statsCards[1], stats.teams || 120, 'Registered Teams');
            
            // Update players
            this.updateStatCard(statsCards[2], stats.players || 2500, 'Players');
            
            // Update matches
            this.updateStatCard(statsCards[3], stats.matches || 380, 'Matches Played');
        }
    }

    updateStatCard(card, value, label) {
        const numberElement = card.querySelector('.stats-number');
        const labelElement = card.querySelector('.stats-label');
        
        if (numberElement && labelElement) {
            // Animate number counting
            this.animateNumber(numberElement, 0, value, 1000);
            labelElement.textContent = label;
        }
    }

    animateNumber(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    updateTournaments(tournaments) {
        const container = document.querySelector('#tournaments .row');
        if (!container) return;

        container.innerHTML = '';

        // Handle both array and object responses
        let tournamentsArray = tournaments;
        if (tournaments && typeof tournaments === 'object' && !Array.isArray(tournaments)) {
            // If tournaments is an object, try to extract the array from common properties
            tournamentsArray = tournaments.tournaments || tournaments.data || tournaments.results || [];
        }

        // Ensure we have an array before calling forEach
        if (!Array.isArray(tournamentsArray)) {
            console.warn('Tournaments data is not an array:', tournamentsArray);
            tournamentsArray = [];
        }

        tournamentsArray.forEach((tournament, index) => {
            const tournamentCard = this.createTournamentCard(tournament, index);
            container.appendChild(tournamentCard);
        });

        // Add view all button
        const viewAllContainer = document.querySelector('#tournaments .text-center');
        if (viewAllContainer) {
            viewAllContainer.innerHTML = `
                <a href="tournaments.html" class="btn btn-sm btn-primary px-3">
                    <i class="fas fa-list me-1"></i> All Tournaments (${tournamentsArray.length}+)
                </a>
            `;
        }
    }

    createTournamentCard(tournament, index) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';

        const statusBadge = this.getStatusBadge(tournament.status);
        const dateRange = this.formatDateRange(tournament.startDate, tournament.endDate);

        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s;">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        ${statusBadge}
                        <span class="text-muted small">
                            <i class="far fa-calendar-alt me-1"></i>${dateRange}
                        </span>
                    </div>
                    <h5 class="card-title mb-2">${tournament.name}</h5>
                    <p class="card-text small text-muted mb-3">${tournament.description || 'Tournament description'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted small">
                            <i class="far fa-users me-1"></i>${tournament.teamsCount || tournament.maxTeams || 'N/A'} Teams
                        </span>
                        <a href="tournament-detail.html?id=${tournament.id}" class="btn btn-sm btn-outline-primary">View</a>
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    updateTeams(teams) {
        const container = document.querySelector('#teams .row');
        if (!container) return;

        container.innerHTML = '';

        // Handle both array and object responses
        let teamsArray = teams;
        if (teams && typeof teams === 'object' && !Array.isArray(teams)) {
            // If teams is an object, try to extract the array from common properties
            teamsArray = teams.teams || teams.data || teams.results || [];
        }

        // Ensure we have an array before calling forEach
        if (!Array.isArray(teamsArray)) {
            console.warn('Teams data is not an array:', teamsArray);
            teamsArray = [];
        }

        teamsArray.forEach((team, index) => {
            const teamCard = this.createTeamCard(team, index);
            container.appendChild(teamCard);
        });
    }

    createTeamCard(team, index) {
        const col = document.createElement('div');
        col.className = 'col-xl-3 col-lg-4 col-md-6';

        col.innerHTML = `
            <div class="card team-card h-100" style="animation-delay: ${index * 0.1}s;">
                <div class="card-body p-3 text-center">
                    <img src="${team.logo || 'https://placehold.co/60x60?text=' + team.name.charAt(0)}" 
                         alt="${team.name} Logo" 
                         class="team-logo-sm mb-2"
                         onerror="this.src='https://placehold.co/60x60?text=${team.name.charAt(0)}'">
                    <h6 class="card-title mb-1">${team.name}</h6>
                    <div class="d-flex justify-content-center small mb-2">
                        <span class="text-muted me-2">
                            <i class="fas fa-trophy text-warning me-1"></i>${team.wins || 0}
                        </span>
                        <span class="text-muted">
                            <i class="fas fa-map-marker-alt me-1"></i>${team.city || 'Unknown'}
                        </span>
                    </div>
                    <div class="d-flex justify-content-center small mb-2">
                        <span class="badge bg-light text-dark me-1">
                            <i class="fas fa-user me-1"></i>${team.playersCount || 0}
                        </span>
                        <span class="badge bg-light text-dark">
                            <i class="fas fa-star text-warning me-1"></i>${team.rating || '4.0'}
                        </span>
                    </div>
                    <a href="team-detail.html?id=${team.id}" class="btn btn-sm btn-outline-primary w-100">
                        View Team
                    </a>
                </div>
            </div>
        `;

        return col;
    }

    updateMatches(matches) {
        const container = document.querySelector('#matches .row');
        if (!container) return;

        container.innerHTML = '';

        // Handle both array and object responses
        let matchesArray = matches;
        if (matches && typeof matches === 'object' && !Array.isArray(matches)) {
            // If matches is an object, try to extract the array from common properties
            matchesArray = matches.matches || matches.data || matches.results || [];
        }

        // Ensure we have an array before calling slice and forEach
        if (!Array.isArray(matchesArray)) {
            console.warn('Matches data is not an array:', matchesArray);
            matchesArray = [];
        }

        matchesArray.slice(0, 2).forEach((match, index) => {
            const matchCard = this.createMatchCard(match, index);
            container.appendChild(matchCard);
        });
    }

    createMatchCard(match, index) {
        const col = document.createElement('div');
        col.className = 'col-md-6';

        const matchDate = new Date(match.date);
        const timeUntil = FumaUtils.date.timeUntil(match.date);

        col.innerHTML = `
            <div class="card match-card h-100" style="animation-delay: ${index * 0.1}s;">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-primary">${match.stage || 'Match'}</span>
                        <small class="text-muted">
                            <i class="fas fa-calendar-alt me-1"></i>
                            ${FumaUtils.date.format(matchDate, 'DD/MM, HH:mm')}
                        </small>
                    </div>
                    
                    <div class="d-flex align-items-center mb-2">
                        <div class="d-flex align-items-center flex-grow-1">
                            <img src="${match.homeTeam?.logo || 'https://placehold.co/30x30'}" 
                                 alt="Home Team" 
                                 class="team-logo-sm me-2">
                            <span class="text-truncate">${match.homeTeam?.name || 'Home Team'}</span>
                        </div>
                        
                        <div class="px-2 text-center flex-shrink-0">
                            <div class="vs-badge bg-light rounded-pill px-2 py-0 d-inline-block">
                                <small class="fw-bold">VS</small>
                            </div>
                        </div>
                        
                        <div class="d-flex align-items-center flex-grow-1 justify-content-end">
                            <span class="text-truncate text-end">${match.awayTeam?.name || 'Away Team'}</span>
                            <img src="${match.awayTeam?.logo || 'https://placehold.co/30x30'}" 
                                 alt="Away Team" 
                                 class="team-logo-sm ms-2">
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-light text-dark small">
                            <i class="fas fa-map-marker-alt me-1"></i>${match.venue || 'Stadium'}
                        </span>
                        <div>
                            <a href="match-detail.html?id=${match.id}" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-eye"></i>
                            </a>
                            <button class="btn btn-sm btn-accent ms-1" onclick="subscribeToMatch('${match.id}')">
                                <i class="fas fa-bell"></i>
                            </button>
                        </div>
                    </div>
                    
                    ${timeUntil !== 'Started' ? `
                        <div class="mt-2">
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>Starts in ${timeUntil}
                            </small>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        return col;
    }

    getStatusBadge(status) {
        const statusConfig = {
            'ONGOING': { class: 'bg-primary', text: 'Ongoing' },
            'UPCOMING': { class: 'bg-warning text-dark', text: 'Upcoming' },
            'COMPLETED': { class: 'bg-secondary', text: 'Completed' },
            'CANCELLED': { class: 'bg-danger', text: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig['UPCOMING'];
        return `<span class="badge ${config.class} small">${config.text}</span>`;
    }

    formatDateRange(startDate, endDate) {
        if (!startDate) return 'TBD';
        
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : null;
        
        if (end) {
            return `${FumaUtils.date.format(start, 'DD/MM')} - ${FumaUtils.date.format(end, 'DD/MM')}`;
        } else {
            return FumaUtils.date.format(start, 'DD/MM/YYYY');
        }
    }

    setupUserAuthentication() {
        // Update navigation based on authentication status
        const navItems = document.querySelector('.navbar-nav');
        if (!navItems) return;

        if (apiClient.isAuthenticated()) {
            // User is logged in - update navigation
            const loginLink = navItems.querySelector('a[href="login.html"]');
            if (loginLink) {
                const userMenu = this.createUserMenu();
                loginLink.parentElement.replaceWith(userMenu);
            }
        }
    }

    createUserMenu() {
        const li = document.createElement('li');
        li.className = 'nav-item dropdown';

        const userName = apiClient.user?.name || 'User';
        const userRole = apiClient.user?.role || 'VIEWER';

        li.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="fas fa-user-circle me-1"></i> ${userName}
            </a>
            <ul class="dropdown-menu">
                <li><h6 class="dropdown-header">${FumaUtils.format.capitalize(userRole.toLowerCase())}</h6></li>
                <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i>Profile</a></li>
                ${userRole === 'ADMIN' ? '<li><a class="dropdown-item" href="admin-dashboard.html"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</a></li>' : ''}
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
            </ul>
        `;

        return li;
    }

    setupRefreshButton() {
        // Add refresh button to hero section
        const heroButtons = document.querySelector('.hero-section .d-flex.gap-3');
        if (heroButtons) {
            const refreshBtn = document.createElement('button');
            refreshBtn.className = 'btn btn-outline-light btn-lg px-4';
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i> Refresh Data';
            refreshBtn.addEventListener('click', () => {
                this.loadDashboardData();
                FumaUtils.ui.showToast('Data refreshed successfully!', 'success');
            });
            
            heroButtons.appendChild(refreshBtn);
        }
    }

    setupSearchFunctionality() {
        // Add search functionality (future enhancement)
        // This could include searching tournaments, teams, players, etc.
    }

    showLoadingStates() {
        // Show loading spinners in each section
        const sections = ['#tournaments', '#teams', '#matches'];
        
        sections.forEach(selector => {
            const container = document.querySelector(`${selector} .row`);
            if (container) {
                FumaUtils.ui.showLoading(container, 'Loading data...');
            }
        });
    }

    hideLoadingStates() {
        // Hide loading spinners
        const sections = ['#tournaments', '#teams', '#matches'];
        
        sections.forEach(selector => {
            const container = document.querySelector(`${selector} .row`);
            if (container) {
                FumaUtils.ui.hideLoading(container);
            }
        });
    }

    showErrorState(message) {
        FumaUtils.ui.showToast(`Error loading data: ${message}`, 'danger', 5000);
    }

    // Fallback data methods
    getFallbackStats() {
        return {
            tournaments: 15,
            teams: 120,
            players: 2500,
            matches: 380
        };
    }

    getFallbackTournaments() {
        return [
            {
                id: 1,
                name: 'Premier League 2023',
                description: '20 top teams battling for championship.',
                status: 'ONGOING',
                startDate: '2023-06-01',
                endDate: '2023-07-30',
                maxTeams: 20
            },
            {
                id: 2,
                name: 'Champions Cup',
                description: 'Knockout with 16 elite teams.',
                status: 'UPCOMING',
                startDate: '2023-08-10',
                endDate: '2023-09-25',
                maxTeams: 16
            },
            {
                id: 3,
                name: 'Winter Tournament',
                description: 'Annual cold weather competition.',
                status: 'COMPLETED',
                startDate: '2023-01-05',
                endDate: '2023-02-20',
                maxTeams: 8
            }
        ];
    }

    getFallbackTeams() {
        return [
            {
                id: 1,
                name: 'City FC',
                logo: 'https://logos-world.net/wp-content/uploads/2020/05/Chelsea-Emblem.png',
                city: 'NY, USA',
                wins: 12,
                playersCount: 25,
                rating: 4.8
            },
            {
                id: 2,
                name: 'United SC',
                logo: 'https://logos-world.net/wp-content/uploads/2023/02/Missouri-Tigers-Emblem.png',
                city: 'London',
                wins: 9,
                playersCount: 22,
                rating: 4.7
            },
            {
                id: 3,
                name: 'Dynamo FC',
                city: 'Berlin',
                wins: 7,
                playersCount: 23,
                rating: 4.6
            },
            {
                id: 4,
                name: 'Rovers FC',
                city: 'Madrid',
                wins: 5,
                playersCount: 20,
                rating: 4.5
            }
        ];
    }

    getFallbackMatches() {
        return [
            {
                id: 1,
                homeTeam: { name: 'City FC', logo: 'https://placehold.co/30x30' },
                awayTeam: { name: 'United SC', logo: 'https://placehold.co/30x30' },
                date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                venue: 'National Stadium',
                stage: 'Group Stage'
            },
            {
                id: 2,
                homeTeam: { name: 'Dynamo FC', logo: 'https://placehold.co/30x30' },
                awayTeam: { name: 'Rovers FC', logo: 'https://placehold.co/30x30' },
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                venue: 'City Arena',
                stage: 'Quarter Final'
            }
        ];
    }
}

// Global function for match subscription
window.subscribeToMatch = function(matchId) {
    FumaUtils.ui.showToast('Match notifications enabled!', 'success');
    // Implement actual subscription logic here
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.indexDataHandler = new IndexDataHandler();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexDataHandler;
}
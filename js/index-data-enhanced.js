/**
 * Enhanced Index Page Data Handler - Optimized version
 * Manages dashboard data with improved error handling, caching, and performance
 */

class EnhancedIndexDataHandler {
    constructor() {
        this.isLoading = false;
        this.cache = new Map();
        this.cacheExpiry = 3 * 60 * 1000; // 3 minutes for dashboard data
        this.retryAttempts = 3;
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.setupUserAuthentication();
        this.setupEventListeners();
        this.setupAutoRefresh();
        this.setupErrorRecovery();
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleGlobalSearch(e.target.value);
                }, 300);
            });
        }

        // Quick action buttons
        this.setupQuickActions();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.refreshDashboard();
                        break;
                    case 'k':
                        e.preventDefault();
                        const searchInput = document.getElementById('globalSearch');
                        searchInput?.focus();
                        break;
                }
            }
        });

        // Handle auth state changes
        window.addEventListener('authStateChange', (event) => {
            this.handleAuthStateChange(event.detail);
        });
    }

    setupQuickActions() {
        // Add tournament quick action
        const addTournamentBtn = document.getElementById('quickAddTournament');
        if (addTournamentBtn) {
            addTournamentBtn.addEventListener('click', () => {
                this.showQuickAddModal('tournament');
            });
        }

        // View all links
        document.querySelectorAll('[data-quick-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.dataset.quickNav;
                this.navigateToPage(target);
            });
        });
    }

    setupAutoRefresh() {
        // Auto-refresh every 2 minutes if page is visible
        this.refreshInterval = setInterval(() => {
            if (!document.hidden && !this.isLoading) {
                this.loadDashboardData(true); // Silent refresh
            }
        }, 120000);

        // Refresh when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.shouldRefreshData()) {
                this.loadDashboardData(true);
            }
        });
    }

    setupErrorRecovery() {
        // Retry failed requests when connection is restored
        window.addEventListener('online', () => {
            if (this.hasFailedRequests()) {
                FumaUtils.ui.showToast('Connection restored. Refreshing data...', 'info');
                this.loadDashboardData();
            }
        });

        window.addEventListener('offline', () => {
            FumaUtils.ui.showToast('Connection lost. Using cached data.', 'warning');
        });
    }

    shouldRefreshData() {
        const lastRefresh = localStorage.getItem('fuma_last_dashboard_refresh');
        if (!lastRefresh) return true;
        
        const timeDiff = Date.now() - parseInt(lastRefresh);
        return timeDiff > this.cacheExpiry;
    }

    hasFailedRequests() {
        return localStorage.getItem('fuma_has_failed_requests') === 'true';
    }

    markFailedRequest() {
        localStorage.setItem('fuma_has_failed_requests', 'true');
    }

    clearFailedRequests() {
        localStorage.removeItem('fuma_has_failed_requests');
    }

    async loadDashboardData(silent = false) {
        if (this.isLoading && !silent) return;
        
        try {
            this.isLoading = true;
            if (!silent) {
                this.showLoadingStates();
                this.updateLastRefreshTime();
            }

            // Check cache first
            const cachedData = this.getCachedDashboardData();
            if (cachedData && !silent) {
                this.updateDashboardWithData(cachedData);
                // Still load fresh data in background
                this.loadFreshData(true);
                return;
            }

            // Load fresh data
            await this.loadFreshData(silent);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.handleDashboardError(error, silent);
        } finally {
            this.isLoading = false;
            if (!silent) this.hideLoadingStates();
        }
    }

    async loadFreshData(silent = false) {
        // Load all data in parallel with individual error handling
        const dataPromises = [
            this.loadStatistics().catch(e => ({ error: e, type: 'statistics' })),
            this.loadFeaturedTournaments().catch(e => ({ error: e, type: 'tournaments' })),
            this.loadTopTeams().catch(e => ({ error: e, type: 'teams' })),
            this.loadUpcomingMatches().catch(e => ({ error: e, type: 'matches' })),
            this.loadRecentActivity().catch(e => ({ error: e, type: 'activity' }))
        ];

        const results = await Promise.all(dataPromises);
        
        // Process results and handle partial failures
        const dashboardData = {
            statistics: null,
            tournaments: null,
            teams: null,
            matches: null,
            activity: null,
            errors: []
        };

        results.forEach((result, index) => {
            const types = ['statistics', 'tournaments', 'teams', 'matches', 'activity'];
            const type = types[index];
            
            if (result.error) {
                dashboardData.errors.push({ type, error: result.error });
                dashboardData[type] = this.getFallbackData(type);
            } else {
                dashboardData[type] = result;
            }
        });

        // Cache successful data
        this.cacheDashboardData(dashboardData);
        
        // Update UI
        this.updateDashboardWithData(dashboardData);
        
        // Handle errors
        if (dashboardData.errors.length > 0 && !silent) {
            this.handlePartialErrors(dashboardData.errors);
        } else {
            this.clearFailedRequests();
        }

        localStorage.setItem('fuma_last_dashboard_refresh', Date.now().toString());
    }

    updateDashboardWithData(data) {
        // Update each section with error handling
        try {
            if (data.statistics) this.updateStatistics(data.statistics);
        } catch (e) { console.error('Error updating statistics:', e); }
        
        try {
            if (data.tournaments) this.updateTournaments(data.tournaments);
        } catch (e) { console.error('Error updating tournaments:', e); }
        
        try {
            if (data.teams) this.updateTeams(data.teams);
        } catch (e) { console.error('Error updating teams:', e); }
        
        try {
            if (data.matches) this.updateMatches(data.matches);
        } catch (e) { console.error('Error updating matches:', e); }
        
        try {
            if (data.activity) this.updateRecentActivity(data.activity);
        } catch (e) { console.error('Error updating activity:', e); }
    }

    async loadStatistics() {
        try {
            const response = await window.apiClient.getDashboardStats();
            return response.success ? response.data : this.getFallbackStats();
        } catch (error) {
            console.warn('Failed to load statistics:', error.message);
            throw error;
        }
    }

    async loadFeaturedTournaments() {
        try {
            const response = await window.apiClient.getTournaments({ 
                limit: 3, 
                featured: true,
                status: 'ONGOING,UPCOMING'
            });
            return response.success ? response.data : this.getFallbackTournaments();
        } catch (error) {
            console.warn('Failed to load tournaments:', error.message);
            throw error;
        }
    }

    async loadTopTeams() {
        try {
            const response = await window.apiClient.getTeams({ 
                limit: 4, 
                sortBy: 'rating',
                sortOrder: 'desc'
            });
            return response.success ? response.data : this.getFallbackTeams();
        } catch (error) {
            console.warn('Failed to load teams:', error.message);
            throw error;
        }
    }

    async loadUpcomingMatches() {
        try {
            const response = await window.apiClient.getMatches({ 
                limit: 6, 
                status: 'SCHEDULED,LIVE',
                sortBy: 'date',
                sortOrder: 'asc'
            });
            return response.success ? response.data : this.getFallbackMatches();
        } catch (error) {
            console.warn('Failed to load matches:', error.message);
            throw error;
        }
    }

    async loadRecentActivity() {
        try {
            const response = await window.apiClient.get('/activity/recent', { limit: 5 });
            return response.success ? response.data : [];
        } catch (error) {
            console.warn('Failed to load recent activity:', error.message);
            throw error;
        }
    }

    // Enhanced statistics update with animations
    updateStatistics(stats) {
        const statsCards = document.querySelectorAll('.stats-card');
        
        if (statsCards.length >= 4) {
            const statsData = [
                { value: stats.tournaments || 0, label: 'Active Tournaments', icon: 'trophy', color: 'primary' },
                { value: stats.teams || 0, label: 'Registered Teams', icon: 'users', color: 'success' },
                { value: stats.players || 0, label: 'Players', icon: 'user', color: 'info' },
                { value: stats.matches || 0, label: 'Matches Played', icon: 'gamepad', color: 'warning' }
            ];

            statsData.forEach((stat, index) => {
                if (statsCards[index]) {
                    this.updateStatCard(statsCards[index], stat);
                }
            });
        }

        // Update additional stats if available
        this.updateAdditionalStats(stats);
    }

    updateStatCard(card, stat) {
        const numberElement = card.querySelector('.stats-number');
        const labelElement = card.querySelector('.stats-label');
        const iconElement = card.querySelector('.stats-icon i');
        
        if (numberElement && labelElement) {
            // Update icon and color
            if (iconElement) {
                iconElement.className = `fas fa-${stat.icon} text-${stat.color}`;
            }
            
            // Animate number counting
            this.animateNumber(numberElement, 0, stat.value, 1500);
            labelElement.textContent = stat.label;
            
            // Add pulse animation for new data
            card.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                card.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
        }
    }

    updateAdditionalStats(stats) {
        // Update growth indicators
        if (stats.growth) {
            Object.keys(stats.growth).forEach(key => {
                const element = document.getElementById(`growth-${key}`);
                if (element) {
                    const growth = stats.growth[key];
                    const isPositive = growth >= 0;
                    element.innerHTML = `
                        <i class="fas fa-arrow-${isPositive ? 'up' : 'down'} text-${isPositive ? 'success' : 'danger'}"></i>
                        ${Math.abs(growth)}%
                    `;
                }
            });
        }

        // Update revenue/prize pool info
        if (stats.totalPrizePool) {
            const element = document.getElementById('totalPrizePool');
            if (element) {
                element.textContent = this.formatCurrency(stats.totalPrizePool);
            }
        }
    }

    animateNumber(element, start, end, duration) {
        if (start === end) {
            element.textContent = end.toLocaleString();
            return;
        }

        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    // Enhanced tournaments update with better error handling
    updateTournaments(tournaments) {
        const container = document.querySelector('#tournaments .row');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Ensure we have an array
        const tournamentsArray = this.ensureArray(tournaments, 'tournaments');

        if (tournamentsArray.length === 0) {
            this.renderEmptyState(container, 'tournaments');
            return;
        }

        // Create tournament cards with staggered animation
        tournamentsArray.forEach((tournament, index) => {
            const tournamentCard = this.createTournamentCard(tournament, index);
            container.appendChild(tournamentCard);
        });

        // Update view all button
        this.updateViewAllButton('tournaments', tournamentsArray.length);
    }

    createTournamentCard(tournament, index) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4';
        col.style.animationDelay = `${index * 0.1}s`;

        // Transform tournament data
        const transformedTournament = this.transformTournamentData(tournament);
        const statusBadge = this.getStatusBadge(transformedTournament.status);
        const dateRange = this.formatDateRange(transformedTournament.startDate, transformedTournament.endDate);
        const progress = this.calculateProgress(transformedTournament);

        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm tournament-card animate__animated animate__fadeInUp">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        ${statusBadge}
                        <span class="text-muted small">
                            <i class="far fa-calendar-alt me-1"></i>${dateRange}
                        </span>
                    </div>
                    <h5 class="card-title mb-2" title="${transformedTournament.name}">
                        ${this.truncateText(transformedTournament.name, 25)}
                    </h5>
                    <p class="card-text small text-muted mb-3" title="${transformedTournament.description}">
                        ${this.truncateText(transformedTournament.description || 'Tournament description', 60)}
                    </p>
                    
                    <!-- Progress bar -->
                    <div class="progress mb-2" style="height: 6px;">
                        <div class="progress-bar bg-primary" role="progressbar" 
                             style="width: ${progress}%" aria-valuenow="${progress}" 
                             aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <span class="text-muted small me-3">
                                <i class="far fa-users me-1"></i>${transformedTournament.teamsCount || 'TBD'}
                            </span>
                            <span class="text-success small fw-bold">
                                ${this.formatCurrency(transformedTournament.prizePool)}
                            </span>
                        </div>
                        <a href="tournament-detail.html?id=${transformedTournament.id}" 
                           class="btn btn-sm btn-outline-primary">
                            View
                        </a>
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    // Enhanced teams update
    updateTeams(teams) {
        const container = document.querySelector('#teams .row');
        if (!container) return;

        container.innerHTML = '';

        const teamsArray = this.ensureArray(teams, 'teams');

        if (teamsArray.length === 0) {
            this.renderEmptyState(container, 'teams');
            return;
        }

        teamsArray.forEach((team, index) => {
            const teamCard = this.createTeamCard(team, index);
            container.appendChild(teamCard);
        });

        this.updateViewAllButton('teams', teamsArray.length);
    }

    createTeamCard(team, index) {
        const col = document.createElement('div');
        col.className = 'col-xl-3 col-lg-4 col-md-6 mb-4';
        col.style.animationDelay = `${index * 0.1}s`;

        const transformedTeam = this.transformTeamData(team);

        col.innerHTML = `
            <div class="card team-card h-100 animate__animated animate__fadeInUp">
                <div class="card-body p-3 text-center">
                    <div class="team-logo-container mb-3">
                        <img src="${transformedTeam.logo}" 
                             alt="${transformedTeam.name} Logo" 
                             class="team-logo-md rounded-circle"
                             onerror="this.src='https://placehold.co/60x60/007bff/ffffff?text=${transformedTeam.name.charAt(0)}'">
                    </div>
                    <h6 class="card-title mb-2" title="${transformedTeam.name}">
                        ${this.truncateText(transformedTeam.name, 20)}
                    </h6>
                    <div class="team-stats mb-3">
                        <div class="row text-center">
                            <div class="col-4">
                                <div class="stat-item">
                                    <div class="stat-value text-warning">${transformedTeam.wins || 0}</div>
                                    <div class="stat-label small">Wins</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="stat-item">
                                    <div class="stat-value text-primary">${transformedTeam.playersCount || 0}</div>
                                    <div class="stat-label small">Players</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="stat-item">
                                    <div class="stat-value text-success">${transformedTeam.rating || '4.0'}</div>
                                    <div class="stat-label small">Rating</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-muted small">
                            <i class="fas fa-map-marker-alt me-1"></i>${transformedTeam.city || 'Unknown'}
                        </span>
                        <span class="badge bg-light text-dark">
                            ${transformedTeam.league || 'League'}
                        </span>
                    </div>
                    <a href="team-detail.html?id=${transformedTeam.id}" class="btn btn-sm btn-outline-primary w-100">
                        View Team
                    </a>
                </div>
            </div>
        `;

        return col;
    }

    // Enhanced matches update
    updateMatches(matches) {
        const container = document.querySelector('#matches .row');
        if (!container) return;

        container.innerHTML = '';

        const matchesArray = this.ensureArray(matches, 'matches');

        if (matchesArray.length === 0) {
            this.renderEmptyState(container, 'matches');
            return;
        }

        // Show only first 2 matches for dashboard
        matchesArray.slice(0, 2).forEach((match, index) => {
            const matchCard = this.createMatchCard(match, index);
            container.appendChild(matchCard);
        });

        this.updateViewAllButton('matches', matchesArray.length);
    }

    createMatchCard(match, index) {
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4';
        col.style.animationDelay = `${index * 0.1}s`;

        const transformedMatch = this.transformMatchData(match);
        const matchDate = new Date(transformedMatch.date);
        const timeUntil = FumaUtils.date.timeUntil(transformedMatch.date);
        const statusBadge = this.getMatchStatusBadge(transformedMatch.status);

        col.innerHTML = `
            <div class="card match-card h-100 animate__animated animate__fadeInUp">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        ${statusBadge}
                        <small class="text-muted">
                            <i class="fas fa-calendar-alt me-1"></i>
                            ${FumaUtils.date.format(matchDate, 'DD/MM, HH:mm')}
                        </small>
                    </div>
                    
                    <div class="match-teams mb-3">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="team-info d-flex align-items-center flex-grow-1">
                                <img src="${transformedMatch.homeTeam?.logo || 'https://placehold.co/30x30'}" 
                                     alt="Home Team" 
                                     class="team-logo-sm me-2 rounded-circle">
                                <span class="team-name">${this.truncateText(transformedMatch.homeTeam?.name || 'Home Team', 12)}</span>
                            </div>
                            
                            <div class="match-score px-3">
                                ${transformedMatch.status === 'LIVE' || transformedMatch.status === 'COMPLETED' ? `
                                    <span class="score-display fw-bold">
                                        ${transformedMatch.homeScore || 0} - ${transformedMatch.awayScore || 0}
                                    </span>
                                ` : `
                                    <div class="vs-badge bg-light rounded-pill px-2 py-1">
                                        <small class="fw-bold text-muted">VS</small>
                                    </div>
                                `}
                            </div>
                            
                            <div class="team-info d-flex align-items-center flex-grow-1 justify-content-end">
                                <span class="team-name text-end">${this.truncateText(transformedMatch.awayTeam?.name || 'Away Team', 12)}</span>
                                <img src="${transformedMatch.awayTeam?.logo || 'https://placehold.co/30x30'}" 
                                     alt="Away Team" 
                                     class="team-logo-sm ms-2 rounded-circle">
                            </div>
                        </div>
                    </div>
                    
                    <div class="match-details">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-dark small">
                                <i class="fas fa-map-marker-alt me-1"></i>${transformedMatch.venue || 'Stadium'}
                            </span>
                            <div class="match-actions">
                                <a href="match-detail.html?id=${transformedMatch.id}" 
                                   class="btn btn-sm btn-outline-primary me-1">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <button class="btn btn-sm btn-outline-secondary" 
                                        onclick="subscribeToMatch('${transformedMatch.id}')"
                                        title="Get notifications">
                                    <i class="fas fa-bell"></i>
                                </button>
                            </div>
                        </div>
                        
                        ${timeUntil !== 'Started' && transformedMatch.status !== 'COMPLETED' ? `
                            <div class="mt-2">
                                <small class="text-muted">
                                    <i class="fas fa-clock me-1"></i>
                                    ${transformedMatch.status === 'LIVE' ? 'Live now' : `Starts in ${timeUntil}`}
                                </small>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    updateRecentActivity(activities) {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        container.innerHTML = '';

        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-3 text-muted">
                    <i class="fas fa-clock fa-2x mb-2"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        activities.forEach((activity, index) => {
            const activityItem = this.createActivityItem(activity, index);
            container.appendChild(activityItem);
        });
    }

    createActivityItem(activity, index) {
        const item = document.createElement('div');
        item.className = 'activity-item d-flex align-items-center p-2 border-bottom';
        item.style.animationDelay = `${index * 0.1}s`;

        const icon = this.getActivityIcon(activity.type);
        const timeAgo = FumaUtils.date.relative(activity.createdAt);

        item.innerHTML = `
            <div class="activity-icon me-3">
                <i class="${icon.class} text-${icon.color}"></i>
            </div>
            <div class="activity-content flex-grow-1">
                <div class="activity-title">${activity.title}</div>
                <small class="text-muted">${timeAgo}</small>
            </div>
            ${activity.actionUrl ? `
                <a href="${activity.actionUrl}" class="btn btn-sm btn-outline-primary">
                    View
                </a>
            ` : ''}
        `;

        return item;
    }

    // Utility methods
    ensureArray(data, fallbackKey) {
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') {
            return data[fallbackKey] || data.data || data.results || [];
        }
        return [];
    }

    transformTournamentData(tournament) {
        return {
            id: tournament.id || Date.now(),
            name: tournament.name || tournament.title || 'Unknown Tournament',
            description: tournament.description || tournament.desc || '',
            status: tournament.status || 'UPCOMING',
            startDate: tournament.startDate || tournament.start_date,
            endDate: tournament.endDate || tournament.end_date,
            teamsCount: tournament.teamsCount || tournament.maxTeams || 0,
            matchesCount: tournament.matchesCount || tournament.totalMatches || 0,
            completedMatches: tournament.completedMatches || tournament.playedMatches || 0,
            prizePool: tournament.prizePool || tournament.prize_pool || 0
        };
    }

    transformTeamData(team) {
        return {
            id: team.id || Date.now(),
            name: team.name || 'Unknown Team',
            logo: team.logo || `https://placehold.co/60x60/007bff/ffffff?text=${(team.name || 'T').charAt(0)}`,
            city: team.city || team.location || 'Unknown',
            wins: team.wins || team.victories || 0,
            playersCount: team.playersCount || team.players_count || 0,
            rating: team.rating || '4.0',
            league: team.league || team.division || 'League'
        };
    }

    transformMatchData(match) {
        return {
            id: match.id || Date.now(),
            homeTeam: {
                name: match.homeTeam?.name || match.home_team?.name || 'Home Team',
                logo: match.homeTeam?.logo || match.home_team?.logo || 'https://placehold.co/30x30'
            },
            awayTeam: {
                name: match.awayTeam?.name || match.away_team?.name || 'Away Team',
                logo: match.awayTeam?.logo || match.away_team?.logo || 'https://placehold.co/30x30'
            },
            date: match.date || match.scheduled_at || new Date().toISOString(),
            venue: match.venue || match.stadium || 'Stadium',
            status: match.status || 'SCHEDULED',
            homeScore: match.homeScore || match.home_score || 0,
            awayScore: match.awayScore || match.away_score || 0,
            stage: match.stage || match.round || 'Match'
        };
    }

    calculateProgress(tournament) {
        const total = tournament.matchesCount || 0;
        const completed = tournament.completedMatches || 0;
        
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    formatCurrency(amount) {
        if (!amount || amount === 0) return 'TBD';
        
        const num = parseInt(amount);
        if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `$${(num / 1000).toFixed(1)}K`;
        } else {
            return `$${num.toLocaleString()}`;
        }
    }

    getStatusBadge(status) {
        const statusConfig = {
            'ONGOING': { class: 'bg-primary', text: 'Ongoing' },
            'ACTIVE': { class: 'bg-primary', text: 'Active' },
            'LIVE': { class: 'bg-danger', text: 'Live' },
            'UPCOMING': { class: 'bg-warning text-dark', text: 'Upcoming' },
            'COMPLETED': { class: 'bg-secondary', text: 'Completed' },
            'CANCELLED': { class: 'bg-danger', text: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig['UPCOMING'];
        return `<span class="badge ${config.class} small">${config.text}</span>`;
    }

    getMatchStatusBadge(status) {
        const statusConfig = {
            'LIVE': { class: 'bg-danger', text: 'Live', icon: 'circle' },
            'SCHEDULED': { class: 'bg-primary', text: 'Scheduled', icon: 'clock' },
            'COMPLETED': { class: 'bg-success', text: 'Completed', icon: 'check' },
            'POSTPONED': { class: 'bg-warning text-dark', text: 'Postponed', icon: 'pause' },
            'CANCELLED': { class: 'bg-secondary', text: 'Cancelled', icon: 'times' }
        };

        const config = statusConfig[status] || statusConfig['SCHEDULED'];
        return `
            <span class="badge ${config.class} small">
                <i class="fas fa-${config.icon} me-1"></i>${config.text}
            </span>
        `;
    }

    getActivityIcon(type) {
        const icons = {
            'tournament_created': { class: 'fas fa-trophy', color: 'primary' },
            'match_completed': { class: 'fas fa-check-circle', color: 'success' },
            'team_registered': { class: 'fas fa-users', color: 'info' },
            'player_signed': { class: 'fas fa-user-plus', color: 'warning' },
            'default': { class: 'fas fa-info-circle', color: 'secondary' }
        };

        return icons[type] || icons['default'];
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

    renderEmptyState(container, type) {
        const emptyStates = {
            tournaments: {
                icon: 'trophy',
                title: 'No tournaments',
                message: 'No active tournaments at the moment.'
            },
            teams: {
                icon: 'users',
                title: 'No teams',
                message: 'No teams registered yet.'
            },
            matches: {
                icon: 'gamepad',
                title: 'No matches',
                message: 'No upcoming matches scheduled.'
            }
        };

        const state = emptyStates[type] || emptyStates.tournaments;
        
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'col-12';
        emptyDiv.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="fas fa-${state.icon} fa-2x mb-2"></i>
                <h6>${state.title}</h6>
                <p class="small">${state.message}</p>
            </div>
        `;
        
        container.appendChild(emptyDiv);
    }

    updateViewAllButton(section, count) {
        const viewAllContainer = document.querySelector(`#${section} .view-all-container`);
        if (viewAllContainer) {
            viewAllContainer.innerHTML = `
                <a href="${section}.html" class="btn btn-sm btn-primary px-3">
                    <i class="fas fa-list me-1"></i> View All ${section.charAt(0).toUpperCase() + section.slice(1)} (${count}+)
                </a>
            `;
        }
    }

    // Caching methods
    getCachedDashboardData() {
        const cached = this.cache.get('dashboard');
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }
        this.cache.delete('dashboard');
        return null;
    }

    cacheDashboardData(data) {
        this.cache.set('dashboard', {
            data,
            timestamp: Date.now()
        });
    }

    // Error handling
    handleDashboardError(error, silent) {
        console.error('Dashboard error:', error);
        this.markFailedRequest();
        
        if (!silent) {
            // Check if it's a CORS error
            if (error.message.includes('CORS') || error.message.includes('cors')) {
                FumaUtils.ui.showToast('CORS error detected. Please check backend configuration.', 'danger', 5000);
                
                // Show link to troubleshooting guide
                const corsLink = document.createElement('div');
                corsLink.innerHTML = `
                    <div class="alert alert-warning mt-3">
                        <strong>CORS Configuration Issue:</strong> 
                        <a href="cors-troubleshooting.html" target="_blank" class="alert-link">
                            View troubleshooting guide
                        </a>
                    </div>
                `;
                document.body.appendChild(corsLink);
                
                setTimeout(() => {
                    document.body.removeChild(corsLink);
                }, 10000);
            } else {
                // Show fallback data for other errors
                this.loadFallbackData();
                FumaUtils.ui.showToast('Using cached data - connection issues detected', 'warning', 3000);
            }
        }
    }

    handlePartialErrors(errors) {
        const errorTypes = errors.map(e => e.type).join(', ');
        console.warn('Partial data loading errors:', errors);
        
        // Check if any errors are CORS-related
        const corsErrors = errors.filter(e => 
            e.error.message.includes('CORS') || e.error.message.includes('cors')
        );
        
        if (corsErrors.length > 0) {
            FumaUtils.ui.showToast('CORS error detected. Please check backend configuration.', 'danger', 5000);
            
            // Show link to troubleshooting guide
            const corsLink = document.createElement('div');
            corsLink.innerHTML = `
                <div class="alert alert-warning mt-3">
                    <strong>CORS Configuration Issue:</strong> 
                    <a href="cors-troubleshooting.html" target="_blank" class="alert-link">
                        View troubleshooting guide
                    </a>
                </div>
            `;
            document.body.appendChild(corsLink);
            
            setTimeout(() => {
                document.body.removeChild(corsLink);
            }, 10000);
        } else {
            FumaUtils.ui.showToast(
                `Some data may be outdated (${errorTypes})`, 
                'warning', 
                3000
            );
        }
    }

    loadFallbackData() {
        const fallbackData = {
            statistics: this.getFallbackStats(),
            tournaments: this.getFallbackTournaments(),
            teams: this.getFallbackTeams(),
            matches: this.getFallbackMatches(),
            activity: []
        };

        this.updateDashboardWithData(fallbackData);
    }

    getFallbackData(type) {
        const fallbacks = {
            statistics: this.getFallbackStats(),
            tournaments: this.getFallbackTournaments(),
            teams: this.getFallbackTeams(),
            matches: this.getFallbackMatches(),
            activity: []
        };

        return fallbacks[type] || [];
    }

    // User authentication and navigation
    setupUserAuthentication() {
        const navItems = document.querySelector('.navbar-nav');
        if (!navItems) return;

        if (window.apiClient && window.apiClient.isAuthenticated()) {
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

        const userName = window.apiClient.user?.name || 'User';
        const userRole = window.apiClient.user?.role || 'VIEWER';

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

    handleAuthStateChange(detail) {
        if (detail.type === 'login') {
            this.setupUserAuthentication();
            this.loadDashboardData(); // Refresh data for authenticated user
        } else if (detail.type === 'logout') {
            window.location.href = 'login.html';
        }
    }

    // Navigation and actions
    navigateToPage(page) {
        const pages = {
            tournaments: 'tournaments.html',
            teams: 'teams.html',
            matches: 'matches.html',
            players: 'players.html'
        };

        if (pages[page]) {
            window.location.href = pages[page];
        }
    }

    showQuickAddModal(type) {
        // This would open a modal for quick adding
        FumaUtils.ui.showToast(`Quick add ${type} feature coming soon!`, 'info');
    }

    handleGlobalSearch(query) {
        if (!query.trim()) return;
        
        // Implement global search functionality
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }

    refreshDashboard() {
        this.cache.clear();
        this.loadDashboardData();
        FumaUtils.ui.showToast('Dashboard refreshed', 'success', 2000);
    }

    updateLastRefreshTime() {
        const timeElement = document.getElementById('lastRefreshTime');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString();
        }
    }

    // Loading states
    showLoadingStates() {
        const sections = ['#tournaments', '#teams', '#matches'];
        
        sections.forEach(selector => {
            const container = document.querySelector(`${selector} .row`);
            if (container) {
                FumaUtils.ui.showLoading(container, 'Loading...');
            }
        });

        // Show loading in stats cards
        document.querySelectorAll('.stats-number').forEach(el => {
            el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        });
    }

    hideLoadingStates() {
        const sections = ['#tournaments', '#teams', '#matches'];
        
        sections.forEach(selector => {
            const container = document.querySelector(`${selector} .row`);
            if (container) {
                FumaUtils.ui.hideLoading(container);
            }
        });
    }

    // Fallback data
    getFallbackStats() {
        return {
            tournaments: 15,
            teams: 120,
            players: 2500,
            matches: 380,
            totalPrizePool: 5000000,
            growth: {
                tournaments: 12,
                teams: 8,
                players: 15,
                matches: 22
            }
        };
    }

    getFallbackTournaments() {
        return [
            {
                id: 1,
                name: 'Premier League 2023',
                description: '20 top teams battling for championship.',
                status: 'ONGOING',
                startDate: '2023-06-01T00:00:00Z',
                endDate: '2023-07-30T00:00:00Z',
                teamsCount: 20,
                matchesCount: 45,
                completedMatches: 32,
                prizePool: 1000000
            },
            {
                id: 2,
                name: 'Champions Cup',
                description: 'Knockout tournament with 16 elite teams.',
                status: 'UPCOMING',
                startDate: '2023-08-10T00:00:00Z',
                endDate: '2023-09-25T00:00:00Z',
                teamsCount: 16,
                matchesCount: 15,
                completedMatches: 0,
                prizePool: 500000
            },
            {
                id: 3,
                name: 'Winter Tournament',
                description: 'Annual cold weather competition.',
                status: 'COMPLETED',
                startDate: '2023-01-05T00:00:00Z',
                endDate: '2023-02-20T00:00:00Z',
                teamsCount: 8,
                matchesCount: 20,
                completedMatches: 20,
                prizePool: 250000
            }
        ];
    }

    getFallbackTeams() {
        return [
            {
                id: 1,
                name: 'City FC',
                logo: 'https://placehold.co/60x60/007bff/ffffff?text=C',
                city: 'New York',
                wins: 12,
                playersCount: 25,
                rating: '4.8',
                league: 'Premier'
            },
            {
                id: 2,
                name: 'United SC',
                logo: 'https://placehold.co/60x60/dc3545/ffffff?text=U',
                city: 'London',
                wins: 9,
                playersCount: 22,
                rating: '4.7',
                league: 'Premier'
            },
            {
                id: 3,
                name: 'Dynamo FC',
                logo: 'https://placehold.co/60x60/28a745/ffffff?text=D',
                city: 'Berlin',
                wins: 7,
                playersCount: 23,
                rating: '4.6',
                league: 'Elite'
            },
            {
                id: 4,
                name: 'Rovers FC',
                logo: 'https://placehold.co/60x60/ffc107/000000?text=R',
                city: 'Madrid',
                wins: 5,
                playersCount: 20,
                rating: '4.5',
                league: 'Elite'
            }
        ];
    }

    getFallbackMatches() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 3);

        return [
            {
                id: 1,
                homeTeam: { 
                    name: 'City FC', 
                    logo: 'https://placehold.co/30x30/007bff/ffffff?text=C' 
                },
                awayTeam: { 
                    name: 'United SC', 
                    logo: 'https://placehold.co/30x30/dc3545/ffffff?text=U' 
                },
                date: tomorrow.toISOString(),
                venue: 'National Stadium',
                status: 'SCHEDULED',
                stage: 'Group Stage'
            },
            {
                id: 2,
                homeTeam: { 
                    name: 'Dynamo FC', 
                    logo: 'https://placehold.co/30x30/28a745/ffffff?text=D' 
                },
                awayTeam: { 
                    name: 'Rovers FC', 
                    logo: 'https://placehold.co/30x30/ffc107/000000?text=R' 
                },
                date: dayAfter.toISOString(),
                venue: 'City Arena',
                status: 'SCHEDULED',
                stage: 'Quarter Final'
            }
        ];
    }

    // Cleanup
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.cache.clear();
    }
}

// Global functions
window.subscribeToMatch = function(matchId) {
    FumaUtils.ui.showToast('Match notifications enabled!', 'success');
    // Implement actual subscription logic here
};

window.logout = async function() {
    try {
        await window.apiClient.logout();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.indexDataHandler = new EnhancedIndexDataHandler();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.indexDataHandler) {
        window.indexDataHandler.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedIndexDataHandler;
}
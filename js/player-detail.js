/**
 * Player Detail Handler
 * Handles frontend-backend integration for player-detail.html
 * Features: comprehensive player data, statistics, match history, career timeline
 */

class PlayerDetailHandler {
    constructor() {
        this.playerId = null;
        this.player = null;
        this.isLoading = false;
        this.data = {
            matches: [],
            statistics: null,
            teams: [],
            achievements: []
        };
        this.init();
    }

    init() {
        this.playerId = this.getPlayerIdFromUrl();
        if (!this.playerId) {
            this.showError('Player ID not found');
            return;
        }

        this.setupEventListeners();
        this.loadPlayerData();
    }

    getPlayerIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    setupEventListeners() {
        // Action buttons
        document.getElementById('editPlayer')?.addEventListener('click', () => {
            this.editPlayer();
        });

        document.getElementById('deletePlayer')?.addEventListener('click', () => {
            this.deletePlayer();
        });

        document.getElementById('transferPlayer')?.addEventListener('click', () => {
            this.transferPlayer();
        });

        // Refresh button
        document.getElementById('refreshData')?.addEventListener('click', () => {
            this.loadPlayerData();
        });

        // Tab navigation
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const tabId = e.target.getAttribute('data-bs-target').replace('#', '');
                this.loadTabContent(tabId);
            });
        });

        // Filter buttons for matches
        document.querySelectorAll('.match-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterMatches(filter);
            });
        });
    }

    async loadPlayerData() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoadingState();

            const response = await apiClient.getPlayer(this.playerId);

            if (response.success) {
                this.player = response.data;
                this.renderPlayerHeader();
                this.renderPlayerStats();
                this.renderPlayerInfo();
                this.loadPlayerMatches();
                this.loadPlayerStatistics();
                this.updateActionButtons();
            } else {
                throw new Error(response.message || 'Failed to load player');
            }

        } catch (error) {
            console.error('Error loading player:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    renderPlayerHeader() {
        if (!this.player) return;

        // Update page title
        document.title = `${this.player.name} - FUMA`;

        // Update player header
        const headerElements = {
            name: document.getElementById('playerName'),
            position: document.getElementById('playerPosition'),
            team: document.getElementById('playerTeam'),
            nationality: document.getElementById('playerNationality'),
            age: document.getElementById('playerAge')
        };

        if (headerElements.name) {
            headerElements.name.textContent = this.player.name;
        }

        if (headerElements.position) {
            headerElements.position.innerHTML = `
                <span class="badge bg-primary">${this.player.position || 'Player'}</span>
            `;
        }

        if (headerElements.team && this.player.currentTeam) {
            headerElements.team.innerHTML = `
                <i class="fas fa-shield-alt me-2"></i>
                <a href="team-detail.html?id=${this.player.currentTeam.id}" class="text-decoration-none">
                    ${this.player.currentTeam.name}
                </a>
            `;
        }

        if (headerElements.nationality && this.player.nationality) {
            headerElements.nationality.innerHTML = `
                <i class="fas fa-flag me-2"></i>
                ${this.player.nationality}
            `;
        }

        if (headerElements.age && this.player.dateOfBirth) {
            const age = this.calculateAge(this.player.dateOfBirth);
            headerElements.age.innerHTML = `
                <i class="fas fa-birthday-cake me-2"></i>
                ${age} years old
            `;
        }
    }

    renderPlayerStats() {
        if (!this.player) return;

        const statsContainer = document.getElementById('playerStats');
        if (!statsContainer) return;

        const matchesPlayed = this.player.matchesPlayed || 0;
        const goals = this.player.goals || 0;
        const assists = this.player.assists || 0;
        const yellowCards = this.player.yellowCards || 0;
        const redCards = this.player.redCards || 0;

        statsContainer.innerHTML = `
            <div class="row g-3">
                <div class="col-6 col-md-3 col-lg">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-primary mb-1">${matchesPlayed}</h3>
                            <small class="text-muted">Matches</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-3 col-lg">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-success mb-1">${goals}</h3>
                            <small class="text-muted">Goals</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-3 col-lg">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-info mb-1">${assists}</h3>
                            <small class="text-muted">Assists</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-3 col-lg">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-warning mb-1">${yellowCards}</h3>
                            <small class="text-muted">Yellow Cards</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-3 col-lg">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-danger mb-1">${redCards}</h3>
                            <small class="text-muted">Red Cards</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPlayerInfo() {
        if (!this.player) return;

        const infoContainer = document.getElementById('playerInfo');
        if (!infoContainer) return;

        infoContainer.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-info-circle me-2"></i>Player Information</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <strong>Full Name:</strong><br>
                                <span class="text-muted">${this.player.name}</span>
                            </div>
                            <div class="mb-3">
                                <strong>Date of Birth:</strong><br>
                                <span class="text-muted">
                                    ${this.player.dateOfBirth ? FumaUtils.date.format(this.player.dateOfBirth, 'DD/MM/YYYY') : 'Not specified'}
                                </span>
                            </div>
                            <div class="mb-3">
                                <strong>Height:</strong><br>
                                <span class="text-muted">${this.player.height || 'Not specified'}</span>
                            </div>
                            <div class="mb-3">
                                <strong>Weight:</strong><br>
                                <span class="text-muted">${this.player.weight || 'Not specified'}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <strong>Position:</strong><br>
                                <span class="badge bg-primary">${this.player.position || 'Player'}</span>
                            </div>
                            <div class="mb-3">
                                <strong>Jersey Number:</strong><br>
                                <span class="text-muted">${this.player.jerseyNumber || 'Not assigned'}</span>
                            </div>
                            <div class="mb-3">
                                <strong>Preferred Foot:</strong><br>
                                <span class="text-muted">${this.player.preferredFoot || 'Not specified'}</span>
                            </div>
                            <div class="mb-3">
                                <strong>Market Value:</strong><br>
                                <span class="text-muted">${this.player.marketValue ? FumaUtils.format.currency(this.player.marketValue) : 'Not specified'}</span>
                            </div>
                        </div>
                    </div>
                    ${this.player.biography ? `
                        <hr>
                        <div>
                            <strong>Biography:</strong><br>
                            <div class="text-muted">${this.player.biography}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async loadTabContent(tabId) {
        switch (tabId) {
            case 'matches':
                // Already loaded in loadPlayerMatches
                break;
            case 'statistics':
                await this.loadPlayerStatistics();
                break;
            case 'career':
                await this.loadPlayerCareer();
                break;
            case 'achievements':
                await this.loadPlayerAchievements();
                break;
        }
    }

    async loadPlayerMatches() {
        const container = document.getElementById('playerMatches');
        if (!container) return;

        try {
            const response = await apiClient.getPlayerMatches(this.playerId);
            
            if (response.success) {
                this.data.matches = response.data || [];
                this.renderMatchesContent(container);
            } else {
                throw new Error(response.message || 'Failed to load matches');
            }
        } catch (error) {
            console.error('Error loading matches:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading matches: ${error.message}
                </div>
            `;
        }
    }

    renderMatchesContent(container) {
        if (this.data.matches.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-futbol fa-3x mb-3"></i>
                    <h5>No matches played yet</h5>
                    <p>Match history will appear here once the player starts playing</p>
                </div>
            `;
            return;
        }

        // Add filter buttons
        const filterButtons = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">
                    <i class="fas fa-history me-2"></i>
                    Match History (${this.data.matches.length})
                </h5>
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-secondary btn-sm match-filter-btn active" data-filter="all">
                        All
                    </button>
                    <button class="btn btn-outline-success btn-sm match-filter-btn" data-filter="goals">
                        With Goals
                    </button>
                    <button class="btn btn-outline-info btn-sm match-filter-btn" data-filter="assists">
                        With Assists
                    </button>
                    <button class="btn btn-outline-warning btn-sm match-filter-btn" data-filter="cards">
                        With Cards
                    </button>
                </div>
            </div>
        `;

        const matchesHtml = this.data.matches.map(match => this.renderPlayerMatchCard(match)).join('');

        container.innerHTML = `
            ${filterButtons}
            <div class="matches-container">
                ${matchesHtml}
            </div>
        `;

        // Re-attach event listeners for filter buttons
        container.querySelectorAll('.match-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button
                container.querySelectorAll('.match-filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const filter = e.target.dataset.filter;
                this.filterMatches(filter);
            });
        });
    }

    renderPlayerMatchCard(match) {
        const playerStats = match.playerStats || {};
        const goals = playerStats.goals || 0;
        const assists = playerStats.assists || 0;
        const yellowCards = playerStats.yellowCards || 0;
        const redCards = playerStats.redCards || 0;
        const minutesPlayed = playerStats.minutesPlayed || 0;

        const hasGoals = goals > 0;
        const hasAssists = assists > 0;
        const hasCards = yellowCards > 0 || redCards > 0;

        return `
            <div class="card mb-3 player-match-card" 
                 data-has-goals="${hasGoals}" 
                 data-has-assists="${hasAssists}" 
                 data-has-cards="${hasCards}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <div class="match-info">
                                <div class="match-teams mb-2">
                                    <strong>${match.team1?.name || 'TBD'}</strong> vs <strong>${match.team2?.name || 'TBD'}</strong>
                                </div>
                                <div class="match-score">
                                    <span class="fw-bold">${match.team1Score || 0} - ${match.team2Score || 0}</span>
                                    <span class="badge bg-${this.getMatchResultColor(match)} ms-2">
                                        ${this.getMatchResult(match)}
                                    </span>
                                </div>
                                <div class="match-date small text-muted mt-1">
                                    <i class="fas fa-calendar me-1"></i>
                                    ${match.scheduledAt ? FumaUtils.date.format(match.scheduledAt, 'DD/MM/YYYY') : 'TBD'}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="player-performance">
                                <div class="row">
                                    <div class="col-3">
                                        <div class="stat-item">
                                            <div class="stat-value text-success">${goals}</div>
                                            <div class="stat-label small">Goals</div>
                                        </div>
                                    </div>
                                    <div class="col-3">
                                        <div class="stat-item">
                                            <div class="stat-value text-info">${assists}</div>
                                            <div class="stat-label small">Assists</div>
                                        </div>
                                    </div>
                                    <div class="col-3">
                                        <div class="stat-item">
                                            <div class="stat-value text-warning">${yellowCards}</div>
                                            <div class="stat-label small">YC</div>
                                        </div>
                                    </div>
                                    <div class="col-3">
                                        <div class="stat-item">
                                            <div class="stat-value text-danger">${redCards}</div>
                                            <div class="stat-label small">RC</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="minutes-played mt-2 small text-muted">
                                    ${minutesPlayed}' played
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="match-tournament mb-2">
                                <small class="text-muted">
                                    <i class="fas fa-trophy me-1"></i>
                                    ${match.tournament?.name || 'Friendly'}
                                </small>
                            </div>
                            <button class="btn btn-outline-primary btn-sm" 
                                    onclick="window.playerDetailHandler.viewMatchDetails(${match.id})">
                                <i class="fas fa-eye"></i> View Match
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadPlayerStatistics() {
        const container = document.getElementById('statistics');
        if (!container) return;

        try {
            const response = await apiClient.getPlayerStatistics(this.playerId);
            
            if (response.success) {
                this.data.statistics = response.data;
                this.renderPlayerStatistics(container);
            } else {
                throw new Error(response.message || 'Failed to load statistics');
            }
        } catch (error) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-chart-bar me-2"></i>
                    Detailed statistics not available for this player
                </div>
            `;
        }
    }

    renderPlayerStatistics(container) {
        if (!this.data.statistics) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-chart-bar fa-3x mb-3"></i>
                    <h5>No detailed statistics available</h5>
                    <p>Player statistics will appear here as more data becomes available</p>
                </div>
            `;
            return;
        }

        const stats = this.data.statistics;

        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Offensive Statistics</h6>
                        </div>
                        <div class="card-body">
                            <div class="stat-row d-flex justify-content-between">
                                <span>Goals per Match:</span>
                                <strong>${(stats.goalsPerMatch || 0).toFixed(2)}</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Assists per Match:</span>
                                <strong>${(stats.assistsPerMatch || 0).toFixed(2)}</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Shots per Match:</span>
                                <strong>${(stats.shotsPerMatch || 0).toFixed(2)}</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Shot Accuracy:</span>
                                <strong>${(stats.shotAccuracy || 0).toFixed(1)}%</strong>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Defensive Statistics</h6>
                        </div>
                        <div class="card-body">
                            <div class="stat-row d-flex justify-content-between">
                                <span>Tackles per Match:</span>
                                <strong>${(stats.tacklesPerMatch || 0).toFixed(2)}</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Interceptions per Match:</span>
                                <strong>${(stats.interceptionsPerMatch || 0).toFixed(2)}</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Clearances per Match:</span>
                                <strong>${(stats.clearancesPerMatch || 0).toFixed(2)}</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Fouls per Match:</span>
                                <strong>${(stats.foulsPerMatch || 0).toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Passing Statistics</h6>
                        </div>
                        <div class="card-body">
                            <div class="stat-row d-flex justify-content-between">
                                <span>Pass Accuracy:</span>
                                <strong>${(stats.passAccuracy || 0).toFixed(1)}%</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Passes per Match:</span>
                                <strong>${(stats.passesPerMatch || 0).toFixed(1)}</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Key Passes per Match:</span>
                                <strong>${(stats.keyPassesPerMatch || 0).toFixed(2)}</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Crosses per Match:</span>
                                <strong>${(stats.crossesPerMatch || 0).toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Discipline</h6>
                        </div>
                        <div class="card-body">
                            <div class="stat-row d-flex justify-content-between">
                                <span>Yellow Cards per Match:</span>
                                <strong>${(stats.yellowCardsPerMatch || 0).toFixed(2)}</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Red Cards per Match:</span>
                                <strong>${(stats.redCardsPerMatch || 0).toFixed(3)}</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Minutes per Card:</span>
                                <strong>${Math.round(stats.minutesPerCard || 0)}</strong>
                            </div>
                            <div class="stat-row d-flex justify-content-between">
                                <span>Fair Play Score:</span>
                                <strong>${(stats.fairPlayScore || 0).toFixed(1)}/10</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadPlayerCareer() {
        const container = document.getElementById('career');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-timeline fa-3x mb-3"></i>
                <h5>Career Timeline</h5>
                <p>Player career history coming soon!</p>
            </div>
        `;
    }

    async loadPlayerAchievements() {
        const container = document.getElementById('achievements');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-medal fa-3x mb-3"></i>
                <h5>Achievements & Awards</h5>
                <p>Player achievements coming soon!</p>
            </div>
        `;
    }

    // Filter methods
    filterMatches(filter) {
        const matchCards = document.querySelectorAll('.player-match-card');
        
        matchCards.forEach(card => {
            let show = true;
            
            switch (filter) {
                case 'goals':
                    show = card.dataset.hasGoals === 'true';
                    break;
                case 'assists':
                    show = card.dataset.hasAssists === 'true';
                    break;
                case 'cards':
                    show = card.dataset.hasCards === 'true';
                    break;
                case 'all':
                default:
                    show = true;
                    break;
            }
            
            card.style.display = show ? 'block' : 'none';
        });
    }

    // Action methods
    editPlayer() {
        FumaUtils.ui.showToast('Edit player feature coming soon!', 'info');
    }

    async deletePlayer() {
        const confirmed = await FumaUtils.ui.confirm(
            'Delete Player',
            'Are you sure you want to delete this player? This action cannot be undone.'
        );

        if (confirmed) {
            try {
                const response = await apiClient.deletePlayer(this.playerId);
                
                if (response.success) {
                    FumaUtils.ui.showToast('Player deleted successfully', 'success');
                    setTimeout(() => {
                        window.location.href = 'players.html';
                    }, 1500);
                } else {
                    throw new Error(response.message || 'Failed to delete player');
                }
            } catch (error) {
                FumaUtils.ui.showToast('Error deleting player: ' + error.message, 'error');
            }
        }
    }

    transferPlayer() {
        FumaUtils.ui.showToast('Transfer player feature coming soon!', 'info');
    }

    viewMatchDetails(matchId) {
        window.location.href = `match-detail.html?id=${matchId}`;
    }

    updateActionButtons() {
        // Update button visibility based on player permissions
        const editBtn = document.getElementById('editPlayer');
        const deleteBtn = document.getElementById('deletePlayer');
        const transferBtn = document.getElementById('transferPlayer');

        // For now, show all buttons - in future, implement proper permission checks
        if (editBtn) editBtn.style.display = 'inline-block';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        if (transferBtn) transferBtn.style.display = 'inline-block';
    }

    // Utility methods
    calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    getMatchResult(match) {
        // Determine if this is a win/loss/draw from player's team perspective
        // This would need team information to determine properly
        if (match.status !== 'COMPLETED') return 'Scheduled';
        
        const team1Score = match.team1Score || 0;
        const team2Score = match.team2Score || 0;
        
        if (team1Score > team2Score) return 'Win';
        if (team1Score < team2Score) return 'Loss';
        return 'Draw';
    }

    getMatchResultColor(match) {
        const result = this.getMatchResult(match);
        const colors = {
            'Win': 'success',
            'Loss': 'danger',
            'Draw': 'warning',
            'Scheduled': 'secondary'
        };
        return colors[result] || 'secondary';
    }

    showLoadingState() {
        const mainContent = document.querySelector('.player-content');
        if (mainContent) {
            mainContent.style.opacity = '0.6';
            mainContent.style.pointerEvents = 'none';
        }
    }

    hideLoadingState() {
        const mainContent = document.querySelector('.player-content');
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.pointerEvents = 'auto';
        }
    }

    showError(message) {
        const container = document.querySelector('.player-detail-container');
        if (container) {
            container.innerHTML = `
                <div class="container py-5">
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h3>Error Loading Player</h3>
                        <p class="text-muted">${message}</p>
                        <button class="btn btn-primary" onclick="window.location.href='players.html'">
                            <i class="fas fa-arrow-left"></i> Back to Players
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.playerDetailHandler = new PlayerDetailHandler();
});
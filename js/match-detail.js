/**
 * Match Detail Handler
 * Handles frontend-backend integration for match-detail.html
 * Features: live match updates, detailed statistics, event timeline, team lineups
 */

class MatchDetailHandler {
    constructor() {
        this.matchId = null;
        this.match = null;
        this.isLoading = false;
        this.refreshInterval = null;
        this.data = {
            events: [],
            statistics: null,
            lineups: {
                team1: [],
                team2: []
            }
        };
        this.init();
    }

    init() {
        this.matchId = this.getMatchIdFromUrl();
        if (!this.matchId) {
            this.showError('Match ID not found');
            return;
        }

        this.setupEventListeners();
        this.loadMatchData();
        this.setupAutoRefresh();
    }

    getMatchIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    setupEventListeners() {
        // Action buttons
        document.getElementById('editMatch')?.addEventListener('click', () => {
            this.editMatch();
        });

        document.getElementById('deleteMatch')?.addEventListener('click', () => {
            this.deleteMatch();
        });

        document.getElementById('startMatch')?.addEventListener('click', () => {
            this.startMatch();
        });

        document.getElementById('endMatch')?.addEventListener('click', () => {
            this.endMatch();
        });

        document.getElementById('addEvent')?.addEventListener('click', () => {
            this.addEvent();
        });

        // Refresh button
        document.getElementById('refreshData')?.addEventListener('click', () => {
            this.loadMatchData();
        });

        // Tab navigation
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const tabId = e.target.getAttribute('data-bs-target').replace('#', '');
                this.loadTabContent(tabId);
            });
        });

        // Auto-refresh toggle
        document.getElementById('autoRefresh')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.startAutoRefresh();
            } else {
                this.stopAutoRefresh();
            }
        });
    }

    async loadMatchData() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoadingState();

            const response = await apiClient.getMatch(this.matchId);

            if (response.success) {
                this.match = response.data;
                this.renderMatchHeader();
                this.renderMatchScore();
                this.renderMatchInfo();
                this.loadMatchEvents();
                this.updateActionButtons();
                this.updateLastUpdated();
            } else {
                throw new Error(response.message || 'Failed to load match');
            }

        } catch (error) {
            console.error('Error loading match:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    renderMatchHeader() {
        if (!this.match) return;

        // Update page title
        const team1Name = this.match.team1?.name || 'TBD';
        const team2Name = this.match.team2?.name || 'TBD';
        document.title = `${team1Name} vs ${team2Name} - FUMA`;

        // Update match header
        const headerElements = {
            team1Name: document.getElementById('team1Name'),
            team2Name: document.getElementById('team2Name'),
            tournament: document.getElementById('matchTournament'),
            venue: document.getElementById('matchVenue'),
            referee: document.getElementById('matchReferee')
        };

        if (headerElements.team1Name) {
            headerElements.team1Name.textContent = team1Name;
        }

        if (headerElements.team2Name) {
            headerElements.team2Name.textContent = team2Name;
        }

        if (headerElements.tournament && this.match.tournament) {
            headerElements.tournament.innerHTML = `
                <i class="fas fa-trophy me-2"></i>
                <a href="tournament-detail.html?id=${this.match.tournament.id}" class="text-decoration-none">
                    ${this.match.tournament.name}
                </a>
            `;
        }

        if (headerElements.venue && this.match.venue) {
            headerElements.venue.innerHTML = `
                <i class="fas fa-map-marker-alt me-2"></i>
                ${this.match.venue}
            `;
        }

        if (headerElements.referee && this.match.referee) {
            headerElements.referee.innerHTML = `
                <i class="fas fa-user-tie me-2"></i>
                ${this.match.referee}
            `;
        }
    }

    renderMatchScore() {
        if (!this.match) return;

        const scoreContainer = document.getElementById('matchScore');
        if (!scoreContainer) return;

        const team1Score = this.match.team1Score || 0;
        const team2Score = this.match.team2Score || 0;
        const status = this.match.status;
        const scheduledAt = this.match.scheduledAt;

        let statusDisplay = '';
        let timeDisplay = '';

        switch (status) {
            case 'ONGOING':
                statusDisplay = `<span class="badge bg-success fs-6">LIVE</span>`;
                timeDisplay = this.match.currentTime ? `<div class="match-time">${this.match.currentTime}'</div>` : '';
                break;
            case 'COMPLETED':
                statusDisplay = `<span class="badge bg-secondary fs-6">FULL TIME</span>`;
                break;
            case 'SCHEDULED':
                statusDisplay = `<span class="badge bg-warning fs-6">SCHEDULED</span>`;
                timeDisplay = scheduledAt ? `<div class="match-time">${FumaUtils.date.format(scheduledAt, 'DD/MM/YYYY HH:mm')}</div>` : '';
                break;
            case 'CANCELLED':
                statusDisplay = `<span class="badge bg-danger fs-6">CANCELLED</span>`;
                break;
            default:
                statusDisplay = `<span class="badge bg-secondary fs-6">${status}</span>`;
        }

        scoreContainer.innerHTML = `
            <div class="row align-items-center">
                <div class="col-4 text-center">
                    <div class="team-logo mb-2">
                        <i class="fas fa-shield-alt fa-3x text-primary"></i>
                    </div>
                    <h5 class="fw-bold">${this.match.team1?.name || 'TBD'}</h5>
                </div>
                <div class="col-4 text-center">
                    <div class="score-display">
                        ${status === 'SCHEDULED' ? `
                            <div class="vs-display">
                                <h1 class="display-4 fw-bold text-muted">VS</h1>
                            </div>
                        ` : `
                            <div class="score-numbers">
                                <h1 class="display-2 fw-bold">${team1Score} - ${team2Score}</h1>
                            </div>
                        `}
                        ${statusDisplay}
                        ${timeDisplay}
                    </div>
                </div>
                <div class="col-4 text-center">
                    <div class="team-logo mb-2">
                        <i class="fas fa-shield-alt fa-3x text-success"></i>
                    </div>
                    <h5 class="fw-bold">${this.match.team2?.name || 'TBD'}</h5>
                </div>
            </div>
        `;
    }

    renderMatchInfo() {
        if (!this.match) return;

        const infoContainer = document.getElementById('matchInfo');
        if (!infoContainer) return;

        infoContainer.innerHTML = `
            <div class="row g-3">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <i class="fas fa-calendar fa-2x text-primary mb-2"></i>
                            <h6 class="card-title">Date</h6>
                            <p class="card-text small">
                                ${this.match.scheduledAt ? FumaUtils.date.format(this.match.scheduledAt, 'DD/MM/YYYY') : 'TBD'}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <i class="fas fa-clock fa-2x text-success mb-2"></i>
                            <h6 class="card-title">Time</h6>
                            <p class="card-text small">
                                ${this.match.scheduledAt ? FumaUtils.date.format(this.match.scheduledAt, 'HH:mm') : 'TBD'}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <i class="fas fa-users fa-2x text-info mb-2"></i>
                            <h6 class="card-title">Attendance</h6>
                            <p class="card-text small">
                                ${this.match.attendance || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <i class="fas fa-thermometer-half fa-2x text-warning mb-2"></i>
                            <h6 class="card-title">Weather</h6>
                            <p class="card-text small">
                                ${this.match.weather || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadMatchEvents() {
        try {
            const response = await apiClient.getMatchEvents(this.matchId);
            
            if (response.success) {
                this.data.events = response.data || [];
                this.renderMatchEvents();
            } else {
                console.error('Failed to load match events:', response.message);
            }
        } catch (error) {
            console.error('Error loading match events:', error);
        }
    }

    renderMatchEvents() {
        const eventsContainer = document.getElementById('matchEvents');
        if (!eventsContainer) return;

        if (this.data.events.length === 0) {
            eventsContainer.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-list fa-3x mb-3"></i>
                    <h5>No events recorded</h5>
                    <p>Match events will appear here during the game</p>
                </div>
            `;
            return;
        }

        // Sort events by time
        const sortedEvents = [...this.data.events].sort((a, b) => (a.minute || 0) - (b.minute || 0));

        const eventsHtml = sortedEvents.map(event => this.renderEventItem(event)).join('');

        eventsContainer.innerHTML = `
            <div class="events-timeline">
                ${eventsHtml}
            </div>
        `;
    }

    renderEventItem(event) {
        const eventIcon = this.getEventIcon(event.type);
        const eventColor = this.getEventColor(event.type);
        const isTeam1 = event.teamId === this.match.team1Id;

        return `
            <div class="event-item d-flex ${isTeam1 ? 'justify-content-start' : 'justify-content-end'} mb-3">
                <div class="event-card ${isTeam1 ? 'team1-event' : 'team2-event'}">
                    <div class="event-header d-flex align-items-center">
                        <div class="event-time me-2">
                            <span class="badge bg-dark">${event.minute || 0}'</span>
                        </div>
                        <div class="event-icon me-2">
                            <i class="fas ${eventIcon} text-${eventColor}"></i>
                        </div>
                        <div class="event-type">
                            <strong>${this.formatEventType(event.type)}</strong>
                        </div>
                    </div>
                    <div class="event-details mt-1">
                        <div class="player-name">${event.playerName || 'Unknown Player'}</div>
                        ${event.description ? `<div class="event-description small text-muted">${event.description}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    async loadTabContent(tabId) {
        switch (tabId) {
            case 'statistics':
                await this.loadMatchStatistics();
                break;
            case 'lineups':
                await this.loadMatchLineups();
                break;
            case 'commentary':
                await this.loadMatchCommentary();
                break;
        }
    }

    async loadMatchStatistics() {
        const container = document.getElementById('statistics');
        if (!container) return;

        try {
            const response = await apiClient.getMatchStatistics(this.matchId);
            
            if (response.success) {
                this.data.statistics = response.data;
                this.renderMatchStatistics(container);
            } else {
                throw new Error(response.message || 'Failed to load statistics');
            }
        } catch (error) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-chart-bar me-2"></i>
                    Statistics not available for this match
                </div>
            `;
        }
    }

    renderMatchStatistics(container) {
        if (!this.data.statistics) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-chart-bar fa-3x mb-3"></i>
                    <h5>No statistics available</h5>
                    <p>Match statistics will appear here during and after the game</p>
                </div>
            `;
            return;
        }

        const stats = this.data.statistics;
        const team1Stats = stats.team1 || {};
        const team2Stats = stats.team2 || {};

        container.innerHTML = `
            <div class="statistics-comparison">
                <div class="stat-row">
                    <div class="row align-items-center">
                        <div class="col-4 text-end">
                            <span class="stat-value">${team1Stats.possession || 0}%</span>
                        </div>
                        <div class="col-4 text-center">
                            <span class="stat-label">Possession</span>
                        </div>
                        <div class="col-4">
                            <span class="stat-value">${team2Stats.possession || 0}%</span>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-12">
                            <div class="progress">
                                <div class="progress-bar bg-primary" style="width: ${team1Stats.possession || 0}%"></div>
                                <div class="progress-bar bg-success" style="width: ${team2Stats.possession || 0}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stat-row mt-4">
                    <div class="row align-items-center">
                        <div class="col-4 text-end">
                            <span class="stat-value">${team1Stats.shots || 0}</span>
                        </div>
                        <div class="col-4 text-center">
                            <span class="stat-label">Total Shots</span>
                        </div>
                        <div class="col-4">
                            <span class="stat-value">${team2Stats.shots || 0}</span>
                        </div>
                    </div>
                </div>

                <div class="stat-row mt-3">
                    <div class="row align-items-center">
                        <div class="col-4 text-end">
                            <span class="stat-value">${team1Stats.shotsOnTarget || 0}</span>
                        </div>
                        <div class="col-4 text-center">
                            <span class="stat-label">Shots on Target</span>
                        </div>
                        <div class="col-4">
                            <span class="stat-value">${team2Stats.shotsOnTarget || 0}</span>
                        </div>
                    </div>
                </div>

                <div class="stat-row mt-3">
                    <div class="row align-items-center">
                        <div class="col-4 text-end">
                            <span class="stat-value">${team1Stats.corners || 0}</span>
                        </div>
                        <div class="col-4 text-center">
                            <span class="stat-label">Corner Kicks</span>
                        </div>
                        <div class="col-4">
                            <span class="stat-value">${team2Stats.corners || 0}</span>
                        </div>
                    </div>
                </div>

                <div class="stat-row mt-3">
                    <div class="row align-items-center">
                        <div class="col-4 text-end">
                            <span class="stat-value">${team1Stats.fouls || 0}</span>
                        </div>
                        <div class="col-4 text-center">
                            <span class="stat-label">Fouls</span>
                        </div>
                        <div class="col-4">
                            <span class="stat-value">${team2Stats.fouls || 0}</span>
                        </div>
                    </div>
                </div>

                <div class="stat-row mt-3">
                    <div class="row align-items-center">
                        <div class="col-4 text-end">
                            <span class="stat-value text-warning">${team1Stats.yellowCards || 0}</span>
                        </div>
                        <div class="col-4 text-center">
                            <span class="stat-label">Yellow Cards</span>
                        </div>
                        <div class="col-4">
                            <span class="stat-value text-warning">${team2Stats.yellowCards || 0}</span>
                        </div>
                    </div>
                </div>

                <div class="stat-row mt-3">
                    <div class="row align-items-center">
                        <div class="col-4 text-end">
                            <span class="stat-value text-danger">${team1Stats.redCards || 0}</span>
                        </div>
                        <div class="col-4 text-center">
                            <span class="stat-label">Red Cards</span>
                        </div>
                        <div class="col-4">
                            <span class="stat-value text-danger">${team2Stats.redCards || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadMatchLineups() {
        const container = document.getElementById('lineups');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-users fa-3x mb-3"></i>
                <h5>Team Lineups</h5>
                <p>Player lineups coming soon!</p>
            </div>
        `;
    }

    async loadMatchCommentary() {
        const container = document.getElementById('commentary');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-microphone fa-3x mb-3"></i>
                <h5>Live Commentary</h5>
                <p>Match commentary coming soon!</p>
            </div>
        `;
    }

    // Auto-refresh functionality
    setupAutoRefresh() {
        const autoRefreshToggle = document.getElementById('autoRefresh');
        if (autoRefreshToggle && this.match?.status === 'ONGOING') {
            autoRefreshToggle.checked = true;
            this.startAutoRefresh();
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh(); // Clear any existing interval
        this.refreshInterval = setInterval(() => {
            this.loadMatchData();
        }, 30000); // Refresh every 30 seconds
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = `Last updated: ${FumaUtils.date.format(new Date(), 'HH:mm:ss')}`;
        }
    }

    // Action methods
    editMatch() {
        FumaUtils.ui.showToast('Edit match feature coming soon!', 'info');
    }

    async deleteMatch() {
        const confirmed = await FumaUtils.ui.confirm(
            'Delete Match',
            'Are you sure you want to delete this match? This action cannot be undone.'
        );

        if (confirmed) {
            try {
                const response = await apiClient.deleteMatch(this.matchId);
                
                if (response.success) {
                    FumaUtils.ui.showToast('Match deleted successfully', 'success');
                    setTimeout(() => {
                        window.location.href = 'matches.html';
                    }, 1500);
                } else {
                    throw new Error(response.message || 'Failed to delete match');
                }
            } catch (error) {
                FumaUtils.ui.showToast('Error deleting match: ' + error.message, 'error');
            }
        }
    }

    startMatch() {
        FumaUtils.ui.showToast('Start match feature coming soon!', 'info');
    }

    endMatch() {
        FumaUtils.ui.showToast('End match feature coming soon!', 'info');
    }

    addEvent() {
        FumaUtils.ui.showToast('Add event feature coming soon!', 'info');
    }

    updateActionButtons() {
        const editBtn = document.getElementById('editMatch');
        const deleteBtn = document.getElementById('deleteMatch');
        const startBtn = document.getElementById('startMatch');
        const endBtn = document.getElementById('endMatch');
        const addEventBtn = document.getElementById('addEvent');

        if (!this.match) return;

        // Show/hide buttons based on match status
        const isScheduled = this.match.status === 'SCHEDULED';
        const isOngoing = this.match.status === 'ONGOING';
        const isCompleted = this.match.status === 'COMPLETED';

        if (startBtn) startBtn.style.display = isScheduled ? 'inline-block' : 'none';
        if (endBtn) endBtn.style.display = isOngoing ? 'inline-block' : 'none';
        if (addEventBtn) addEventBtn.style.display = isOngoing ? 'inline-block' : 'none';
        
        // Always show edit and delete for now
        if (editBtn) editBtn.style.display = 'inline-block';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
    }

    // Utility methods
    getEventIcon(eventType) {
        const icons = {
            'GOAL': 'fa-futbol',
            'YELLOW_CARD': 'fa-square',
            'RED_CARD': 'fa-square',
            'SUBSTITUTION': 'fa-exchange-alt',
            'PENALTY': 'fa-bullseye',
            'OWN_GOAL': 'fa-futbol',
            'CORNER': 'fa-flag',
            'OFFSIDE': 'fa-flag'
        };
        return icons[eventType] || 'fa-circle';
    }

    getEventColor(eventType) {
        const colors = {
            'GOAL': 'success',
            'YELLOW_CARD': 'warning',
            'RED_CARD': 'danger',
            'SUBSTITUTION': 'info',
            'PENALTY': 'primary',
            'OWN_GOAL': 'danger',
            'CORNER': 'secondary',
            'OFFSIDE': 'warning'
        };
        return colors[eventType] || 'secondary';
    }

    formatEventType(eventType) {
        const formats = {
            'GOAL': 'Goal',
            'YELLOW_CARD': 'Yellow Card',
            'RED_CARD': 'Red Card',
            'SUBSTITUTION': 'Substitution',
            'PENALTY': 'Penalty',
            'OWN_GOAL': 'Own Goal',
            'CORNER': 'Corner',
            'OFFSIDE': 'Offside'
        };
        return formats[eventType] || eventType;
    }

    showLoadingState() {
        const mainContent = document.querySelector('.match-content');
        if (mainContent) {
            mainContent.style.opacity = '0.6';
            mainContent.style.pointerEvents = 'none';
        }
    }

    hideLoadingState() {
        const mainContent = document.querySelector('.match-content');
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.pointerEvents = 'auto';
        }
    }

    showError(message) {
        const container = document.querySelector('.match-detail-container');
        if (container) {
            container.innerHTML = `
                <div class="container py-5">
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h3>Error Loading Match</h3>
                        <p class="text-muted">${message}</p>
                        <button class="btn btn-primary" onclick="window.location.href='matches.html'">
                            <i class="fas fa-arrow-left"></i> Back to Matches
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.matchDetailHandler = new MatchDetailHandler();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.matchDetailHandler) {
        window.matchDetailHandler.destroy();
    }
});
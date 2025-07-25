/**
 * Enhanced Admin Live Scoring System
 * Redesigned for better UX, streamlined workflows, and intuitive interactions
 */

class EnhancedLiveScoring {
    constructor() {
        this.liveMatches = [];
        this.selectedMatch = null;
        this.updateInterval = null;
        this.websocket = null;
        this.isUserInteracting = false;
        this.autoUpdateEnabled = true;
        this.compactMode = false;
        this.notifications = [];
        
        this.init();
    }

    async init() {
        // Initialize the interface
        this.setupEventListeners();
        this.setupUserInteractionTracking();
        this.setupKeyboardShortcuts();
        this.loadInterface();
        this.setupRealTimeUpdates();
        
        // Load initial data
        await this.loadLiveMatches();
    }

    setupEventListeners() {
        // Main control buttons
        document.getElementById('startLiveMatch')?.addEventListener('click', () => {
            this.showMatchSelector();
        });

        document.getElementById('pauseLiveMatch')?.addEventListener('click', () => {
            this.pauseSelectedMatch();
        });

        document.getElementById('endLiveMatch')?.addEventListener('click', () => {
            this.endSelectedMatch();
        });

        // Settings and view controls
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action]')) {
                this.handleAction(e.target.dataset.action, e.target);
            }
        });
    }

    setupUserInteractionTracking() {
        let interactionTimer;
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.isUserInteracting = true;
                clearTimeout(interactionTimer);
                interactionTimer = setTimeout(() => {
                    this.isUserInteracting = false;
                }, 2000);
            }, { passive: true });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.refreshData();
                        break;
                    case 's':
                        e.preventDefault();
                        this.showMatchSelector();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.pauseSelectedMatch();
                        break;
                }
            }
        });
    }

    loadInterface() {
        const container = document.getElementById('liveScoringContent');
        if (!container) return;

        container.innerHTML = `
            <div class="live-scoring-container">
                <!-- Header Controls -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="d-flex align-items-center">
                        <h4 class="mb-0 me-3">
                            <i class="fas fa-broadcast-tower text-danger me-2"></i>
                            Live Scoring Center
                        </h4>
                        <div class="status-indicator status-live"></div>
                        <span class="small text-muted">Real-time updates active</span>
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn btn-outline-primary btn-sm" data-action="refresh" title="Refresh (Ctrl+R)">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" data-action="toggle-compact" title="Toggle compact view">
                            <i class="fas fa-compress-alt"></i>
                        </button>
                        <button class="btn btn-outline-info btn-sm" data-action="toggle-auto-update" id="autoUpdateBtn" title="Auto-update enabled">
                            <i class="fas fa-pause"></i>
                        </button>
                    </div>
                </div>

                <!-- Live Statistics Overview -->
                <div class="live-stats-grid" id="liveStatsGrid">
                    <!-- Stats will be populated here -->
                </div>

                <!-- Main Content Grid -->
                <div class="row">
                    <!-- Live Matches Column -->
                    <div class="col-lg-8">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">
                                <i class="fas fa-futbol me-2"></i>
                                Live Matches <span class="badge bg-danger" id="liveMatchCount">0</span>
                            </h5>
                            <button class="btn btn-success btn-sm" data-action="start-match" title="Start new match (Ctrl+S)">
                                <i class="fas fa-plus me-1"></i> Start Match
                            </button>
                        </div>
                        
                        <div id="liveMatchesContainer" class="mb-4">
                            <!-- Live matches will be populated here -->
                        </div>

                        <!-- Selected Match Control Panel -->
                        <div id="matchControlPanel" class="control-panel" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0 text-white">
                                    <i class="fas fa-gamepad me-2"></i>
                                    Match Control
                                </h5>
                                <button class="btn btn-outline-light btn-sm" data-action="close-control">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div id="controlPanelContent">
                                <!-- Control panel content will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="col-lg-4">
                        <!-- Quick Actions -->
                        <div class="stats-widget">
                            <h6 class="fw-bold mb-3">
                                <i class="fas fa-bolt me-2"></i>
                                Quick Actions
                            </h6>
                            <div class="d-grid gap-2">
                                <button class="quick-action-btn btn btn-success" data-action="quick-goal">
                                    <i class="fas fa-bullseye me-2"></i> Add Goal
                                </button>
                                <button class="quick-action-btn btn btn-warning" data-action="quick-yellow">
                                    <i class="fas fa-square me-2"></i> Yellow Card
                                </button>
                                <button class="quick-action-btn btn btn-danger" data-action="quick-red">
                                    <i class="fas fa-square me-2"></i> Red Card
                                </button>
                                <button class="quick-action-btn btn btn-info" data-action="quick-substitution">
                                    <i class="fas fa-exchange-alt me-2"></i> Substitution
                                </button>
                            </div>
                        </div>

                        <!-- Scheduled Matches -->
                        <div class="stats-widget">
                            <h6 class="fw-bold mb-3">
                                <i class="fas fa-clock me-2"></i>
                                Upcoming Matches
                            </h6>
                            <div id="scheduledMatchesList">
                                <!-- Scheduled matches will be populated here -->
                            </div>
                        </div>

                        <!-- Live Statistics -->
                        <div class="stats-widget">
                            <h6 class="fw-bold mb-3">
                                <i class="fas fa-chart-line me-2"></i>
                                Session Statistics
                            </h6>
                            <div id="sessionStats">
                                <!-- Session stats will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Floating Action Button for Mobile -->
            <div class="floating-controls d-lg-none">
                <button class="floating-btn btn btn-success" data-action="start-match" title="Start Match">
                    <i class="fas fa-play"></i>
                </button>
            </div>

            <!-- Notification Container -->
            <div id="notificationContainer" class="notification-toast"></div>
        `;

        // Load CSS if not already loaded
        if (!document.querySelector('link[href*="live-scoring.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'styles/live-scoring.css';
            document.head.appendChild(link);
        }
    }

    async loadLiveMatches() {
        try {
            this.showLoadingState('liveMatchesContainer');

            const [liveResponse, scheduledResponse] = await Promise.all([
                apiClient.getMatches({ status: 'LIVE' }),
                apiClient.getMatches({ status: 'SCHEDULED', limit: 5 })
            ]);

            this.liveMatches = liveResponse.success ? liveResponse.data.matches : [];
            const scheduledMatches = scheduledResponse.success ? scheduledResponse.data.matches : [];

            this.renderLiveMatches();
            this.renderScheduledMatches(scheduledMatches);
            this.updateStatistics();
            this.hideLoadingState('liveMatchesContainer');

        } catch (error) {
            console.error('Error loading matches:', error);
            this.showNotification('Failed to load matches', 'error');
            this.hideLoadingState('liveMatchesContainer');
        }
    }

    renderLiveMatches() {
        const container = document.getElementById('liveMatchesContainer');
        const countBadge = document.getElementById('liveMatchCount');
        
        if (countBadge) {
            countBadge.textContent = this.liveMatches.length;
        }

        if (!container) return;

        if (this.liveMatches.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-futbol fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No Live Matches</h5>
                    <p class="text-muted mb-3">Start a scheduled match to begin live scoring</p>
                    <button class="btn btn-primary" data-action="start-match">
                        <i class="fas fa-play me-2"></i> Start Your First Match
                    </button>
                </div>
            `;
            return;
        }

        const matchesHTML = this.liveMatches.map(match => this.renderLiveMatchCard(match)).join('');
        container.innerHTML = matchesHTML;
    }

    renderLiveMatchCard(match) {
        const liveData = match.liveData || {};
        const currentMinute = liveData.currentMinute || 0;
        const additionalTime = liveData.additionalTime || 0;
        const isSelected = this.selectedMatch && this.selectedMatch.id === match.id;

        return `
            <div class="live-match-card card ${isSelected ? 'border-primary' : ''} fade-in" data-match-id="${match.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <!-- Match Header -->
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="d-flex align-items-center">
                                    <span class="live-indicator badge bg-danger me-2">LIVE</span>
                                    <span class="match-time">${currentMinute}'${additionalTime > 0 ? `+${additionalTime}` : ''}</span>
                                </div>
                                <small class="text-muted">
                                    <i class="fas fa-map-marker-alt me-1"></i>
                                    ${match.venue || 'Unknown Venue'}
                                </small>
                            </div>
                            
                            <!-- Teams and Score -->
                            <div class="row align-items-center">
                                <div class="col-4 text-center">
                                    <img src="${match.homeTeam.logoUrl || '/images/default-team-logo.png'}" 
                                         alt="${match.homeTeam.name}" class="team-logo mb-2">
                                    <div class="fw-bold small">${match.homeTeam.shortName || match.homeTeam.name}</div>
                                </div>
                                
                                <div class="col-4 text-center">
                                    <div class="match-score">${match.homeScore} - ${match.awayScore}</div>
                                </div>
                                
                                <div class="col-4 text-center">
                                    <img src="${match.awayTeam.logoUrl || '/images/default-team-logo.png'}" 
                                         alt="${match.awayTeam.name}" class="team-logo mb-2">
                                    <div class="fw-bold small">${match.awayTeam.shortName || match.awayTeam.name}</div>
                                </div>
                            </div>

                            <!-- Match Statistics -->
                            <div class="row mt-3 small">
                                <div class="col-6">
                                    <div class="d-flex justify-content-between">
                                        <span>Possession</span>
                                        <span>${liveData.possessionHome || 50}% - ${liveData.possessionAway || 50}%</span>
                                    </div>
                                    <div class="progress mt-1" style="height: 4px;">
                                        <div class="progress-bar bg-primary" style="width: ${liveData.possessionHome || 50}%"></div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="d-flex justify-content-between">
                                        <span>Shots</span>
                                        <span>${liveData.shotsHome || 0} - ${liveData.shotsAway || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4 text-end">
                            <div class="btn-group-vertical d-grid gap-2">
                                <button class="btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'} btn-sm" 
                                        data-action="select-match" data-match-id="${match.id}">
                                    <i class="fas fa-gamepad me-1"></i> 
                                    ${isSelected ? 'Controlling' : 'Control'}
                                </button>
                                <button class="btn btn-outline-secondary btn-sm" 
                                        data-action="view-stats" data-match-id="${match.id}">
                                    <i class="fas fa-chart-line me-1"></i> Stats
                                </button>
                                <button class="btn btn-outline-warning btn-sm" 
                                        data-action="pause-match" data-match-id="${match.id}">
                                    <i class="fas fa-pause me-1"></i> Pause
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderScheduledMatches(matches) {
        const container = document.getElementById('scheduledMatchesList');
        if (!container) return;

        if (matches.length === 0) {
            container.innerHTML = '<p class="text-muted small">No upcoming matches</p>';
            return;
        }

        const matchesHTML = matches.map(match => {
            const timeUntil = FumaUtils.date.timeUntil(match.matchDate);
            return `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                        <div class="fw-bold small">${match.homeTeam.shortName} vs ${match.awayTeam.shortName}</div>
                        <div class="text-muted small">
                            <i class="fas fa-clock me-1"></i>
                            ${FumaUtils.date.format(match.matchDate, 'DD/MM HH:mm')}
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="badge bg-warning text-dark small">${timeUntil}</div>
                        <button class="btn btn-success btn-sm mt-1" 
                                data-action="start-scheduled" data-match-id="${match.id}">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = matchesHTML;
    }

    updateStatistics() {
        // Update live statistics grid
        const statsGrid = document.getElementById('liveStatsGrid');
        if (!statsGrid) return;

        const totalGoals = this.liveMatches.reduce((sum, match) => sum + match.homeScore + match.awayScore, 0);
        const avgGoalsPerMatch = this.liveMatches.length > 0 ? (totalGoals / this.liveMatches.length).toFixed(1) : 0;

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value text-danger">${this.liveMatches.length}</div>
                <div class="stat-label">Live Matches</div>
            </div>
            <div class="stat-card">
                <div class="stat-value text-success">${totalGoals}</div>
                <div class="stat-label">Total Goals</div>
            </div>
            <div class="stat-card">
                <div class="stat-value text-info">${avgGoalsPerMatch}</div>
                <div class="stat-label">Avg Goals/Match</div>
            </div>
            <div class="stat-card">
                <div class="stat-value text-warning">${this.getActiveEventsCount()}</div>
                <div class="stat-label">Recent Events</div>
            </div>
        `;

        // Update session statistics
        this.updateSessionStats();
    }

    updateSessionStats() {
        const container = document.getElementById('sessionStats');
        if (!container) return;

        const lastUpdate = new Date().toLocaleTimeString();
        
        container.innerHTML = `
            <div class="stats-item">
                <span>Auto-update</span>
                <span class="badge ${this.autoUpdateEnabled ? 'bg-success' : 'bg-warning'}">
                    ${this.autoUpdateEnabled ? 'ON' : 'OFF'}
                </span>
            </div>
            <div class="stats-item">
                <span>Last update</span>
                <span class="small text-muted">${lastUpdate}</span>
            </div>
            <div class="stats-item">
                <span>Connection</span>
                <span class="badge bg-success">Online</span>
            </div>
        `;
    }

    async handleAction(action, element) {
        switch (action) {
            case 'refresh':
                await this.refreshData();
                break;
            case 'toggle-compact':
                this.toggleCompactMode();
                break;
            case 'toggle-auto-update':
                this.toggleAutoUpdate();
                break;
            case 'start-match':
                this.showMatchSelector();
                break;
            case 'select-match':
                await this.selectMatch(parseInt(element.dataset.matchId));
                break;
            case 'pause-match':
                await this.pauseMatch(parseInt(element.dataset.matchId));
                break;
            case 'start-scheduled':
                await this.startScheduledMatch(parseInt(element.dataset.matchId));
                break;
            case 'close-control':
                this.closeControlPanel();
                break;
            case 'quick-goal':
            case 'quick-yellow':
            case 'quick-red':
            case 'quick-substitution':
                this.handleQuickAction(action);
                break;
        }
    }

    async selectMatch(matchId) {
        try {
            this.showLoadingState('matchControlPanel');
            
            const response = await apiClient.getLiveMatch(matchId);
            if (response.success) {
                
                this.selectedMatch = response.data.liveData.match;
                this.showControlPanel();
                this.renderLiveMatches(); // Refresh to show selection
                this.showNotification(`Now controlling ${this.selectedMatch.homeTeam.shortName} vs ${this.selectedMatch.awayTeam.shortName}`, 'success');
            }
        } catch (error) {
            console.error('Error selecting match:', error);
            this.showNotification('Failed to load match control', 'error');
        } finally {
            this.hideLoadingState('matchControlPanel');
        }
    }

    showControlPanel() {
        if (!this.selectedMatch) return;

        const panel = document.getElementById('matchControlPanel');
        const content = document.getElementById('controlPanelContent');
        
        if (!panel || !content) return;

        const match = this.selectedMatch;
        const liveData = match.liveData || {};

        content.innerHTML = `
            <div class="row">
                <!-- Time and Score Control -->
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0 text-dark">
                                <i class="fas fa-clock me-2"></i>
                                Time Control
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6">
                                    <label class="form-label">Minute</label>
                                    <input type="number" class="form-control" id="currentMinute" 
                                           value="${liveData.currentMinute || 0}" min="0" max="120">
                                </div>
                                <div class="col-6">
                                    <label class="form-label">+Time</label>
                                    <input type="number" class="form-control" id="additionalTime" 
                                           value="${liveData.additionalTime || 0}" min="0" max="15">
                                </div>
                            </div>
                            <button class="btn btn-primary w-100 mt-2" data-action="update-time">
                                <i class="fas fa-clock me-1"></i> Update Time
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Score Control -->
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0 text-dark">
                                <i class="fas fa-futbol me-2"></i>
                                Score Control
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6 score-control">
                                    <div class="fw-bold">${match.homeTeam.shortName}</div>
                                    <div class="score-display text-primary">${match.homeScore}</div>
                                    <div>
                                        <button class="score-btn btn btn-success" data-action="add-goal" data-team="home">+</button>
                                        <button class="score-btn btn btn-outline-danger" data-action="remove-goal" data-team="home">-</button>
                                    </div>
                                </div>
                                <div class="col-6 score-control">
                                    <div class="fw-bold">${match.awayTeam.shortName}</div>
                                    <div class="score-display text-primary">${match.awayScore}</div>
                                    <div>
                                        <button class="score-btn btn btn-success" data-action="add-goal" data-team="away">+</button>
                                        <button class="score-btn btn btn-outline-danger" data-action="remove-goal" data-team="away">-</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Event Form -->
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0 text-dark">
                        <i class="fas fa-plus-circle me-2"></i>
                        Add Match Event
                    </h6>
                </div>
                <div class="card-body">
                    <form id="quickEventForm" class="row">
                        <div class="col-md-3">
                            <select class="form-select" id="eventType" required>
                                <option value="">Event Type</option>
                                <option value="GOAL">Goal</option>
                                <option value="YELLOW_CARD">Yellow Card</option>
                                <option value="RED_CARD">Red Card</option>
                                <option value="SUBSTITUTION">Substitution</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" id="eventTeam" required>
                                <option value="">Team</option>
                                <option value="${match.homeTeam.id}">${match.homeTeam.shortName}</option>
                                <option value="${match.awayTeam.id}">${match.awayTeam.shortName}</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <input type="number" class="form-control" id="eventMinute" 
                                   placeholder="Min" value="${liveData.currentMinute || 0}" min="0" max="120" required>
                        </div>
                        <div class="col-md-2">
                            <select class="form-select" id="eventPlayer">
                                <option value="">Player</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-plus"></i> Add
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Recent Events -->
            <div class="card mt-3">
                <div class="card-header">
                    <h6 class="mb-0 text-dark">
                        <i class="fas fa-history me-2"></i>
                        Match Timeline
                    </h6>
                </div>
                <div class="card-body">
                    <div id="matchTimeline" class="event-timeline">
                        <!-- Events will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        panel.style.display = 'block';
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Setup event handlers
        this.setupControlPanelEvents();
        this.loadMatchEvents();
    }

    setupControlPanelEvents() {
        // Score control buttons
        document.querySelectorAll('[data-action="add-goal"], [data-action="remove-goal"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const team = e.target.dataset.team;
                const isAdd = e.target.dataset.action === 'add-goal';
                this.updateScore(team, isAdd);
            });
        });

        // Time update button
        document.querySelector('[data-action="update-time"]')?.addEventListener('click', () => {
            this.updateMatchTime();
        });

        // Quick event form
        document.getElementById('quickEventForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addQuickEvent();
        });

        // Team change handler for player loading
        document.getElementById('eventTeam')?.addEventListener('change', (e) => {
            this.loadTeamPlayers(e.target.value);
        });
    }

    async updateScore(team, isAdd) {
        if (!this.selectedMatch) return;

        try {
            const isHome = team === 'home';
            const currentScore = isHome ? this.selectedMatch.homeScore : this.selectedMatch.awayScore;
            const newScore = isAdd ? currentScore + 1 : Math.max(0, currentScore - 1);
            
            const updateData = isHome ? { homeScore: newScore } : { awayScore: newScore };
            
            const response = await apiClient.updateMatch(this.selectedMatch.id, updateData);
            
            if (response.success) {
                // Update local data
                if (isHome) {
                    this.selectedMatch.homeScore = newScore;
                } else {
                    this.selectedMatch.awayScore = newScore;
                }
                
                this.showControlPanel(); // Refresh control panel
                this.renderLiveMatches(); // Refresh matches display
                this.showNotification(`Score updated: ${this.selectedMatch.homeScore} - ${this.selectedMatch.awayScore}`, 'success');
            }
        } catch (error) {
            console.error('Error updating score:', error);
            this.showNotification('Failed to update score', 'error');
        }
    }

    async updateMatchTime() {
        if (!this.selectedMatch) return;

        try {
            const currentMinute = parseInt(document.getElementById('currentMinute').value);
            const additionalTime = parseInt(document.getElementById('additionalTime').value);

            const response = await apiClient.updateLiveMatch(this.selectedMatch.id, {
                currentMinute,
                additionalTime
            });

            if (response.success) {
                this.selectedMatch.liveData = { ...this.selectedMatch.liveData, currentMinute, additionalTime };
                this.renderLiveMatches();
                this.showNotification(`Time updated: ${currentMinute}'${additionalTime > 0 ? `+${additionalTime}` : ''}`, 'success');
            }
        } catch (error) {
            console.error('Error updating time:', error);
            this.showNotification('Failed to update match time', 'error');
        }
    }

    async addQuickEvent() {
        if (!this.selectedMatch) return;

        try {
            const teamElement = document.getElementById('eventTeam');
            const eventTypeElement = document.getElementById('eventType');
            const minuteElement = document.getElementById('eventMinute');
            const playerElement = document.getElementById('eventPlayer');

            // Validate required fields
            if (!teamElement.value) {
                this.showNotification('Please select a team', 'error');
                return;
            }

            if (!eventTypeElement.value) {
                this.showNotification('Please select an event type', 'error');
                return;
            }

            if (!minuteElement.value) {
                this.showNotification('Please enter the minute', 'error');
                return;
            }

            const eventData = {
                matchId: this.selectedMatch.id,
                teamId: parseInt(teamElement.value),
                eventType: eventTypeElement.value,
                minute: parseInt(minuteElement.value),
                playerId: playerElement.value ? parseInt(playerElement.value) : null
            };

            const response = await apiClient.addMatchEvent(this.selectedMatch.id, eventData);
            
            if (response.success) {
                document.getElementById('quickEventForm').reset();
                // Reset player dropdown
                const playerSelect = document.getElementById('eventPlayer');
                if (playerSelect) {
                    playerSelect.innerHTML = '<option value="">Player</option>';
                }
                this.loadMatchEvents();
                this.showNotification(`${eventData.eventType.replace('_', ' ')} added`, 'success');
            }
        } catch (error) {
            console.error('Error adding event:', error);
            this.showNotification('Failed to add event', 'error');
        }
    }

    async loadTeamPlayers(teamId) {
        if (!teamId) {
            const playerSelect = document.getElementById('eventPlayer');
            if (playerSelect) {
                playerSelect.innerHTML = '<option value="">Player</option>';
            }
            return;
        }

        try {
            const response = await apiClient.getTeam(teamId);
            if (response.success) {
                const playerSelect = document.getElementById('eventPlayer');
                if (playerSelect) {
                    playerSelect.innerHTML = '<option value="">Select Player</option>';
                    
                    response.data.team.players.forEach(player => {
                        const option = document.createElement('option');
                        option.value = player.id;
                        option.textContent = `${player.jerseyNumber || 'N/A'} - ${player.firstName} ${player.lastName}`;
                        playerSelect.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading team players:', error);
            this.showNotification('Failed to load players', 'error');
        }
    }

    async loadMatchEvents() {
        if (!this.selectedMatch) return;

        try {
            const response = await apiClient.get(`/matches/${this.selectedMatch.id}/events`);
            if (response.success) {
                this.renderMatchTimeline(response.data.events || []);
            }
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    renderMatchTimeline(events) {
        const timeline = document.getElementById('matchTimeline');
        if (!timeline) return;

        if (events.length === 0) {
            timeline.innerHTML = '<p class="text-muted">No events yet</p>';
            return;
        }

        const eventsHTML = events.map(event => `
            <div class="event-item event-${event.eventType.toLowerCase().replace('_', '-')}">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${event.minute}'</strong>
                        <span class="ms-2">${this.getEventIcon(event.eventType)} ${this.getEventLabel(event.eventType)}</span>
                        ${event.playerName ? `<br><small class="text-muted">${event.playerName}</small>` : ''}
                    </div>
                    <span class="badge bg-light text-dark">${event.team?.shortName || 'Unknown'}</span>
                </div>
            </div>
        `).join('');

        timeline.innerHTML = eventsHTML;
    }

    getEventIcon(eventType) {
        const icons = {
            'GOAL': '<i class="fas fa-bullseye text-success"></i>',
            'YELLOW_CARD': '<i class="fas fa-square text-warning"></i>',
            'RED_CARD': '<i class="fas fa-square text-danger"></i>',
            'SUBSTITUTION': '<i class="fas fa-exchange-alt text-info"></i>'
        };
        return icons[eventType] || '<i class="fas fa-info-circle"></i>';
    }

    getEventLabel(eventType) {
        const labels = {
            'GOAL': 'Goal',
            'YELLOW_CARD': 'Yellow Card',
            'RED_CARD': 'Red Card',
            'SUBSTITUTION': 'Substitution'
        };
        return labels[eventType] || eventType;
    }

    toggleAutoUpdate() {
        this.autoUpdateEnabled = !this.autoUpdateEnabled;
        const btn = document.getElementById('autoUpdateBtn');
        
        if (this.autoUpdateEnabled) {
            btn.innerHTML = '<i class="fas fa-pause"></i>';
            btn.title = 'Auto-update enabled';
            btn.className = 'btn btn-outline-info btn-sm';
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i>';
            btn.title = 'Auto-update disabled';
            btn.className = 'btn btn-outline-warning btn-sm';
        }
        
        this.updateSessionStats();
        this.showNotification(`Auto-update ${this.autoUpdateEnabled ? 'enabled' : 'disabled'}`, 'info');
    }

    toggleCompactMode() {
        this.compactMode = !this.compactMode;
        const container = document.querySelector('.live-scoring-container');
        
        if (this.compactMode) {
            container.classList.add('compact-mode');
        } else {
            container.classList.remove('compact-mode');
        }
        
        this.showNotification(`${this.compactMode ? 'Compact' : 'Normal'} view enabled`, 'info');
    }

    async refreshData() {
        this.showNotification('Refreshing data...', 'info');
        await this.loadLiveMatches();
        this.showNotification('Data refreshed', 'success');
    }

    // Backward compatibility method for admin dashboard
    async updateLiveData() {
        // This method exists for backward compatibility with admin-dashboard.js
        // It calls the equivalent method in the enhanced system
        await this.loadLiveMatches();
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const id = Date.now();
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';

        const notification = document.createElement('div');
        notification.className = `alert ${alertClass} alert-dismissible fade show slide-up`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    showLoadingState(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.opacity = '0.6';
            element.style.pointerEvents = 'none';
        }
    }

    hideLoadingState(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.opacity = '1';
            element.style.pointerEvents = 'auto';
        }
    }

    getActiveEventsCount() {
        // Count total events across all live matches
        if (!this.liveMatches || this.liveMatches.length === 0) {
            return 0;
        }
        
        return this.liveMatches.reduce((total, match) => {
            // Use event count from API response if available, otherwise default to 0
            const eventCount = match._count?.events || 0;
            return total + eventCount;
        }, 0);
    }

    setupRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            if (this.autoUpdateEnabled && this.liveMatches.length > 0 && !this.isUserInteracting) {
                this.loadLiveMatches();
            }
        }, 30000); // 30 seconds
    }

    closeControlPanel() {
        const panel = document.getElementById('matchControlPanel');
        if (panel) {
            panel.style.display = 'none';
        }
        this.selectedMatch = null;
        this.renderLiveMatches(); // Refresh to remove selection highlight
    }

    showMatchSelector() {
        this.showNotification('Match selector feature coming soon', 'info');
    }

    handleQuickAction(action) {
        if (!this.selectedMatch) {
            this.showNotification('Please select a match first', 'warning');
            return;
        }

        const eventTypes = {
            'quick-goal': 'GOAL',
            'quick-yellow': 'YELLOW_CARD',
            'quick-red': 'RED_CARD',
            'quick-substitution': 'SUBSTITUTION'
        };

        const eventType = eventTypes[action];
        if (eventType) {
            const eventTypeSelect = document.getElementById('eventType');
            if (eventTypeSelect) {
                eventTypeSelect.value = eventType;
                document.getElementById('matchControlPanel')?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the live scoring section
    if (document.getElementById('liveScoringContent')) {
        window.adminLiveScoring = new EnhancedLiveScoring();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.adminLiveScoring) {
        window.adminLiveScoring.destroy();
    }
});
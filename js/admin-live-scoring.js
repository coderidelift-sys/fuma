/**
 * Admin Live Scoring System
 * Handles real-time match scoring, events, and statistics updates
 */

class AdminLiveScoring {
    constructor() {
        this.liveMatches = [];
        this.selectedMatch = null;
        this.updateInterval = null;
        this.websocket = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadLiveMatches();
        this.setupRealTimeConnection();
    }

    setupEventListeners() {
        // Match control buttons
        document.getElementById('startLiveMatch')?.addEventListener('click', () => {
            this.showStartMatchModal();
        });

        document.getElementById('pauseLiveMatch')?.addEventListener('click', () => {
            this.pauseMatch();
        });

        document.getElementById('endLiveMatch')?.addEventListener('click', () => {
            this.endMatch();
        });
    }

    async loadLiveMatches() {
        try {
            FumaUtils.ui.showLoading('liveScoringContent', 'Loading live matches...');

            // Get scheduled and live matches
            const [liveResponse, scheduledResponse] = await Promise.all([
                apiClient.getMatches({ status: 'LIVE' }),
                apiClient.getMatches({ status: 'SCHEDULED', limit: 10 })
            ]);

            this.liveMatches = [];
            
            if (liveResponse.success) {
                this.liveMatches.push(...liveResponse.data.matches);
            }

            this.renderLiveScoringInterface(
                this.liveMatches,
                scheduledResponse.success ? scheduledResponse.data.matches : []
            );

        } catch (error) {
            console.error('Error loading live matches:', error);
            FumaUtils.ui.showError('liveScoringContent', 'Failed to load live matches: ' + error.message);
        }
    }

    renderLiveScoringInterface(liveMatches, scheduledMatches) {
        const container = document.getElementById('liveScoringContent');
        if (!container) return;

        const interfaceHTML = `
            <div class="row">
                <!-- Live Matches Column -->
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">
                                <i class="fas fa-broadcast-tower text-danger me-2"></i>
                                Live Matches (${liveMatches.length})
                            </h6>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="window.adminLiveScoring.loadLiveMatches()">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            ${liveMatches.length === 0 ? `
                                <div class="text-center py-5">
                                    <i class="fas fa-futbol fa-3x text-muted mb-3"></i>
                                    <h5 class="text-muted">No Live Matches</h5>
                                    <p class="text-muted">Start a scheduled match to begin live scoring.</p>
                                </div>
                            ` : liveMatches.map(match => this.renderLiveMatchCard(match)).join('')}
                        </div>
                    </div>

                    <!-- Match Control Panel -->
                    <div id="matchControlPanel" class="card mt-4" style="display: none;">
                        <div class="card-header">
                            <h6 class="mb-0">
                                <i class="fas fa-gamepad me-2"></i>
                                Match Control
                            </h6>
                        </div>
                        <div class="card-body">
                            <div id="matchControlContent">
                                <!-- Match control interface will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Scheduled Matches & Quick Actions -->
                <div class="col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">
                                <i class="fas fa-clock me-2"></i>
                                Scheduled Matches
                            </h6>
                        </div>
                        <div class="card-body">
                            ${scheduledMatches.length === 0 ? `
                                <p class="text-muted">No scheduled matches</p>
                            ` : scheduledMatches.map(match => this.renderScheduledMatchCard(match)).join('')}
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="card mt-4">
                        <div class="card-header">
                            <h6 class="mb-0">
                                <i class="fas fa-chart-bar me-2"></i>
                                Live Statistics
                            </h6>
                        </div>
                        <div class="card-body">
                            <div id="liveStats">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Active Matches:</span>
                                    <span class="badge bg-danger">${liveMatches.length}</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Total Goals:</span>
                                    <span class="badge bg-success" id="totalGoals">0</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Total Cards:</span>
                                    <span class="badge bg-warning" id="totalCards">0</span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span>Last Update:</span>
                                    <span class="text-muted" id="lastUpdate">--</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Event Templates -->
                    <div class="card mt-4">
                        <div class="card-header">
                            <h6 class="mb-0">
                                <i class="fas fa-plus-circle me-2"></i>
                                Quick Events
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <button class="btn btn-success btn-sm" onclick="window.adminLiveScoring.quickEvent('GOAL')">
                                    <i class="fas fa-bullseye me-1"></i> Goal
                                </button>
                                <button class="btn btn-warning btn-sm" onclick="window.adminLiveScoring.quickEvent('YELLOW_CARD')">
                                    <i class="fas fa-square me-1"></i> Yellow Card
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="window.adminLiveScoring.quickEvent('RED_CARD')">
                                    <i class="fas fa-square me-1"></i> Red Card
                                </button>
                                <button class="btn btn-info btn-sm" onclick="window.adminLiveScoring.quickEvent('SUBSTITUTION')">
                                    <i class="fas fa-exchange-alt me-1"></i> Substitution
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = interfaceHTML;
        this.updateLiveStats();
    }

    renderLiveMatchCard(match) {
        const liveData = match.liveData || {};
        const currentMinute = liveData.currentMinute || 0;
        const additionalTime = liveData.additionalTime || 0;

        return `
            <div class="live-match-card card mb-3" data-match-id="${match.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="d-flex align-items-center">
                                    <span class="live-indicator badge bg-danger me-2">LIVE</span>
                                    <span class="match-time">${currentMinute}'${additionalTime > 0 ? `+${additionalTime}` : ''}</span>
                                </div>
                                <small class="text-muted">${match.venue || 'Unknown Venue'}</small>
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="team-info">
                                    <img style="width: 100px;" src="${match.homeTeam.logoUrl || '/images/default-team-logo.png'}" 
                                         alt="${match.homeTeam.name}" 
                                         class="team-logo me-2">
                                    <span class="fw-bold">${match.homeTeam.name}</span>
                                </div>
                                
                                <div class="score-display mx-3">
                                    ${match.homeScore} - ${match.awayScore}
                                </div>
                                
                                <div class="team-info text-end">
                                    <span class="fw-bold">${match.awayTeam.name}</span>
                                    <img style="width: 100px;" src="${match.awayTeam.logoUrl || '/images/default-team-logo.png'}" 
                                         alt="${match.awayTeam.name}" 
                                         class="team-logo ms-2">
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4 text-end">
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-primary" 
                                        onclick="window.adminLiveScoring.selectMatch(${match.id})">
                                    <i class="fas fa-gamepad me-1"></i> Control
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" 
                                        onclick="window.adminLiveScoring.viewMatchStats(${match.id})">
                                    <i class="fas fa-chart-line me-1"></i> Stats
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Live Statistics Bar -->
                    <div class="row mt-3">
                        <div class="col-6">
                            <div class="d-flex justify-content-between small">
                                <span>Possession</span>
                                <span>${liveData.possessionHome || 50}%</span>
                            </div>
                            <div class="progress" style="height: 4px;">
                                <div class="progress-bar" style="width: ${liveData.possessionHome || 50}%"></div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="d-flex justify-content-between small">
                                <span>Shots</span>
                                <span>${liveData.shotsHome || 0} - ${liveData.shotsAway || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderScheduledMatchCard(match) {
        const matchTime = FumaUtils.date.timeUntil(match.matchDate);
        
        return `
            <div class="card mb-2">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <small class="text-muted">${FumaUtils.date.format(match.matchDate, 'DD/MM HH:mm')}</small>
                        <span class="badge bg-warning text-dark">${matchTime}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="team-info small">
                            <div>${match.homeTeam.shortName}</div>
                            <div class="text-muted">vs</div>
                            <div>${match.awayTeam.shortName}</div>
                        </div>
                        <button class="btn btn-sm btn-success" 
                                onclick="window.adminLiveScoring.startMatch(${match.id})">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async selectMatch(matchId) {
        try {
            const response = await apiClient.getLiveMatch(matchId);
            if (response.success) {
                this.selectedMatch = response.data.match;
                this.showMatchControlPanel();
            }
        } catch (error) {
            console.error('Error selecting match:', error);
            FumaUtils.ui.showToast('Error loading match: ' + error.message, 'danger');
        }
    }

    showMatchControlPanel() {
        if (!this.selectedMatch) return;

        const panel = document.getElementById('matchControlPanel');
        const content = document.getElementById('matchControlContent');
        
        if (!panel || !content) return;

        const controlHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="fw-bold mb-3">
                        ${this.selectedMatch.homeTeam.name} vs ${this.selectedMatch.awayTeam.name}
                    </h6>
                    
                    <!-- Time Control -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0">Time Control</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6">
                                    <label class="form-label">Minute</label>
                                    <input type="number" class="form-control" id="currentMinute" 
                                           value="${this.selectedMatch.liveData?.currentMinute || 0}" min="0" max="120">
                                </div>
                                <div class="col-6">
                                    <label class="form-label">Additional Time</label>
                                    <input type="number" class="form-control" id="additionalTime" 
                                           value="${this.selectedMatch.liveData?.additionalTime || 0}" min="0" max="10">
                                </div>
                            </div>
                            <button class="btn btn-primary btn-sm mt-2 w-100" onclick="window.adminLiveScoring.updateMatchTime()">
                                Update Time
                            </button>
                        </div>
                    </div>

                    <!-- Score Control -->
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Score Control</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6 text-center">
                                    <div class="fw-bold">${this.selectedMatch.homeTeam.shortName}</div>
                                    <div class="score-display">${this.selectedMatch.homeScore}</div>
                                    <div class="btn-group mt-2" role="group">
                                        <button class="btn btn-sm btn-success" onclick="window.adminLiveScoring.addGoal('home')">+</button>
                                        <button class="btn btn-sm btn-danger" onclick="window.adminLiveScoring.removeGoal('home')">-</button>
                                    </div>
                                </div>
                                <div class="col-6 text-center">
                                    <div class="fw-bold">${this.selectedMatch.awayTeam.shortName}</div>
                                    <div class="score-display">${this.selectedMatch.awayScore}</div>
                                    <div class="btn-group mt-2" role="group">
                                        <button class="btn btn-sm btn-success" onclick="window.adminLiveScoring.addGoal('away')">+</button>
                                        <button class="btn btn-sm btn-danger" onclick="window.adminLiveScoring.removeGoal('away')">-</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <!-- Event Form -->
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Add Event</h6>
                        </div>
                        <div class="card-body">
                            <form id="eventForm">
                                <div class="mb-3">
                                    <label class="form-label">Event Type</label>
                                    <select class="form-select" id="eventType" required>
                                        <option value="">Select Event</option>
                                        <option value="GOAL">Goal</option>
                                        <option value="YELLOW_CARD">Yellow Card</option>
                                        <option value="RED_CARD">Red Card</option>
                                        <option value="SUBSTITUTION_IN">Substitution In</option>
                                        <option value="SUBSTITUTION_OUT">Substitution Out</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Team</label>
                                    <select class="form-select" id="eventTeam" required>
                                        <option value="">Select Team</option>
                                        <option value="${this.selectedMatch.homeTeamId}">${this.selectedMatch.homeTeam.name}</option>
                                        <option value="${this.selectedMatch.awayTeamId}">${this.selectedMatch.awayTeam.name}</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Player</label>
                                    <select class="form-select" id="eventPlayer">
                                        <option value="">Select Player</option>
                                    </select>
                                </div>
                                
                                <div class="row">
                                    <div class="col-6">
                                        <label class="form-label">Minute</label>
                                        <input type="number" class="form-control" id="eventMinute" 
                                               value="${this.selectedMatch.liveData?.currentMinute || 0}" min="0" max="120" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label">Additional Time</label>
                                        <input type="number" class="form-control" id="eventAdditionalTime" 
                                               value="0" min="0" max="10">
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" id="eventDescription" rows="2" 
                                              placeholder="Optional event description"></textarea>
                                </div>
                                
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="fas fa-plus me-1"></i> Add Event
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Match Events Timeline -->
            <div class="card mt-4">
                <div class="card-header">
                    <h6 class="mb-0">Match Events</h6>
                </div>
                <div class="card-body">
                    <div id="matchEventsTimeline">
                        <!-- Events will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        content.innerHTML = controlHTML;
        panel.style.display = 'block';

        // Setup event form
        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMatchEvent();
        });

        // Setup team change handler for player loading
        document.getElementById('eventTeam').addEventListener('change', (e) => {
            this.loadTeamPlayers(e.target.value);
        });

        // Load match events
        this.loadMatchEvents();
    }

    async loadTeamPlayers(teamId) {
        if (!teamId) return;

        try {
            const response = await apiClient.getTeam(teamId);
            if (response.success) {
                const playerSelect = document.getElementById('eventPlayer');
                playerSelect.innerHTML = '<option value="">Select Player</option>';
                
                response.data.team.players.forEach(player => {
                    const option = document.createElement('option');
                    option.value = player.id;
                    option.textContent = `${player.jerseyNumber || 'N/A'} - ${player.firstName} ${player.lastName}`;
                    playerSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading team players:', error);
        }
    }

    async addMatchEvent() {
        if (!this.selectedMatch) return;

        try {
            const eventData = {
                matchId: this.selectedMatch.id,
                teamId: parseInt(document.getElementById('eventTeam').value),
                playerId: parseInt(document.getElementById('eventPlayer').value) || null,
                eventType: document.getElementById('eventType').value,
                minute: parseInt(document.getElementById('eventMinute').value),
                additionalTime: parseInt(document.getElementById('eventAdditionalTime').value) || 0,
                description: document.getElementById('eventDescription').value.trim() || null
            };

            const response = await apiClient.addMatchEvent(this.selectedMatch.id, eventData);
            
            if (response.success) {
                // Reset form
                document.getElementById('eventForm').reset();
                
                // Reload match events
                await this.loadMatchEvents();
                
                // Update live data
                await this.updateLiveData();
                
                FumaUtils.ui.showToast('Event added successfully', 'success');
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error adding match event:', error);
            FumaUtils.ui.showToast('Error adding event: ' + error.message, 'danger');
        }
    }

    async loadMatchEvents() {
        if (!this.selectedMatch) return;

        try {
            const response = await apiClient.get(`/matches/${this.selectedMatch.id}/events`);
            if (response.success) {
                this.renderMatchEvents(response.data.events);
            }
        } catch (error) {
            console.error('Error loading match events:', error);
        }
    }

    renderMatchEvents(events) {
        const timeline = document.getElementById('matchEventsTimeline');
        if (!timeline) return;

        if (!events || events.length === 0) {
            timeline.innerHTML = '<p class="text-muted">No events yet</p>';
            return;
        }

        const eventsHTML = events.map(event => `
            <div class="event-item event-${event.eventType.toLowerCase().replace('_', '-')}">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="fw-bold">${event.minute}'${event.additionalTime > 0 ? `+${event.additionalTime}` : ''}</span>
                        <span class="ms-2">${this.getEventIcon(event.eventType)} ${this.getEventLabel(event.eventType)}</span>
                        ${event.player ? `<br><small class="text-muted">${event.player.firstName} ${event.player.lastName}</small>` : ''}
                        ${event.description ? `<br><small class="text-muted">${event.description}</small>` : ''}
                    </div>
                    <div class="text-end">
                        <span class="badge bg-light text-dark">${event.team.shortName}</span>
                    </div>
                </div>
            </div>
        `).join('');

        timeline.innerHTML = `<div class="event-timeline">${eventsHTML}</div>`;
    }

    getEventIcon(eventType) {
        const icons = {
            'GOAL': '<i class="fas fa-bullseye text-success"></i>',
            'YELLOW_CARD': '<i class="fas fa-square text-warning"></i>',
            'RED_CARD': '<i class="fas fa-square text-danger"></i>',
            'SUBSTITUTION_IN': '<i class="fas fa-arrow-right text-info"></i>',
            'SUBSTITUTION_OUT': '<i class="fas fa-arrow-left text-info"></i>'
        };
        return icons[eventType] || '<i class="fas fa-info-circle"></i>';
    }

    getEventLabel(eventType) {
        const labels = {
            'GOAL': 'Goal',
            'YELLOW_CARD': 'Yellow Card',
            'RED_CARD': 'Red Card',
            'SUBSTITUTION_IN': 'Substitution In',
            'SUBSTITUTION_OUT': 'Substitution Out'
        };
        return labels[eventType] || eventType;
    }

    async updateMatchTime() {
        if (!this.selectedMatch) return;

        try {
            const currentMinute = parseInt(document.getElementById('currentMinute').value);
            const additionalTime = parseInt(document.getElementById('additionalTime').value);

            const response = await apiClient.put(`/matches/${this.selectedMatch.id}/live`, {
                currentMinute,
                additionalTime
            });

            if (response.success) {
                await this.updateLiveData();
                FumaUtils.ui.showToast('Match time updated', 'success');
            }
        } catch (error) {
            console.error('Error updating match time:', error);
            FumaUtils.ui.showToast('Error updating time: ' + error.message, 'danger');
        }
    }

    async addGoal(team) {
        if (!this.selectedMatch) return;

        try {
            const isHome = team === 'home';
            const newScore = isHome ? this.selectedMatch.homeScore + 1 : this.selectedMatch.awayScore + 1;
            
            const updateData = isHome ? 
                { homeScore: newScore } : 
                { awayScore: newScore };

            const response = await apiClient.updateMatch(this.selectedMatch.id, updateData);
            
            if (response.success) {
                // Update local data
                if (isHome) {
                    this.selectedMatch.homeScore = newScore;
                } else {
                    this.selectedMatch.awayScore = newScore;
                }
                
                // Refresh the control panel
                this.showMatchControlPanel();
                
                // Update live data
                await this.updateLiveData();
                
                FumaUtils.ui.showToast('Goal added', 'success');
            }
        } catch (error) {
            console.error('Error adding goal:', error);
            FumaUtils.ui.showToast('Error adding goal: ' + error.message, 'danger');
        }
    }

    async removeGoal(team) {
        if (!this.selectedMatch) return;

        try {
            const isHome = team === 'home';
            const currentScore = isHome ? this.selectedMatch.homeScore : this.selectedMatch.awayScore;
            
            if (currentScore <= 0) return;
            
            const newScore = currentScore - 1;
            const updateData = isHome ? 
                { homeScore: newScore } : 
                { awayScore: newScore };

            const response = await apiClient.updateMatch(this.selectedMatch.id, updateData);
            
            if (response.success) {
                // Update local data
                if (isHome) {
                    this.selectedMatch.homeScore = newScore;
                } else {
                    this.selectedMatch.awayScore = newScore;
                }
                
                // Refresh the control panel
                this.showMatchControlPanel();
                
                // Update live data
                await this.updateLiveData();
                
                FumaUtils.ui.showToast('Goal removed', 'success');
            }
        } catch (error) {
            console.error('Error removing goal:', error);
            FumaUtils.ui.showToast('Error removing goal: ' + error.message, 'danger');
        }
    }

    async startMatch(matchId) {
        try {
            const response = await apiClient.updateMatch(matchId, { status: 'LIVE' });
            
            if (response.success) {
                await this.loadLiveMatches();
                FumaUtils.ui.showToast('Match started', 'success');
            }
        } catch (error) {
            console.error('Error starting match:', error);
            FumaUtils.ui.showToast('Error starting match: ' + error.message, 'danger');
        }
    }

    async pauseMatch() {
        if (!this.selectedMatch) return;

        try {
            const response = await apiClient.updateMatch(this.selectedMatch.id, { status: 'HALFTIME' });
            
            if (response.success) {
                await this.loadLiveMatches();
                FumaUtils.ui.showToast('Match paused', 'warning');
            }
        } catch (error) {
            console.error('Error pausing match:', error);
            FumaUtils.ui.showToast('Error pausing match: ' + error.message, 'danger');
        }
    }

    async endMatch() {
        if (!this.selectedMatch) return;

        const confirmed = await FumaUtils.ui.confirm(
            'Are you sure you want to end this match? This action cannot be undone.',
            'End Match'
        );

        if (!confirmed) return;

        try {
            const response = await apiClient.updateMatch(this.selectedMatch.id, { status: 'COMPLETED' });
            
            if (response.success) {
                // Hide control panel
                document.getElementById('matchControlPanel').style.display = 'none';
                this.selectedMatch = null;
                
                await this.loadLiveMatches();
                FumaUtils.ui.showToast('Match ended', 'success');
            }
        } catch (error) {
            console.error('Error ending match:', error);
            FumaUtils.ui.showToast('Error ending match: ' + error.message, 'danger');
        }
    }

    async updateLiveData() {
        // Refresh live matches display
        await this.loadLiveMatches();
        
        // Update selected match if exists
        if (this.selectedMatch) {
            try {
                const response = await apiClient.getLiveMatch(this.selectedMatch.id);
                if (response.success) {
                    this.selectedMatch = response.data.match;
                }
            } catch (error) {
                console.error('Error updating selected match:', error);
            }
        }
    }

    updateLiveStats() {
        // Update live statistics in the sidebar
        let totalGoals = 0;
        let totalCards = 0;

        this.liveMatches.forEach(match => {
            totalGoals += match.homeScore + match.awayScore;
            // Add card counting logic if events are available
        });

        const totalGoalsEl = document.getElementById('totalGoals');
        const totalCardsEl = document.getElementById('totalCards');
        const lastUpdateEl = document.getElementById('lastUpdate');

        if (totalGoalsEl) totalGoalsEl.textContent = totalGoals;
        if (totalCardsEl) totalCardsEl.textContent = totalCards;
        if (lastUpdateEl) lastUpdateEl.textContent = FumaUtils.date.format(new Date(), 'HH:mm:ss');
    }

    setupRealTimeConnection() {
        // Setup WebSocket connection for real-time updates
        // This would connect to a WebSocket server
        // For now, we'll use polling as fallback
        
        this.updateInterval = setInterval(() => {
            if (this.liveMatches.length > 0) {
                this.updateLiveData();
            }
        }, 10000); // Update every 10 seconds
    }

    quickEvent(eventType) {
        if (!this.selectedMatch) {
            FumaUtils.ui.showToast('Please select a match first', 'warning');
            return;
        }

        // Pre-fill event form with selected type
        const eventTypeSelect = document.getElementById('eventType');
        if (eventTypeSelect) {
            eventTypeSelect.value = eventType;
        }

        // Scroll to event form
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.scrollIntoView({ behavior: 'smooth' });
        }
    }

    showStartMatchModal() {
        // Show modal to select and start a scheduled match
        // Implementation would show a modal with scheduled matches
        FumaUtils.ui.showToast('Please start a match from the scheduled matches list', 'info');
    }

    viewMatchStats(matchId) {
        // Show detailed match statistics
        // Implementation would show a modal with live statistics
        FumaUtils.ui.showToast('Match statistics feature coming soon', 'info');
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.websocket) {
            this.websocket.close();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminLiveScoring = new AdminLiveScoring();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.adminLiveScoring) {
        window.adminLiveScoring.destroy();
    }
});
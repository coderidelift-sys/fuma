/**
 * Admin Matches Management
 * Handles CRUD operations for matches with scheduling and team assignments
 */

class AdminMatches {
    constructor() {
        this.matches = [];
        this.tournaments = [];
        this.teams = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMatches();
        this.loadTournaments();
        this.loadTeams();
    }

    setupEventListeners() {
        // Add match button
        document.getElementById('addMatchBtn')?.addEventListener('click', () => {
            this.showMatchModal();
        });
    }

    async loadMatches() {
        try {
            FumaUtils.ui.showLoading('matchesContent', 'Loading matches...');

            const response = await apiClient.getMatches();
            
            if (response.success) {
                this.matches = response.data.matches;
                this.renderMatchesContent();
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error loading matches:', error);
            FumaUtils.ui.showError('matchesContent', 'Failed to load matches: ' + error.message);
        }
    }

    async loadTournaments() {
        try {
            const response = await apiClient.getTournaments({ status: 'UPCOMING,ONGOING' });
            if (response.success) {
                this.tournaments = response.data.tournaments;
            }
        } catch (error) {
            console.error('Error loading tournaments:', error);
        }
    }

    async loadTeams() {
        try {
            const response = await apiClient.getTeams({ status: 'ACTIVE' });
            if (response.success) {
                this.teams = response.data.teams;
            }
        } catch (error) {
            console.error('Error loading teams:', error);
        }
    }

    renderMatchesContent() {
        const container = document.getElementById('matchesContent');
        if (!container) return;

        if (this.matches.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-futbol fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No matches found</h5>
                    <p class="text-muted">Schedule your first match to get started.</p>
                    <button class="btn btn-primary" onclick="window.adminMatches.showMatchModal()">
                        <i class="fas fa-plus me-1"></i> Schedule First Match
                    </button>
                </div>
            `;
            return;
        }

        // Group matches by status
        const groupedMatches = this.groupMatchesByStatus();

        const contentHTML = `
            <div class="row">
                <div class="col-12">
                    <!-- Status Tabs -->
                    <ul class="nav nav-tabs mb-4" id="matchesTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="live-tab" data-bs-toggle="tab" data-bs-target="#live" type="button" role="tab">
                                <i class="fas fa-broadcast-tower me-1"></i> Live (${groupedMatches.LIVE.length})
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="scheduled-tab" data-bs-toggle="tab" data-bs-target="#scheduled" type="button" role="tab">
                                <i class="fas fa-calendar me-1"></i> Scheduled (${groupedMatches.SCHEDULED.length})
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="completed-tab" data-bs-toggle="tab" data-bs-target="#completed" type="button" role="tab">
                                <i class="fas fa-check-circle me-1"></i> Completed (${groupedMatches.COMPLETED.length})
                            </button>
                        </li>
                    </ul>

                    <!-- Tab Content -->
                    <div class="tab-content" id="matchesTabContent">
                        <div class="tab-pane fade show active" id="live" role="tabpanel">
                            ${this.renderMatchesList(groupedMatches.LIVE, 'live')}
                        </div>
                        <div class="tab-pane fade" id="scheduled" role="tabpanel">
                            ${this.renderMatchesList(groupedMatches.SCHEDULED, 'scheduled')}
                        </div>
                        <div class="tab-pane fade" id="completed" role="tabpanel">
                            ${this.renderMatchesList(groupedMatches.COMPLETED, 'completed')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = contentHTML;
    }

    groupMatchesByStatus() {
        const grouped = {
            LIVE: [],
            SCHEDULED: [],
            COMPLETED: [],
            HALFTIME: [],
            POSTPONED: [],
            CANCELLED: []
        };

        this.matches.forEach(match => {
            if (grouped[match.status]) {
                grouped[match.status].push(match);
            } else {
                grouped.SCHEDULED.push(match);
            }
        });

        // Add halftime matches to live
        grouped.LIVE.push(...grouped.HALFTIME);

        return grouped;
    }

    renderMatchesList(matches, type) {
        if (matches.length === 0) {
            return `
                <div class="text-center py-4">
                    <i class="fas fa-futbol fa-2x text-muted mb-2"></i>
                    <p class="text-muted">No ${type} matches</p>
                </div>
            `;
        }

        return `
            <div class="row">
                ${matches.map(match => this.renderMatchCard(match, type)).join('')}
            </div>
        `;
    }

    renderMatchCard(match, type) {
        const statusColor = this.getMatchStatusColor(match.status);
        const isLive = match.status === 'LIVE' || match.status === 'HALFTIME';

        return `
            <div class="col-lg-6 col-xl-4 mb-4">
                <div class="card h-100 match-card ${isLive ? 'live-match-card' : ''}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span class="badge bg-${statusColor} ${isLive ? 'live-indicator' : ''}">
                            ${FumaUtils.format.matchStatus(match.status)}
                        </span>
                        <small class="text-muted">${match.tournament?.name || 'Tournament'}</small>
                    </div>
                    <div class="card-body">
                        <div class="row align-items-center mb-3">
                            <div class="col-5 text-center">
                                <img src="${match.homeTeam.logoUrl || '/images/default-team-logo.png'}" 
                                     alt="${match.homeTeam.name}" 
                                     class="team-logo mb-2"
                                     style="width: 40px; height: 40px; object-fit: contain;">
                                <div class="fw-bold small">${match.homeTeam.shortName}</div>
                            </div>
                            <div class="col-2 text-center">
                                ${match.status === 'COMPLETED' || isLive ? `
                                    <div class="score-display">${match.homeScore} - ${match.awayScore}</div>
                                ` : `
                                    <div class="vs-badge">VS</div>
                                `}
                            </div>
                            <div class="col-5 text-center">
                                <img src="${match.awayTeam.logoUrl || '/images/default-team-logo.png'}" 
                                     alt="${match.awayTeam.name}" 
                                     class="team-logo mb-2"
                                     style="width: 40px; height: 40px; object-fit: contain;">
                                <div class="fw-bold small">${match.awayTeam.shortName}</div>
                            </div>
                        </div>

                        <div class="match-info">
                            <div class="d-flex justify-content-between small mb-1">
                                <span><i class="fas fa-calendar me-1"></i> ${FumaUtils.date.format(match.matchDate, 'DD/MM/YYYY')}</span>
                                <span><i class="fas fa-clock me-1"></i> ${FumaUtils.date.format(match.matchDate, 'HH:mm')}</span>
                            </div>
                            <div class="d-flex justify-content-between small mb-1">
                                <span><i class="fas fa-map-marker-alt me-1"></i> ${match.venue || 'TBD'}</span>
                                ${match.referee ? `<span><i class="fas fa-whistle me-1"></i> ${match.referee}</span>` : ''}
                            </div>
                            ${match.matchStage ? `
                                <div class="text-center small">
                                    <span class="badge bg-light text-dark">${match.matchStage}</span>
                                </div>
                            ` : ''}
                        </div>

                        ${isLive && match.liveData ? `
                            <div class="live-stats mt-3">
                                <div class="d-flex justify-content-between small">
                                    <span>Time:</span>
                                    <span class="fw-bold">${match.liveData.currentMinute}'${match.liveData.additionalTime > 0 ? `+${match.liveData.additionalTime}` : ''}</span>
                                </div>
                                <div class="progress mt-1" style="height: 4px;">
                                    <div class="progress-bar" style="width: ${match.liveData.possessionHome || 50}%"></div>
                                </div>
                                <div class="d-flex justify-content-between small">
                                    <span>Possession</span>
                                    <span>${match.liveData.possessionHome || 50}% - ${match.liveData.possessionAway || 50}%</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-footer">
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-outline-primary btn-sm" 
                                    onclick="window.adminMatches.viewMatch(${match.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${type !== 'completed' ? `
                                <button class="btn btn-outline-secondary btn-sm" 
                                        onclick="window.adminMatches.editMatch(${match.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                            ` : ''}
                            ${isLive ? `
                                <button class="btn btn-outline-success btn-sm" 
                                        onclick="window.adminMatches.goToLiveScoring(${match.id})">
                                    <i class="fas fa-gamepad"></i>
                                </button>
                            ` : type === 'scheduled' ? `
                                <button class="btn btn-outline-success btn-sm" 
                                        onclick="window.adminMatches.startMatch(${match.id})">
                                    <i class="fas fa-play"></i>
                                </button>
                            ` : ''}
                            ${type === 'scheduled' ? `
                                <button class="btn btn-outline-danger btn-sm" 
                                        onclick="window.adminMatches.deleteMatch(${match.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getMatchStatusColor(status) {
        const colors = {
            'SCHEDULED': 'warning',
            'LIVE': 'danger',
            'HALFTIME': 'info',
            'COMPLETED': 'success',
            'POSTPONED': 'secondary',
            'CANCELLED': 'dark'
        };
        return colors[status] || 'secondary';
    }

    showMatchModal(matchId = null) {
        const isEdit = matchId !== null;
        const match = isEdit ? this.matches.find(m => m.id === matchId) : null;

        const modalHTML = `
            <div class="modal fade" id="matchModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-futbol me-2"></i>
                                ${isEdit ? 'Edit Match' : 'Schedule New Match'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="matchForm">
                            <div class="modal-body">
                                <div class="form-floating mb-3">
                                    <select class="form-select" id="tournamentId" required>
                                        <option value="">Select Tournament</option>
                                        ${this.tournaments.map(tournament => `
                                            <option value="${tournament.id}" ${match?.tournamentId == tournament.id ? 'selected' : ''}>
                                                ${tournament.name}
                                            </option>
                                        `).join('')}
                                    </select>
                                    <label for="tournamentId">Tournament *</label>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <select class="form-select" id="homeTeamId" required>
                                                <option value="">Select Home Team</option>
                                                ${this.teams.map(team => `
                                                    <option value="${team.id}" ${match?.homeTeamId == team.id ? 'selected' : ''}>
                                                        ${team.name}
                                                    </option>
                                                `).join('')}
                                            </select>
                                            <label for="homeTeamId">Home Team *</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <select class="form-select" id="awayTeamId" required>
                                                <option value="">Select Away Team</option>
                                                ${this.teams.map(team => `
                                                    <option value="${team.id}" ${match?.awayTeamId == team.id ? 'selected' : ''}>
                                                        ${team.name}
                                                    </option>
                                                `).join('')}
                                            </select>
                                            <label for="awayTeamId">Away Team *</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="date" class="form-control" id="matchDate" 
                                                   placeholder="Match Date" required
                                                   value="${match?.matchDate ? match.matchDate.split('T')[0] : ''}">
                                            <label for="matchDate">Match Date *</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="time" class="form-control" id="matchTime" 
                                                   placeholder="Match Time" required
                                                   value="${match?.matchDate ? new Date(match.matchDate).toTimeString().slice(0,5) : ''}">
                                            <label for="matchTime">Match Time *</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="venue" 
                                                   placeholder="Venue"
                                                   value="${match?.venue || ''}">
                                            <label for="venue">Venue</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="referee" 
                                                   placeholder="Referee"
                                                   value="${match?.referee || ''}">
                                            <label for="referee">Referee</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="matchStage" 
                                                   placeholder="Match Stage"
                                                   value="${match?.matchStage || ''}">
                                            <label for="matchStage">Match Stage (e.g., Group A, Quarter Final)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="weatherConditions" 
                                                   placeholder="Weather Conditions"
                                                   value="${match?.weatherConditions || ''}">
                                            <label for="weatherConditions">Weather Conditions</label>
                                        </div>
                                    </div>
                                </div>

                                ${isEdit ? `
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="form-floating mb-3">
                                                <select class="form-select" id="matchStatus">
                                                    <option value="SCHEDULED" ${match?.status === 'SCHEDULED' ? 'selected' : ''}>Scheduled</option>
                                                    <option value="LIVE" ${match?.status === 'LIVE' ? 'selected' : ''}>Live</option>
                                                    <option value="HALFTIME" ${match?.status === 'HALFTIME' ? 'selected' : ''}>Half Time</option>
                                                    <option value="COMPLETED" ${match?.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                                                    <option value="POSTPONED" ${match?.status === 'POSTPONED' ? 'selected' : ''}>Postponed</option>
                                                    <option value="CANCELLED" ${match?.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                                                </select>
                                                <label for="matchStatus">Status</label>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-floating mb-3">
                                                <input type="number" class="form-control" id="homeScore" 
                                                       placeholder="Home Score" min="0"
                                                       value="${match?.homeScore || 0}">
                                                <label for="homeScore">Home Score</label>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-floating mb-3">
                                                <input type="number" class="form-control" id="awayScore" 
                                                       placeholder="Away Score" min="0"
                                                       value="${match?.awayScore || 0}">
                                                <label for="awayScore">Away Score</label>
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i>
                                    ${isEdit ? 'Update Match' : 'Schedule Match'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('matchModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup form submission
        document.getElementById('matchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMatch(matchId);
        });

        // Setup team validation
        document.getElementById('homeTeamId').addEventListener('change', this.validateTeamSelection);
        document.getElementById('awayTeamId').addEventListener('change', this.validateTeamSelection);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('matchModal'));
        modal.show();

        // Focus on first input
        setTimeout(() => {
            document.getElementById('tournamentId').focus();
        }, 300);
    }

    validateTeamSelection() {
        const homeTeamId = document.getElementById('homeTeamId').value;
        const awayTeamId = document.getElementById('awayTeamId').value;

        if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
            document.getElementById('awayTeamId').setCustomValidity('Away team must be different from home team');
        } else {
            document.getElementById('awayTeamId').setCustomValidity('');
        }
    }

    async saveMatch(matchId = null) {
        const form = document.getElementById('matchForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Saving...';
            submitBtn.disabled = true;

            // Collect form data
            const matchDate = document.getElementById('matchDate').value;
            const matchTime = document.getElementById('matchTime').value;
            const combinedDateTime = new Date(`${matchDate}T${matchTime}`);

            const matchData = {
                tournamentId: parseInt(document.getElementById('tournamentId').value),
                homeTeamId: parseInt(document.getElementById('homeTeamId').value),
                awayTeamId: parseInt(document.getElementById('awayTeamId').value),
                matchDate: combinedDateTime.toISOString(),
                venue: document.getElementById('venue').value.trim() || null,
                referee: document.getElementById('referee').value.trim() || null,
                matchStage: document.getElementById('matchStage').value.trim() || null,
                weatherConditions: document.getElementById('weatherConditions').value.trim() || null
            };

            // Add additional fields for edit mode
            if (matchId) {
                matchData.status = document.getElementById('matchStatus').value;
                matchData.homeScore = parseInt(document.getElementById('homeScore').value) || 0;
                matchData.awayScore = parseInt(document.getElementById('awayScore').value) || 0;
            }

            // Validate required fields
            if (!matchData.tournamentId || !matchData.homeTeamId || !matchData.awayTeamId || !matchData.matchDate) {
                throw new Error('Tournament, teams, and match date are required');
            }

            // Validate team selection
            if (matchData.homeTeamId === matchData.awayTeamId) {
                throw new Error('Home and away teams must be different');
            }

            // Save match
            let response;
            if (matchId) {
                response = await apiClient.updateMatch(matchId, matchData);
            } else {
                response = await apiClient.createMatch(matchData);
            }

            if (response.success) {
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('matchModal')).hide();
                
                // Reload matches
                await this.loadMatches();
                
                // Show success message
                FumaUtils.ui.showToast(
                    `Match ${matchId ? 'updated' : 'scheduled'} successfully`, 
                    'success'
                );
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error saving match:', error);
            FumaUtils.ui.showToast('Error: ' + error.message, 'danger');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async viewMatch(matchId) {
        try {
            const response = await apiClient.getMatch(matchId);
            if (response.success) {
                this.showMatchDetailsModal(response.data.match);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error viewing match:', error);
            FumaUtils.ui.showToast('Error loading match details: ' + error.message, 'danger');
        }
    }

    showMatchDetailsModal(match) {
        // Implementation for match details modal
        FumaUtils.ui.showToast('Match details modal coming soon', 'info');
    }

    editMatch(matchId) {
        this.showMatchModal(matchId);
    }

    async startMatch(matchId) {
        try {
            const response = await apiClient.updateMatch(matchId, { status: 'LIVE' });
            
            if (response.success) {
                await this.loadMatches();
                FumaUtils.ui.showToast('Match started successfully', 'success');
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error starting match:', error);
            FumaUtils.ui.showToast('Error starting match: ' + error.message, 'danger');
        }
    }

    goToLiveScoring(matchId) {
        // Navigate to live scoring section with this match selected
        if (window.adminDashboard) {
            window.adminDashboard.showSection('live-scoring');
            // Select this match in live scoring
            setTimeout(() => {
                if (window.adminLiveScoring) {
                    window.adminLiveScoring.selectMatch(matchId);
                }
            }, 500);
        }
    }

    async deleteMatch(matchId) {
        const match = this.matches.find(m => m.id === matchId);
        if (!match) return;

        const confirmed = await FumaUtils.ui.confirm(
            `Are you sure you want to delete the match between ${match.homeTeam.name} vs ${match.awayTeam.name}? This action cannot be undone.`,
            'Delete Match'
        );

        if (!confirmed) return;

        try {
            const response = await apiClient.deleteMatch(matchId);
            
            if (response.success) {
                await this.loadMatches();
                FumaUtils.ui.showToast('Match deleted successfully', 'success');
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error deleting match:', error);
            FumaUtils.ui.showToast('Error deleting match: ' + error.message, 'danger');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminMatches = new AdminMatches();
});
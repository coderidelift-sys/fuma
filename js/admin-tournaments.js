/**
 * Admin Tournaments Management
 * Handles CRUD operations for tournaments with team assignments and scheduling
 */

class AdminTournaments {
    constructor() {
        this.tournaments = [];
        this.teams = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTournaments();
        this.loadTeams();
    }

    setupEventListeners() {
        // Add tournament button
        document.getElementById('addTournamentBtn')?.addEventListener('click', () => {
            this.showTournamentModal();
        });
    }

    async loadTournaments() {
        try {
            FumaUtils.ui.showLoading('tournamentsContent', 'Loading tournaments...');

            const response = await apiClient.getTournaments();
            
            if (response.success) {
                this.tournaments = response.data.tournaments;
                this.renderTournamentsContent();
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error loading tournaments:', error);
            FumaUtils.ui.showError('tournamentsContent', 'Failed to load tournaments: ' + error.message);
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

    renderTournamentsContent() {
        const container = document.getElementById('tournamentsContent');
        if (!container) return;

        if (this.tournaments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-trophy fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No tournaments found</h5>
                    <p class="text-muted">Create your first tournament to get started.</p>
                    <button class="btn btn-primary" onclick="window.adminTournaments.showTournamentModal()">
                        <i class="fas fa-plus me-1"></i> Create First Tournament
                    </button>
                </div>
            `;
            return;
        }

        const contentHTML = `
            <div class="row">
                ${this.tournaments.map(tournament => this.renderTournamentCard(tournament)).join('')}
            </div>
        `;

        container.innerHTML = contentHTML;
    }

    renderTournamentCard(tournament) {
        const statusColor = this.getStatusColor(tournament.status);
        const teamCount = tournament._count?.tournamentTeams || 0;
        const matchCount = tournament._count?.matches || 0;

        return `
            <div class="col-lg-6 col-xl-4 mb-4">
                <div class="card h-100 tournament-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span class="badge bg-${statusColor}">${FumaUtils.format.tournamentStatus(tournament.status)}</span>
                        <small class="text-muted">${tournament.tournamentType}</small>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${tournament.name}</h5>
                        <p class="card-text text-muted">${tournament.description || 'No description available'}</p>
                        
                        <div class="row text-center mb-3">
                            <div class="col-4">
                                <div class="fw-bold text-primary">${teamCount}</div>
                                <small class="text-muted">Teams</small>
                            </div>
                            <div class="col-4">
                                <div class="fw-bold text-success">${matchCount}</div>
                                <small class="text-muted">Matches</small>
                            </div>
                            <div class="col-4">
                                <div class="fw-bold text-info">${tournament.maxTeams || 'Unlimited'}</div>
                                <small class="text-muted">Max Teams</small>
                            </div>
                        </div>

                        <div class="mb-3">
                            <div class="d-flex justify-content-between small">
                                <span>Start Date:</span>
                                <span>${tournament.startDate ? FumaUtils.date.format(tournament.startDate) : 'TBD'}</span>
                            </div>
                            <div class="d-flex justify-content-between small">
                                <span>End Date:</span>
                                <span>${tournament.endDate ? FumaUtils.date.format(tournament.endDate) : 'TBD'}</span>
                            </div>
                            ${tournament.prizeMoney ? `
                                <div class="d-flex justify-content-between small">
                                    <span>Prize Money:</span>
                                    <span class="fw-bold text-success">${FumaUtils.format.currency(tournament.prizeMoney)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-outline-primary btn-sm" 
                                    onclick="window.adminTournaments.viewTournament(${tournament.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" 
                                    onclick="window.adminTournaments.editTournament(${tournament.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-outline-info btn-sm" 
                                    onclick="window.adminTournaments.manageTeams(${tournament.id})">
                                <i class="fas fa-users"></i> Teams
                            </button>
                            <button class="btn btn-outline-danger btn-sm" 
                                    onclick="window.adminTournaments.deleteTournament(${tournament.id})"
                                    ${teamCount > 0 || matchCount > 0 ? 'disabled' : ''}>
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
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

    showTournamentModal(tournamentId = null) {
        const isEdit = tournamentId !== null;
        const tournament = isEdit ? this.tournaments.find(t => t.id === tournamentId) : null;

        const modalHTML = `
            <div class="modal fade" id="tournamentModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-trophy me-2"></i>
                                ${isEdit ? 'Edit Tournament' : 'Create New Tournament'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="tournamentForm">
                            <div class="modal-body">
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="tournamentName" 
                                           placeholder="Tournament Name" required
                                           value="${tournament?.name || ''}">
                                    <label for="tournamentName">Tournament Name *</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <textarea class="form-control" id="tournamentDescription" 
                                              placeholder="Description" style="height: 100px"
                                              >${tournament?.description || ''}</textarea>
                                    <label for="tournamentDescription">Description</label>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="date" class="form-control" id="startDate" 
                                                   placeholder="Start Date"
                                                   value="${tournament?.startDate ? tournament.startDate.split('T')[0] : ''}">
                                            <label for="startDate">Start Date</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="date" class="form-control" id="endDate" 
                                                   placeholder="End Date"
                                                   value="${tournament?.endDate ? tournament.endDate.split('T')[0] : ''}">
                                            <label for="endDate">End Date</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <select class="form-select" id="tournamentType" required>
                                                <option value="">Select Type</option>
                                                <option value="LEAGUE" ${tournament?.tournamentType === 'LEAGUE' ? 'selected' : ''}>League</option>
                                                <option value="KNOCKOUT" ${tournament?.tournamentType === 'KNOCKOUT' ? 'selected' : ''}>Knockout</option>
                                                <option value="GROUP_KNOCKOUT" ${tournament?.tournamentType === 'GROUP_KNOCKOUT' ? 'selected' : ''}>Group + Knockout</option>
                                            </select>
                                            <label for="tournamentType">Tournament Type *</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="maxTeams" 
                                                   placeholder="Maximum Teams" min="2" max="64"
                                                   value="${tournament?.maxTeams || ''}">
                                            <label for="maxTeams">Maximum Teams</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-floating mb-3">
                                    <input type="number" class="form-control" id="prizeMoney" 
                                           placeholder="Prize Money" min="0"
                                           value="${tournament?.prizeMoney || ''}">
                                    <label for="prizeMoney">Prize Money ($)</label>
                                </div>

                                ${isEdit ? `
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="tournamentStatus">
                                            <option value="UPCOMING" ${tournament?.status === 'UPCOMING' ? 'selected' : ''}>Upcoming</option>
                                            <option value="ONGOING" ${tournament?.status === 'ONGOING' ? 'selected' : ''}>Ongoing</option>
                                            <option value="COMPLETED" ${tournament?.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                                            <option value="CANCELLED" ${tournament?.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                                        </select>
                                        <label for="tournamentStatus">Status</label>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i>
                                    ${isEdit ? 'Update Tournament' : 'Create Tournament'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('tournamentModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup form submission
        document.getElementById('tournamentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTournament(tournamentId);
        });

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('tournamentModal'));
        modal.show();

        // Focus on first input
        setTimeout(() => {
            document.getElementById('tournamentName').focus();
        }, 300);
    }

    async saveTournament(tournamentId = null) {
        const form = document.getElementById('tournamentForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Saving...';
            submitBtn.disabled = true;

            // Collect form data
            const tournamentData = {
                name: document.getElementById('tournamentName').value.trim(),
                description: document.getElementById('tournamentDescription').value.trim() || null,
                startDate: document.getElementById('startDate').value || null,
                endDate: document.getElementById('endDate').value || null,
                tournamentType: document.getElementById('tournamentType').value,
                maxTeams: parseInt(document.getElementById('maxTeams').value) || null,
                prizeMoney: parseFloat(document.getElementById('prizeMoney').value) || null
            };

            // Add status for edit mode
            if (tournamentId) {
                tournamentData.status = document.getElementById('tournamentStatus').value;
            }

            // Validate required fields
            if (!tournamentData.name || !tournamentData.tournamentType) {
                throw new Error('Tournament name and type are required');
            }

            // Validate dates
            if (tournamentData.startDate && tournamentData.endDate) {
                if (new Date(tournamentData.startDate) >= new Date(tournamentData.endDate)) {
                    throw new Error('End date must be after start date');
                }
            }

            // Save tournament
            let response;
            if (tournamentId) {
                response = await apiClient.updateTournament(tournamentId, tournamentData);
            } else {
                response = await apiClient.createTournament(tournamentData);
            }

            if (response.success) {
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('tournamentModal')).hide();
                
                // Reload tournaments
                await this.loadTournaments();
                
                // Show success message
                FumaUtils.ui.showToast(
                    `Tournament ${tournamentId ? 'updated' : 'created'} successfully`, 
                    'success'
                );
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error saving tournament:', error);
            FumaUtils.ui.showToast('Error: ' + error.message, 'danger');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async viewTournament(tournamentId) {
        try {
            const response = await apiClient.getTournament(tournamentId);
            if (response.success) {
                this.showTournamentDetailsModal(response.data.tournament);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error viewing tournament:', error);
            FumaUtils.ui.showToast('Error loading tournament details: ' + error.message, 'danger');
        }
    }

    showTournamentDetailsModal(tournament) {
        const teamCount = tournament._count?.tournamentTeams || 0;
        const matchCount = tournament._count?.matches || 0;

        const modalHTML = `
            <div class="modal fade" id="tournamentDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-trophy me-2"></i>
                                ${tournament.name}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3">Tournament Information</h6>
                                    <table class="table table-sm">
                                        <tr><td class="fw-bold">Name:</td><td>${tournament.name}</td></tr>
                                        <tr><td class="fw-bold">Type:</td><td>${tournament.tournamentType}</td></tr>
                                        <tr><td class="fw-bold">Status:</td><td>
                                            <span class="status-badge status-${tournament.status.toLowerCase()}">
                                                ${FumaUtils.format.tournamentStatus(tournament.status)}
                                            </span>
                                        </td></tr>
                                        <tr><td class="fw-bold">Start Date:</td><td>${tournament.startDate ? FumaUtils.date.format(tournament.startDate) : 'TBD'}</td></tr>
                                        <tr><td class="fw-bold">End Date:</td><td>${tournament.endDate ? FumaUtils.date.format(tournament.endDate) : 'TBD'}</td></tr>
                                        <tr><td class="fw-bold">Max Teams:</td><td>${tournament.maxTeams || 'Unlimited'}</td></tr>
                                        ${tournament.prizeMoney ? `<tr><td class="fw-bold">Prize Money:</td><td>${FumaUtils.format.currency(tournament.prizeMoney)}</td></tr>` : ''}
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3">Statistics</h6>
                                    <table class="table table-sm">
                                        <tr><td class="fw-bold">Participating Teams:</td><td>${teamCount}</td></tr>
                                        <tr><td class="fw-bold">Total Matches:</td><td>${matchCount}</td></tr>
                                        <tr><td class="fw-bold">Created:</td><td>${FumaUtils.date.format(tournament.createdAt)}</td></tr>
                                    </table>
                                </div>
                            </div>

                            ${tournament.description ? `
                                <div class="mt-3">
                                    <h6 class="fw-bold mb-3">Description</h6>
                                    <p>${tournament.description}</p>
                                </div>
                            ` : ''}

                            ${tournament.tournamentTeams && tournament.tournamentTeams.length > 0 ? `
                                <div class="mt-3">
                                    <h6 class="fw-bold mb-3">Participating Teams (${tournament.tournamentTeams.length})</h6>
                                    <div class="row">
                                        ${tournament.tournamentTeams.map(tt => `
                                            <div class="col-md-6 mb-2">
                                                <div class="card">
                                                    <div class="card-body p-2">
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <strong>${tt.team.name}</strong>
                                                                ${tt.groupName ? `<span class="badge bg-info ms-2">Group ${tt.groupName}</span>` : ''}
                                                            </div>
                                                            <div class="text-end">
                                                                <div class="fw-bold">${tt.points} pts</div>
                                                                <small class="text-muted">${tt.wins}W ${tt.draws}D ${tt.losses}L</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            ${tournament.matches && tournament.matches.length > 0 ? `
                                <div class="mt-3">
                                    <h6 class="fw-bold mb-3">Recent Matches</h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Home Team</th>
                                                    <th>Score</th>
                                                    <th>Away Team</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${tournament.matches.slice(0, 5).map(match => `
                                                    <tr>
                                                        <td>${FumaUtils.date.format(match.matchDate, 'DD/MM HH:mm')}</td>
                                                        <td>${match.homeTeam.shortName}</td>
                                                        <td class="text-center">
                                                            ${match.status === 'COMPLETED' ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
                                                        </td>
                                                        <td>${match.awayTeam.shortName}</td>
                                                        <td>
                                                            <span class="badge bg-${this.getMatchStatusColor(match.status)}">
                                                                ${FumaUtils.format.matchStatus(match.status)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-info" onclick="window.adminTournaments.manageTeams(${tournament.id})">
                                <i class="fas fa-users me-1"></i> Manage Teams
                            </button>
                            <button type="button" class="btn btn-primary" onclick="window.adminTournaments.editTournament(${tournament.id})">
                                <i class="fas fa-edit me-1"></i> Edit Tournament
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('tournamentDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM and show
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('tournamentDetailsModal'));
        modal.show();
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

    editTournament(tournamentId) {
        // Close details modal if open
        const detailsModal = document.getElementById('tournamentDetailsModal');
        if (detailsModal) {
            bootstrap.Modal.getInstance(detailsModal)?.hide();
        }
        
        // Show edit modal
        this.showTournamentModal(tournamentId);
    }

    async deleteTournament(tournamentId) {
        const tournament = this.tournaments.find(t => t.id === tournamentId);
        if (!tournament) return;

        const confirmed = await FumaUtils.ui.confirm(
            `Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`,
            'Delete Tournament'
        );

        if (!confirmed) return;

        try {
            const response = await apiClient.deleteTournament(tournamentId);
            
            if (response.success) {
                await this.loadTournaments();
                FumaUtils.ui.showToast('Tournament deleted successfully', 'success');
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error deleting tournament:', error);
            FumaUtils.ui.showToast('Error deleting tournament: ' + error.message, 'danger');
        }
    }

    manageTeams(tournamentId) {
        // Show team management modal for tournament
        FumaUtils.ui.showToast('Team management feature coming soon', 'info');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminTournaments = new AdminTournaments();
});
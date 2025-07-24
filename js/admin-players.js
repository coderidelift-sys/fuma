/**
 * Admin Players Management
 * Handles CRUD operations for players with team assignments and statistics
 */

class AdminPlayers {
    constructor() {
        this.players = [];
        this.filteredPlayers = [];
        this.teams = [];
        this.currentPage = 1;
        this.itemsPerPage = 15;
        this.filters = {
            search: '',
            team: '',
            position: '',
            status: '',
            sortBy: 'lastName'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTeams();
        this.loadPlayers();
    }

    setupEventListeners() {
        // Add player button
        document.getElementById('addPlayerBtn')?.addEventListener('click', () => {
            this.showPlayerModal();
        });

        // Search and filters
        document.getElementById('playerSearch')?.addEventListener('input', 
            FumaUtils.debounce((e) => this.handleSearch(e.target.value), 300)
        );

        document.getElementById('playerTeamFilter')?.addEventListener('change', (e) => {
            this.filters.team = e.target.value;
            this.applyFilters();
        });

        document.getElementById('playerPositionFilter')?.addEventListener('change', (e) => {
            this.filters.position = e.target.value;
            this.applyFilters();
        });

        document.getElementById('playerStatusFilter')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('playerSortBy')?.addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.applyFilters();
        });

        document.getElementById('resetPlayerFilters')?.addEventListener('click', () => {
            this.resetFilters();
        });
    }

    async loadTeams() {
        try {
            const response = await apiClient.getTeams({ status: 'ACTIVE' });
            if (response.success) {
                this.teams = response.data.teams;
                this.populateTeamFilters();
            }
        } catch (error) {
            console.error('Error loading teams:', error);
        }
    }

    populateTeamFilters() {
        const teamFilter = document.getElementById('playerTeamFilter');
        if (teamFilter && this.teams.length > 0) {
            // Clear existing options except "All Teams"
            teamFilter.innerHTML = '<option value="">All Teams</option>';
            
            this.teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.name;
                teamFilter.appendChild(option);
            });
        }
    }

    async loadPlayers() {
        try {
            FumaUtils.ui.showLoading('playersTableContainer', 'Loading players...');

            const response = await apiClient.getPlayers({
                page: this.currentPage,
                limit: 100 // Load all for client-side filtering
            });

            if (response.success) {
                this.players = response.data.players;
                this.filteredPlayers = [...this.players];
                this.renderPlayersTable();
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error loading players:', error);
            FumaUtils.ui.showError('playersTableContainer', 'Failed to load players: ' + error.message);
        }
    }

    handleSearch(searchTerm) {
        this.filters.search = searchTerm.toLowerCase();
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.players];

        // Apply search filter
        if (this.filters.search) {
            filtered = filtered.filter(player => 
                `${player.firstName} ${player.lastName}`.toLowerCase().includes(this.filters.search) ||
                player.jerseyNumber?.toString().includes(this.filters.search) ||
                player.nationality?.toLowerCase().includes(this.filters.search)
            );
        }

        // Apply team filter
        if (this.filters.team) {
            filtered = filtered.filter(player => player.teamId == this.filters.team);
        }

        // Apply position filter
        if (this.filters.position) {
            filtered = filtered.filter(player => player.position === this.filters.position);
        }

        // Apply status filter
        if (this.filters.status) {
            filtered = filtered.filter(player => player.status === this.filters.status);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'lastName':
                    return a.lastName.localeCompare(b.lastName);
                case 'jerseyNumber':
                    return (a.jerseyNumber || 999) - (b.jerseyNumber || 999);
                case 'position':
                    return a.position.localeCompare(b.position);
                default:
                    return 0;
            }
        });

        this.filteredPlayers = filtered;
        this.currentPage = 1; // Reset to first page
        this.renderPlayersTable();
    }

    resetFilters() {
        this.filters = {
            search: '',
            team: '',
            position: '',
            status: '',
            sortBy: 'lastName'
        };

        // Reset form elements
        document.getElementById('playerSearch').value = '';
        document.getElementById('playerTeamFilter').value = '';
        document.getElementById('playerPositionFilter').value = '';
        document.getElementById('playerStatusFilter').value = '';
        document.getElementById('playerSortBy').value = 'lastName';

        this.filteredPlayers = [...this.players];
        this.renderPlayersTable();
    }

    renderPlayersTable() {
        const container = document.getElementById('playersTableContainer');
        if (!container) return;

        if (this.filteredPlayers.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-user fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No players found</h5>
                    <p class="text-muted">Try adjusting your search criteria or add a new player.</p>
                    <button class="btn btn-primary" onclick="window.adminPlayers.showPlayerModal()">
                        <i class="fas fa-plus me-1"></i> Add First Player
                    </button>
                </div>
            `;
            return;
        }

        // Calculate pagination
        const totalPages = Math.ceil(this.filteredPlayers.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedPlayers = this.filteredPlayers.slice(startIndex, endIndex);

        const tableHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <span class="text-muted">
                        Showing ${startIndex + 1}-${Math.min(endIndex, this.filteredPlayers.length)} of ${this.filteredPlayers.length} players
                    </span>
                </div>
                <div>
                    ${this.renderPagination(totalPages)}
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Jersey #</th>
                            <th>Position</th>
                            <th>Team</th>
                            <th>Age</th>
                            <th>Nationality</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paginatedPlayers.map(player => this.renderPlayerRow(player)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    renderPlayerRow(player) {
        const age = player.dateOfBirth ? this.calculateAge(player.dateOfBirth) : 'Unknown';
        const team = this.teams.find(t => t.id === player.teamId);

        return `
            <tr>
                <td>
                    <img src="${player.photoUrl || '/images/default-player.png'}" 
                         alt="${player.firstName} ${player.lastName}" 
                         class="rounded-circle" 
                         style="width: 40px; height: 40px; object-fit: cover;"
                         onerror="this.src='/images/default-player.png'">
                </td>
                <td>
                    <div class="fw-bold">${player.firstName} ${player.lastName}</div>
                    <small class="text-muted">${player.preferredFoot ? `${player.preferredFoot} footed` : ''}</small>
                </td>
                <td>
                    <span class="badge bg-primary">${player.jerseyNumber || 'N/A'}</span>
                </td>
                <td>
                    <span class="badge bg-info">${FumaUtils.format.position(player.position)}</span>
                </td>
                <td>
                    <div>${team ? team.shortName : 'Free Agent'}</div>
                    ${team ? `<small class="text-muted">${team.name}</small>` : ''}
                </td>
                <td>${age}</td>
                <td>
                    <div>${player.nationality || 'Unknown'}</div>
                    ${player.height || player.weight ? `
                        <small class="text-muted">
                            ${player.height ? `${player.height}m` : ''} 
                            ${player.weight ? `${player.weight}kg` : ''}
                        </small>
                    ` : ''}
                </td>
                <td>
                    <span class="status-badge status-${player.status.toLowerCase()}">
                        ${FumaUtils.format.capitalize(player.status)}
                    </span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary btn-action" 
                                onclick="window.adminPlayers.viewPlayer(${player.id})"
                                title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary btn-action" 
                                onclick="window.adminPlayers.editPlayer(${player.id})"
                                title="Edit Player">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-action" 
                                onclick="window.adminPlayers.deletePlayer(${player.id})"
                                title="Delete Player">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderPagination(totalPages) {
        if (totalPages <= 1) return '';

        let paginationHTML = '<nav><ul class="pagination pagination-sm mb-0">';

        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="window.adminPlayers.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="window.adminPlayers.goToPage(1)">1</a></li>`;
            if (startPage > 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="window.adminPlayers.goToPage(${i})">${i}</a>
                </li>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="window.adminPlayers.goToPage(${totalPages})">${totalPages}</a></li>`;
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="window.adminPlayers.goToPage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        paginationHTML += '</ul></nav>';
        return paginationHTML;
    }

    goToPage(page) {
        if (page < 1 || page > Math.ceil(this.filteredPlayers.length / this.itemsPerPage)) return;
        this.currentPage = page;
        this.renderPlayersTable();
    }

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

    showPlayerModal(playerId = null) {
        const isEdit = playerId !== null;
        const player = isEdit ? this.players.find(p => p.id === playerId) : null;

        const modalHTML = `
            <div class="modal fade" id="playerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-user me-2"></i>
                                ${isEdit ? 'Edit Player' : 'Add New Player'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="playerForm">
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="firstName" 
                                                   placeholder="First Name" required
                                                   value="${player?.firstName || ''}">
                                            <label for="firstName">First Name *</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="lastName" 
                                                   placeholder="Last Name" required
                                                   value="${player?.lastName || ''}">
                                            <label for="lastName">Last Name *</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <select class="form-select" id="teamId">
                                                <option value="">No Team (Free Agent)</option>
                                                ${this.teams.map(team => `
                                                    <option value="${team.id}" ${player?.teamId == team.id ? 'selected' : ''}>
                                                        ${team.name}
                                                    </option>
                                                `).join('')}
                                            </select>
                                            <label for="teamId">Team</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="jerseyNumber" 
                                                   placeholder="Jersey Number" min="1" max="99"
                                                   value="${player?.jerseyNumber || ''}">
                                            <label for="jerseyNumber">Jersey Number</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <select class="form-select" id="position" required>
                                                <option value="">Select Position</option>
                                                <option value="GOALKEEPER" ${player?.position === 'GOALKEEPER' ? 'selected' : ''}>Goalkeeper</option>
                                                <option value="DEFENDER" ${player?.position === 'DEFENDER' ? 'selected' : ''}>Defender</option>
                                                <option value="MIDFIELDER" ${player?.position === 'MIDFIELDER' ? 'selected' : ''}>Midfielder</option>
                                                <option value="FORWARD" ${player?.position === 'FORWARD' ? 'selected' : ''}>Forward</option>
                                            </select>
                                            <label for="position">Position *</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="date" class="form-control" id="dateOfBirth" 
                                                   placeholder="Date of Birth"
                                                   value="${player?.dateOfBirth ? player.dateOfBirth.split('T')[0] : ''}">
                                            <label for="dateOfBirth">Date of Birth</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="nationality" 
                                                   placeholder="Nationality"
                                                   value="${player?.nationality || ''}">
                                            <label for="nationality">Nationality</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="height" 
                                                   placeholder="Height (m)" step="0.01" min="1.0" max="2.5"
                                                   value="${player?.height || ''}">
                                            <label for="height">Height (m)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="weight" 
                                                   placeholder="Weight (kg)" min="40" max="150"
                                                   value="${player?.weight || ''}">
                                            <label for="weight">Weight (kg)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <select class="form-select" id="preferredFoot">
                                                <option value="">Select Foot</option>
                                                <option value="LEFT" ${player?.preferredFoot === 'LEFT' ? 'selected' : ''}>Left</option>
                                                <option value="RIGHT" ${player?.preferredFoot === 'RIGHT' ? 'selected' : ''}>Right</option>
                                                <option value="BOTH" ${player?.preferredFoot === 'BOTH' ? 'selected' : ''}>Both</option>
                                            </select>
                                            <label for="preferredFoot">Preferred Foot</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="url" class="form-control" id="photoUrl" 
                                                   placeholder="Photo URL"
                                                   value="${player?.photoUrl || ''}">
                                            <label for="photoUrl">Photo URL</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="marketValue" 
                                                   placeholder="Market Value" min="0"
                                                   value="${player?.marketValue || ''}">
                                            <label for="marketValue">Market Value ($)</label>
                                        </div>
                                    </div>
                                </div>

                                ${isEdit ? `
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="status">
                                            <option value="ACTIVE" ${player?.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
                                            <option value="INJURED" ${player?.status === 'INJURED' ? 'selected' : ''}>Injured</option>
                                            <option value="SUSPENDED" ${player?.status === 'SUSPENDED' ? 'selected' : ''}>Suspended</option>
                                            <option value="TRANSFERRED" ${player?.status === 'TRANSFERRED' ? 'selected' : ''}>Transferred</option>
                                        </select>
                                        <label for="status">Status</label>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i>
                                    ${isEdit ? 'Update Player' : 'Create Player'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('playerModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup form submission
        document.getElementById('playerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePlayer(playerId);
        });

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('playerModal'));
        modal.show();

        // Focus on first input
        setTimeout(() => {
            document.getElementById('firstName').focus();
        }, 300);
    }

    async savePlayer(playerId = null) {
        const form = document.getElementById('playerForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Saving...';
            submitBtn.disabled = true;

            // Collect form data
            const playerData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                teamId: parseInt(document.getElementById('teamId').value) || null,
                jerseyNumber: parseInt(document.getElementById('jerseyNumber').value) || null,
                position: document.getElementById('position').value,
                dateOfBirth: document.getElementById('dateOfBirth').value || null,
                nationality: document.getElementById('nationality').value.trim() || null,
                height: parseFloat(document.getElementById('height').value) || null,
                weight: parseFloat(document.getElementById('weight').value) || null,
                preferredFoot: document.getElementById('preferredFoot').value || null,
                photoUrl: document.getElementById('photoUrl').value.trim() || null,
                marketValue: parseFloat(document.getElementById('marketValue').value) || null
            };

            // Add status for edit mode
            if (playerId) {
                playerData.status = document.getElementById('status').value;
            }

            // Validate required fields
            if (!playerData.firstName || !playerData.lastName || !playerData.position) {
                throw new Error('First name, last name, and position are required');
            }

            // Save player
            let response;
            if (playerId) {
                response = await apiClient.updatePlayer(playerId, playerData);
            } else {
                response = await apiClient.createPlayer(playerData);
            }

            if (response.success) {
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('playerModal')).hide();
                
                // Reload players
                await this.loadPlayers();
                
                // Show success message
                FumaUtils.ui.showToast(
                    `Player ${playerId ? 'updated' : 'created'} successfully`, 
                    'success'
                );
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error saving player:', error);
            FumaUtils.ui.showToast('Error: ' + error.message, 'danger');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async viewPlayer(playerId) {
        try {
            const response = await apiClient.getPlayer(playerId);
            if (response.success) {
                this.showPlayerDetailsModal(response.data.player);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error viewing player:', error);
            FumaUtils.ui.showToast('Error loading player details: ' + error.message, 'danger');
        }
    }

    showPlayerDetailsModal(player) {
        const team = this.teams.find(t => t.id === player.teamId);
        const age = player.dateOfBirth ? this.calculateAge(player.dateOfBirth) : 'Unknown';

        const modalHTML = `
            <div class="modal fade" id="playerDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <img src="${player.photoUrl || '/images/default-player.png'}" 
                                     alt="${player.firstName} ${player.lastName}" 
                                     class="rounded-circle me-2" 
                                     style="width: 32px; height: 32px; object-fit: cover;">
                                ${player.firstName} ${player.lastName}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3">Basic Information</h6>
                                    <table class="table table-sm">
                                        <tr><td class="fw-bold">Full Name:</td><td>${player.firstName} ${player.lastName}</td></tr>
                                        <tr><td class="fw-bold">Jersey Number:</td><td>${player.jerseyNumber || 'N/A'}</td></tr>
                                        <tr><td class="fw-bold">Position:</td><td>${FumaUtils.format.position(player.position)}</td></tr>
                                        <tr><td class="fw-bold">Team:</td><td>${team ? team.name : 'Free Agent'}</td></tr>
                                        <tr><td class="fw-bold">Status:</td><td>
                                            <span class="status-badge status-${player.status.toLowerCase()}">
                                                ${FumaUtils.format.capitalize(player.status)}
                                            </span>
                                        </td></tr>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3">Personal Details</h6>
                                    <table class="table table-sm">
                                        <tr><td class="fw-bold">Age:</td><td>${age}</td></tr>
                                        <tr><td class="fw-bold">Date of Birth:</td><td>${player.dateOfBirth ? FumaUtils.date.format(player.dateOfBirth) : 'Unknown'}</td></tr>
                                        <tr><td class="fw-bold">Nationality:</td><td>${player.nationality || 'Unknown'}</td></tr>
                                        <tr><td class="fw-bold">Height:</td><td>${player.height ? `${player.height}m` : 'Unknown'}</td></tr>
                                        <tr><td class="fw-bold">Weight:</td><td>${player.weight ? `${player.weight}kg` : 'Unknown'}</td></tr>
                                        <tr><td class="fw-bold">Preferred Foot:</td><td>${player.preferredFoot || 'Unknown'}</td></tr>
                                    </table>
                                </div>
                            </div>
                            
                            ${player.marketValue ? `
                                <div class="row mt-3">
                                    <div class="col-12">
                                        <h6 class="fw-bold mb-3">Market Information</h6>
                                        <table class="table table-sm">
                                            <tr><td class="fw-bold">Market Value:</td><td>${FumaUtils.format.currency(player.marketValue)}</td></tr>
                                        </table>
                                    </div>
                                </div>
                            ` : ''}

                            ${player.statistics && player.statistics.length > 0 ? `
                                <div class="mt-3">
                                    <h6 class="fw-bold mb-3">Career Statistics</h6>
                                    <div class="row">
                                        ${player.statistics.map(stat => `
                                            <div class="col-md-6 mb-2">
                                                <div class="card">
                                                    <div class="card-body p-2">
                                                        <h6 class="card-title mb-1">${stat.tournament?.name || 'Tournament'}</h6>
                                                        <div class="row text-center">
                                                            <div class="col-4">
                                                                <div class="fw-bold text-primary">${stat.goals || 0}</div>
                                                                <small>Goals</small>
                                                            </div>
                                                            <div class="col-4">
                                                                <div class="fw-bold text-success">${stat.assists || 0}</div>
                                                                <small>Assists</small>
                                                            </div>
                                                            <div class="col-4">
                                                                <div class="fw-bold text-info">${stat.matchesPlayed || 0}</div>
                                                                <small>Matches</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="window.adminPlayers.editPlayer(${player.id})">
                                <i class="fas fa-edit me-1"></i> Edit Player
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('playerDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM and show
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('playerDetailsModal'));
        modal.show();
    }

    editPlayer(playerId) {
        // Close details modal if open
        const detailsModal = document.getElementById('playerDetailsModal');
        if (detailsModal) {
            bootstrap.Modal.getInstance(detailsModal)?.hide();
        }
        
        // Show edit modal
        this.showPlayerModal(playerId);
    }

    async deletePlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        const confirmed = await FumaUtils.ui.confirm(
            `Are you sure you want to delete "${player.firstName} ${player.lastName}"? This action cannot be undone.`,
            'Delete Player'
        );

        if (!confirmed) return;

        try {
            const response = await apiClient.deletePlayer(playerId);
            
            if (response.success) {
                await this.loadPlayers();
                FumaUtils.ui.showToast('Player deleted successfully', 'success');
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error deleting player:', error);
            FumaUtils.ui.showToast('Error deleting player: ' + error.message, 'danger');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPlayers = new AdminPlayers();
});
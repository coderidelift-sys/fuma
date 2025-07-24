/**
 * Admin Teams Management
 * Handles CRUD operations for teams with validation and real-time updates
 */

class AdminTeams {
    constructor() {
        this.teams = [];
        this.filteredTeams = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filters = {
            search: '',
            status: '',
            sortBy: 'name'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTeams();
    }

    setupEventListeners() {
        // Add team button
        document.getElementById('addTeamBtn')?.addEventListener('click', () => {
            this.showTeamModal();
        });

        // Search and filters
        document.getElementById('teamSearch')?.addEventListener('input', 
            FumaUtils.debounce((e) => this.handleSearch(e.target.value), 300)
        );

        document.getElementById('teamStatusFilter')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('teamSortBy')?.addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.applyFilters();
        });

        document.getElementById('resetTeamFilters')?.addEventListener('click', () => {
            this.resetFilters();
        });
    }

    async loadTeams() {
        try {
            FumaUtils.ui.showLoading('teamsTableContainer', 'Loading teams...');

            const response = await apiClient.getTeams({
                page: this.currentPage,
                limit: 100 // Load all teams for client-side filtering
            });

            if (response.success) {
                this.teams = response.data.teams;
                this.filteredTeams = [...this.teams];
                this.renderTeamsTable();
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error loading teams:', error);
            FumaUtils.ui.showError('teamsTableContainer', 'Failed to load teams: ' + error.message);
        }
    }

    handleSearch(searchTerm) {
        this.filters.search = searchTerm.toLowerCase();
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.teams];

        // Apply search filter
        if (this.filters.search) {
            filtered = filtered.filter(team => 
                team.name.toLowerCase().includes(this.filters.search) ||
                team.shortName.toLowerCase().includes(this.filters.search) ||
                team.city?.toLowerCase().includes(this.filters.search) ||
                team.country?.toLowerCase().includes(this.filters.search)
            );
        }

        // Apply status filter
        if (this.filters.status) {
            filtered = filtered.filter(team => team.status === this.filters.status);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'createdAt':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'playerCount':
                    return (b._count?.players || 0) - (a._count?.players || 0);
                default:
                    return 0;
            }
        });

        this.filteredTeams = filtered;
        this.currentPage = 1; // Reset to first page
        this.renderTeamsTable();
    }

    resetFilters() {
        this.filters = {
            search: '',
            status: '',
            sortBy: 'name'
        };

        // Reset form elements
        document.getElementById('teamSearch').value = '';
        document.getElementById('teamStatusFilter').value = '';
        document.getElementById('teamSortBy').value = 'name';

        this.filteredTeams = [...this.teams];
        this.renderTeamsTable();
    }

    renderTeamsTable() {
        const container = document.getElementById('teamsTableContainer');
        if (!container) return;

        if (this.filteredTeams.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No teams found</h5>
                    <p class="text-muted">Try adjusting your search criteria or add a new team.</p>
                    <button class="btn btn-primary" onclick="window.adminTeams.showTeamModal()">
                        <i class="fas fa-plus me-1"></i> Add First Team
                    </button>
                </div>
            `;
            return;
        }

        // Calculate pagination
        const totalPages = Math.ceil(this.filteredTeams.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedTeams = this.filteredTeams.slice(startIndex, endIndex);

        const tableHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <span class="text-muted">
                        Showing ${startIndex + 1}-${Math.min(endIndex, this.filteredTeams.length)} of ${this.filteredTeams.length} teams
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
                            <th>Logo</th>
                            <th>Team Name</th>
                            <th>Short Name</th>
                            <th>Location</th>
                            <th>Players</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paginatedTeams.map(team => this.renderTeamRow(team)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    renderTeamRow(team) {
        const playerCount = team._count?.players || 0;
        const matchCount = (team._count?.homeMatches || 0) + (team._count?.awayMatches || 0);

        return `
            <tr>
                <td>
                    <img src="${team.logoUrl || '/images/default-team-logo.png'}" 
                         alt="${team.name}" 
                         class="rounded-circle" 
                         style="width: 40px; height: 40px; object-fit: cover;"
                         onerror="this.src='/images/default-team-logo.png'">
                </td>
                <td>
                    <div class="fw-bold">${team.name}</div>
                    <small class="text-muted">${team.managerName || 'No manager'}</small>
                </td>
                <td>
                    <span class="badge bg-light text-dark">${team.shortName}</span>
                </td>
                <td>
                    <div>${team.city || 'Unknown'}</div>
                    <small class="text-muted">${team.country || ''}</small>
                </td>
                <td>
                    <span class="badge bg-info">${playerCount} players</span>
                    ${matchCount > 0 ? `<br><small class="text-muted">${matchCount} matches</small>` : ''}
                </td>
                <td>
                    <span class="status-badge status-${team.status.toLowerCase()}">
                        ${FumaUtils.format.capitalize(team.status)}
                    </span>
                </td>
                <td>
                    <div>${FumaUtils.date.format(team.createdAt)}</div>
                    <small class="text-muted">${FumaUtils.date.relative(team.createdAt)}</small>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary btn-action" 
                                onclick="window.adminTeams.viewTeam(${team.id})"
                                title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary btn-action" 
                                onclick="window.adminTeams.editTeam(${team.id})"
                                title="Edit Team">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-action" 
                                onclick="window.adminTeams.deleteTeam(${team.id})"
                                title="Delete Team"
                                ${playerCount > 0 || matchCount > 0 ? 'disabled' : ''}>
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
                <a class="page-link" href="#" onclick="window.adminTeams.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="window.adminTeams.goToPage(1)">1</a></li>`;
            if (startPage > 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="window.adminTeams.goToPage(${i})">${i}</a>
                </li>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="window.adminTeams.goToPage(${totalPages})">${totalPages}</a></li>`;
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="window.adminTeams.goToPage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        paginationHTML += '</ul></nav>';
        return paginationHTML;
    }

    goToPage(page) {
        if (page < 1 || page > Math.ceil(this.filteredTeams.length / this.itemsPerPage)) return;
        this.currentPage = page;
        this.renderTeamsTable();
    }

    showTeamModal(teamId = null) {
        const isEdit = teamId !== null;
        const team = isEdit ? this.teams.find(t => t.id === teamId) : null;

        const modalHTML = `
            <div class="modal fade" id="teamModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-users me-2"></i>
                                ${isEdit ? 'Edit Team' : 'Add New Team'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="teamForm">
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="teamName" 
                                                   placeholder="Team Name" required
                                                   value="${team?.name || ''}">
                                            <label for="teamName">Team Name *</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="teamShortName" 
                                                   placeholder="Short Name" required maxlength="10"
                                                   value="${team?.shortName || ''}">
                                            <label for="teamShortName">Short Name *</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-floating mb-3">
                                    <input type="url" class="form-control" id="teamLogoUrl" 
                                           placeholder="Logo URL"
                                           value="${team?.logoUrl || ''}">
                                    <label for="teamLogoUrl">Logo URL</label>
                                </div>

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="teamFoundedYear" 
                                                   placeholder="Founded Year" min="1800" max="${new Date().getFullYear()}"
                                                   value="${team?.foundedYear || ''}">
                                            <label for="teamFoundedYear">Founded Year</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="teamCity" 
                                                   placeholder="City"
                                                   value="${team?.city || ''}">
                                            <label for="teamCity">City</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="teamCountry" 
                                                   placeholder="Country"
                                                   value="${team?.country || ''}">
                                            <label for="teamCountry">Country</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="teamStadium" 
                                                   placeholder="Stadium"
                                                   value="${team?.stadium || ''}">
                                            <label for="teamStadium">Stadium</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="teamStadiumCapacity" 
                                                   placeholder="Stadium Capacity" min="1"
                                                   value="${team?.stadiumCapacity || ''}">
                                            <label for="teamStadiumCapacity">Stadium Capacity</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="teamManagerName" 
                                                   placeholder="Manager Name"
                                                   value="${team?.managerName || ''}">
                                            <label for="teamManagerName">Manager Name</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="teamColors" 
                                                   placeholder="Team Colors"
                                                   value="${team?.teamColors || ''}">
                                            <label for="teamColors">Team Colors</label>
                                        </div>
                                    </div>
                                </div>

                                ${isEdit ? `
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="teamStatus">
                                            <option value="ACTIVE" ${team?.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
                                            <option value="INACTIVE" ${team?.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
                                        </select>
                                        <label for="teamStatus">Status</label>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i>
                                    ${isEdit ? 'Update Team' : 'Create Team'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('teamModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup form submission
        document.getElementById('teamForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTeam(teamId);
        });

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('teamModal'));
        modal.show();

        // Focus on first input
        setTimeout(() => {
            document.getElementById('teamName').focus();
        }, 300);
    }

    async saveTeam(teamId = null) {
        const form = document.getElementById('teamForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Saving...';
            submitBtn.disabled = true;

            // Collect form data
            const teamData = {
                name: document.getElementById('teamName').value.trim(),
                shortName: document.getElementById('teamShortName').value.trim(),
                logoUrl: document.getElementById('teamLogoUrl').value.trim() || null,
                foundedYear: parseInt(document.getElementById('teamFoundedYear').value) || null,
                city: document.getElementById('teamCity').value.trim() || null,
                country: document.getElementById('teamCountry').value.trim() || null,
                stadium: document.getElementById('teamStadium').value.trim() || null,
                stadiumCapacity: parseInt(document.getElementById('teamStadiumCapacity').value) || null,
                managerName: document.getElementById('teamManagerName').value.trim() || null,
                teamColors: document.getElementById('teamColors').value.trim() || null
            };

            // Add status for edit mode
            if (teamId) {
                teamData.status = document.getElementById('teamStatus').value;
            }

            // Validate required fields
            if (!teamData.name || !teamData.shortName) {
                throw new Error('Team name and short name are required');
            }

            // Save team
            let response;
            if (teamId) {
                response = await apiClient.updateTeam(teamId, teamData);
            } else {
                response = await apiClient.createTeam(teamData);
            }

            if (response.success) {
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('teamModal')).hide();
                
                // Reload teams
                await this.loadTeams();
                
                // Show success message
                FumaUtils.ui.showToast(
                    `Team ${teamId ? 'updated' : 'created'} successfully`, 
                    'success'
                );
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error saving team:', error);
            FumaUtils.ui.showToast('Error: ' + error.message, 'danger');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async viewTeam(teamId) {
        try {
            const response = await apiClient.getTeam(teamId);
            if (response.success) {
                this.showTeamDetailsModal(response.data.team);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error viewing team:', error);
            FumaUtils.ui.showToast('Error loading team details: ' + error.message, 'danger');
        }
    }

    showTeamDetailsModal(team) {
        const modalHTML = `
            <div class="modal fade" id="teamDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <img src="${team.logoUrl || '/images/default-team-logo.png'}" 
                                     alt="${team.name}" 
                                     class="rounded-circle me-2" 
                                     style="width: 32px; height: 32px; object-fit: cover;">
                                ${team.name}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3">Basic Information</h6>
                                    <table class="table table-sm">
                                        <tr><td class="fw-bold">Full Name:</td><td>${team.name}</td></tr>
                                        <tr><td class="fw-bold">Short Name:</td><td>${team.shortName}</td></tr>
                                        <tr><td class="fw-bold">Founded:</td><td>${team.foundedYear || 'Unknown'}</td></tr>
                                        <tr><td class="fw-bold">Status:</td><td>
                                            <span class="status-badge status-${team.status.toLowerCase()}">
                                                ${FumaUtils.format.capitalize(team.status)}
                                            </span>
                                        </td></tr>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3">Location & Stadium</h6>
                                    <table class="table table-sm">
                                        <tr><td class="fw-bold">City:</td><td>${team.city || 'Unknown'}</td></tr>
                                        <tr><td class="fw-bold">Country:</td><td>${team.country || 'Unknown'}</td></tr>
                                        <tr><td class="fw-bold">Stadium:</td><td>${team.stadium || 'Unknown'}</td></tr>
                                        <tr><td class="fw-bold">Capacity:</td><td>${team.stadiumCapacity ? FumaUtils.format.number(team.stadiumCapacity) : 'Unknown'}</td></tr>
                                    </table>
                                </div>
                            </div>
                            
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3">Team Details</h6>
                                    <table class="table table-sm">
                                        <tr><td class="fw-bold">Manager:</td><td>${team.managerName || 'Unknown'}</td></tr>
                                        <tr><td class="fw-bold">Colors:</td><td>${team.teamColors || 'Unknown'}</td></tr>
                                        <tr><td class="fw-bold">Players:</td><td>${team.players?.length || 0}</td></tr>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3">Statistics</h6>
                                    <table class="table table-sm">
                                        <tr><td class="fw-bold">Home Matches:</td><td>${team._count?.homeMatches || 0}</td></tr>
                                        <tr><td class="fw-bold">Away Matches:</td><td>${team._count?.awayMatches || 0}</td></tr>
                                        <tr><td class="fw-bold">Tournaments:</td><td>${team._count?.tournamentTeams || 0}</td></tr>
                                    </table>
                                </div>
                            </div>

                            ${team.players && team.players.length > 0 ? `
                                <div class="mt-3">
                                    <h6 class="fw-bold mb-3">Squad (${team.players.length} players)</h6>
                                    <div class="row">
                                        ${team.players.map(player => `
                                            <div class="col-md-6 mb-2">
                                                <div class="d-flex align-items-center">
                                                    <span class="badge bg-primary me-2">${player.jerseyNumber || 'N/A'}</span>
                                                    <span>${player.firstName} ${player.lastName}</span>
                                                    <small class="text-muted ms-auto">${FumaUtils.format.position(player.position)}</small>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="window.adminTeams.editTeam(${team.id})">
                                <i class="fas fa-edit me-1"></i> Edit Team
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('teamDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM and show
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('teamDetailsModal'));
        modal.show();
    }

    editTeam(teamId) {
        // Close details modal if open
        const detailsModal = document.getElementById('teamDetailsModal');
        if (detailsModal) {
            bootstrap.Modal.getInstance(detailsModal)?.hide();
        }
        
        // Show edit modal
        this.showTeamModal(teamId);
    }

    async deleteTeam(teamId) {
        const team = this.teams.find(t => t.id === teamId);
        if (!team) return;

        const confirmed = await FumaUtils.ui.confirm(
            `Are you sure you want to delete "${team.name}"? This action cannot be undone.`,
            'Delete Team'
        );

        if (!confirmed) return;

        try {
            const response = await apiClient.deleteTeam(teamId);
            
            if (response.success) {
                await this.loadTeams();
                FumaUtils.ui.showToast('Team deleted successfully', 'success');
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Error deleting team:', error);
            FumaUtils.ui.showToast('Error deleting team: ' + error.message, 'danger');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminTeams = new AdminTeams();
});
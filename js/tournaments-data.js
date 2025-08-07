/**
 * Tournaments Data Handler
 * Handles frontend-backend integration for tournaments.html
 * Features: filtering, grouping, pagination, responsive design
 */

class TournamentsHandler {
    constructor() {
        this.tournaments = [];
        this.filteredTournaments = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
        this.currentFilters = {
            status: '',
            type: '',
            search: '',
            dateRange: ''
        };
        this.isLoading = false;
        this.currentView = 'table'; // 'table' or 'cards'
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTournaments();
        this.setupResponsiveView();
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('statusFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('typeFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('dateFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value.trim();
                    this.applyFilters();
                }, 300);
            });
        }

        // View toggle buttons
        document.getElementById('tableViewBtn')?.addEventListener('click', () => this.switchView('table'));
        document.getElementById('cardViewBtn')?.addEventListener('click', () => this.switchView('cards'));

        // Create tournament modal
        document.getElementById('createTournamentBtn')?.addEventListener('click', () => {
            this.createTournament();
        });
    }

    // Transform tournament data to ensure required properties
    transformTournamentData(tournament) {
        return {
            ...tournament,
            matchesCount: tournament.matchesCount || tournament.totalMatches || 0,
            completedMatches: tournament.completedMatches || tournament.playedMatches || 0,
            // Ensure other required properties exist
            name: tournament.name || tournament.title || 'Unknown Tournament',
            status: tournament.status || 'UPCOMING',
            startDate: tournament.startDate || tournament.start_date || new Date().toISOString(),
            endDate: tournament.endDate || tournament.end_date || new Date().toISOString(),
            teamsCount: tournament.teamsCount || tournament.teams_count || 0,
            prizePool: tournament.prizePool || tournament.prize_pool || 0
        };
    }

    async loadTournaments() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoadingState();

            // Check if API client is available
            if (typeof window.apiClient === 'undefined') {
                throw new Error('API client not available');
            }

            const response = await window.apiClient.getTournaments({
                page: this.currentPage,
                limit: this.itemsPerPage,
                // ...this.currentFilters
            });

            if (response.success) {
                this.tournaments = (response.data || []).map(tournament => 
                    this.transformTournamentData(tournament)
                );
                this.updatePagination(response.pagination);
                this.applyFilters();
                this.updateStats();
            } else {
                throw new Error(response.message || 'Failed to load tournaments');
            }
        } catch (error) {
            console.error('Error loading tournaments:', error);
            // Show demo data instead of error for development
            this.loadDemoData();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    // Load demo data when API is not available
    loadDemoData() {
        console.log('Loading demo tournament data...');
        this.tournaments = [
            {
                id: 1,
                name: 'Premier League 2024',
                description: 'The premier football tournament of the year',
                tournamentType: 'LEAGUE',
                status: 'ONGOING',
                startDate: '2024-01-15',
                endDate: '2024-06-30',
                maxTeams: 20,
                teamsCount: 18,
                matchesCount: 45,
                completedMatches: 32,
                prizeMoney: 100000,
                location: 'Jakarta',
                createdAt: '2024-01-01'
            },
            {
                id: 2,
                name: 'Champions Cup',
                description: 'Elite knockout tournament',
                tournamentType: 'KNOCKOUT',
                status: 'UPCOMING',
                startDate: '2024-07-01',
                endDate: '2024-08-15',
                maxTeams: 16,
                teamsCount: 12,
                matchesCount: 15,
                completedMatches: 0,
                prizeMoney: 50000,
                location: 'Bandung',
                createdAt: '2024-01-10'
            },
            {
                id: 3,
                name: 'Winter Tournament',
                description: 'Seasonal football competition',
                tournamentType: 'GROUP_KNOCKOUT',
                status: 'COMPLETED',
                startDate: '2023-12-01',
                endDate: '2024-01-31',
                maxTeams: 8,
                teamsCount: 8,
                matchesCount: 20,
                completedMatches: 20,
                prizeMoney: 25000,
                location: 'Surabaya',
                createdAt: '2023-11-15'
            },
            {
                id: 4,
                name: 'Summer League',
                description: 'Hot summer football action',
                tournamentType: 'LEAGUE',
                status: 'ONGOING',
                startDate: '2024-03-01',
                endDate: '2024-05-30',
                maxTeams: 12,
                teamsCount: 12,
                matchesCount: 66,
                completedMatches: 45,
                prizeMoney: 75000,
                location: 'Yogyakarta',
                createdAt: '2024-02-15'
            },
            {
                id: 5,
                name: 'Youth Championship',
                description: 'Tournament for young talents',
                tournamentType: 'KNOCKOUT',
                status: 'UPCOMING',
                startDate: '2024-08-01',
                endDate: '2024-09-15',
                maxTeams: 24,
                teamsCount: 16,
                matchesCount: 23,
                completedMatches: 0,
                prizeMoney: 30000,
                location: 'Medan',
                createdAt: '2024-03-01'
            }
        ];

        this.updatePagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: this.tournaments.length,
            hasNext: false,
            hasPrev: false
        });

        this.applyFilters();
        this.updateStats();
    }

    applyFilters() {
        // Get current filter values
        this.currentFilters.status = document.getElementById('statusFilter')?.value || '';
        this.currentFilters.type = document.getElementById('typeFilter')?.value || '';
        this.currentFilters.dateRange = document.getElementById('dateFilter')?.value || '';

        // Apply filters
        this.filteredTournaments = this.tournaments.filter(tournament => {
            // Status filter
            if (this.currentFilters.status && tournament.status !== this.currentFilters.status) {
                return false;
            }

            // Type filter
            if (this.currentFilters.type && tournament.tournamentType !== this.currentFilters.type) {
                return false;
            }

            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchableText = [
                    tournament.name,
                    tournament.description,
                    tournament.location
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Date range filter
            if (this.currentFilters.dateRange) {
                const now = new Date();
                const startDate = new Date(tournament.startDate);
                
                switch (this.currentFilters.dateRange) {
                    case 'this_month':
                        if (startDate.getMonth() !== now.getMonth() || startDate.getFullYear() !== now.getFullYear()) {
                            return false;
                        }
                        break;
                    case 'next_month':
                        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                        if (startDate.getMonth() !== nextMonth.getMonth() || startDate.getFullYear() !== nextMonth.getFullYear()) {
                            return false;
                        }
                        break;
                    case 'past':
                        if (startDate > now) {
                            return false;
                        }
                        break;
                }
            }

            return true;
        });

        this.renderTournaments();
        this.updateStats();
    }

    renderTournaments() {
        const container = document.getElementById('tournamentsContainer');
        if (!container) return;

        if (this.filteredTournaments.length === 0) {
            this.showEmptyState(container);
            return;
        }

        // Group tournaments by status
        const groupedTournaments = this.groupTournamentsByStatus(this.filteredTournaments);

        if (this.currentView === 'cards') {
            this.renderCardsView(container, groupedTournaments);
        } else {
            this.renderTableView(container, groupedTournaments);
        }

        this.renderPagination();
    }

    groupTournamentsByStatus(tournaments) {
        const groups = {
            ONGOING: [],
            UPCOMING: [],
            COMPLETED: [],
            CANCELLED: []
        };

        tournaments.forEach(tournament => {
            if (groups[tournament.status]) {
                groups[tournament.status].push(tournament);
            }
        });

        return groups;
    }

    renderTableView(container, groupedTournaments) {
        container.className = 'tournaments-container table-view';
        
        let html = '';
        
        Object.entries(groupedTournaments).forEach(([status, tournaments]) => {
            if (tournaments.length === 0) return;

            html += `
                <div class="tournament-status-group">
                    <h5 class="text-${this.getStatusColor(status)}">
                        <i class="fas fa-circle me-2"></i>
                        ${this.formatStatus(status)} (${tournaments.length})
                    </h5>
                    ${tournaments.map(tournament => this.renderTournamentRow(tournament)).join('')}
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderCardsView(container, groupedTournaments) {
        container.className = 'tournaments-container card-view';
        
        let html = '';
        
        Object.entries(groupedTournaments).forEach(([status, tournaments]) => {
            if (tournaments.length === 0) return;

            html += `
                <div class="tournament-status-group">
                    <h5 class="text-${this.getStatusColor(status)}">
                        <i class="fas fa-circle me-2"></i>
                        ${this.formatStatus(status)} (${tournaments.length})
                    </h5>
                    <div class="row">
                        ${tournaments.map(tournament => `
                            <div class="col-md-6 col-lg-4 mb-3">
                                ${this.renderTournamentCard(tournament)}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderTournamentRow(tournament) {
        // Ensure we have valid numbers for progress calculation
        const matchesCount = tournament.matchesCount || 0;
        const completedMatches = tournament.completedMatches || 0;
        
        const progress = matchesCount > 0 ? 
            Math.round((completedMatches / matchesCount) * 100) : 0;

        return `
            <div class="tournament-card p-3 mb-2" onclick="window.tournamentsHandler.viewTournament(${tournament.id})">
                <div class="row align-items-center">
                    <div class="col-md-4">
                        <div class="d-flex align-items-center">
                            <div class="tournament-logo me-3">
                                <i class="fas fa-trophy fa-2x text-primary"></i>
                            </div>
                            <div>
                                <h6 class="mb-1 fw-bold">${tournament.name}</h6>
                                <small class="text-muted">${tournament.description || 'No description'}</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-2 text-center">
                        <div class="tournament-meta">
                            <div class="fw-bold">${tournament.teamsCount}/${tournament.maxTeams}</div>
                            <small class="text-muted">Teams</small>
                        </div>
                    </div>
                    <div class="col-md-2 text-center">
                        <div class="tournament-meta">
                            <div class="fw-bold">${this.formatTournamentType(tournament.tournamentType)}</div>
                            <small class="text-muted">Type</small>
                        </div>
                    </div>
                    <div class="col-md-2 text-center">
                        <div class="tournament-meta">
                            <div class="fw-bold">${progress}%</div>
                            <div class="tournament-progress mt-1">
                                <div class="tournament-progress-bar" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-2 text-end">
                        <span class="badge bg-${this.getStatusColor(tournament.status)}">${this.formatStatus(tournament.status)}</span>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); window.open('tournament-detail.html?id=${tournament.id}', '_blank')">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTournamentCard(tournament) {
        // Ensure we have valid numbers for progress calculation
        const matchesCount = tournament.matchesCount || 0;
        const completedMatches = tournament.completedMatches || 0;
        
        const progress = matchesCount > 0 ? 
            Math.round((completedMatches / matchesCount) * 100) : 0;

        return `
            <div class="tournament-card h-100" onclick="window.tournamentsHandler.viewTournament(${tournament.id})">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="tournament-logo">
                            <i class="fas fa-trophy fa-2x text-primary"></i>
                        </div>
                        <span class="badge bg-${this.getStatusColor(tournament.status)}">${this.formatStatus(tournament.status)}</span>
                    </div>
                    
                    <h6 class="card-title fw-bold mb-2">${tournament.name}</h6>
                    <p class="card-text text-muted small mb-3">${tournament.description || 'No description available'}</p>
                    
                    <div class="tournament-stats mb-3">
                        <div class="row text-center">
                            <div class="col-4">
                                <div class="stat-item">
                                    <div class="stat-value text-primary">${tournament.teamsCount}</div>
                                    <div class="stat-label">Teams</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="stat-item">
                                    <div class="stat-value text-success">${tournament.completedMatches}</div>
                                    <div class="stat-label">Matches</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="stat-item">
                                    <div class="stat-value text-info">${progress}%</div>
                                    <div class="stat-label">Progress</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tournament-progress mb-3">
                        <div class="tournament-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    
                    <div class="tournament-meta">
                        <div class="row">
                            <div class="col-6">
                                <small class="text-muted">Type:</small><br>
                                <small class="fw-bold">${this.formatTournamentType(tournament.tournamentType)}</small>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">Prize:</small><br>
                                <small class="fw-bold">${tournament.prizeMoney ? this.formatCurrency(tournament.prizeMoney) : 'N/A'}</small>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-12">
                                <small class="text-muted">
                                    <i class="fas fa-calendar me-1"></i>
                                    ${this.formatDate(tournament.startDate)} - ${this.formatDate(tournament.endDate)}
                                </small>
                            </div>
                        </div>
                        ${tournament.location ? `
                            <div class="row mt-1">
                                <div class="col-12">
                                    <small class="text-muted">
                                        <i class="fas fa-map-marker-alt me-1"></i>
                                        ${tournament.location}
                                    </small>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-outline-primary btn-sm w-100" onclick="event.stopPropagation(); window.open('tournament-detail.html?id=${tournament.id}', '_blank')">
                        <i class="fas fa-eye me-2"></i>View Details
                    </button>
                </div>
            </div>
        `;
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <h5>No tournaments found</h5>
                <p>No tournaments match your current filters. Try adjusting your search criteria.</p>
                <button class="btn btn-primary" onclick="window.tournamentsHandler.clearFilters()">
                    <i class="fas fa-refresh me-2"></i>Clear Filters
                </button>
            </div>
        `;
    }

    clearFilters() {
        // Reset all filters
        document.getElementById('statusFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('dateFilter').value = '';
        document.getElementById('searchInput').value = '';
        
        this.currentFilters = {
            status: '',
            type: '',
            search: '',
            dateRange: ''
        };
        
        this.applyFilters();
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.getElementById('tableViewBtn').classList.toggle('active', view === 'table');
        document.getElementById('cardViewBtn').classList.toggle('active', view === 'cards');
        
        this.renderTournaments();
    }

    async createTournament() {
        const form = document.getElementById('createTournamentForm');
        if (!form) return;

        const formData = new FormData(form);
        const tournamentData = {
            name: document.getElementById('tournamentName').value,
            description: document.getElementById('tournamentDescription').value,
            tournamentType: document.getElementById('tournamentType').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            maxTeams: parseInt(document.getElementById('maxTeams').value),
            prizeMoney: parseFloat(document.getElementById('prizeMoney').value) || null,
            location: document.getElementById('location').value,
            rules: document.getElementById('rules').value
        };

        try {
            if (window.apiClient) {
                const response = await window.apiClient.createTournament(tournamentData);
                if (response.success) {
                    this.showToast('Tournament created successfully!', 'success');
                    bootstrap.Modal.getInstance(document.getElementById('createTournamentModal')).hide();
                    this.loadTournaments();
                } else {
                    throw new Error(response.message || 'Failed to create tournament');
                }
            } else {
                // Demo mode - just show success message
                this.showToast('Tournament created successfully! (Demo mode)', 'success');
                bootstrap.Modal.getInstance(document.getElementById('createTournamentModal')).hide();
                form.reset();
            }
        } catch (error) {
            console.error('Error creating tournament:', error);
            this.showToast('Error creating tournament: ' + error.message, 'danger');
        }
    }

    viewTournament(tournamentId) {
        window.open(`tournament-detail.html?id=${tournamentId}`, '_blank');
    }

    updateStats() {
        const totalTournaments = this.tournaments.length;
        const filteredCount = this.filteredTournaments.length;
        
        const countElement = document.getElementById('tournamentsCount');
        if (countElement) {
            if (filteredCount !== totalTournaments) {
                countElement.textContent = `Showing ${filteredCount} of ${totalTournaments} tournaments`;
            } else {
                countElement.textContent = `${totalTournaments} tournament${totalTournaments !== 1 ? 's' : ''} found`;
            }
        }
    }

    updatePagination(pagination) {
        if (!pagination) return;
        
        this.currentPage = pagination.currentPage || 1;
        this.totalPages = pagination.totalPages || 1;
        
        // Update pagination info and controls here if needed
    }

    renderPagination() {
        const paginationContainer = document.getElementById('paginationContainer');
        const paginationInfo = document.getElementById('paginationInfo');
        const paginationList = document.getElementById('paginationList');
        
        if (!paginationContainer || this.totalPages <= 1) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }
        
        paginationContainer.style.display = 'flex';
        
        // Update pagination info
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(start + this.itemsPerPage - 1, this.filteredTournaments.length);
        
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${start}-${end} of ${this.filteredTournaments.length} tournaments`;
        }
        
        // Update pagination controls (simplified for demo)
        if (paginationList) {
            paginationList.innerHTML = `
                <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="window.tournamentsHandler.goToPage(${this.currentPage - 1})">Previous</a>
                </li>
                <li class="page-item active">
                    <a class="page-link" href="#">${this.currentPage}</a>
                </li>
                <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="window.tournamentsHandler.goToPage(${this.currentPage + 1})">Next</a>
                </li>
            `;
        }
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadTournaments();
    }

    setupResponsiveView() {
        // Auto-switch to card view on mobile
        const checkViewport = () => {
            if (window.innerWidth <= 768 && this.currentView === 'table') {
                this.switchView('cards');
            }
        };
        
        window.addEventListener('resize', checkViewport);
        checkViewport();
    }

    showLoadingState() {
        const loadingElement = document.getElementById('loadingState');
        const container = document.getElementById('tournamentsContainer');
        
        if (loadingElement) loadingElement.style.display = 'flex';
        if (container) container.style.display = 'none';
    }

    hideLoadingState() {
        const loadingElement = document.getElementById('loadingState');
        const container = document.getElementById('tournamentsContainer');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (container) container.style.display = 'block';
    }

    showToast(message, type = 'info') {
        if (typeof FumaUtils !== 'undefined' && FumaUtils.ui) {
            FumaUtils.ui.showToast(message, type);
        } else {
            // Fallback alert
            alert(message);
        }
    }

    // Utility methods
    getStatusColor(status) {
        const colors = {
            'ONGOING': 'success',
            'UPCOMING': 'warning',
            'COMPLETED': 'secondary',
            'CANCELLED': 'danger'
        };
        return colors[status] || 'secondary';
    }

    formatStatus(status) {
        const formats = {
            'ONGOING': 'Ongoing',
            'UPCOMING': 'Upcoming',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled'
        };
        return formats[status] || status;
    }

    formatTournamentType(type) {
        const formats = {
            'LEAGUE': 'League',
            'KNOCKOUT': 'Knockout',
            'GROUP_KNOCKOUT': 'Group + Knockout'
        };
        return formats[type] || type;
    }

    formatDate(dateString) {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    formatCurrency(amount) {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tournamentsHandler = new TournamentsHandler();
});
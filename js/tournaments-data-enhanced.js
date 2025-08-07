/**
 * Enhanced Tournaments Data Handler - Optimized version
 * Manages tournament data with improved error handling, caching, and performance
 */

class EnhancedTournamentsHandler {
    constructor() {
        this.tournaments = [];
        this.filteredTournaments = [];
        this.currentFilters = {};
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalPages = 1;
        this.isLoading = false;
        this.viewMode = 'grid'; // 'grid' or 'list'
        this.sortBy = 'startDate';
        this.sortOrder = 'desc';
        
        // Caching
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // Performance optimization
        this.debounceTimeout = null;
        this.searchTimeout = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTournaments();
        this.setupAutoRefresh();
        this.restoreUserPreferences();
    }

    setupEventListeners() {
        // Search functionality with debouncing
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        // Filter controls
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.handleFilter('status', e.target.value);
            });
        }

        // View mode toggle
        const viewToggle = document.querySelectorAll('.view-toggle .btn');
        viewToggle.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleView(e.target.dataset.view);
            });
        });

        // Sort controls
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const [sortBy, sortOrder] = e.target.value.split(':');
                this.handleSort(sortBy, sortOrder);
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.refreshData();
                        break;
                    case 'f':
                        e.preventDefault();
                        searchInput?.focus();
                        break;
                }
            }
        });
    }

    setupAutoRefresh() {
        // Auto-refresh data every 30 seconds if page is visible
        setInterval(() => {
            if (!document.hidden && !this.isLoading) {
                this.loadTournaments(true); // Silent refresh
            }
        }, 30000);
    }

    restoreUserPreferences() {
        // Restore user's preferred view mode and filters
        const preferences = JSON.parse(localStorage.getItem('fuma_tournaments_preferences') || '{}');
        
        if (preferences.viewMode) {
            this.viewMode = preferences.viewMode;
            this.updateViewToggle();
        }
        
        if (preferences.filters) {
            this.currentFilters = preferences.filters;
            this.restoreFilterControls();
        }
    }

    saveUserPreferences() {
        const preferences = {
            viewMode: this.viewMode,
            filters: this.currentFilters,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder
        };
        
        localStorage.setItem('fuma_tournaments_preferences', JSON.stringify(preferences));
    }

    // Enhanced data loading with caching
    async loadTournaments(silent = false) {
        if (this.isLoading && !silent) return;
        
        const cacheKey = this.generateCacheKey();
        const cached = this.getCachedData(cacheKey);
        
        if (cached && !silent) {
            this.tournaments = cached.tournaments;
            this.updatePagination(cached.pagination);
            this.applyFilters();
            this.updateStats();
            return;
        }

        try {
            this.isLoading = true;
            if (!silent) this.showLoadingState();

            // Check if API client is available
            if (typeof window.apiClient === 'undefined') {
                throw new Error('API client not available');
            }

            const params = {
                page: this.currentPage,
                limit: this.itemsPerPage,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder,
                ...this.currentFilters
            };

            const response = await window.apiClient.getTournaments(params);

            if (response.success) {
                const tournaments = (response.data || []).map(tournament => 
                    this.transformTournamentData(tournament)
                );
                
                this.tournaments = tournaments;
                this.updatePagination(response.pagination);
                
                // Cache the data
                this.setCachedData(cacheKey, {
                    tournaments,
                    pagination: response.pagination,
                    timestamp: Date.now()
                });
                
                this.applyFilters();
                this.updateStats();
                
                if (!silent) {
                    FumaUtils.ui.showToast('Tournaments loaded successfully', 'success', 2000);
                }
            } else {
                throw new Error(response.message || 'Failed to load tournaments');
            }
        } catch (error) {
            console.error('Error loading tournaments:', error);
            
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
                    // Show demo data instead of error for better UX
                    this.loadDemoData();
                    FumaUtils.ui.showToast('Using demo data - API unavailable', 'warning', 3000);
                }
            }
        } finally {
            this.isLoading = false;
            if (!silent) this.hideLoadingState();
        }
    }

    // Enhanced data transformation with validation
    transformTournamentData(tournament) {
        // Validate required fields
        if (!tournament.id) {
            console.warn('Tournament missing ID:', tournament);
            tournament.id = Date.now() + Math.random();
        }

        return {
            ...tournament,
            // Ensure numeric fields
            matchesCount: this.parseNumber(tournament.matchesCount || tournament.totalMatches),
            completedMatches: this.parseNumber(tournament.completedMatches || tournament.playedMatches),
            teamsCount: this.parseNumber(tournament.teamsCount || tournament.teams_count),
            prizePool: this.parseNumber(tournament.prizePool || tournament.prize_pool),
            
            // Ensure string fields
            name: tournament.name || tournament.title || 'Unknown Tournament',
            description: tournament.description || tournament.desc || '',
            status: tournament.status || 'UPCOMING',
            
            // Ensure date fields
            startDate: tournament.startDate || tournament.start_date || new Date().toISOString(),
            endDate: tournament.endDate || tournament.end_date || new Date().toISOString(),
            
            // Calculate progress safely
            progress: this.calculateProgress(tournament),
            
            // Add computed fields
            isActive: this.isActiveTournament(tournament),
            daysUntilStart: this.calculateDaysUntilStart(tournament.startDate || tournament.start_date),
            formattedPrizePool: this.formatPrizePool(tournament.prizePool || tournament.prize_pool)
        };
    }

    parseNumber(value) {
        const parsed = parseInt(value) || 0;
        return isNaN(parsed) ? 0 : parsed;
    }

    calculateProgress(tournament) {
        const matchesCount = this.parseNumber(tournament.matchesCount || tournament.totalMatches);
        const completedMatches = this.parseNumber(tournament.completedMatches || tournament.playedMatches);
        
        if (matchesCount === 0) return 0;
        
        const progress = Math.round((completedMatches / matchesCount) * 100);
        return Math.min(100, Math.max(0, progress)); // Ensure 0-100 range
    }

    isActiveTournament(tournament) {
        const status = tournament.status || 'UPCOMING';
        return ['ONGOING', 'ACTIVE', 'LIVE'].includes(status.toUpperCase());
    }

    calculateDaysUntilStart(startDate) {
        if (!startDate) return null;
        
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = start - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    }

    formatPrizePool(prizePool) {
        if (!prizePool) return 'TBD';
        
        const amount = this.parseNumber(prizePool);
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}K`;
        } else {
            return `$${amount}`;
        }
    }

    // Caching methods
    generateCacheKey() {
        return `tournaments_${this.currentPage}_${this.itemsPerPage}_${this.sortBy}_${this.sortOrder}_${JSON.stringify(this.currentFilters)}`;
    }

    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached;
        }
        this.cache.delete(key);
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, { ...data, timestamp: Date.now() });
        
        // Limit cache size
        if (this.cache.size > 10) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    clearCache() {
        this.cache.clear();
    }

    // Enhanced filtering with performance optimization
    handleSearch(query) {
        this.currentFilters.search = query.trim();
        this.currentPage = 1;
        this.applyFiltersDebounced();
    }

    handleFilter(type, value) {
        if (value === 'all' || value === '') {
            delete this.currentFilters[type];
        } else {
            this.currentFilters[type] = value;
        }
        
        this.currentPage = 1;
        this.applyFilters();
        this.saveUserPreferences();
    }

    handleSort(sortBy, sortOrder) {
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.currentPage = 1;
        this.clearCache(); // Clear cache when sort changes
        this.loadTournaments();
        this.saveUserPreferences();
    }

    applyFiltersDebounced() {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    applyFilters() {
        let filtered = [...this.tournaments];

        // Apply search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(tournament =>
                tournament.name.toLowerCase().includes(searchTerm) ||
                (tournament.description && tournament.description.toLowerCase().includes(searchTerm))
            );
        }

        // Apply status filter
        if (this.currentFilters.status) {
            filtered = filtered.filter(tournament =>
                tournament.status === this.currentFilters.status
            );
        }

        // Apply date range filter
        if (this.currentFilters.dateRange) {
            const now = new Date();
            filtered = filtered.filter(tournament => {
                const startDate = new Date(tournament.startDate);
                switch (this.currentFilters.dateRange) {
                    case 'upcoming':
                        return startDate > now;
                    case 'ongoing':
                        const endDate = new Date(tournament.endDate);
                        return startDate <= now && endDate >= now;
                    case 'completed':
                        return new Date(tournament.endDate) < now;
                    default:
                        return true;
                }
            });
        }

        this.filteredTournaments = filtered;
        this.renderTournaments();
        this.updateFilterCounts();
    }

    // Enhanced rendering with performance optimization
    renderTournaments() {
        const container = document.getElementById('tournamentsContainer');
        if (!container) return;

        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();

        if (this.filteredTournaments.length === 0) {
            this.renderEmptyState(fragment);
        } else {
            this.filteredTournaments.forEach((tournament, index) => {
                const element = this.viewMode === 'grid' 
                    ? this.createTournamentCard(tournament, index)
                    : this.createTournamentRow(tournament, index);
                fragment.appendChild(element);
            });
        }

        // Update container class based on view mode
        container.className = this.viewMode === 'grid' ? 'row' : 'list-view';
        
        // Clear and append new content
        container.innerHTML = '';
        container.appendChild(fragment);

        // Update pagination
        this.renderPagination();
    }

    createTournamentCard(tournament, index) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4';
        
        // Add stagger animation delay
        col.style.animationDelay = `${index * 0.1}s`;
        col.classList.add('animate__animated', 'animate__fadeInUp');

        const statusColor = this.getStatusColor(tournament.status);
        const progress = tournament.progress || 0;

        col.innerHTML = `
            <div class="tournament-card h-100" onclick="window.tournamentsHandler.viewTournament(${tournament.id})" role="button" tabindex="0">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="tournament-logo">
                            <i class="fas fa-trophy fa-2x text-primary"></i>
                        </div>
                        <span class="badge bg-${statusColor}">${this.formatStatus(tournament.status)}</span>
                    </div>
                    
                    <h5 class="card-title mb-2" title="${tournament.name}">${this.truncateText(tournament.name, 30)}</h5>
                    <p class="card-text text-muted small mb-3" title="${tournament.description}">${this.truncateText(tournament.description || 'No description available', 80)}</p>
                    
                    <div class="tournament-stats mb-3">
                        <div class="row text-center">
                            <div class="col-4">
                                <div class="stat-item">
                                    <div class="stat-value text-primary">${tournament.teamsCount || 0}</div>
                                    <div class="stat-label">Teams</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="stat-item">
                                    <div class="stat-value text-success">${tournament.completedMatches || 0}</div>
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
                    
                    <div class="tournament-footer">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">
                                <i class="fas fa-calendar-alt me-1"></i>
                                ${FumaUtils.date.format(new Date(tournament.startDate), 'DD/MM/YYYY')}
                            </span>
                            <span class="text-success fw-bold">${tournament.formattedPrizePool}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add keyboard support
        col.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.viewTournament(tournament.id);
            }
        });

        return col;
    }

    createTournamentRow(tournament, index) {
        const row = document.createElement('div');
        row.className = 'tournament-card p-3 mb-2';
        row.style.animationDelay = `${index * 0.05}s`;
        row.classList.add('animate__animated', 'animate__fadeInLeft');
        
        row.setAttribute('onclick', `window.tournamentsHandler.viewTournament(${tournament.id})`);
        row.setAttribute('role', 'button');
        row.setAttribute('tabindex', '0');

        const statusColor = this.getStatusColor(tournament.status);
        const progress = tournament.progress || 0;

        row.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-4">
                    <div class="d-flex align-items-center">
                        <div class="tournament-logo me-3">
                            <i class="fas fa-trophy fa-lg text-primary"></i>
                        </div>
                        <div>
                            <h6 class="mb-1">${tournament.name}</h6>
                            <span class="badge bg-${statusColor} small">${this.formatStatus(tournament.status)}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="tournament-stats-row">
                        <span class="text-muted small">
                            <i class="fas fa-users me-1"></i>${tournament.teamsCount || 0} Teams
                        </span>
                        <span class="text-muted small ms-3">
                            <i class="fas fa-gamepad me-1"></i>${tournament.completedMatches || 0} Matches
                        </span>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="progress-container">
                        <div class="fw-bold">${progress}%</div>
                        <div class="tournament-progress mt-1">
                            <div class="tournament-progress-bar" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="text-muted small">
                        <i class="fas fa-calendar-alt me-1"></i>
                        ${FumaUtils.date.format(new Date(tournament.startDate), 'DD/MM')}
                    </div>
                </div>
                <div class="col-md-1 text-end">
                    <span class="text-success fw-bold">${tournament.formattedPrizePool}</span>
                </div>
            </div>
        `;

        return row;
    }

    renderEmptyState(container) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state col-12';
        
        const hasFilters = Object.keys(this.currentFilters).length > 0;
        
        emptyDiv.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-trophy fa-3x text-muted mb-3"></i>
                <h4>${hasFilters ? 'No tournaments found' : 'No tournaments available'}</h4>
                <p class="text-muted">
                    ${hasFilters 
                        ? 'Try adjusting your filters or search criteria.' 
                        : 'Check back later for new tournaments.'
                    }
                </p>
                ${hasFilters ? `
                    <button class="btn btn-primary" onclick="window.tournamentsHandler.clearFilters()">
                        <i class="fas fa-times me-1"></i> Clear Filters
                    </button>
                ` : ''}
            </div>
        `;
        
        container.appendChild(emptyDiv);
    }

    // Utility methods
    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    getStatusColor(status) {
        const colors = {
            'ONGOING': 'primary',
            'ACTIVE': 'primary',
            'LIVE': 'danger',
            'UPCOMING': 'warning',
            'COMPLETED': 'secondary',
            'FINISHED': 'secondary',
            'CANCELLED': 'danger',
            'POSTPONED': 'info'
        };
        
        return colors[status?.toUpperCase()] || 'secondary';
    }

    formatStatus(status) {
        if (!status) return 'Unknown';
        
        const formatted = {
            'ONGOING': 'Ongoing',
            'ACTIVE': 'Active',
            'LIVE': 'Live',
            'UPCOMING': 'Upcoming',
            'COMPLETED': 'Completed',
            'FINISHED': 'Finished',
            'CANCELLED': 'Cancelled',
            'POSTPONED': 'Postponed'
        };
        
        return formatted[status.toUpperCase()] || status;
    }

    // Navigation and actions
    viewTournament(tournamentId) {
        if (!tournamentId) return;
        
        // Add loading state to clicked tournament
        const clickedCard = event?.target?.closest('.tournament-card');
        if (clickedCard) {
            clickedCard.style.opacity = '0.7';
            clickedCard.style.pointerEvents = 'none';
        }
        
        // Navigate to tournament detail page
        window.location.href = `tournament-detail.html?id=${tournamentId}`;
    }

    toggleView(mode) {
        if (mode === this.viewMode) return;
        
        this.viewMode = mode;
        this.updateViewToggle();
        this.renderTournaments();
        this.saveUserPreferences();
        
        FumaUtils.ui.showToast(`Switched to ${mode} view`, 'info', 1500);
    }

    updateViewToggle() {
        const toggleButtons = document.querySelectorAll('.view-toggle .btn');
        toggleButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === this.viewMode) {
                btn.classList.add('active');
            }
        });
    }

    clearFilters() {
        this.currentFilters = {};
        this.currentPage = 1;
        
        // Reset filter controls
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) statusFilter.value = 'all';
        
        this.applyFilters();
        this.saveUserPreferences();
        
        FumaUtils.ui.showToast('Filters cleared', 'success', 2000);
    }

    refreshData() {
        this.clearCache();
        this.loadTournaments();
        FumaUtils.ui.showToast('Data refreshed', 'success', 2000);
    }

    // Enhanced pagination with better UX
    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) return;
        
        this.currentPage = page;
        this.loadTournaments();
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderPagination() {
        const container = document.getElementById('paginationContainer');
        if (!container || this.totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        const pagination = document.createElement('nav');
        pagination.innerHTML = `
            <ul class="pagination justify-content-center">
                ${this.currentPage > 1 ? `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="window.tournamentsHandler.goToPage(1)">
                            <i class="fas fa-angle-double-left"></i>
                        </a>
                    </li>
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="window.tournamentsHandler.goToPage(${this.currentPage - 1})">
                            <i class="fas fa-angle-left"></i>
                        </a>
                    </li>
                ` : ''}
                
                ${this.generatePageNumbers()}
                
                ${this.currentPage < this.totalPages ? `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="window.tournamentsHandler.goToPage(${this.currentPage + 1})">
                            <i class="fas fa-angle-right"></i>
                        </a>
                    </li>
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="window.tournamentsHandler.goToPage(${this.totalPages})">
                            <i class="fas fa-angle-double-right"></i>
                        </a>
                    </li>
                ` : ''}
            </ul>
        `;

        container.innerHTML = '';
        container.appendChild(pagination);
    }

    generatePageNumbers() {
        const pages = [];
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(`
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="window.tournamentsHandler.goToPage(${i})">${i}</a>
                </li>
            `);
        }

        return pages.join('');
    }

    updatePagination(pagination) {
        if (pagination) {
            this.totalPages = pagination.totalPages || Math.ceil(pagination.total / pagination.limit) || 1;
            this.currentPage = pagination.currentPage || pagination.page || 1;
        }
    }

    updateStats() {
        const totalElement = document.getElementById('tournamentsCount');
        if (totalElement) {
            totalElement.textContent = this.tournaments.length;
        }

        const filteredElement = document.getElementById('filteredCount');
        if (filteredElement) {
            filteredElement.textContent = this.filteredTournaments.length;
        }
    }

    updateFilterCounts() {
        // Update filter option counts
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            const statusCounts = this.tournaments.reduce((acc, tournament) => {
                acc[tournament.status] = (acc[tournament.status] || 0) + 1;
                return acc;
            }, {});

            Array.from(statusFilter.options).forEach(option => {
                if (option.value !== 'all') {
                    const count = statusCounts[option.value] || 0;
                    option.textContent = `${option.textContent.split(' (')[0]} (${count})`;
                }
            });
        }
    }

    // Loading states
    showLoadingState() {
        const container = document.getElementById('tournamentsContainer');
        if (container) {
            FumaUtils.ui.showLoading(container, 'Loading tournaments...');
        }

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Loading...';
            refreshBtn.disabled = true;
        }
    }

    hideLoadingState() {
        const container = document.getElementById('tournamentsContainer');
        if (container) {
            FumaUtils.ui.hideLoading(container);
        }

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Refresh';
            refreshBtn.disabled = false;
        }
    }

    // Demo data fallback
    loadDemoData() {
        this.tournaments = [
            {
                id: 1,
                name: 'Premier League 2023',
                description: 'The most competitive league with 20 top teams battling for the championship',
                status: 'ONGOING',
                startDate: '2023-06-01T00:00:00Z',
                endDate: '2023-07-30T00:00:00Z',
                matchesCount: 45,
                completedMatches: 32,
                teamsCount: 20,
                prizePool: 1000000,
                progress: 71,
                isActive: true,
                daysUntilStart: 0,
                formattedPrizePool: '$1.0M'
            },
            {
                id: 2,
                name: 'Champions Cup',
                description: 'Elite knockout tournament featuring 16 top teams',
                status: 'UPCOMING',
                startDate: '2023-08-10T00:00:00Z',
                endDate: '2023-09-25T00:00:00Z',
                matchesCount: 15,
                completedMatches: 0,
                teamsCount: 16,
                prizePool: 500000,
                progress: 0,
                isActive: false,
                daysUntilStart: 45,
                formattedPrizePool: '$500K'
            },
            {
                id: 3,
                name: 'Winter Championship',
                description: 'Annual winter tournament with exciting matches',
                status: 'COMPLETED',
                startDate: '2023-01-05T00:00:00Z',
                endDate: '2023-02-20T00:00:00Z',
                matchesCount: 20,
                completedMatches: 20,
                teamsCount: 12,
                prizePool: 250000,
                progress: 100,
                isActive: false,
                daysUntilStart: 0,
                formattedPrizePool: '$250K'
            }
        ];

        this.updatePagination({ totalPages: 1, currentPage: 1 });
        this.applyFilters();
        this.updateStats();
    }

    restoreFilterControls() {
        Object.keys(this.currentFilters).forEach(key => {
            const control = document.getElementById(`${key}Filter`) || document.getElementById('searchInput');
            if (control) {
                control.value = this.currentFilters[key];
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tournamentsHandler = new EnhancedTournamentsHandler();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedTournamentsHandler;
}
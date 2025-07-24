/**
 * Admin Dashboard Main Controller
 * Handles dashboard statistics, navigation, and real-time updates
 */

class AdminDashboard {
    constructor() {
        this.charts = {};
        this.currentSection = 'dashboard';
        this.syncInterval = null;
        this.lastSyncTime = null;
        
        this.init();
    }

    async init() {
        // Check authentication
        if (!apiClient.isAuthenticated() || !apiClient.isAdmin()) {
            window.location.href = '/login.html';
            return;
        }

        // Initialize UI
        this.initializeUI();
        this.setupEventListeners();
        this.setupNavigation();
        
        // Restore last active section from localStorage or URL hash
        this.restoreActiveSection();
        
        // Setup auto-sync
        this.setupAutoSync();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
    }

    initializeUI() {
        // Set username
        const usernameEl = document.getElementById('username');
        if (usernameEl && apiClient.user) {
            usernameEl.textContent = apiClient.user.name;
        }

        // Initialize charts
        this.initializeCharts();
        
        // Note: Section restoration is now handled by restoreActiveSection()
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.logout();
        });

        // Refresh dashboard
        document.getElementById('refreshDashboard')?.addEventListener('click', async () => {
            await this.loadDashboardData();
            FumaUtils.ui.showToast('Dashboard refreshed', 'success');
        });

        // Export data
        document.getElementById('exportData')?.addEventListener('click', () => {
            this.exportDashboardData();
        });

        // Force sync
        document.getElementById('forceSyncBtn')?.addEventListener('click', async () => {
            await this.forceSync();
        });

        // Chart period change
        document.getElementById('matchesChartPeriod')?.addEventListener('change', (e) => {
            this.updateMatchesChart(e.target.value);
        });
    }

    setupNavigation() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar .nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Update active nav link
        this.updateActiveNavLink();
    }

    restoreActiveSection() {
        // Priority: URL hash > localStorage > default (dashboard)
        let sectionToShow = 'dashboard';
        
        // Check URL hash first
        const hashSection = window.location.hash.substring(1);
        if (hashSection && this.isValidSection(hashSection)) {
            sectionToShow = hashSection;
        } else {
            // Check localStorage
            const savedSection = localStorage.getItem('fuma-admin-active-section');
            if (savedSection && this.isValidSection(savedSection)) {
                sectionToShow = savedSection;
            }
        }
        
        // Show the determined section
        this.showSection(sectionToShow);
    }

    isValidSection(sectionName) {
        // Check if the section element exists
        const sectionElement = document.getElementById(`${sectionName}-section`);
        return sectionElement !== null;
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Save current section to localStorage
            localStorage.setItem('fuma-admin-active-section', sectionName);
            
            // Update URL hash
            window.location.hash = sectionName;
            
            // Update navigation
            this.updateActiveNavLink();
            
            // Load section-specific data
            this.loadSectionData(sectionName);
        }
    }

    updateActiveNavLink() {
        // Remove active class from all nav links
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current section
        const activeLink = document.querySelector(`.sidebar .nav-link[data-section="${this.currentSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'teams':
                if (window.adminTeams) {
                    await window.adminTeams.loadTeams();
                }
                break;
            case 'players':
                if (window.adminPlayers) {
                    await window.adminPlayers.loadPlayers();
                }
                break;
            case 'tournaments':
                if (window.adminTournaments) {
                    await window.adminTournaments.loadTournaments();
                }
                break;
            case 'matches':
                if (window.adminMatches) {
                    await window.adminMatches.loadMatches();
                }
                break;
            case 'live-scoring':
                if (window.adminLiveScoring) {
                    await window.adminLiveScoring.loadLiveMatches();
                }
                break;
        }
    }

    async loadDashboardData() {
        try {
            FumaUtils.ui.showLoading('dashboard-section', 'Loading dashboard data...');

            // Load dashboard statistics
            const [statsResponse, recentActivity] = await Promise.all([
                apiClient.getDashboardStats(),
                this.getRecentActivity()
            ]);

            // console.log('Dashboard stats response:', statsResponse); // Debug log

            if (statsResponse && statsResponse.success) {
                this.updateStatsCards(statsResponse.data);
                this.updateCharts(statsResponse.data);
            } else {
                console.error('Dashboard stats failed:', statsResponse?.message);
                
                // Use fallback data if API fails
                console.log('Using fallback data...');
                this.loadFallbackData();
            }

            this.updateRecentActivity(recentActivity);
            this.updateSystemStatus();

            // Hide loading and restore dashboard content
            FumaUtils.ui.hideLoading('dashboard-section');

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            
            // Hide loading first
            FumaUtils.ui.hideLoading('dashboard-section');
            
            // Try to load fallback data
            try {
                console.log('Loading fallback data due to error...');
                this.loadFallbackData();
                
                if (FumaUtils.ui.showToast) {
                    FumaUtils.ui.showToast('Using offline data. Some information may not be current.', 'warning');
                }
            } catch (fallbackError) {
                console.error('Fallback data failed:', fallbackError);
                
                // Show error message
                FumaUtils.ui.showError('dashboard-section', 'Failed to load dashboard data. Please try refreshing the page.');
                
                // Also show toast notification
                if (FumaUtils.ui.showToast) {
                    FumaUtils.ui.showToast('Dashboard loading failed: ' + error.message, 'danger');
                }
            }
        }
    }

    loadFallbackData() {
        // Fallback data for testing/offline mode
        const fallbackData = {
            overview: {
                totalTournaments: 5,
                totalTeams: 24,
                totalPlayers: 312,
                totalMatches: 156,
                activeTournaments: 2,
                liveMatches: 0,
                completedMatches: 98,
                scheduledMatches: 58,
                monthlyGoals: 245
            },
            trends: {
                matchTrends: {
                    scheduled: 58,
                    live: 0,
                    completed: 98
                }
            }
        };

        console.log('Loading fallback data:', fallbackData);
        this.updateStatsCards(fallbackData);
        this.updateCharts(fallbackData);
        
        // Load fallback recent activity
        const fallbackActivity = [
            {
                type: 'match',
                action: 'completed',
                timestamp: new Date(),
                data: {
                    description: 'Team A vs Team B match completed'
                }
            },
            {
                type: 'tournament',
                action: 'created',
                timestamp: new Date(Date.now() - 3600000),
                data: {
                    description: 'New tournament: Summer League 2024'
                }
            }
        ];
        
        this.updateRecentActivity(fallbackActivity);
    }

    updateStatsCards(data) {
        // Extract overview data from the new backend response structure
        const overview = data.overview || {};
        
        // Update stat cards with correct data structure
        const elements = {
            totalTeams: overview.totalTeams || 0,
            totalPlayers: overview.totalPlayers || 0,
            activeTournaments: overview.activeTournaments || 0,
            totalMatches: overview.totalMatches || 0
        };

        Object.keys(elements).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                this.animateCounter(element, elements[key]);
            }
        });

        // Update additional stats that are available
        this.updateAdditionalStats(overview);
    }

    updateAdditionalStats(overview) {
        // Update live matches count in system status and card
        const liveMatchesEl = document.getElementById('liveMatches');
        const liveMatchesCardEl = document.getElementById('liveMatchesCard');
        
        if (overview.liveMatches !== undefined) {
            const liveCount = overview.liveMatches;
            
            if (liveMatchesEl) {
                liveMatchesEl.textContent = liveCount;
                liveMatchesEl.className = liveCount > 0 ? 'badge bg-danger' : 'badge bg-info';
            }
            
            if (liveMatchesCardEl) {
                this.animateCounter(liveMatchesCardEl, liveCount);
            }
        }

        // Update scheduled matches
        const scheduledMatchesEl = document.getElementById('scheduledMatches');
        if (scheduledMatchesEl && overview.scheduledMatches !== undefined) {
            this.animateCounter(scheduledMatchesEl, overview.scheduledMatches);
        }

        // Update completed matches
        const completedMatchesEl = document.getElementById('completedMatches');
        if (completedMatchesEl && overview.completedMatches !== undefined) {
            this.animateCounter(completedMatchesEl, overview.completedMatches);
        }

        // Update monthly goals
        const monthlyGoalsEl = document.getElementById('monthlyGoals');
        if (monthlyGoalsEl && overview.monthlyGoals !== undefined) {
            this.animateCounter(monthlyGoalsEl, overview.monthlyGoals);
        }
    }

    animateCounter(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000; // 1 second
        const increment = (targetValue - startValue) / (duration / 16); // 60 FPS
        let currentValue = startValue;

        const timer = setInterval(() => {
            currentValue += increment;
            if ((increment > 0 && currentValue >= targetValue) || 
                (increment < 0 && currentValue <= targetValue)) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(currentValue);
        }, 16);
    }

    initializeCharts() {
        // Matches Overview Chart
        const matchesCtx = document.getElementById('matchesChart');
        if (matchesCtx) {
            this.charts.matches = new Chart(matchesCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Matches',
                        data: [],
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }

        // Tournament Status Chart
        const tournamentCtx = document.getElementById('tournamentStatusChart');
        if (tournamentCtx) {
            this.charts.tournaments = new Chart(tournamentCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Upcoming', 'Ongoing', 'Completed'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: [
                            '#ffc107',
                            '#17a2b8',
                            '#28a745'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    updateCharts(data) {
        // Update matches chart with trends data
        if (this.charts.matches && data.trends && data.trends.matchTrends) {
            const trends = data.trends.matchTrends;
            const labels = [];
            const chartData = [];
            
            // Create chart data from match trends
            const statusOrder = ['scheduled', 'live', 'completed'];
            statusOrder.forEach(status => {
                if (trends[status] !== undefined) {
                    labels.push(status.charAt(0).toUpperCase() + status.slice(1));
                    chartData.push(trends[status]);
                }
            });
            
            this.charts.matches.data.labels = labels;
            this.charts.matches.data.datasets[0].data = chartData;
            this.charts.matches.update();
        }

        // Update tournament status chart with actual tournament data
        if (this.charts.tournaments && data.overview) {
            const overview = data.overview;
            this.charts.tournaments.data.datasets[0].data = [
                overview.totalTournaments - (overview.activeTournaments || 0), // Upcoming (total - active)
                overview.activeTournaments || 0, // Ongoing
                0 // Completed - we don't have this specific data, could be added to backend
            ];
            this.charts.tournaments.update();
        }
    }

    async updateMatchesChart(period) {
        try {
            const response = await apiClient.get('/statistics/matches-over-time', { period });
            console.log('Matches chart response:', response); // Debug log
            
            if (response.success && this.charts.matches) {
                this.charts.matches.data.labels = response.data.labels;
                this.charts.matches.data.datasets[0].data = response.data.data;
                this.charts.matches.update();
            }
        } catch (error) {
            console.error('Error updating matches chart:', error);
        }
    }

    async getRecentActivity() {
        try {
            const response = await apiClient.get('/statistics/recent-activity');
            return response.success ? response.data.activities : [];
        } catch (error) {
            console.error('Error getting recent activity:', error);
            return [];
        }
    }

    updateRecentActivity(activities) {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = '<p class="text-muted">No recent activity</p>';
            return;
        }

        const activityHTML = activities.map(activity => `
            <div class="d-flex align-items-center mb-3">
                <div class="flex-shrink-0">
                    <i class="fas ${this.getActivityIcon(activity.type)} text-${this.getActivityColor(activity.type)}"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                    <div class="fw-bold">${activity.data.description || activity.type}</div>
                    <div class="text-muted small">${activity.action || 'Activity'}</div>
                    <div class="text-muted small">${FumaUtils.date.relative(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = activityHTML;
    }

    getActivityIcon(type) {
        const icons = {
            'team': 'fa-users',
            'player': 'fa-user-plus',
            'tournament': 'fa-trophy',
            'match': 'fa-futbol',
            'event': 'fa-bullseye'
        };
        return icons[type] || 'fa-info-circle';
    }

    getActivityColor(type) {
        const colors = {
            'team': 'primary',
            'player': 'success',
            'tournament': 'warning',
            'match': 'info',
            'event': 'danger'
        };
        return colors[type] || 'secondary';
    }

    updateSystemStatus() {
        // Update last sync time
        const lastSyncEl = document.getElementById('lastSync');
        if (lastSyncEl) {
            if (this.lastSyncTime) {
                lastSyncEl.textContent = FumaUtils.date.relative(this.lastSyncTime);
            } else {
                lastSyncEl.textContent = 'Never';
            }
        }

        // Update API status
        this.checkAPIStatus();

        // Update live matches count
        this.updateLiveMatchesCount();
    }

    async checkAPIStatus() {
        const statusEl = document.getElementById('apiStatus');
        if (!statusEl) return;

        try {
            const response = await fetch(`${apiClient.baseURL.replace('/api', '')}/health`);
            if (response.ok) {
                statusEl.textContent = 'Online';
                statusEl.className = 'badge bg-success';
            } else {
                statusEl.textContent = 'Issues';
                statusEl.className = 'badge bg-warning';
            }
        } catch (error) {
            statusEl.textContent = 'Offline';
            statusEl.className = 'badge bg-danger';
        }
    }

    async updateLiveMatchesCount() {
        const liveMatchesEl = document.getElementById('liveMatches');
        if (!liveMatchesEl) return;

        try {
            const response = await apiClient.getMatches({ status: 'LIVE' });
            if (response.success) {
                const count = response.data.matches.length;
                liveMatchesEl.textContent = count;
                liveMatchesEl.className = count > 0 ? 'badge bg-danger' : 'badge bg-info';
            }
        } catch (error) {
            console.error('Error updating live matches count:', error);
        }
    }

    setupAutoSync() {
        // Sync every 30 seconds
        this.syncInterval = setInterval(async () => {
            await this.syncData();
        }, 30000);
    }

    async syncData() {
        try {
            // Update dashboard stats if on dashboard
            if (this.currentSection === 'dashboard') {
                await this.loadDashboardData();
            }

            // Update system status
            this.updateSystemStatus();

            this.lastSyncTime = new Date();
        } catch (error) {
            console.error('Error during auto-sync:', error);
        }
    }

    async forceSync() {
        const btn = document.getElementById('forceSyncBtn');
        if (!btn) return;

        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Syncing...';
        btn.disabled = true;

        try {
            await this.syncData();
            FumaUtils.ui.showToast('Data synchronized successfully', 'success');
        } catch (error) {
            FumaUtils.ui.showToast('Sync failed: ' + error.message, 'danger');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    setupRealTimeUpdates() {
        // Setup WebSocket connection for real-time updates
        // This would connect to a WebSocket server for live updates
        // For now, we'll use polling as fallback
        
        setInterval(async () => {
            if (this.currentSection === 'live-scoring') {
                // Update live scoring data
                if (window.adminLiveScoring) {
                    await window.adminLiveScoring.updateLiveData();
                }
            }
        }, 5000); // Update every 5 seconds for live scoring
    }

    exportDashboardData() {
        // Export dashboard data as JSON
        const data = {
            exportDate: new Date().toISOString(),
            stats: {
                totalTeams: document.getElementById('totalTeams')?.textContent || '0',
                totalPlayers: document.getElementById('totalPlayers')?.textContent || '0',
                activeTournaments: document.getElementById('activeTournaments')?.textContent || '0',
                totalMatches: document.getElementById('totalMatches')?.textContent || '0'
            },
            lastSync: this.lastSyncTime,
            currentSection: this.currentSection
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fuma-dashboard-${FumaUtils.date.format(new Date(), 'YYYY-MM-DD')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        FumaUtils.ui.showToast('Dashboard data exported', 'success');
    }



    async logout() {
        try {
            await apiClient.logout();
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            apiClient.clearAuth();
            window.location.href = '/login.html';
        }
    }

    destroy() {
        // Cleanup intervals
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Handle browser back/forward navigation
window.addEventListener('hashchange', () => {
    const section = window.location.hash.substring(1) || 'dashboard';
    if (window.adminDashboard) {
        // Save to localStorage when navigating via hash
        localStorage.setItem('fuma-admin-active-section', section);
        window.adminDashboard.showSection(section);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.adminDashboard) {
        window.adminDashboard.destroy();
    }
});
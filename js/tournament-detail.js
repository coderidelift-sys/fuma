/**
 * Tournament Detail Handler
 * Handles frontend-backend integration for tournament-detail.html
 * Features: tabbed navigation, comprehensive tournament data, responsive design
 */

class TournamentDetailHandler {
    constructor() {
        this.tournamentId = null;
        this.tournament = null;
        this.activeTab = 'overview';
        this.isLoading = false;
        this.data = {
            teams: [],
            matches: [],
            brackets: [],
            standings: [],
            schedule: []
        };
        this.init();
    }

    init() {
        this.tournamentId = this.getTournamentIdFromUrl();
        if (!this.tournamentId) {
            this.showError('Tournament ID not found');
            return;
        }

        this.setupEventListeners();
        this.loadTournamentData();
    }

    getTournamentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                this.activeTab = e.target.getAttribute('data-bs-target').replace('#', '');
                this.loadTabContent(this.activeTab);
            });
        });

        // Action buttons
        document.getElementById('editTournament')?.addEventListener('click', () => {
            this.editTournament();
        });

        document.getElementById('deleteTournament')?.addEventListener('click', () => {
            this.deleteTournament();
        });

        document.getElementById('joinTournament')?.addEventListener('click', () => {
            this.joinTournament();
        });

        document.getElementById('leaveTournament')?.addEventListener('click', () => {
            this.leaveTournament();
        });

        // Refresh button
        document.getElementById('refreshData')?.addEventListener('click', () => {
            this.loadTournamentData();
        });
    }

    async loadTournamentData() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoadingState();

            const response = await apiClient.getTournament(this.tournamentId);

            if (response.success) {
                this.tournament = response.data;
                this.data = {
                    teams: this.tournament.teams || [],
                    matches: this.tournament.matches || [],
                    brackets: this.tournament.brackets || [],
                    standings: this.tournament.standings || [],
                    schedule: this.tournament.schedule || []
                };
                
                this.renderTournamentHeader();
                this.renderTournamentStats();
                this.loadTabContent(this.activeTab);
                this.updateActionButtons();
            } else {
                throw new Error(response.message || 'Failed to load tournament');
            }

        } catch (error) {
            console.error('Error loading tournament:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    renderTournamentHeader() {
        if (!this.tournament) return;

        // Update page title
        document.title = `${this.tournament.name} - FUMA`;

        // Update tournament header
        const headerElements = {
            name: document.getElementById('tournamentName'),
            description: document.getElementById('tournamentDescription'),
            status: document.getElementById('tournamentStatus'),
            type: document.getElementById('tournamentType'),
            dates: document.getElementById('tournamentDates'),
            location: document.getElementById('tournamentLocation')
        };

        if (headerElements.name) {
            headerElements.name.textContent = this.tournament.name;
        }

        if (headerElements.description) {
            headerElements.description.textContent = this.tournament.description || 'No description available';
        }

        if (headerElements.status) {
            const statusBadge = this.getStatusBadge(this.tournament.status);
            headerElements.status.innerHTML = statusBadge;
        }

        if (headerElements.type) {
            headerElements.type.innerHTML = `
                <span class="badge bg-secondary">${this.formatTournamentType(this.tournament.tournamentType)}</span>
            `;
        }

        if (headerElements.dates) {
            const startDate = this.tournament.startDate ? FumaUtils.date.format(this.tournament.startDate, 'DD/MM/YYYY') : 'TBD';
            const endDate = this.tournament.endDate ? FumaUtils.date.format(this.tournament.endDate, 'DD/MM/YYYY') : 'TBD';
            headerElements.dates.innerHTML = `
                <i class="fas fa-calendar me-2"></i>
                ${startDate} - ${endDate}
            `;
        }

        if (headerElements.location && this.tournament.location) {
            headerElements.location.innerHTML = `
                <i class="fas fa-map-marker-alt me-2"></i>
                ${this.tournament.location}
            `;
        }
    }

    renderTournamentStats() {
        if (!this.tournament) return;

        const statsContainer = document.getElementById('tournamentStats');
        if (!statsContainer) return;

        const teamsCount = this.tournament.teamsCount || this.tournament._count?.tournamentTeams || 0;
        const matchesCount = this.tournament.matchesCount || this.tournament._count?.matches || 0;
        const completedMatches = this.tournament.completedMatches || 0;
        const prizeMoney = this.tournament.prizeMoney;

        statsContainer.innerHTML = `
            <div class="row g-3">
                <div class="col-6 col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-primary mb-1">${teamsCount}</h3>
                            <small class="text-muted">Teams</small>
                            ${this.tournament.maxTeams ? `<div class="small text-muted">Max: ${this.tournament.maxTeams}</div>` : ''}
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-success mb-1">${matchesCount}</h3>
                            <small class="text-muted">Matches</small>
                            <div class="small text-muted">${completedMatches} completed</div>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-info mb-1">${Math.round((completedMatches / matchesCount) * 100) || 0}%</h3>
                            <small class="text-muted">Progress</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-warning mb-1">${prizeMoney ? FumaUtils.format.currency(prizeMoney) : 'N/A'}</h3>
                            <small class="text-muted">Prize Pool</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadTabContent(tabName) {
        const tabContent = document.getElementById(tabName);
        if (!tabContent) return;

        try {
            switch (tabName) {
                case 'overview':
                    await this.loadOverviewTab(tabContent);
                    break;
                case 'teams':
                    await this.loadTeamsTab(tabContent);
                    break;
                case 'matches':
                    await this.loadMatchesTab(tabContent);
                    break;
                case 'brackets':
                    await this.loadBracketsTab(tabContent);
                    break;
                case 'standings':
                    await this.loadStandingsTab(tabContent);
                    break;
                case 'schedule':
                    await this.loadScheduleTab(tabContent);
                    break;
                default:
                    tabContent.innerHTML = '<p class="text-muted">Content not available</p>';
            }
        } catch (error) {
            console.error(`Error loading ${tabName} tab:`, error);
            tabContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading ${tabName} data: ${error.message}
                </div>
            `;
        }
    }

    async loadOverviewTab(container) {
        container.innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-info-circle me-2"></i>Tournament Information</h5>
                        </div>
                        <div class="card-body">
                            ${this.renderTournamentInfo()}
                        </div>
                    </div>

                    <div class="card mt-4">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-trophy me-2"></i>Recent Matches</h5>
                        </div>
                        <div class="card-body" id="recentMatches">
                            <div class="text-center py-3">
                                <i class="fas fa-spinner fa-spin"></i> Loading recent matches...
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-users me-2"></i>Top Teams</h5>
                        </div>
                        <div class="card-body" id="topTeams">
                            <div class="text-center py-3">
                                <i class="fas fa-spinner fa-spin"></i> Loading top teams...
                            </div>
                        </div>
                    </div>

                    <div class="card mt-4">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-calendar me-2"></i>Upcoming Matches</h5>
                        </div>
                        <div class="card-body" id="upcomingMatches">
                            <div class="text-center py-3">
                                <i class="fas fa-spinner fa-spin"></i> Loading upcoming matches...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load additional data for overview
        this.loadRecentMatches();
        this.loadTopTeams();
        this.loadUpcomingMatches();
    }

    renderTournamentInfo() {
        if (!this.tournament) return '';

        return `
            <div class="row">
                <div class="col-sm-6">
                    <strong>Tournament Type:</strong><br>
                    <span class="text-muted">${this.formatTournamentType(this.tournament.tournamentType)}</span>
                </div>
                <div class="col-sm-6">
                    <strong>Status:</strong><br>
                    ${this.getStatusBadge(this.tournament.status)}
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-6">
                    <strong>Start Date:</strong><br>
                    <span class="text-muted">${this.tournament.startDate ? FumaUtils.date.format(this.tournament.startDate, 'DD/MM/YYYY HH:mm') : 'TBD'}</span>
                </div>
                <div class="col-sm-6">
                    <strong>End Date:</strong><br>
                    <span class="text-muted">${this.tournament.endDate ? FumaUtils.date.format(this.tournament.endDate, 'DD/MM/YYYY HH:mm') : 'TBD'}</span>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-6">
                    <strong>Max Teams:</strong><br>
                    <span class="text-muted">${this.tournament.maxTeams || 'Unlimited'}</span>
                </div>
                <div class="col-sm-6">
                    <strong>Prize Pool:</strong><br>
                    <span class="text-muted">${this.tournament.prizeMoney ? FumaUtils.format.currency(this.tournament.prizeMoney) : 'No prize pool'}</span>
                </div>
            </div>
            ${this.tournament.rules ? `
                <hr>
                <div>
                    <strong>Rules:</strong><br>
                    <div class="text-muted">${this.tournament.rules}</div>
                </div>
            ` : ''}
            ${this.tournament.location ? `
                <hr>
                <div>
                    <strong>Location:</strong><br>
                    <span class="text-muted">${this.tournament.location}</span>
                </div>
            ` : ''}
        `;
    }

    async loadTeamsTab(container) {
        try {
            const response = await apiClient.getTournamentTeams(this.tournamentId);
            
            if (response.success) {
                this.data.teams = response.data || [];
                this.renderTeamsContent(container);
            } else {
                throw new Error(response.message || 'Failed to load teams');
            }
        } catch (error) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading teams: ${error.message}
                </div>
            `;
        }
    }

    renderTeamsContent(container) {
        if (this.data.teams.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-users fa-3x mb-3"></i>
                    <h5>No teams registered yet</h5>
                    <p>Teams will appear here once they join the tournament</p>
                </div>
            `;
            return;
        }

        const teamsHtml = this.data.teams.map(team => `
            <div class="col-lg-6 col-xl-4 mb-3">
                <div class="card h-100 team-card">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="team-logo me-3">
                                <i class="fas fa-shield-alt fa-2x text-primary"></i>
                            </div>
                            <div>
                                <h6 class="mb-0 fw-bold">${team.name}</h6>
                                <small class="text-muted">${team.playersCount || 0} players</small>
                            </div>
                        </div>
                        
                        <div class="team-stats mb-3">
                            <div class="row text-center">
                                <div class="col-4">
                                    <div class="fw-bold text-success">${team.wins || 0}</div>
                                    <small class="text-muted">Wins</small>
                                </div>
                                <div class="col-4">
                                    <div class="fw-bold text-danger">${team.losses || 0}</div>
                                    <small class="text-muted">Losses</small>
                                </div>
                                <div class="col-4">
                                    <div class="fw-bold text-warning">${team.draws || 0}</div>
                                    <small class="text-muted">Draws</small>
                                </div>
                            </div>
                        </div>

                        ${team.captain ? `
                            <div class="mb-2">
                                <small class="text-muted">Captain:</small><br>
                                <span class="fw-bold">${team.captain}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-outline-primary btn-sm w-100" 
                                onclick="window.tournamentDetailHandler.viewTeamDetails(${team.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="row">
                ${teamsHtml}
            </div>
        `;
    }

    async loadMatchesTab(container) {
        try {
            const response = await apiClient.getTournamentMatches(this.tournamentId);
            
            if (response.success) {
                this.data.matches = response.data || [];
                this.renderMatchesContent(container);
            } else {
                throw new Error(response.message || 'Failed to load matches');
            }
        } catch (error) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading matches: ${error.message}
                </div>
            `;
        }
    }

    renderMatchesContent(container) {
        if (this.data.matches.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-futbol fa-3x mb-3"></i>
                    <h5>No matches scheduled yet</h5>
                    <p>Matches will appear here once the tournament begins</p>
                </div>
            `;
            return;
        }

        // Group matches by status
        const groupedMatches = {
            'COMPLETED': this.data.matches.filter(m => m.status === 'COMPLETED'),
            'ONGOING': this.data.matches.filter(m => m.status === 'ONGOING'),
            'SCHEDULED': this.data.matches.filter(m => m.status === 'SCHEDULED')
        };

        let html = '';

        Object.entries(groupedMatches).forEach(([status, matches]) => {
            if (matches.length === 0) return;

            html += `
                <div class="match-group mb-4">
                    <h5 class="fw-bold text-${this.getMatchStatusColor(status)} mb-3">
                        <i class="fas fa-circle me-2"></i>
                        ${this.formatMatchStatus(status)} (${matches.length})
                    </h5>
                    <div class="matches-list">
                        ${matches.map(match => this.renderMatchCard(match)).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderMatchCard(match) {
        const team1 = match.team1 || { name: 'TBD' };
        const team2 = match.team2 || { name: 'TBD' };
        const statusBadge = this.getMatchStatusBadge(match.status);

        return `
            <div class="card mb-3 match-card">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-4 text-center">
                            <div class="team-info">
                                <h6 class="mb-1 fw-bold">${team1.name}</h6>
                                <small class="text-muted">Team 1</small>
                            </div>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="match-score">
                                ${match.status === 'COMPLETED' ? `
                                    <h4 class="mb-1 fw-bold">
                                        ${match.team1Score || 0} - ${match.team2Score || 0}
                                    </h4>
                                ` : `
                                    <div class="vs-text">
                                        <span class="text-muted">VS</span>
                                    </div>
                                `}
                                ${statusBadge}
                                ${match.scheduledAt ? `
                                    <div class="small text-muted mt-1">
                                        <i class="fas fa-clock me-1"></i>
                                        ${FumaUtils.date.format(match.scheduledAt, 'DD/MM HH:mm')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="team-info">
                                <h6 class="mb-1 fw-bold">${team2.name}</h6>
                                <small class="text-muted">Team 2</small>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col text-center">
                            <button class="btn btn-outline-primary btn-sm" 
                                    onclick="window.tournamentDetailHandler.viewMatchDetails(${match.id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadBracketsTab(container) {
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-sitemap fa-3x mb-3"></i>
                <h5>Brackets View</h5>
                <p>Tournament bracket visualization coming soon!</p>
            </div>
        `;
    }

    async loadStandingsTab(container) {
        try {
            const response = await apiClient.getTournamentStandings(this.tournamentId);
            
            if (response.success) {
                this.data.standings = response.data || [];
                this.renderStandingsContent(container);
            } else {
                throw new Error(response.message || 'Failed to load standings');
            }
        } catch (error) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading standings: ${error.message}
                </div>
            `;
        }
    }

    renderStandingsContent(container) {
        if (this.data.standings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-list-ol fa-3x mb-3"></i>
                    <h5>No standings available yet</h5>
                    <p>Standings will appear here as matches are completed</p>
                </div>
            `;
            return;
        }

        const standingsHtml = this.data.standings.map((standing, index) => `
            <tr>
                <td>
                    <span class="fw-bold ${index < 3 ? 'text-warning' : ''}">${index + 1}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-shield-alt text-primary me-2"></i>
                        <span class="fw-bold">${standing.teamName}</span>
                    </div>
                </td>
                <td class="text-center">${standing.matchesPlayed || 0}</td>
                <td class="text-center text-success">${standing.wins || 0}</td>
                <td class="text-center text-warning">${standing.draws || 0}</td>
                <td class="text-center text-danger">${standing.losses || 0}</td>
                <td class="text-center">${standing.goalsFor || 0}</td>
                <td class="text-center">${standing.goalsAgainst || 0}</td>
                <td class="text-center">${(standing.goalsFor || 0) - (standing.goalsAgainst || 0)}</td>
                <td class="text-center fw-bold">${standing.points || 0}</td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Pos</th>
                            <th>Team</th>
                            <th class="text-center">MP</th>
                            <th class="text-center">W</th>
                            <th class="text-center">D</th>
                            <th class="text-center">L</th>
                            <th class="text-center">GF</th>
                            <th class="text-center">GA</th>
                            <th class="text-center">GD</th>
                            <th class="text-center">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${standingsHtml}
                    </tbody>
                </table>
            </div>
        `;
    }

    async loadScheduleTab(container) {
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-calendar-alt fa-3x mb-3"></i>
                <h5>Schedule View</h5>
                <p>Tournament schedule calendar coming soon!</p>
            </div>
        `;
    }

    // Load additional data for overview tab
    async loadRecentMatches() {
        const container = document.getElementById('recentMatches');
        if (!container) return;

        try {
            
            const recentMatches = this.data.matches
                .filter(m => m.status === 'COMPLETED')
                .slice(0, 5);

            if (recentMatches.length === 0) {
                container.innerHTML = '<p class="text-muted">No recent matches</p>';
                return;
            }

            container.innerHTML = recentMatches.map(match => `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div class="small">
                        <strong>${match.team1?.name || 'TBD'}</strong> vs <strong>${match.team2?.name || 'TBD'}</strong>
                    </div>
                    <div class="small fw-bold">
                        ${match.team1Score || 0} - ${match.team2Score || 0}
                    </div>
                </div>
            `).join('');

        } catch (error) {
            container.innerHTML = '<p class="text-danger">Error loading recent matches</p>';
        }
    }

    async loadTopTeams() {
        const container = document.getElementById('topTeams');
        if (!container) return;

        try {
            const topTeams = this.data.teams
                .sort((a, b) => (b.points || 0) - (a.points || 0))
                .slice(0, 5);

            if (topTeams.length === 0) {
                container.innerHTML = '<p class="text-muted">No teams data available</p>';
                return;
            }

            container.innerHTML = topTeams.map((team, index) => `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div class="d-flex align-items-center">
                        <span class="badge bg-light text-dark me-2">${index + 1}</span>
                        <span class="small fw-bold">${team.name}</span>
                    </div>
                    <div class="small">
                        <span class="fw-bold">${team.points || 0}</span> pts
                    </div>
                </div>
            `).join('');

        } catch (error) {
            container.innerHTML = '<p class="text-danger">Error loading top teams</p>';
        }
    }

    async loadUpcomingMatches() {
        const container = document.getElementById('upcomingMatches');
        if (!container) return;

        try {   
            const upcomingMatches = this.data.matches
                .filter(m => m.status === 'UPCOMING')
                .slice(0, 5);

            if (upcomingMatches.length === 0) {
                container.innerHTML = '<p class="text-muted">No upcoming matches</p>';
                return;
            }

            container.innerHTML = upcomingMatches.map(match => `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div class="small">
                        <strong>${match.team1?.name || 'TBD'}</strong> vs <strong>${match.team2?.name || 'TBD'}</strong>
                    </div>
                    <div class="small text-muted">
                        ${match.scheduledAt ? FumaUtils.date.format(match.scheduledAt, 'DD/MM HH:mm') : 'TBD'}
                    </div>
                </div>
            `).join('');

        } catch (error) {
            container.innerHTML = '<p class="text-danger">Error loading upcoming matches</p>';
        }
    }

    // Action methods
    editTournament() {
        FumaUtils.ui.showToast('Edit tournament feature coming soon!', 'info');
    }

    async deleteTournament() {
        const confirmed = await FumaUtils.ui.confirm(
            'Delete Tournament',
            'Are you sure you want to delete this tournament? This action cannot be undone.'
        );

        if (confirmed) {
            try {
                const response = await apiClient.deleteTournament(this.tournamentId);
                
                if (response.success) {
                    FumaUtils.ui.showToast('Tournament deleted successfully', 'success');
                    setTimeout(() => {
                        window.location.href = 'tournaments.html';
                    }, 1500);
                } else {
                    throw new Error(response.message || 'Failed to delete tournament');
                }
            } catch (error) {
                FumaUtils.ui.showToast('Error deleting tournament: ' + error.message, 'error');
            }
        }
    }

    joinTournament() {
        FumaUtils.ui.showToast('Join tournament feature coming soon!', 'info');
    }

    leaveTournament() {
        FumaUtils.ui.showToast('Leave tournament feature coming soon!', 'info');
    }

    viewTeamDetails(teamId) {
        window.location.href = `team-detail.html?id=${teamId}`;
    }

    viewMatchDetails(matchId) {
        window.location.href = `match-detail.html?id=${matchId}`;
    }

    updateActionButtons() {
        // Update button visibility based on tournament status and user permissions
        const editBtn = document.getElementById('editTournament');
        const deleteBtn = document.getElementById('deleteTournament');
        const joinBtn = document.getElementById('joinTournament');
        const leaveBtn = document.getElementById('leaveTournament');

        // For now, show all buttons - in future, implement proper permission checks
        if (editBtn) editBtn.style.display = 'inline-block';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        if (joinBtn) joinBtn.style.display = 'inline-block';
        if (leaveBtn) leaveBtn.style.display = 'none'; // Hide by default
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

    getStatusBadge(status) {
        const color = this.getStatusColor(status);
        const text = this.formatStatus(status);
        return `<span class="badge bg-${color}">${text}</span>`;
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

    getMatchStatusColor(status) {
        const colors = {
            'COMPLETED': 'success',
            'ONGOING': 'warning',
            'SCHEDULED': 'info'
        };
        return colors[status] || 'secondary';
    }

    getMatchStatusBadge(status) {
        const color = this.getMatchStatusColor(status);
        const text = this.formatMatchStatus(status);
        return `<span class="badge bg-${color}">${text}</span>`;
    }

    formatMatchStatus(status) {
        const formats = {
            'COMPLETED': 'Completed',
            'ONGOING': 'Live',
            'SCHEDULED': 'Scheduled'
        };
        return formats[status] || status;
    }

    showLoadingState() {
        const mainContent = document.querySelector('.tournament-content');
        if (mainContent) {
            mainContent.style.opacity = '0.6';
            mainContent.style.pointerEvents = 'none';
        }
    }

    hideLoadingState() {
        const mainContent = document.querySelector('.tournament-content');
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.pointerEvents = 'auto';
        }
    }

    showError(message) {
        const container = document.querySelector('.tournament-detail-container');
        if (container) {
            container.innerHTML = `
                <div class="container py-5">
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h3>Error Loading Tournament</h3>
                        <p class="text-muted">${message}</p>
                        <button class="btn btn-primary" onclick="window.location.href='tournaments.html'">
                            <i class="fas fa-arrow-left"></i> Back to Tournaments
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tournamentDetailHandler = new TournamentDetailHandler();
});
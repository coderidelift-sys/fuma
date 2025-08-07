/**
 * Team Detail Handler
 * Handles frontend-backend integration for team-detail.html
 * Features: comprehensive team data, player management, match history, statistics
 */

class TeamDetailHandler {
    constructor() {
        this.teamId = null;
        this.team = null;
        this.isLoading = false;
        this.data = {
            players: [],
            matches: [],
            tournaments: [],
            statistics: null
        };
        this.init();
    }

    init() {
        this.teamId = this.getTeamIdFromUrl();
        if (!this.teamId) {
            this.showError('Team ID not found');
            return;
        }

        this.setupEventListeners();
        this.loadTeamData();
    }

    getTeamIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    setupEventListeners() {
        // Action buttons
        document.getElementById('editTeam')?.addEventListener('click', () => {
            this.editTeam();
        });

        document.getElementById('deleteTeam')?.addEventListener('click', () => {
            this.deleteTeam();
        });

        document.getElementById('joinTeam')?.addEventListener('click', () => {
            this.joinTeam();
        });

        document.getElementById('leaveTeam')?.addEventListener('click', () => {
            this.leaveTeam();
        });

        document.getElementById('addPlayer')?.addEventListener('click', () => {
            this.addPlayer();
        });

        // Refresh button
        document.getElementById('refreshData')?.addEventListener('click', () => {
            this.loadTeamData();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterMatches(filter);
            });
        });
    }

    async loadTeamData() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoadingState();

            const response = await apiClient.getTeam(this.teamId);

            if (response.success) {
                this.team = response.data;
                this.renderTeamHeader();
                this.renderTeamStats();
                this.loadTeamPlayers();
                this.loadTeamMatches();
                this.loadTeamTournaments();
                this.updateActionButtons();
            } else {
                throw new Error(response.message || 'Failed to load team');
            }

        } catch (error) {
            console.error('Error loading team:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    renderTeamHeader() {
        if (!this.team) return;

        // Update page title
        document.title = `${this.team.name} - FUMA`;

        // Update team header
        const headerElements = {
            name: document.getElementById('teamName'),
            description: document.getElementById('teamDescription'),
            captain: document.getElementById('teamCaptain'),
            founded: document.getElementById('teamFounded'),
            location: document.getElementById('teamLocation')
        };

        if (headerElements.name) {
            headerElements.name.textContent = this.team.name;
        }

        if (headerElements.description) {
            headerElements.description.textContent = this.team.description || 'No description available';
        }

        if (headerElements.captain && this.team.captain) {
            headerElements.captain.innerHTML = `
                <i class="fas fa-user-crown me-2"></i>
                <span class="fw-bold">${this.team.captain}</span>
            `;
        }

        if (headerElements.founded && this.team.foundedDate) {
            headerElements.founded.innerHTML = `
                <i class="fas fa-calendar me-2"></i>
                Founded ${FumaUtils.date.format(this.team.foundedDate, 'DD/MM/YYYY')}
            `;
        }

        if (headerElements.location && this.team.location) {
            headerElements.location.innerHTML = `
                <i class="fas fa-map-marker-alt me-2"></i>
                ${this.team.location}
            `;
        }
    }

    renderTeamStats() {
        if (!this.team) return;

        const statsContainer = document.getElementById('teamStats');
        if (!statsContainer) return;

        const playersCount = this.team.playersCount || this.team._count?.players || 0;
        const matchesCount = this.team.matchesCount || 0;
        const wins = this.team.wins || 0;
        const losses = this.team.losses || 0;
        const winRate = matchesCount > 0 ? Math.round((wins / matchesCount) * 100) : 0;

        statsContainer.innerHTML = `
            <div class="row g-3">
                <div class="col-6 col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-primary mb-1">${playersCount}</h3>
                            <small class="text-muted">Players</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-success mb-1">${wins}</h3>
                            <small class="text-muted">Wins</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-danger mb-1">${losses}</h3>
                            <small class="text-muted">Losses</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-info mb-1">${winRate}%</h3>
                            <small class="text-muted">Win Rate</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadTeamPlayers() {
        const container = document.getElementById('teamPlayers');
        if (!container) return;

        try {
            const response = await apiClient.getTeamPlayers(this.teamId);
            
            if (response.success) {
                this.data.players = response.data || [];
                this.renderPlayersContent(container);
            } else {
                throw new Error(response.message || 'Failed to load players');
            }
        } catch (error) {
            console.error('Error loading players:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading players: ${error.message}
                </div>
            `;
        }
    }

    renderPlayersContent(container) {
        if (this.data.players.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-users fa-3x mb-3"></i>
                    <h5>No players in this team</h5>
                    <p>Players will appear here once they join the team</p>
                    <button class="btn btn-primary" onclick="window.teamDetailHandler.addPlayer()">
                        <i class="fas fa-plus"></i> Add Player
                    </button>
                </div>
            `;
            return;
        }

        const playersHtml = this.data.players.map(player => `
            <div class="col-lg-6 col-xl-4 mb-3">
                <div class="card h-100 player-card">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="player-avatar me-3">
                                <div class="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center">
                                    ${player.name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div class="flex-grow-1">
                                <h6 class="mb-0 fw-bold">${player.name}</h6>
                                <small class="text-muted">${player.position || 'Player'}</small>
                                ${player.isCaptain ? '<span class="badge bg-warning ms-2">Captain</span>' : ''}
                            </div>
                        </div>
                        
                        <div class="player-stats mb-3">
                            <div class="row text-center">
                                <div class="col-4">
                                    <div class="fw-bold text-primary">${player.matchesPlayed || 0}</div>
                                    <small class="text-muted">Matches</small>
                                </div>
                                <div class="col-4">
                                    <div class="fw-bold text-success">${player.goals || 0}</div>
                                    <small class="text-muted">Goals</small>
                                </div>
                                <div class="col-4">
                                    <div class="fw-bold text-info">${player.assists || 0}</div>
                                    <small class="text-muted">Assists</small>
                                </div>
                            </div>
                        </div>

                        ${player.joinedAt ? `
                            <div class="text-center">
                                <small class="text-muted">
                                    Joined ${FumaUtils.date.format(player.joinedAt, 'DD/MM/YYYY')}
                                </small>
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-footer">
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-outline-primary btn-sm" 
                                    onclick="window.teamDetailHandler.viewPlayerDetails(${player.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" 
                                    onclick="window.teamDetailHandler.editPlayer(${player.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">
                    <i class="fas fa-users me-2"></i>
                    Team Players (${this.data.players.length})
                </h5>
                <button class="btn btn-primary btn-sm" onclick="window.teamDetailHandler.addPlayer()">
                    <i class="fas fa-plus"></i> Add Player
                </button>
            </div>
            <div class="row">
                ${playersHtml}
            </div>
        `;
    }

    async loadTeamMatches() {
        const container = document.getElementById('teamMatches');
        if (!container) return;

        try {
            const response = await apiClient.getTeamMatches(this.teamId);
            
            if (response.success) {
                this.data.matches = response.data || [];
                this.renderMatchesContent(container);
            } else {
                throw new Error(response.message || 'Failed to load matches');
            }
        } catch (error) {
            console.error('Error loading matches:', error);
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
                    <h5>No matches played yet</h5>
                    <p>Match history will appear here once the team starts playing</p>
                </div>
            `;
            return;
        }

        // Add filter buttons
        const filterButtons = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">
                    <i class="fas fa-history me-2"></i>
                    Match History (${this.data.matches.length})
                </h5>
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-secondary btn-sm filter-btn active" data-filter="all">
                        All
                    </button>
                    <button class="btn btn-outline-success btn-sm filter-btn" data-filter="wins">
                        Wins
                    </button>
                    <button class="btn btn-outline-danger btn-sm filter-btn" data-filter="losses">
                        Losses
                    </button>
                    <button class="btn btn-outline-warning btn-sm filter-btn" data-filter="draws">
                        Draws
                    </button>
                </div>
            </div>
        `;

        const matchesHtml = this.data.matches.map(match => this.renderMatchCard(match)).join('');

        container.innerHTML = `
            ${filterButtons}
            <div class="matches-container">
                ${matchesHtml}
            </div>
        `;

        // Re-attach event listeners for filter buttons
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button
                container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const filter = e.target.dataset.filter;
                this.filterMatches(filter);
            });
        });
    }

    renderMatchCard(match) {
        const isTeam1 = match.team1Id === parseInt(this.teamId);
        const opponent = isTeam1 ? match.team2 : match.team1;
        const teamScore = isTeam1 ? match.team1Score : match.team2Score;
        const opponentScore = isTeam1 ? match.team2Score : match.team1Score;
        
        let result = 'draw';
        let resultText = 'Draw';
        let resultColor = 'warning';
        
        if (match.status === 'COMPLETED') {
            if (teamScore > opponentScore) {
                result = 'win';
                resultText = 'Win';
                resultColor = 'success';
            } else if (teamScore < opponentScore) {
                result = 'loss';
                resultText = 'Loss';
                resultColor = 'danger';
            }
        }

        return `
            <div class="card mb-3 match-card" data-result="${result}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <div class="match-result text-center">
                                <span class="badge bg-${resultColor} mb-2">${resultText}</span>
                                <div class="match-date small text-muted">
                                    <i class="fas fa-calendar me-1"></i>
                                    ${match.scheduledAt ? FumaUtils.date.format(match.scheduledAt, 'DD/MM/YYYY') : 'TBD'}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 text-center">
                            <div class="match-teams">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="team-info">
                                        <h6 class="mb-0 fw-bold">${this.team.name}</h6>
                                        <small class="text-muted">Home</small>
                                    </div>
                                    <div class="score mx-3">
                                        <h4 class="mb-0 fw-bold">
                                            ${match.status === 'COMPLETED' ? `${teamScore} - ${opponentScore}` : 'vs'}
                                        </h4>
                                    </div>
                                    <div class="team-info">
                                        <h6 class="mb-0 fw-bold">${opponent?.name || 'TBD'}</h6>
                                        <small class="text-muted">Away</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 text-center">
                            <div class="match-tournament mb-2">
                                <small class="text-muted">
                                    <i class="fas fa-trophy me-1"></i>
                                    ${match.tournament?.name || 'Friendly'}
                                </small>
                            </div>
                            <button class="btn btn-outline-primary btn-sm" 
                                    onclick="window.teamDetailHandler.viewMatchDetails(${match.id})">
                                <i class="fas fa-eye"></i> Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadTeamTournaments() {
        const container = document.getElementById('teamTournaments');
        if (!container) return;

        try {
            const response = await apiClient.getTeamTournaments(this.teamId);
            
            if (response.success) {
                this.data.tournaments = response.data || [];
                this.renderTournamentsContent(container);
            } else {
                throw new Error(response.message || 'Failed to load tournaments');
            }
        } catch (error) {
            console.error('Error loading tournaments:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading tournaments: ${error.message}
                </div>
            `;
        }
    }

    renderTournamentsContent(container) {
        if (this.data.tournaments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-trophy fa-3x mb-3"></i>
                    <h5>No tournaments joined</h5>
                    <p>Tournament participation will appear here</p>
                </div>
            `;
            return;
        }

        const tournamentsHtml = this.data.tournaments.map(tournament => `
            <div class="col-lg-6 mb-3">
                <div class="card h-100 tournament-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 class="mb-1 fw-bold">${tournament.name}</h6>
                                <small class="text-muted">${this.formatTournamentType(tournament.tournamentType)}</small>
                            </div>
                            ${this.getStatusBadge(tournament.status)}
                        </div>
                        
                        <div class="tournament-stats mb-3">
                            <div class="row text-center">
                                <div class="col-4">
                                    <div class="fw-bold text-primary">${tournament.position || '-'}</div>
                                    <small class="text-muted">Position</small>
                                </div>
                                <div class="col-4">
                                    <div class="fw-bold text-success">${tournament.wins || 0}</div>
                                    <small class="text-muted">Wins</small>
                                </div>
                                <div class="col-4">
                                    <div class="fw-bold text-info">${tournament.points || 0}</div>
                                    <small class="text-muted">Points</small>
                                </div>
                            </div>
                        </div>

                        <div class="tournament-dates text-center">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>
                                ${tournament.startDate ? FumaUtils.date.format(tournament.startDate, 'DD/MM/YYYY') : 'TBD'}
                                ${tournament.endDate ? ` - ${FumaUtils.date.format(tournament.endDate, 'DD/MM/YYYY')}` : ''}
                            </small>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-outline-primary btn-sm w-100" 
                                onclick="window.teamDetailHandler.viewTournamentDetails(${tournament.id})">
                            <i class="fas fa-eye"></i> View Tournament
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">
                    <i class="fas fa-trophy me-2"></i>
                    Tournaments (${this.data.tournaments.length})
                </h5>
            </div>
            <div class="row">
                ${tournamentsHtml}
            </div>
        `;
    }

    // Filter methods
    filterMatches(filter) {
        const matchCards = document.querySelectorAll('.match-card');
        
        matchCards.forEach(card => {
            const result = card.dataset.result;
            let show = true;
            
            switch (filter) {
                case 'wins':
                    show = result === 'win';
                    break;
                case 'losses':
                    show = result === 'loss';
                    break;
                case 'draws':
                    show = result === 'draw';
                    break;
                case 'all':
                default:
                    show = true;
                    break;
            }
            
            card.style.display = show ? 'block' : 'none';
        });
    }

    // Action methods
    editTeam() {
        FumaUtils.ui.showToast('Edit team feature coming soon!', 'info');
    }

    async deleteTeam() {
        const confirmed = await FumaUtils.ui.confirm(
            'Delete Team',
            'Are you sure you want to delete this team? This action cannot be undone.'
        );

        if (confirmed) {
            try {
                const response = await apiClient.deleteTeam(this.teamId);
                
                if (response.success) {
                    FumaUtils.ui.showToast('Team deleted successfully', 'success');
                    setTimeout(() => {
                        window.location.href = 'teams.html';
                    }, 1500);
                } else {
                    throw new Error(response.message || 'Failed to delete team');
                }
            } catch (error) {
                FumaUtils.ui.showToast('Error deleting team: ' + error.message, 'error');
            }
        }
    }

    joinTeam() {
        FumaUtils.ui.showToast('Join team feature coming soon!', 'info');
    }

    leaveTeam() {
        FumaUtils.ui.showToast('Leave team feature coming soon!', 'info');
    }

    addPlayer() {
        FumaUtils.ui.showToast('Add player feature coming soon!', 'info');
    }

    editPlayer(playerId) {
        FumaUtils.ui.showToast('Edit player feature coming soon!', 'info');
    }

    viewPlayerDetails(playerId) {
        window.location.href = `player-detail.html?id=${playerId}`;
    }

    viewMatchDetails(matchId) {
        window.location.href = `match-detail.html?id=${matchId}`;
    }

    viewTournamentDetails(tournamentId) {
        window.location.href = `tournament-detail.html?id=${tournamentId}`;
    }

    updateActionButtons() {
        // Update button visibility based on team permissions
        const editBtn = document.getElementById('editTeam');
        const deleteBtn = document.getElementById('deleteTeam');
        const joinBtn = document.getElementById('joinTeam');
        const leaveBtn = document.getElementById('leaveTeam');

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

    showLoadingState() {
        const mainContent = document.querySelector('.team-content');
        if (mainContent) {
            mainContent.style.opacity = '0.6';
            mainContent.style.pointerEvents = 'none';
        }
    }

    hideLoadingState() {
        const mainContent = document.querySelector('.team-content');
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.pointerEvents = 'auto';
        }
    }

    showError(message) {
        const container = document.querySelector('.team-detail-container');
        if (container) {
            container.innerHTML = `
                <div class="container py-5">
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h3>Error Loading Team</h3>
                        <p class="text-muted">${message}</p>
                        <button class="btn btn-primary" onclick="window.location.href='teams.html'">
                            <i class="fas fa-arrow-left"></i> Back to Teams
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.teamDetailHandler = new TeamDetailHandler();
});
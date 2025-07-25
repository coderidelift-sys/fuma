/**
 * FUMA API Client - Core API integration module
 * Handles all HTTP requests to the backend API with authentication
 */

class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:3002/api';
        this.token = localStorage.getItem('fuma_token');
        this.user = JSON.parse(localStorage.getItem('fuma_user') || 'null');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('fuma_token', token);
    }

    // Set user data
    setUser(user) {
        this.user = user;
        localStorage.setItem('fuma_user', JSON.stringify(user));
    }

    // Clear authentication
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('fuma_token');
        localStorage.removeItem('fuma_user');
    }

    // Get authentication headers
    getHeaders(contentType = 'application/json') {
        const headers = {
            'Content-Type': contentType
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic HTTP request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            credentials: 'include',
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            
            // Handle authentication errors
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                this.clearAuth();
                window.location.href = '/login.html';
            }
            
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // Authentication methods
    async login(email, password) {
        const response = await this.post('/auth/login', { email, password });
        
        if (response.success) {
            this.setToken(response.data.token);
            this.setUser(response.data.user);
        }
        
        return response;
    }

    async register(userData) {
        const response = await this.post('/auth/register', userData);
        
        if (response.success) {
            this.setToken(response.data.token);
            this.setUser(response.data.user);
        }
        
        return response;
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } finally {
            this.clearAuth();
        }
    }

    async getCurrentUser() {
        return this.get('/auth/me');
    }

    // Teams API
    async getTeams(params = {}) {
        return this.get('/teams', params);
    }

    async getTeam(id) {
        return this.get(`/teams/${id}`);
    }

    async createTeam(teamData) {
        return this.post('/teams', teamData);
    }

    async updateTeam(id, teamData) {
        return this.put(`/teams/${id}`, teamData);
    }

    async deleteTeam(id) {
        return this.delete(`/teams/${id}`);
    }

    // Players API
    async getPlayers(params = {}) {
        return this.get('/players', params);
    }

    async getPlayer(id) {
        return this.get(`/players/${id}`);
    }

    async createPlayer(playerData) {
        return this.post('/players', playerData);
    }

    async updatePlayer(id, playerData) {
        return this.put(`/players/${id}`, playerData);
    }

    async deletePlayer(id) {
        return this.delete(`/players/${id}`);
    }

    // Tournaments API
    async getTournaments(params = {}) {
        return this.get('/tournaments', params);
    }

    async getTournament(id) {
        return this.get(`/tournaments/${id}`);
    }

    async createTournament(tournamentData) {
        return this.post('/tournaments', tournamentData);
    }

    async updateTournament(id, tournamentData) {
        return this.put(`/tournaments/${id}`, tournamentData);
    }

    async deleteTournament(id) {
        return this.delete(`/tournaments/${id}`);
    }

    // Matches API
    async getMatches(params = {}) {
        return this.get('/matches', params);
    }

    async getMatch(id) {
        return this.get(`/matches/${id}`);
    }

    async createMatch(matchData) {
        return this.post('/matches', matchData);
    }

    async updateMatch(id, matchData) {
        return this.put(`/matches/${id}`, matchData);
    }

    async deleteMatch(id) {
        return this.delete(`/matches/${id}`);
    }

    async getLiveMatch(id) {
        return this.get(`/matches/${id}/live`);
    }

    async updateLiveMatch(id, liveData) {
        return this.put(`/matches/${id}/live`, liveData);
    }

    async addMatchEvent(matchId, eventData) {
        return this.post(`/matches/${matchId}/events`, eventData);
    }

    // Statistics API
    async getStatistics(params = {}) {
        return this.get('/statistics', params);
    }

    async getDashboardStats() {
        return this.get('/statistics/dashboard');
    }

    async getPlayerStats(playerId, tournamentId = null) {
        const params = tournamentId ? { tournamentId } : {};
        return this.get(`/statistics/player/${playerId}`, params);
    }

    async getTeamStats(teamId, tournamentId = null) {
        const params = tournamentId ? { tournamentId } : {};
        return this.get(`/statistics/team/${teamId}`, params);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.user && this.user.role === role;
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole('ADMIN');
    }

    // Check if user is manager
    isManager() {
        return this.hasRole('MANAGER');
    }
}

// Create global API client instance
window.apiClient = new APIClient();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
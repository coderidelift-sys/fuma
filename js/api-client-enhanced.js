/**
 * Enhanced FUMA API Client - Optimized version with comprehensive error handling
 * Handles all HTTP requests to the backend API with authentication and standardized responses
 */

class EnhancedAPIClient {
    constructor() {
        this.baseURL = 'http://localhost:3002/api';
        this.token = localStorage.getItem('fuma_token');
        this.user = JSON.parse(localStorage.getItem('fuma_user') || 'null');
        this.retryCount = 3;
        this.retryDelay = 1000;
        this.requestTimeout = 10000; // 10 seconds
        
        // Initialize request interceptors
        this.initializeInterceptors();
    }

    initializeInterceptors() {
        // Add request/response interceptors for consistent handling
        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }

    // Test API connectivity and CORS configuration
    async testConnection() {
        try {
            // Try a simple GET request to test connectivity
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            return {
                success: true,
                status: response.status,
                message: 'API connection successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: this.getCORSErrorMessage(error)
            };
        }
    }

    // Get user-friendly CORS error message
    getCORSErrorMessage(error) {
        if (error.message.includes('CORS')) {
            return 'CORS error detected. Please ensure the backend server is configured to allow requests from this domain.';
        } else if (error.message.includes('Failed to fetch')) {
            return 'Cannot connect to API server. Please check if the server is running and accessible.';
        } else if (error.message.includes('NetworkError')) {
            return 'Network error. Please check your internet connection.';
        } else {
            return `Connection error: ${error.message}`;
        }
    }

    // Enhanced authentication management
    setToken(token) {
        this.token = token;
        localStorage.setItem('fuma_token', token);
        this.broadcastAuthChange('login');
    }

    setUser(user) {
        this.user = user;
        localStorage.setItem('fuma_user', JSON.stringify(user));
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('fuma_token');
        localStorage.removeItem('fuma_user');
        this.broadcastAuthChange('logout');
    }

    broadcastAuthChange(type) {
        // Broadcast authentication changes to all open tabs
        window.dispatchEvent(new CustomEvent('authStateChange', { 
            detail: { type, user: this.user, token: this.token }
        }));
    }

    // Enhanced headers with CORS-friendly configuration
    getHeaders(contentType = 'application/json') {
        const headers = {
            'Content-Type': contentType,
            'Accept': 'application/json'
            // Removed 'X-Requested-With' to avoid CORS preflight issues
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Enhanced request method with CORS error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            credentials: 'include',
            mode: 'cors', // Explicitly set CORS mode
            timeout: this.requestTimeout,
            ...options
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryCount; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), config.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                // Handle different response types
                let data;
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = { message: await response.text() };
                }

                // Standardize response format
                const standardizedResponse = this.standardizeResponse(data, response);

                if (!response.ok) {
                    throw new Error(standardizedResponse.message || `HTTP error! status: ${response.status}`);
                }

                return standardizedResponse;
                
            } catch (error) {
                lastError = error;
                
                // Handle specific error types
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout - please check your connection');
                }
                
                // Handle CORS errors specifically
                if (error.message.includes('CORS') || error.message.includes('cors')) {
                    throw new Error('CORS error - please check server configuration or try again');
                }
                
                // Handle network errors
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    throw new Error('Network error - please check your internet connection');
                }
                
                if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    this.handleAuthError();
                    throw error;
                }
                
                // Don't retry on client errors (4xx) except for specific cases
                if (error.message.includes('4') && !error.message.includes('429')) {
                    throw error;
                }
                
                // Wait before retry (exponential backoff)
                if (attempt < this.retryCount) {
                    await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
                    console.warn(`Request failed, retrying (${attempt}/${this.retryCount}):`, error.message);
                }
            }
        }
        
        throw lastError;
    }

    // Standardize API responses to consistent format
    standardizeResponse(data, response) {
        // Handle different response formats from backend
        if (data && typeof data === 'object') {
            // Already in expected format
            if (data.hasOwnProperty('success') && data.hasOwnProperty('data')) {
                return data;
            }
            
            // Handle direct data responses
            if (Array.isArray(data)) {
                return {
                    success: true,
                    data: data,
                    pagination: null,
                    message: 'Success'
                };
            }
            
            // Handle object responses
            if (data.results || data.items || data.tournaments || data.teams || data.matches || data.players) {
                const dataKey = data.results || data.items || data.tournaments || data.teams || data.matches || data.players;
                return {
                    success: true,
                    data: dataKey,
                    pagination: data.pagination || data.meta || null,
                    message: data.message || 'Success'
                };
            }
            
            // Handle single object responses
            return {
                success: true,
                data: data,
                pagination: null,
                message: data.message || 'Success'
            };
        }
        
        // Handle error responses
        return {
            success: false,
            data: null,
            error: data,
            message: data.message || 'Unknown error occurred'
        };
    }

    handleAuthError() {
        this.clearAuth();
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('login.html')) {
            FumaUtils.ui.showToast('Session expired. Please login again.', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Enhanced HTTP methods with query parameter handling
    async get(endpoint, params = {}) {
        const cleanParams = this.cleanParams(params);
        const queryString = new URLSearchParams(cleanParams).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // Clean and validate query parameters
    cleanParams(params) {
        const cleaned = {};
        
        Object.keys(params).forEach(key => {
            const value = params[key];
            
            // Skip null, undefined, and empty string values
            if (value !== null && value !== undefined && value !== '') {
                // Handle arrays
                if (Array.isArray(value)) {
                    cleaned[key] = value.join(',');
                } else {
                    cleaned[key] = value.toString();
                }
            }
        });
        
        return cleaned;
    }

    // Enhanced authentication methods
    async login(email, password) {
        try {
            const response = await this.post('/auth/login', { 
                email: email.toLowerCase().trim(), 
                password 
            });
            
            if (response.success && response.data) {
                this.setToken(response.data.token);
                this.setUser(response.data.user);
                
                // Store login timestamp
                localStorage.setItem('fuma_login_time', Date.now().toString());
            }
            
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed',
                data: null
            };
        }
    }

    async register(userData) {
        try {
            // Validate and clean user data
            const cleanUserData = {
                name: userData.name?.trim(),
                email: userData.email?.toLowerCase().trim(),
                password: userData.password,
                role: userData.role || 'VIEWER'
            };
            
            const response = await this.post('/auth/register', cleanUserData);
            
            if (response.success && response.data) {
                this.setToken(response.data.token);
                this.setUser(response.data.user);
            }
            
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Registration failed',
                data: null
            };
        }
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } catch (error) {
            console.warn('Logout request failed:', error.message);
        } finally {
            this.clearAuth();
            localStorage.removeItem('fuma_login_time');
        }
    }

    async getCurrentUser() {
        return this.get('/auth/me');
    }

    async refreshToken() {
        return this.post('/auth/refresh');
    }

    // Enhanced API methods with better parameter handling

    // Teams API
    async getTeams(params = {}) {
        const defaultParams = {
            page: 1,
            limit: 20,
            sortBy: 'name',
            sortOrder: 'asc'
        };
        
        return this.get('/teams', { ...defaultParams, ...params });
    }

    async getTeam(id) {
        if (!id) throw new Error('Team ID is required');
        return this.get(`/teams/${id}`);
    }

    async createTeam(teamData) {
        if (!teamData.name) throw new Error('Team name is required');
        return this.post('/teams', teamData);
    }

    async updateTeam(id, teamData) {
        if (!id) throw new Error('Team ID is required');
        return this.put(`/teams/${id}`, teamData);
    }

    async deleteTeam(id) {
        if (!id) throw new Error('Team ID is required');
        return this.delete(`/teams/${id}`);
    }

    async getTeamPlayers(teamId, params = {}) {
        if (!teamId) throw new Error('Team ID is required');
        return this.get(`/teams/${teamId}/players`, params);
    }

    async addPlayerToTeam(teamId, playerId) {
        if (!teamId || !playerId) throw new Error('Team ID and Player ID are required');
        return this.post(`/teams/${teamId}/players`, { playerId });
    }

    async removePlayerFromTeam(teamId, playerId) {
        if (!teamId || !playerId) throw new Error('Team ID and Player ID are required');
        return this.delete(`/teams/${teamId}/players/${playerId}`);
    }

    // Players API
    async getPlayers(params = {}) {
        const defaultParams = {
            page: 1,
            limit: 20,
            sortBy: 'name',
            sortOrder: 'asc'
        };
        
        return this.get('/players', { ...defaultParams, ...params });
    }

    async getPlayer(id) {
        if (!id) throw new Error('Player ID is required');
        return this.get(`/players/${id}`);
    }

    async createPlayer(playerData) {
        if (!playerData.name) throw new Error('Player name is required');
        return this.post('/players', playerData);
    }

    async updatePlayer(id, playerData) {
        if (!id) throw new Error('Player ID is required');
        return this.put(`/players/${id}`, playerData);
    }

    async deletePlayer(id) {
        if (!id) throw new Error('Player ID is required');
        return this.delete(`/players/${id}`);
    }

    // Tournaments API
    async getTournaments(params = {}) {
        const defaultParams = {
            page: 1,
            limit: 20,
            sortBy: 'startDate',
            sortOrder: 'desc'
        };
        
        return this.get('/tournaments', { ...defaultParams, ...params });
    }

    async getTournament(id) {
        if (!id) throw new Error('Tournament ID is required');
        return this.get(`/tournaments/${id}`);
    }

    async createTournament(tournamentData) {
        if (!tournamentData.name) throw new Error('Tournament name is required');
        return this.post('/tournaments', tournamentData);
    }

    async updateTournament(id, tournamentData) {
        if (!id) throw new Error('Tournament ID is required');
        return this.put(`/tournaments/${id}`, tournamentData);
    }

    async deleteTournament(id) {
        if (!id) throw new Error('Tournament ID is required');
        return this.delete(`/tournaments/${id}`);
    }

    async getTournamentTeams(tournamentId, params = {}) {
        if (!tournamentId) throw new Error('Tournament ID is required');
        return this.get(`/tournaments/${tournamentId}/teams`, params);
    }

    async getTournamentMatches(tournamentId, params = {}) {
        if (!tournamentId) throw new Error('Tournament ID is required');
        return this.get(`/tournaments/${tournamentId}/matches`, params);
    }

    async getTournamentStandings(tournamentId) {
        if (!tournamentId) throw new Error('Tournament ID is required');
        return this.get(`/tournaments/${tournamentId}/standings`);
    }

    // Matches API
    async getMatches(params = {}) {
        const defaultParams = {
            page: 1,
            limit: 20,
            sortBy: 'date',
            sortOrder: 'desc'
        };
        
        return this.get('/matches', { ...defaultParams, ...params });
    }

    async getMatch(id) {
        if (!id) throw new Error('Match ID is required');
        return this.get(`/matches/${id}`);
    }

    async createMatch(matchData) {
        if (!matchData.homeTeamId || !matchData.awayTeamId) {
            throw new Error('Home team and away team are required');
        }
        return this.post('/matches', matchData);
    }

    async updateMatch(id, matchData) {
        if (!id) throw new Error('Match ID is required');
        return this.put(`/matches/${id}`, matchData);
    }

    async deleteMatch(id) {
        if (!id) throw new Error('Match ID is required');
        return this.delete(`/matches/${id}`);
    }

    async getLiveMatch(id) {
        if (!id) throw new Error('Match ID is required');
        return this.get(`/matches/${id}/live`);
    }

    async updateLiveMatch(id, liveData) {
        if (!id) throw new Error('Match ID is required');
        return this.put(`/matches/${id}/live`, liveData);
    }

    async addMatchEvent(matchId, eventData) {
        if (!matchId) throw new Error('Match ID is required');
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
        if (!playerId) throw new Error('Player ID is required');
        const params = tournamentId ? { tournamentId } : {};
        return this.get(`/statistics/player/${playerId}`, params);
    }

    async getTeamStats(teamId, tournamentId = null) {
        if (!teamId) throw new Error('Team ID is required');
        const params = tournamentId ? { tournamentId } : {};
        return this.get(`/statistics/team/${teamId}`, params);
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    hasRole(role) {
        return this.user && this.user.role === role;
    }

    isAdmin() {
        return this.hasRole('ADMIN');
    }

    isManager() {
        return this.hasRole('MANAGER');
    }

    // Check if token is expired (client-side check)
    isTokenExpired() {
        if (!this.token) return true;
        
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            return Date.now() >= payload.exp * 1000;
        } catch {
            return true;
        }
    }

    // Auto-refresh token if needed
    async ensureValidToken() {
        if (this.isTokenExpired()) {
            try {
                const response = await this.refreshToken();
                if (response.success) {
                    this.setToken(response.data.token);
                    return true;
                }
            } catch (error) {
                console.warn('Token refresh failed:', error.message);
                this.handleAuthError();
                return false;
            }
        }
        return true;
    }
}

// Create enhanced global API client instance
window.apiClient = new EnhancedAPIClient();

// Listen for auth state changes across tabs
window.addEventListener('authStateChange', (event) => {
    const { type, user, token } = event.detail;
    
    if (type === 'logout') {
        // Redirect to login if user logged out in another tab
        if (window.location.pathname !== '/login.html') {
            window.location.href = 'login.html';
        }
    }
});

// Auto token refresh on page focus
window.addEventListener('focus', () => {
    if (window.apiClient.isAuthenticated()) {
        window.apiClient.ensureValidToken();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedAPIClient;
}
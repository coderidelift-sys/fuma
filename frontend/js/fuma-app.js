// FUMA Frontend JavaScript - Real-time Integration with Pusher
class FUMAApp {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3000/api';
    this.token = localStorage.getItem('fuma_token');
    this.currentUser = null;
    this.pusher = null;
    this.currentMatchChannel = null;
    
    this.init();
  }

  // Initialize the application
  async init() {
    try {
      // Initialize Pusher for real-time features
      this.initPusher();
      
      // Check if user is logged in
      if (this.token) {
        await this.getCurrentUser();
      }
      
      // Initialize page-specific functionality
      this.initPageFunctionality();
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log('🚀 FUMA App initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing FUMA App:', error);
    }
  }

  // Initialize Pusher for real-time features
  initPusher() {
    try {
      this.pusher = new Pusher('your-pusher-key', {
        cluster: 'your-pusher-cluster',
        encrypted: true
      });
      
      console.log('📡 Pusher initialized');
    } catch (error) {
      console.error('❌ Error initializing Pusher:', error);
    }
  }

  // API request helper
  async apiRequest(endpoint, options = {}) {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    try {
      const response = await this.apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      if (response.success) {
        this.token = response.data.token;
        this.currentUser = response.data.user;
        localStorage.setItem('fuma_token', this.token);
        
        this.showNotification('Login successful!', 'success');
        return true;
      }
    } catch (error) {
      this.showNotification(error.message, 'error');
      return false;
    }
  }

  async register(userData) {
    try {
      const response = await this.apiRequest('/auth/register', {
        method: 'POST',
        body: userData
      });

      if (response.success) {
        this.token = response.data.token;
        this.currentUser = response.data.user;
        localStorage.setItem('fuma_token', this.token);
        
        this.showNotification('Registration successful!', 'success');
        return true;
      }
    } catch (error) {
      this.showNotification(error.message, 'error');
      return false;
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.apiRequest('/auth/me');
      if (response.success) {
        this.currentUser = response.data.user;
        this.updateUIForLoggedInUser();
      }
    } catch (error) {
      this.logout();
    }
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('fuma_token');
    
    // Disconnect from real-time channels
    if (this.currentMatchChannel) {
      this.currentMatchChannel.unbind_all();
      this.pusher.unsubscribe(this.currentMatchChannel.name);
    }
    
    this.showNotification('Logged out successfully', 'info');
    window.location.href = 'login.html';
  }

  // Real-time match functionality
  subscribeToMatch(matchId) {
    if (!this.pusher) {
      console.error('Pusher not initialized');
      return;
    }

    // Unsubscribe from previous match if any
    if (this.currentMatchChannel) {
      this.currentMatchChannel.unbind_all();
      this.pusher.unsubscribe(this.currentMatchChannel.name);
    }

    // Subscribe to new match
    const channelName = `match-${matchId}`;
    this.currentMatchChannel = this.pusher.subscribe(channelName);

    // Bind to match events
    this.currentMatchChannel.bind('goal', (data) => {
      this.handleGoalEvent(data);
    });

    this.currentMatchChannel.bind('match-event', (data) => {
      this.handleMatchEvent(data);
    });

    this.currentMatchChannel.bind('score-update', (data) => {
      this.handleScoreUpdate(data);
    });

    this.currentMatchChannel.bind('stats-update', (data) => {
      this.handleStatsUpdate(data);
    });

    console.log(`📡 Subscribed to match ${matchId} real-time updates`);
  }

  // Handle real-time events
  handleGoalEvent(data) {
    console.log('⚽ Goal scored!', data);
    
    // Update score display
    this.updateMatchScore(data.newScore);
    
    // Add event to timeline
    this.addEventToTimeline(data.event, 'goal');
    
    // Show notification
    const playerName = `${data.event.player.firstName} ${data.event.player.lastName}`;
    this.showNotification(`⚽ GOAL! ${playerName} scores for ${data.event.team.name}!`, 'success');
    
    // Play sound notification
    this.playNotificationSound('goal');
    
    // Show browser notification if permission granted
    this.showBrowserNotification(`Goal by ${playerName}!`, {
      body: `${data.event.team.name} scores in minute ${data.event.minute}'`,
      icon: '/assets/goal-icon.png'
    });
  }

  handleMatchEvent(data) {
    console.log('📋 Match event:', data);
    
    // Add event to timeline
    this.addEventToTimeline(data.event, data.event.eventType.toLowerCase());
    
    // Show notification based on event type
    const playerName = `${data.event.player?.firstName || ''} ${data.event.player?.lastName || ''}`.trim();
    let message = '';
    
    switch (data.event.eventType) {
      case 'YELLOW_CARD':
        message = `🟨 Yellow card for ${playerName}`;
        break;
      case 'RED_CARD':
        message = `🟥 Red card for ${playerName}`;
        break;
      case 'SUBSTITUTION_IN':
        message = `🔄 ${playerName} comes on`;
        break;
      case 'SUBSTITUTION_OUT':
        message = `🔄 ${playerName} goes off`;
        break;
    }
    
    if (message) {
      this.showNotification(message, 'info');
    }
  }

  handleScoreUpdate(data) {
    console.log('📊 Score update:', data);
    this.updateMatchScore({
      home: data.homeScore,
      away: data.awayScore
    });
  }

  handleStatsUpdate(data) {
    console.log('📈 Stats update:', data);
    this.updateMatchStats(data.liveData);
  }

  // UI Update methods
  updateMatchScore(score) {
    const scoreElement = document.querySelector('.match-score-lg');
    if (scoreElement) {
      scoreElement.textContent = `${score.home} - ${score.away}`;
      
      // Add animation
      scoreElement.classList.add('score-updated');
      setTimeout(() => {
        scoreElement.classList.remove('score-updated');
      }, 1000);
    }
  }

  addEventToTimeline(event, eventType) {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    const eventElement = document.createElement('div');
    eventElement.className = 'timeline-item animate__animated animate__fadeInUp';
    
    const playerName = event.player ? `${event.player.firstName} ${event.player.lastName}` : '';
    const minute = event.additionalTime > 0 ? 
      `${event.minute}+${event.additionalTime}'` : `${event.minute}'`;
    
    let iconClass = '';
    let eventText = '';
    
    switch (eventType) {
      case 'goal':
        iconClass = 'goal-icon';
        eventText = `<strong>Goal!</strong> ${playerName} scores`;
        break;
      case 'yellow_card':
        iconClass = 'yellow-card-icon';
        eventText = `<strong>Yellow Card</strong> ${playerName}`;
        break;
      case 'red_card':
        iconClass = 'red-card-icon';
        eventText = `<strong>Red Card</strong> ${playerName}`;
        break;
      case 'substitution_in':
        iconClass = 'substitution-icon';
        eventText = `<strong>Substitution</strong> ${playerName} comes on`;
        break;
      case 'substitution_out':
        iconClass = 'substitution-icon';
        eventText = `<strong>Substitution</strong> ${playerName} goes off`;
        break;
    }

    eventElement.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="d-flex justify-content-between">
        <div>
          <span class="event-icon ${iconClass} me-2">
            <i class="fas fa-${this.getEventIcon(eventType)} fa-xs"></i>
          </span>
          ${eventText}
        </div>
        <span class="text-muted">${minute}</span>
      </div>
    `;

    // Insert at the top of timeline
    timeline.insertBefore(eventElement, timeline.firstChild);
  }

  updateMatchStats(liveData) {
    // Update possession
    const possessionHome = document.querySelector('.possession-home');
    const possessionAway = document.querySelector('.possession-away');
    if (possessionHome && possessionAway) {
      possessionHome.textContent = `${liveData.possessionHome}%`;
      possessionAway.textContent = `${liveData.possessionAway}%`;
      
      // Update possession bars
      const homeBar = document.querySelector('.possession-bar-home');
      const awayBar = document.querySelector('.possession-bar-away');
      if (homeBar && awayBar) {
        homeBar.style.width = `${liveData.possessionHome}%`;
        awayBar.style.width = `${liveData.possessionAway}%`;
      }
    }

    // Update shots
    const shotsHome = document.querySelector('.shots-home');
    const shotsAway = document.querySelector('.shots-away');
    if (shotsHome && shotsAway) {
      shotsHome.textContent = liveData.shotsHome;
      shotsAway.textContent = liveData.shotsAway;
    }

    // Update corners
    const cornersHome = document.querySelector('.corners-home');
    const cornersAway = document.querySelector('.corners-away');
    if (cornersHome && cornersAway) {
      cornersHome.textContent = liveData.cornersHome;
      cornersAway.textContent = liveData.cornersAway;
    }

    // Update current minute
    const currentMinute = document.querySelector('.current-minute');
    if (currentMinute) {
      const displayMinute = liveData.additionalTime > 0 ? 
        `${liveData.currentMinute}+${liveData.additionalTime}'` : `${liveData.currentMinute}'`;
      currentMinute.textContent = displayMinute;
    }
  }

  // Utility methods
  getEventIcon(eventType) {
    const icons = {
      'goal': 'futbol',
      'yellow_card': 'card',
      'red_card': 'card',
      'substitution_in': 'exchange-alt',
      'substitution_out': 'exchange-alt'
    };
    return icons[eventType] || 'circle';
  }

  playNotificationSound(type) {
    try {
      const audio = new Audio(`/assets/sounds/${type}.mp3`);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }

  showBrowserNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${this.getBootstrapAlertClass(type)} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  getBootstrapAlertClass(type) {
    const classes = {
      'success': 'success',
      'error': 'danger',
      'warning': 'warning',
      'info': 'info'
    };
    return classes[type] || 'info';
  }

  updateUIForLoggedInUser() {
    // Update navigation
    const loginLink = document.querySelector('a[href="login.html"]');
    if (loginLink && this.currentUser) {
      loginLink.innerHTML = `
        <i class="fas fa-user me-1"></i> ${this.currentUser.name}
      `;
      loginLink.href = '#';
      loginLink.onclick = (e) => {
        e.preventDefault();
        this.showUserMenu();
      };
    }
  }

  showUserMenu() {
    // Create dropdown menu for logged in user
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu show position-absolute';
    menu.style.cssText = 'top: 100%; right: 0;';
    
    menu.innerHTML = `
      <a class="dropdown-item" href="#" onclick="fumaApp.showProfile()">
        <i class="fas fa-user me-2"></i> Profile
      </a>
      <a class="dropdown-item" href="#" onclick="fumaApp.showSettings()">
        <i class="fas fa-cog me-2"></i> Settings
      </a>
      <div class="dropdown-divider"></div>
      <a class="dropdown-item" href="#" onclick="fumaApp.logout()">
        <i class="fas fa-sign-out-alt me-2"></i> Logout
      </a>
    `;

    // Position and show menu
    const loginLink = document.querySelector('a[href="#"]');
    if (loginLink) {
      loginLink.parentNode.style.position = 'relative';
      loginLink.parentNode.appendChild(menu);
      
      // Close menu when clicking outside
      setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
          if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
          }
        });
      }, 100);
    }
  }

  // Page-specific functionality
  initPageFunctionality() {
    const currentPage = this.getCurrentPage();
    
    switch (currentPage) {
      case 'match-detail':
        this.initMatchDetailPage();
        break;
      case 'matches':
        this.initMatchesPage();
        break;
      case 'login':
        this.initLoginPage();
        break;
      case 'register':
        this.initRegisterPage();
        break;
      case 'index':
        this.initHomePage();
        break;
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().split('.')[0];
    return page || 'index';
  }

  initMatchDetailPage() {
    // Get match ID from URL or data attribute
    const matchId = this.getMatchIdFromUrl();
    if (matchId) {
      this.subscribeToMatch(matchId);
      this.loadMatchDetails(matchId);
    }
    
    // Request notification permission for live updates
    this.requestNotificationPermission();
  }

  initMatchesPage() {
    this.loadMatches();
    
    // Set up auto-refresh for live matches
    setInterval(() => {
      this.refreshLiveMatches();
    }, 30000); // Refresh every 30 seconds
  }

  initLoginPage() {
    const loginForm = document.querySelector('form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const email = formData.get('email') || loginForm.querySelector('input[type="text"]').value;
        const password = formData.get('password') || loginForm.querySelector('input[type="password"]').value;
        
        const success = await this.login(email, password);
        if (success) {
          window.location.href = 'index.html';
        }
      });
    }
  }

  initRegisterPage() {
    const registerForm = document.querySelector('form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        
        const userData = {
          name: formData.get('name') || registerForm.querySelector('input[placeholder*="name"]').value,
          email: formData.get('email') || registerForm.querySelector('input[type="email"]').value,
          whatsapp: formData.get('whatsapp') || registerForm.querySelector('input[placeholder*="WhatsApp"]').value,
          password: formData.get('password') || registerForm.querySelector('input[type="password"]').value
        };
        
        const success = await this.register(userData);
        if (success) {
          window.location.href = 'index.html';
        }
      });
    }
  }

  initHomePage() {
    this.loadDashboardData();
  }

  // Data loading methods
  async loadMatchDetails(matchId) {
    try {
      const response = await this.apiRequest(`/matches/${matchId}`);
      if (response.success) {
        this.displayMatchDetails(response.data.match);
      }
    } catch (error) {
      this.showNotification('Error loading match details', 'error');
    }
  }

  async loadMatches() {
    try {
      const response = await this.apiRequest('/matches');
      if (response.success) {
        this.displayMatches(response.data.matches);
      }
    } catch (error) {
      this.showNotification('Error loading matches', 'error');
    }
  }

  async loadDashboardData() {
    try {
      const response = await this.apiRequest('/statistics');
      if (response.success) {
        this.displayDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  // Helper methods
  getMatchIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || document.querySelector('[data-match-id]')?.dataset.matchId;
  }

  setupEventListeners() {
    // Global event listeners
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize tooltips and popovers
      if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl);
        });
      }
    });
  }

  // Display methods (to be implemented based on specific UI needs)
  displayMatchDetails(match) {
    console.log('Displaying match details:', match);
    // Implementation depends on specific HTML structure
  }

  displayMatches(matches) {
    console.log('Displaying matches:', matches);
    // Implementation depends on specific HTML structure
  }

  displayDashboardData(data) {
    console.log('Displaying dashboard data:', data);
    // Update statistics on homepage
    this.updateStatisticCards(data.overview);
  }

  updateStatisticCards(overview) {
    const statCards = {
      'tournaments': overview.totalTournaments,
      'teams': overview.totalTeams,
      'players': overview.totalPlayers,
      'matches': overview.totalMatches
    };

    Object.entries(statCards).forEach(([key, value]) => {
      const element = document.querySelector(`[data-stat="${key}"] .stats-number`);
      if (element) {
        element.textContent = value;
      }
    });
  }

  async refreshLiveMatches() {
    // Refresh only live matches without full page reload
    try {
      const response = await this.apiRequest('/matches?status=LIVE');
      if (response.success) {
        this.updateLiveMatchesUI(response.data.matches);
      }
    } catch (error) {
      console.error('Error refreshing live matches:', error);
    }
  }

  updateLiveMatchesUI(liveMatches) {
    liveMatches.forEach(match => {
      const matchElement = document.querySelector(`[data-match-id="${match.id}"]`);
      if (matchElement) {
        const scoreElement = matchElement.querySelector('.match-score');
        if (scoreElement) {
          scoreElement.textContent = `${match.homeScore} - ${match.awayScore}`;
        }
      }
    });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.fumaApp = new FUMAApp();
});

// CSS for animations and real-time updates
const style = document.createElement('style');
style.textContent = `
  .score-updated {
    animation: scoreUpdate 0.5s ease-in-out;
  }

  @keyframes scoreUpdate {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); background-color: #28a745; color: white; }
    100% { transform: scale(1); }
  }

  .timeline-item.animate__fadeInUp {
    animation-duration: 0.5s;
  }

  .live-indicator {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }

  .notification-sound {
    display: none;
  }

  .possession-bar {
    transition: width 0.3s ease;
  }

  .stats-update {
    animation: statsUpdate 0.3s ease;
  }

  @keyframes statsUpdate {
    0% { background-color: transparent; }
    50% { background-color: rgba(40, 167, 69, 0.1); }
    100% { background-color: transparent; }
  }
`;
document.head.appendChild(style);
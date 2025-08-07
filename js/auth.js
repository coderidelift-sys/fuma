/**
 * Authentication Handler
 * Manages login, registration, and authentication state
 */

class AuthHandler {
    constructor() {
        this.init();
    }

    init() {
        // Check if already authenticated and redirect
        if (apiClient.isAuthenticated()) {
            this.redirectBasedOnRole();
            return;
        }

        this.setupEventListeners();
        this.setupDemoAccounts();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Enter key handling
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeForm = document.querySelector('form:not([style*="display: none"])');
                if (activeForm) {
                    activeForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    }

    setupDemoAccounts() {
        // Make demo account function globally available
        window.fillDemoAccount = (type) => {
            const demoAccounts = {
                admin: {
                    email: 'admin@fuma.com',
                    password: 'admin123'
                },
                manager: {
                    email: 'manager@fuma.com',
                    password: 'demo123'
                },
                viewer: {
                    email: 'viewer@fuma.com',
                    password: 'demo123'
                }
            };

            const account = demoAccounts[type];
            if (account) {
                document.getElementById('email').value = account.email;
                document.getElementById('password').value = account.password;
                
                // Auto-focus password field for quick login
                document.getElementById('password').focus();
                
                FumaUtils.ui.showToast(`Demo ${type} account filled`, 'info');
            }
        };
    }

    async handleLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        // Validation
        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'danger');
            return;
        }

        if (!FumaUtils.validation.isEmail(email)) {
            this.showMessage('Please enter a valid email address', 'danger');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing In...';
        submitBtn.disabled = true;

        try {
            const response = await apiClient.login(email, password);

            if (response.success) {
                // Store remember me preference
                if (rememberMe) {
                    localStorage.setItem('fuma_remember_me', 'true');
                } else {
                    localStorage.removeItem('fuma_remember_me');
                }

                this.showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    this.redirectBasedOnRole();
                }, 1000);

            } else {
                throw new Error(response.message || 'Login failed');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(error.message || 'Login failed. Please try again.', 'danger');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister() {
        const name = document.getElementById('name')?.value?.trim();
        const email = document.getElementById('email')?.value?.trim();
        const whatsapp = document.getElementById('whatsapp')?.value?.trim();
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const terms = document.getElementById('terms')?.checked;
        const newsletter = document.getElementById('newsletter')?.checked;

        // Enhanced validation
        if (!name || !email || !password || !confirmPassword) {
            this.showMessage('Please fill in all required fields', 'danger');
            return;
        }

        if (!FumaUtils.validation.isEmail(email)) {
            this.showMessage('Please enter a valid email address', 'danger');
            return;
        }

        if (whatsapp && !FumaUtils.validation.isPhone(whatsapp)) {
            this.showMessage('Please enter a valid WhatsApp number', 'danger');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'danger');
            return;
        }

        if (!terms) {
            this.showMessage('You must agree to the terms and conditions', 'danger');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('#registerForm button[type="submit"]') || 
                         document.querySelector('#registerBtn');
        const originalText = submitBtn?.innerHTML;
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...';
            submitBtn.disabled = true;
        }

        try {
            const userData = {
                name,
                email,
                password,
                newsletter: newsletter || false
            };

            if (whatsapp) {
                userData.whatsapp = whatsapp;
            }

            const response = await apiClient.register(userData);

            if (response.success) {
                this.showMessage('Account created successfully! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    this.redirectBasedOnRole();
                }, 1000);

            } else {
                throw new Error(response.message || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage(error.message || 'Registration failed. Please try again.', 'danger');
        } finally {
            // Restore button state
            if (submitBtn && originalText) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    redirectBasedOnRole() {
        if (!apiClient.user) {
            window.location.href = '/login.html';
            return;
        }

        switch (apiClient.user.role) {
            case 'ADMIN':
                window.location.href = '/admin-dashboard.html';
                break;
            case 'MANAGER':
                window.location.href = '/manager-dashboard.html';
                break;
            case 'VIEWER':
            default:
                window.location.href = '/index.html';
                break;
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        if (!container) return;

        const alertClass = type === 'danger' ? 'alert-danger' : 
                          type === 'success' ? 'alert-success' : 
                          type === 'warning' ? 'alert-warning' : 'alert-info';

        const icon = type === 'danger' ? 'fa-exclamation-triangle' : 
                    type === 'success' ? 'fa-check-circle' : 
                    type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle';

        container.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="fas ${icon} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                const alert = container.querySelector('.alert');
                if (alert) {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }
            }, 3000);
        }
    }

    // Check authentication status
    static checkAuth(requiredRole = null) {
        if (!apiClient.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }

        if (requiredRole && !apiClient.hasRole(requiredRole)) {
            FumaUtils.ui.showToast('Access denied. Insufficient permissions.', 'danger');
            window.location.href = '/index.html';
            return false;
        }

        return true;
    }

    // Logout function
    static async logout() {
        try {
            await apiClient.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            window.location.href = '/login.html';
        }
    }
}

// Initialize authentication handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authHandler = new AuthHandler();
});

// Make logout function globally available
window.logout = AuthHandler.logout;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthHandler;
}
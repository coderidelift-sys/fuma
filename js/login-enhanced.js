/**
 * Enhanced Login Form Handler
 * Provides advanced form validation, password toggle, and UX improvements for login
 */

class LoginFormHandler {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.rememberMeInput = document.getElementById('rememberMe');
        this.forgotPasswordForm = document.getElementById('forgotPasswordForm');
        
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupPasswordToggle();
        this.setupRealTimeValidation();
        this.setupFormSubmission();
        this.setupForgotPassword();
        this.setupKeyboardShortcuts();
        this.loadRememberedCredentials();
    }

    setupFormValidation() {
        // Bootstrap form validation
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (this.validateForm()) {
                this.handleLogin();
            }

            this.form.classList.add('was-validated');
        });
    }

    setupPasswordToggle() {
        const toggleButton = document.querySelector('.password-toggle');
        
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                const targetId = toggleButton.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                const icon = toggleButton.querySelector('i');

                if (targetInput.type === 'password') {
                    targetInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                    toggleButton.setAttribute('aria-label', 'Hide password');
                } else {
                    targetInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                    toggleButton.setAttribute('aria-label', 'Show password');
                }
            });
        }
    }

    setupRealTimeValidation() {
        // Email validation on blur
        this.emailInput.addEventListener('blur', () => {
            this.validateEmail();
        });

        // Email validation on input (with debounce)
        this.emailInput.addEventListener('input', FumaUtils.debounce(() => {
            if (this.emailInput.value.length > 3) {
                this.validateEmail();
            }
        }, 300));

        // Password validation
        this.passwordInput.addEventListener('blur', () => {
            this.validatePassword();
        });

        // Clear validation on focus
        [this.emailInput, this.passwordInput].forEach(input => {
            input.addEventListener('focus', () => {
                input.classList.remove('is-valid', 'is-invalid');
            });
        });
    }

    setupFormSubmission() {
        // Prevent multiple submissions
        this.form.addEventListener('submit', () => {
            const submitBtn = document.getElementById('loginBtn');
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.disabled = false;
            }, 3000);
        });
    }

    setupForgotPassword() {
        if (this.forgotPasswordForm) {
            this.forgotPasswordForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.handleForgotPassword();
            });
        }
    }

    setupKeyboardShortcuts() {
        // Enter key handling for better UX
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                const activeElement = document.activeElement;
                
                // If focus is on email, move to password
                if (activeElement === this.emailInput) {
                    event.preventDefault();
                    this.passwordInput.focus();
                }
                // If focus is on password, submit form
                else if (activeElement === this.passwordInput) {
                    event.preventDefault();
                    this.form.dispatchEvent(new Event('submit'));
                }
            }
        });
    }

    loadRememberedCredentials() {
        // Load remembered email if available
        const rememberedEmail = FumaUtils.storage.get('fuma_remembered_email');
        if (rememberedEmail) {
            this.emailInput.value = rememberedEmail;
            this.rememberMeInput.checked = true;
            this.passwordInput.focus();
        }
    }

    validateForm() {
        let isValid = true;

        // Validate email
        isValid = this.validateEmail() && isValid;
        
        // Validate password
        isValid = this.validatePassword() && isValid;

        return isValid;
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        const isValid = email && FumaUtils.validation.isEmail(email);

        this.setFieldValidation(this.emailInput, isValid);
        return isValid;
    }

    validatePassword() {
        const password = this.passwordInput.value;
        const isValid = password && password.length > 0;

        this.setFieldValidation(this.passwordInput, isValid);
        return isValid;
    }

    setFieldValidation(field, isValid) {
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
    }

    async handleLogin() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        const rememberMe = this.rememberMeInput.checked;

        // Show loading state
        this.showLoadingState();

        try {
            // Save email if remember me is checked
            if (rememberMe) {
                FumaUtils.storage.set('fuma_remembered_email', email);
            } else {
                FumaUtils.storage.remove('fuma_remembered_email');
            }

            // Call the existing auth handler
            if (window.authHandler && typeof window.authHandler.handleLogin === 'function') {
                // Update form fields to match what auth handler expects
                this.emailInput.value = email;
                this.passwordInput.value = password;
                this.rememberMeInput.checked = rememberMe;

                await window.authHandler.handleLogin();
            } else {
                // Fallback to direct API call
                const response = await apiClient.login(email, password);

                if (response.success) {
                    this.showSuccessMessage('Login successful! Redirecting...');
                    
                    // Redirect after short delay
                    setTimeout(() => {
                        this.redirectBasedOnRole();
                    }, 1500);
                } else {
                    throw new Error(response.message || 'Login failed');
                }
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showErrorMessage(error.message || 'Login failed. Please check your credentials and try again.');
            
            // Focus on email field for retry
            this.emailInput.focus();
            this.emailInput.select();
        } finally {
            this.hideLoadingState();
        }
    }

    async handleForgotPassword() {
        const email = document.getElementById('resetEmail').value.trim();
        
        if (!email || !FumaUtils.validation.isEmail(email)) {
            this.showResetMessage('Please enter a valid email address.', 'danger');
            return;
        }

        const submitBtn = this.forgotPasswordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate API call (implement actual forgot password API)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showResetMessage('Password reset link has been sent to your email address.', 'success');
            
            // Close modal after success
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                if (modal) modal.hide();
            }, 3000);

        } catch (error) {
            console.error('Forgot password error:', error);
            this.showResetMessage('Failed to send reset link. Please try again.', 'danger');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    redirectBasedOnRole() {
        if (!apiClient.user) {
            window.location.href = 'index.html';
            return;
        }

        switch (apiClient.user.role) {
            case 'ADMIN':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'MANAGER':
                window.location.href = 'manager-dashboard.html';
                break;
            case 'VIEWER':
            default:
                window.location.href = 'index.html';
                break;
        }
    }

    showLoadingState() {
        const submitBtn = document.getElementById('loginBtn');
        const loadingState = document.getElementById('loadingState');

        submitBtn.classList.add('d-none');
        loadingState.classList.remove('d-none');
    }

    hideLoadingState() {
        const submitBtn = document.getElementById('loginBtn');
        const loadingState = document.getElementById('loadingState');

        submitBtn.classList.remove('d-none');
        loadingState.classList.add('d-none');
    }

    showSuccessMessage(message) {
        const container = document.getElementById('messageContainer');
        container.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show animate__animated animate__fadeIn" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    showErrorMessage(message) {
        const container = document.getElementById('messageContainer');
        container.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show animate__animated animate__fadeIn" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Scroll to message
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showResetMessage(message, type = 'info') {
        const container = document.getElementById('resetMessageContainer');
        const alertClass = type === 'danger' ? 'alert-danger' : 
                          type === 'success' ? 'alert-success' : 'alert-info';
        const icon = type === 'danger' ? 'fa-exclamation-triangle' : 
                    type === 'success' ? 'fa-check-circle' : 'fa-info-circle';

        container.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="fas ${icon} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    // Enhanced demo account functionality
    enhanceDemoAccounts() {
        // Override the global fillDemoAccount function with enhanced features
        window.fillDemoAccount = (type) => {
            const demoAccounts = {
                admin: {
                    email: 'admin@fuma.com',
                    password: 'admin123',
                    name: 'System Administrator'
                },
                manager: {
                    email: 'manager@fuma.com',
                    password: 'demo123',
                    name: 'Tournament Manager'
                },
                viewer: {
                    email: 'viewer@fuma.com',
                    password: 'demo123',
                    name: 'Tournament Viewer'
                }
            };

            const account = demoAccounts[type];
            if (account) {
                // Animate the filling process
                this.emailInput.style.transition = 'all 0.3s ease';
                this.passwordInput.style.transition = 'all 0.3s ease';
                
                this.emailInput.value = '';
                this.passwordInput.value = '';
                
                // Type animation effect
                this.typeText(this.emailInput, account.email, () => {
                    this.typeText(this.passwordInput, account.password, () => {
                        this.passwordInput.focus();
                        FumaUtils.ui.showToast(`${account.name} credentials loaded`, 'success');
                    });
                });
            }
        };
    }

    typeText(element, text, callback) {
        let i = 0;
        const timer = setInterval(() => {
            element.value += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(timer);
                if (callback) callback();
            }
        }, 50);
    }
}

// Initialize the login form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        window.loginFormHandler = new LoginFormHandler();
        window.loginFormHandler.enhanceDemoAccounts();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginFormHandler;
}
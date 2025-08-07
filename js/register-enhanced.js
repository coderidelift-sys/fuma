/**
 * Enhanced Registration Form Handler
 * Provides advanced form validation, password strength checking, and UX improvements
 */

class RegisterFormHandler {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.emailInput = document.getElementById('email');
        this.nameInput = document.getElementById('name');
        this.whatsappInput = document.getElementById('whatsapp');
        this.termsInput = document.getElementById('terms');
        
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupPasswordStrength();
        this.setupPasswordToggle();
        this.setupRealTimeValidation();
        this.setupFormSubmission();
    }

    setupFormValidation() {
        // Bootstrap form validation
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (this.validateForm()) {
                this.handleRegistration();
            }

            this.form.classList.add('was-validated');
        });
    }

    setupPasswordStrength() {
        this.passwordInput.addEventListener('input', () => {
            this.checkPasswordStrength();
            this.validatePasswordMatch();
        });

        this.confirmPasswordInput.addEventListener('input', () => {
            this.validatePasswordMatch();
        });
    }

    setupPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                const icon = button.querySelector('i');

                if (targetInput.type === 'password') {
                    targetInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    targetInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    setupRealTimeValidation() {
        // Email validation
        this.emailInput.addEventListener('blur', () => {
            this.validateEmail();
        });

        // Name validation
        this.nameInput.addEventListener('blur', () => {
            this.validateName();
        });

        // WhatsApp validation
        this.whatsappInput.addEventListener('blur', () => {
            this.validateWhatsApp();
        });

        // Terms validation
        this.termsInput.addEventListener('change', () => {
            this.validateTerms();
        });
    }

    setupFormSubmission() {
        // Prevent multiple submissions
        this.form.addEventListener('submit', () => {
            const submitBtn = document.getElementById('registerBtn');
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.disabled = false;
            }, 3000);
        });
    }

    validateForm() {
        let isValid = true;

        // Validate all fields
        isValid = this.validateName() && isValid;
        isValid = this.validateEmail() && isValid;
        isValid = this.validateWhatsApp() && isValid;
        isValid = this.validatePassword() && isValid;
        isValid = this.validatePasswordMatch() && isValid;
        isValid = this.validateTerms() && isValid;

        return isValid;
    }

    validateName() {
        const name = this.nameInput.value.trim();
        const isValid = name.length >= 2 && name.length <= 50;

        this.setFieldValidation(this.nameInput, isValid);
        return isValid;
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        const isValid = FumaUtils.validation.isEmail(email);

        this.setFieldValidation(this.emailInput, isValid);
        return isValid;
    }

    validateWhatsApp() {
        const whatsapp = this.whatsappInput.value.trim();
        
        // WhatsApp is optional, so it's valid if empty or if it matches the pattern
        const isValid = whatsapp === '' || FumaUtils.validation.isPhone(whatsapp);

        this.setFieldValidation(this.whatsappInput, isValid);
        return isValid;
    }

    validatePassword() {
        const password = this.passwordInput.value;
        const isValid = password.length >= 6;

        this.setFieldValidation(this.passwordInput, isValid);
        return isValid;
    }

    validatePasswordMatch() {
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        const isValid = password === confirmPassword && confirmPassword !== '';

        this.setFieldValidation(this.confirmPasswordInput, isValid);
        return isValid;
    }

    validateTerms() {
        const isValid = this.termsInput.checked;
        this.setFieldValidation(this.termsInput, isValid);
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

    checkPasswordStrength() {
        const password = this.passwordInput.value;
        const progressBar = document.querySelector('.password-strength .progress-bar');
        const strengthText = document.querySelector('.password-strength-text');

        if (!password) {
            progressBar.style.width = '0%';
            progressBar.className = 'progress-bar';
            strengthText.textContent = '';
            return;
        }

        let strength = 0;
        let feedback = [];

        // Length check
        if (password.length >= 8) {
            strength += 20;
        } else {
            feedback.push('at least 8 characters');
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            strength += 20;
        } else {
            feedback.push('uppercase letter');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            strength += 20;
        } else {
            feedback.push('lowercase letter');
        }

        // Number check
        if (/\d/.test(password)) {
            strength += 20;
        } else {
            feedback.push('number');
        }

        // Special character check
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            strength += 20;
        } else {
            feedback.push('special character');
        }

        // Update progress bar
        progressBar.style.width = `${strength}%`;

        // Update color and text based on strength
        if (strength < 40) {
            progressBar.className = 'progress-bar bg-danger';
            strengthText.textContent = `Weak - Add ${feedback.slice(0, 2).join(', ')}`;
            strengthText.className = 'password-strength-text text-danger mt-1 d-block';
        } else if (strength < 80) {
            progressBar.className = 'progress-bar bg-warning';
            strengthText.textContent = `Good - Add ${feedback.slice(0, 1).join(', ')}`;
            strengthText.className = 'password-strength-text text-warning mt-1 d-block';
        } else {
            progressBar.className = 'progress-bar bg-success';
            strengthText.textContent = 'Strong password!';
            strengthText.className = 'password-strength-text text-success mt-1 d-block';
        }
    }

    async handleRegistration() {
        const formData = new FormData(this.form);
        const userData = {
            name: formData.get('name').trim(),
            email: formData.get('email').trim(),
            password: formData.get('password'),
            newsletter: formData.get('newsletter') === 'on'
        };

        // Add WhatsApp if provided
        const whatsapp = formData.get('whatsapp').trim();
        if (whatsapp) {
            userData.whatsapp = whatsapp;
        }

        // Show loading state
        this.showLoadingState();

        try {
            // Call the existing auth handler
            if (window.authHandler && typeof window.authHandler.handleRegister === 'function') {
                // Update the form fields to match what auth handler expects
                document.getElementById('name').value = userData.name;
                document.getElementById('email').value = userData.email;
                document.getElementById('password').value = userData.password;
                document.getElementById('confirmPassword').value = userData.password;
                
                if (userData.whatsapp) {
                    document.getElementById('whatsapp').value = userData.whatsapp;
                }

                await window.authHandler.handleRegister();
            } else {
                // Fallback to direct API call
                const response = await apiClient.register(userData);

                if (response.success) {
                    this.showSuccessMessage('Account created successfully! Redirecting...');
                    
                    // Redirect after short delay
                    setTimeout(() => {
                        window.location.href = '/index.html';
                    }, 2000);
                } else {
                    throw new Error(response.message || 'Registration failed');
                }
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.showErrorMessage(error.message || 'Registration failed. Please try again.');
        } finally {
            this.hideLoadingState();
        }
    }

    showLoadingState() {
        const submitBtn = document.getElementById('registerBtn');
        const loadingState = document.getElementById('loadingState');

        submitBtn.classList.add('d-none');
        loadingState.classList.remove('d-none');
    }

    hideLoadingState() {
        const submitBtn = document.getElementById('registerBtn');
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
}

// Initialize the registration form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('registerForm')) {
        window.registerFormHandler = new RegisterFormHandler();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegisterFormHandler;
}
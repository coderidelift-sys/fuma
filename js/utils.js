/**
 * FUMA Utility Functions
 * Common helper functions for UI, validation, and data manipulation
 */

const FumaUtils = {
    // DOM Manipulation
    dom: {
        // Get element by ID
        get(id) {
            return document.getElementById(id);
        },

        // Get elements by class name
        getByClass(className) {
            return document.getElementsByClassName(className);
        },

        // Get elements by selector
        query(selector) {
            return document.querySelector(selector);
        },

        queryAll(selector) {
            return document.querySelectorAll(selector);
        },

        // Create element with attributes
        create(tag, attributes = {}, content = '') {
            const element = document.createElement(tag);
            
            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'innerHTML') {
                    element.innerHTML = attributes[key];
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            });
            
            if (content) {
                element.textContent = content;
            }
            
            return element;
        },

        // Show/hide elements
        show(element) {
            if (typeof element === 'string') {
                element = this.get(element);
            }
            if (element) element.style.display = 'block';
        },

        hide(element) {
            if (typeof element === 'string') {
                element = this.get(element);
            }
            if (element) element.style.display = 'none';
        },

        toggle(element) {
            if (typeof element === 'string') {
                element = this.get(element);
            }
            if (element) {
                element.style.display = element.style.display === 'none' ? 'block' : 'none';
            }
        }
    },

    // Date/Time utilities
    date: {
        // Format date to readable string
        format(date, format = 'DD/MM/YYYY') {
            if (!date) return '';
            
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            
            return format
                .replace('DD', day)
                .replace('MM', month)
                .replace('YYYY', year)
                .replace('HH', hours)
                .replace('mm', minutes);
        },

        // Get relative time (e.g., "2 hours ago")
        relative(date) {
            if (!date) return '';
            
            const now = new Date();
            const past = new Date(date);
            const diffMs = now - past;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} minutes ago`;
            if (diffHours < 24) return `${diffHours} hours ago`;
            if (diffDays < 30) return `${diffDays} days ago`;
            
            return this.format(date);
        },

        // Check if date is today
        isToday(date) {
            const today = new Date();
            const checkDate = new Date(date);
            return checkDate.toDateString() === today.toDateString();
        },

        // Get time until match
        timeUntil(date) {
            const now = new Date();
            const matchDate = new Date(date);
            const diffMs = matchDate - now;
            
            if (diffMs <= 0) return 'Started';
            
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            if (diffDays > 0) return `${diffDays} days`;
            if (diffHours > 0) return `${diffHours} hours`;
            return `${diffMins} minutes`;
        }
    },

    // Validation utilities
    validation: {
        // Email validation
        isEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        // Phone validation
        isPhone(phone) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(phone.replace(/\s/g, ''));
        },

        // Required field validation
        isRequired(value) {
            return value && value.toString().trim().length > 0;
        },

        // Minimum length validation
        minLength(value, min) {
            return value && value.toString().length >= min;
        },

        // Maximum length validation
        maxLength(value, max) {
            return value && value.toString().length <= max;
        },

        // Number validation
        isNumber(value) {
            return !isNaN(value) && !isNaN(parseFloat(value));
        },

        // URL validation
        isURL(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }
    },

    // UI utilities
    ui: {
        // Show loading spinner
        showLoading(element, text = 'Loading...') {
            if (typeof element === 'string') {
                element = FumaUtils.dom.get(element);
            }
            
            if (element) {
                element.innerHTML = `
                    <div class="d-flex justify-content-center align-items-center p-4">
                        <div class="spinner-border text-primary me-2" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <span>${text}</span>
                    </div>
                `;
            }
        },

        // Show error message
        showError(element, message) {
            if (typeof element === 'string') {
                element = FumaUtils.dom.get(element);
            }
            
            if (element) {
                element.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        ${message}
                    </div>
                `;
            }
        },

        // Show success message
        showSuccess(element, message) {
            if (typeof element === 'string') {
                element = FumaUtils.dom.get(element);
            }
            
            if (element) {
                element.innerHTML = `
                    <div class="alert alert-success" role="alert">
                        <i class="fas fa-check-circle me-2"></i>
                        ${message}
                    </div>
                `;
            }
        },

        // Show toast notification
        showToast(message, type = 'info', duration = 3000) {
            const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
            
            const toast = FumaUtils.dom.create('div', {
                className: `toast align-items-center text-white bg-${type} border-0`,
                role: 'alert'
            });
            
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;
            
            toastContainer.appendChild(toast);
            
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, duration + 500);
        },

        // Create toast container if it doesn't exist
        createToastContainer() {
            const container = FumaUtils.dom.create('div', {
                id: 'toast-container',
                className: 'toast-container position-fixed top-0 end-0 p-3',
                style: 'z-index: 1055;'
            });
            
            document.body.appendChild(container);
            return container;
        },

        // Confirm dialog
        confirm(message, title = 'Confirm') {
            return new Promise((resolve) => {
                const modal = this.createConfirmModal(message, title, resolve);
                document.body.appendChild(modal);
                
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
                
                modal.addEventListener('hidden.bs.modal', () => {
                    document.body.removeChild(modal);
                });
            });
        },

        // Create confirm modal
        createConfirmModal(message, title, callback) {
            const modal = FumaUtils.dom.create('div', {
                className: 'modal fade',
                tabindex: '-1'
            });
            
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary confirm-btn">Confirm</button>
                        </div>
                    </div>
                </div>
            `;
            
            modal.querySelector('.confirm-btn').addEventListener('click', () => {
                callback(true);
                bootstrap.Modal.getInstance(modal).hide();
            });
            
            modal.addEventListener('hidden.bs.modal', () => {
                if (callback) callback(false);
            });
            
            return modal;
        }
    },

    // Data formatting utilities
    format: {
        // Format number with commas
        number(num) {
            if (!num) return '0';
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },

        // Format currency
        currency(amount, currency = 'USD') {
            if (!amount) return '$0';
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount);
        },

        // Truncate text
        truncate(text, length = 100) {
            if (!text) return '';
            return text.length > length ? text.substring(0, length) + '...' : text;
        },

        // Capitalize first letter
        capitalize(text) {
            if (!text) return '';
            return text.charAt(0).toUpperCase() + text.slice(1);
        },

        // Format player position
        position(position) {
            const positions = {
                'GOALKEEPER': 'GK',
                'DEFENDER': 'DEF',
                'MIDFIELDER': 'MID',
                'FORWARD': 'FWD'
            };
            return positions[position] || position;
        },

        // Format match status
        matchStatus(status) {
            const statuses = {
                'SCHEDULED': 'Scheduled',
                'LIVE': 'Live',
                'HALFTIME': 'Half Time',
                'COMPLETED': 'Completed',
                'POSTPONED': 'Postponed',
                'CANCELLED': 'Cancelled'
            };
            return statuses[status] || status;
        },

        // Format tournament status
        tournamentStatus(status) {
            const statuses = {
                'UPCOMING': 'Upcoming',
                'ONGOING': 'Ongoing',
                'COMPLETED': 'Completed',
                'CANCELLED': 'Cancelled'
            };
            return statuses[status] || status;
        }
    },

    // Local storage utilities
    storage: {
        // Set item in localStorage
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        },

        // Get item from localStorage
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        // Remove item from localStorage
        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Error removing from localStorage:', error);
            }
        },

        // Clear all localStorage
        clear() {
            try {
                localStorage.clear();
            } catch (error) {
                console.error('Error clearing localStorage:', error);
            }
        }
    },

    // Debounce function for search inputs
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Generate random ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Check if user is on mobile device
    isMobile() {
        return window.innerWidth <= 768;
    }
};

// Make utils globally available
window.FumaUtils = FumaUtils;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FumaUtils;
}
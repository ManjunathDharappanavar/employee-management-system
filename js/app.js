const { createApp } = Vue

const app = createApp({
    data() {
        return {
            isLoggedIn: false,
            loginForm: {
                email: '',
                password: ''
            },
            signupForm: {
                name: '',
                email: '',
                password: '',
                baseSalary: ''
            },
            userData: null,
            attendanceStatus: 'Not Marked',
            monthlySalary: 0,
            baseSalary: 0,
            overtimeHours: 0,
            currentOvertime: '00:00:00',
            isOvertimeActive: false,
            overtimeStartTime: null,
            overtimeTimer: null,
            overtimeHistory: [],
            loginModal: null,
            signupModal: null,
            profileModal: null,
            deleteConfirmModal: null,
            showPassword: false,
            showSignupPassword: false,
            loading: false,
            errorMessage: '',
            successMessage: '',
            profile: null,
            showProfileModal: false,
            showDeleteConfirm: false
        }
    },
    mounted() {
        this.loginModal = new bootstrap.Modal(document.getElementById('loginModal'))
        this.signupModal = new bootstrap.Modal(document.getElementById('signupModal'))
        this.profileModal = new bootstrap.Modal(document.getElementById('profileModal'))
        this.deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'))
        
        const token = localStorage.getItem('token')
        if (token) {
            this.validateToken(token)
        }
    },
    methods: {
        showLoginModal() {
            this.loginModal.show()
            this.resetForms()
        },
        showSignupModal() {
            this.signupModal.show()
            this.resetForms()
        },
        switchToSignup() {
            this.loginModal.hide()
            this.showSignupModal()
        },
        switchToLogin() {
            this.signupModal.hide()
            this.showLoginModal()
        },
        resetForms() {
            this.loginForm = {
                email: '',
                password: ''
            }
            this.signupForm = {
                name: '',
                email: '',
                password: '',
                baseSalary: ''
            }
            this.showPassword = false
            this.showSignupPassword = false
            this.errorMessage = ''
            this.successMessage = ''
        },
        showError(message) {
            this.errorMessage = message
            setTimeout(() => {
                this.errorMessage = ''
            }, 5000)
        },
        showSuccess(message) {
            this.successMessage = message
            setTimeout(() => {
                this.successMessage = ''
            }, 5000)
        },
        async login() {
            this.loading = true
            this.errorMessage = ''
            
            try {
                if (!this.loginForm.email || !this.loginForm.password) {
                    this.showError('Email and password are required')
                    return
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(this.loginForm.email)) {
                    this.showError('Invalid email format')
                    return
                }

                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.loginForm.email.trim().toLowerCase(),
                        password: this.loginForm.password
                    })
                })
                
                const data = await response.json()
                
                if (response.ok) {
                    localStorage.setItem('token', data.token)
                    this.userData = data.user
                    this.isLoggedIn = true
                    this.loginModal.hide()
                    this.loadDashboardData()
                    this.loadProfileData() 
                    this.showSuccess('Login successful!')
                    this.resetForms()
                } else {
                    this.showError(data.message || 'Invalid credentials')
                }
            } catch (error) {
                console.error('Login error:', error)
                this.showError('Login failed. Please try again.')
            } finally {
                this.loading = false
            }
        },
        async signup() {
            this.loading = true
            this.errorMessage = ''
            
            try {
                if (!this.signupForm.name || !this.signupForm.email || !this.signupForm.password || !this.signupForm.baseSalary) {
                    this.showError('All fields are required')
                    return
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(this.signupForm.email)) {
                    this.showError('Invalid email format')
                    return
                }

                if (this.signupForm.password.length < 6) {
                    this.showError('Password must be at least 6 characters long')
                    return
                }

                const salary = parseFloat(this.signupForm.baseSalary)
                if (isNaN(salary) || salary <= 0) {
                    this.showError('Invalid base salary')
                    return
                }

                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: this.signupForm.name.trim(),
                        email: this.signupForm.email.trim().toLowerCase(),
                        password: this.signupForm.password,
                        baseSalary: salary
                    })
                })
                
                const data = await response.json()
                
                if (response.ok) {
                    this.showSuccess(data.message || 'Signup successful! Please login.')
                    this.signupModal.hide()
                    this.showLoginModal()
                    this.resetForms()
                } else {
                    this.showError(data.message || 'Signup failed')
                }
            } catch (error) {
                console.error('Signup error:', error)
                this.showError('Signup failed. Please try again.')
            } finally {
                this.loading = false
            }
        },
        async markAttendance(status) {
            this.loading = true
            try {
                const token = localStorage.getItem('token')
                const response = await fetch('/api/attendance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status })
                })
                
                if (response.ok) {
                    this.attendanceStatus = status
                    this.showSuccess('Attendance marked successfully!')
                } else {
                    const error = await response.json()
                    this.showError(error.message || 'Failed to mark attendance')
                }
            } catch (error) {
                console.error('Attendance error:', error)
                this.showError('Failed to mark attendance')
            } finally {
                this.loading = false
            }
        },
        logout() {
            localStorage.removeItem('token')
            this.isLoggedIn = false
            this.userData = null
            this.resetDashboardData()
            this.showSuccess('Logged out successfully!')
        },
        async validateToken(token) {
            try {
                const response = await fetch('/api/auth/validate', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                
                if (response.ok) {
                    const data = await response.json()
                    this.userData = data.user
                    this.isLoggedIn = true
                    this.loadDashboardData()
                    this.loadProfileData() 
                } else {
                    this.logout()
                }
            } catch (error) {
                console.error('Token validation error:', error)
                this.logout()
            }
        },
        async loadDashboardData() {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch('/api/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                
                if (response.ok) {
                    const data = await response.json()
                    this.attendanceStatus = data.attendanceStatus
                    this.monthlySalary = data.monthlySalary
                    this.baseSalary = data.baseSalary
                    this.overtimeHours = data.overtimeHours
                    this.loadOvertimeHistory()
                }
            } catch (error) {
                console.error('Dashboard data loading error:', error)
            }
        },
        async loadProfileData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    this.showError('Please login to view profile');
                    return;
                }

                this.loading = true;
                console.log('Fetching profile data...');
                
                const response = await fetch('/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Profile response status:', response.status);
                const data = await response.json().catch(() => ({ profile: null, message: 'Invalid response' })); // Handle invalid JSON
                
                if (response.ok && data.profile) {
                    this.profile = data.profile;
                    console.log('Profile data loaded successfully:', this.profile);
                    
                    this.baseSalary = parseFloat(this.profile.base_salary);
                    this.monthlySalary = parseFloat(this.profile.monthly_salary);
                    this.overtimeHours = parseFloat(this.profile.attendance.total_overtime);
                    
                    if (this.profile.attendance.today_check_in) {
                        this.profile.attendance.today_check_in = new Date(this.profile.attendance.today_check_in).toLocaleTimeString();
                    }
                    if (this.profile.attendance.today_check_out) {
                        this.profile.attendance.today_check_out = new Date(this.profile.attendance.today_check_out).toLocaleTimeString();
                    }
                    

                    const totalDays = this.profile.attendance.total_days || 1;
                    this.profile.attendance.percentage = ((this.profile.attendance.present_days / totalDays) * 100).toFixed(1);
                    
                    if (this.profile.attendance.recent_history) {
                        this.profile.attendance.recent_history = this.profile.attendance.recent_history.map(record => ({
                            ...record,
                            date: new Date(record.date).toLocaleDateString(),
                            check_in: record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-',
                            check_out: record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-',
                            overtime: parseFloat(record.overtime).toFixed(2)
                        }));
                    }
                    this.showSuccess('Profile data loaded successfully');
                } else {
                    console.error('Profile data error:', data.message);
                    this.showError(data.message || 'Failed to load profile data');
                    this.profile = null;
                }
            } catch (error) {
                console.error('Profile data loading error:', error);
                this.showError('Failed to load profile data. Please try again.');
                this.profile = null;
            } finally {
                this.loading = false;
            }
        },
        showProfile() {
            this.showProfileModal = true;
            this.loadProfileData().then(() => {
                if (this.profileModal) {
                    this.profileModal.show();
                }
            }).catch(error => {
                console.error('Error in showProfile:', error);
                this.showError('Failed to load profile data');
            });
        },
        resetDashboardData() {
            this.attendanceStatus = 'Not Marked';
            this.monthlySalary = 0;
            this.baseSalary = 0;
            this.overtimeHours = 0;
            this.currentOvertime = '00:00:00';
            this.isOvertimeActive = false;
            this.overtimeHistory = [];
            this.profile = null;
            if (this.profileModal) {
                this.profileModal.hide();
            }
            if (this.overtimeTimer) { 
                clearInterval(this.overtimeTimer);
                this.overtimeTimer = null; 
            }
        },
        async toggleOvertime() {
            if (!this.isOvertimeActive) {
                this.isOvertimeActive = true
                this.overtimeStartTime = new Date()
                this.startOvertimeTimer()
                await this.startOvertime()
            } else {
                this.isOvertimeActive = false
                this.stopOvertimeTimer()
                await this.stopOvertime()
            }
        },
        startOvertimeTimer() {
            this.overtimeTimer = setInterval(() => {
                const now = new Date()
                const diff = now - this.overtimeStartTime
                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                this.currentOvertime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            }, 1000)
        },
        stopOvertimeTimer() {
            clearInterval(this.overtimeTimer)
            this.currentOvertime = '00:00:00'
        },
        async startOvertime() {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch('/api/overtime/start', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                
                if (response.ok) {
                    this.showSuccess('Overtime started successfully!')
                    this.loadOvertimeHistory()
                } else {
                    const error = await response.json()
                    this.showError(error.message || 'Failed to start overtime')
                }
            } catch (error) {
                console.error('Start overtime error:', error)
                this.showError('Failed to start overtime')
            }
        },
        async stopOvertime() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/overtime/stop', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    this.isOvertimeActive = false;
                    this.stopOvertimeTimer();
                    this.showSuccess('Overtime stopped successfully');
                    
                    if (data.overtimeHours) {
                        this.overtimeHours = data.overtimeHours;
                    }
                    
                    await this.loadOvertimeHistory();
                    await this.loadProfileData();
                } else {
                    this.showError(data.message || 'Error stopping overtime');
                }
            } catch (error) {
                console.error('Stop overtime error:', error);
                this.showError('Error stopping overtime');
            }
        },
        async loadOvertimeHistory() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/overtime/history', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.overtimeHistory = data.history;
                } else {
                    const error = await response.json().catch(() => ({ message: 'Unknown error' })); // Handle invalid JSON
                    this.showError(error.message || 'Failed to load overtime history');
                }
            } catch (error) {
                console.error('Load overtime history error:', error);
                this.showError('Failed to load overtime history');
            }
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString()
        },
        formatTime(timeString) {
            return timeString ? new Date(timeString).toLocaleTimeString() : '-'
        },
        formatDuration(duration) {
            if (!duration) return '-'
            return `${duration} hours`
        },
        showDeleteConfirmation() {
            this.showDeleteConfirm = true;
            this.deleteConfirmModal.show();
        },
        hideDeleteConfirmation() {
            this.showDeleteConfirm = false;
            this.deleteConfirmModal.hide();
        },
        async deleteAccount() {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/employee/delete', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    this.showSuccess('Account deleted successfully');
                    this.hideDeleteConfirmation();
                    this.logout();
                } else {
                    this.showError(data.message || 'Failed to delete account');
                }
            } catch (error) {
                console.error('Delete account error:', error);
                this.showError('Failed to delete account');
            } finally {
                this.loading = false;
            }
        }
    }
})

document.addEventListener('DOMContentLoaded', function() {
    const profileModal = document.getElementById('profileModal')
    if (profileModal) {
        profileModal.addEventListener('hidden.bs.modal', function () {
            app.showProfileModal = false 
        })
    }
})

app.mount('#app')
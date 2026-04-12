const app = Vue.createApp({

    data() {
        return {
            currentView:               'welcome-page',
            user:                      null,
            selectedDoctor:            null,
            selectedPatientAdmin:      null,
            selectedPatientId:         null,
            dashboardMessage:          null,
            selectedAppointment:       null,
            doctorProfile:             null,
            selectedPatientForHistory: null,
        }
    },                                      // ← comma after data() ✅

    async mounted() {
        try {
            const res = await axios.get('/api/me', { withCredentials: true })
            const u   = res.data.user

            if (u) {
                this.user = u

                if (u.role === 'doctor') {
                    this.currentView = 'doctor-dashboard'
                } else if (u.role === 'admin') {
                    this.currentView = 'admin-dashboard'
                } else if (u.role === 'patient') {
                    this.currentView = 'patient-dashboard'
                }
            }
        } catch (e) {
            console.log('No active session')
        }
    },                                      // ← comma after mounted() ✅
                                            // NO comma inside the try-catch ✅

    methods: {
        logout() {
            this.user        = null
            this.currentView = 'welcome-page'
        },
        goHome() {
            if (!this.user) { this.currentView = 'welcome-page'; return }
            const map = {
                admin:   'admin-dashboard',
                doctor:  'doctor-dashboard',
                patient: 'patient-dashboard'
            }
            this.currentView = map[this.user.role] || 'welcome-page'
        }
    }

})

// =============================================================
//  WELCOME PAGE
// =============================================================
app.component('welcome-page', {
    template: `
    <div class="welcome-page">

        <!-- Navbar -->
        <nav class="ss-navbar">
            <img src="/static/images/logo.png" alt="SehatSaathi" class="ss-logo" />
            <div class="d-flex gap-2">
                <button class="btn-brand-outline" @click="$root.currentView = 'login-page'">Login</button>
                <button class="btn-brand-fill"    @click="$root.currentView = 'register-page'">Register</button>
            </div>
        </nav>

        <!-- Hero -->
        <section class="welcome-hero">
            <div class="welcome-hero-text">
                <h1>
                    <span
                        v-for="(word, i) in headlineWords"
                        :key="i"
                        class="animated-word"
                        :style="{ animationDelay: (i * 0.18) + 's' }"
                    >{{ word }}&nbsp;</span>
                </h1>
                <p class="hero-sub" :class="{ 'sub-visible': subVisible }">
                    Book appointments, view your medical history, and consult
                    with top specialists — all from the comfort of your home.
                </p>
                <div class="welcome-hero-btns" :class="{ 'btns-visible': btnsVisible }">
                    <button class="btn-brand-fill" @click="$root.currentView = 'register-page'">
                        <i class="bi bi-person-plus me-1"></i> Get Started
                    </button>
                    <button class="btn-brand-outline" @click="$root.currentView = 'login-page'">
                        <i class="bi bi-box-arrow-in-right me-1"></i> Login
                    </button>
                </div>
            </div>

            <!-- RIGHT SIDE IMAGE — place your image at static/images/hero.png -->
            <div class="welcome-hero-image">
                <img
                    src="/static/images/heroo.png"
                    alt="Healthcare illustration"
                    loading="lazy"
                    onerror="this.onerror=null;this.style.display='none'"
                />
            </div>
        </section>

        <!-- Features strip -->
        <section class="welcome-features">
            <div class="feature-card">
                <div class="fi"><i class="bi bi-calendar2-check"></i></div>
                <h6>Easy Booking</h6>
                <p>Book appointments with specialists in seconds</p>
            </div>
            <div class="feature-card">
                <div class="fi"><i class="bi bi-journal-medical"></i></div>
                <h6>Medical History</h6>
                <p>Access your full diagnosis and prescription records</p>
            </div>
            <div class="feature-card">
                <div class="fi"><i class="bi bi-person-badge"></i></div>
                <h6>Top Doctors</h6>
                <p>Browse verified specialists across all departments</p>
            </div>
            <div class="feature-card">
                <div class="fi"><i class="bi bi-shield-check"></i></div>
                <h6>Secure & Private</h6>
                <p>Your health data is safe and confidential</p>
            </div>
        </section>

        <!-- Sign In / Sign Up cards -->
        <section class="auth-cards-section">
            <div class="auth-choice-card">
                <div class="auth-choice-icon">
                    <i class="bi bi-heart-fill"></i>
                </div>
                <h5>Already part of our family?</h5>
                <p>Welcome back! Sign in to manage your appointments and health records.</p>
                <button class="btn-choice-primary" @click="$root.currentView = 'login-page'">
                    <i class="bi bi-box-arrow-in-right me-2"></i>Sign In
                </button>
            </div>

            <div class="auth-choice-divider">
            <div class="auth-choice-card">
                <div class="auth-choice-icon new">
                    <i class="bi bi-stars"></i>
                </div>
                <h5>New to Sehat Saathi?</h5>
                <p>Let us take care of you. Join thousands of patients who trust us.</p>
                <button class="btn-choice-secondary" @click="$root.currentView = 'register-page'">
                    <i class="bi bi-person-plus me-2"></i>Sign Up Free
                </button>
            </div>
            </div>
        </section>

        <section class="creator-section">
            <p class="creator-label">Built with ❤️</p>

            <div class="creator-buttons">
                <a href="https://github.com/24F2005064" target="_blank" class="btn github">
                    <i class="bi bi-github"></i>
                </a>

                <a href="https://www.linkedin.com/in/krishna-kumari-621902362" target="_blank" class="btn linkedin">
                    <i class="bi bi-linkedin"></i>
                </a>
            </div>
        </section>

        <!-- Footer -->
        <footer class="welcome-footer">
            <strong>Sehat Saathi</strong> &nbsp;·&nbsp;
            Providing care that stays with you.
            &nbsp;·&nbsp; © 2026
        </footer>

    </div>
    `,
    data() {
        return {
            headlineWords : ['Your', 'Health,', 'Our', 'Priority.'],
            subVisible    : false,
            btnsVisible   : false
        }
    },
    mounted() {
        setTimeout(() => { this.subVisible  = true }, 1300)
        setTimeout(() => { this.btnsVisible = true }, 1700)
    }
})

// =============================================================
//  LOGIN PAGE
// =============================================================
app.component('login-page', {
    template: `
    <div class="auth-page">

        <nav class="ss-navbar">
            <img
                src="/static/images/logo.png"
                alt="SehatSaathi"
                class="ss-logo"
                @click="$root.currentView = 'welcome-page'"
            />
            <div class="d-flex gap-2">
                <button class="btn-brand-outline" @click="$root.currentView='register-page'">Register</button>
            </div>
        </nav>

        <div class="auth-bg">
            <div class="auth-card">

                <h3>Welcome Back</h3>

                <div v-if="errorMsg" class="alert alert-danger py-2 mb-3" style="font-size:0.88rem;border-radius:8px;">
                    <i class="bi bi-exclamation-circle me-1"></i>{{ errorMsg }}
                </div>

                <label class="form-label">Email Address</label>
                <input
                    v-model="email"
                    type="email"
                    class="form-control"
                    placeholder="Enter your email"
                    @keyup.enter="login"
                />

                <label class="form-label">Password</label>
                <div class="position-relative">
                    <input
                        v-model="password"
                        :type="showPwd ? 'text' : 'password'"
                        class="form-control"
                        placeholder="Enter your password"
                        @keyup.enter="login"
                        style="padding-right:2.8rem;"
                    />
                    <i
                        :class="showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'"
                        class="position-absolute"
                        style="right:0.9rem;top:50%;transform:translateY(-50%);cursor:pointer;color:#0492C2;"
                        @click="showPwd = !showPwd"
                    ></i>
                </div>

                <button class="btn-submit mt-2" @click="login" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Logging in…' : 'Login' }}
                </button>

                <hr class="auth-divider" />
                <div class="switch-link">
                    New here? <a href="#" @click.prevent="$root.currentView='register-page'">Create an account</a>
                </div>

            </div>
        </div>

    </div>
    `,
    data() {
        return {
            email    : '',
            password : '',
            showPwd  : false,
            loading  : false,
            errorMsg : ''
        }
    },
    methods: {
        async login() {
            this.errorMsg = ''
            if (!this.email || !this.password) {
                this.errorMsg = 'Please enter your email and password.'; return
            }
            this.loading = true
            try {
                const res = await axios.post('/api/login', {
                    email    : this.email,
                    password : this.password
                })
                this.$root.user = res.data
                const map = {
                    admin   : 'admin-dashboard',
                    doctor  : 'doctor-dashboard',
                    patient : 'patient-dashboard'
                }
                this.$root.currentView = map[res.data.role] || 'welcome-page'
            } catch (err) {
                this.errorMsg = err.response?.data?.message || 'Login failed. Please try again.'
            } finally {
                this.loading = false
            }
        }
    }
})


// =============================================================
//  REGISTER PAGE
// =============================================================
app.component('register-page', {
    template: `
    <div class="auth-page">

        <nav class="ss-navbar">
            <img
                src="/static/images/logo.png"
                alt="SehatSaathi"
                class="ss-logo"
                @click="$root.currentView = 'welcome-page'"
            />
            <div class="d-flex gap-2">
                <button class="btn-brand-outline" @click="$root.currentView='login-page'">Login</button>
            </div>
        </nav>

        <div class="auth-bg">
            <div class="auth-card">

                <h3>Create Account</h3>

                <div v-if="errorMsg" class="alert alert-danger py-2 mb-3" style="font-size:0.88rem;border-radius:8px;">
                    <i class="bi bi-exclamation-circle me-1"></i>{{ errorMsg }}
                </div>
                <div v-if="successMsg" class="alert alert-success py-2 mb-3" style="font-size:0.88rem;border-radius:8px;">
                    <i class="bi bi-check-circle me-1"></i>{{ successMsg }}
                </div>

                <label class="form-label">Full Name *</label>
                <input v-model="name" class="form-control" placeholder="Enter your name" />

                <label class="form-label">Email Address *</label>
                <input v-model="email" type="email" class="form-control" placeholder="Enter your email" />

                <label class="form-label">Phone Number</label>
                <input v-model="phone" class="form-control" placeholder="Enter your phone no." maxlength="10" />

                <div class="row g-2">
                    <div class="col-6">
                        <label class="form-label">Gender</label>
                        <select v-model="gender" class="form-control">
                            <option disabled value="">Select</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div class="col-6">
                        <label class="form-label">Age</label>
                        <input
                            v-model="age"
                            type="number"
                            class="form-control"
                            placeholder="Enter your age"
                            min="1"
                            max="120"
                        />
                    </div>
                </div>

                <label class="form-label mt-1">Password *</label>
                <div class="position-relative">
                    <input
                        v-model="password"
                        :type="showPwd ? 'text' : 'password'"
                        class="form-control"
                        placeholder="Min. 6 characters"
                        style="padding-right:2.8rem;"
                    />
                    <i
                        :class="showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'"
                        class="position-absolute"
                        style="right:0.9rem;top:50%;transform:translateY(-50%);cursor:pointer;color:#0492C2;"
                        @click="showPwd = !showPwd"
                    ></i>
                </div>

                <label class="form-label">Confirm Password *</label>
                <input
                    v-model="confirm_password"
                    type="password"
                    class="form-control"
                    placeholder="Repeat your password"
                    @keyup.enter="register"
                />

                <button class="btn-submit mt-1" @click="register" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Registering…' : 'Create Account' }}
                </button>

                <hr class="auth-divider" />
                <div class="switch-link">
                    Already have an account?
                    <a href="#" @click.prevent="$root.currentView='login-page'">Login here</a>
                </div>

            </div>
        </div>

    </div>
    `,
    data() {
        return {
            name             : '',
            email            : '',
            phone            : '',
            gender           : '',
            age              : '',
            password         : '',
            confirm_password : '',
            showPwd          : false,
            loading          : false,
            errorMsg         : '',
            successMsg       : ''
        }
    },
    methods: {
        async register() {
            this.errorMsg   = ''
            this.successMsg = ''
            if (!this.name || !this.email || !this.password) {
                this.errorMsg = 'Name, email and password are required.'; return
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
                this.errorMsg = 'Please enter a valid email address.'; return
            }
            if (this.password.length < 6) {
                this.errorMsg = 'Password must be at least 6 characters.'; return
            }
            if (this.password !== this.confirm_password) {
                this.errorMsg = 'Passwords do not match.'; return
            }
            if (this.age && (this.age < 1 || this.age > 120)) {
                this.errorMsg = 'Please enter a valid age (1–120).'; return
            }
            this.loading = true
            try {
                await axios.post('/api/register', {
                    name     : this.name,
                    email    : this.email,
                    phone    : this.phone,
                    gender   : this.gender,
                    age      : parseInt(this.age) || null,
                    password : this.password
                })
                this.successMsg = 'Account created! Redirecting to login…'
                setTimeout(() => { this.$root.currentView = 'login-page' }, 1500)
            } catch (err) {
                this.errorMsg = err.response?.data?.error || 'Registration failed. Please try again.'
            } finally {
                this.loading = false
            }
        }
    }
})

/* =========================================================
   PATIENT NAVBAR
========================================================= */
app.component('patient-navbar', {
    template: `
    <nav class="patient-navbar-bar">
        <div class="pnav-brand" @click="$root.currentView='patient-dashboard'">
            <img src="/static/images/logo.png" alt="SehatSaathi" class="pnav-logo">
        </div>

        <ul class="pnav-links">
            <li>
                <button class="pnav-link"
                    :class="{ active: $root.currentView === 'patient-dashboard' }"
                    @click="$root.currentView='patient-dashboard'">
                    <i class="bi bi-grid-1x2"></i> Dashboard
                </button>
            </li>
            <li>
                <button class="pnav-link"
                    :class="{ active: $root.currentView === 'history-page' }"
                    @click="$root.currentView='history-page'">
                    <i class="bi bi-journal-medical"></i> History
                </button>
            </li>
            <li>
                <button class="pnav-link"
                    :class="{ active: $root.currentView === 'edit-profile-page' }"
                    @click="$root.currentView='edit-profile-page'">
                    <i class="bi bi-person-circle"></i> Profile
                </button>
            </li>
        </ul>

        <div class="pnav-right">
            <div class="pnav-avatar">{{ initials }}</div>
            <span class="pnav-username">{{ $root.user && $root.user.name }}</span>
            <button class="pnav-logout" @click="logout">
                <i class="bi bi-box-arrow-right"></i> Logout
            </button>
        </div>
    </nav>
    `,
    computed: {
        initials() {
            const name = this.$root.user && this.$root.user.name
            if (!name) return 'P'
            return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        }
    },
    methods: {
        async logout() {
            try { await axios.post('/api/logout') } catch (e) {}
            this.$root.user = null
            this.$root.selectedDepartment = null
            this.$root.selectedDoctor = null
            this.$root.currentView = 'welcome-page'
        }
    }
})

/* =========================================================
   PATIENT DASHBOARD
========================================================= */
/* =========================================================
   PATIENT DASHBOARD
========================================================= */
app.component('patient-dashboard', {
    template: `
    <div class="patient-shell">
        <patient-navbar></patient-navbar>

        <div class="patient-main">

            <!-- ── Hero Row: Banner + Stats ── -->
            <div class="patient-hero-row">

                <!-- Welcome Banner -->
                <div class="patient-banner">
                    <img src="/static/images/banner.png" class="patient-banner-bg" alt="banner">
                    <div class="patient-banner-content">
                        <div class="patient-banner-hello">Welcome back 👋</div>
                        <div class="patient-banner-name">{{ $root.user && $root.user.name }}</div>
                        <div class="patient-banner-sub">
                            Take care of your health — book, track and manage your appointments.
                        </div>
                        <button class="patient-banner-cta" @click="$root.currentView='history-page'">
                            <i class="bi bi-journal-medical"></i> View History
                        </button>
                    </div>
                </div>

                <!-- Stats Panel -->
                <div class="patient-stats-panel">
                    <div class="pt-stat-pill">
                        <div class="pt-stat-icon pt-icon-upcoming">
                            <i class="bi bi-calendar-check"></i>
                        </div>
                        <div style="text-align:right; display:flex; flex-direction:column; justify-content:center; align-items:flex-end; height:100%;">
                            <div class="pt-stat-val">{{ upcomingCount }}</div>
                            <div class="pt-stat-lbl">Upcoming Appointments</div>
                        </div>
                    </div>
                    <div class="pt-stat-pill">
                        <div class="pt-stat-icon pt-icon-completed">
                            <i class="bi bi-check-circle"></i>
                        </div>
                        <div style="text-align:right; display:flex; flex-direction:column; justify-content:center; align-items:flex-end; height:100%;">
                            <div class="pt-stat-val">{{ completedCount }}</div>
                            <div class="pt-stat-lbl">Completed Appointments</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alerts -->
            <transition name="admin-alert">
                <div v-if="message" class="alert alert-success rounded-3 mb-3">
                    <i class="bi bi-check-circle me-2"></i>{{ message }}
                </div>
            </transition>
            <transition name="admin-alert">
                <div v-if="error" class="alert alert-danger rounded-3 mb-3">
                    <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
                </div>
            </transition>

            <!-- ── Search ── -->
            <div class="patient-section-card">
                <div class="pt-section-header">
                    <div class="patient-subtitle">
                        <i class="bi bi-search" style="color:#0d9488"></i>
                        Find a doctor or department
                    </div>
                </div>
                <div class="d-flex gap-2 align-items-center">
                    <div class="pt-search-wrap flex-grow-1 m-0">
                        <i class="bi bi-search pt-search-icon"></i>
                        <input
                            v-model="searchQuery"
                            @input="searchDoctors"
                            class="patient-search-input"
                            placeholder="Search by doctor name, specialization, or department…"
                        >
                    </div>
                    <button class="patient-btn-primary" @click="searchDoctors">Search</button>
                </div>

                <!-- Search Results -->
                <div v-if="searchQuery.trim()" class="mt-3">
                    <div v-if="searchResults.length">
                        <div v-for="doc in searchResults" :key="doc.id"
                             class="pt-search-result-item">
                            <div>
                                <div class="pt-search-name">
                                    <i class="bi bi-person-badge me-1" style="color:#0d9488"></i>
                                    Dr. {{ doc.name }}
                                </div>
                                <div class="pt-search-meta">
                                    {{ doc.specialization }}
                                    <span v-if="doc.department"> · {{ doc.department }}</span>
                                </div>
                            </div>
                            <button class="patient-btn-outline" @click="viewDoctor(doc)">
                                View
                            </button>
                        </div>
                    </div>
                    <div v-else class="patient-empty">
                        <i class="bi bi-search"></i>
                        No doctors found for "{{ searchQuery }}"
                    </div>
                </div>
            </div>

            <!-- ── Departments ── -->
            <div class="patient-section-card">
                <div class="pt-section-header">
                    <div class="patient-subtitle">
                        Departments
                    </div>
                    <span class="pt-badge-count">{{ departments.length }} available</span>
                </div>

                <div v-if="departments.length">
                    <div v-for="d in departments" :key="d.id" class="patient-list-item">
                        <div>
                            <div class="patient-list-title">{{ d.name }}</div>
                            <div class="patient-list-meta">{{ d.description || 'No description available' }}</div>
                        </div>
                        <button class="patient-btn-primary" @click="openDept(d)">View Doctors</button>
                    </div>
                </div>
                <div v-else class="patient-empty">No departments found.</div>
            </div>

            <!-- ── Upcoming Appointments ── -->
            <div class="patient-section-card">
                <div class="patient-subtitle">Upcoming Appointments</div>

                <div class="patient-table-wrap" style="margin-top:1rem;" v-if="upcomingAppointments.length">
                    <table class="patient-table" style="width:100%;">
                        <thead>
                            <tr style="background:#0d9488;">
                                <th style="color:#fff;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;padding:1rem 1.2rem;font-weight:700;">Doctor</th>
                                <th style="color:#fff;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;padding:1rem 1.2rem;font-weight:700;">Department</th>
                                <th style="color:#fff;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;padding:1rem 1.2rem;font-weight:700;">Date</th>
                                <th style="color:#fff;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;padding:1rem 1.2rem;font-weight:700;">Slot</th>
                                <th style="color:#fff;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;padding:1rem 1.2rem;font-weight:700;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="a in upcomingAppointments" :key="a.id"
                                style="border-bottom:1px solid #f1f5f9; transition: background 0.15s;"
                                @mouseenter="$event.currentTarget.style.background='#f0fdf9'"
                                @mouseleave="$event.currentTarget.style.background=''">
                                <td style="padding:1.1rem 1.2rem; white-space:nowrap; font-weight:700; color:#1f2937; font-size:0.95rem;">Dr. {{ a.doctor_name }}</td>
                                <td style="padding:1.1rem 1.2rem; white-space:nowrap; color:#4b5563; font-size:0.92rem;">{{ a.department }}</td>
                                <td style="padding:1.1rem 1.2rem; white-space:nowrap; color:#4b5563; font-size:0.92rem;">{{ fmtDate(a.date) }}</td>
                                <td style="padding:1.1rem 1.2rem; white-space:nowrap; color:#4b5563; font-size:0.92rem;">{{ a.time }}</td>
                                <td style="padding:1.1rem 1.2rem;">
                                    <div class="d-flex gap-2">
                                        <button class="patient-btn-warning" @click="openReschedule(a)">Reschedule</button>
                                        <button class="patient-btn-danger"  @click="cancelAppointment(a.id)">Cancel</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="patient-empty">No upcoming appointments.</div>
            </div>

            <!-- ── Reschedule Panel ── -->
            <div v-if="rescheduleMode" class="patient-section-card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="patient-subtitle mb-0">
                        Reschedule — Dr. {{ selected && selected.doctor_name }}
                    </div>
                    <button class="patient-btn-outline" @click="closeReschedule">Close</button>
                </div>

                <div class="avail-picker-card reschedule-picker" style="margin: 0 auto;">
                    <!-- LEFT: Calendar -->
                    <div class="avail-calendar">
                        <div class="avail-cal-header">
                            <button class="avail-cal-nav" @click="rsPrevMonth"
                                    :disabled="rsCalYear === nowYear && rsCalMonth === nowMonth">‹</button>
                            <span class="avail-cal-month">{{ rsCalMonthLabel }}</span>
                            <button class="avail-cal-nav" @click="rsNextMonth">›</button>
                        </div>
                        <div class="avail-cal-grid">
                            <div v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']"
                                :key="d" class="avail-cal-dow">{{ d }}</div>
                            <button v-for="(cell, i) in rsCalDays" :key="i"
                                    class="avail-cal-day"
                                    :class="{
                                        'avail-cal-day--selected': cell && cell.dateStr === rsSelectedDate,
                                        'avail-cal-day--today':    cell && cell.isToday,
                                        'avail-cal-day--disabled': !cell || cell.isPast
                                    }"
                                    :disabled="!cell || cell.isPast"
                                    @click="cell && !cell.isPast && rsSelectDate(cell)">
                                {{ cell ? cell.day : '' }}
                            </button>
                        </div>
                    </div>

                    <!-- DIVIDER -->
                    <div class="avail-divider"></div>

                    <!-- RIGHT: Slots -->
                    <div class="avail-slots-panel">
                        <div class="avail-slots-date">
                            {{ rsSelectedDate ? rsFormatDate(rsSelectedDate) : 'Select a date' }}
                        </div>

                        <div class="avail-slots-list" v-if="rsSelectedDate && rsAllSlots.length">
                            <button v-for="slot in rsAllSlots" :key="slot"
                                    class="avail-slot-btn"
                                    :class="rsSlotBtnClass(slot)"
                                    :disabled="!rsIsAvailable(slot)"
                                    @click="rsIsAvailable(slot) && rsSelectSlot(slot)">
                                <span v-if="rsSelectedSlot === slot">✓ </span>
                                {{ slot }}
                                <span v-if="rsSelectedSlot === slot"
                                    style="font-size:0.78em;margin-left:6px;opacity:0.9;">Selected</span>
                            </button>

                            <button v-if="rsSelectedSlot"
                                    class="avail-slot-btn"
                                    style="background:linear-gradient(135deg,#5bbf9c,#48a985);
                                        border-color:#48a985;color:#fff;margin-top:0.5rem;"
                                    @click="confirmReschedule">
                                Confirm Reschedule
                            </button>
                        </div>

                        <div v-else class="avail-slots-date"
                            style="color:#94a3b8;margin-top:2rem;font-size:0.9rem;">
                            ← Select a date to view slots
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            departments:    [],
            appointments:   [],
            searchQuery:    '',
            searchResults:  [],
            selected:       null,
            message:        '',
            error:          '',
            
            // Reschedule State
            rescheduleMode: false,
            rsSlotData:    [],
            rsAvailable:   [],
            rsSelectedDate: null,
            rsSelectedSlot: null,
            rsCalYear:  new Date().getFullYear(),
            rsCalMonth: new Date().getMonth(),
            nowYear:    new Date().getFullYear(),
            nowMonth:   new Date().getMonth(),
        }
    },
    computed: {
        upcomingAppointments() {
            return this.appointments.filter(a => a.status === 'Booked')
        },
        upcomingCount() {
            return this.appointments.filter(a => a.status === 'Booked').length
        },
        completedCount() {
            return this.appointments.filter(a => a.status === 'Completed').length
        },
        doctorsVisited() {
            return [...new Set(this.appointments.map(a => a.doctor_name))].length
        },
        rsCalMonthLabel() {
            return new Date(this.rsCalYear, this.rsCalMonth, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
        },
        rsCalDays() {
            const y = this.rsCalYear, m = this.rsCalMonth
            const today    = new Date().toLocaleString("en-CA").slice(0, 10) // localized robust slice
            const firstDay = new Date(y, m, 1).getDay()
            const daysInMo = new Date(y, m + 1, 0).getDate()
            const cells    = []
            for (let i = 0; i < firstDay; i++) cells.push(null)
            for (let d = 1; d <= daysInMo; d++) {
                const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                cells.push({ day: d, dateStr, isToday: dateStr === today, isPast: dateStr < today })
            }
            return cells
        },
        rsAllSlots() {
            const predefined = ["8:00 - 10:00 a.m.", "10:00 - 12:00 p.m.", "2:00 - 4:00 p.m.", "4:00 - 6:00 p.m.", "6:00 - 8:00 p.m."];
            const dbSlots = this.rsSlotData.map(a => a.slot);
            const unique = [...new Set([...predefined, ...dbSlots])];
            return unique.sort((a, b) => this.parseSlotTime(a) - this.parseSlotTime(b))
        }
    },
    async mounted() {
        if (!this.$root.user) { this.$root.currentView = 'login-page'; return }
        // Run independently so one failure doesn't block another
        this.fetchDepartments()
        this.fetchAppointments()
    },
    methods: {
        clearAlerts() {
            this.message = ''; this.error = '';
            clearTimeout(this._msgTimer);
            clearTimeout(this._errTimer);
        },
        showSuccess(msg) {
            this.message = msg; this.error = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._msgTimer);
            this._msgTimer = setTimeout(() => { this.message = '' }, 2000);
        },
        showError(msg) {
            this.error = msg; this.message = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._errTimer);
            this._errTimer = setTimeout(() => { this.error = '' }, 2000);
        },

        dayOf(dateStr) { return dateStr ? new Date(dateStr + 'T00:00:00').getDate() : '—' },
        monOf(dateStr) { return dateStr ? new Date(dateStr + 'T00:00:00').toLocaleString('en-IN', { month: 'short' }) : '' },

        async fetchDepartments() {
            try {
                const res = await axios.get('/api/departments')
                this.departments = res.data
            } catch (e) {
                this.showError(e.response?.data?.error || 'Failed to load departments')
            }
        },
        async fetchAppointments() {
            try {
                const res = await axios.get(`/api/appointments/patient/${this.$root.user.user_id}`)
                this.appointments = res.data
            } catch (e) {
                this.showError(e.response?.data?.error || 'Failed to load appointments')
            }
        },
        async searchDoctors() {
            this.clearAlerts()
            const q = this.searchQuery.trim()
            if (!q) { this.searchResults = []; return }
            try {
                const res = await axios.get(`/api/search/doctors?q=${encodeURIComponent(q)}`)
                this.searchResults = res.data
            } catch (e) {
                this.error = e.response?.data?.error || 'Search failed'
            }
        },
        openDept(d) {
            this.$root.selectedDepartment = d
            this.$root.currentView = 'department-page'
        },
        viewDoctor(doc) {
            this.$root.selectedDoctor = doc
            this.$root.currentView = 'doctor-page'
        },

        /* ========================================================
           RESCHEDULE LOGIC (Updated to work with the Modal Picker)
           ======================================================== */
        async openReschedule(a) {
            this.clearAlerts()
            this.selected = a
            this.rescheduleMode = true
            
            // Reset Date and Slot states
            this.rsSelectedDate = null
            this.rsSelectedSlot = null
            
            // Sync calendar to current month
            const now = new Date()
            this.rsCalYear = now.getFullYear()
            this.rsCalMonth = now.getMonth()

            try {
                const res = await axios.get(`/api/doctor/availability/${a.doctor_id}`)
                
                // Normalizes slots (Handles hyphens, en-dashes, AND no-spaces robustly)
                const norm = s => s.replace(/\s*[-–—]\s*/g, ' - ').replace(/\s+/g, ' ').trim()
                
                this.rsSlotData  = res.data.map(x => ({ ...x, slot: norm(x.slot) }))
                this.rsAvailable = res.data.map(x => ({ date: x.date, slot: norm(x.slot) }))
                
            } catch (e) {
                this.error = 'Failed to load available slots'
            }
        },
        closeReschedule() {
            this.selected = null
            this.rescheduleMode = false
            this.rsSelectedDate = null
            this.rsSelectedSlot = null
            this.rsSlotData = []
            this.rsAvailable = []
        },
        rsSelectDate(cell) {
            if (cell.isPast) return
            this.rsSelectedDate = cell.dateStr
            this.rsSelectedSlot = null
        },
        rsIsAvailable(slot) {
            return this.rsAvailable.some(a => a.date === this.rsSelectedDate && a.slot === slot)
        },
        rsSelectSlot(slot) {
            if (!this.rsIsAvailable(slot)) return
            this.rsSelectedSlot = this.rsSelectedSlot === slot ? null : slot
        },
        rsSlotBtnClass(slot) {
            if (this.rsSelectedSlot === slot) return 'avail-slot-btn--saved'
            if (this.rsIsAvailable(slot))     return 'avail-slot-btn--selected'
            return ''
        },
        rsPrevMonth() {
            if (this.rsCalMonth === 0) { this.rsCalMonth = 11; this.rsCalYear-- } else this.rsCalMonth--
        },
        rsNextMonth() {
            if (this.rsCalMonth === 11) { this.rsCalMonth = 0; this.rsCalYear++ } else this.rsCalMonth++
        },
        rsFormatDate(dateStr) {
            return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })
        },
        parseSlotTime(slot) {
            if (!slot) return 0;
            const s = slot.toUpperCase();
            const hourPart = s.split(':')[0];
            let h = parseInt(hourPart, 10);
            if (h >= 1 && h <= 7) h += 12; // 1-7 PM maps to 13-19
            let m = 0;
            const match = s.match(/:(\d+)/);
            if (match) m = parseInt(match[1], 10);
            return h * 60 + m;
        },
        async confirmReschedule() {
            this.clearAlerts()
            if (!this.rsSelectedDate || !this.rsSelectedSlot) {
                this.showError('Please select a date and slot')
                return
            }
            try {
                await axios.put(
                    `/api/appointment/reschedule/${this.selected.id}`,
                    { user_id: this.$root.user.user_id, date: this.rsSelectedDate, slot: this.rsSelectedSlot }
                )
                this.showSuccess('Appointment rescheduled successfully')
                this.closeReschedule()
                await this.fetchAppointments()
            } catch (e) {
                this.showError(e.response?.data?.error || 'Failed to reschedule')
            }
        },
        async cancelAppointment(id) {
            if (!confirm('Cancel this appointment?')) return
            this.clearAlerts()
            try {
                await axios.delete(`/api/appointment/${id}`, {
                    data: { user_id: this.$root.user.user_id }
                })
                this.showSuccess('Appointment cancelled successfully')
                await this.fetchAppointments()
            } catch (e) {
                this.showError(e.response?.data?.error || 'Failed to cancel')
            }
        },
        fmtDate(d) {
            if (!d) return '—'
            return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            })
        }
    }
});

/* =========================================================
   DEPARTMENT PAGE
========================================================= */
app.component('department-page', {
    template: `
    <div class="patient-shell">
        <patient-navbar></patient-navbar>

        <div class="patient-main">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h3 class="patient-page-title mb-0">
                    {{ $root.selectedDepartment ? $root.selectedDepartment.name : 'Department' }}
                </h3>
                <button class="patient-btn-outline" @click="$root.currentView='patient-dashboard'">Back</button>
            </div>

            <div class="patient-section-card">
                <div class="patient-subtitle">Doctors</div>

                <div v-if="doctors.length">
                    <div v-for="doc in doctors" :key="doc.id" class="patient-list-item">
                        <div>
                            <div class="patient-list-title">Dr. {{ doc.name }}</div>
                            <div class="patient-list-meta">{{ doc.specialization }}</div>
                        </div>

                        <div class="d-flex gap-2 flex-wrap">
                            <button class="patient-btn-primary" @click="availability(doc)">Availability</button>
                            <button class="patient-btn-outline" @click="info(doc)">Info</button>
                        </div>
                    </div>
                </div>

                <div v-else class="patient-empty">No doctors found in this department.</div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            doctors: []
        }
    },
    async mounted() {
        if (!this.$root.user) {
            this.$root.currentView = 'login-page'
            return
        }

        if (!this.$root.selectedDepartment) {
            this.$root.currentView = 'patient-dashboard'
            return
        }

        try {
            const res = await axios.get(`/api/doctors?department_id=${this.$root.selectedDepartment.id}`)
            this.doctors = res.data
        } catch (error) {
            this.doctors = []
        }
    },
    methods: {
        availability(doc) {
            this.$root.selectedDoctor = doc
            this.$root.currentView = 'availability-page'
        },
        info(doc) {
            this.$root.selectedDoctor = doc
            this.$root.currentView = 'doctor-page'
        }
    }
})


/* =========================================================
   DOCTOR PAGE (Details)
========================================================= */
app.component('doctor-page', {
    template: `
    <div class="patient-shell">
        <patient-navbar></patient-navbar>
        <div class="patient-main" style="display:flex; flex-direction:column; align-items:center; padding: 40px 20px;">
            
            <div style="width: 100%; max-width: 950px; margin: 0 auto;">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h3 class="patient-page-title mb-0">Doctor Details</h3>
                    <button class="patient-btn-outline" @click="$root.currentView='department-page'">
                        <i class="bi bi-arrow-left me-1"></i> Back
                    </button>
                </div>
                <div class="patient-section-card shadow-lg" style="border:none; border-radius:24px; overflow:hidden; padding:0;">
                    <div class="row g-0">
                        <!-- Left Side: Photo & Accent Background -->
                        <div class="col-md-5 p-5 text-center d-flex flex-column align-items-center justify-content-center" style="background: linear-gradient(135deg, rgba(13,148,136,0.04), rgba(79,209,197,0.12)); border-right: 1px solid #f8fafc;">
                            
                            <div class="position-relative mb-4 mt-2">
                                <div class="position-absolute w-100 h-100 rounded-circle" style="background:#0d9488; opacity:0.1; transform: scale(1.15);"></div>
                                <img 
                                    :src="doctor.photo || '/static/images/default-doctor.png'" 
                                    alt="Doctor Photo" 
                                    class="img-fluid rounded-circle shadow-sm position-relative" 
                                    style="width: 170px; height: 170px; object-fit: cover; border: 4px solid #ffffff;"
                                >
                            </div>
                            
                            <h4 class="mb-1 mt-3" style="font-weight:800; color:#1e293b;">Dr. {{ doctor.name || 'Loading...' }}</h4>
                            <div class="badge bg-light text-teal px-4 py-2 mt-2 rounded-pill shadow-sm" style="font-size:0.85rem; font-weight:700; color:#0d9488; border:1px solid rgba(13,148,136,0.2);">
                                {{ doctor.department || '-' }}
                            </div>
                            
                            <div class="mt-5 mb-2 w-100">
                                <button class="patient-btn-primary w-100 py-3 shadow-sm" style="border-radius:12px; font-weight:700; font-size:1.05rem;" @click="go">
                                    <i class="bi bi-calendar-check me-2"></i> View Availability
                                </button>
                            </div>
                        </div>
                        <!-- Right Side: Info Tiles container -->
                        <div class="col-md-7 p-5">
                            <h5 class="mb-4" style="color:#475569; font-weight:700;">Professional Overview</h5>
                            
                            <div class="row g-3">
                                <!-- Tile -->
                                <div class="col-sm-6">
                                    <div class="p-3 rounded-4" style="background:#f8fafc; border:1px solid #f1f5f9; height:100%;">
                                        <div class="text-muted mb-1" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:700;">Specialization</div>
                                        <div style="font-weight:600; color:#0f172a; font-size:0.95rem;">{{ doctor.specialization || '-' }}</div>
                                    </div>
                                </div>
                                
                                <!-- Tile -->
                                <div class="col-sm-6">
                                    <div class="p-3 rounded-4" style="background:#f8fafc; border:1px solid #f1f5f9; height:100%;">
                                        <div class="text-muted mb-1" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:700;">Qualification</div>
                                        <div style="font-weight:600; color:#0f172a; font-size:0.95rem;">{{ doctor.qualification || '-' }}</div>
                                    </div>
                                </div>
                                <!-- Tile -->
                                <div class="col-sm-6">
                                    <div class="p-3 rounded-4" style="background:#f8fafc; border:1px solid #f1f5f9; height:100%;">
                                        <div class="text-muted mb-1" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:700;">Experience</div>
                                        <div style="font-weight:600; color:#0f172a; font-size:0.95rem;">{{ doctor.experience || '-' }}</div>
                                    </div>
                                </div>
                                <!-- Specialty Tile for Fee -->
                                <div class="col-sm-6">
                                    <div class="p-3 rounded-4 shadow-sm" style="background:#f0fdf4; border:1px solid #dcfce7; height:100%;">
                                        <div class="text-muted mb-1" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:700; color:#166534!important;">Consultation Fee</div>
                                        <div style="font-weight:800; color:#15803d; font-size:1.15rem;">₹{{ doctor.fee || 0 }}</div>
                                    </div>
                                </div>
                                <div class="col-12 mt-4 pt-2">
                                    <h5 class="mb-3" style="color:#475569; font-weight:700;">Contact Options</h5>
                                </div>
                                <!-- Tile -->
                                <div class="col-sm-6">
                                    <div class="p-3 rounded-4 d-flex align-items-center" style="background:#f8fafc; border:1px solid #f1f5f9;">
                                        <i class="bi bi-telephone-fill p-2 rounded-circle me-3 d-flex align-items-center justify-content-center" style="background:rgba(13,148,136,0.1); color:#0d9488; font-size:1.1rem; width:40px; height:40px;"></i>
                                        <span style="font-weight:600; color:#0f172a; font-size:0.95rem;">{{ doctor.phone || '-' }}</span>
                                    </div>
                                </div>
                                <!-- Tile -->
                                <div class="col-sm-6">
                                    <div class="p-3 rounded-4 d-flex align-items-center" style="background:#f8fafc; border:1px solid #f1f5f9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" :title="doctor.email">
                                        <i class="bi bi-envelope-fill p-2 rounded-circle me-3 d-flex align-items-center justify-content-center" style="background:rgba(13,148,136,0.1); color:#0d9488; font-size:1.1rem; width:40px; height:40px;"></i>
                                        <span style="font-weight:600; color:#0f172a; font-size:0.95rem; overflow:hidden; text-overflow:ellipsis;">{{ doctor.email || '-' }}</span>
                                    </div>
                                </div>
                                <!-- Long Tile for Bio -->
                                <div v-if="doctor.bio" class="col-12 mt-4">
                                    <div class="p-4 rounded-4" style="background:#f8fafc; border:1px solid #f1f5f9; border-left: 4px solid #0d9488;">
                                        <div class="text-muted mb-2" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:700;">Biography</div>
                                        <p class="mb-0" style="color:#334155; line-height:1.6; font-size:0.95rem;">{{ doctor.bio }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            doctor: {}
        }
    },
    async mounted() {
        if (!this.$root.user) {
            this.$root.currentView = 'login-page'
            return
        }
        if (!this.$root.selectedDoctor) {
            this.$root.currentView = 'patient-dashboard'
            return
        }
        try {
            const res = await axios.get(`/api/doctor/${this.$root.selectedDoctor.id}`)
            this.doctor = res.data
        } catch (error) {
            this.doctor = {}
        }
    },
    methods: {
        go() {
            this.$root.selectedDoctor = this.doctor
            this.$root.currentView = 'availability-page'
        }
    }
})

/* =========================================================
   AVAILABILITY PAGE
========================================================= */
app.component('availability-page', {
    template: `
    <div class="appt-page">
        <patient-navbar></patient-navbar>

        <!-- Hero Card -->
        <div class="patient-main" style="padding-bottom:0;">
            <div class="appt-hero">
                <div class="appt-hero-left">
                    <h1 class="appt-hero-title">
                        <span v-for="(word, i) in ['Appointment', 'Booking']"
                              :key="i" class="animated-word"
                              :style="{ animationDelay: (i * 0.22) + 's' }">
                            {{ word }}&nbsp;
                        </span>
                    </h1>
                    <p class="appt-hero-sub" :class="{ 'sub-visible': subVisible }">
                        Schedule your appointment at your convenience.<br>
                        We're ready when you are.
                    </p>
                </div>
                <div class="appt-hero-right">
                    <img src="/static/images/appt.png" alt="Appointment">
                </div>
            </div>
        </div>

        <!-- Booking Content -->
        <div class="patient-main">

            <!-- Doctor info + Back -->
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h5 class="mb-0 fw-bold" style="color:#0f766e">
                        Dr. {{ $root.selectedDoctor && $root.selectedDoctor.name }}
                    </h5>
                    <small style="color:#6b7280">
                        {{ $root.selectedDoctor && $root.selectedDoctor.specialization }}
                        — Pick one or more slots, then confirm
                    </small>
                </div>
                <button class="patient-btn-outline" @click="$root.currentView='doctor-page'">← Back</button>
            </div>

            <transition name="admin-alert">
                <div v-if="message" class="alert alert-success rounded-3">{{ message }}</div>
            </transition>
            <transition name="admin-alert">
                <div v-if="error"   class="alert alert-danger rounded-3">{{ error }}</div>
            </transition>

            <!-- Picker Card -->
            <div class="avail-picker-card">

                <!-- LEFT: Calendar -->
                <div class="avail-calendar">
                    <div class="avail-cal-header">
                        <button class="avail-cal-nav" @click="prevMonth"
                                :disabled="calYear === nowYear && calMonth === nowMonth">‹</button>
                        <span class="avail-cal-month">{{ calMonthLabel }}</span>
                        <button class="avail-cal-nav" @click="nextMonth">›</button>
                    </div>

                    <div class="avail-cal-grid">
                        <div v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']"
                             :key="d" class="avail-cal-dow">{{ d }}</div>

                        <button v-for="(cell, i) in calDays" :key="i"
                                class="avail-cal-day"
                                :class="{
                                    'avail-cal-day--selected': cell && cell.dateStr === selectedDate,
                                    'avail-cal-day--today':    cell && cell.isToday,
                                    'avail-cal-day--disabled': !cell || cell.isPast
                                }"
                                :disabled="!cell || cell.isPast"
                                @click="cell && !cell.isPast && selectDate(cell)">
                            {{ cell ? cell.day : '' }}
                        </button>
                    </div>
                </div>

                <!-- DIVIDER -->
                <div class="avail-divider"></div>

                <!-- RIGHT: Slots Panel -->
                <div class="avail-slots-panel">
                    <div class="avail-slots-date">
                        {{ selectedDate ? formatDateLabel(selectedDate) : 'Select a date' }}
                    </div>

                    <div class="avail-slots-list" v-if="selectedDate && allSlots.length">
                        <button v-for="slot in allSlots" :key="slot"
                                class="avail-slot-btn"
                                :class="slotBtnClass(slot)"
                                :disabled="!isAvailable(slot)"
                                @click="isAvailable(slot) && toggleSlot(slot)">
                            <span v-if="isChosen(slot)">✓ </span>
                            {{ slot }}
                            <span v-if="isChosen(slot)"
                                  style="font-size:0.78em;margin-left:6px;opacity:0.9;">Selected</span>
                        </button>
                    </div>

                    <div v-else-if="!selectedDate" class="avail-slots-date"
                         style="color:#94a3b8;margin-top:2rem;font-size:0.9rem;">
                        ← Select a date from the calendar
                    </div>

                    <div v-else class="avail-slots-date"
                         style="color:#94a3b8;margin-top:2rem;font-size:0.9rem;">
                        No slots available for this date
                    </div>
                </div>
            </div>

            <!-- ── Selected Slots Summary + Confirm ── -->
            <div v-if="selectedSlots.length" class="patient-section-card mt-3">
                <div class="patient-subtitle mb-3">
                    Selected Slots ({{ selectedSlots.length }})
                </div>

                <div class="d-flex flex-wrap gap-2 mb-3">
                    <div v-for="(s, i) in selectedSlots" :key="i"
                         style="display:flex;align-items:center;gap:0.5rem;
                                background:linear-gradient(135deg,#2563eb,#1d4ed8);
                                color:#fff;border-radius:20px;padding:0.3rem 0.85rem;
                                font-size:0.82rem;font-weight:600;">
                        {{ s.date }} · {{ s.slot }}
                        <span @click="removeSlot(i)"
                              style="cursor:pointer;opacity:0.8;font-size:1rem;line-height:1;">✕</span>
                    </div>
                </div>

                <label class="fw-semibold mb-1" style="color:#0f766e;font-size:0.88rem;">
                    Describe your symptoms (optional)
                </label>
                <textarea v-model="symptoms"
                          class="form-control patient-form-control mb-3"
                          rows="2"
                          placeholder="e.g. headache, fever since 2 days..."></textarea>

                <div class="d-flex gap-2 align-items-center flex-wrap">
                    <button class="avail-slot-btn"
                            style="background:linear-gradient(135deg,#5bbf9c,#48a985);
                                   border-color:#48a985;color:#fff;width:auto;
                                   padding:12px 28px;font-size:0.92rem;"
                            @click="book">
                        Confirm {{ selectedSlots.length }} Booking{{ selectedSlots.length > 1 ? 's' : '' }}
                    </button>
                    <button class="patient-btn-outline" @click="selectedSlots = []">
                        Clear All
                    </button>
                </div>
            </div>

        </div>
    </div>
    `,

    data() {
        const now = new Date()
        return {
            allSlotData:   [],   // full API response (available + booked)
            allAvailable:  [],   // only truly bookable slots
            selectedDate:  null,
            selectedSlots: [],   // [{date, slot}] — multi-select
            symptoms:      '',
            subVisible:    false,
            message:       '',
            error:         '',
            calYear:  now.getFullYear(),
            calMonth: now.getMonth(),
            nowYear:  now.getFullYear(),
            nowMonth: now.getMonth()
        }
    },

    computed: {
        availableDates() {
            return [...new Set(this.allAvailable.map(a => a.date))]
        },
        allSlots() {
            // All unique slots across ALL dates, combined with predefined slots (so missing slots show as unavailable)
            const predefined = ["8:00 - 10:00 a.m.", "10:00 - 12:00 p.m.", "2:00 - 4:00 p.m.", "4:00 - 6:00 p.m.", "6:00 - 8:00 p.m."];
            const dbSlots = this.allSlotData.map(a => a.slot);
            const unique = [...new Set([...predefined, ...dbSlots])];
            return unique.sort((a, b) => this.parseSlotTime(a) - this.parseSlotTime(b))
        },
        calMonthLabel() {
            return new Date(this.calYear, this.calMonth, 1)
                .toLocaleString('en-IN', { month: 'long', year: 'numeric' })
        },
        calDays() {
            const y        = this.calYear
            const m        = this.calMonth
            const today    = new Date().toISOString().slice(0, 10)
            const firstDay = new Date(y, m, 1).getDay()
            const daysInMo = new Date(y, m + 1, 0).getDate()
            const cells    = []
            for (let i = 0; i < firstDay; i++) cells.push(null)
            for (let d = 1; d <= daysInMo; d++) {
                const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                cells.push({
                    day:      d,
                    dateStr,
                    isToday:  dateStr === today,
                    hasSlots: this.availableDates.includes(dateStr),
                    isPast:   dateStr < today
                })
            }
            return cells
        }
    },

    async mounted() {
        if (!this.$root.user)           { this.$root.currentView = 'login-page';        return }
        if (!this.$root.selectedDoctor) { this.$root.currentView = 'patient-dashboard'; return }
        setTimeout(() => { this.subVisible = true }, 900)
        await this.fetchAvailability()
    },

    methods: {
        async fetchAvailability() {
            this.error = ''
            try {
                const res = await axios.get(
                    `/api/doctor/availability/${this.$root.selectedDoctor.id}`
                )
                const normalize = s => s
                                    .replace(/\s*[–—\u2013\u2014]\s*/g, ' - ')
                                    .replace(/\s+/g, ' ')
                                    .trim()
                                this.allSlotData = res.data.map(a => ({ ...a, slot: 
                normalize(a.slot) }))
                                this.allAvailable = res.data
                                    .filter(a => !a.is_booked)
                                    .map(a => ({ date: a.date, slot: normalize(a.slot) }))
            } catch (e) {
                this.showError(e.response?.data?.error || 'Failed to load availability')
            }
        },

        showSuccess(msg) {
            this.message = msg; this.error = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._msgTimer);
            this._msgTimer = setTimeout(() => { this.message = '' }, 3000);
        },
        showError(msg) {
            this.error = msg; this.message = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._errTimer);
            this._errTimer = setTimeout(() => { this.error = '' }, 3500);
        },

        selectDate(cell) {
            if (cell.isPast) return
            this.selectedDate = cell.dateStr
        },

        isAvailable(slot) {
            return this.allAvailable.some(
                a => a.date === this.selectedDate && a.slot === slot
            )
        },

        isChosen(slot) {
            return this.selectedSlots.some(
                s => s.date === this.selectedDate && s.slot === slot
            )
        },

        toggleSlot(slot) {
            if (!this.isAvailable(slot)) return
            const idx = this.selectedSlots.findIndex(
                s => s.date === this.selectedDate && s.slot === slot
            )
            if (idx >= 0) {
                this.selectedSlots.splice(idx, 1)
            } else {
                this.selectedSlots.push({ date: this.selectedDate, slot })
            }
        },

        removeSlot(i) {
            this.selectedSlots.splice(i, 1)
        },

        slotBtnClass(slot) {
            if (this.isChosen(slot))    return 'avail-slot-btn--saved'
            if (this.isAvailable(slot)) return 'avail-slot-btn--selected'
            return ''
        },

        parseSlotTime(slot) {
            if (!slot) return 0;
            const s = slot.toUpperCase();
            const hourPart = s.split(':')[0];
            let h = parseInt(hourPart, 10);
            if (h >= 1 && h <= 7) h += 12; // 1-7 PM maps to 13-19
            let m = 0;
            const match = s.match(/:(\d+)/);
            if (match) m = parseInt(match[1], 10);
            return h * 60 + m;
        },

        prevMonth() {
            if (this.calMonth === 0) { this.calMonth = 11; this.calYear-- }
            else this.calMonth--
        },
        nextMonth() {
            if (this.calMonth === 11) { this.calMonth = 0; this.calYear++ }
            else this.calMonth++
        },

        formatDateLabel(dateStr) {
            return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })
        },

        async book() {
            this.message = ''
            this.error   = ''
            if (!this.selectedSlots.length) { this.error = 'Please select at least one slot'; return }
            try {
                await axios.post('/api/book', {
                    doctor_id:  this.$root.selectedDoctor.id,
                    patient_id: this.$root.user.user_id,
                    slots:      this.selectedSlots.map(s => `${s.date}||${s.slot}`),
                    symptoms:   this.symptoms.trim()
                })
                this.showSuccess(`${this.selectedSlots.length} appointment${this.selectedSlots.length > 1 ? 's' : ''} booked successfully!`)
                setTimeout(() => { this.$root.currentView = 'patient-dashboard' }, 1200)
            } catch (e) {
                this.showError(e.response?.data?.error || 'Booking failed')
            }
        }
    }
})


/* =========================================================
   HISTORY PAGE
========================================================= */
app.component('history-page', {
    template: `
    <div class="patient-shell">
        <patient-navbar></patient-navbar>

        <div class="patient-main">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h3 class="patient-page-title mb-0">Appointment History</h3>
                <div class="d-flex gap-2">
                    <button class="patient-btn-primary"
                            @click="exportCSV"
                            :disabled="exporting || !history.length">
                        <span v-if="exporting">
                            <span class="spinner-border spinner-border-sm me-1"></span>Exporting…
                        </span>
                        <span v-else> Export CSV</span>
                    </button>
                    <button class="patient-btn-outline" @click="$root.currentView='patient-dashboard'">Back</button>
                </div>
            </div>

            <div class="patient-section-card">
                <div class="patient-subtitle">Completed Appointments</div>

                <div v-if="history.length">
                    <div v-for="h in history" :key="h.id" class="patient-history-card">
                        <div class="mb-2"><strong>Date:</strong> {{ h.date }} | <strong>Time:</strong> {{ h.time }}</div>
                        <div class="mb-1"><strong>Doctor:</strong> Dr. {{ h.doctor_name }}</div>
                        <div class="mb-1"><strong>Department:</strong> {{ h.department || '-' }}</div>
                        <div class="mb-1"><strong>Diagnosis:</strong> {{ h.diagnosis || '-' }}</div>
                        <div class="mb-1"><strong>Prescription:</strong> {{ h.prescription || '-' }}</div>
                        <div class="mb-1"><strong>Medicines:</strong> {{ h.medicines || '-' }}</div>
                        <div><strong>Notes:</strong> {{ h.notes || '-' }}</div>
                        <div class="mt-3 text-end">
                            <button class="patient-btn-primary btn-sm" @click="$root.currentView='payment-page'">Pay for Treatment</button>
                        </div>
                    </div>
                </div>

                <div v-else class="patient-empty">No completed appointments found.</div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            history: [],
            exporting: false
        }
    },
    async mounted() {
        if (!this.$root.user) {
            this.$root.currentView = 'login-page'
            return
        }

        try {
            const res = await axios.get(`/api/patient/history/${this.$root.user.user_id}`)
            this.history = res.data
        } catch (error) {
            this.history = []
        }
    },
    methods: {
        async exportCSV() {
            this.exporting = true
            try {
                const res = await axios.post('/api/patient/export', {
                    user_id: this.$root.user.user_id
                })

                const taskId = res.data.task_id

                // Poll for task completion
                const poll = setInterval(async () => {
                    try {
                        const status = await axios.get(`/api/task-status/${taskId}`)

                        if (status.data.status === 'done') {
                            clearInterval(poll)
                            this.exporting = false

                            // Trigger download
                            const link = document.createElement('a')
                            link.href = `/static/exports/${status.data.filename}`
                            link.download = status.data.filename
                            link.click()
                        } else if (status.data.status === 'failed') {
                            clearInterval(poll)
                            this.exporting = false
                            alert('Export failed: ' + (status.data.error || 'Unknown error'))
                        }
                    } catch (e) {
                        clearInterval(poll)
                        this.exporting = false
                        alert('Failed to check export status')
                    }
                }, 1500)

            } catch (e) {
                this.exporting = false
                alert(e.response?.data?.error || 'Failed to start export')
            }
        }
    }
})


/* =========================================================
   EDIT PROFILE PAGE
========================================================= */
app.component('edit-profile-page', {
    template: `
    <div class="patient-shell">
        <patient-navbar></patient-navbar>

        <div class="patient-main" style="display:flex; flex-direction:column; align-items:center; padding: 40px 20px;">

            <div class="patient-edit-wrapper">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h3 class="patient-page-title mb-0">Edit Profile</h3>
                    <button class="patient-btn-outline" @click="$root.currentView='patient-dashboard'">
                        <i class="bi bi-arrow-left me-1"></i> Back
                    </button>
                </div>

                <div v-if="message" class="alert alert-success rounded-3 mb-4 shadow-sm border-0" style="background:#f0fdf4; color:#166534;">
                    <i class="bi bi-check-circle-fill me-2"></i>{{ message }}
                </div>
                <div v-if="error" class="alert alert-danger rounded-3 mb-4 shadow-sm border-0" style="background:#fef2f2; color:#991b1b;">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
                </div>

                <div class="patient-section-card patient-edit-card shadow-lg" style="border:none; border-radius:24px; padding: 40px;">
                    
                    <!-- Avatar Top -->
                    <div class="patient-edit-avatar-wrapper text-center mb-5">
                        <div class="patient-edit-avatar mx-auto shadow-sm">
                            {{ initials }}
                        </div>
                        <h4 class="patient-edit-username mt-3 mb-1">{{ form.name || 'Your Name' }}</h4>
                        <div class="patient-edit-email text-muted">{{ form.email || 'Email Address' }}</div>
                    </div>

                    <div class="row g-4">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold text-muted mb-2" style="font-size:0.9rem;">Full Name</label>
                            <input v-model="form.name" class="form-control patient-form-control" style="border-radius:12px; padding:12px 18px; background:#f8fafc;" placeholder="Enter your name">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-semibold text-muted mb-2" style="font-size:0.9rem;">Email Address</label>
                            <input v-model="form.email" class="form-control patient-form-control" style="border-radius:12px; padding:12px 18px; background:#f8fafc;" placeholder="Enter your email">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-semibold text-muted mb-2" style="font-size:0.9rem;">Phone Number</label>
                            <input v-model="form.phone" class="form-control patient-form-control" style="border-radius:12px; padding:12px 18px; background:#f8fafc;" placeholder="Enter your phone">
                        </div>

                        <div class="col-md-3">
                            <label class="form-label fw-semibold text-muted mb-2" style="font-size:0.9rem;">Gender</label>
                            <select v-model="form.gender" class="form-control patient-form-control" style="border-radius:12px; padding:12px 18px; background:#f8fafc;">
                                <option value="">Select</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div class="col-md-3">
                            <label class="form-label fw-semibold text-muted mb-2" style="font-size:0.9rem;">Age</label>
                            <input v-model="form.age" type="number" class="form-control patient-form-control" style="border-radius:12px; padding:12px 18px; background:#f8fafc;" placeholder="Age">
                        </div>
                    </div>

                    <div class="mt-5 text-center">
                        <button class="patient-btn-primary px-5 py-3 shadow-sm" style="border-radius:12px; font-weight:700; font-size:1.05rem;" @click="save">
                            <i class="bi bi-person-check-fill me-2"></i> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            form: {
                name: '', email: '', phone: '', gender: '', age: ''
            },
            message: '',
            error: ''
        }
    },
    computed: {
        initials() {
            if (!this.form.name) return 'U';
            const parts = this.form.name.trim().split(' ');
            if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
            return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        }
    },
    async mounted() {
        if (!this.$root.user) {
            this.$root.currentView = 'login-page'
            return
        }
        try {
            const res = await axios.get(`/api/patient/${this.$root.user.user_id}`)
            this.form = res.data
        } catch (error) {
            this.error = error.response?.data?.error || 'Failed to load profile'
        }
    },
    methods: {
        async save() {
            this.message = ''
            this.error = ''
            try {
                await axios.put(`/api/patient/${this.$root.user.user_id}`, this.form)
                this.message = 'Profile updated successfully'
                this.$root.user.name = this.form.name;
            } catch (error) {
                this.error = error.response?.data?.error || 'Failed to update profile'
            }
        }
    }
})

/* =========================================================
   DOCTOR SIDEBAR  (doctor-navbar component)
   ========================================================= */
app.component('doctor-navbar', {
    template: `
    <aside class="doc-sidebar">

        <!-- Logo -->
        <div class="doc-sidebar-logo">
            <img src="/static/images/logo.png" alt="SehatSaathi">
        </div>

        <div class="doc-sidebar-divider"></div>

        <!-- Doctor profile block -->
        <div class="doc-sidebar-profile">
            <div class="doc-sidebar-avatar">
                <img v-if="profile.photo"
                    :src="profile.photo.startsWith('/static/') || profile.photo.startsWith('http') ? profile.photo : ('/static/uploads/' + profile.photo)"
                    alt="Doctor photo"
                    @error="useDefaultPhoto">
                <img v-else
                    src="/static/images/default-doctor.png"
                    alt="Default doctor photo">
            </div>
            <div class="doc-sidebar-welcome">Welcome</div>
            <div class="doc-sidebar-name">
                Dr. {{ $root.user && $root.user.name }}
            </div>
            <div class="doc-sidebar-meta"
                 v-if="profile.department || profile.specialization">
                <span v-if="profile.department">{{ profile.department }}</span>
                <span v-if="profile.department && profile.specialization"> · </span>
                <span v-if="profile.specialization">{{ profile.specialization }}</span>
            </div>
        </div>

        <div class="doc-sidebar-divider"></div>

        <!-- Nav links -->
        <nav class="doc-sidebar-nav">

            <button class="doc-sidebar-item"
                    :class="{ active: $root.currentView === 'doctor-dashboard' }"
                    @click="$root.currentView = 'doctor-dashboard'">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Dashboard
            </button>

            <button class="doc-sidebar-item"
                    :class="{ active: $root.currentView === 'doctor-edit-profile' }"
                    @click="$root.currentView = 'doctor-edit-profile'">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                Edit Profile
            </button>

            <button class="doc-sidebar-item"
                    :class="{ active: $root.currentView === 'doctor-availability' }"
                    @click="$root.currentView = 'doctor-availability'">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01"/>
                </svg>
                Mark Availability
            </button>

        </nav>

        <div class="doc-sidebar-spacer"></div>

        <!-- Logout pinned to bottom -->
        <div class="doc-sidebar-footer">
            <button class="doc-sidebar-logout" @click="logout">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
            </button>
        </div>

    </aside>
    `,

    computed: {
        profile() {
            return this.$root.doctorProfile || {}
        },
        initials() {
            const name = this.$root.user && this.$root.user.name
            if (!name) return 'D'
            return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        }
    },

    methods: {
        useDefaultPhoto() {
            // broken photo URL → fall back to default-doctor.png via v-else
            if (this.$root.doctorProfile) this.$root.doctorProfile.photo = null
        },

        async logout() {
            try { await axios.post('/api/logout') } catch (e) {}
            this.$root.user               = null
            this.$root.selectedAppointment = null
            this.$root.selectedPatientId   = null
            this.$root.dashboardMessage    = null
            this.$root.doctorProfile       = null
            this.$root.currentView         = 'welcome-page'
        }
    }
})


/* =========================================================
   DOCTOR DASHBOARD
   ========================================================= */
app.component('doctor-dashboard', {
    template: `
    <div class="doc-layout">

        <!-- ── Sidebar ─────────────────────────────── -->
        <doctor-navbar></doctor-navbar>

        <!-- ── Main content ─────────────────────────── -->
        <div class="doctor-main">

            <!-- Page header -->
            <div class="doctor-page-header mb-4">
                <div>
                    <h2 class="doctor-page-title">Dashboard</h2>
                    <div class="doctor-page-subtitle">
                        {{ todayLabel }}
                    </div>
                </div>
            </div>

            <!-- Dashboard message (passed from treatment-page) -->
            <transition name="doctor-alert-fade">
                <div v-if="pageMsg"
                     class="doctor-alert doctor-alert-success mb-4">
                    ✓ {{ pageMsg }}
                </div>
            </transition>

            <!-- Loading -->
            <div v-if="loading"
                 class="d-flex justify-content-center align-items-center py-5">
                <div class="doctor-spinner"></div>
            </div>

            <template v-else>

                <!-- ── Stat cards ─────────────────── -->
                <div class="row g-3 mb-4">

                    <div class="col-md-6">
                        <div class="doctor-stat-card doctor-stat-today">
                            <div class="doctor-stat-inner">
                                <div class="doctor-stat-text-group">
                                    <div class="doctor-stat-label">Today's Appointments</div>
                                    <div class="doctor-stat-help">Booked for today</div>
                                </div>
                                <div class="doctor-stat-value">
                                    {{ summary.today_booked ?? 0 }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="doctor-stat-card doctor-stat-week">
                            <div class="doctor-stat-inner">
                                <div class="doctor-stat-text-group">
                                    <div class="doctor-stat-label">Week's Total Appointments</div>
                                    <div class="doctor-stat-help">Booked for next 7 days</div>
                                </div>
                                <div class="doctor-stat-value">
                                    {{ summary.week_booked ?? 0 }}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- ── Appointments section ───────── -->
                <div class="doctor-section-card">

                    <!-- Section header — no filter dropdown -->
                    <div class="doctor-subtitle mb-3">Upcoming Appointments</div>

                    <!-- Table -->
                    <div class="doctor-table-wrap">
                        <table class="doctor-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Patient</th>
                                    <th>Date</th>
                                    <th>Slot</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="bookedAppointments.length === 0">
                                    <td colspan="6">
                                        <div class="doctor-empty-compact">
                                            <svg width="32" height="32" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor"
                                                stroke-width="1.4"
                                                style="opacity:0.35">
                                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                            </svg>
                                            <span>No upcoming appointments</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-for="(apt, i) in bookedAppointments"
                                    :key="apt.appointment_id"
                                    :class="{ 'doctor-row-today': isToday(apt.date) }">

                                    <td class="text-muted" style="font-size:0.83rem">
                                        {{ i + 1 }}
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="doctor-patient-avatar">
                                                {{ aptInitials(apt.patient_name) }}
                                            </div>
                                            <span style="font-weight:700">
                                                {{ apt.patient_name }}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{{ formatDate(apt.date) }}</td>
                                    <td>{{ apt.slot }}</td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <button class="doctor-btn-success doctor-action-sm"
                                                    @click="openTreatment(apt)">
                                                Complete
                                            </button>
                                            <button class="doctor-btn-danger doctor-action-sm"
                                                    @click="cancelAppointment(apt)">
                                                Cancel
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
                <!-- /appointments section -->
                <!-- ── Patient List section ───────── -->
                <div class="doctor-section-card">

                    <div class="doctor-subtitle mb-3">My Patients</div>

                    <div class="doctor-table-wrap">
                        <table class="doctor-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Patient ID</th>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Age</th>
                                    <th>Symptoms</th>
                                    <th>History</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="patientList.length === 0">
                                    <td colspan="7">
                                        <div class="doctor-empty-compact">
                                            <svg width="32" height="32" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor"
                                                stroke-width="1.4" style="opacity:0.35">
                                                <path d="M20 21v-2a4 4 0 00-4-4H8
                                                        a4 4 0 00-4 4v2"/>
                                                <circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            <span>No patients yet</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-for="(p, i) in patientList" :key="p.patient_id">
                                    <td class="text-muted" style="font-size:0.83rem">
                                        {{ i + 1 }}
                                    </td>
                                    <td class="text-muted" style="font-size:0.83rem">
                                        #{{ p.patient_id }}
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="doctor-patient-avatar">
                                                {{ aptInitials(p.name) }}
                                            </div>
                                            <span style="font-weight:700">{{ p.name }}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="doc-gender-badge"
                                            :class="p.gender === 'Male'
                                                    ? 'doc-gender-male'
                                                    : 'doc-gender-female'">
                                            {{ p.gender || '—' }}
                                        </span>
                                    </td>
                                    <td>{{ p.age ?? '—' }}</td>
                                    <td>
                                        <div class="doctor-symptoms-cell" :title="p.symptoms">
                                            {{ p.symptoms || '—' }}
                                        </div>
                                    </td>
                                    <td>
                                        <button class="doctor-btn-outline doctor-action-sm"
                                                @click="openPatientHistory(p)">
                                            <svg width="13" height="13" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor"
                                                stroke-width="2">
                                                <path d="M12 20h9"/>
                                                <path d="M16.5 3.5a2.121 2.121 0
                                                        013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                            </svg>
                                            Treatment History
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
                <!-- /patient list section -->

            </template>
            <!-- /template v-else -->

        </div>
        <!-- /doctor-main -->

    </div>
    <!-- /doc-layout -->
    `,

    data() {
        return {
            loading:      true,
            summary:      { today_booked: 0, week_booked: 0 },
            appointments: [],
            patientList: [],
            pageMsg:      '',
            _msgTimer:    null
        }
    },

    computed: {
        todayLabel() {
            return new Date().toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric',
                month: 'long', year: 'numeric'
            })
        },
        bookedAppointments() {
            // Only show Booked — completed/cancelled disappear automatically
            return this.appointments.filter(a => a.status === 'Booked')
        }
    },

    async mounted() {
        if (!this.$root.user) { this.$root.currentView = 'login-page'; return }

        if (this.$root.dashboardMessage) {
            this.pageMsg = this.$root.dashboardMessage
            this.$root.dashboardMessage = null
            this._msgTimer = setTimeout(() => { this.pageMsg = '' }, 3500)
        }

        await this.fetchDashboard()
    },

    beforeUnmount() {
        clearTimeout(this._msgTimer)
    },

    methods: {
        async fetchDashboard() {
            this.loading = true
            try {
                const res = await axios.get(
                    `/api/doctor/dashboard/${this.$root.user.user_id}`
                )
                const d = res.data

                this.summary      = d.summary || { today_booked: 0, week_booked: 0 }
                this.appointments = d.appointments || []
                this.patientList = d.patients || []

                if (d.doctor) {
                    this.$root.doctorProfile = d.doctor
                }

            } catch (e) {
                console.error('Dashboard fetch error:', e)
            } finally {
                this.loading = false
            }
        },

        openTreatment(apt) {
            this.$root.selectedAppointment = apt
            this.$root.currentView = 'treatment-page'
        },
        openPatientHistory(patient) {
            this.$root.selectedPatientForHistory = patient
            this.$root.currentView = 'doctor-patient-history'
        },

        async cancelAppointment(apt) {
            const confirmed = confirm(
                `Cancel appointment for ${apt.patient_name}` +
                ` on ${this.formatDate(apt.date)} at ${apt.slot}?`
            )
            if (!confirmed) return

            try {
                await axios.post(
                    `/api/appointment/${apt.appointment_id}/cancel-by-doctor`,
                    { user_id: this.$root.user.user_id }
                )
                apt.status = 'Cancelled'
            } catch (e) {
                alert(e.response?.data?.error || 'Failed to cancel appointment')
            }
        },


        formatDate(dateStr) {
            if (!dateStr) return '—'
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day:   '2-digit',
                month: 'short',
                year:  'numeric'
            })
        },
        isToday(dateStr) {
            if (!dateStr) return false
            return dateStr === new Date().toISOString().split('T')[0]
        },


        aptInitials(name) {
            if (!name) return '?'
            return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        },

        statusClass(status) {
            return {
                'status-booked':    status === 'Booked',
                'status-completed': status === 'Completed',
                'status-cancelled': status === 'Cancelled'
            }
        }
    }
})

/* =========================================================
   DOCTOR EDIT PROFILE
   ========================================================= */
app.component('doctor-edit-profile', {
    template: `
    <div class="doc-layout">
        <doctor-navbar></doctor-navbar>

        <div class="doctor-main">

            <!-- Header -->
            <div class="doctor-page-header mb-4">
                <div>
                    <h2 class="doctor-page-title">Edit Profile</h2>
                </div>
                <button class="doctor-btn-outline"
                        @click="$root.currentView = 'doctor-dashboard'">
                     Back
                </button>
            </div>

            <!-- Alerts -->
            <transition name="doctor-alert-fade">
                <div v-if="successMsg" class="doctor-alert doctor-alert-success mb-3">
                    {{ successMsg }}
                </div>
            </transition>
            <transition name="doctor-alert-fade">
                <div v-if="errorMsg" class="doctor-alert doctor-alert-danger mb-3">
                    {{ errorMsg }}
                </div>
            </transition>

            <!-- Photo + name preview card -->
            <div class="doctor-section-card mb-3">
                <div class="d-flex align-items-center gap-4 flex-wrap">

                <div class="doc-sidebar-avatar"
                    style="width:80px;height:80px;flex-shrink:0;
                            background:var(--doctor-gradient);
                            border:3px solid var(--doctor-border);">
                    <img :src="photoPreview || '/static/images/default-doctor.png'"
                        alt="Profile photo"
                        style="width:100%;height:100%;object-fit:cover"
                        @error="onAvatarError">
                </div>

                    <div>
                        <div style="font-size:1.05rem;font-weight:800;
                                    color:var(--doctor-text)">
                            Dr. {{ form.name || ($root.user && $root.user.name) }}
                        </div>

                        <!-- File picker -->
                        <label style="display:inline-flex;align-items:center;
                                      gap:0.4rem;margin-top:0.7rem;cursor:pointer;
                                      background:var(--doctor-primary-light);
                                      color:var(--doctor-primary);
                                      border:1.5px solid rgba(10,110,163,0.2);
                                      border-radius:9px;padding:0.4rem 0.85rem;
                                      font-size:0.86rem;font-weight:700;">
                            <svg width="14" height="14" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            Change Photo
                            <input type="file" accept="image/*"
                                   style="display:none"
                                   @change="onPhotoChange">
                        </label>
                    </div>

                </div>
            </div>

            <!-- Form fields -->
            <div class="doctor-section-card">
                <div class="doctor-subtitle">Profile Details</div>

                <div class="row g-3">

                    <div class="col-md-6">
                        <label class="doctor-form-label">Full Name</label>
                        <input v-model="form.name"
                               class="form-control doctor-form-control"
                               placeholder="Your full name">
                    </div>

                    <div class="col-md-6">
                        <label class="doctor-form-label">Phone</label>
                        <input v-model="form.phone"
                               class="form-control doctor-form-control"
                               placeholder="10-digit phone number"
                               maxlength="10">
                    </div>

                    <div class="col-md-6">
                        <label class="doctor-form-label">Specialization</label>
                        <input v-model="form.specialization"
                               class="form-control doctor-form-control"
                               placeholder="e.g. Cardiologist">
                    </div>

                    <div class="col-md-6">
                        <label class="doctor-form-label">Experience (years)</label>
                        <input v-model="form.experience"
                               type="number" min="0" max="60"
                               class="form-control doctor-form-control"
                               placeholder="Years of experience">
                    </div>

                    
                    <div class="col-md-6">
                        <label class="doctor-form-label">Qualification</label>
                        <input v-model="form.qualification"
                            class="form-control doctor-form-control"
                            placeholder="e.g. MBBS, MD, MS">
                    </div>

                    <div class="col-12">
                        <label class="doctor-form-label">Bio / About</label>
                        <textarea v-model="form.bio"
                                  class="form-control doctor-form-control"
                                  rows="3"
                                  placeholder="A short bio about yourself...">
                        </textarea>
                    </div>

                </div>

                <!-- Actions -->
                <div class="d-flex gap-2 mt-4">
                    <button class="doctor-btn-primary"
                            @click="save" :disabled="saving">
                        {{ saving ? 'Saving...' : 'Save Changes' }}
                    </button>
                    <button class="doctor-btn-outline"
                            :disabled="saving"
                            @click="$root.currentView = 'doctor-dashboard'">
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    </div>
    `,

    data() {
        return {
            form: {
                name: '', phone: '', specialization: '', experience: '', qualification: '', bio: ''
            },
            photoFile:    null,
            photoPreview: null,
            successMsg:   '',
            errorMsg:     '',
            saving:       false,
            _sTimer:      null,
            _eTimer:      null
        }
    },

    computed: {
        initials() {
            const name = this.form.name || (this.$root.user && this.$root.user.name)
            if (!name) return 'D'
            return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        }
    },

    mounted() {
        if (!this.$root.user) { this.$root.currentView = 'login-page'; return }

        const u = this.$root.user
        const p = this.$root.doctorProfile || {}

        this.form = {
            name:           u.name           || '',
            phone:          u.phone          || '',
            specialization: p.specialization || '',
            experience:     p.experience     || '',
            qualification:  p.qualification  || '',
            bio:            p.bio            || ''
        }

        if (p.photo) {
            this.photoPreview = (p.photo.startsWith('/static/') || p.photo.startsWith('http')) 
                                ? p.photo 
                                : ('/static/uploads/' + p.photo)
        } else {
            this.photoPreview = '/static/images/default-doctor.png'
        }
    },

    beforeUnmount() {
        clearTimeout(this._sTimer)
        clearTimeout(this._eTimer)
    },

    methods: {
        onPhotoChange(e) {
            const file = e.target.files[0]
            if (!file) return
            this.photoFile    = file
            const reader      = new FileReader()
            reader.onload     = ev => { this.photoPreview = ev.target.result }
            reader.readAsDataURL(file)
        },
        onAvatarError(e) {
            // If even default-doc.png fails, fall back to a plain bg
            e.target.style.display = 'none'
        },  

        showSuccess(msg) {
            this.message = msg; this.error = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._msgTimer);
            this._msgTimer = setTimeout(() => { this.message = '' }, 2000);
        },        

        showError(msg) {
            this.error = msg; this.message = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._errTimer);
            this._errTimer = setTimeout(() => { this.error = '' }, 2000);
        },  

        async save() {
            if (!this.form.name.trim())
                return this.showError('Name cannot be empty')

            this.saving = true
            try {
                const fd = new FormData()
                fd.append('name',           this.form.name.trim())
                fd.append('phone',          this.form.phone.trim())
                fd.append('specialization', this.form.specialization.trim())
                fd.append('experience',     this.form.experience)
                fd.append('bio',            this.form.bio.trim())
                fd.append('qualification',  this.form.qualification.trim())
                if (this.photoFile) fd.append('photo', this.photoFile)

                const res = await axios.put(
                    `/api/doctor/profile/${this.$root.user.user_id}`,
                    fd,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        withCredentials: true
                    }
                )

                // ── Sync $root so sidebar + next page open shows updated data ──
                Object.assign(this.$root.user, {
                    name:  this.form.name.trim(),
                    phone: this.form.phone.trim()
                })

                if (!this.$root.doctorProfile) this.$root.doctorProfile = {}
                Object.assign(this.$root.doctorProfile, {
                    specialization: this.form.specialization.trim(),
                    experience:     this.form.experience,
                    bio:            this.form.bio.trim()
                })

                if (res.data.photo_url) {
                    this.$root.doctorProfile.photo = res.data.photo_url
                    this.photoPreview              = res.data.photo_url
                }
                // ──────────────────────────────────────────────────────────────

                this.showSuccess('Profile updated successfully!')
                setTimeout(() => { this.$root.currentView = 'doctor-dashboard' }, 1400)

            } catch (e) {
                this.showError(
                    e.response?.data?.error || 'Failed to update. Try again.'
                )
            } finally {
                this.saving = false
            }
        }
    }
})


/* =========================================================
   TREATMENT PAGE
========================================================= */
app.component('treatment-page', {
    template: `
    <div class="doc-layout">
        <doctor-navbar></doctor-navbar>

        <div class="doctor-main">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <div>
                    <h2 class="doctor-page-title">Treatment Details</h2>
                    <div class="doctor-page-subtitle">
                        Fill treatment info and save — appointment will be marked as completed
                    </div>
                </div>
                <button class="doctor-btn-outline" @click="$root.currentView='doctor-dashboard'">
                    ← Back
                </button>
            </div>

            <transition name="doctor-alert-fade">
                <div v-if="errorMsg" class="doctor-alert doctor-alert-danger mb-3">{{ errorMsg }}</div>
            </transition>

            <!-- Appointment info strip -->
            <div class="doctor-appt-info-strip mb-4" v-if="appt">
                <div class="doctor-info-chip">
                    <span class="doctor-info-chip-label">Patient</span>
                    <span class="doctor-info-chip-val">{{ appt.patient_name }}</span>
                </div>
                <div class="doctor-info-chip">
                    <span class="doctor-info-chip-label">Date</span>
                    <span class="doctor-info-chip-val">{{ formatDate(appt.date) }}</span>
                </div>
                <div class="doctor-info-chip">
                    <span class="doctor-info-chip-label">Slot</span>
                    <span class="doctor-info-chip-val">{{ appt.slot }}</span>
                </div>
                <div class="doctor-info-chip" v-if="appt.symptoms">
                    <span class="doctor-info-chip-label">Symptoms</span>
                    <span class="doctor-info-chip-val">{{ appt.symptoms }}</span>
                </div>
            </div>

            <!-- Treatment form card -->
            <div class="doctor-section-card doctor-treatment-card">
                <div class="doctor-subtitle">Treatment Record</div>

                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="doctor-form-label">
                            Diagnosis <span class="text-danger">*</span>
                        </label>
                        <textarea v-model="form.diagnosis"
                                  class="form-control doctor-form-control"
                                  rows="3"
                                  placeholder="Enter diagnosis"></textarea>
                    </div>

                    <div class="col-md-6">
                        <label class="doctor-form-label">Prescription</label>
                        <textarea v-model="form.prescription"
                                  class="form-control doctor-form-control"
                                  rows="3"
                                  placeholder="Enter prescription"></textarea>
                    </div>

                    <div class="col-md-6">
                        <label class="doctor-form-label">Medicines</label>
                        <textarea v-model="form.medicines"
                                  class="form-control doctor-form-control"
                                  rows="3"
                                  placeholder="e.g. Paracetamol 500mg twice daily"></textarea>
                    </div>

                    <div class="col-md-6">
                        <label class="doctor-form-label">Notes</label>
                        <textarea v-model="form.notes"
                                  class="form-control doctor-form-control"
                                  rows="3"
                                  placeholder="Any additional notes"></textarea>
                    </div>

                    <div class="col-md-4">
                        <label class="doctor-form-label">Visit Type</label>
                        <select v-model="form.visit_type" class="form-control doctor-form-control">
                            <option value="">Select type</option>
                            <option>Regular</option>
                            <option>Follow-up</option>
                            <option>Emergency</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="doctor-form-label">Tests Done</label>
                        <input v-model="form.test_done"
                               class="form-control doctor-form-control"
                               placeholder="Blood test / X-ray / ECG">
                    </div>

                    <div class="col-md-4">
                        <label class="doctor-form-label">Next Visit</label>
                        <input type="date"
                               v-model="form.next_visit"
                               class="form-control doctor-form-control">
                    </div>
                </div>

                <div class="mt-4 d-flex gap-2">
                    <button class="doctor-btn-primary" @click="save" :disabled="saving">
                        <span v-if="saving">Saving...</span>
                        <span v-else>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:5px;vertical-align:-2px"><path d="M20 6L9 17l-5-5"/></svg>
                            Save &amp; Mark Complete
                        </span>
                    </button>
                    <button class="doctor-btn-outline" @click="$root.currentView='doctor-dashboard'">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            appt: null,
            form: {
                diagnosis:    '',
                prescription: '',
                notes:        '',
                visit_type:   '',
                test_done:    '',
                medicines:    '',
                next_visit:   ''
            },
            errorMsg: '',
            saving:   false
        }
    },

    async mounted() {
        if (!this.$root.user)               { this.$root.currentView = 'login-page';        return }
        if (!this.$root.selectedAppointment){ this.$root.currentView = 'doctor-dashboard'; return }

        this.appt = { ...this.$root.selectedAppointment }
        await this.fetchTreatment()
    },

    methods: {
        formatDate(dateStr) {
            if (!dateStr) return '—'
            const [y, m, d] = dateStr.split('-')
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            return `${d} ${months[parseInt(m)-1]} ${y}`
        },

        async fetchTreatment() {
            try {
                const aid = this.appt.appointment_id || this.appt.id
                const res = await axios.get(
                    `/api/treatment/${aid}?user_id=${this.$root.user.user_id}`
                )

                const d = res.data
                this.form = {
                    diagnosis:    d.diagnosis    || '',
                    prescription: d.prescription || '',
                    notes:        d.notes        || '',
                    visit_type:   d.visit_type   || '',
                    test_done:    d.test_done    || '',
                    medicines:    d.medicines    || '',
                    next_visit:   d.next_visit   || ''
                }
            } catch (e) {
                // No existing treatment yet — form starts empty, that's fine
            }
        },

        async save() {
            if (!this.form.diagnosis.trim()) {
                this.errorMsg = 'Diagnosis is required before saving.'
                setTimeout(() => { this.errorMsg = '' }, 3000)
                return
            }

            this.saving   = true
            this.errorMsg = ''

            try {
                const aid = this.appt.appointment_id || this.appt.id
                await axios.post(`/api/treatment/${aid}`, {
                    user_id:      this.$root.user.user_id,
                    diagnosis:    this.form.diagnosis,
                    prescription: this.form.prescription,
                    notes:        this.form.notes,
                    visit_type:   this.form.visit_type,
                    test_done:    this.form.test_done,
                    medicines:    this.form.medicines,
                    next_visit:   this.form.next_visit
                })

                // Pass success alert back to dashboard
                this.$root.dashboardMessage = `Appointment with ${this.appt.patient_name} on ${this.formatDate(this.appt.date)} has been marked as completed.`
                this.$root.currentView      = 'doctor-dashboard'

            } catch (e) {
                this.errorMsg = e.response?.data?.error || 'Failed to save treatment'
            } finally {
                this.saving = false
            }
        }
    }
})



/* =========================================================
   DOCTOR — PATIENT TREATMENT HISTORY
   ========================================================= */
app.component('doctor-patient-history', {
    template: `
    <div class="doc-layout">
        <doctor-navbar></doctor-navbar>

        <div class="doctor-main">

            <!-- Header -->
            <div class="doctor-page-header mb-4">
                <div>
                    <h2 class="doctor-page-title">Treatment History</h2>
                    <div class="doctor-page-subtitle" v-if="patient">
                        Complete history for {{ patient.name }}
                    </div>
                </div>
                <button class="doctor-btn-outline"
                        @click="$root.currentView = 'doctor-dashboard'">
                    ← Back
                </button>
            </div>

            <!-- Patient info card -->
            <div class="doctor-section-card mb-3" v-if="patient">
                <div class="d-flex align-items-center gap-4 flex-wrap">
                    <div class="doctor-patient-avatar"
                         style="width:56px;height:56px;font-size:1.2rem;
                                flex-shrink:0">
                        {{ initials }}
                    </div>
                    <div class="d-flex gap-4 flex-wrap">
                        <div class="dph-info-item">
                            <div class="dph-info-label">Name</div>
                            <div class="dph-info-value">{{ patient.name }}</div>
                        </div>
                        <div class="dph-info-item">
                            <div class="dph-info-label">Patient ID</div>
                            <div class="dph-info-value">#{{ patient.patient_id }}</div>
                        </div>
                        <div class="dph-info-item">
                            <div class="dph-info-label">Gender</div>
                            <div class="dph-info-value">{{ patient.gender || '—' }}</div>
                        </div>
                        <div class="dph-info-item">
                            <div class="dph-info-label">Age</div>
                            <div class="dph-info-value">{{ patient.age ?? '—' }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="loading"
                 class="d-flex justify-content-center py-5">
                <div class="doctor-spinner"></div>
            </div>

            <template v-else>

                <!-- History table -->
                <div class="doctor-section-card">
                    <div class="doctor-subtitle mb-3">
                        All Appointments &amp; Treatments
                        <span class="dph-count">{{ history.length }}</span>
                    </div>

                    <div class="doctor-table-wrap">
                        <table class="doctor-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Doctor</th>
                                    <th>Slot</th>
                                    <th>Symptoms</th>
                                    <th>Diagnosis</th>
                                    <th>Prescription</th>
                                    <th>Medicines</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="history.length === 0">
                                    <td colspan="10">
                                        <div class="doctor-empty-compact">
                                            <svg width="30" height="30"
                                                 viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor"
                                                 stroke-width="1.4"
                                                 style="opacity:0.35">
                                                <path d="M14 2H6a2 2 0 00-2
                                                         2v16a2 2 0 002 2h12
                                                         a2 2 0 002-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                            </svg>
                                            <span>No treatment history found</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-for="(h, i) in history" :key="h.appointment_id">
                                    <td class="text-muted"
                                        style="font-size:0.83rem">
                                        {{ i + 1 }}
                                    </td>
                                    <td>{{ formatDate(h.date) }}</td>
                                    <td>
                                        <span style="font-weight:700">
                                            Dr. {{ h.doctor_name }}
                                        </span>
                                        <div style="font-size:0.79rem;
                                                    color:var(--doctor-muted)">
                                            {{ h.specialization || '' }}
                                        </div>
                                    </td>
                                    <td>{{ h.slot }}</td>
                                    <td>
                                        <div class="doctor-symptoms-cell"
                                             :title="h.symptoms">
                                            {{ h.symptoms || '—' }}
                                        </div>
                                    </td>
                                    <td>
                                        <div class="doctor-symptoms-cell"
                                             :title="h.diagnosis">
                                            {{ h.diagnosis || '—' }}
                                        </div>
                                    </td>
                                    <td>
                                        <div class="doctor-symptoms-cell"
                                             :title="h.prescription">
                                            {{ h.prescription || '—' }}
                                        </div>
                                    </td>
                                    <td>
                                        <div class="doctor-symptoms-cell"
                                            :title="h.medicines">
                                            {{ h.medicines || '—' }}
                                        </div>
                                    </td>
                                    <td>
                                        <span class="doctor-status"
                                              :class="statusClass(h.status)">
                                            {{ h.status }}
                                        </span>
                                    </td>
                                    <td>
                                        <button v-if="h.status === 'Completed'"
                                                class="doctor-btn-outline doctor-action-sm"
                                                @click="editTreatment(h)">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </template>

        </div>
    </div>
    `,

    data() {
        return {
            history: [],
            loading: true
        }
    },

    computed: {
        patient() {
            return this.$root.selectedPatientForHistory || null
        },
        initials() {
            const name = this.patient?.name || ''
            return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
        }
    },

    async mounted() {
        if (!this.patient) {
            this.$root.currentView = 'doctor-dashboard'
            return
        }
        await this.fetchHistory()
    },

    methods: {
        async fetchHistory() {
            this.loading = true
            try {
                const res = await axios.get(
                    `/api/patient/history/${this.patient.patient_id}`
                )
                this.history = res.data || []
            } catch (e) {
                console.error('Failed to load history:', e)
                this.history = []
            } finally {
                this.loading = false
            }
        },

        formatDate(d) {
            if (!d) return '—'
            return new Date(d).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            })
        },

        statusClass(status) {
            return {
                'status-booked':    status === 'Booked',
                'status-completed': status === 'Completed',
                'status-cancelled': status === 'Cancelled'
            }
        },

        editTreatment(h) {
            this.$root.selectedAppointment = { ...h, patient_name: this.patient.name }
            this.$root.currentView = 'treatment-page'
        }
    }
})

app.component('doctor-availability', {
    template: `
    <div class="doc-layout doc-layout-availability">
        <doctor-navbar></doctor-navbar>
        <div class="doctor-main">
            <div class="doctor-page-header mb-4">
                <div>
                    <h2 class="doctor-page-title">Mark Availability</h2>
                    <div class="doctor-page-subtitle">
                        Select a date then choose your available slots
                    </div>
                </div>
                <button class="doctor-btn-outline"
                        @click="$root.currentView = 'doctor-dashboard'">
                    ← Back
                </button>
            </div>

            <transition name="doctor-alert-fade">
                <div v-if="successMsg"
                     class="doctor-alert doctor-alert-success mb-3">
                    ✓ {{ successMsg }}
                </div>
            </transition>

            <transition name="doctor-alert-fade">
                <div v-if="errorMsg"
                     class="doctor-alert doctor-alert-danger mb-3">
                    ✗ {{ errorMsg }}
                </div>
            </transition>

            <div class="avail-picker-wrapper">
                <div class="avail-picker-card">
                    <div class="avail-calendar">
                        <div class="avail-cal-header">
                            <button class="avail-cal-nav" @click="prevMonth"
                                    :disabled="!canGoPrev">&#8249;</button>
                            <span class="avail-cal-month">{{ monthLabel }}</span>
                            <button class="avail-cal-nav" @click="nextMonth">&#8250;</button>
                        </div>

                        <div class="avail-cal-grid">
                            <div class="avail-cal-dow"
                                 v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']"
                                 :key="d">{{ d }}</div>

                            <div v-for="n in leadBlanks" :key="'b'+n"></div>

                            <button
                                v-for="day in daysInMonth"
                                :key="day"
                                class="avail-cal-day"
                                :class="{
                                    'avail-cal-day--today': isToday(day),
                                    'avail-cal-day--selected': isSelected(day),
                                    'avail-cal-day--past': isPast(day),
                                    'avail-cal-day--disabled': isPast(day)
                                }"
                                :disabled="isPast(day)"
                                @click="selectDate(day)">
                                {{ day }}
                            </button>
                        </div>
                    </div>

                    <div class="avail-divider"></div>

                    <div class="avail-slots-panel">
                        <div v-if="!selectedDate" class="avail-no-date">
                            <svg width="36" height="36" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor"
                                 stroke-width="1.3" style="opacity:0.35">
                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                            </svg>
                            <span>Pick a date to see slots</span>
                        </div>

                        <template v-else>
                            <div class="avail-slots-date">{{ selectedDateLabel }}</div>

                            <div class="avail-slots-list">
                                <button
                                    v-for="slot in slots"
                                    :key="slot"
                                    class="avail-slot-btn"
                                    :class="{
                                        'avail-slot-btn--selected': selectedSlots.includes(slot) && !isSavedSlot(slot),
                                        'avail-slot-btn--saved': isSavedSlot(slot),
                                        'avail-slot-btn--saving': savingSlot === slot
                                    }"
                                    :disabled="savingSlot === slot || !selectedDate"
                                    @click="handleSlotClick(slot)">

                                    <span v-if="savingSlot === slot"
                                          class="dep-mini-spinner"></span>

                                    <svg v-else-if="isSavedSlot(slot)"
                                         width="14" height="14"
                                         viewBox="0 0 24 24"
                                         fill="none"
                                         stroke="currentColor"
                                         stroke-width="2.5">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>

                                    {{ slot }}

                                    <span v-if="isSavedSlot(slot)"
                                          style="font-size:0.75rem;opacity:0.85;margin-left:0.2rem">
                                        Saved
                                    </span>
                                </button>
                            </div>

                            <transition name="doctor-alert-fade">
                                <button v-if="pendingSlots.length > 0"
                                        class="avail-save-btn"
                                        :disabled="saving"
                                        @click="saveSlots">
                                    {{ saving ? 'Adding...' : ('Add ' + pendingSlots.length + ' Slot' + (pendingSlots.length > 1 ? 's' : '')) }}
                                </button>
                            </transition>
                        </template>
                    </div>
                </div>
            </div>

            <div class="doctor-section-card mt-4" v-if="allSlots.length > 0">
                <div class="doctor-subtitle mb-3">Your Availability (Next 7 Days)</div>
                <div class="doctor-table-wrap">
                    <table class="doctor-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Slot</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(av, i) in allSlots" :key="av.id">
                                <td class="text-muted" style="font-size:0.83rem">{{ i + 1 }}</td>
                                <td>{{ formatDate(av.date) }}</td>
                                <td><strong>{{ av.slot }}</strong></td>
                                <td>
                                    <div class="d-flex gap-2">
                                        <button
                                            v-if="!av.is_booked"
                                            class="doctor-btn-danger doctor-action-sm"
                                            @click="deleteSlot(av)">
                                            Delete
                                        </button>
                                        <button
                                            v-else
                                            class="doctor-btn-outline doctor-action-sm"
                                            @click="clearSlot(av)">
                                            Make Available
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    `,

    data() {
        const now = new Date()
        return {
            viewYear: now.getFullYear(),
            viewMonth: now.getMonth(),
            selectedDate: null,
            selectedSlots: [],
            slots: [
                '8:00 - 10:00 a.m.',
                '10:00 - 12:00 p.m.',
                '2:00 - 4:00 p.m.',
                '4:00 - 6:00 p.m.',
                '6:00 - 8:00 p.m.'
            ],
            allSlots: [],
            saving: false,
            savingSlot: null,
            successMsg: '',
            errorMsg: '',
            _sTimer: null,
            _eTimer: null
        }
    },

    computed: {
        today() {
            const t = new Date()
            return new Date(t.getFullYear(), t.getMonth(), t.getDate())
        },
        monthLabel() {
            return new Date(this.viewYear, this.viewMonth, 1)
                .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        },
        daysInMonth() {
            return new Date(this.viewYear, this.viewMonth + 1, 0).getDate()
        },
        leadBlanks() {
            return new Date(this.viewYear, this.viewMonth, 1).getDay()
        },
        canGoPrev() {
            const t = this.today
            return !(this.viewYear === t.getFullYear() && this.viewMonth === t.getMonth())
        },
        selectedDateLabel() {
            if (!this.selectedDate) return ''
            return new Date(this.selectedDate + 'T00:00:00')
                .toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
        },
        pendingSlots() {
            return this.selectedSlots.filter(slot => !this.isSavedSlot(slot))
        }
    },

    async mounted() {
        if (!this.$root.user) {
            this.$root.currentView = 'login-page'
            return
        }
        console.log('doctor root user:', this.$root.user)
        console.log('doctor resolved uid:', this.currentUserId())

        await this.fetchAllSlots()
    },

    beforeUnmount() {
        clearTimeout(this._sTimer)
        clearTimeout(this._eTimer)
    },

    methods: {
        currentUserId() {
            return this.$root.user?.userid
                || this.$root.user?.user_id
                || this.$root.user?.id
                || null
        },

        normalizeSlot(slot) {
            return (slot || '')
                .replace(/[–—]/g, '-')
                .replace(/\s*-\s*/g, ' - ')
                .replace(/\s+/g, ' ')
                .trim()
        },

        prevMonth() {
            if (!this.canGoPrev) return
            if (this.viewMonth === 0) {
                this.viewMonth = 11
                this.viewYear--
            } else {
                this.viewMonth--
            }
        },

        nextMonth() {
            if (this.viewMonth === 11) {
                this.viewMonth = 0
                this.viewYear++
            } else {
                this.viewMonth++
            }
        },

        dateStr(day) {
            const m = String(this.viewMonth + 1).padStart(2, '0')
            const d = String(day).padStart(2, '0')
            return this.viewYear + '-' + m + '-' + d
        },

        isPast(day) {
            const d = new Date(this.viewYear, this.viewMonth, day)
            return d < this.today
        },

        isToday(day) {
            const t = this.today
            return (
                this.viewYear === t.getFullYear() &&
                this.viewMonth === t.getMonth() &&
                day === t.getDate()
            )
        },

        isSelected(day) {
            return this.selectedDate === this.dateStr(day)
        },

        async selectDate(day) {
            if (this.isPast(day)) return
            this.selectedDate = this.dateStr(day)
            this.selectedSlots = []
            await this.fetchAllSlots()
        },

        isSavedSlot(slotName) {
            return this.allSlots.some(
                s =>
                    s.date === this.selectedDate &&
                    this.normalizeSlot(s.slot) === this.normalizeSlot(slotName)
            )
        },

        getSavedAvailability(slotName) {
            return this.allSlots.find(
                s =>
                    s.date === this.selectedDate &&
                    this.normalizeSlot(s.slot) === this.normalizeSlot(slotName)
            ) || null
        },

        handleSlotClick(slot) {
            if (!this.selectedDate || this.saving) return

            if (this.isSavedSlot(slot)) {
                this.removeSavedSlotByName(slot)
                return
            }

            this.toggleSlot(slot)
        },

        toggleSlot(slot) {
            if (!this.selectedDate) return
            const idx = this.selectedSlots.indexOf(slot)
            if (idx === -1) {
                this.selectedSlots.push(slot)
            } else {
                this.selectedSlots.splice(idx, 1)
            }
        },

        async removeSavedSlotByName(slotName) {
            const av = this.getSavedAvailability(slotName)

            if (!av) {
                this.showError('This saved slot cannot be removed')
                return
            }

            if (av.is_booked) {
                this.showError('Booked slot cannot be removed')
                return
            }

            const confirmed = confirm(
                'Make slot unavailable ? ' + slotName + ' on ' + this.formatDate(av.date)
            )
            if (!confirmed) return

            try {
                this.savingSlot = slotName
                await axios.delete('/api/doctor/availability/' + av.id, {
                    data: { user_id: this.currentUserId() },
                    withCredentials: true
                })

                await this.fetchAllSlots()
                this.selectedSlots = this.selectedSlots.filter(s => s !== slotName)
                this.showSuccess('Slot removed successfully')
            } catch (e) {
                this.showError(
                    (e.response && e.response.data && e.response.data.error)
                        ? e.response.data.error
                        : 'Failed to remove slot'
                )
            } finally {
                this.savingSlot = null
            }
        },

        async saveSlots() {
            if (!this.selectedDate || this.pendingSlots.length === 0) return

            this.saving = true
            const toSave = [...this.pendingSlots]
            const failed = []

            for (const slot of toSave) {
                this.savingSlot = slot
                try {
                    await axios.post('/api/doctor/availability', {
                        user_id: this.currentUserId(),
                        date: this.selectedDate,
                        slot: slot
                    }, { withCredentials: true })
                } catch (e) {
                    failed.push(slot)
                }
            }

            this.savingSlot = null
            await this.fetchAllSlots()
            this.selectedSlots = failed

            if (failed.length === 0) {
                this.showSuccess(
                    toSave.length === 1
                        ? 'Slot added: ' + toSave[0]
                        : toSave.length + ' slots added successfully'
                )
            } else {
                this.showError(failed.length + ' slot(s) could not be saved')
            }

            this.saving = false
        },

        async deleteSlot(av) {
            const confirmed = confirm(
                'Remove slot "' + av.slot + '" on ' + this.formatDate(av.date) + '?'
            )
            if (!confirmed) return

            try {
                await axios.delete('/api/doctor/availability/' + av.id, {
                    data: { user_id: this.currentUserId() },
                    withCredentials: true
                })

                this.showSuccess('Slot removed successfully')
                await this.fetchAllSlots()
            } catch (e) {
                this.showError(
                    (e.response && e.response.data && e.response.data.error)
                        ? e.response.data.error
                        : 'Failed to remove slot'
                )
            }
        },
        async clearSlot(av) {
            const confirmed = confirm(
                'Mark slot "' + av.slot + '" as available again?'
            )
            if (!confirmed) return

            try {
                await axios.put('/api/doctor/availability/' + av.id + '/clear', {
                    user_id: this.currentUserId()
                }, { withCredentials: true })

                this.showSuccess('Slot is now available for new bookings')
                await this.fetchAllSlots()
            } catch (e) {
                this.showError(e.response?.data?.error || 'Failed to clear slot')
            }
        },

        async fetchAllSlots() {
            try {
                const uid = this.$root.user?.user_id || this.$root.user?.id

                if (!uid) {
                    this.showError('User ID missing')
                    return
                }

                const res = await axios.get('/api/doctor/my-availability', {
                    params:          { user_id: uid },
                    withCredentials: true
                })

                const raw = Array.isArray(res.data) ? res.data : []
                const seen = new Set()
                this.allSlots = raw.filter(s => {
                    const key = s.date + '||' + this.normalizeSlot(s.slot)
                    if (seen.has(key)) return false
                    seen.add(key)
                    return true
                })


            } catch (e) {
                console.error('Failed to fetch availability:', e)
                this.showError(
                    (e.response && e.response.data && e.response.data.error)
                        ? e.response.data.error
                        : 'Failed to fetch availability'
                )
            }
        },


        formatDate(d) {
            if (!d) return '—'
            return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        },

        showSuccess(msg) {
            this.message = msg; this.error = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._msgTimer);
            this._msgTimer = setTimeout(() => { this.message = '' }, 2000);
        },

        showError(msg) {
            this.error = msg; this.message = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._errTimer);
            this._errTimer = setTimeout(() => { this.error = '' }, 2000);
        }
    }
})
/* =====================================================
   SehatSaathi — ADMIN MODULE  (FINAL POLISHED)
   ===================================================== */


/* =====================================================
   ADMIN NAVBAR
   ===================================================== */
app.component('admin-navbar', {
    template: `
    <nav class="navbar navbar-expand-lg admin-navbar">
        <div class="container-fluid">
            <a href="#" class="navbar-brand" @click.prevent="$root.currentView='admin-dashboard'">
                <img src="/static/images/logo.png" alt="SehatSaathi Logo" class="ss-logo">
            </a>

            <button class="navbar-toggler" type="button"
                    data-bs-toggle="collapse" data-bs-target="#adminNav"
                    aria-controls="adminNav" aria-expanded="false">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="adminNav">
                <ul class="navbar-nav mx-auto gap-1 mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a href="#" class="nav-link admin-nav-link"
                           :class="{ active: $root.currentView === 'admin-dashboard' }"
                           @click.prevent="$root.currentView='admin-dashboard'">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link admin-nav-link"
                           :class="{ active: $root.currentView === 'add-doctor' }"
                           @click.prevent="$root.currentView='add-doctor'">Add Doctor</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link admin-nav-link"
                           :class="{ active: $root.currentView === 'admin-departments' }"
                           @click.prevent="$root.currentView='admin-departments'">Departments</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link admin-nav-link"
                           :class="{ active: $root.currentView === 'admin-appointments' }"
                           @click.prevent="$root.currentView='admin-appointments'">Appointments</a>
                    </li>
                </ul>

                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <span class="admin-nav-username">{{ $root.user && $root.user.name }}</span>
                    <button class="admin-nav-logout" @click="logout">Logout</button>
                </div>
            </div>
        </div>
    </nav>
    `,
    methods: {
        async logout() {
            try { await axios.post('/api/logout') } catch (e) {}
            this.$root.user = null
            this.$root.selectedDoctor = null
            this.$root.selectedPatientAdmin = null
            this.$root.currentView = 'welcome-page'
        }
    }
})


/* =====================================================
   ADMIN DASHBOARD
   ===================================================== */
app.component('admin-dashboard', {
    template: `
    <div class="admin-shell">
        <admin-navbar></admin-navbar>

        <div class="admin-main">

            <!-- Page Header -->
            <div class="admin-page-header mb-3">
                <h2 class="admin-page-title">Admin Dashboard</h2>
            </div>

            <!-- Auto-dismiss alerts -->
            <transition name="admin-alert">
                <div v-if="message" class="alert alert-success">{{ message }}</div>
            </transition>
            <transition name="admin-alert">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
            </transition>

            <!-- Search bar -->
            <div class="admin-search-row mb-4">
                <input v-model="search"
                       @input="handleSearchInput"
                       @keyup.enter="runSearch"
                       class="admin-search-input"
                       placeholder="Search doctors or patients by name, email, specialization, department...">
                <button class="admin-nav-btn-filled" @click="runSearch">Search</button>
                <button v-if="showResults" class="admin-nav-btn-outline" @click="clearSearch">Clear</button>
            </div>

            <!-- Search Results -->
            <div v-if="showResults" class="admin-section-card mb-4 admin-search-results">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="admin-subtitle mb-0">
                        Search Results
                        <span class="admin-result-count">
                            {{ searchDoctors.length + searchPatients.length }} found
                        </span>
                    </div>
                    <button class="admin-btn-ghost" @click="clearSearch">X Clear</button>
                </div>

                <!-- Search Doctors -->
                <div v-if="searchDoctors.length" class="mb-3">
                    <div class="admin-result-group-label">Doctors</div>
                    <div v-for="d in searchDoctors" :key="'sd'+d.id" class="admin-list-item">
                        <div class="admin-list-media">
                            <img :src="doctorPhoto(d.photo)" alt="Doctor" class="admin-avatar">
                            <div>
                                <div class="admin-list-title">{{ d.name }}</div>
                                <div class="admin-list-meta">
                                    {{ d.specialization || '-' }}
                                    <span v-if="d.department"> - {{ d.department }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex gap-2 flex-wrap">
                            <button class="admin-btn-info" @click="viewDoctor(d)">View</button>
                            <button class="admin-btn-outline" @click="editDoctor(d)">Edit</button>
                            <button class="admin-btn-danger" @click="confirmDeleteDoctor(d.id)">Delete</button>
                            <button class="admin-btn-warning" @click="toggleDoctorBlock(d)">
                                {{ d.is_blocked ? 'Unblock' : 'Block' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Search Patients -->
                <div v-if="searchPatients.length">
                    <div class="admin-result-group-label">Patients</div>
                    <div v-for="p in searchPatients" :key="'sp'+p.id" class="admin-list-item">
                        <div>
                            <div class="admin-list-title">{{ p.name }}</div>
                            <div class="admin-list-meta">
                                {{ p.gender || '-' }} - Age: {{ p.age || '-' }} - {{ p.email || '-' }}  
                            </div>
                        </div>
                        <div class="d-flex gap-2 flex-wrap">
                            <button class="admin-btn-info" @click="viewPatient(p)">View</button>
                            <button class="admin-btn-secondary" @click="exportPatientCSV(p.id)">Export CSV</button>
                            <button class="admin-btn-danger" @click="confirmDeletePatient(p.id)">Delete</button>
                            <button class="admin-btn-warning" @click="togglePatientBlock(p)">
                                {{ p.is_blocked ? 'Unblock' : 'Block' }}
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="!searchDoctors.length && !searchPatients.length" class="admin-empty">
                    No results found for "{{ search }}"
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="row g-3 mb-4">
                <div class="col-6 col-lg-3">
                    <div class="admin-kpi-card kpi-blue">
                        <div class="admin-kpi-label">Doctors</div>
                        <div class="admin-kpi-value">{{ stats.doctors }}</div>
                        <div class="admin-kpi-note">Registered doctors</div>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="admin-kpi-card kpi-cyan">
                        <div class="admin-kpi-label">Patients</div>
                        <div class="admin-kpi-value">{{ stats.patients }}</div>
                        <div class="admin-kpi-note">Registered patients</div>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="admin-kpi-card kpi-teal">
                        <div class="admin-kpi-label">Appointments</div>
                        <div class="admin-kpi-value">{{ stats.appointments }}</div>
                        <div class="admin-kpi-note">Total appointments</div>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="admin-kpi-card kpi-indigo">
                        <div class="admin-kpi-label">Departments</div>
                        <div class="admin-kpi-value">{{ stats.departments }}</div>
                        <div class="admin-kpi-note">Active departments</div>
                    </div>
                </div>
            </div>

            <!-- Charts Row — all 3 side by side -->
            <div class="row g-3 mb-4">

                <div class="col-md-4">
                    <div class="admin-chart-card">
                        <div class="admin-chart-title">Appointment Status</div>
                        <div class="admin-chart-wrapper">
                            <canvas id="admin-status-chart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="admin-chart-card">
                        <div class="admin-chart-title">Appointments by Department</div>
                        <div class="admin-chart-wrapper">
                            <canvas id="admin-dept-chart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="admin-chart-card">
                        <div class="admin-chart-title">Trend — Last 7 Days</div>
                        <div class="admin-chart-wrapper">
                            <canvas id="admin-trend-chart"></canvas>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Upcoming Appointments (Booked only) -->
            <div class="admin-section-card mb-4">
                <div class="admin-subtitle">Upcoming Appointments</div>

                <div class="admin-table-wrap" v-if="upcomingAppointments.length">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Slot</th>
                                <th>Status</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="a in upcomingAppointments" :key="'up'+a.id">
                                <td>{{ a.patient_name }}</td>
                                <td>{{ a.doctor_name }}</td>
                                <td>{{ a.department || '-' }}</td>
                                <td>{{ a.date }}</td>
                                <td>{{ a.slot }}</td>
                                <td>
                                    <span class="admin-status status-booked">{{ a.status }}</span>
                                </td>
                                <td class="text-center">
                                    <button class="admin-btn-danger admin-action-sm" @click="cancelAppointment(a.id)">Cancel</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="admin-empty">No upcoming appointments.</div>
            </div>

            <!-- Doctors List -->
            <div class="admin-section-card mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="admin-subtitle mb-0">All Doctors</div>
                    <button class="admin-btn-primary" @click="$root.currentView='add-doctor'">+ Add Doctor</button>
                </div>

                <div v-if="doctors.length">
                    <div v-for="d in doctors" :key="d.id" class="admin-list-item">
                        <div class="admin-list-media">
                            <img :src="doctorPhoto(d.photo)" alt="Doctor Photo" class="admin-avatar">
                            <div>
                                <div class="admin-list-title">{{ d.name }}</div>
                                <div class="admin-list-meta">
                                    {{ d.specialization || '-' }}
                                    <span v-if="d.department"> - {{ d.department }}</span>
                                    <span v-if="d.email"> - {{ d.email }}</span>
                                </div>
                                <span v-if="d.is_blocked" class="admin-badge-blocked">Blocked</span>
                            </div>
                        </div>
                        <div class="d-flex gap-2 flex-wrap">
                            <button class="admin-btn-info" @click="viewDoctor(d)">View</button>
                            <button class="admin-btn-outline" @click="editDoctor(d)">Edit</button>
                            <button class="admin-btn-danger" @click="confirmDeleteDoctor(d.id)">Delete</button>
                            <button class="admin-btn-warning" @click="toggleDoctorBlock(d)">
                                {{ d.is_blocked ? 'Unblock' : 'Block' }}
                            </button>
                        </div>
                    </div>
                </div>
                <div v-else class="admin-empty">No doctors found.</div>
            </div>

            <!-- Patients List -->
            <div class="admin-section-card mb-4">
                <div class="admin-subtitle">All Patients</div>

                <div v-if="patients.length">
                    <div v-for="p in patients" :key="p.id" class="admin-list-item">
                        <div>
                            <div class="admin-list-title">{{ p.name }}</div>
                            <div class="admin-list-meta">
                                {{ p.gender || '-' }} - Age: {{ p.age || '-' }} - {{ p.email || '-' }}  
                            </div>
                            <span v-if="p.is_blocked" class="admin-badge-blocked">Blocked</span>
                        </div>
                        <div class="d-flex gap-2 flex-wrap">
                            <button class="admin-btn-info" @click="viewPatient(p)">View</button>
                            <button class="admin-btn-outline" @click="editPatient(p)">Edit</button>
                            <button class="admin-btn-secondary" @click="exportPatientCSV(p.id)">Export CSV</button>
                            <button class="admin-btn-danger" @click="confirmDeletePatient(p.id)">Delete</button>
                            <button class="admin-btn-warning" @click="togglePatientBlock(p)">
                                {{ p.is_blocked ? 'Unblock' : 'Block' }}
                            </button>
                        </div>
                    </div>
                </div>
                <div v-else class="admin-empty">No patients found.</div>
            </div>

        </div>
    </div>
    `,

    data() {
        return {
            stats: { doctors: 0, patients: 0, appointments: 0, departments: 0 },
            doctors: [],
            patients: [],
            appointments: [],
            upcomingAppointments: [],
            search: '',
            searchDoctors: [],
            searchPatients: [],
            showResults: false,
            message: '',
            error: '',
            _chartStatus: null,
            _chartDept: null,
            _chartTrend: null,
            _msgTimer: null,
            _errTimer: null
        }
    },

    async mounted() {
        if (!this.$root.user) { this.$root.currentView = 'login-page'; return }

        // Load everything in parallel → only ONE Vue re-render at the end
        await Promise.all([
            this.fetchDashboard(),
            this.loadDoctors(),
            this.loadPatients(),
            this.loadAppointments()
        ])

        this.$nextTick(() => this.initCharts())
    },

    beforeUnmount() {
        this.destroyCharts()
    },

    methods: {
        showSuccess(msg) {
            this.message = msg; this.error = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._msgTimer);
            this._msgTimer = setTimeout(() => { this.message = '' }, 2000);
        },
        showError(msg) {
            this.error = msg; this.message = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._errTimer);
            this._errTimer = setTimeout(() => { this.error = '' }, 2000);
        },
        doctorPhoto(photo) {
            if (!photo || photo === 'default_doctor.png') return '/static/images/default-doctor.png'
                        if (String(photo).startsWith('/static/') || String(photo).startsWith('http')) return photo
            return `/static/uploads/${photo}`

        },
        async fetchDashboard() {
            try {
                const res = await axios.get(`/api/admin/dashboard?user_id=${this.$root.user.user_id}`)
                this.stats = {
                    doctors:      res.data.doctors      || 0,
                    patients:     res.data.patients     || 0,
                    appointments: res.data.appointments || 0,
                    departments:  res.data.departments  || 0
                }
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to load dashboard')
            }
        },
        async loadDoctors() {
            try {
                const res = await axios.get(`/api/admin/doctors?user_id=${this.$root.user.user_id}`)
                this.doctors = res.data || []
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to load doctors')
            }
        },
        async loadPatients() {
            try {
                const res = await axios.get(`/api/admin/patients?user_id=${this.$root.user.user_id}`)
                this.patients = res.data || []
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to load patients')
            }
        },
        async loadAppointments() {
            try {
                const res = await axios.get(`/api/admin/appointments?user_id=${this.$root.user.user_id}`)
                this.appointments = res.data || []
                const today = new Date().toISOString().split('T')[0]
                this.upcomingAppointments = this.appointments
                    .filter(a => a.status === 'Booked' && a.date >= today)
                    .sort((a, b) => a.date.localeCompare(b.date))
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to load appointments')
            }
        },

        /* ---- Search ---- */
        handleSearchInput() {
            const q = (this.search || '').trim()
            if (!q) {
                this.clearSearch()
                return
            }
            clearTimeout(this._searchTimer)
            this._searchTimer = setTimeout(() => {
                this.runSearch()
            }, 300)
        },
        async runSearch() {
            const q = (this.search || '').trim()
            if (!q) { this.showResults = false; this.searchDoctors = []; this.searchPatients = []; return }
            try {
                const res = await axios.get(
                    `/api/admin/search?user_id=${this.$root.user.user_id}&type=all&q=${encodeURIComponent(q)}`
                )
                this.searchDoctors  = res.data.doctors  || []
                this.searchPatients = res.data.patients || []
                this.showResults = true
            } catch (err) {
                this.showError(err.response?.data?.error || 'Search failed')
            }
        },
        clearSearch() {
            this.search = ''; this.searchDoctors = []; this.searchPatients = []; this.showResults = false
        },

        /* ---- Navigation ---- */
        viewDoctor(d) {
            this.$root.selectedDoctor = { ...d }
            this.$root.currentView = 'admin-doctor-detail'
        },
        editDoctor(d) {
            this.$root.selectedDoctor = { ...d }
            this.$root.currentView = 'edit-doctor'
        },
        viewPatient(p) {
            this.$root.selectedPatientAdmin = { ...p }
            this.$root.currentView = 'admin-patient-detail'
        },
        editPatient(p) {
            this.$root.selectedPatientAdmin = { ...p }
            this.$root.currentView = 'edit-patient'
        },

        /* ---- Doctor actions ---- */
        confirmDeleteDoctor(id) {
            if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) return
            this.deleteDoctor(id)
        },
        async deleteDoctor(id) {
            try {
                const res = await axios.delete(`/api/admin/doctor/${id}`, {
                    data: { user_id: this.$root.user.user_id }
                })
                this.showSuccess(res.data.message || 'Doctor deleted successfully')
                await this.fetchDashboard()
                await this.loadDoctors()
                if (this.showResults) await this.runSearch()
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to delete doctor')
            }
        },
        async toggleDoctorBlock(d) {
            try {
                const res = await axios.put(`/api/admin/doctor/block/${d.id}`, {
                    user_id: this.$root.user.user_id
                })
                this.showSuccess(res.data.message || 'Doctor status updated')
                await this.loadDoctors()
                if (this.showResults) await this.runSearch()
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to update doctor status')
            }
        },

        /* ---- Patient actions ---- */
        confirmDeletePatient(id) {
            if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) return
            this.deletePatient(id)
        },
        async deletePatient(id) {
            try {
                const res = await axios.delete(`/api/admin/patient/${id}`, {
                    data: { user_id: this.$root.user.user_id }
                })
                this.showSuccess(res.data.message || 'Patient deleted successfully')
                await this.fetchDashboard()
                await this.loadPatients()
                if (this.showResults) await this.runSearch()
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to delete patient')
            }
        },
        async togglePatientBlock(p) {
            try {
                const res = await axios.put(`/api/admin/patient/block/${p.id}`, {
                    user_id: this.$root.user.user_id
                })
                this.showSuccess(res.data.message || 'Patient status updated')
                await this.loadPatients()
                if (this.showResults) await this.runSearch()
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to update patient status')
            }
        },
        exportPatientCSV(patientId) {
            window.open(`/api/admin/export/${patientId}?user_id=${this.$root.user.user_id}`, '_blank')
        },
        async cancelAppointment(apptId) {
            const confirmed = confirm('Are you sure you want to cancel this appointment?')
            if (!confirmed) return
            try {
                await axios.put(`/api/admin/appointment/${apptId}`, {
                    user_id: this.$root.user.user_id,
                    status:  'Cancelled'
                })
                this.showSuccess('Appointment cancelled successfully')
                await this.loadAppointments()
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to cancel appointment')
            }
        },

        /* ---- Charts ---- */
        destroyCharts() {
            // Use Chart.js internal registry — safe even after Vue re-renders
            ['admin-status-chart', 'admin-dept-chart', 'admin-trend-chart'].forEach(id => {
                const el = document.getElementById(id)
                if (el) {
                    const existing = Chart.getChart(el)
                    if (existing) existing.destroy()
                }
            })
            this._chartStatus = null
            this._chartDept   = null
            this._chartTrend  = null
        },
        initCharts() {
            if (typeof Chart === 'undefined') return
            this.destroyCharts()

            const statusCounts = { Booked: 0, Completed: 0, Cancelled: 0 }
            this.appointments.forEach(a => {
                if (statusCounts[a.status] !== undefined) statusCounts[a.status]++
            })

            const deptCounts = {}
            this.appointments.forEach(a => {
                const d = a.department || 'General'
                deptCounts[d] = (deptCounts[d] || 0) + 1
            })

            const statusCtx = document.getElementById('admin-status-chart')
            const deptCtx   = document.getElementById('admin-dept-chart')
            const trendCtx  = document.getElementById('admin-trend-chart')

            if (statusCtx) {
                this._chartStatus = new Chart(statusCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Booked', 'Completed', 'Cancelled'],
                        datasets: [{
                            data: [statusCounts.Booked, statusCounts.Completed, statusCounts.Cancelled],
                            backgroundColor: ['#3b82f6', '#14b8a6', '#f87171'],
                            borderWidth: 0, hoverOffset: 6
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, cutout: '65%',
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom', labels: { padding: 16, font: { size: 13 }, usePointStyle: true } }
                        }
                    }
                })
            }

            if (deptCtx) {
                this._chartDept = new Chart(deptCtx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(deptCounts),
                        datasets: [{
                            label: 'Appointments',
                            data: Object.values(deptCounts),
                            backgroundColor: 'rgba(22,164,219,0.72)',
                            borderRadius: 8, borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.05)' } },
                            x: { grid: { display: false } }
                        }
                    }
                })
            }

            if (trendCtx) {
                const days = []
                for (let i = 6; i >= 0; i--) {
                    const d = new Date()
                    d.setDate(d.getDate() - i)
                    days.push(d.toISOString().split('T')[0])
                }

                const trendCounts = {}
                days.forEach(d => { trendCounts[d] = 0 })

                this.appointments.forEach(a => {
                    if (trendCounts[a.date] !== undefined) trendCounts[a.date]++
                })

                const trendLabels = days.map(d => {
                    const [, m, day] = d.split('-')
                    return `${day}/${m}`
                })

                this._chartTrend = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: trendLabels,
                        datasets: [{
                            label: 'Appointments',
                            data: days.map(d => trendCounts[d]),
                            borderColor: '#0d9488',
                            backgroundColor: 'rgba(13,148,136,0.08)',
                            borderWidth: 2.5,
                            pointBackgroundColor: '#0d9488',
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { precision: 0, stepSize: 1 },
                                grid: { color: 'rgba(0,0,0,0.04)' }
                            },
                            x: { grid: { display: false } }
                        }
                    }
                })
            }
        }
    }
})


/* =====================================================
   ADMIN DOCTOR DETAIL
   ===================================================== */
app.component('admin-doctor-detail', {
    template: `
    <div class="admin-shell">
        <admin-navbar></admin-navbar>

        <div class="admin-main">

            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="admin-page-title">Doctor Profile</h2>
                </div>
                <div class="d-flex gap-2">
                    <button class="admin-btn-outline" @click="edit">Edit Doctor</button>
                    <button class="admin-btn-outline" @click="$root.currentView='admin-dashboard'">Back</button>
                </div>
            </div>

            <transition name="admin-alert">
                <div v-if="message" class="alert alert-success">{{ message }}</div>
            </transition>
            <transition name="admin-alert">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
            </transition>

            <!-- Profile card -->
            <div class="admin-doctor-detail-card mb-4">
                <div class="row g-0">

                    <!-- Photo column -->
                    <div class="col-md-3 doctor-detail-photo-col">
                        <div class="doctor-detail-photo-wrap">
                            <img :src="doctorPhoto(doc.photo)" alt="Doctor" class="doctor-detail-photo">
                            <div class="doctor-detail-name">{{ doc.name }}</div>
                            <div class="doctor-detail-spec">{{ doc.specialization || '-' }}</div>
                            <span v-if="doc.department" class="doctor-detail-dept-badge">
                                {{ doc.department }}
                            </span>
                            <span v-if="doc.is_blocked" class="admin-badge-blocked mt-2 d-block text-center">Blocked</span>
                        </div>
                    </div>

                    <!-- Details grid -->
                    <div class="col-md-9 doctor-detail-info-col">
                        <div class="row g-3 p-3 pt-3">
                            <div class="col-md-6">
                                <div class="doctor-detail-field">
                                    <span class="field-label">Email</span>
                                    <span class="field-value">{{ doc.email || '-' }}</span>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="doctor-detail-field">
                                    <span class="field-label">Phone</span>
                                    <span class="field-value">{{ doc.phone || '-' }}</span>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="doctor-detail-field">
                                    <span class="field-label">Gender</span>
                                    <span class="field-value">{{ doc.gender || '-' }}</span>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="doctor-detail-field">
                                    <span class="field-label">Age</span>
                                    <span class="field-value">{{ doc.age || '-' }}</span>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="doctor-detail-field">
                                    <span class="field-label">Qualification</span>
                                    <span class="field-value">{{ doc.qualification || '-' }}</span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="doctor-detail-field">
                                    <span class="field-label">Experience</span>
                                    <span class="field-value">{{ doc.experience || '-' }}</span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="doctor-detail-field">
                                    <span class="field-label">Consultation Fee</span>
                                    <span class="field-value">Rs.{{ doc.fee || '-' }}</span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="doctor-detail-field">
                                    <span class="field-label">License No.</span>
                                    <span class="field-value">{{ doc.license_no || '-' }}</span>
                                </div>
                            </div>
                            <div class="col-md-12" v-if="doc.bio">
                                <div class="doctor-detail-field">
                                    <span class="field-label">Bio</span>
                                    <span class="field-value">{{ doc.bio }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Appointment History with status filter dropdown -->
            <div class="admin-section-card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="admin-subtitle mb-0">
                        Appointment History
                        <span class="appt-result-pill ms-2">{{ filteredAppointments.length }} record{{ filteredAppointments.length !== 1 ? 's' : '' }}</span>
                    </div>
                    <div class="appt-custom-select">
                        <select v-model="apptFilter" class="appt-select">
                            <option value="All">All Statuses ({{ appointments.length }})</option>
                            <option value="Booked">Booked ({{ countByStatus('Booked') }})</option>
                            <option value="Completed">Completed ({{ countByStatus('Completed') }})</option>
                            <option value="Cancelled">Cancelled ({{ countByStatus('Cancelled') }})</option>
                        </select>
                        <span class="appt-select-arrow">▾</span>
                    </div>
                </div>

                <div class="admin-table-wrap" v-if="filteredAppointments.length">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Date</th>
                                <th>Slot</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="a in filteredAppointments" :key="a.id">
                                <td>{{ a.patient_name }}</td>
                                <td>{{ a.date }}</td>
                                <td>{{ a.slot }}</td>
                                <td>
                                    <span class="admin-status" :class="statusClass(a.status)">{{ a.status }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="admin-empty">
                    {{ apptFilter === 'All' ? 'No appointment history found for this doctor.' : 'No ' + apptFilter + ' appointments.' }}
                </div>
            </div>

        </div>
    </div>
    `,

    data() {
        return {
            doc: {},
            appointments: [],
            apptFilter: 'All',
            message: '',
            error: '',
            _msgTimer: null,
            _errTimer: null
        }
    },

    computed: {
        filteredAppointments() {
            if (this.apptFilter === 'All') return this.appointments
            return this.appointments.filter(a => a.status === this.apptFilter)
        }
    },

    async mounted() {
        if (!this.$root.user) { this.$root.currentView = 'login-page'; return }
        if (!this.$root.selectedDoctor) { this.$root.currentView = 'admin-dashboard'; return }
        this.doc = { ...this.$root.selectedDoctor }
        await this.fetchAppointments()
    },

    methods: {
        showSuccess(msg) {
            this.message = msg; this.error = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._msgTimer);
            this._msgTimer = setTimeout(() => { this.message = '' }, 2000);
        },
        showError(msg) {
            this.error = msg; this.message = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._errTimer);
            this._errTimer = setTimeout(() => { this.error = '' }, 2000);
        },
        doctorPhoto(photo) {
            if (!photo || photo === 'default_doctor.png') return '/static/images/default-doctor.png'
                        if (String(photo).startsWith('/static/') || String(photo).startsWith('http')) return photo
            return `/static/uploads/${photo}`

        },
        statusClass(s) {
            if (s === 'Booked')    return 'status-booked'
            if (s === 'Completed') return 'status-completed'
            if (s === 'Cancelled') return 'status-cancelled'
            return ''
        },
                countByStatus(tab) {
            if (tab === 'All') return this.appointments.length
            return this.appointments.filter(a => a.status === tab).length
        },
        edit() {
            this.$root.selectedDoctor = { ...this.doc }
            this.$root.currentView = 'edit-doctor'
        },
        async fetchAppointments() {
            try {
                const res = await axios.get(`/api/doctor/appointments/${this.doc.id}`)
                this.appointments = res.data || []
            } catch (err) {
                // silently fail
            }
        }
    }
})


/* =====================================================
   ADMIN PATIENT DETAIL
   ===================================================== */
app.component('admin-patient-detail', {
    template: `
    <div class="admin-shell">
        <admin-navbar></admin-navbar>

        <div class="admin-main">

            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="admin-page-title">Patient Profile</h2>
                </div>
                <div class="d-flex gap-2">
                    <button class="admin-btn-secondary" @click="exportCSV">Export CSV</button>
                    <button class="admin-btn-outline" @click="$root.currentView='admin-dashboard'">Back</button>
                </div>
            </div>

            <transition name="admin-alert">
                <div v-if="message" class="alert alert-success">{{ message }}</div>
            </transition>
            <transition name="admin-alert">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
            </transition>

            <!-- Patient card -->
            <div class="admin-section-card admin-patient-detail-card mb-4">
                <div class="patient-detail-center">
                    <div class="patient-detail-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                             width="48" height="48">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                    </div>
                    <div class="patient-detail-name">{{ patient.name || '-' }}</div>
                    <span v-if="patient.is_blocked" class="admin-badge-blocked">Blocked</span>
                </div>

                <div class="row g-3 mt-3 patient-detail-fields justify-content-center">
                    <div class="col-md-3 col-sm-6">
                        <div class="doctor-detail-field">
                            <span class="field-label">Email</span>
                            <span class="field-value">{{ patient.email || '-' }}</span>
                        </div>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <div class="doctor-detail-field">
                            <span class="field-label">Phone</span>
                            <span class="field-value">{{ patient.phone || '-' }}</span>
                        </div>
                    </div>
                    <div class="col-md-2 col-sm-6">
                        <div class="doctor-detail-field">
                            <span class="field-label">Gender</span>
                            <span class="field-value">{{ patient.gender || '-' }}</span>
                        </div>
                    </div>
                    <div class="col-md-2 col-sm-6">
                        <div class="doctor-detail-field">
                            <span class="field-label">Age</span>
                            <span class="field-value">{{ patient.age || '-' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Appointment History with status filter dropdown -->
            <div class="admin-section-card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="admin-subtitle mb-0">
                        Appointment History
                        <span class="appt-result-pill ms-2">{{ filteredAppointments.length }} record{{ filteredAppointments.length !== 1 ? 's' : '' }}</span>
                    </div>
                    <div class="appt-custom-select">
                        <select v-model="apptFilter" class="appt-select">
                            <option value="All">All Statuses ({{ appointments.length }})</option>
                            <option value="Booked">Booked ({{ countByStatus('Booked') }})</option>
                            <option value="Completed">Completed ({{ countByStatus('Completed') }})</option>
                            <option value="Cancelled">Cancelled ({{ countByStatus('Cancelled') }})</option>
                        </select>
                        <span class="appt-select-arrow">▾</span>
                    </div>
                </div>

                <div class="admin-table-wrap" v-if="filteredAppointments.length">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Slot</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="a in filteredAppointments" :key="a.id">
                                <td>{{ a.doctor_name }}</td>
                                <td>{{ a.department || '-' }}</td>
                                <td>{{ a.date }}</td>
                                <td>{{ a.slot }}</td>
                                <td>
                                    <span class="admin-status" :class="statusClass(a.status)">{{ a.status }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="admin-empty">
                    {{ apptFilter === 'All' ? 'No appointment history found for this patient.' : 'No ' + apptFilter + ' appointments.' }}
                </div>
            </div>

        </div>
    </div>
    `,

    data() {
        return {
            patient: {},
            appointments: [],
            apptFilter: 'All',
            message: '',
            error: ''
        }
    },

    computed: {
        filteredAppointments() {
            if (this.apptFilter === 'All') return this.appointments
            return this.appointments.filter(a => a.status === this.apptFilter)
        }
    },

    async mounted() {
        if (!this.$root.user) { this.$root.currentView = 'login-page'; return }
        if (!this.$root.selectedPatientAdmin) { this.$root.currentView = 'admin-dashboard'; return }
        this.patient = { ...this.$root.selectedPatientAdmin }
        await this.fetchAppointments()
    },

    methods: {
        statusClass(s) {
            if (s === 'Booked')    return 'status-booked'
            if (s === 'Completed') return 'status-completed'
            if (s === 'Cancelled') return 'status-cancelled'
            return ''
        },
        countByStatus(tab) {
            if (tab === 'All') return this.appointments.length
            return this.appointments.filter(a => a.status === tab).length
        },
        exportCSV() {
            window.open(`/api/admin/export/${this.patient.id}?user_id=${this.$root.user.user_id}`, '_blank')
        },
        editPatient() {
            this.$root.selectedPatientAdmin = { ...this.patient }
            this.$root.currentView = 'edit-patient'
        },
        async fetchAppointments() {
            try {
                const res = await axios.get(`/api/admin/appointments?user_id=${this.$root.user.user_id}`)
                const all = res.data || []
                this.appointments = all.filter(a => a.patient_id === this.patient.id)
            } catch (err) {
                // silently fail
            }
        }
    }
})

/* =====================================================
   ADD DOCTOR
   ===================================================== */
app.component('add-doctor', {
    template: `
    <div class="admin-shell">
        <admin-navbar></admin-navbar>

        <div class="admin-main">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="admin-page-title">Add Doctor</h2>
                </div>
                <button class="admin-btn-outline" @click="$root.currentView='admin-dashboard'">Back</button>
            </div>

            <transition name="admin-alert">
                <div v-if="message" class="alert alert-success">{{ message }}</div>
            </transition>
            <transition name="admin-alert">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
            </transition>

            <div class="admin-section-card">
                <div class="admin-subtitle">Doctor Details</div>

                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Name <span class="text-danger">*</span></label>
                        <input v-model="form.name" class="form-control admin-form-control" placeholder="Doctor name">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email <span class="text-danger">*</span></label>
                        <input v-model="form.email" type="email" class="form-control admin-form-control" placeholder="Doctor email">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Phone <span class="text-danger">*</span></label>
                        <input v-model="form.phone" class="form-control admin-form-control" placeholder="Phone number" maxlength="10">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Gender</label>
                        <select v-model="form.gender" class="form-control admin-form-control">
                            <option value="">Select</option>
                            <option>Male</option><option>Female</option><option>Other</option><option>NA</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Age</label>
                        <input v-model="form.age" type="number" min="18" max="99" class="form-control admin-form-control" placeholder="Age">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Password <span class="text-danger">*</span></label>
                        <input v-model="form.password" type="password" class="form-control admin-form-control" placeholder="Password">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Specialization <span class="text-danger">*</span></label>
                        <input v-model="form.specialization" class="form-control admin-form-control" placeholder="Specialization">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Qualification</label>
                        <input v-model="form.qualification" class="form-control admin-form-control" placeholder="Qualification">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Experience</label>
                        <input v-model="form.experience" class="form-control admin-form-control" placeholder="e.g. 5 years">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Fee (Rs.)</label>
                        <input v-model="form.fee" type="number" min="0" class="form-control admin-form-control" placeholder="Consultation fee">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Department <span class="text-danger">*</span></label>
                        <select v-model="form.department_id" class="form-control admin-form-control">
                            <option value="">Select department</option>
                            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">License No.</label>
                        <input v-model="form.license_no" class="form-control admin-form-control" placeholder="License number">
                    </div>
                    <div class="col-md-12">
                        <label class="form-label">Bio</label>
                        <textarea v-model="form.bio" class="form-control admin-form-control" rows="3" placeholder="Short doctor bio"></textarea>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Upload Photo</label>
                        <input type="file" accept="image/*" @change="handleFile" class="form-control admin-form-control">
                    </div>
                    <div class="col-md-6" v-if="preview">
                        <label class="form-label">Preview</label>
                        <div class="admin-preview-box">
                            <img :src="preview" alt="Doctor Preview" class="admin-preview-image">
                        </div>
                    </div>
                </div>

                <div class="mt-4">
                    <button class="admin-btn-primary" @click="create" :disabled="saving">
                        {{ saving ? 'Creating...' : 'Create Doctor' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            form: {
                name: '', email: '', phone: '', gender: '', age: '',
                password: '', specialization: '', qualification: '',
                experience: '', fee: '', department_id: '', license_no: '', bio: ''
            },
            departments: [],
            file: null,
            preview: null,
            saving: false,
            message: '',
            error: '',
            _msgTimer: null,
            _errTimer: null
        }
    },

    async mounted() {
        if (!this.$root.user) { this.$root.currentView = 'login-page'; return }
        await this.fetchDepartments()
    },

    methods: {
        showSuccess(msg) {
            this.message = msg; this.error = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._msgTimer);
            this._msgTimer = setTimeout(() => { this.message = '' }, 2000);
        },
        showError(msg) {
            this.error = msg; this.message = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._errTimer);
            this._errTimer = setTimeout(() => { this.error = '' }, 2000);
        },
        async fetchDepartments() {
            try {
                const res = await axios.get(`/api/admin/departments?user_id=${this.$root.user.user_id}`)
                this.departments = res.data || []
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to load departments')
            }
        },
        handleFile(e) {
            this.file = e.target.files[0] || null
            this.preview = this.file ? URL.createObjectURL(this.file) : null
        },
        async create() {
            if (this.saving) return
            if (!this.form.department_id) {
                this.showError('Department is required.')
                return
            }
            this.saving = true
            try {
                const fd = new FormData()
                Object.keys(this.form).forEach(k => fd.append(k, this.form[k] ?? ''))
                fd.append('user_id', this.$root.user.user_id)
                if (this.file) fd.append('photo', this.file)

                const res = await axios.post('/api/admin/doctor', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                this.showSuccess(res.data.message || 'Doctor created successfully')
                this.form = { name: '', email: '', phone: '', gender: '', age: '', password: '', specialization: '', qualification: '', experience: '', fee: '', department_id: '', license_no: '', bio: '' }
                this.file = null; this.preview = null
                setTimeout(() => { this.$root.currentView = 'admin-dashboard' }, 900)
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to create doctor')
            } finally {
                this.saving = false
            }
        }
    }
})


/* =====================================================
   EDIT DOCTOR  (supports photo update via multipart)
   ===================================================== */
app.component('edit-doctor', {
    template: `
    <div class="admin-shell">
        <admin-navbar></admin-navbar>

        <div class="admin-main">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="admin-page-title">Edit Doctor</h2>
                </div>
                <button class="admin-btn-outline" @click="$root.currentView='admin-dashboard'">Back</button>
            </div>

            <transition name="admin-alert">
                <div v-if="message" class="alert alert-success">{{ message }}</div>
            </transition>
            <transition name="admin-alert">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
            </transition>

            <div class="admin-section-card">
                <div class="admin-subtitle">Edit Details</div>

                <div class="row g-3">
                    <!-- Current photo + change option -->
                    <div class="col-md-12 mb-2">
                        <div class="d-flex align-items-center gap-3">
                            <img :src="currentPhoto" alt="Current Photo"
                                 style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid var(--admin-border,#dee2e6)">
                            <div>
                                <div class="form-label mb-1">Change Photo (optional)</div>
                                <input type="file" accept="image/*" @change="handleFile" class="form-control admin-form-control" style="max-width:320px">
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">Name</label>
                        <input v-model="doc.name" class="form-control admin-form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email</label>
                        <input v-model="doc.email" type="email" class="form-control admin-form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Phone</label>
                        <input v-model="doc.phone" class="form-control admin-form-control">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Gender</label>
                        <select v-model="doc.gender" class="form-control admin-form-control">
                            <option>Male</option><option>Female</option><option>Other</option><option>NA</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Age</label>
                        <input v-model="doc.age" type="number" min="18" max="99" class="form-control admin-form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Specialization</label>
                        <input v-model="doc.specialization" class="form-control admin-form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Experience</label>
                        <input v-model="doc.experience" class="form-control admin-form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Qualification</label>
                        <input v-model="doc.qualification" class="form-control admin-form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Fee (Rs.)</label>
                        <input v-model="doc.fee" type="number" min="0" class="form-control admin-form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Department</label>
                        <select v-model="doc.department_id" class="form-control admin-form-control">
                            <option value="">Select department</option>
                            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">License No.</label>
                        <input v-model="doc.license_no" class="form-control admin-form-control">
                    </div>
                    <div class="col-md-12">
                        <label class="form-label">Bio</label>
                        <textarea v-model="doc.bio" class="form-control admin-form-control" rows="3"></textarea>
                    </div>
                </div>

                <div class="mt-4">
                    <button class="admin-btn-primary" @click="save" :disabled="saving">
                        {{ saving ? 'Saving...' : 'Save Changes' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            doc: {},
            departments: [],
            file: null,
            saving: false,
            message: '',
            error: '',
            _msgTimer: null,
            _errTimer: null
        }
    },

    computed: {
        currentPhoto() {
            const p = this.doc.photo
            if (!p || p === 'default_doctor.png') return '/static/images/default-doctor.png'
            return `/static/uploads/${p}`
        }
    },

    async mounted() {
        if (!this.$root.user) { this.$root.currentView = 'login-page'; return }
        if (!this.$root.selectedDoctor) { this.$root.currentView = 'admin-dashboard'; return }
        this.doc = { ...this.$root.selectedDoctor }
        await this.fetchDepartments()
    },

    methods: {
        showSuccess(msg) {
            this.message = msg; this.error = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._msgTimer);
            this._msgTimer = setTimeout(() => { this.message = '' }, 2000);
        },
        showError(msg) {
            this.error = msg; this.message = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._errTimer);
            this._errTimer = setTimeout(() => { this.error = '' }, 2000);
        },
        async fetchDepartments() {
            try {
                const res = await axios.get(`/api/admin/departments?user_id=${this.$root.user.user_id}`)
                this.departments = res.data || []
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to load departments')
            }
        },
        handleFile(e) {
            this.file = e.target.files[0] || null
        },
        async save() {
            if (this.saving) return
            this.saving = true
            try {
                let res
                if (this.file) {
                    // multipart/form-data when a new photo is selected
                    const fd = new FormData()
                    const fields = ['name','email','phone','gender','age','specialization',
                                    'experience','qualification','bio','fee','department_id','license_no']
                    fields.forEach(k => fd.append(k, this.doc[k] ?? ''))
                    fd.append('user_id', this.$root.user.user_id)
                    fd.append('photo', this.file)
                    res = await axios.put(`/api/admin/doctor/${this.doc.id}`, fd, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })
                } else {
                    // plain JSON when no photo change
                    res = await axios.put(`/api/admin/doctor/${this.doc.id}`, {
                        ...this.doc, user_id: this.$root.user.user_id
                    })
                }
                this.showSuccess(res.data.message || 'Doctor updated successfully')
                setTimeout(() => { this.$root.currentView = 'admin-dashboard' }, 900)
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to update doctor')
            } finally {
                this.saving = false
            }
        }
    }
})

app.component('edit-patient', {
    template: `
    <div class="admin-shell">
        <admin-navbar></admin-navbar>

        <div class="admin-main">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="admin-page-title">Edit Patient</h2>
                </div>
                <button class="admin-btn-outline" @click="goBack">Back</button>
            </div>

            <transition name="admin-alert">
                <div v-if="message" class="alert alert-success">{{ message }}</div>
            </transition>
            <transition name="admin-alert">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
            </transition>

            <div class="admin-section-card">
                <div class="admin-subtitle">Patient Details</div>

                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Full Name</label>
                        <input v-model="form.name" class="form-control admin-form-control" placeholder="Patient name">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email</label>
                        <input v-model="form.email" class="form-control admin-form-control" placeholder="Email address">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Phone</label>
                        <input v-model="form.phone" class="form-control admin-form-control" placeholder="Phone number" maxlength="10">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Gender</label>
                        <select v-model="form.gender" class="form-control admin-form-control">
                            <option value="">Select</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                            <option>NA</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Age</label>
                        <input v-model="form.age" type="number" class="form-control admin-form-control" placeholder="Age">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Address</label>
                        <input v-model="form.address" class="form-control admin-form-control" placeholder="Address (optional)">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Blood Group</label>
                        <select v-model="form.blood_group" class="form-control admin-form-control">
                            <option value="">Select</option>
                            <option>A+</option><option>A-</option>
                            <option>B+</option><option>B-</option>
                            <option>O+</option><option>O-</option>
                            <option>AB+</option><option>AB-</option>
                        </select>
                    </div>
                </div>

                <div class="mt-4 d-flex gap-2">
                    <button class="admin-btn-primary" @click="save">Save Changes</button>
                    <button class="admin-btn-outline" @click="goBack">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            form: { name: '', email: '', phone: '', gender: '', age: '', address: '', blood_group: '' },
            message: '',
            error: '',
            _msgTimer: null,
            _errTimer: null
        }
    },

    mounted() {
        if (!this.$root.user) { this.$root.currentView = 'login-page'; return }
        if (!this.$root.selectedPatientAdmin) { this.$root.currentView = 'admin-dashboard'; return }
        const p = this.$root.selectedPatientAdmin
        this.form = {
            name:        p.name        || '',
            email:       p.email       || '',
            phone:       p.phone       || '',
            gender:      p.gender      || '',
            age:         p.age         || '',
            address:     p.address     || '',
            blood_group: p.blood_group || ''
        }
    },

    methods: {
        showSuccess(msg) {
            this.message = msg; this.error = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._msgTimer);
            this._msgTimer = setTimeout(() => { this.message = '' }, 2000);
        },
        showError(msg) {
            this.error = msg; this.message = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._errTimer);
            this._errTimer = setTimeout(() => { this.error = '' }, 2000);
        },
        goBack() {
            this.$root.currentView = 'admin-dashboard'
        },
        async save() {
            try {
                const id = this.$root.selectedPatientAdmin.id
                const res = await axios.put(`/api/admin/patient/${id}`, {
                    ...this.form,
                    user_id: this.$root.user.user_id
                })
                this.showSuccess(res.data.message || 'Patient updated successfully')
                this.$root.selectedPatientAdmin = { ...this.$root.selectedPatientAdmin, ...this.form }
                setTimeout(() => { this.$root.currentView = 'admin-dashboard' }, 900)
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to update patient')
            }
        }
    }
})

/* =====================================================
   ADMIN APPOINTMENTS  (polished filter bar + date range)
   ===================================================== */
app.component('admin-appointments', {
    template: `
    <div class="admin-shell">
        <admin-navbar></admin-navbar>

        <div class="admin-main">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="admin-page-title">Appointments</h2>
                </div>
                <button class="admin-btn-outline" @click="$root.currentView='admin-dashboard'">Back</button>
            </div>

            <transition name="admin-alert">
                <div v-if="message" class="alert alert-success">{{ message }}</div>
            </transition>
            <transition name="admin-alert">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
            </transition>

            <div class="admin-section-card">

                <!-- Polished Filter Bar -->
                <div class="appt-filter-bar">
                    <div class="appt-filter-left">

                        <!-- Status dropdown -->
                        <div class="appt-filter-group">
                            <label class="appt-filter-label">Status</label>
                            <div class="appt-custom-select">
                                <select v-model="statusFilter" class="appt-select">
                                    <option value="All">All Statuses ({{ countByStatus('All') }})</option>
                                    <option value="Booked">Booked ({{ countByStatus('Booked') }})</option>
                                    <option value="Completed">Completed ({{ countByStatus('Completed') }})</option>
                                    <option value="Cancelled">Cancelled ({{ countByStatus('Cancelled') }})</option>
                                </select>
                                <span class="appt-select-arrow">▾</span>
                            </div>
                        </div>

                        <!-- Date From -->
                        <div class="appt-filter-group">
                            <label class="appt-filter-label">From</label>
                            <input type="date" v-model="dateFrom" class="appt-date-input" title="From date">
                        </div>

                        <!-- Date To -->
                        <div class="appt-filter-group">
                            <label class="appt-filter-label">To</label>
                            <input type="date" v-model="dateTo" class="appt-date-input" title="To date">
                        </div>

                        <!-- Clear button — only visible when filters active -->
                        <button v-if="statusFilter !== 'All' || dateFrom || dateTo"
                                class="appt-clear-btn"
                                @click="statusFilter='All'; dateFrom=''; dateTo=''">
                            ✕ Clear
                        </button>

                    </div>

                    <!-- Result count pill -->
                    <div class="appt-result-pill">
                        {{ filteredAppointments.length }}
                        appointment{{ filteredAppointments.length !== 1 ? 's' : '' }} found
                    </div>
                </div>

                <!-- Table -->
                <div class="admin-table-wrap" v-if="filteredAppointments.length">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Slot</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="a in filteredAppointments" :key="a.id">
                                <td>{{ a.patient_name }}</td>
                                <td>{{ a.doctor_name }}</td>
                                <td>{{ a.department || '-' }}</td>
                                <td>{{ a.date }}</td>
                                <td>{{ a.slot }}</td>
                                <td>
                                    <span class="admin-status" :class="statusClass(a.status)">{{ a.status }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="admin-empty">No appointments found for the selected filters.</div>

            </div>
        </div>
    </div>
    `,

    data() {
        return {
            appointments: [],
            statusFilter: 'All',
            dateFrom: '',
            dateTo: '',
            message: '',
            error: '',
            _msgTimer: null,
            _errTimer: null
        }
    },

    computed: {
        filteredAppointments() {
            return this.appointments.filter(a => {
                if (this.statusFilter !== 'All' && a.status !== this.statusFilter) return false
                if (this.dateFrom && a.date < this.dateFrom) return false
                if (this.dateTo   && a.date > this.dateTo)   return false
                return true
            })
        }
    },

    async mounted() {
        if (!this.$root.user) { this.$root.currentView = 'login-page'; return }
        await this.fetchAppointments()
    },

    methods: {
        showSuccess(msg) {
            this.message = msg; this.error = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._msgTimer);
            this._msgTimer = setTimeout(() => { this.message = '' }, 2000);
        },
        showError(msg) {
            this.error = msg; this.message = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._errTimer);
            this._errTimer = setTimeout(() => { this.error = '' }, 2000);
        },
        statusClass(s) {
            if (s === 'Booked')    return 'status-booked'
            if (s === 'Completed') return 'status-completed'
            if (s === 'Cancelled') return 'status-cancelled'
            return ''
        },
        countByStatus(tab) {
            if (tab === 'All') return this.appointments.length
            return this.appointments.filter(a => a.status === tab).length
        },
        async fetchAppointments() {
            try {
                const res = await axios.get(`/api/admin/appointments?user_id=${this.$root.user.user_id}`)
                this.appointments = res.data || []
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to load appointments')
            }
        },
        async update(id, e) {
            try {
                const res = await axios.put(`/api/admin/appointment/${id}`, {
                    user_id: this.$root.user.user_id, status: e.target.value
                })
                this.showSuccess(res.data.message || 'Appointment updated')
                await this.fetchAppointments()
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to update appointment')
                e.target.value = 'Change'
            }
        }
    }
})
/* =====================================================
   ADMIN DEPARTMENTS
   ===================================================== */
app.component('admin-departments', {
    template: `
    <div class="admin-shell">
        <admin-navbar></admin-navbar>

        <div class="admin-main">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="admin-page-title">Departments</h2>
                </div>
                <button class="admin-btn-outline" @click="$root.currentView='admin-dashboard'">Back</button>
            </div>

            <transition name="admin-alert">
                <div v-if="message" class="alert alert-success">{{ message }}</div>
            </transition>
            <transition name="admin-alert">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
            </transition>

            <div class="admin-section-card">
                <div class="admin-subtitle">{{ form.id ? 'Edit Department' : 'Add Department' }}</div>
                <div class="row g-3 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label">Name <span class="text-danger">*</span></label>
                        <input v-model="form.name" class="form-control admin-form-control" placeholder="Department name">
                    </div>
                    <div class="col-md-5">
                        <label class="form-label">Description</label>
                        <input v-model="form.description" class="form-control admin-form-control" placeholder="Department description">
                    </div>
                    <div class="col-md-3 d-flex gap-2">
                        <button class="admin-btn-primary flex-fill" @click="save" :disabled="saving">
                            {{ saving ? '...' : (form.id ? 'Update' : 'Save') }}
                        </button>
                        <button v-if="form.id" class="admin-btn-ghost" @click="cancelEdit" title="Cancel edit">X</button>
                    </div>
                </div>
            </div>

            <div class="admin-section-card">
                <div class="admin-subtitle">Department List</div>
                <div v-if="list.length">
                    <div v-for="d in list" :key="d.id" class="admin-list-item">
                        <div>
                            <div class="admin-list-title">{{ d.name }}</div>
                            <div class="admin-list-meta">{{ d.description || 'No description available' }}</div>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="admin-btn-outline" @click="edit(d)">Edit</button>
                            <button class="admin-btn-danger" @click="confirmDel(d.id)">Delete</button>
                        </div>
                    </div>
                </div>
                <div v-else class="admin-empty">No departments found.</div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            list: [],
            form: { id: null, name: '', description: '' },
            saving: false,
            message: '',
            error: '',
            _msgTimer: null,
            _errTimer: null
        }
    },

    async mounted() {
        if (!this.$root.user) { this.$root.currentView = 'login-page'; return }
        await this.fetch()
    },

    methods: {
        showSuccess(msg) {
            this.message = msg; this.error = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._msgTimer);
            this._msgTimer = setTimeout(() => { this.message = '' }, 2000);
        },
        showError(msg) {
            this.error = msg; this.message = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearTimeout(this._errTimer);
            this._errTimer = setTimeout(() => { this.error = '' }, 2000);
        },
        async fetch() {
            try {
                const res = await axios.get(`/api/admin/departments?user_id=${this.$root.user.user_id}`)
                this.list = res.data || []
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to load departments')
            }
        },
        edit(d) { this.form = { ...d } },
        cancelEdit() { this.form = { id: null, name: '', description: '' } },
        async save() {
            if (this.saving) return
            if (!this.form.name.trim()) { this.showError('Department name is required'); return }
            this.saving = true
            try {
                if (this.form.id) {
                    const res = await axios.put(`/api/admin/departments/${this.form.id}`,
                        { ...this.form, user_id: this.$root.user.user_id })
                    this.showSuccess(res.data.message || 'Department updated')
                } else {
                    const res = await axios.post('/api/admin/departments',
                        { ...this.form, user_id: this.$root.user.user_id })
                    this.showSuccess(res.data.message || 'Department created')
                }
                this.form = { id: null, name: '', description: '' }
                await this.fetch()
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to save department')
            } finally {
                this.saving = false
            }
        },
        confirmDel(id) {
            if (!confirm('Are you sure you want to delete this department?')) return
            this.del(id)
        },
        async del(id) {
            try {
                const res = await axios.delete(`/api/admin/departments/${id}`,
                    { data: { user_id: this.$root.user.user_id } })
                this.showSuccess(res.data.message || 'Department deleted')
                await this.fetch()
            } catch (err) {
                this.showError(err.response?.data?.error || 'Failed to delete department')
            }
        }
    }
})


app.component('payment-page', {
    template: `
    <div class="patient-shell">
        <patient-navbar></patient-navbar>
        <div class="patient-main d-flex justify-content-center">
            <div class="patient-section-card" style="max-width: 500px; width: 100%;">
                <h3 class="patient-page-title text-center">Secure Payment</h3>
                <p class="text-center text-muted">Complete your transaction for medical services</p>
                
                <div v-if="success" class="alert alert-success text-center">
                    Payment Successful! Redirecting...
                </div>

                <form @submit.prevent="processPayment" v-else>
                    <div class="mb-3">
                        <label class="form-label">Amount Due</label>
                        <input type="text" class="form-control" :value="'₹' + amount" readonly style="background:#f8fafc; font-weight:bold;">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Card Holder Name</label>
                        <input type="text" class="form-control" required placeholder="Name on card">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Card Number</label>
                        <input type="text" class="form-control" required placeholder="0000 0000 0000 0000" maxlength="19">
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Expiry Date</label>
                            <input type="text" class="form-control" required placeholder="MM/YY" maxlength="5">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">CVV</label>
                            <input type="password" class="form-control" required placeholder="***" maxlength="3">
                        </div>
                    </div>
                    <button class="patient-btn-primary w-100 py-2 mt-3" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        Pay Now
                    </button>
                    <button type="button" class="btn btn-link w-100 mt-2 text-decoration-none" @click="$root.currentView='history-page'">Cancel</button>
                </form>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            amount: Math.floor(Math.random() * (1500 - 500 + 1) + 500),
            loading: false,
            success: false
        }
    },
    methods: {
        processPayment() {
            this.loading = true
            setTimeout(() => {
                this.loading = false
                this.success = true
                setTimeout(() => {
                    this.$root.currentView = 'history-page'
                }, 2000)
            }, 1500)
        }
    }
})

app.mount('#app')

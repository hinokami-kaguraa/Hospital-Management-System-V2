// =============================================================
//  static/app.js  —  Sehat Saathi
// =============================================================

const app = Vue.createApp({
    data() {
        return {
            currentView : 'welcome-page',
            user        : null
        }
    },
    methods: {
        logout() {
            this.user        = null
            this.currentView = 'welcome-page'
        },
        goHome() {
            if (!this.user) { this.currentView = 'welcome-page'; return }
            const map = { admin: 'admin-dashboard', doctor: 'doctor-dashboard', patient: 'patient-dashboard' }
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

            <div class="auth-choice-divider"><span>or</span></div>

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
        </section>

        <!-- Creator -->
        <section class="creator-section">
            <p class="creator-label">Built with ❤️ by</p>
            <div class="creator-card">
                <div class="creator-photo-wrap">
                    <img
                        src="/static/images/creator.jpeg"
                        alt="Creator photo"
                        class="creator-photo"
                        onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=YOUR+NAME&background=1F456E&color=fff&size=200'"
                    />
                </div>
                <div class="creator-info">
                    <h4 class="creator-name">Krishna Kumari</h4>
                    <p class="creator-degree"> BS in Data Science and Applications </p>
                    <p class="creator-desc">
                        Passionate about building meaningful technology.
                        This project is part of the IIT Madras
                        Modern App Development (MAD2) course.
                    </p>
                    <div class="creator-links">
                        <a href="https://github.com/24F2005064" target="_blank" rel="noopener" class="creator-btn github">
                            <i class="bi bi-github me-2"></i>GitHub
                        </a>
                        <a href="www.linkedin.com/in/krishna-kumari-621902362" target="_blank" rel="noopener" class="creator-btn linkedin">
                            <i class="bi bi-linkedin me-2"></i>LinkedIn
                        </a>
                    </div>
                </div>
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
                    placeholder="you@example.com"
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
                <input v-model="name" class="form-control" placeholder="John Doe" />

                <label class="form-label">Email Address *</label>
                <input v-model="email" type="email" class="form-control" placeholder="you@example.com" />

                <label class="form-label">Phone Number</label>
                <input v-model="phone" class="form-control" placeholder="+91 9876543210" maxlength="15" />

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
                            placeholder="25"
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

/* Patient */
/* Patient Das5hboard */
app.component('patient-dashboard', {
    template: `
    <div>

        <div class="d-flex justify-content-between mb-3">
            <h3>Welcome {{ $root.user?.name }}</h3>

            <div>
                <button class="btn btn-link" @click="$root.currentView='edit-profile-page'">Edit Profile</button>
                <button class="btn btn-link" @click="$root.currentView='history-page'">History</button>
            </div>
        </div>

        <h5>Departments</h5>
        <div v-for="d in departments" class="border p-2 mb-2 d-flex justify-content-between">
            {{ d.name }}
            <button class="btn btn-sm btn-primary" @click="openDept(d)">View</button>
        </div>

        <h5 class="mt-4">Appointments</h5>
        <table class="table table-bordered" v-if="appointments.length">
            <tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
            </tr>

            <tr v-for="a in appointments">
                <td>{{ a.doctor_name }}</td>
                <td>{{ a.date }}</td>
                <td>{{ a.time }}</td>
                <td>{{ a.status }}</td>

                <td v-if="a.status==='Booked'">
                    <button class="btn btn-warning btn-sm me-1" @click="openReschedule(a)">Reschedule</button>
                    <button class="btn btn-danger btn-sm" @click="cancel(a.id)">Cancel</button>
                </td>
            </tr>
        </table>

        <div v-if="rescheduleMode" class="card p-3 mt-3">
            <h5>Reschedule</h5>
            <input type="date" v-model="form.date" class="form-control mb-2">
            <input type="text" v-model="form.slot" placeholder="10:00-10:30" class="form-control mb-2">

            <button class="btn btn-success" @click="confirmReschedule">Confirm</button>
        </div>

    </div>
    `,

    data() {
        return {
            departments: [],
            appointments: [],
            rescheduleMode: false,
            selected: null,
            form: { date: "", slot: "" }
        }
    },

    async mounted() {
        if (!this.$root.user) return this.$root.currentView = 'login-page'
        this.fetchDepartments()
        this.fetchAppointments()
    },

    methods: {
        async fetchDepartments() {
            const res = await axios.get('/api/departments')
            this.departments = res.data
        },

        async fetchAppointments() {
            const res = await axios.get(`/api/appointments/patient/${this.$root.user.user_id}`)
            this.appointments = res.data
        },

        openDept(d) {
            this.$root.selectedDepartment = d
            this.$root.currentView = 'department-page'
        },

        async cancel(id) {
            await axios.delete(`/api/appointment/${id}`, {
                data: { user_id: this.$root.user.user_id }
            })
            this.fetchAppointments()
        },

        openReschedule(a) {
            this.selected = a
            this.rescheduleMode = true
        },

        async confirmReschedule() {
            await axios.put(`/api/appointment/reschedule/${this.selected.id}`, {
                user_id: this.$root.user.user_id,
                date: this.form.date,
                slot: this.form.slot
            })

            this.rescheduleMode = false
            this.fetchAppointments()
        }
    }
})


/* Department Page */
app.component('department-page', {
    template: `
    <div>
        <h3>{{ $root.selectedDepartment.name }}</h3>
        <button class="btn btn-secondary mb-3" @click="$root.currentView='patient-dashboard'">Back</button>

        <div v-for="doc in doctors" class="border p-2 mb-2">
            Dr. {{ doc.name }}

            <button class="btn btn-sm btn-primary ms-2" @click="availability(doc)">Availability</button>
            <button class="btn btn-sm btn-outline-primary ms-2" @click="info(doc)">Info</button>
        </div>
    </div>
    `,

    data() {
        return { doctors: [] }
    },

    async mounted() {
        const res = await axios.get(`/api/doctors?department_id=${this.$root.selectedDepartment.id}`)
        this.doctors = res.data
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


/* Doctor Page */
app.component('doctor-page', {
    template: `
    <div>
        <h3>Dr. {{ doctor.name }}</h3>

        <button class="btn btn-secondary mb-3" @click="$root.currentView='department-page'">Back</button>

        <p>{{ doctor.specialization }}</p>
        <p>Fee: ₹{{ doctor.fee }}</p>

        <button class="btn btn-primary" @click="go">Book</button>
    </div>
    `,

    data() {
        return { doctor: {} }
    },

    async mounted() {
        const res = await axios.get(`/api/doctor/${this.$root.selectedDoctor.id}`)
        this.doctor = res.data
    },

    methods: {
        go() {
            this.$root.selectedDoctor = this.doctor
            this.$root.currentView = 'availability-page'
        }
    }
})


/* Availability (GRID) */
app.component('availability-page', {
    template: `
    <div>

        <h3>Select Slots</h3>

        <table class="table table-bordered text-center">
            <tr>
                <th>Date</th>
                <th v-for="s in slots">{{ s }}</th>
            </tr>

            <tr v-for="d in days">
                <td><b>{{ d }}</b></td>

                <td v-for="s in slots">
                    <div class="p-2"
                         :class="cls(d,s)"
                         @click="toggle(d,s)">
                        {{ s }}
                    </div>
                </td>
            </tr>
        </table>

        <button class="btn btn-success" @click="book">Book</button>

    </div>
    `,

    data() {
        return {
            days: [],
            slots: [],
            available: [],
            selected: []
        }
    },

    async mounted() {
        const res = await axios.get(`/api/doctor/availability/${this.$root.selectedDoctor.id}`)

        this.available = res.data.map(a => `${a.date}||${a.slot}`)
        this.days = [...new Set(res.data.map(a => a.date))]
        this.slots = [...new Set(res.data.map(a => a.slot))]
    },

    methods: {
        cls(d, s) {
            const k = `${d}||${s}`

            if (this.selected.includes(k)) return 'bg-primary text-white'
            if (this.available.includes(k)) return 'bg-success text-white'
            return 'bg-secondary text-white'
        },

        toggle(d, s) {
            const k = `${d}||${s}`

            if (!this.available.includes(k)) return

            if (this.selected.includes(k)) {
                this.selected = this.selected.filter(x => x !== k)
            } else {
                this.selected.push(k)
            }
        },

        async book() {
            await axios.post('/api/book', {
                doctor_id: this.$root.selectedDoctor.id,
                patient_id: this.$root.user.user_id,
                slots: this.selected
            })

            alert("Booked!")
            this.$root.currentView = 'patient-dashboard'
        }
    }
})


/* History */
app.component('history-page', {
    template: `
    <div>

        <h3>History</h3>

        <button class="btn btn-secondary mb-3"
                @click="$root.currentView='patient-dashboard'">
            Back
        </button>

        <div v-for="h in history" class="border p-2 mb-2">
            {{ h.date }} - {{ h.doctor_name }} - {{ h.diagnosis || '-' }}
        </div>

    </div>
    `,

    data() {
        return { history: [] }
    },

    async mounted() {
        const res = await axios.get(`/api/appointments/patient/${this.$root.user.user_id}`)
        this.history = res.data.filter(a => a.status === "Completed")
    }
})


/* Edit Profile (WORKS WITH BACKEND API I GAVE) */
app.component('edit-profile-page', {
    template: `
    <div>

        <h3>Edit Profile</h3>

        <input v-model="form.name" class="form-control mb-2">
        <input v-model="form.email" class="form-control mb-2">
        <input v-model="form.phone" class="form-control mb-2">

        <select v-model="form.gender" class="form-control mb-2">
            <option>Male</option>
            <option>Female</option>
        </select>

        <input v-model="form.age" type="number" class="form-control mb-2">

        <button class="btn btn-success" @click="save">Save</button>

    </div>
    `,

    data() {
        return { form: {} }
    },

    async mounted() {
        const res = await axios.get(`/api/patient/${this.$root.user.user_id}`)
        this.form = res.data
    },

    methods: {
        async save() {
            await axios.put(`/api/patient/${this.$root.user.user_id}`, this.form)
            alert("Updated")
            this.$root.currentView = 'patient-dashboard'
        }
    }
})

/* ================= DOCTOR ================= */

/* Doctor Dashboard */
app.component('doctor-dashboard', {
    template: `
    <div>

        <div class="d-flex justify-content-between mb-3">
            <h3>Dr. {{ $root.user.name }}</h3>

            <button class="btn btn-success"
                    @click="$root.currentView='doctor-availability'">
                Availability
            </button>
        </div>

        <h5>Appointments</h5>

        <table class="table table-bordered" v-if="appointments.length">
            <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Slot</th>
                <th>Status</th>
                <th>Action</th>
            </tr>

            <tr v-for="a in appointments">
                <td>{{ a.patient_name }}</td>
                <td>{{ a.date }}</td>
                <td>{{ a.slot }}</td>
                <td>{{ a.status }}</td>

                <td>
                    <button class="btn btn-info btn-sm me-1"
                            @click="viewHistory(a)">
                        History
                    </button>

                    <button class="btn btn-success btn-sm me-1"
                            @click="complete(a.id)">
                        Complete
                    </button>

                    <button class="btn btn-primary btn-sm"
                            @click="treatment(a)">
                        Treatment
                    </button>
                </td>
            </tr>
        </table>

        <p v-else>No appointments</p>

        <hr>

        <h5>Patients</h5>

        <div v-for="p in patients"
             class="border p-2 mb-2 d-flex justify-content-between">

            {{ p.name }}

            <button class="btn btn-outline-primary btn-sm"
                    @click="viewPatientHistory(p)">
                View History
            </button>
        </div>

    </div>
    `,

    data() {
        return {
            appointments: [],
            patients: []
        }
    },

    async mounted() {
        this.fetchAppointments()
    },

    methods: {

        async fetchAppointments() {
            const res = await axios.get(`/api/doctor/appointments/${this.$root.user.user_id}`)
            this.appointments = res.data

            // derive unique patients
            const map = {}
            res.data.forEach(a => {
                map[a.patient_id] = a.patient_name
            })

            this.patients = Object.keys(map).map(id => ({
                id,
                name: map[id]
            }))
        },

        async complete(id) {
            await axios.post(`/api/appointment/${id}/complete`, {
                user_id: this.$root.user.user_id
            })
            this.fetchAppointments()
        },

        treatment(a) {
            this.$root.selectedAppointment = a
            this.$root.currentView = 'treatment-page'
        },

        viewHistory(a) {
            this.$root.selectedPatientId = a.patient_id
            this.$root.currentView = 'doctor-history'
        },

        viewPatientHistory(p) {
            this.$root.selectedPatientId = p.id
            this.$root.currentView = 'doctor-history'
        }
    }
})


/* Doctor History */
app.component('doctor-history', {
    template: `
    <div>

        <h3>Patient History</h3>

        <button class="btn btn-secondary mb-3"
                @click="$root.currentView='doctor-dashboard'">
            Back
        </button>

        <div v-for="h in history"
             class="border p-2 mb-2">

            <b>{{ h.date }}</b> - {{ h.doctor_name }}

            <div>Diagnosis: {{ h.diagnosis || '-' }}</div>
            <div>Prescription: {{ h.prescription || '-' }}</div>

        </div>

        <p v-if="!history.length">No history found</p>

    </div>
    `,

    data() {
        return { history: [] }
    },

    async mounted() {
        const res = await axios.get(`/api/appointments/patient/${this.$root.selectedPatientId}`)
        this.history = res.data.filter(a => a.status === "Completed")
    }
})


/* Treatment */
app.component('treatment-page', {
    template: `
    <div>

        <h3>Treatment</h3>

        <textarea v-model="form.diagnosis"
                  placeholder="Diagnosis"
                  class="form-control mb-2"></textarea>

        <textarea v-model="form.prescription"
                  placeholder="Prescription"
                  class="form-control mb-2"></textarea>

        <textarea v-model="form.notes"
                  placeholder="Notes"
                  class="form-control mb-2"></textarea>

        <button class="btn btn-success" @click="save">Save</button>

        <button class="btn btn-secondary ms-2"
                @click="$root.currentView='doctor-dashboard'">
            Back
        </button>

    </div>
    `,

    data() {
        return {
            form: {
                diagnosis: '',
                prescription: '',
                notes: ''
            }
        }
    },

    async mounted() {
        const res = await axios.get(`/api/treatment/${this.$root.selectedAppointment.id}`)
        this.form.diagnosis = res.data.diagnosis || ''
    },

    methods: {
        async save() {
            await axios.post(`/api/treatment/${this.$root.selectedAppointment.id}`, {
                user_id: this.$root.user.user_id,
                diagnosis: this.form.diagnosis,
                prescription: this.form.prescription,
                notes: this.form.notes
            })

            alert("Saved")
            this.$root.currentView = 'doctor-dashboard'
        }
    }
})


/* Doctor Availability */
app.component('doctor-availability', {
    template: `
    <div>

        <h3>Set Availability</h3>

        <input type="date" v-model="date" class="form-control mb-2">
        <input type="text" v-model="slot"
               placeholder="10:00-10:30"
               class="form-control mb-2">

        <button class="btn btn-primary" @click="add">Add</button>

        <div v-for="a in list"
             class="border p-2 mt-2">
            {{ a.date }} || {{ a.slot }}
        </div>

        <button class="btn btn-secondary mt-3"
                @click="$root.currentView='doctor-dashboard'">
            Back
        </button>

    </div>
    `,

    data() {
        return {
            date: '',
            slot: '',
            list: []
        }
    },

    async mounted() {
        this.fetch()
    },

    methods: {
        async fetch() {
            const res = await axios.get(`/api/doctor/availability/${this.$root.user.user_id}`)
            this.list = res.data
        },

        async add() {
            await axios.post('/api/doctor/availability', {
                doctor_id: this.$root.user.user_id,
                date: this.date,
                slot: this.slot
            })

            this.fetch()
        }
    }
})

/* ================= ADMIN ================= */

/* Admin Dashboard */
app.component('admin-dashboard', {
    template: `
    <div>

        <div class="d-flex justify-content-between mb-3">
            <h3>Admin Dashboard</h3>

            <div>
                <button class="btn btn-success me-2" @click="$root.currentView='add-doctor'">Add Doctor</button>
                <button class="btn btn-info me-2" @click="$root.currentView='admin-departments'">Departments</button>
                <button class="btn btn-secondary me-2" @click="downloadCSV">Export CSV</button>
                <button class="btn btn-primary" @click="$root.currentView='admin-appointments'">Appointments</button>
            </div>
        </div>

        <div class="row mb-3">
            <div class="col-md-4" v-for="s in stats">
                <div class="card p-3 text-center">
                    <h5>{{ s.title }}</h5>
                    <h3>{{ s.value }}</h3>
                </div>
            </div>
        </div>

        <input v-model="search" class="form-control mb-3" placeholder="Search doctor">

        <div v-for="d in filteredDoctors" class="border p-2 mb-2 d-flex justify-content-between">
            {{ d.name }} ({{ d.specialization }})

            <div>
                <button class="btn btn-warning btn-sm me-1" @click="editDoctor(d)">Edit</button>
                <button class="btn btn-danger btn-sm me-1" @click="deleteDoctor(d.id)">Delete</button>
                <button class="btn btn-dark btn-sm" @click="toggleBlock(d)">
                    {{ d.is_blocked ? 'Unblock' : 'Block' }}
                </button>
            </div>
        </div>

    </div>
    `,

    data() {
        return {
            stats: [],
            doctors: [],
            search: ""
        }
    },

    computed: {
        filteredDoctors() {
            return this.doctors.filter(d =>
                (d.name || "").toLowerCase().includes(this.search.toLowerCase())
            )
        }
    },

    async mounted() {
        const res = await axios.get(`/api/admin/dashboard?user_id=${this.$root.user.user_id}`)

        this.stats = [
            { title: "Doctors", value: res.data.doctors },
            { title: "Patients", value: res.data.patients },
            { title: "Appointments", value: res.data.appointments }
        ]

        const docRes = await axios.get('/api/doctors')
        this.doctors = docRes.data
    },

    methods: {
        editDoctor(d) {
            this.$root.selectedDoctor = d
            this.$root.currentView = 'edit-doctor'
        },

        async deleteDoctor(id) {
            await axios.delete(`/api/admin/doctor/${id}`, {
                data: { user_id: this.$root.user.user_id }
            })
            location.reload()
        },

        async toggleBlock(d) {
            await axios.put(`/api/admin/doctor/block/${d.id}`, {
                user_id: this.$root.user.user_id
            })
            location.reload()
        },

        async downloadCSV() {
            const patientId = prompt("Enter patient ID")
            if (!patientId) return

            const res = await axios.get(
                `/api/admin/export/${patientId}?user_id=${this.$root.user.user_id}`
            )

            const taskId = res.data.task_id

            const interval = setInterval(async () => {
                const r = await axios.get(`/api/admin/export/result/${taskId}`)

                if (r.data.status !== "Pending") {
                    clearInterval(interval)
                    window.open(`/api/admin/export/result/${taskId}`)
                }
            }, 2000)
        }
    }
})


/* Add Doctor */
app.component('add-doctor', {
    template: `
    <div>

        <h3>Add Doctor</h3>

        <input v-model="form.name" class="form-control mb-2" placeholder="Name">
        <input v-model="form.email" class="form-control mb-2" placeholder="Email">
        <input v-model="form.phone" class="form-control mb-2" placeholder="Phone">

        <input v-model="form.password" type="password" class="form-control mb-2" placeholder="Password">
        <input v-model="form.specialization" class="form-control mb-2" placeholder="Specialization">

        <!-- 🔥 FILE UPLOAD -->
        <label>Upload Photo</label>
        <input type="file" @change="handleFile" class="form-control mb-2">

        <div v-if="preview">
            <img :src="preview" style="max-width:150px">
        </div>

        <button class="btn btn-success" @click="create">Create</button>
    </div>
    `,

    data() {
        return {
            form: {},
            file: null,
            preview: null
        }
    },

    methods: {

        handleFile(e) {
            this.file = e.target.files[0]
            this.preview = URL.createObjectURL(this.file)
        },

        async create() {

            const formData = new FormData()

            for (let key in this.form) {
                formData.append(key, this.form[key])
            }

            formData.append("user_id", this.$root.user.user_id)

            if (this.file) {
                formData.append("photo", this.file)
            }

            await axios.post('/api/admin/doctor', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            alert("Doctor created")
            this.$root.currentView = 'admin-dashboard'
        }
    }
})

/* Edit Doctor */
app.component('edit-doctor', {
    template: `
    <div>

        <h3>Edit Doctor</h3>

        <input v-model="doc.name" class="form-control mb-2">
        <input v-model="doc.specialization" class="form-control mb-2">
        <input v-model="doc.experience" class="form-control mb-2">
        <input v-model="doc.qualification" class="form-control mb-2">

        <button class="btn btn-success" @click="save">Save</button>
        <button class="btn btn-secondary ms-2" @click="$root.currentView='admin-dashboard'">Back</button>

    </div>
    `,

    data() {
        return { doc: {} }
    },

    mounted() {
        this.doc = { ...this.$root.selectedDoctor }
    },

    methods: {
        async save() {
            await axios.put(`/api/admin/doctor/${this.doc.id}`, {
                ...this.doc,
                user_id: this.$root.user.user_id
            })

            alert("Updated")
            this.$root.currentView = 'admin-dashboard'
        }
    }
})


/* Admin Appointments */
app.component('admin-appointments', {
    template: `
    <div>

        <h3>Appointments</h3>

        <table class="table table-bordered">
            <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Change</th>
            </tr>

            <tr v-for="a in appointments">
                <td>{{ a.patient_name }}</td>
                <td>{{ a.doctor_name }}</td>
                <td>{{ a.date }}</td>
                <td>{{ a.time }}</td>
                <td>{{ a.status }}</td>

                <td>
                    <select @change="update(a.id, $event)">
                        <option disabled selected>Change</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>
                </td>
            </tr>
        </table>

        <button class="btn btn-secondary" @click="$root.currentView='admin-dashboard'">Back</button>

    </div>
    `,

    data() {
        return { appointments: [] }
    },

    async mounted() {
        const res = await axios.get(`/api/admin/appointments?user_id=${this.$root.user.user_id}`)
        this.appointments = res.data
    },

    methods: {
        async update(id, e) {
            await axios.put(`/api/admin/appointment/${id}`, {
                user_id: this.$root.user.user_id,
                status: e.target.value
            })
            location.reload()
        }
    }
})


/* Departments */
app.component('admin-departments', {
    template: `
    <div>

        <h3>Departments</h3>

        <input v-model="form.name" class="form-control mb-2" placeholder="Name">
        <input v-model="form.description" class="form-control mb-2" placeholder="Description">

        <button class="btn btn-success mb-3" @click="save">Save</button>

        <div v-for="d in list" class="border p-2 mb-2">
            {{ d.name }}

            <button class="btn btn-warning btn-sm ms-2" @click="edit(d)">Edit</button>
            <button class="btn btn-danger btn-sm ms-2" @click="del(d.id)">Delete</button>
        </div>

        <button class="btn btn-secondary" @click="$root.currentView='admin-dashboard'">Back</button>

    </div>
    `,

    data() {
        return {
            list: [],
            form: { id: null, name: "", description: "" }
        }
    },

    async mounted() {
        this.fetch()
    },

    methods: {
        async fetch() {
            const res = await axios.get(`/api/admin/departments?user_id=${this.$root.user.user_id}`)
            this.list = res.data
        },

        edit(d) {
            this.form = { ...d }
        },

        async save() {
            if (this.form.id) {
                await axios.put(`/api/admin/departments/${this.form.id}`, {
                    ...this.form,
                    user_id: this.$root.user.user_id
                })
            } else {
                await axios.post('/api/admin/departments', {
                    ...this.form,
                    user_id: this.$root.user.user_id
                })
            }

            this.form = { id: null, name: "", description: "" }
            this.fetch()
        },

        async del(id) {
            await axios.delete(`/api/admin/departments/${id}`, {
                data: { user_id: this.$root.user.user_id }
            })
            this.fetch()
        }
    }
})

app.mount('#app')
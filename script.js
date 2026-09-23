// ==========================================
// STEP 1: DOM Elements Select Kyia
// ==========================================

const jobForm = document.getElementById('job-form');
const companyInput = document.getElementById('company');
const roleInput = document.getElementById('role');
const statusSelect = document.getElementById('status');
const notesInput = document.getElementById('notes');
const submitBtn = document.querySelector('#addBtn button');

const cardsContainer = document.getElementById('application-cards');

// Search & Filter Elements
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');

// Counters Elements
const totalCount = document.getElementById('total-count');
const appliedCount = document.getElementById('applied-count');
const interviewCount = document.getElementById('interview-count');
const offerCount = document.getElementById('offer-count');
const rejectedCount = document.getElementById('rejected-count');

// ==========================================
// STEP 2: State Management
// ==========================================

let applications = JSON.parse(localStorage.getItem('jobApplications')) || [];
let currentStatusFilter = 'All';
let currentSearchQuery = '';
let editId = null; // Track karne ke liye ki Edit chal rha hai ya Naya Add ho rha hai

// ==========================================
// STEP 3: Counter Update Function
// ==========================================

function updateStats() {
    totalCount.textContent = applications.length;
    appliedCount.textContent = applications.filter(app => app.status === 'Applied').length;
    interviewCount.textContent = applications.filter(app => app.status === 'Interview').length;
    offerCount.textContent = applications.filter(app => app.status === 'Offer').length;
    rejectedCount.textContent = applications.filter(app => app.status === 'Rejected').length;
}

// ==========================================
// STEP 4: Render Cards (Combined Search + Filter)
// ==========================================

function renderApplications() {
    cardsContainer.innerHTML = '';

    const filteredApps = applications.filter(app => {
        const matchesStatus = (currentStatusFilter === 'All') || (app.status === currentStatusFilter);
        const matchesSearch = app.company.toLowerCase().includes(currentSearchQuery) ||
            app.role.toLowerCase().includes(currentSearchQuery);

        return matchesStatus && matchesSearch;
    });

    if (filteredApps.length === 0) {
        cardsContainer.innerHTML = `<p style="color: #94a3b8; text-align: center; grid-column: 1/-1;">No applications found.</p>`;
    } else {
        filteredApps.forEach(app => {
            const card = document.createElement('div');
            card.classList.add('job-card');

            const statusClass = app.status.toLowerCase();

            card.innerHTML = `
                <h3>${app.company}</h3>
                <p class="role">${app.role}</p>
                <span class="status-badge ${statusClass}">${app.status}</span>
                <p class="date">${app.date}</p>
                ${app.notes ? `<p class="notes" style="font-size: 0.8rem; color: #94a3b8; margin-top: 6px;">📝 ${app.notes}</p>` : ''}
                <div class="card-actions">
                    <button type="button" class="edit-btn" onclick="editApplication(${app.id})">Edit</button>
                    <button type="button" class="delete-btn" onclick="deleteApplication(${app.id})">Delete</button>
                </div>
            `;

            cardsContainer.appendChild(card);
        });
    }

    localStorage.setItem('jobApplications', JSON.stringify(applications));
    updateStats();
}

// ==========================================
// STEP 5: Form Submission Handle (Add + Update)
// ==========================================

// ==========================================
// STEP 5: Form Submission Handle (With Loading/Processing Effect)
// ==========================================

jobForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // 1. Visual Loading State ON karo
    jobForm.classList.add('processing');
    submitBtn.disabled = true;
    submitBtn.textContent = editId !== null ? 'Updating...' : 'Adding Application...';

    // 2. Simulated Server Delay (600ms) - taaki realistic submit/process mehsoos ho
    setTimeout(() => {
        if (editId !== null) {
            // UPDATE MODE: Existing application edit karna
            applications = applications.map(app => {
                if (app.id === editId) {
                    return {
                        ...app,
                        company: companyInput.value,
                        role: roleInput.value,
                        status: statusSelect.value,
                        notes: notesInput.value
                    };
                }
                return app;
            });

            // Reset Edit state
            editId = null;
        } else {
            // ADD MODE: Nayi application create karna
            const today = new Date();
            const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const newApplication = {
                id: Date.now(),
                company: companyInput.value,
                role: roleInput.value,
                status: statusSelect.value,
                notes: notesInput.value,
                date: formattedDate
            };

            applications.push(newApplication);
        }

        // 3. Data render karo aur form clear karo
        renderApplications();
        jobForm.reset();

        // 4. Loading State OFF karo
        jobForm.classList.remove('processing');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Application';

    }, 600); // 600ms delay (0.6 seconds)
});


// ==========================================
// STEP 6: Edit Application Function
// ==========================================

function editApplication(id) {
    const appToEdit = applications.find(app => app.id === id);
    if (!appToEdit) return;

    // Form me details fill karna
    companyInput.value = appToEdit.company;
    roleInput.value = appToEdit.role;
    statusSelect.value = appToEdit.status;
    notesInput.value = appToEdit.notes || '';

    // State update
    editId = id;
    submitBtn.textContent = 'Update Application';

    // Smooth scroll to form
    jobForm.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// STEP 7: Search & Filter Event Listeners
// ==========================================

searchInput.addEventListener('input', function (e) {
    currentSearchQuery = e.target.value.toLowerCase().trim();
    renderApplications();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        currentStatusFilter = this.getAttribute('data-filter');
        renderApplications();
    });
});

// ==========================================
// STEP 8: Delete Application
// ==========================================

function deleteApplication(id) {
    // Agar wahi card edit mode me tha aur use delete kar diya, toh reset karo
    if (editId === id) {
        editId = null;
        submitBtn.textContent = 'Add Application';
        jobForm.reset();
    }

    applications = applications.filter(app => app.id !== id);
    renderApplications();
}

// Initial Call
renderApplications();
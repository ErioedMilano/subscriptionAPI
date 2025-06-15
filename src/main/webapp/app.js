document.addEventListener('DOMContentLoaded', () => {
    // API endpoints
    const API_BASE = 'http://localhost:7070/api/subscriptions';
    const AUTH_API = 'http://localhost:7070/api/auth';

    // DOM elements
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const logoutBtn = document.getElementById('logoutBtn');
    const loggedInUser = document.getElementById('loggedInUser');
    const fetchSubscriptionsBtn = document.getElementById('fetchSubscriptionsButton');
    const filterInput = document.getElementById('filterInput');
    const subscriptionForm = document.getElementById('subscriptionRegistration');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editBanner = document.getElementById('editBanner');
    const themeToggle = document.getElementById('themeToggle');

    // State
    let editId = null;
    let isSubmitting = false;
    let subscriptionChart = null;
    let isDarkMode = localStorage.getItem('darkMode') === 'true';

    // Apply theme on load
    applyTheme();

    // Theme toggle event
    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('darkMode', isDarkMode);
        applyTheme();
    });

    function applyTheme() {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }

        // Update grafiek voor themawisseling
        updateChartTheme();
    }

    // Check if user is already logged in
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    }

    // Event Listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    fetchSubscriptionsBtn.addEventListener('click', () => getAllSubscriptions(filterInput.value));
    subscriptionForm.addEventListener('submit', handleFormSubmit);
    subscriptionForm.addEventListener('reset', resetFormState);
    cancelEditBtn.addEventListener('click', resetFormState);
    filterInput.addEventListener('input', () => getAllSubscriptions(filterInput.value));

    // Functions
    function showLoader(show) {
        const loader = document.createElement('div');
        loader.className = 'fullscreen-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;

        if (show) {
            document.body.appendChild(loader);
        } else {
            const existingLoader = document.querySelector('.fullscreen-loader');
            if (existingLoader) {
                existingLoader.remove();
            }
        }
    }

    async function parseResponse(response) {
        const text = await response.text();
        try {
            return text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('Failed to parse JSON:', text);
            throw new Error('Invalid server response');
        }
    }

    function handleLogin(e) {
        e.preventDefault();
        loginError.style.display = 'none';

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showLoginError('Please enter both username and password');
            return;
        }

        showLoader(true);

        fetch(`${AUTH_API}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(async response => {
                const data = await parseResponse(response);

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username);
                showDashboard();
            })
            .catch(error => {
                console.error('Login error:', error);
                showLoginError(error.message || 'An error occurred during login');
            })
            .finally(() => showLoader(false));
    }

    function showLoginError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        usernameInput.focus();
    }

    function handleLogout() {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('username');
        loginSection.style.display = 'flex';
        dashboardSection.style.display = 'none';
        loginForm.reset();
    }

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        loggedInUser.textContent = `Welcome, ${sessionStorage.getItem('username') || 'Admin'}`;

        // Initialize dashboard
        getAllSubscriptions();
        loadAdminStats();
    }

    function loadAdminStats() {
        showLoader(true);
        fetch(`${API_BASE}/stats`)
            .then(async response => {
                const data = await parseResponse(response);

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to load stats');
                }

                document.getElementById('totalSubscriptions').textContent = data.totalUsers || 0;
                document.getElementById('liteCount').textContent = data.liteCount || 0;
                document.getElementById('basicCount').textContent = data.basicCount || 0;
                document.getElementById('superCount').textContent = data.superCount || 0;

                // Update chart if exists
                if (subscriptionChart) {
                    updateChart(data);
                } else {
                    createChart(data);
                }
            })
            .catch(error => {
                console.error('Error loading stats:', error);
            })
            .finally(() => showLoader(false));
    }

    function getChartOptions() {
        const isDarkMode = document.body.classList.contains('dark-mode');

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14,
                            family: "'Inter', sans-serif"
                        },
                        padding: 20,
                        color: isDarkMode ? '#e2e8f0' : '#333'
                    }
                },
                tooltip: {
                    backgroundColor: isDarkMode ? '#1e293b' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: isDarkMode ? '#e2e8f0' : '#333',
                    bodyColor: isDarkMode ? '#e2e8f0' : '#333',
                    borderColor: isDarkMode ? '#334155' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 8,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw} subscriptions`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            },
            cutout: '65%'
        };
    }

    function updateChartTheme() {
        if (subscriptionChart) {
            subscriptionChart.options = getChartOptions();
            subscriptionChart.update();
        }
    }

    function createChart(stats) {
        const ctx = document.getElementById('subscriptionChart').getContext('2d');
        const options = getChartOptions();

        subscriptionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Lite', 'Basic', 'Super'],
                datasets: [{
                    data: [stats.liteCount || 0, stats.basicCount || 0, stats.superCount || 0],
                    backgroundColor: [
                        'rgba(67, 97, 238, 0.7)',
                        'rgba(72, 149, 239, 0.7)',
                        'rgba(63, 55, 201, 0.7)'
                    ],
                    borderColor: [
                        'rgba(67, 97, 238, 1)',
                        'rgba(72, 149, 239, 1)',
                        'rgba(63, 55, 201, 1)'
                    ],
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: options
        });
    }

    function updateChart(stats) {
        subscriptionChart.data.datasets[0].data = [
            stats.liteCount || 0,
            stats.basicCount || 0,
            stats.superCount || 0
        ];
        subscriptionChart.update();
    }

    function getAllSubscriptions(filter = '') {
        showLoader(true);
        const subscriptionsDiv = document.getElementById('subscriptions');
        const userManagementDiv = document.getElementById('userManagement');

        fetch(API_BASE)
            .then(async response => {
                const data = await parseResponse(response);

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch subscriptions');
                }

                let subscriptions = Array.isArray(data) ? data : [];

                if (filter) {
                    const f = filter.toLowerCase();
                    subscriptions = subscriptions.filter(sub =>
                        (sub.firstname && sub.firstname.toLowerCase().includes(f)) ||
                        (sub.lastname && sub.lastname.toLowerCase().includes(f)) ||
                        (sub.email && sub.email.toLowerCase().includes(f)) ||
                        (sub.phonenumber && sub.phonenumber.toLowerCase().includes(f))
                    );
                }

                renderSubscriptionsTable(subscriptions);
                renderUserManagementTable(subscriptions);
            })
            .catch(error => {
                subscriptionsDiv.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        ${error.message}
                    </div>
                `;
                userManagementDiv.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        ${error.message}
                    </div>
                `;
            })
            .finally(() => showLoader(false));
    }

    function renderSubscriptionsTable(subscriptions) {
        const subscriptionsDiv = document.getElementById('subscriptions');

        if (!Array.isArray(subscriptions)) {
            subscriptionsDiv.innerHTML = '<div class="no-data">No data available</div>';
            return;
        }

        if (subscriptions.length === 0) {
            subscriptionsDiv.innerHTML = '<div class="no-data">No subscriptions found</div>';
            return;
        }

        let tableHTML = `
            <table class="subscriptions-table">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Type</th>
                        <th>Channels</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        subscriptions.forEach(sub => {
            const services = sub.services ? sub.services.split(',').map(s => s.trim()).filter(Boolean).join(', ') : '';
            tableHTML += `
                <tr>
                    <td>${sub.firstname || '-'}</td>
                    <td>${sub.lastname || '-'}</td>
                    <td>${sub.email || '-'}</td>
                    <td>${sub.phonenumber || '-'}</td>
                    <td>${sub.subscription || '-'}</td>
                    <td>${services || '-'}</td>
                    <td class="action-cell">
                        <button class="action-btn edit-btn" data-id="${sub.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${sub.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        subscriptionsDiv.innerHTML = tableHTML;

        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => handleEdit(btn.dataset.id, subscriptions));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => handleDelete(btn.dataset.id));
        });
    }

    function renderUserManagementTable(subscriptions) {
        const userManagementDiv = document.getElementById('userManagement');

        if (!Array.isArray(subscriptions)) {
            userManagementDiv.innerHTML = '<div class="no-data">No data available</div>';
            return;
        }

        if (subscriptions.length === 0) {
            userManagementDiv.innerHTML = '<div class="no-data">No users found</div>';
            return;
        }

        let tableHTML = `
            <table class="subscriptions-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subscription</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        subscriptions.forEach(sub => {
            const statusClass = sub.status === 'Active' ? 'status-active' :
                sub.status === 'Inactive' ? 'status-inactive' : 'status-pending';

            tableHTML += `
                <tr>
                    <td>${sub.firstname || '-'} ${sub.lastname || '-'}</td>
                    <td>${sub.email || '-'}</td>
                    <td>${sub.subscription || '-'}</td>
                    <td><span class="status-badge ${statusClass}">${sub.status || '-'}</span></td>
                    <td class="action-cell">
                        ${sub.status !== 'Active' ? `
                            <button class="action-btn activate-btn" data-id="${sub.id}" title="Activate">
                                <i class="fas fa-check-circle"></i>
                            </button>
                        ` : ''}
                        
                        ${sub.status !== 'Inactive' ? `
                            <button class="action-btn deactivate-btn" data-id="${sub.id}" title="Deactivate">
                                <i class="fas fa-ban"></i>
                            </button>
                        ` : ''}
                        
                        <button class="action-btn delete-btn" data-id="${sub.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        userManagementDiv.innerHTML = tableHTML;

        // Event listeners for buttons
        document.querySelectorAll('.activate-btn').forEach(btn => {
            btn.addEventListener('click', () => handleStatusUpdate(btn.dataset.id, 'Active'));
        });

        document.querySelectorAll('.deactivate-btn').forEach(btn => {
            btn.addEventListener('click', () => handleStatusUpdate(btn.dataset.id, 'Inactive'));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => handleDelete(btn.dataset.id));
        });
    }

    function handleStatusUpdate(id, status) {
        if (!confirm(`Are you sure you want to set this subscription to ${status}?`)) return;

        showLoader(true);

        fetch(`${API_BASE}/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ status })
        })
            .then(async response => {
                const data = await parseResponse(response);

                if (!response.ok) {
                    throw new Error(data.message || `Failed to update status to ${status}`);
                }

                alert(`Subscription status updated to ${status} successfully!`);
                getAllSubscriptions(filterInput.value);
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.message || `Error updating status to ${status}`);
            })
            .finally(() => showLoader(false));
    }

    function handleEdit(id, subscriptions) {
        const sub = subscriptions.find(s => s.id == id);
        if (!sub) return;

        // Fill form with subscription data
        document.getElementById('firstname').value = sub.firstname || '';
        document.getElementById('lastname').value = sub.lastname || '';
        document.getElementById('email').value = sub.email || '';
        document.getElementById('phonenumber').value = sub.phonenumber || '';

        // Set subscription type
        if (sub.subscription) {
            const radio = document.querySelector(`input[name="subscription"][value="${sub.subscription}"]`);
            if (radio) radio.checked = true;
        }

        // Set services checkboxes
        document.querySelectorAll('input[name="services"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        if (sub.services) {
            sub.services.split(',').forEach(val => {
                const cb = document.querySelector(`input[name="services"][value="${val.trim()}"]`);
                if (cb) cb.checked = true;
            });
        }

        // Update form state
        editId = id;
        editBanner.style.display = 'flex';
        subscriptionForm.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Update';
        cancelEditBtn.style.display = 'inline-block';

        // Scroll to form
        subscriptionForm.scrollIntoView({ behavior: 'smooth' });
    }

    function handleDelete(id) {
        if (!confirm('Are you sure you want to delete this subscription?')) return;

        showLoader(true);
        fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        })
            .then(async response => {
                const data = await parseResponse(response);

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to delete subscription');
                }

                alert('Subscription deleted successfully!');
                getAllSubscriptions(filterInput.value);
                loadAdminStats();
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.message || 'Error deleting subscription');
            })
            .finally(() => showLoader(false));
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        if (isSubmitting) return;

        // Validate form
        const fields = ['firstname', 'lastname', 'email', 'phonenumber'];
        let isValid = true;

        // Clear previous validations
        fields.forEach(field => {
            document.getElementById(`${field}-validation`).style.display = 'none';
        });
        // Check required fields
        fields.forEach(field => {
            const input = document.getElementById(field);
            const validation = document.getElementById(`${field}-validation`);

            if (!input.value.trim()) {
                validation.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
                validation.style.display = 'block';
                isValid = false;
            } else if (field === 'email' && !/^\S+@\S+\.\S+$/.test(input.value)) {
                validation.textContent = 'Please enter a valid email address';
                validation.style.display = 'block';
                isValid = false;
            }
        });

        // Check subscription type is selected
        const subscriptionType = document.querySelector('input[name="subscription"]:checked');
        if (!subscriptionType) {
            alert('Please select a subscription type');
            isValid = false;
        }

        if (!isValid) return;

        isSubmitting = true;
        const submitBtn = subscriptionForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Get selected services
        const selectedServices = Array.from(document.querySelectorAll('input[name="services"]:checked'))
            .map(checkbox => checkbox.value);

        // Prepare data with null checks
        const data = {
            firstname: document.getElementById('firstname').value.trim(),
            lastname: document.getElementById('lastname').value.trim(),
            email: document.getElementById('email').value.trim(),
            phonenumber: document.getElementById('phonenumber').value.trim(),
            subscription: subscriptionType.value,
            services: selectedServices.join(',') || '' // Ensure empty string instead of null
        };

        // Validate again before sending
        if (!data.email) {
            alert('Email is required');
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }

        console.log('Submitting data:', data);

        // Determine endpoint and method
        const url = editId ? `${API_BASE}/${editId}` : API_BASE;
        const method = editId ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(async response => {
                const text = await response.text();
                let responseData = {};

                try {
                    responseData = text ? JSON.parse(text) : {};
                } catch (e) {
                    console.error('Failed to parse JSON:', text);
                    throw new Error('Invalid server response');
                }

                console.log('API response:', responseData);

                if (!response.ok) {
                    if (responseData.errors) {
                        return Promise.reject({ errors: responseData.errors });
                    }
                    throw new Error(responseData.message || `Server error: ${response.status}`);
                }

                const message = editId ? 'Subscription updated successfully!' : 'Subscription created successfully!';
                alert(message);

                resetFormState();
                getAllSubscriptions(filterInput.value);
                loadAdminStats();
            })
            .catch(error => {
                console.error('Form submission error:', error);

                if (error.errors) {
                    Object.keys(error.errors).forEach(field => {
                        const validationMessage = document.getElementById(`${field}-validation`);
                        if (validationMessage) {
                            validationMessage.textContent = error.errors[field];
                            validationMessage.style.display = 'block';
                        }
                    });
                } else {
                    alert(error.message || 'Server error. Please check your input and try again.');
                }
            })
            .finally(() => {
                isSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            });
    }

    function resetFormState() {
        editId = null;
        editBanner.style.display = 'none';

        // Reset submit button
        const submitBtn = subscriptionForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Register';
        submitBtn.disabled = false;

        // Hide cancel button
        cancelEditBtn.style.display = 'none';

        // Reset form
        subscriptionForm.reset();

        // Clear validation messages
        document.querySelectorAll('.validation-message').forEach(el => {
            el.style.display = 'none';
        });

        // Reset radio buttons
        document.querySelectorAll('input[name="subscription"]').forEach(radio => {
            radio.checked = false;
        });

        // Reset checkboxes
        document.querySelectorAll('input[name="services"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }
});
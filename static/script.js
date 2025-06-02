// Update dashboard stats
async function updateDashboardStats() {
    try {
        const response = await fetch('/api/system_stats');
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        document.getElementById('current-count').textContent = data.current_count;
        document.getElementById('today-revenue').textContent = `${data.today_revenue.toLocaleString()} RWF`;
        document.getElementById('recent-alerts').textContent = data.recent_alerts;

        // Update alert badge
        const alertBadge = document.querySelector('.alert-badge');
        if (data.recent_alerts > 0) {
            alertBadge.textContent = data.recent_alerts;
            alertBadge.classList.remove('d-none');
        } else {
            alertBadge.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Load activity table
async function loadActivityTable() {
    try {
        const response = await fetch('/api/all_logs');
        if (!response.ok) throw new Error('Network response was not ok');

        const logs = await response.json();
        const tableBody = document.querySelector('#activity-table tbody');

        tableBody.innerHTML = '';

        logs.slice(0, 10).forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.plate}</td>
                <td>${log.timestamp}</td>
                <td>${log.event_type === 'exit' ? log.timestamp : '-'}</td>
                <td>${log.event_type}</td>
                <td>${log.event_type === 'payment' ? 'Paid' : '-'}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading activity:', error);
        const tableBody = document.querySelector('#activity-table tbody');
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading data</td></tr>';
    }
}

// Load logs table
async function loadLogsTable() {
    try {
        const tableBody = document.querySelector('#logs-table tbody');
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';

        const response = await fetch('/api/all_logs');
        if (!response.ok) throw new Error('Network response was not ok');

        const logs = await response.json();
        tableBody.innerHTML = '';

        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.timestamp}</td>
                <td>${log.plate}</td>
                <td>${log.event_type}</td>
                <td>${log.details}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading logs:', error);
        const tableBody = document.querySelector('#logs-table tbody');
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading data</td></tr>';
    }
}

// Load alerts table
async function loadAlertsTable() {
    try {
        const tableBody = document.querySelector('#alerts-table tbody');
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';

        const response = await fetch('/api/all_alerts');
        if (!response.ok) throw new Error('Network response was not ok');

        const alerts = await response.json();
        tableBody.innerHTML = '';

        alerts.forEach(alert => {
            const row = document.createElement('tr');
            row.classList.add('alert-row');
            row.innerHTML = `
                <td>${alert.timestamp}</td>
                <td>${alert.plate}</td>
                <td>${alert.alert_type}</td>
                <td>${alert.details}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading alerts:', error);
        const tableBody = document.querySelector('#alerts-table tbody');
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading data</td></tr>';
    }
}
// Add these new functions to your existing script.js
async function loadCharts() {
    try {
        const response = await fetch('/api/chart_data');
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Revenue chart
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: data.revenue_data.map(item => item.day),
                datasets: [{
                    label: 'Daily Revenue (RWF)',
                    data: data.revenue_data.map(item => item.revenue),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Activity chart
        const activityCtx = document.getElementById('activityChart').getContext('2d');
        new Chart(activityCtx, {
            type: 'doughnut',
            data: {
                labels: ['Entries', 'Exits'],
                datasets: [{
                    data: [data.today_activity.entries, data.today_activity.exits],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 99, 132, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

// Update initializePage function to include loadCharts
function initializePage() {
    if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
        updateDashboardStats();
        loadActivityTable();
        loadCharts(); // Add this line
    } else if (window.location.pathname === '/logs') {
        loadLogsTable();
    } else if (window.location.pathname === '/alerts') {
        loadAlertsTable();
    }
}

// Initialize page content based on current route
//function initializePage() {
//    if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
//        updateDashboardStats();
//        loadActivityTable();
//    } else if (window.location.pathname === '/logs') {
//        loadLogsTable();
//    } else if (window.location.pathname === '/alerts') {
//        loadAlertsTable();
//    }
//}

// Set up auto-refresh
function setupAutoRefresh() {
    setInterval(() => {
        if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
            updateDashboardStats();
        }
    }, 5000); // Refresh every 5 seconds
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupAutoRefresh();

    // Improved navigation event listener
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Only handle if it's a navigation link (not a button inside the link)
            if (this.classList.contains('nav-link')) {
                e.preventDefault();
                const href = this.getAttribute('href');
                window.history.pushState({}, '', href);
                initializePage();

                // Update active state
                document.querySelectorAll('.nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
});

// Handle back/forward navigation
window.addEventListener('popstate', initializePage);

// Update active nav link on page load
function updateActiveNav() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Call this on initial load
document.addEventListener('DOMContentLoaded', updateActiveNav);
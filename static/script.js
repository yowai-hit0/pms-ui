// Update dashboard stats
async function updateDashboardStats() {
    try {
        const response = await fetch('/api/system_stats');
        const data = await response.json();

        document.getElementById('current-count').textContent = data.current_count;
        document.getElementById('today-revenue').textContent = `${data.today_revenue} RWF`;
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

// Load logs table
async function loadLogsTable() {
    try {
        const response = await fetch('/api/all_logs');
        const logs = await response.json();

        const tableBody = document.querySelector('#logs-table tbody');
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
    }
}

// Load alerts table
async function loadAlertsTable() {
    try {
        const response = await fetch('/api/all_alerts');
        const alerts = await response.json();

        const tableBody = document.querySelector('#alerts-table tbody');
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
    }
}

// Initialize page content based on current route
function initializePage() {
    if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
        updateDashboardStats();
    } else if (window.location.pathname === '/logs') {
        loadLogsTable();
    } else if (window.location.pathname === '/alerts') {
        loadAlertsTable();
    }
}

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

    // Set up navigation event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.pushState({}, '', e.target.href);
            initializePage();
        });
    });
});

// Handle back/forward navigation
window.addEventListener('popstate', initializePage);


// // Update logs data
// function updateLogs() {
//     fetch('/api/recent_logs')
//         .then(response => response.json())
//         .then(data => {
//             const tableBody = document.querySelector('#logs-table tbody');
//             tableBody.innerHTML = '';
//
//             data.forEach(log => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td>${log.timestamp}</td>
//                     <td>${log.plate || '-'}</td>
//                     <td>${log.event_type}</td>
//                     <td>${log.details}</td>
//                 `;
//                 tableBody.appendChild(row);
//             });
//         });
// }
//
// // Update alerts data
// function updateAlerts() {
//     fetch('/api/recent_alerts')
//         .then(response => response.json())
//         .then(data => {
//             const tableBody = document.querySelector('#alerts-table tbody');
//             tableBody.innerHTML = '';
//
//             data.forEach(alert => {
//                 const row = document.createElement('tr');
//                 row.classList.add('table-warning');
//
//                 row.innerHTML = `
//                     <td>${alert.timestamp}</td>
//                     <td>${alert.plate || '-'}</td>
//                     <td>${alert.alert_type}</td>
//                     <td>${alert.details}</td>
//                 `;
//                 tableBody.appendChild(row);
//             });
//         });
// }
//
// // Update data based on current page
// function updateData() {
//     if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
//         updateDashboard();
//     } else if (window.location.pathname === '/logs') {
//         updateLogs();
//     } else if (window.location.pathname === '/alerts') {
//         updateAlerts();
//     }
// }
//
// // Update data every 5 seconds
// setInterval(updateData, 5000);
//
// // Initial data load
// document.addEventListener('DOMContentLoaded', updateData);
// Update dashboard data
function updateDashboard() {
    fetch('/api/recent_activity')
        .then(response => response.json())
        .then(data => {
            // Update current count and revenue
            document.getElementById('current-count').textContent = data.current_count;
            document.getElementById('today-revenue').textContent = `${data.today_revenue} RWF`;

            // Update activity table
            const tableBody = document.querySelector('#activity-table tbody');
            tableBody.innerHTML = '';

            data.activities.forEach(activity => {
                const row = document.createElement('tr');

                if (activity.payment_status === 'Unpaid' && activity.exit_time) {
                    row.classList.add('table-danger');
                }

                row.innerHTML = `
                    <td>${activity.plate}</td>
                    <td>${activity.entry_time || '-'}</td>
                    <td>${activity.exit_time || '-'}</td>
                    <td>${activity.payment_status}</td>
                    <td>${activity.amount}</td>
                `;

                tableBody.appendChild(row);
            });
        });
}

// Update logs data
function updateLogs() {
    fetch('/api/recent_logs')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#logs-table tbody');
            tableBody.innerHTML = '';

            data.forEach(log => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${log.timestamp}</td>
                    <td>${log.plate || '-'}</td>
                    <td>${log.event_type}</td>
                    <td>${log.details}</td>
                `;
                tableBody.appendChild(row);
            });
        });
}

// Update alerts data
function updateAlerts() {
    fetch('/api/recent_alerts')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#alerts-table tbody');
            tableBody.innerHTML = '';

            data.forEach(alert => {
                const row = document.createElement('tr');
                row.classList.add('table-warning');

                row.innerHTML = `
                    <td>${alert.timestamp}</td>
                    <td>${alert.plate || '-'}</td>
                    <td>${alert.alert_type}</td>
                    <td>${alert.details}</td>
                `;
                tableBody.appendChild(row);
            });
        });
}

// Update data based on current page
function updateData() {
    if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
        updateDashboard();
    } else if (window.location.pathname === '/logs') {
        updateLogs();
    } else if (window.location.pathname === '/alerts') {
        updateAlerts();
    }
}

// Update data every 5 seconds
setInterval(updateData, 5000);

// Initial data load
document.addEventListener('DOMContentLoaded', updateData);
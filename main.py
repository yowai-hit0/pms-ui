from flask import Flask, render_template, jsonify
import psycopg2
from datetime import datetime, timedelta

app = Flask(__name__)

# Database configuration
DB_CONFIG = {
    'dbname': 'parking_db',
    'user': 'postgres',
    'password': 'gomgom1029',
    'host': 'localhost'
}


def get_db_connection():
    conn = psycopg2.connect(**DB_CONFIG)
    return conn


@app.route('/')
def dashboard():
    return render_template('dashboard.html')


@app.route('/logs')
def logs():
    return render_template('logs.html')


@app.route('/alerts')
def alerts():
    return render_template('alerts.html')


# API endpoints for data
@app.route('/api/recent_activity')
def recent_activity():
    conn = get_db_connection()
    cur = conn.cursor()

    # Get last 10 entries/exits
    cur.execute("""
                SELECT id, plate_number, entry_time, exit_time, payment_status, amount
                FROM plates_log
                ORDER BY COALESCE(exit_time, entry_time) DESC LIMIT 10
                """)
    activities = []
    for record in cur.fetchall():
        activities.append({
            'id': record[0],
            'plate': record[1],
            'entry_time': record[2].strftime('%Y-%m-%d %H:%M:%S') if record[2] else None,
            'exit_time': record[3].strftime('%Y-%m-%d %H:%M:%S') if record[3] else None,
            'payment_status': 'Paid' if record[4] == 1 else 'Unpaid',
            'amount': record[5] or 0
        })

    # Get current parking count
    cur.execute("""
                SELECT COUNT(*)
                FROM plates_log
                WHERE exit_time IS NULL
                """)
    current_count = cur.fetchone()[0]

    # Get today's revenue
    cur.execute("""
                SELECT COALESCE(SUM(amount), 0)
                FROM plates_log
                WHERE payment_status = 1
                  AND exit_time >= %s
                """, (datetime.now().date(),))
    today_revenue = cur.fetchone()[0]

    cur.close()
    conn.close()

    return jsonify({
        'activities': activities,
        'current_count': current_count,
        'today_revenue': today_revenue
    })


@app.route('/api/recent_logs')
def recent_logs():
    conn = get_db_connection()
    cur = conn.cursor()

    # Get last 50 system events (you would need to create this table)
    cur.execute("""
                SELECT timestamp, plate_number, event_type, details
                FROM system_logsp
                ORDER BY timestamp DESC
                    LIMIT 50
                """)

    logs = []
    for record in cur.fetchall():
        logs.append({
            'timestamp': record[0].strftime('%Y-%m-%d %H:%M:%S'),
            'plate': record[1],
            'event_type': record[2],
            'details': record[3]
        })

    cur.close()
    conn.close()

    return jsonify(logs)


@app.route('/api/recent_alerts')
def recent_alerts():
    conn = get_db_connection()
    cur = conn.cursor()

    # Get unauthorized exit attempts (you would need to log these)
    cur.execute("""
                SELECT timestamp, plate_number, alert_type, details
                FROM system_alerts
                WHERE alert_type IN ('unauthorized_exit', 'payment_required')
                ORDER BY timestamp DESC
                    LIMIT 20
                """)

    alerts = []
    for record in cur.fetchall():
        alerts.append({
            'timestamp': record[0].strftime('%Y-%m-%d %H:%M:%S'),
            'plate': record[1],
            'alert_type': record[2].replace('_', ' ').title(),
            'details': record[3]
        })

    cur.close()
    conn.close()

    return jsonify(alerts)


if __name__ == '__main__':
    app.run(debug=True)
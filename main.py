from flask import Flask, render_template, jsonify
import psycopg2
from datetime import datetime, timedelta
from decimal import Decimal
import json

app = Flask(__name__)

# Database configuration
DB_CONFIG = {
    'dbname': 'parking_db',
    'user': 'postgres',
    'password': 'gomgom1029',
    'host': 'localhost'
}


# Custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


app.json_encoder = DecimalEncoder


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


@app.route('/api/system_stats')
def system_stats():
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # Current parked vehicles
        cur.execute("SELECT COUNT(*) FROM plates_log WHERE exit_time IS NULL")
        current_count = cur.fetchone()[0]

        # Today's revenue
        cur.execute("""
            SELECT COALESCE(SUM(amount), 0) 
            FROM plates_log 
            WHERE payment_status = 1 
            AND DATE(exit_time) = CURRENT_DATE
        """)
        today_revenue = cur.fetchone()[0]

        # Recent alerts count
        cur.execute("""
            SELECT COUNT(*) 
            FROM system_alerts 
            WHERE timestamp > NOW() - INTERVAL '1 hour'
        """)
        recent_alerts = cur.fetchone()[0]

        return jsonify({
            'current_count': current_count,
            'today_revenue': today_revenue,
            'recent_alerts': recent_alerts
        })
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/api/all_logs')
def all_logs():
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT timestamp, plate_number, event_type, details
            FROM system_logs
            ORDER BY timestamp DESC
            LIMIT 100
        """)
        logs = []
        for record in cur.fetchall():
            logs.append({
                'timestamp': record[0].strftime('%Y-%m-%d %H:%M:%S'),
                'plate': record[1] or 'N/A',
                'event_type': record[2],
                'details': record[3]
            })
        return jsonify(logs)
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# Add this new endpoint to your existing app.py
@app.route('/api/chart_data')
def chart_data():
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # Last 7 days revenue
        cur.execute("""
            SELECT DATE(exit_time) as day, 
                   SUM(amount) as revenue
            FROM plates_log
            WHERE exit_time >= NOW() - INTERVAL '7 days'
            AND payment_status = 1
            GROUP BY day
            ORDER BY day
        """)
        revenue_data = [{'day': r[0].strftime('%Y-%m-%d'), 'revenue': float(r[1] or 0)} for r in cur.fetchall()]

        # Current day activity
        cur.execute("""
            SELECT 
                SUM(CASE WHEN DATE(entry_time) = CURRENT_DATE THEN 1 ELSE 0 END) as entries,
                SUM(CASE WHEN DATE(exit_time) = CURRENT_DATE THEN 1 ELSE 0 END) as exits
            FROM plates_log
        """)
        today_activity = cur.fetchone()

        return jsonify({
            'revenue_data': revenue_data,
            'today_activity': {
                'entries': today_activity[0] or 0,
                'exits': today_activity[1] or 0
            }
        })
    except Exception as e:
        print(f"Error fetching chart data: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/api/all_alerts')
def all_alerts():
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT timestamp, plate_number, alert_type, details
            FROM system_alerts
            ORDER BY timestamp DESC
            LIMIT 50
        """)
        alerts = []
        for record in cur.fetchall():
            alerts.append({
                'timestamp': record[0].strftime('%Y-%m-%d %H:%M:%S'),
                'plate': record[1] or 'N/A',
                'alert_type': record[2].replace('_', ' ').title(),
                'details': record[3]
            })
        return jsonify(alerts)
    except Exception as e:
        print(f"Error fetching alerts: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)
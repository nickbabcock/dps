from flask import Flask, g, jsonify, render_template
from datetime import date
from dps import parser, query
import os
import sqlite3

app = Flask(__name__)
app.config['DEBUG'] = True

def get_db():
    if not hasattr(g, 'db'):
        g.db = parser.connect_db()
    return g.db

@app.teardown_appcontext
def close_connection(exception):
    if hasattr(g, 'db'):
        g.db.close()

@app.route('/api/v1/statistics')
def api_statistics():
    return jsonify(weekday=query.for_weekday_statistics(get_db()),
                    hour=query.for_hour_statistics(get_db()),
                    day=query.for_day_statistics(get_db()),
                    week=query.for_week_statistics(get_db()))

@app.route('/statistics')
def statistics():
    return render_template('statistics.html')

@app.route('/api/v1/date/<int:year>/<int:month>/<int:day>')
def day_incidents(year, month, day):
    return jsonify(result=query.for_day_incidents(get_db(), date(year, month, day)))

@app.route('/api/v1/incident/<int:rowid>')
def incident(rowid):
    return jsonify(result=query.for_incident(get_db(), rowid))

@app.route('/api/v1/date/<int:year>/<int:month>/<int:day>/thru/<int:year2>/<int:month2>/<int:day2>')
def day_incidents_thru(year, month, day, year2, month2, day2):
    start = date(year, month, day)
    end = date(year2, month2, day2)
    if end < start: start, end = end,start
    return jsonify(result=query.for_day_incidents_thru(get_db(), start, end))

if __name__ == '__main__':
    app.run('0.0.0.0')

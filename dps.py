from flask import Flask, g, jsonify, render_template, request, send_file
from datetime import date
from dps import parser, query

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
    return send_file('.cached-statistics.json') 
    
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/statistics')
def statistics():
    return render_template('statistics-generated.html')

@app.route('/about')
def about():
    return render_template('about-generated.html')

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

@app.route('/api/v1/category/<category>')
def category(category):
    return jsonify(result=query.for_category(get_db(), category))

@app.route('/api/v1/latest')
def latest():
    take = request.args.get('take', 10)
    skip = request.args.get('skip', 0)
    lat = request.args.get('lat', None)
    lng = request.args.get('lng', None)

    if lat and lng:
        lat = float(lat)
        lng = float(lng)
        results = query.for_latest_via_location(get_db(), take, skip, lat, lng)
        return jsonify(result=results)
    else:
        return jsonify(result=query.for_latest(get_db(), take, skip))

if __name__ == '__main__':
    app.run('0.0.0.0')

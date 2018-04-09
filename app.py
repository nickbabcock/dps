from flask import Flask, g, jsonify, render_template, request, send_file, \
    send_from_directory
from datetime import date
from dps import parser, query
import os

app = Flask(__name__)

# Render templates if we are debugging also serve static content
serve = render_template if __name__ == '__main__' else \
    lambda x : send_file(os.path.join('templates', x))

def get_db():
    if not hasattr(g, 'db'):
        g.db = parser.connect_db()
    return g.db

@app.teardown_appcontext
def close_connection(exception):
    if hasattr(g, 'db'):
        g.db.close()

@app.route('/favicon.ico')
def get_favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
        'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/api/v1/statistics')
def api_statistics():
    # A poor man's compression. If the client accepts gzip content, then send
    # them the compressed file, else send them the uncompressed. Normally I
    # am not a fan of roll your own compression but considering storing the
    # file is rolling your own caching, then this just continues the trend. Not
    # to mention sending statistics is, by far, the largest contributor of
    # bandwidth at 16KB uncompressed. At 1/3 the size, compression is smart.
    # A reason why we should be the one's gzipping is that we *know* what the
    # gzipped content is. A webserver would likely calculate the gzipped
    # contents, which isn't free.
    if 'gzip' not in request.headers.get('Accept-Encoding', '').lower():
        return send_file('.cached-statistics.json') 
    response = send_file('.cached-statistics.json.gz', 'application/json')
    response.headers['Content-Encoding'] = 'gzip'
    return response
    
@app.route('/')
def home():
    return serve('home-generated.html')

@app.route('/statistics/<path:path>')
@app.route('/statistics', defaults={'path': ''})
def statistics(path):
    return serve('statistics-generated.html')

@app.route('/about')
def about():
    return serve('about-generated.html')

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
    app.config['DEBUG'] = True
    app.run('0.0.0.0')

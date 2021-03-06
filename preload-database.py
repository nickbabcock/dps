import glob
import sqlite3
import requests
import sys
from dps import parser
from itertools import groupby

# If trying to import this file, exit. This file can only be ran as a script
if __name__ != '__main__':
    print 'Can only be used as a script'
    sys.exit(0)

# All dps data is assumed to have already been downloaded and extracted to the
# following directory.
data = [] 
for file in glob.glob('data/*.html'):
    with open(file, 'r') as f:
        data.extend(parser.parse_page(f.read()))

with open('.database', 'r') as f:
    connection = sqlite3.connect(f.read().strip())

# Keep track of requests made, if we have made 2000 - stop because google will
# start denying at 2500
reqs = 0

# Sort and group by location so we can reduce the number of requests made to
# the database and insert in bulk
data = sorted(data, key=lambda x: x[2])
for location, group in groupby(data, key=lambda x: x[2]):
    group = list(group)
    location = parser.normalize_address(location)
    print location, len(group)

    # Test to see if the location is already in the database, if it is use that
    # data, else make a request to google and save the response
    query = 'SELECT Latitude, Longitude FROM Locations WHERE Location = ?'
    cur = connection.execute(query, (location,))
    rv = cur.fetchall()
    if rv:
        lat, lng = float(rv[0][0]), float(rv[0][1])
    else:
        url = 'http://maps.googleapis.com/maps/api/geocode/json?sensor=false'
        r = requests.get(url, params={'address': location})
        results = r.json()['results']
        reqs += 1
        print "reqs: ", reqs
        if reqs == 2000:
            break
        if len(results) == 0:
            raise Exception(location + ' is unknown!')
        lat = float(results[0]['geometry']['location']['lat'])
        lng = float(results[0]['geometry']['location']['lng'])
        query = 'INSERT INTO Locations(Location, Latitude, Longitude) VALUES (?,?,?)'
        connection.execute(query, (location, lat, lng))
        connection.commit()
    query = ('INSERT INTO Crimes(Time, Crime, Latitude, Longitude, Description)'
             'VALUES (?,?, ' + str(lat) + ',' + str(lng) + ', ?)')
    group = [(time, date, description) for time, date, _, description in group]
    connection.executemany(query, group) 
    connection.commit()

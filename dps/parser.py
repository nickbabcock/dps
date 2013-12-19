from bs4 import BeautifulSoup
from datetime import datetime, date, timedelta
import sqlite3
import requests

class memoize(dict):
    def __init__(self, func):
        self.func = func
    def __call__(self, *args):
        return self[args]
    def __missing__(self, key):
        result = self[key] = self.func(*key)
        return result

def parse_page(html):
    """
    Given a string that contains the html markup for a dps page, parse out
    all the crimes and return a list of tuples of date, crime, location,
    description
    """

    soup = BeautifulSoup(html)
    table_selector = '#columns table'
    tables = soup.select(table_selector)
    if len(tables) == 0:
        raise Exception('Malformed data detected in html')
    table = tables[-1]

    # Crime info is grouped is rows of 5
    # dates are in the first row, first column
    # crimes are in the first row, second column unless there is no third row,
    #   which means that the type doesn't exist.
    # location is in the second row
    # description is in the third row
    first_row = table.find_all('tr')[::5]
    dates = [row.find_all('td')[0] for row in first_row]
    dates = [datetime.strptime(d.get_text(), '%b %d %Y %I:%M %p') for d in dates]
    crimes = [row.find_all('td') for row in first_row]
    crimes = [row[1] if len(row) == 3 else 'Not listed' for row in crimes]
    crimes = [c.get_text().strip() if type(c) is not str else c for c in crimes]
    descriptions = [tr.get_text().strip() for tr in table.find_all('tr')[2::5]]
    locations = [tr.get_text().strip() for tr in table.find_all('tr')[1::5]]
    return zip(dates, crimes, locations, descriptions)

def normalize_address(address):
    """
    Given a location parsed from a DPS page, normalize it such that it can
    be sent to other services to gather more information. Returns the street
    from the address with the city of Ann Arbor, MI appended to it
    """
    # Beautiful soup leaves the &nbsp; in the resulting location when the
    # location is a building + a street address, but I don't really blame it.
    # DPS should not use &nbsp; for a delimiter of any kind. This is fixed by
    # taking just the street address in all cases
    address = address[address.find(u'\xa0')+1:].strip()

    # DPS never labels that we live in Ann Arbor MI :(
    # Fallback to Ann Arbor, MI if no address listed (not every incident
    # has or needs an address)
    address += ', Ann Arbor, MI' if address else 'Ann Arbor, MI'
    return address

@memoize
def get_coordinates_from_address(address):
    """
    Use Google's geocoding API to translate addresses to coordinates. Returns
    a tuple of latitude and longitude of address.
    """
    url = 'http://maps.googleapis.com/maps/api/geocode/json?sensor=false'
    r = requests.get(url, params={'address': normalize_address(address)})
    results = r.json()['results']
    if len(results) == 0:
        raise Exception(address + ' is unknown!')
    lat = float(results[0]['geometry']['location']['lat'])
    lng = float(results[0]['geometry']['location']['lng'])
    return (lat, lng)

def get_data(day):
    """
    Given a date, retrieve the corresponding dps incident log for that day and
    parse it for information. Returns a list of tuples (date, crime, latitude,
    longitude, description).
    """
    url = 'http://police.umich.edu/?s=crime_log'
    r = requests.get(url, params={'d': day.strftime('%Y/%m/%d')})
    data = parse_page(r.text)
    return [(date,  crime) + get_coordinates_from_address(address) + (description,)
            for date, crime, address, description in data]

def store_data(connection, data):
    """ Given a connection and data, insert the data into the connection """
    sql = ("INSERT INTO Crimes(Time, Crime, Latitude, Longitude, Description) "
          "VALUES (?,?,?,?,?)")

    with connection:
        connection.executemany(sql, data)

def scrape(frm=date.today(), until=date(2000, 1, 23)):
    """
    Scrape all the data on crimes from DPS's website from a specified date
    until another working backwards. If no until date is specified then it will
    default to the first date that DPS has data available (January 23rd, 2000).
    Stores the gathered data into a database. We only have 2,500 requests per
    24 hour period due to the Google dependency on translating addresses, so we
    rate limit ourselves to only 2,000 locations in one instance.
    """
    
    connection = connect_db();
    while frm >= until and len(get_coordinates_from_address) < 2000:
        data = get_data(frm)
        store_data(connection, data)
        frm -= timedelta(1)

def connect_db():
    """ Establishes connection with database with scraped data """
    with open('.database', 'r') as f:
        return sqlite3.connect(f.read().strip())
    

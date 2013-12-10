from bs4 import BeautifulSoup
from datetime import datetime

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
    # crimes are in the first row, second column
    # location is in the second row
    # description is in the third row
    first_row = table.find_all('tr')[::5]
    dates = [row.find_all('td')[0] for row in first_row]
    dates = [datetime.strptime(d.get_text(), '%b %d %Y %I:%M %p') for d in dates]
    crimes = [row.find_all('td')[1] for row in first_row]
    crimes = [crime.get_text() for crime in crimes]
    descriptions = [tr.get_text().strip() for tr in table.find_all('tr')[2::5]]
    locations = [tr.get_text().strip() for tr in table.find_all('tr')[1::5]]
    return zip(dates, crimes, locations, descriptions)
    

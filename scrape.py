from datetime import date, datetime, timedelta
from dps import parser
import sys

# When invoked without any arguments, this application will scrape yesterdays
# data and add it to the database. Given a date, this application scape that
# day and add that to the database.

if __name__ == '__main__':
    if len(sys.argv) >= 2:
        start = datetime.strptime(sys.argv[1], '%m-%d-%Y') 
    else:
        start = date.today() - timedelta(days=1)

    parser.scrape(start, start)

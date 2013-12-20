from datetime import date, datetime, timedelta
from dps import parser
import sys

if len(sys.argv) >= 2:
    start = datetime.strptime(sys.argv[1], '%m-%d-%Y') 
else:
    start = date.today() - timedelta(days=1)

parser.scrape(start, start)

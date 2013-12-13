from datetime import datetime, timedelta

def parse_rows(rows):
    """
    Given an iterator to database rows, will translate the values into a list
    of dictionaries that will make it easier for others to interpret.
    """
    return [{
            'id': row[0],
            'time': row[1],
            'crime': row[2],
            'latitude': row[3],
            'longitude': row[4],
            'description': row[5]
            } for row in rows]

def for_weekday_statistics(con):
    """
    Given a connection to the database, will return a dictionary of weekday
    names and the number of incidents that have occurred on that day.
    """
    query = """ SELECT strftime('%w', Time), COUNT(*) FROM Crimes
                GROUP BY strftime('%w', Time) """
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    rows = con.execute(query)

    # Convert the format that SQLite deals with (0-6, Sunday == 0) to a string
    # representation of the date. This is needed because different libraries
    # have different meanings of the first day of the week.
    return { days[int(day)]: int(num) for day, num in rows }

def for_hour_statistics(con):
    """
    Given a connection to the database, will return a list of the number of
    incidents that occurred at a given time. The list is 24 in length with the
    first element corresponding to the zeroth hour of the day (12am to 1am)
    """
    query = """ SELECT strftime('%H', Time), COUNT(*) FROM Crimes
                GROUP BY strftime('%H', Time) """
    data = [0] * 24
    for row in con.execute(query):
        hour, number = row[:]
        data[int(hour)] = int(number)
    return data

def for_day_statistics(con):
    """
    Given a connection to the database, will return a list of the number of
    incidents that have occurred on that day. The list is 366 in length (leap
    years). The first element corresponding to January 1st. Due to the nature
    of leap years shifting dates, the algorithm plays dumb and acts as if there
    is a December 32nd
    """
    query = """ SELECT strftime('%j', Time), COUNT(*) from Crimes
                GROUP BY strftime('%j', Time)  """
    data = [0] * 366
    for row in con.execute(query):
        day, number = row[:]

        # SQLite format is 001 - 366
        data[int(day) - 1] = int(number)
    return data

def for_week_statistics(con):
    """
    Given a connection to the database, will return a list of the number of
    incidents that have occurred on that week. The list is 54 in length. Yes,
    54.
    """
    query = """ SELECT strftime('%W', Time), COUNT(*) FROM Crimes
                GROUP BY strftime('%W', Time) """
    data = [0] * 54
    for row in con.execute(query):
        week, number = row[:]
        data[int(week)] = int(number)
    return data

def for_day_incidents(con, day):
    """
    Given a connection to the database and a day, will return all the incidents
    that occurred on that day in a list of dictionaries
    """
    return for_day_incidents_thru(con, day)

def for_day_incidents_thru(con, start, end=None):
    """
    Given a connection to the database, a start date, and an end date, will
    return all the incidents that occurred between those two dates starting at
    12 AM on the start date and ending at 11:59:59 PM on the end date. Returns
    a list of dictionaries. If no end date is specified, it is assumed to be
    the start date.
    """
    if end is None:
        end = start
    query = """ SELECT rowid, Time, Crime, Latitude, Longitude, Description
                FROM Crimes
                WHERE Time BETWEEN ? AND ? """
    start = start.strftime('%Y-%m-%d 00:00:00')
    end = end.strftime('%Y-%m-%d 23:59:59')
    return parse_rows(con.execute(query, (start, end)))

def for_incident(con, rowid):
    """
    Given a connection to the database and a rowid, retrieve the one row
    corresponding to that rowid
    """
    query = """ SELECT rowid, Time, Crime, Latitude, Longitude, Description
                FROM Crimes
                WHERE rowid = ? """
    results = parse_rows(con.execute(query, (rowid,)))
    return results[0] if len(results) else None

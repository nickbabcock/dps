def for_weekday_incidents(con):
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

def for_hour_incidents(con):
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

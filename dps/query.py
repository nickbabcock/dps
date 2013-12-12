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

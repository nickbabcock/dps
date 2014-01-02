from dps import parser, query
import json
import os

# When invoked, this file will query the database for a bunch of information
# regarding what were the most popular days, weeks, weekdays, hours, for an
# incident to occurr given a certain category (or no category). Since this
# query is nontrivial for a database to perform, and since it is unlikely for
# the statistics to change significantly given any time interval, this query
# was moved from the main API to its own separate process. This allows for the
# API to simply send a JSON file to the client instead of perfoming 10 seconds
# worth of calculations.
#
# In case there is doubt about my database optimization skills, one is free to
# waste a few hours on this subject. For those that value their time, the
# reason why this query will always be nontrivial is that because we are
# essentially doing 44 Group-bys, which involve sorting and filtering based on
# the type of incident -- a text based column

if __name__ == '__main__':
    con = parser.connect_db()
    top_categories = list(query.for_category_statistics(con))

    top_categories = [category for category, count in top_categories[:10]]
    top_categories.append(None)
    print json.dumps({'result': [{
        'category': category,
        'weekday': query.for_weekday_statistics(con, category),
        'hour': query.for_hour_statistics(con, category),
        'day': query.for_day_statistics(con, category),
        'week': query.for_week_statistics(con, category)
    } for category in top_categories ]}, separators=(',', ':'))


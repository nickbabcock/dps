import unittest
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dps import query

class MockWeekDay:
    def execute(self, _):
        return [('2', '2000'), ('0', '1000'), ('5', '5000')]

class MockHour:
    def execute(self, _):
        return [('01', '1570'), ('04', '554')]

class MockDay:
    def execute(self, _):
        return [('001', '100'), ('366', '300')]

class MockWeek:
    def execute(self, _):
        return [('00', '100'), ('53', '200')]

class TestQueryFunctions(unittest.TestCase):
    def test_weekdays(self):
        actual = query.for_weekday_statistics(MockWeekDay())
        expected = {'Sunday': 1000, 'Tuesday': 2000, 'Friday': 5000}
        self.assertDictEqual(expected, actual)

    def test_hour(self):
        actual = query.for_hour_statistics(MockHour())
        expected = [0] * 24
        expected[1] = 1570
        expected[4] = 554
        self.assertSequenceEqual(expected, actual)

    def test_days(self):
        actual = query.for_day_statistics(MockDay())
        expected = [100]  + [0] * 364 + [300]
        self.assertSequenceEqual(expected, actual)

    def test_weeks(self):
        actual = query.for_week_statistics(MockWeek())
        expected = [100] + [0] * 52 + [200]
        self.assertSequenceEqual(expected, actual)

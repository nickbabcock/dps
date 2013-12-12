import unittest
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dps import query

class MockWeek:
    def execute(self, sting):
        return {('2', '2000'), ('0', '1000'), ('5', '5000')}

class TestQueryFunctions(unittest.TestCase):
    def test_weekdays(self):
        actual = query.for_weekday_incidents(MockWeek())
        expected = {'Sunday': 1000, 'Tuesday': 2000, 'Friday': 5000}
        self.assertDictEqual(expected, actual)

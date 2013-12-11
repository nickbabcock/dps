import unittest
import os
import sys
import requests
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from dps import parser

test_data = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'data')

def get_testdata(*paths):
    """ Return test data """
    path = os.path.join(test_data, *paths)
    return open(path, 'rb').read()

def get_api_key():
    with open('../.api-key', 'r') as f:
        return f.read().strip()

class TestParsingFunctions(unittest.TestCase):
    def test_no_event_length(self):
        data = parser.parse_page(get_testdata('no-events.htm'))
        self.assertEqual(0, len(data))

    def test_event_length(self):
        data = parser.parse_page(get_testdata('events.htm'))
        self.assertEqual(14, len(data))

if __name__ == '__main__':
    unittest.main()

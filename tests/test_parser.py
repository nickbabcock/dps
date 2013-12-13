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

    def test_address_normalization(self):
        test = u'1300 BLOCK CATHERINE STREET'
        actual = parser.normalize_address(test)
        expected = u'1300 BLOCK CATHERINE STREET, Ann Arbor, MI'
        self.assertEqual(expected, actual)

    def test_address_normalization_nbsp(self):
        # Since beautiful soup keeps &nbsp; in the output, it screws up google
        # so it should be removed
        test = u'WEST HALL ARCH \xa0 1085 SOUTH UNIVERSITY'
        actual = parser.normalize_address(test)
        expected = u'1085 SOUTH UNIVERSITY, Ann Arbor, MI'
        self.assertEqual(expected, actual)

    def test_not_listed(self):
        data = parser.parse_page(get_testdata('not-listed.htm'))
        last_crime = data[-1][1]
        self.assertEqual('Not listed', last_crime)

    def test_empty_address(self):
        test = u''
        actual = parser.normalize_address(test)
        expected = 'Ann Arbor, MI'
        self.assertEqual(expected, actual)

if __name__ == '__main__':
    unittest.main()

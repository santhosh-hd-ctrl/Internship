# import the necessary modules and libraries
import json
import unittest
import datetime
import os


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


path_data1 = os.path.join(BASE_DIR, "data-1.json")
path_data2 = os.path.join(BASE_DIR, "data-2.json")
path_result = os.path.join(BASE_DIR, "data-result.json")


with open(path_data1, "r", encoding="utf-8") as f:
    jsonData1 = json.load(f)
with open(path_data2, "r", encoding="utf-8") as f:
    jsonData2 = json.load(f)
with open(path_result, "r", encoding="utf-8") as f:
    jsonExpectedResult = json.load(f)
    
def convertFromFormat1(jsonObject):
    locationParts = jsonObject["location"].split("/")
    
    result = {
        'deviceID': jsonObject['deviceID'],
        'deviceType': jsonObject['deviceType'],
        'timestamp': jsonObject['timestamp'],
        'location': {
            'country': locationParts[0],
            'city': locationParts[1],
            'area': locationParts[2],
            'factory': locationParts[3],
            'section': locationParts[4]
        },
        'data': {
            'status': jsonObject['operationStatus'],
            'temperature': jsonObject['temp']
        }
    }
    return result

def convertFromFormat2(jsonObject):
    iso_string = jsonObject['timestamp'].replace('Z', '+00:00')
    
    dt = datetime.datetime.fromisoformat(iso_string)
    
    timestamp_ms = int(dt.timestamp() * 1000)

    result = {
        'deviceID': jsonObject['device']['id'],
        'deviceType': jsonObject['device']['type'],
        'timestamp': timestamp_ms,
        'location': {
            'country': jsonObject['country'],
            'city': jsonObject['city'],
            'area': jsonObject['area'],
            'factory': jsonObject['factory'],
            'section': jsonObject['section']
        },
        'data': jsonObject['data']
    }
    return result

def main(jsonObject):
    result = {}
    if jsonObject.get('device') == None:
        result = convertFromFormat1(jsonObject)
    else:
        result = convertFromFormat2(jsonObject)
    return result

class TestSolution(unittest.TestCase):

    def test_sanity(self):
        result = json.loads(json.dumps(jsonExpectedResult))
        self.assertEqual(result, jsonExpectedResult)

    def test_dataType1(self):
        result = main(jsonData1)
        self.assertEqual(result, jsonExpectedResult, 'Converting from Type 1 failed')

    def test_dataType2(self):
        result = main(jsonData2)
        self.assertEqual(result, jsonExpectedResult, 'Converting from Type 2 failed')

if __name__ == '__main__':
    unittest.main()
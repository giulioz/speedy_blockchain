import json
import requests
import time
import datetime

jsonFile = 'dataFlights.json'
api_endpoint = 'http://localhost:8080/flight'


with open(jsonFile) as json_File:
    jsonDecoded = json.load(json_File)


for record in jsonDecoded:
	datestr = record['FL_DATE']
	date = datetime.datetime.strptime(datestr, "%Y-%m-%d")
	timestamp = datetime.datetime.timestamp(date)
	print(record)
	record['FL_DATE'] = timestamp
	record['DAY_OF_WEEK'] = int(record['DAY_OF_WEEK'])
	record['DEST_AIRPORT_ID'] = int(record['DEST_AIRPORT_ID'])
	record['OP_CARRIER_AIRLINE_ID'] = int(record['OP_CARRIER_AIRLINE_ID'])
	record['OP_CARRIER_FL_NUM'] = int(record['OP_CARRIER_FL_NUM'])
	record['ORIGIN_AIRPORT_ID'] = int(record['ORIGIN_AIRPORT_ID'])
	record['YEAR'] = int(record['YEAR'])
	record['CANCELLED'] = float(record['CANCELLED'])
	if record['DEP_DELAY']!= '' : record['DEP_DELAY'] = float(record['DEP_DELAY'])
	if record['DEP_TIME']!= '' :	record['DEP_TIME'] = int(record['DEP_TIME'])
	if record['AIR_TIME']!= '' :	record['AIR_TIME'] = float(record['AIR_TIME'])
	if record['ARR_DELAY']!= '' :	record['ARR_DELAY'] = float(record['ARR_DELAY'])
	if record['ARR_TIME']!= '' :	record['ARR_TIME'] = int(record['ARR_TIME'])
	#print(record)	
	time.sleep(1)
	r=requests.post(url=api_endpoint, json=record)   	
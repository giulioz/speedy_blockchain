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
	record['FL_DATE'] = timestamp
	print(record)
	time.sleep(0.1)
	r=requests.post(url=api_endpoint, data=record)
	print(r.text)
   	
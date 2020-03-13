import json
import requests
import time

jsonFile = 'dataFlights.json'
api_endpoint = 'http://localhost:8080/transaction'


with open(jsonFile) as json_File:
    jsonDecoded = json.load(json_File)


for record in jsonDecoded:
	time.sleep(1)
	r=requests.post(url=api_endpoint, data=record)
	print(r.text)
   	
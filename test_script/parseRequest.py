import csv
import json

csvFile = '656211699_T_ONTIME_REPORTING.csv'
jsonFile = 'dataFlights.json'

#da csv a json.

with open(csvFile) as csvFile:
	with open(jsonFile, 'w') as jsonFile2:
		csvReader = csv.DictReader(csvFile, delimiter=',')
		json.dump(list(csvReader), jsonFile2)


#il file json presenta una key in più vuota, con le seguenti righe di codice la togli.

with open(jsonFile, 'r') as data_file:
    data = json.load(data_file)

for element in data:
    element.pop('', None)

with open(jsonFile, 'w') as data_file:
    data = json.dump(data, data_file)


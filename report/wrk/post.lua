cities = { 'San Antonio, TX',
'Memphis, TN',
'Nashville, TN',
'Lafayette, LA',
'Greer, SC',
'Cleveland, OH',
'Erie, PA',
'Detroit, MI',
'Detroit, MI',
'Hartford, CT',
'Omaha, NE',
'San Antonio, TX',
'Baton Rouge, LA'
}


request = function()
  wrk.method = "POST"
  wrk.body = '{"CITY_A":"' .. cities[math.random(#cities)] .. '","CITY_B":"' .. cities[math.random(#cities)] .. '","DATE_FROM":0,"DATE_TO":1589479617088}'
  wrk.headers["Content-Type"] = "application/json"
  return wrk.format(nul, "http://172.16.10.51:8080/query/route")
end

-- response = function(status, headers, body)
--   print(body)
-- end

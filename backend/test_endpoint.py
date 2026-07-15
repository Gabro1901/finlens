import urllib.request
import json
import traceback

data = json.dumps({'markdown_content':'# test', 'ticker':'AAPL'}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/api/export/pdf', data=data, headers={'Content-Type':'application/json'})
try:
    urllib.request.urlopen(req)
except Exception as e:
    if hasattr(e, 'read'):
        print(e.read().decode())
    else:
        print(traceback.format_exc())

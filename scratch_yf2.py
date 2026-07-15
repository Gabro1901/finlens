import requests

def test():
    ticker = "AAPL"
    url = f"https://query2.finance.yahoo.com/v6/finance/recommendationsbysymbol/{ticker}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        data = r.json()
        print(data)
    else:
        print("Failed:", r.status_code)
    
if __name__ == "__main__":
    test()

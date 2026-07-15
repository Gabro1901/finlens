import yfinance as yf

def test():
    t = yf.Ticker("AAPL")
    print(dir(t))
    
if __name__ == "__main__":
    test()

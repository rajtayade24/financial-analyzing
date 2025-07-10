import os
import time
import threading
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import yfinance as yf
<<<<<<< HEAD
from flask import Flask, jsonify, render_template
from  livereload import Server
=======
from flask import Flask, jsonify, render_template, request
import requests

# Configuration
REFRESH_INTERVAL = 300  # seconds between cache refreshes
MAX_BATCH = 10          # max symbols per batch download
API_KEY = os.getenv("FINNHUB_API_KEY", "d1k0dbhr01ql1h39s480d1k0dbhr01ql1h39s48g")
>>>>>>> 85357a5bedb3762f5b9ac6d11c622e3ac20faf70

companies = {
    "Reliance Industries": "RELIANCE.NS",
    "HDFC Bank": "HDFCBANK.NS",
    "Tata Consultancy Services (TCS)": "TCS.NS",
    "Bharti Airtel": "BHARTIARTL.NS",
    "ICICI Bank": "ICICIBANK.NS",
    "State Bank of India": "SBIN.NS",
    "Infosys": "INFY.NS",
    "Life Insurance Corporation of India (LIC)": "LICI.NS",
    "Hindustan Unilever": "HINDUNILVR.NS",
    # "Housing Development Finance Corporation (HDFC)": "HDFC.NS",
    "ITC": "ITC.NS",
    "Larsen & Toubro": "LT.NS",
    "HCLTech": "HCLTECH.NS",
    "Kotak Mahindra Bank": "KOTAKBANK.NS",
    "Maruti Suzuki": "MARUTI.NS",
    "Sun Pharmaceutical Industries": "SUNPHARMA.NS",
    "Mahindra & Mahindra": "M&M.NS",
    "Axis Bank": "AXISBANK.NS",
    "UltraTech Cement": "ULTRACEMCO.NS",
    "Hindustan Aeronautics Limited (HAL)": "HAL.NS",
    "NTPC": "NTPC.NS",
    "Bajaj Finance": "BAJFINANCE.NS",
    "Titan Company": "TITAN.NS",
    "Bharat Electronics": "BEL.NS",
    "Adani Ports & SEZ": "ADANIPORTS.NS",
    "Adani Enterprises": "ADANIENT.NS",
    "Wipro": "WIPRO.NS",
    "Power Grid Corporation of India": "POWERGRID.NS",
    "Tata Motors": "TATAMOTORS.NS",
    "JSW Steel": "JSWSTEEL.NS",
    "Coal India": "COALINDIA.NS",
    "Bajaj Auto": "BAJAJ-AUTO.NS",
    # "Eternal (formerly Zomato)": "ZOMATO.NS",
    "Nestlé India": "NESTLEIND.NS",
    "Asian Paints": "ASIANPAINT.NS",
    "DLF": "DLF.NS",
    "Trent": "TRENT.NS",
    "InterGlobe Aviation (IndiGo)": "INDIGO.NS",
    "Adani Power": "ADANIPOWER.NS",
    # "Zomato": "ZOMATO.NS",
    "Tata Steel": "TATASTEEL.NS",
    "Jio Financial Services": "JIOFIN.NS",
    "Hindustan Zinc": "HINDZINC.NS",
    "Grasim Industries": "GRASIM.NS",
    "SBI Life Insurance": "SBILIFE.NS",
    "Indian Railway Finance": "IRFC.NS",
    "Divis Laboratories": "DIVISLAB.NS",
    "Vedanta": "VEDL.NS"
}

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

# Route for Sign In form
@app.route('/form.html')
def form():
    return render_template('form.html')

@app.route('/signin.html')
def signin():
    return render_template('signin.html')

# 2. Shared cache
stock_cache = []
last_updated = None

# Batch OHLC downloader
def fetch_history(symbols):
    df = yf.download(
        symbols,
        period="5d",
        group_by='ticker',
        threads=True,
        progress=False,
        auto_adjust=False
    )
    if not hasattr(df.columns, 'levels'):
        return { symbols[0]: df }
    return { symbol: df[symbol] for symbol in symbols }

# Metadata fetcher
def fetch_info(symbol):
    t = yf.Ticker(symbol)
    info = t.info
    return {
        "symbol": symbol,
        "market_capital": info.get("marketCap"),
        "industry": info.get("industry"),
        "revenue": info.get("totalRevenue"),
        "profit": info.get("grossProfits") or info.get("grossProfit"),
        "expenses": (
            info.get("operatingExpenses")
            or info.get("totalOperatingExpenses")
            or info.get("totalExpenses")
        )
    }

# Build snapshot
def build_stock_snapshot():
    symbols = list(companies.values())
    history_data = fetch_history(symbols)
    info_results = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(fetch_info, sym): sym for sym in symbols}
        for fut in as_completed(futures):
            sym = futures[fut]
            try:
                info_results[sym] = fut.result()
            except:
                info_results[sym] = {}
    snapshot = []
    for name, symbol in companies.items():
        try:
            df = history_data.get(symbol)
            if df is not None and len(df) > 0:
                today, yesterday = (df.iloc[-1], df.iloc[-2]) if len(df) >= 2 else (df.iloc[-1], df.iloc[-1])
                price = round(today["Close"], 2)
                close = round(yesterday["Close"], 2)
                high = round(today["High"], 2)
                low = round(today["Low"], 2)
                change_percent = round((price - close) / close * 100, 2) if close else None
            else:
                price = close = high = low = change_percent = None
            meta = info_results.get(symbol, {})
            snapshot.append({
                "name": name,
                "symbol": symbol,
                "price": price,
                "close": close,
                "change_percent": change_percent,
                "high": high,
                "low": low,
                "market_capital": meta.get("market_capital"),
                "industry": meta.get("industry"),
                "revenue": meta.get("revenue"),
                "profit": meta.get("profit"),
                "expenses": meta.get("expenses"),
            })
        except Exception as e:
            snapshot.append({
                "name": name,
                "symbol": symbol,
                "price": None,
                "close": None,
                "change_percent": None,
                "high": None,
                "low": None,
                "pe_ratio": None,
                "market_capital": None,
                "industry": "none",
                "error": str(e)
            })    

            
    # # Save with timestamp as key
    # file_path = "static/json/stock_data_append.json"
 
    # timestamp = str(int(datetime.now().timestamp()))

    # if os.path.exists(file_path):
    #     with open(file_path, "r") as f:
    #         try:
    #             all_data = json.load(f)
    #         except json.JSONDecodeError:
    #             all_data = {}
    # else:
    #     all_data = {}

    # all_data[timestamp] = stock_info

    # with open(file_path, "w") as f:
    #     json.dump(all_data, f, indent=4)

    return snapshot

# Cache refresher
def refresh_cache_loop(interval=60):
    global stock_cache, last_updated
    while True:
        try:
            stock_cache = build_stock_snapshot()
            last_updated = datetime.utcnow().isoformat() + "Z"
        except Exception as e:
            print("Cache refresh error:", e)
        time.sleep(interval)

threading.Thread(target=refresh_cache_loop, args=(60,), daemon=True).start()

@app.route("/stock-data")
def stock_data():
    # Return only the array of stock objects
    return jsonify(stock_cache)




import requests
from flask import request

FINNHUB_API_KEY = "d1jn961r01qvg5gvjr40d1jn961r01qvg5gvjr4g"

# ------------------- General News Endpoint -------------------
@app.route("/news-data")
def news_data():
    url = f"https://finnhub.io/api/v1/news?category=general&token={FINNHUB_API_KEY}"
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        news = resp.json()
        return jsonify(news[:5])  # return top 5 articles
    except requests.RequestException as e:
        return jsonify({"error": "Failed to fetch general news", "details": str(e)}), 500

# ------------------- Company-Specific News -------------------
@app.route("/api/news")
def get_news():
    symbol = request.args.get("symbol")
    from_date = request.args.get("from")
    to_date = request.args.get("to")

    if not all([symbol, from_date, to_date]):
        return jsonify({"error": "Missing parameters"}), 400

    url = f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from={from_date}&to={to_date}&token={FINNHUB_API_KEY}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

# if __name__ == "__main__":
#     server = Server(app.wsgi_app)
#     server.watch('templates')      # watches CSS, JS, logos
#     server.watch('static/js')      # watches CSS, JS, logos
#     server.watch('static/css')      # watches CSS, JS, logos
#     # server.watch('templates/')   # watches index.html
#     server.serve(port=5000, debug=True)














# from flask import Flask, render_template, jsonify;
# import yfinance as yf
# import json
# import os
# from datetime import datetime
# from  livereload import Server

# companies = {
#     "Reliance Industries": "RELIANCE.NS",
#     "HDFC Bank": "HDFCBANK.NS",
#     "Tata Consultancy Services (TCS)": "TCS.NS",
#     "Bharti Airtel": "BHARTIARTL.NS",
#     "ICICI Bank": "ICICIBANK.NS",
#     "State Bank of India": "SBIN.NS",
#     "Infosys": "INFY.NS",
#     "Life Insurance Corporation of India (LIC)": "LICI.NS",
#     "Hindustan Unilever": "HINDUNILVR.NS",
#     # "Housing Development Finance Corporation (HDFC)": "HDFC.NS",
#     "ITC": "ITC.NS",
#     "Larsen & Toubro": "LT.NS",
#     "HCLTech": "HCLTECH.NS",
#     "Kotak Mahindra Bank": "KOTAKBANK.NS",
#     "Maruti Suzuki": "MARUTI.NS",
#     "Sun Pharmaceutical Industries": "SUNPHARMA.NS",
#     "Mahindra & Mahindra": "M&M.NS",
#     "Axis Bank": "AXISBANK.NS",
#     "UltraTech Cement": "ULTRACEMCO.NS",
#     "Hindustan Aeronautics Limited (HAL)": "HAL.NS",
#     "NTPC": "NTPC.NS",
#     "Bajaj Finance": "BAJFINANCE.NS",
#     "Titan Company": "TITAN.NS",
#     "Bharat Electronics": "BEL.NS",
#     "Adani Ports & SEZ": "ADANIPORTS.NS",
#     "Adani Enterprises": "ADANIENT.NS",
#     "Wipro": "WIPRO.NS",
#     "Power Grid Corporation of India": "POWERGRID.NS",
#     "Tata Motors": "TATAMOTORS.NS",
#     "JSW Steel": "JSWSTEEL.NS",
#     "Coal India": "COALINDIA.NS",
#     "Bajaj Auto": "BAJAJ-AUTO.NS",
#     # "Eternal (formerly Zomato)": "ZOMATO.NS",
#     "Nestlé India": "NESTLEIND.NS",
#     "Asian Paints": "ASIANPAINT.NS",
#     "DLF": "DLF.NS",
#     "Trent": "TRENT.NS",
#     "InterGlobe Aviation (IndiGo)": "INDIGO.NS",
#     "Adani Power": "ADANIPOWER.NS",
#     # "Zomato": "ZOMATO.NS",
#     "Tata Steel": "TATASTEEL.NS",
#     "Jio Financial Services": "JIOFIN.NS",
#     "Hindustan Zinc": "HINDZINC.NS",
#     "Grasim Industries": "GRASIM.NS",
#     "SBI Life Insurance": "SBILIFE.NS",
#     "Indian Railway Finance": "IRFC.NS",
#     "Divis Laboratories": "DIVISLAB.NS",
#     "Vedanta": "VEDL.NS"
# }

# app = Flask(__name__)

# @app.route("/")
# def index():
#     return render_template("index.html")

# # Route for Sign In form
# @app.route('/form.html')
# def form():
#     return render_template('form.html')

# @app.route('/signin.html')
# def signin():
#     return render_template('signin.html')


# @app.route("/stock-data")
# def stock_data():
#     stock_info = []

#     for name, symbol in companies.items():
#         try:
#             ticker = yf.Ticker(symbol)
#             info = ticker.info
#             # info = ticker.get_info()
#             hist = ticker.history(period="2d")

#             if not hist.empty and len(hist) >= 2:
#                 price = round(hist['Close'].iloc[-1], 2)
#                 close = round(hist['Close'].iloc[-2], 2)
#                 high = round(hist['High'].iloc[-1], 2)
#                 low = round(hist['Low'].iloc[-1], 2)
#             elif not hist.empty:
#                 price = round(hist['Close'].iloc[-1], 2)
#                 close = price
#                 high = round(hist['High'].iloc[-1], 2)
#                 low = round(hist['Low'].iloc[-1], 2)
#             else:
#                 price = close = high = low = None

#             if price and close:
#                 change_percent = round(((price - close) / close) * 100, 2)
#             else:
#                 change_percent = None

#             stock_info.append({
#                 "name": name,
#                 "symbol": symbol,
#                 "price": price,
#                 "close": close,
#                 "change_percent": change_percent,
#                 "high": high,
#                 "low": low,
#                 # "pe_ratio": info.get("trailingPE"),
#                 "market_capital": info.get("marketCap"),
#                 "industry": info.get("industry"),
#                 "revenue": info.get("totalRevenue"),
#                 "profit": info.get("grossProfits") or info.get("grossProfit"),
#                 "expenses": (
#                     info.get("operatingExpenses")
#                     or info.get("totalOperatingExpenses")
#                     or info.get("totalOperatingExpense")
#                     or info.get("totalExpenses")
#                 )
#             })


#         except Exception as e:
#             stock_info.append({
#                 "name": name,
#                 "symbol": symbol,
#                 "price": None,
#                 "close": "none",
#                 "change_percent": "none",
#                 "high": None,
#                 "low": None,
#                 "pe_ratio": "none",
#                 "market_capital": "none",
#                 "industry": "none",
#                 "error": str(e)
#             })

#     return jsonify(stock_info)

# if __name__ == "__main__":
#     app.run(debug=True)

import os
import time
import threading
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import yfinance as yf
from flask import Flask, jsonify, render_template, request
import requests

# Configuration
REFRESH_INTERVAL = 300  # seconds between cache refreshes
MAX_BATCH = 10          # max symbols per batch download
API_KEY = os.getenv("FINNHUB_API_KEY", "d1jn961r01qvg5gvjr40d1jn961r01qvg5gvjr4g")

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

@app.route('/form.html')
def form():
    return render_template('form.html')

@app.route('/signin.html')
def signin():
    return render_template('signin.html')

# Shared cache and metadata
stock_cache = []
last_updated = None

# Utility: chunk list
def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

# Batch OHLC downloader with chunking and retry
def fetch_history(symbols):
    results = {}
    for batch in chunks(symbols, MAX_BATCH):
        try:
            df = yf.download(
                batch,
                period="5d",
                group_by='ticker',
                threads=False,
                progress=False,
                auto_adjust=False
            )
            if hasattr(df.columns, 'levels'):
                for sym in batch:
                    results[sym] = df.get(sym)
            else:
                results[batch[0]] = df
        except Exception as e:
            print(f"Batch download failed for {batch}: {e}")
        time.sleep(1)  # avoid rapid-fire requests
    return results

# Metadata fetcher
def fetch_info(symbol):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info or {}
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
    except Exception as e:
        print(f"Info fetch failed for {symbol}: {e}")
        return {"symbol": symbol}

# Build snapshot
def build_stock_snapshot():
    global last_updated
    symbols = list(companies.values())
    history_data = fetch_history(symbols)
    info_results = {}
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(fetch_info, sym): sym for sym in symbols}
        for fut in as_completed(futures):
            sym = futures[fut]
            try:
                info_results[sym] = fut.result()
            except Exception as e:
                print(f"Error fetching metadata for {sym}: {e}")
                info_results[sym] = {"symbol": sym}
    snapshot = []
    for name, symbol in companies.items():
        df = history_data.get(symbol)
        if df is not None and len(df) >= 2:
            today = df.iloc[-1]
            yesterday = df.iloc[-2]
            price = round(today["Close"], 2)
            close = round(yesterday["Close"], 2)
            change_percent = round((price - close) / close * 100, 2) if close else None
            high = round(today["High"], 2)
            low = round(today["Low"], 2)
        else:
            price = close = change_percent = high = low = None
        meta = info_results.get(symbol, {})
        snapshot.append({
            "name": name,
            "symbol": symbol,
            "price": price,
            "close": close,
            "change_percent": change_percent,
            "high": high,
            "low": low,
            **meta
        })
    last_updated = datetime.utcnow().isoformat() + "Z"
    return snapshot

# Initialize cache immediately
stock_cache = build_stock_snapshot()

# Cache refresher
def refresh_cache_loop():
    global stock_cache
    while True:
        try:
            stock_cache = build_stock_snapshot()
        except Exception as e:
            print("Cache refresh error:", e)
        time.sleep(REFRESH_INTERVAL)

threading.Thread(target=refresh_cache_loop, daemon=True).start()

@app.route("/stock-data")
def stock_data():
    return jsonify(stock_cache)

# News endpoints
@app.route("/news-data")
def news_data():
    url = f"https://finnhub.io/api/v1/news?category=general&token={API_KEY}"
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        return jsonify(resp.json()[:5])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/news")
def get_news():
    symbol = request.args.get("symbol")
    from_date = request.args.get("from")
    to_date = request.args.get("to")
    if not all([symbol, from_date, to_date]):
        return jsonify({"error": "Missing parameters"}), 400
    url = f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from={from_date}&to={to_date}&token={API_KEY}"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)


from flask import Flask, render_template, jsonify;
import yfinance as yf
import json
import os
from datetime import datetime
from  livereload import Server

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

@app.route("/stock-data")
def stock_data():
    stock_info = []

    for name, symbol in companies.items():
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            # info = ticker.get_info()
            hist = ticker.history(period="2d")

            if not hist.empty and len(hist) >= 2:
                price = round(hist['Close'].iloc[-1], 2)
                previous_close = round(hist['Close'].iloc[-2], 2)
                high = round(hist['High'].iloc[-1], 2)
                low = round(hist['Low'].iloc[-1], 2)
            elif not hist.empty:
                price = round(hist['Close'].iloc[-1], 2)
                previous_close = price
                high = round(hist['High'].iloc[-1], 2)
                low = round(hist['Low'].iloc[-1], 2)
            else:
                price = previous_close = high = low = None

            if price and previous_close:
                change_percent = round(((price - previous_close) / previous_close) * 100, 2)
            else:
                change_percent = None

            stock_info.append({
                "name": name,
                "symbol": symbol,
                "price": price,
                "previous_close": previous_close,
                "change_percent": change_percent,
                "high": high,
                "low": low,
                # "pe_ratio": info.get("trailingPE"),
                "market_capital": info.get("marketCap"),
                "industry": info.get("industry"),
                "revenue": info.get("totalRevenue"),
                "profit": info.get("grossProfits") or info.get("grossProfit"),
                "expenses": (
                    info.get("operatingExpenses")
                    or info.get("totalOperatingExpenses")
                    or info.get("totalOperatingExpense")
                    or info.get("totalExpenses")
                )
            })


        except Exception as e:
            stock_info.append({
                "name": name,
                "symbol": symbol,
                "price": None,
                "previous_close": "none",
                "change_percent": "none",
                "high": None,
                "low": None,
                "pe_ratio": "none",
                "market_capital": "none",
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

    return jsonify(stock_info)

if __name__ == "__main__":
    app.run(debug=True)


# if __name__ == "__main__":
#     server = Server(app.wsgi_app)
#     server.watch('static/css')      # watches CSS, JS, logos
#     server.watch('static/json')      # watches CSS, JS, logos
#     # server.watch('templates/')   # watches index.html
#     server.serve(port=5000, debug=True)

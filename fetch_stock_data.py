from flask import Flask, render_template, jsonify
import yfinance as yf

app = Flask(__name__)

# Dictionary of companies and their NSE ticker symbols
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
    "Housing Development Finance Corporation (HDFC)": "HDFC.NS",
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
    "Eternal (formerly Zomato)": "ZOMATO.NS",
    "Nestlé India": "NESTLEIND.NS",
    "Asian Paints": "ASIANPAINT.NS",
    "DLF": "DLF.NS",
    "Trent": "TRENT.NS",
    "InterGlobe Aviation (IndiGo)": "INDIGO.NS",
    "Adani Power": "ADANIPOWER.NS",
    "Zomato": "ZOMATO.NS",
    "Tata Steel": "TATASTEEL.NS",
    "Jio Financial Services": "JIOFIN.NS",
    "Hindustan Zinc": "HINDZINC.NS",
    "Grasim Industries": "GRASIM.NS",
    "SBI Life Insurance": "SBILIFE.NS",
    "Indian Railway Finance": "IRFC.NS",
    "Divis Laboratories": "DIVISLAB.NS",
    "Vedanta": "VEDL.NS"
}



@app.route("/")
def index():
    return render_template("index.html")

@app.route("/stock-data")
def stock_data():
    stock_info = []

    for name, symbol in companies.items():
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info  # Contains metadata like P/E ratio, market cap, industry
            hist = ticker.history(period="2d")  # Last two days for comparison

            # Extract current and previous close price
            if not hist.empty and len(hist) >= 2:
                price = round(hist['Close'].iloc[-1], 2)
                previous_close = round(hist['Close'].iloc[-2], 2)
            elif not hist.empty:
                price = round(hist['Close'].iloc[-1], 2)
                previous_close = price  # fallback
            else:
                price = previous_close = None

            # Calculate change percent
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
                "pe_ratio": info.get("trailingPE"),
                "market_capital": info.get("marketCap"),
                "industry": info.get("industry")
            })

        except Exception as e:
            stock_info.append({
                "name": name,
                "symbol": symbol,
                "price": None,
                "previous_close": None,
                "change_percent": None,
                "pe_ratio": None,
                "market_capital": None,
                "industry": None,
                "error": str(e)
            })

    return jsonify(stock_info)

if __name__ == "__main__":
    app.run(debug=True)

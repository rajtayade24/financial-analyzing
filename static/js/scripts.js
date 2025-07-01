console.log(window.innerWidth)
console.log(window.innerHeight)
let isDark = false;
function setTheme() {
    isDark = !isDark;
    const root = document.documentElement.style;
    if (isDark) {
        root.setProperty('--primary-text', '#1e293b');
        root.setProperty('--primary-accent', '#4f8ef7');
        root.setProperty('--body-bg', '#f8fafc');
        root.setProperty('--head-section-bg', 'linear-gradient(90deg, #1e3a8a, #2563eb 40%, #312e81 100%)');
        root.setProperty('--section-bg', 'white');
        root.setProperty('--card-border', '#e5e7eb');
        root.setProperty('--card-radius', '1.2rem');
        root.setProperty('--card-shadow', '1px 4px 20px 9px rgba(30, 41, 59, 0.08)');
        root.setProperty('--button-bg', '#4f8ef7');
        root.setProperty('--muted-text', '#64748b');
        chart.applyOptions({
            layout: {
                background: { color: 'white' },
                textColor: "black"
            }
        });
    } else {
        root.setProperty('--primary-text', 'white');
        root.setProperty('--primary-accent', '#4f8ef7');
        root.setProperty('--body-bg', 'linear-gradient(135deg, #00010F, #0f172a)');
        root.setProperty('--head-section-bg', 'linear-gradient(to right, #0f172a, #1e1b4b, #3b0764)');
        root.setProperty('--section-bg', '#0B1325');
        root.setProperty('--card-border', '#e5e7eb');
        root.setProperty('--card-radius', '1.2rem');
        root.setProperty('--card-shadow', '1px 4px 20px 9px rgba(30, 41, 59, 0.08)');
        root.setProperty('--button-bg', '#4f8ef7');
        root.setProperty('--muted-text', '#64748b');
        chart.applyOptions({
            layout: {
                background: { color: '#0B1325' },
                textColor: '#d1d4dc',
            }
        });
    }
}

document.querySelector(".buttons .themebtn").addEventListener("click", function (e) {
    this.style.backgroundColor = isDark ? ' #3b0764' : '#f8fafc';
    document.querySelectorAll("header aside button img").forEach(e => {
        e.classList.toggle("invert")
    })
    setTheme()
});

const marketChart = document.querySelector(".market-chart-section")
const tradingChart = document.querySelector(".trading-chart-section")
document.getElementById("tradingbtn").addEventListener("click", () => {
    tradingChart.style.display = "flex"
    marketChart.style.display = "none"
})
document.getElementById("chartbtn").addEventListener("click", () => {
    marketChart.style.display = "block"
    tradingChart.style.display = "none"
})

function handleResize() {
    const spans = document.querySelectorAll(".navbar .buttons span");
    if (window.innerWidth < 550) {
        spans.forEach(function (element) {
            element.style.display = "none";
        });
    } else {
        spans.forEach(function (element) {
            element.style.display = "inline"; // or "block", depending on your layout
        });
    }
}
handleResize();
window.addEventListener("resize", handleResize);


const submenubtnContent = document.querySelectorAll("header aside > div > span")
document.querySelectorAll("header aside .submenubtn").forEach((el, i) => {
    el.addEventListener("mouseenter", (e) => {
        submenubtnContent[i].style.display = "flex"
        submenubtnContent[i].style.width = "100px"
    })
})
document.querySelectorAll("header aside .submenubtn-cont").forEach((el, i) => {
    el.addEventListener("mouseleave", (e) => {
        submenubtnContent[i].style.display = "none"
    })
})

function inrToUsd(inrAmount, exchangeRate = 83.20) {
    if (inrAmount < 0) {
        throw new Error("Amount cannot be negative.");
    }
    const usdAmount = inrAmount / exchangeRate;
    return usdAmount.toFixed(2); // returns a string with 2 decimal places
}

function resetChart(chartInstance) {
    if (chartInstance) {
        chartInstance.destroy();
    }
}

async function fetchData() {
    console.log("fetching...")
    const res = await fetch("http://127.0.0.1:5000/stock-data");
    const data = await res.json();
    console.log("Fetched data:", data);
    return data;
}

let chartInstance = null;
const ctx = document.getElementById("individual-company-data").getContext("2d")

async function drawLineChart() {
    resetChart(chartInstance);
    let company_data = await fetchData();

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: company_data.map(company => company.name),
            datasets: [
                {
                    label: "market_capital",
                    data: company_data.map(company => inrToUsd(company.market_capital)),
                    fill: false,
                    tension: 0.1,
                    hoverBorderWidth: 50,
                    pointBorderColor: "grey",
                    borderColor: "#4f8ef7"
                }
            ]
        },
        options: {
            scales: {
                x: {
                    ticks: {
                        autoSkip: false,
                    }
                },

                y: {
                    ticks: {
                        callback: function (value, index, ticks) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    })
}

// Render bar chart (Revenue & Expenses over months)
async function drawBarChart() {
    resetChart(chartInstance);
    let company_data = await fetchData()

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: company_data.map(company => company.name),
            datasets: [
                {
                    label: "Revenue",
                    data: company_data.map(company => inrToUsd(company.market_capital)),
                    backgroundColor: "#4f8ef7"
                }
            ]
        },
        options: {
            plugins: {
                legend: { display: true },
                tooltip: {
                    backgroundColor: "#fff",
                    borderColor: "#ddd", borderWidth: 1, titleColor: "#1e293b", bodyColor: "#1e293b"
                }
            },
            responsive: true,
            scales: {
                x: {
                    grid: {
                        // color: "#e5e7eb"
                        color: "#444"
                    },
                    ticks: {
                        autoSkip: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "#444"
                    },
                    ticks: {
                        callback: function (value, index, ticks) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}
// Render pie chart (Revenue vs Expenses vs Profit)
async function drawPieChart() {
    resetChart(chartInstance);
    let company_data = await fetchData();

    chartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: company_data.map(company => company.name),
            datasets: [{
                data: company_data.map(company => inrToUsd(company.market_capital)),
            }]
        },
        options: {
            plugins: {
                legend: { display: true, position: "bottom" },
                tooltip: { backgroundColor: "#fff", borderColor: "#ddd", borderWidth: 1, titleColor: "#1e293b", bodyColor: "#1e293b" }
            }
        },

    });
}
let barChartBtn = document.getElementById("barChartBtn")
let lineChartBtn = document.getElementById("lineChartBtn")
let pieChartBtn = document.getElementById("pieChartBtn")

// Chart toggle logic
barChartBtn.addEventListener("click", function () {
    this.classList.add("active");
    pieChartBtn.classList.remove("active");
    lineChartBtn.classList.remove("active");
    drawBarChart();
});
document.getElementById("pieChartBtn").addEventListener("click", function () {
    this.classList.add("active");
    barChartBtn.classList.remove("active");
    lineChartBtn.classList.remove("active");
    drawPieChart();
});
document.getElementById("lineChartBtn").addEventListener("click", function () {
    this.classList.add("active");
    barChartBtn.classList.remove("active");
    pieChartBtn.classList.remove("active");
    drawLineChart();
});
drawBarChart();

const chartContainer = document.getElementById('chart');
function setChartHeight() {
    const panelHeight = getComputedStyle(document.querySelector(".panel")).height || "0px";
    chartContainer.style.height = `calc(100% - ${panelHeight} - 20px)`;
    chartContainer.style.width = `100%`;
}
setChartHeight()
// Resize chart on window resize
window.addEventListener('resize', () => {
    setChartHeight();
    chart.resize(chartContainer.clientWidth, chartContainer.clientHeight);
});

async function getNextBar(candleSeries, companyName, lastClose, timeStamp, timeChangeFactor) {
    const all = await fetchData();
    const company = all.find(c => c.name === companyName);
    console.log(company)
    
    console.log(timeStamp, lastClose, company.price)

    let nextBar = {
        time: timeStamp,
        open: lastClose,
        close: company.price,
        high: company.price + 5,
        low: lastClose - 5
    };
    timeStamp += timeChangeFactor;
    
    candleSeries.update(nextBar);
    
    lastClose = nextBar.close;
    setTimeout(async () => {
        await getNextBar(candleSeries, companyName, lastClose, timeStamp, timeChangeFactor)
    }, timeChangeFactor * 1000);
}

let chart;
async function showTradingChart(companyName) {
    console.log(companyName);

    const chartContainer = document.getElementById('chart');
    if (chart) {
        chartContainer.innerHTML = ''; // Remove previous chart's canvas
    }
    chart = LightweightCharts.createChart(document.getElementById('chart'), {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
        layout: {
            background: { color: '#0B1325' },
            textColor: '#d1d4dc',
        },
        grid: {
            vertLines: { color: '#2B2B43' },
            horzLines: { color: '#363C4E' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        timeScale: {
            timeVisible: true,
            secondsVisible: true,
        },
        rightPriceScale: {
            borderColor: '#485c7b',
        }
    });

    const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        borderVisible: false
    });

    // initial bar
    const all = await fetchData();
    const company = all.find(c => c.name === companyName);
    console.log(company)

    let timeStamp = Math.floor(Date.now() / 1000)

    const initialBar = {
        time: timeStamp,
        open: company.close,
        close: company.price,
        high: company.high,
        low: company.low,
    };
    let lastClose = initialBar.close;
    candleSeries.setData([initialBar]);

    let timeChangeFactor = 5;
    await getNextBar(candleSeries, companyName, lastClose, timeStamp, timeChangeFactor)
}
showTradingChart("Reliance Industries")

function getShortForm(companyName) {
    const shortForm = companyName
        .split(" ")
        .map(word => word[0])   // Take the first letter of each word
        .join("")
        .toUpperCase();
    if (shortForm.length < 2) {
        return companyName.slice(0, 3);
    } else {
        return shortForm.replace("(", "");
    }
}
async function showCompantList() {
    const data = await fetchData()

    const companyCardList = document.getElementById("company-card-list");
    companyCardList.innerHTML = "";
    const tickers = document.getElementById("tickers")
    tickers.innerHTML = ""

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalChange = 0;
    let companyLength = 0

    data.forEach(company => {
        totalRevenue += company.revenue;
        totalProfit += company.profit;
        totalChange += company.change_percent;
        companyLength++;

        let companyTrendRateIcon = company.change_percent > 0 ? "trand-increase.svg" : "trend-decrease.svg";
        let companyTrendRateColorClass = company.change_percent > 0 ? "metric-trend-up" : "metric-trend-dawn";

        companyCardList.innerHTML += `                                        
        <li class="company-card">
            <div class="company-card-header">
                <span class="company-logo"><img src="/static/logo/${company.symbol}.png" alt="company-logo"></span>
                <span class="company-name">${company.name}</span>
                </div>
                <div class="company-value-cont">
                <div class="left">
                    <div class="company-stock-price">$${inrToUsd(company.price)}</div>
                    <span class="company-industry">${company.industry}</span>
                </div>
                <div class="right">
                    <div class="company-trend ${companyTrendRateColorClass}">
                        <img src="/static/svgs/${companyTrendRateIcon}" alt="metric-trend">
                        <span class="trend-rate ${companyTrendRateColorClass}">${company.change_percent}</span>
                    </div>
                    <button class="details-btn">Details</button>
                    </div>
                    </div>
                    </li>`;
        tickers.innerHTML += `<button>${getShortForm(company.name)}</button>`

    });
    
    const trendValues = document.getElementsByClassName("metric-value-row")
    trendValues.innerHTML = ""

    let averageRevenue = (inrToUsd(totalRevenue) / companyLength).toFixed(2)
    let averageProfit = (inrToUsd(totalProfit) / companyLength).toFixed(2)
    let averageChange = (totalChange / companyLength).toFixed(2)

    let companyAverageTrendRateIcon = averageChange > 0 ? "trand-increase.svg" : "trend-decrease.svg";
    let companyAverageTrendRateColorClass = averageChange > 0 ? "metric-trend-up" : "metric-trend-dawn";

    trendValues[0].innerHTML = `
        <span class="metric-value">$${averageRevenue}</span>
        <span class="metric-trend ${companyAverageTrendRateColorClass}"><img src="/static/svgs/${companyAverageTrendRateIcon}" />${averageChange}%</span>`
    trendValues[1].innerHTML = `
       ?`
    trendValues[2].innerHTML = `
    <span class="metric-value">$${averageProfit}</span>
    <span class="metric-trend ${companyAverageTrendRateColorClass}"><img src="/static/svgs/${companyAverageTrendRateIcon}" />${averageChange}%</span>`
    
    const companiesNames = document.querySelectorAll(".company-name");
    
    const detailButtons = document.querySelectorAll(".details-btn")
    detailButtons.forEach((btn, i) => {
        btn.addEventListener("click", (e) => {
            document.getElementById("symbol").textContent = tickerButtons[i].textContent;
            document.getElementById("companyName").textContent = companiesNames[i];
            showTradingChart(companiesNames[i].innerHTML)
        })
    })
    // Active toggle for tickers
    const tickerButtons = document.querySelectorAll("#tickers button");
    tickerButtons.forEach((btn, i) => {
        btn.addEventListener("click", () => {
            tickerButtons.forEach(b => b.classList.remove("activebtn"));
            btn.classList.add("activebtn");
            document.getElementById("symbol").textContent = btn.textContent;
            document.getElementById("companyName").textContent = companiesNames[i];
            showTradingChart(companiesNames[i].innerHTML)
        });
    });
    if(tickerButtons) {
        tickerButtons[0].classList.add("activebtn")
    }

    const intervalButtons = document.querySelectorAll("#intervals button");
    intervalButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            intervalButtons.forEach(b => b.classList.remove("activebtn"));
            btn.classList.add("activebtn");
        });
    });
    if(intervalButtons) {
        intervalButtons[0].classList.add("activebtn")
    }
}
showCompantList()


console.log(window.innerWidth, window.innerHeight)

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
        root.setProperty('--section-border', '#e5e7eb');
        root.setProperty('--section-radius', '1.2rem');
        root.setProperty('--section-shadow', '1px 4px 20px 9px rgba(30, 41, 59, 0.08)');
        root.setProperty('--card-bg', '#c0d1f8');
        root.setProperty('--button-bg', '#4f8ef7');
        root.setProperty('--muted-text', '#64748b');
        root.setProperty('--active-tab-bg', '#aaa');


    } else {
        root.setProperty('--primary-text', 'white');
        root.setProperty('--primary-accent', '#4f8ef7');
        root.setProperty('--body-bg', 'linear-gradient(135deg, #00010F, #0f172a)');
        root.setProperty('--head-section-bg', 'linear-gradient(to right, #0f172a, #1e1b4b, #3b0764)');
        root.setProperty('--section-bg', '#0B1325');
        root.setProperty('--section-border', '#e5e7eb');
        root.setProperty('--section-radius', '1.2rem');
        root.setProperty('--section-shadow', '1px 4px 20px 9px rgba(30, 41, 59, 0.08)');
        root.setProperty('--card-bg', '#111827');
        root.setProperty('--button-bg', '#4f8ef7');
        root.setProperty('--muted-text', '#64748b');
        root.setProperty('--active-tab-bg', '#1643a8');
    }
}

document.querySelector(".buttons .themebtn").addEventListener("click", function (e) {
    this.style.backgroundColor = isDark ? ' #3b0764' : '#f8fafc';
    document.querySelectorAll("header aside button img").forEach(e => {
        e.classList.toggle("invert")
    })
    setTheme()
});

const metricsSection = document.querySelector(".metrics-section")
const marketSection = document.querySelector(".market-chart-section")
const tradingSection = document.querySelector(".trading-chart-section")
const newsSection = document.querySelector(".news-section")
const tradingBtn = document.getElementById("tradingbtn")
const marketBtn = document.getElementById("chartbtn")
const newsBtn = document.getElementById("newsbtn")

function activeTradingChange() {
    tradingSection.style.display = "flex"
    marketSection.style.display = "none"
    newsSection.style.display = "none"
    metricsSection.style.display = "grid"
    tradingBtn.style.backgroundColor = "var(--active-tab-bg)"
    marketBtn.style.backgroundColor = "var(--section-bg)"
    newsBtn.style.backgroundColor = "var(--section-bg)"
}
function activeMarketChange() {
    marketSection.style.display = "block"
    tradingSection.style.display = "none"
    newsSection.style.display = "none"
    metricsSection.style.display = "grid"
    marketBtn.style.backgroundColor = "var(--active-tab-bg)"
    tradingBtn.style.backgroundColor = "var(--section-bg)"
    newsBtn.style.backgroundColor = "var(--section-bg)"
}
function activeNewsChange() {
    newsSection.style.display = "block"
    marketSection.style.display = "none"
    tradingSection.style.display = "none"
    metricsSection.style.display = "none"
    newsBtn.style.backgroundColor = "var(--active-tab-bg)"
    marketBtn.style.backgroundColor = "var(--section-bg)"
    tradingBtn.style.backgroundColor = "var(--section-bg)"
}
activeTradingChange()

tradingBtn.addEventListener("click", () => {
    activeTradingChange()
})
marketBtn.addEventListener("click", () => {
    activeMarketChange()
})
newsBtn.addEventListener("click", () => {
    activeNewsChange()
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
    const res = await fetch("/stock-data");
    const data = await res.json();
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

const chartContainer = document.getElementById('charts-container');
function setChartHeight() {
    const panelHeight = getComputedStyle(document.querySelector(".panel")).height || "0px";
    chartContainer.style.height = `calc(100% - ${panelHeight} - 20px)`;
    chartContainer.style.width = `100%`;
}
setChartHeight()

const chartsByCompany = {};

async function getTradingCharts() {
    const all = await fetchData();

    all.forEach((company, i) => {
        const div = document.createElement("div");
        div.id = `chart-${getShortForm(company.name)}`;
        div.classList.add("charts")
        div.style.display = "none"
        document.getElementById('charts-container').appendChild(div);

        const chart = LightweightCharts.createChart(div, {
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
                tickMarkFormatter: (time) => {
                    const date = new Date(time * 1000);
                    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                }
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

        let timeStamp = Math.floor(Date.now() / 1000)
        const initialBar = {
            time: timeStamp,
            open: company.close,
            high: company.high,
            low: company.low,
            close: company.price,
            //   volume: company.volume || 0
        };
        console.log(`time: ${initialBar.time}, open: ${initialBar.open}, close: ${initialBar.close}`)

        candleSeries.setData([initialBar]);
        // Store references for updates & later “show”
        chartsByCompany[company.name] = {
            chart,
            candleSeries,
            data: [initialBar],
            time: timeStamp
        };
    })
    console.log(chartsByCompany);

    let intervalSec = 60;
    setTimeout(() => {
        setInterval(async () => {
            const latestData = await fetchData();
            const timeNow = Math.floor(Date.now() / 1000);

            latestData.forEach((company) => {
                const chartObj = chartsByCompany[company.name];
                if (!chartObj) return;

                const lastClose = chartObj.data.slice(-1)[0].close;

                const nextBar = {
                    // time: chartObj.time + intervalSec,
                    time: (timeNow || chartObj.time + intervalSec),
                    open: lastClose,
                    high: company.price + Math.floor(Math.random() * 6),
                    low: lastClose - Math.floor(Math.random() * 6),
                    close: company.price
                };
                console.log(`time: ${nextBar.time}, open: ${nextBar.open}, close: ${nextBar.close}`)

                chartObj.candleSeries.update(nextBar);
                chartObj.data.push(nextBar);
                chartObj.time = nextBar.time;
            })
        }, intervalSec * 1000);
    }, intervalSec * 1000);
}

async function showTradingChart(companyName) {
    document.querySelectorAll(".charts").forEach(ch => {
        ch.style.display = "none"
    })

    document.getElementById(`chart-${getShortForm(companyName)}`).style.display = "block"

    const tooltip = document.getElementById('tooltip');
    const [openEl, highEl, lowEl, closeEl] = tooltip.querySelectorAll(".tooltip-data");
    const timeEl = tooltip.querySelector("#time")

    const { chart, candleSeries } = chartsByCompany[companyName];

    chart.unsubscribeCrosshairMove();
    chart.subscribeCrosshairMove(param => {
        if (!param || !param.time || !param.seriesData.has(candleSeries)) {
            timeEl.textContent = openEl.textContent = highEl.textContent = lowEl.textContent = closeEl.textContent = "--";
            tooltip.style.display = "none"
            return;
        }
        tooltip.style.display = "block"

        data = param.seriesData.get(candleSeries);
        const time = new Date(param.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        timeEl.textContent = time;
        openEl.textContent = `$${data.open.toFixed(2)}`;
        highEl.textContent = `$${data.high.toFixed(2)}`;
        lowEl.textContent = `$${data.low.toFixed(2)}`;
        closeEl.textContent = `$${data.close.toFixed(2)}`;

        const rect = document.getElementById('charts-container').getBoundingClientRect();
        console.log(rect.left, window.scrollX, param.point.x)
        if (window.innerWidth - rect.left - param.point - 140 - 20 <= 0) {
            tooltip.style.left = rect.left + window.scrollX + param.point.x - 140 - 20 + 'px'; // rect.left - hori dist of chart from left window
        } else {
            tooltip.style.left = rect.left + window.scrollX + param.point.x + 20 + 'px';
        }
        if (window.innerHeight - rect.top - param.point.y - 130 - 20 <= 125) {
            tooltip.style.top = rect.top + window.scrollY + param.point.y - 130 - 20 + 'px'; // param.point.x - hori dist of candle form left chart
        } else {
            tooltip.style.top = rect.top + window.scrollY + param.point.y + 20 + 'px';
        }
    });
}
async function main() {
    await getTradingCharts()
    await showTradingChart("Reliance Industries")
}
main()

window.addEventListener('resize', () => {
    Object.values(chartsByCompany).forEach(obj => {
        obj.chart.resize(chartContainer.clientWidth, chartContainer.clientHeight);
    });
});
document.querySelector(".buttons .themebtn").addEventListener("click", function () {
    Object.values(chartsByCompany).forEach(obj => {
        obj.chart.applyOptions({
            layout: {
                background: { type: 'solid', color: isDark ? 'white' : '#0B1325' },
                textColor: isDark ? 'black' : '#d1d4dc',
            }
        });
    });
});

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
        totalChange += company.change_percent ?? 0;
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
                    <span class="trend-rate ${companyTrendRateColorClass}">${company.change_percent ?? 0}</span>
                    </div>
                    <button class="details-btn pointer">Details</button>
                    </div>
                    </div>
                    </li>`;
        tickers.innerHTML += `<button class="pointer">${getShortForm(company.name)}</button>`
    });
    document.querySelectorAll("#tickers button")[0].classList.add("activebtn")


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
        btn.addEventListener("click", () => {
            document.getElementById("symbol").textContent = tickerButtons[i].textContent;
            document.getElementById("companyName").textContent = companiesNames[i].innerHTML;
            tickerButtons.forEach(b => b.classList.remove("activebtn"));
            tickerButtons[i].classList.add("activebtn");
            showTradingChart(companiesNames[i].innerHTML)
        })
    })

    const tickerButtons = document.querySelectorAll("#tickers button");
    tickerButtons.forEach((btn, i) => {
        btn.addEventListener("click", () => {
            tickerButtons.forEach(b => b.classList.remove("activebtn"));
            btn.classList.add("activebtn");
            document.getElementById("symbol").textContent = btn.textContent;
            document.getElementById("companyName").textContent = companiesNames[i].innerHTML;
            showTradingChart(companiesNames[i].innerHTML)
        });
    });

    const intervalButtons = document.querySelectorAll("#intervals button");
    intervalButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            intervalButtons.forEach(b => b.classList.remove("activebtn"));
            btn.classList.add("activebtn");
        });
    });
}
showCompantList()


async function loadTopNews() {
    const res = await fetch("/news-data");
    const news = await res.json();
    const container = document.getElementById("news-container");
    if (!container) return;

    container.innerHTML = news.map(item => `
      <div class="news-item">
        <a href="${item.url}" target="_blank">${item.headline}</a>
        <p>${item.summary}</p>
        <small>${new Date(item.datetime * 1000).toLocaleString()}</small>
        <hr/>
      </div>
    `).join("");
}

document.addEventListener("DOMContentLoaded", loadTopNews);
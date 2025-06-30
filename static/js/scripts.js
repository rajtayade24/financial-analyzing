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
document.getElementById("tradingbtn").addEventListener("click", ()=> {
    tradingChart.style.display = "flex" 
    marketChart.style.display = "none"
})
document.getElementById("chartbtn").addEventListener("click", ()=> {
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
// Run it once on page load
handleResize();
// Also run it on window resize
window.addEventListener("resize", handleResize);
window.addEventListener("resize", () => {
    document.getElementById('chart')?.style.setProperty('width', '100%', 'important');
    document.querySelector('.trading-chart-cont')?.style.setProperty('width', '100%', 'important');
    document.querySelector('#chart div')?.style.setProperty('width', '100%', 'important');
    document.querySelector('#chart table')?.style.setProperty('width', '100%');
    document.querySelectorAll('#chart tr')[0]?.querySelectorAll('canvas')?.forEach(el => {
        el.style.setProperty('width', '100%', 'important');
        el.style.setProperty('height', '100%', 'important');
    });
    document.querySelectorAll('#chart tr')[1]?.querySelectorAll('canvas')?.forEach(el => {
        el.style.setProperty('width', '60px', 'important');
        el.style.setProperty('height', '100%', 'important');
    });


    let trs = document.querySelectorAll("#chart tr");
    let secondRowHeight = trs[1].offsetHeight;
    trs[0].style.height = `calc(100% - ${secondRowHeight + 20}px)`;
});


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

// CHARTs
function inrToUsd(inrAmount, exchangeRate = 83.20) {
    if (inrAmount < 0) {
        throw new Error("Amount cannot be negative.");
    }
    const usdAmount = inrAmount / exchangeRate;
    return usdAmount.toFixed(2); // returns a string with 2 decimal places
}

// Helper to destroy old chart2.
function resetChart(chartInstance) {
    if (chartInstance) {
        chartInstance.destroy();
    }
}

async function getCompanyData() {
    let response = fetch("/static/json/stock_data.json")
    let companyData = (await response).json()
    return companyData;
}

let chartInstance = null;
const ctx = document.getElementById("individual-company-data").getContext("2d")

async function drawLineChart() {
    resetChart(chartInstance);
    let company_data = await getCompanyData();

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
    let company_data = await getCompanyData()

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
    let company_data = await getCompanyData();

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

async function showCompantList() {
    const response = await fetch("/stock-data");
    const data = await response.json(); // now it's an array

    const companyCardList = document.getElementById("company-card-list");
    companyCardList.innerHTML = "";

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
          <span class="trend-rate">${company.change_percent}</span>
          </div>
          <button class="details-btn"><a href="company1_reliance_industry.html">Details ></a></button>
          </div>
          </div>
          </li>`;
          
        });
        
        const trendValues = document.getElementsByClassName("metric-value-row")
        trendValues.innerHTML = ""
        
        let averageRevenue = (inrToUsd(totalRevenue) / companyLength).toFixed(2)
        let averageProfit = (inrToUsd(totalProfit) /companyLength).toFixed(2)
        let averageChange = (totalChange / companyLength).toFixed(2)
        
        let companyAverageTrendRateIcon = averageChange > 0 ? "trand-increase.svg" : "trend-decrease.svg";
        let companyAverageTrendRateColorClass = averageChange > 0 ? "metric-trend-up" : "metric-trend-dawn";

    trendValues[0].innerHTML = `
    <span class="metric-value">$${averageRevenue}</span>
    <span class="metric-trend ${companyAverageTrendRateColorClass}"><img src="/static/svgs/${companyAverageTrendRateIcon}" />${averageChange}%</span>`
    trendValues[1].innerHTML = `?`

    trendValues[2].innerHTML = `
    <span class="metric-value">$${averageProfit}</span>
    <span class="metric-trend ${companyAverageTrendRateColorClass}"><img src="/static/svgs/${companyAverageTrendRateIcon}" />${averageChange}%</span>`
}
showCompantList()

async function getTradingData() {
    let response = fetch("/static/json/stock_data_append.json")
    let companyData = (await response).json()
    console.log(companyData);

    return companyData;
}
async function showTradingChart() {
    const chart = LightweightCharts.createChart(document.getElementById('chart'), {
        layout: {
            background: "var(--section-bg)",
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
            secondsVisible: false,
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

    const all_datas = await getTradingData()
    const companyName = "Reliance Industries"
    const initialData = []
    const timestamps = Object.keys(all_datas)

    timestamps.forEach((t, i) => {
        console.log(t)
        let data = all_datas[t]
        const company = data.find(c => c.name === companyName)

        initialData.push({
            time: Math.floor(t.trim()),
            open: company.price,
            close: company.previous_close,
            high: company.high,
            low: company.low
        });

    })
    console.log(initialData)
    candleSeries.setData(initialData);

    setInterval(() => {
        const nextTime = new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // +1 day
        const open = 1400;
        const close = open + (Math.random() * 10 - 5);
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;
        const newBar = {
            time: Math.floor(nextTime.getTime() / 1000),
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2)),
        };
        console.log(newBar);

        candleSeries.update(newBar);
        lastClose = newBar.close;
    }, 3000);

}
showTradingChart()
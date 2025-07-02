i have three major function 
1.

async function getTradingCharts() {
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
    const all = await fetchData();
    all.forEach((obj, i) => {
        company = obj.name
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

        let timeChangeFactor = 15;
        getNextBar(candleSeries, company, lastClose, timeStamp, timeChangeFactor)
    })
}
i want to store all the charts with updation by first function 

async function getNextBar(candleSeries, companyName, lastClose, timeStamp, timeChangeFactor) {
    const all = await fetchData();
    const company = all.find(c => c.name === companyName);
    console.log(company)

    console.log(timeStamp, lastClose, company.price)

    let nextBar = {
        time: timeStamp,
        open: lastClose,
        close: company.price,
        high: company.price + Math.floor(Math.random() * 6),
        low: lastClose - Math.floor(Math.random() * 6)
    };
    timeStamp += timeChangeFactor;

    candleSeries.update(nextBar);

    lastClose = nextBar.close;
    setTimeout(async () => {
        await getNextBar(candleSeries, companyName, lastClose, timeStamp, timeChangeFactor)
    }, timeChangeFactor * 1000);

    console.log(candleSeries)
}
then want to does all the updation of datas by second funtion 


async function showTradingChart(companyName) {
    const chartContainer = document.getElementById('chart');
    if (chart) {
        chartContainer.innerHTML = ''; // Remove previous chart's canvas
    } const tooltip = document.getElementById('tooltip');
    const [openEl, highEl, lowEl, closeEl] = tooltip.querySelectorAll(".tooltip-data");
    const timeEl = tooltip.querySelector("#time")

    chart.subscribeCrosshairMove(param => {
        if (!param || !param.time || !param.seriesData.has(candleSeries)) {
            timeEl.textContent = openEl.textContent = highEl.textContent = lowEl.textContent = closeEl.textContent = "--";
            tooltip.style.display = "none"
            return;
        }
        tooltip.style.display = "block"

        const data = param.seriesData.get(candleSeries);
        const time = new Date(param.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        timeEl.textContent = time;
        openEl.textContent = `$${data.open.toFixed(2)}`;
        highEl.textContent = `$${data.high.toFixed(2)}`;
        lowEl.textContent = `$${data.low.toFixed(2)}`;
        closeEl.textContent = `$${data.close.toFixed(2)}`;

        const rect = document.getElementById('chart').getBoundingClientRect();
        console.log(rect.left, window.scrollX, param.point.x)
        if (window.innerWidth - rect.left - param.point.x <= 140) {
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
   const company = all.find(c => c.name === companyName);
    console.log(company)
}


then i want to display all the charts by the third fuction note the chart should be real also updating with new data
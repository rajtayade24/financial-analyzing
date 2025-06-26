// Sample Data
const sampleData = [
    { name: "Jan", revenue: 27000, expenses: 11000 },
    { name: "Feb", revenue: 32000, expenses: 12500 },
    { name: "Mar", revenue: 44000, expenses: 17900 },
    { name: "Apr", revenue: 52000, expenses: 16000 },
    { name: "May", revenue: 38000, expenses: 14200 },
    { name: "Jun", revenue: 47000, expenses: 19700 }
];
// Calculate profit for pie chart
function getPieData() {
    let revenue = 0, expenses = 0, profit = 0;
    sampleData.forEach(d => {
        revenue += d.revenue;
        expenses += d.expenses;
        profit += (d.revenue - d.expenses);
    });
    return [
        { label: "Revenue", value: revenue, color: "#4f8ef7" },
        { label: "Expenses", value: expenses, color: "#eab308" },
        { label: "Profit", value: profit, color: "#34d399" }
    ];
}

// Chart.js rendering logic
let chartInstance = null;
const ctx = document.getElementById("financialChart").getContext("2d");

// Helper to destroy old chart
function resetChart() {
    if (chartInstance) {
        chartInstance.destroy();
    }
}

// Render bar chart (Revenue & Expenses over months)
function drawBarChart() {
    resetChart();
    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: sampleData.map(d => d.name),
            datasets: [
                {
                    label: "Revenue",
                    data: sampleData.map(d => d.revenue),
                    backgroundColor: "#4f8ef7"
                },
                {
                    label: "Expenses",
                    data: sampleData.map(d => d.expenses),
                    backgroundColor: "#eab308"
                }
            ]
        },
        options: {
            plugins: {
                legend: { display: true },
                tooltip: { backgroundColor: "#fff", borderColor: "#ddd", borderWidth: 1, titleColor: "#1e293b", bodyColor: "#1e293b" }
            },
            responsive: true,
            scales: {
                x: { grid: { color: "#e5e7eb" } },
                y: { beginAtZero: true, grid: { color: "#e5e7eb" } }
            }
        }
    });
}

// Render pie chart (Revenue vs Expenses vs Profit)
function drawPieChart() {
    resetChart();
    const pieData = getPieData();
    chartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: pieData.map(d => d.label),
            datasets: [{
                data: pieData.map(d => d.value),
                backgroundColor: pieData.map(d => d.color)
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

// Chart toggle logic
document.getElementById("barChartBtn").addEventListener("click", function () {
    this.classList.add("active");
    document.getElementById("pieChartBtn").classList.remove("active");
    drawBarChart();
});
document.getElementById("pieChartBtn").addEventListener("click", function () {
    this.classList.add("active");
    document.getElementById("barChartBtn").classList.remove("active");
    drawPieChart();
});

function inrToUsd(inrAmount, exchangeRate = 83.20) {
    if (inrAmount < 0) {
        throw new Error("Amount cannot be negative.");
    }
    const usdAmount = inrAmount / exchangeRate;
    return usdAmount.toFixed(2); // returns a string with 2 decimal places
}

function deletePriviousChart(currentChart) {
    if (currentChart) {
        currentChart.destroy();
    }
}
// Set current year in footer and draw first chart
document.getElementById("currentYear").textContent = new Date().getFullYear();
drawBarChart();

async function getCompanyData() {
    let response = fetch("/static/js/stock_data.json")
    let companyData = (await response).json()
    return companyData;
}

let currentChart = null;
const newctx = document.getElementById("individual-company-data").getContext("2d")

async function showChart() {
    deletePriviousChart(currentChart);
    company_data = await getCompanyData();

    currentChart = new Chart(newctx, {
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
showChart()

async function getCompanyData_append() {
    let response = fetch("/static/js/stock_data_append.json")
    let company_data = (await response).json()
    return company_data;
}

let currentChart_append = null;
const newctx_append = document.getElementById("company-data").getContext("2d")

async function showChart_append() {
    deletePriviousChart(currentChart_append);

    const all_datas = await getCompanyData_append()
    const companyName = "Reliance Industries"
    const prices = []
    const times = []
    const timestamps = Object.keys(all_datas)

    timestamps.forEach(time => {
        times.push(time)

        let data = all_datas[time]
        const company = data.find(c => c.name === companyName)

        if (company && company.price !== null) {
            prices.push(inrToUsd(company.price))
        }
        else {
            prices.push(null) //maintain timeline continuity
        }
    })

    currentChart_append = new Chart(newctx_append, {
        // type: "candlestick",
        type: "line",
        data: {
            labels: times,
            datasets: [
                {
                    label: "market_capital",
                    data: prices,
                    fill: false,
                    tension: 0.1,
                    hoverBorderWidth: 50,
                    backgroundColor: ["red", "blue", "pink"],
                    pointBorderColor: "grey",
                    borderColor: "#4f8ef7"
                }
            ]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        autoSkip: false,
                        maxRotation: 90,
                        stepSize: 0.001,
                        color: "#000"
                    }
                },
                y: {
                    //                 min: 17.6,
                    // max: 18.0,
                    ticks: {
                        callback: value => "$" + value,
                        color: "#000",
                        stepSize: 0.02,
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: "#000"
                    }
                }
            }
        }
    })
    const scrollContainer = document.querySelector(".company-price-analylizer");
    scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    scrollContainer.scrolltop = scrollContainer.scrollHeight;
}

showChart_append()

const canvasWrapper = document.getElementById('company-data');
// WrapcanvasWrapper inside a parent element
const container = canvasWrapper.parentElement;

// let scale = 1;
// let minScale = 0.2;
// let maxScale = 2;

// let isDragging = false;
// let lastX = 0;
// let lastY = 0;

// let translateX = 0;
// let translateY = 0;

// function clampTranslate() {
//     const canvasWidth = canvasWrapper.offsetWidth * scale;
//     const canvasHeight = canvasWrapper.offsetHeight * scale;
//     const containerWidth = container.offsetWidth;
//     const containerHeight = container.offsetHeight;

//     // Clamp horizontal (X)
//     if (canvasWidth > containerWidth) {
//         translateX = Math.min(0, Math.max(translateX, containerWidth - canvasWidth));
//     } else {
//         translateX = (containerWidth - canvasWidth) / 2; // center if smaller
//     }

//     // Clamp vertical (Y)
//     if (canvasHeight > containerHeight) {
//         translateY = Math.min(0, Math.max(translateY, containerHeight - canvasHeight));
//     } else {
//         translateY = (containerHeight - canvasHeight) / 2; // center if smaller
//     }
// }
// function updateTransform() {
//     clampTranslate();
//     canvasWrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
//     canvasWrapper.style.transformOrigin = "0 0";
// }
// // Zoom with Ctrl + Wheel
// container.addEventListener('wheel', (e) => {
//     if (e.ctrlKey) {
//         e.preventDefault();
//         console.log(e.deltay)
//         const zoomFactor = 0.1;
//         const newScale = scale - (e.deltaY > 0 ? zoomFactor : -zoomFactor);

//         scale = Math.max(minScale, Math.min(maxScale, newScale));
//         updateTransform();
//     }
// }, { passive: false });

// // Mouse down to start drag
// container.addEventListener('mousedown', (e) => {
//     if (e.button === 0) { // left button only
//         isDragging = true;
//         console.log(e.clientX, e.clientY)
//         lastX = e.clientX;
//         lastY = e.clientY;
//     }
// });

// // Mouse move for dragging
// container.addEventListener('mousemove', (e) => {
//     if (isDragging) {
//         const dx = e.clientX - lastX;
//         const dy = e.clientY - lastY;
//         translateX += dx;
//         translateY += dy;
//         lastX = e.clientX;
//         lastY = e.clientY;
//         updateTransform();
//     }
//     canvasWrapper.style.cursor = "grabbing";
// });

// // Mouse up to stop drag
// container.addEventListener('mouseup', () => {
//     isDragging = false;
// });

// // Also stop drag on mouse leaving window
// container.addEventListener('mouseleave', () => {
//     isDragging = false;
// });

// // Initial transform
// updateTransform();

let isDragging = false;
let startX, startY;
let scrollLeft, scrollTop;

container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    startY = e.pageY - container.offsetTop;
    scrollLeft = container.scrollLeft;
    scrollTop = container.scrollTop;
    container.style.cursor = 'grabbing';
});

container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    const walkX = x - startX;
    const walkY = y - startY;
    container.scrollLeft = scrollLeft - walkX;
    container.scrollTop = scrollTop - walkY;
});

container.addEventListener('mouseleave', () => {
    isDragging = false;
    container.style.cursor = 'default';
});

container.addEventListener('mouseup', () => {
    isDragging = false;
    container.style.cursor = 'default';
});

let scale = 1;
let minScale = 0.2;
let maxScale = 2;

// Initial transform
canvasWrapper.style.transformOrigin = "0 0";
canvasWrapper.style.transform = `scale(${scale})`;

function clampTranslate() {
    const canvasWidth = canvasWrapper.offsetWidth * scale;
    const canvasHeight = canvasWrapper.offsetHeight * scale;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Clamp horizontal (X)
    if (canvasWidth > containerWidth) {
        translateX = Math.min(0, Math.max(translateX, containerWidth - canvasWidth));
    } else {
        translateX = (containerWidth - canvasWidth) / 2; // center if smaller
    }

    // Clamp vertical (Y)
    if (canvasHeight > containerHeight) {
        translateY = Math.min(0, Math.max(translateY, containerHeight - canvasHeight));
    } else {
        translateY = (containerHeight - canvasHeight) / 2; // center if smaller
    }
}
container.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault(); // Prevent default zoom

        const zoomIntensity = 0.1;
        const newScale = scale - (e.deltaY > 0 ? zoomIntensity : -zoomIntensity);

        scale = Math.min(Math.max(newScale, minScale), maxScale);

        canvasWrapper.style.transform = `scale(${scale})`;
        clampTranslate()
    }
}, { passive: false });
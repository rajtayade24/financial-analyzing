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

// Set current year in footer and draw first chart
document.getElementById("currentYear").textContent = new Date().getFullYear();
drawBarChart();

async function getCompanyData() {
    let response = fetch("/static/js/stock_data.json")
    let companyData = (await response).json()
    return companyData;
}


function inrToUsd(inrAmount, exchangeRate = 83.20) {
    if (inrAmount < 0) {
        throw new Error("Amount cannot be negative.");
    }
    const usdAmount = inrAmount / exchangeRate;
    return usdAmount.toFixed(2); // returns a string with 2 decimal places
}
let currentChart = null;
const newctx = document.getElementById("company-data").getContext("2d")

function deletePriviousChart() {
    if (currentChart) {
        currentChart.destroy();
    }
}
async function showChart() {
    deletePriviousChart();
    company_data = await getCompanyData();
    data = company_data.map(c => c.name)
    console.log(data)
    currentChart = new Chart(newctx, {
        type: "line",
        data: {
            labels: company_data.map(company => company.name),
            datasets: [
                {
                    label: "market_capital",
                    data: company_data.map(company => inrToUsd(company.market_capital)),
                    // data: company_data.map(company => inrToUsd(company.price)),
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
            scales: {
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
function inrToUsd(inrAmount, exchangeRate = 83.20) {
  if (inrAmount < 0) {
    throw new Error("Amount cannot be negative.");
  }
  const usdAmount = inrAmount / exchangeRate;
  return usdAmount.toFixed(2); // returns a string with 2 decimal places
}

async function loadStockData() {
  const response = await fetch("/stock-data");
  const data = await response.json(); // now it's an array

  const companyCardList = document.getElementById("company-card-list");
  console.log(companyCardList)  
  companyCardList.innerHTML = "";

  data.forEach(company => {
    const priceText = company.price !== null ? `₹${company.price}` : "No data";
    let companyTrendRateIcon = company.change_percent > 0 ? "trend-increase.svg" : "trend-decrease.svg";
    companyCardList.innerHTML += `
    <li class="company-card">
      <div class="company-card-header">
        <span class="company-logo"><img src="logos/${company.symbol}.svg" alt="company-logo"></span>
        <span class="company-name">${company.name}</span>
      </div>
      <div class="company-value-cont">
        <span class="company-capital">$${inrToUsd(company.market_capital)}</span>
        <span class="company-trend">
          <img src="svgs/${companyTrendRateIcon}" alt="metric-trend">
          <span class="trend-rate">${company.change_percent}</span>
        </span>
      </div>
      <div class="company-industry-cont">
        <div class="company-stock-price">${inrToUsd(priceText)}</div>
        <span class="company-industry">$${company.industry}</span>
        <button class="details-btn"><a href="company1_reliance_industry.html">Details ></a></button>
      </div>
    </li>`;

  });
}
loadStockData();











// async function getStockData() {
//   const response = await fetch("stock_data_full.json");
//   const stockData = await response.json();

//   console.log(stockData); // Logs the full array

//   let stock_prices = document.querySelectorAll(".company-stock-price")
//   let comapny_value = document.querySelectorAll(".company-value-cont .company-value")
//   let trend_rate = document.querySelectorAll(".trend-rate");
//   console.log(stock_prices, comapny_value, trend_rate)

//   stockData.forEach((company, i) => {
//     console.log(company.price, stock_prices[i]);
//     stock_prices[i].textContent = `$${inrToUsd(company.price)}`
//     // comapny_value[i].textContent =  `$${inrToUsd(company.market_cap)}`
//     trend_rate[i].textContent = `+${company.change_percent}`
//   });
// }
// getStockData();

import { useEffect, useState } from "react";
import { searchCoin, marketChart, getCoinById } from "../../services/cryptoApi.js";
import { RotatingLines } from "react-loader-spinner";

import styles from "./Search.module.css";

function Search({ currency, setCurrency, setChart }) {
  const [text, setText] = useState("");
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setCoins([]);
    if (!text) {
      setIsLoading(false);
      return;
    }
    const search = async () => {
      try {
        const res = await fetch(searchCoin(text), {
          signal: controller.signal,
        });
        const json = await res.json();
        if (json.coins) {
          setCoins(json.coins);
          setIsLoading(false);
        } else {
          alert(json.status.error_message);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          alert(error.message);
        }
      }
    };
    setIsLoading(true);
    search();

    return () => controller.abort();
  }, [text]);

  return (
    <div className={styles.searchBox}>
      <input
        type="text"
        placeholder="Search for cryptocurrencies..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="usd">USD</option>
        <option value="eur">EUR</option>
        <option value="jpy">JPY</option>
      </select>
      {(!!coins.length || isLoading) && (
        <div className={styles.searchResult}>
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <RotatingLines
                width="50px"
                height="50px"
                strokeWidth="3"
                strokeColor="#6366f1"
              />
            </div>
          )}
          <ul>
            {coins.map((coin) => (
              <li 
                key={coin.id}
                onClick={async () => {
                  try {
                    const currencyLower = currency.toLowerCase();
                    // Fetch full coin data and chart
                    const [coinRes, chartRes] = await Promise.all([
                      fetch(getCoinById(coin.id)),
                      fetch(marketChart(coin.id, currencyLower))
                    ]);
                    
                    const coinData = await coinRes.json();
                    const chartData = await chartRes.json();
                    
                    // Create coin object similar to TableCoin
                    const coinInfo = {
                      id: coinData.id,
                      name: coinData.name,
                      symbol: coinData.symbol,
                      image: coinData.image?.large || coinData.image?.small || coin.thumb,
                      current_price: coinData.market_data?.current_price?.[currencyLower] || 0,
                      ath: coinData.market_data?.ath?.[currencyLower] || 0,
                      market_cap: coinData.market_data?.market_cap?.[currencyLower] || 0,
                    };
                    
                    setChart({ ...chartData, coin: coinInfo });
                    setText(""); // Clear search after selection
                    setCoins([]); // Clear results
                  } catch (error) {
                    console.error("Error fetching coin data:", error);
                    alert("Error fetching coin data");
                  }
                }}
              >
                <img src={coin.thumb} alt={coin.name} />
                <p>{coin.name}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Search;

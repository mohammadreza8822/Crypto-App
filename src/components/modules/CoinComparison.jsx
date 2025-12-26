import { useState, useEffect } from "react";
import {
  CartesianGrid,
  LineChart,
  ResponsiveContainer,
  Line,
  YAxis,
  XAxis,
  Legend,
  Tooltip,
} from "recharts";
import { marketChart, getCoinById, searchCoin } from "../../services/cryptoApi.js";
import { RotatingLines } from "react-loader-spinner";
import styles from "./CoinComparison.module.css";

function CoinComparison({ currency, coins, onClose }) {
  const [selectedCoins, setSelectedCoins] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [timeFrame, setTimeFrame] = useState(7); // 1, 7, 30, 365
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const timeFrames = [
    { label: "1 Day", value: 1 },
    { label: "1 Week", value: 7 },
    { label: "1 Month", value: 30 },
    { label: "1 Year", value: 365 },
  ];

  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  useEffect(() => {
    if (selectedCoins.length > 0) {
      fetchComparisonData();
    }
  }, [selectedCoins, currency, timeFrame]);

  // Search functionality
  useEffect(() => {
    const controller = new AbortController();
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const search = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(searchCoin(searchQuery), {
          signal: controller.signal,
        });
        const json = await res.json();
        if (json.coins) {
          setSearchResults(json.coins.slice(0, 10)); // Limit to 10 results
          setShowSearchResults(true);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Search error:", error);
        }
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      search();
    }, 300); // Debounce

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const fetchComparisonData = async () => {
    setIsLoading(true);
    try {
      const promises = selectedCoins.map(async (coinId) => {
        const [coinRes, chartRes] = await Promise.all([
          fetch(getCoinById(coinId)),
          fetch(marketChart(coinId, currency.toLowerCase(), timeFrame)),
        ]);
        const coinData = await coinRes.json();
        const chartData = await chartRes.json();
        return { coin: coinData, chart: chartData };
      });

      const results = await Promise.all(promises);
      setComparisonData(results);

      // Merge chart data
      const mergedData = mergeChartData(results);
      setChartData(mergedData);
    } catch (error) {
      console.error("Error fetching comparison data:", error);
      alert("Error fetching comparison data");
    } finally {
      setIsLoading(false);
    }
  };

  const mergeChartData = (results) => {
    if (results.length === 0) return [];

    // Find the minimum length to ensure all coins have data
    const minLength = Math.min(...results.map(r => r.chart.prices?.length || 0));
    if (minLength === 0) return [];

    // Get first prices for each coin to calculate percentage change
    const firstPrices = {};
    results.forEach((result) => {
      const coinSymbol = result.coin.symbol.toUpperCase();
      if (result.chart.prices && result.chart.prices.length > 0) {
        firstPrices[coinSymbol] = result.chart.prices[0][1];
      }
    });

    // Use the first chart as reference for timestamps
    const firstChart = results[0].chart.prices;
    
    const merged = [];
    
    // Process data points up to minimum length
    for (let index = 0; index < minLength; index++) {
      const timestamp = firstChart[index][0];
      const date = new Date(timestamp);
      let dateLabel;
      
      // Format date based on time frame
      if (timeFrame === 1) {
        dateLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (timeFrame === 7) {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (timeFrame === 30) {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      const dataPoint = {
        date: dateLabel,
        timestamp: timestamp,
      };

      // Calculate percentage change for each coin
      results.forEach((result) => {
        const coinSymbol = result.coin.symbol.toUpperCase();
        if (result.chart.prices && result.chart.prices[index] && firstPrices[coinSymbol]) {
          const currentPrice = result.chart.prices[index][1];
          const firstPrice = firstPrices[coinSymbol];
          // Calculate percentage change from first price
          const percentageChange = ((currentPrice - firstPrice) / firstPrice) * 100;
          dataPoint[coinSymbol] = percentageChange;
        }
      });

      merged.push(dataPoint);
    }

    return merged;
  };

  const toggleCoin = (coin) => {
    const coinId = coin.id;
    if (selectedCoins.includes(coinId)) {
      setSelectedCoins(selectedCoins.filter((id) => id !== coinId));
    } else {
      if (selectedCoins.length < 5) {
        setSelectedCoins([...selectedCoins, coinId]);
        setSearchQuery(""); // Clear search after selection
        setShowSearchResults(false);
      } else {
        alert("Maximum 5 coins can be compared");
      }
    }
  };

  const removeCoin = (coinId) => {
    setSelectedCoins(selectedCoins.filter((id) => id !== coinId));
  };

  const getSelectedCoinInfo = (coinId) => {
    return comparisonData.find((data) => data.coin.id === coinId)?.coin;
  };

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close comparison">
          ×
        </button>

        <div className={styles.header}>
          <h2>Compare Coins</h2>
          <p>Select up to 5 coins to compare</p>
        </div>

        <div className={styles.coinSelector}>
          <div className={styles.selectorHeader}>
            <h3>Select Coins:</h3>
            <div className={styles.timeFrameSelector}>
              <span>Time Frame:</span>
              <div className={styles.timeFrameButtons}>
                {timeFrames.map((tf) => (
                  <button
                    key={tf.value}
                    className={`${styles.timeFrameButton} ${
                      timeFrame === tf.value ? styles.active : ""
                    }`}
                    onClick={() => setTimeFrame(tf.value)}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search coins (name or symbol)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchResults(true);
              }}
            />
            {isSearching && (
              <div className={styles.searchLoader}>
                <RotatingLines
                  width="20px"
                  height="20px"
                  strokeWidth="3"
                  strokeColor="#6366f1"
                />
              </div>
            )}
            {showSearchResults && searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((coin) => {
                  const isSelected = selectedCoins.includes(coin.id);
                  return (
                    <div
                      key={coin.id}
                      className={`${styles.searchResultItem} ${
                        isSelected ? styles.selected : ""
                      }`}
                      onClick={() => toggleCoin(coin)}
                    >
                      <img src={coin.thumb} alt={coin.name} />
                      <div className={styles.searchResultInfo}>
                        <span className={styles.searchResultName}>{coin.name}</span>
                        <span className={styles.searchResultSymbol}>
                          {coin.symbol.toUpperCase()}
                        </span>
                      </div>
                      {isSelected && <span className={styles.checkmark}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Coins */}
          {selectedCoins.length > 0 && (
            <div className={styles.selectedCoins}>
              <h4>Selected Coins:</h4>
              <div className={styles.selectedCoinsList}>
                {selectedCoins.map((coinId) => {
                  const coinInfo = getSelectedCoinInfo(coinId);
                  if (!coinInfo) return null;
                  return (
                    <div key={coinId} className={styles.selectedCoinBadge}>
                      <img
                        src={coinInfo.image?.small || coinInfo.image?.large}
                        alt={coinInfo.name}
                      />
                      <span>{coinInfo.symbol.toUpperCase()}</span>
                      <button
                        onClick={() => removeCoin(coinId)}
                        className={styles.removeButton}
                        aria-label="Remove coin"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Popular Coins */}
          <div className={styles.popularCoins}>
            <h4>Popular Coins:</h4>
            <div className={styles.coinList}>
              {coins.slice(0, 20).map((coin) => {
                const isSelected = selectedCoins.includes(coin.id);
                return (
                  <button
                    key={coin.id}
                    className={`${styles.coinButton} ${isSelected ? styles.selected : ""}`}
                    onClick={() => toggleCoin(coin)}
                    disabled={!isSelected && selectedCoins.length >= 5}
                  >
                    <img src={coin.image} alt={coin.name} />
                    <span>{coin.symbol.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedCoins.length > 0 && (
          <div className={styles.comparisonSection}>
            <h3>Comparison Chart:</h3>
            {isLoading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <>
                <div className={styles.chartContainer}>
                  <div className={styles.chartHeader}>
                    <h4>Price Change Percentage Chart</h4>
                    <p>Comparison based on percentage change from starting point</p>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="rgba(255, 255, 255, 0.5)"
                        tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
                      />
                      <YAxis
                        stroke="rgba(255, 255, 255, 0.5)"
                        tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
                        tickFormatter={(value) => `${value.toFixed(2)}%`}
                        label={{ 
                          value: 'Percentage Change', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: 'rgba(255, 255, 255, 0.7)' }
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(30, 39, 70, 0.95)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                        labelStyle={{ color: "#a0aec0" }}
                        formatter={(value, name) => {
                          return [`${value.toFixed(2)}%`, name];
                        }}
                      />
                      <Legend
                        wrapperStyle={{ color: "rgba(255, 255, 255, 0.8)" }}
                      />
                      {selectedCoins.map((coinId, index) => {
                        const coinInfo = getSelectedCoinInfo(coinId);
                        if (!coinInfo) return null;
                        return (
                          <Line
                            key={coinId}
                            type="monotone"
                            dataKey={coinInfo.symbol.toUpperCase()}
                            stroke={colors[index % colors.length]}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                            name={`${coinInfo.name} (${coinInfo.symbol.toUpperCase()})`}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className={styles.statsGrid}>
                  {selectedCoins.map((coinId) => {
                    const coinInfo = getSelectedCoinInfo(coinId);
                    if (!coinInfo) return null;
                    const marketData = coinInfo.market_data;
                    const currencyLower = currency.toLowerCase();
                    const symbol =
                      currencyLower === "jpy"
                        ? "¥"
                        : currencyLower === "eur"
                        ? "€"
                        : "$";

                    return (
                      <div key={coinId} className={styles.statCard}>
                        <div className={styles.statHeader}>
                          <img
                            src={coinInfo.image?.large || coinInfo.image?.small}
                            alt={coinInfo.name}
                          />
                          <div>
                            <h4>{coinInfo.name}</h4>
                            <p>{coinInfo.symbol.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className={styles.statDetails}>
                          <div>
                            <span>Price:</span>
                            <strong>
                              {symbol}
                              {marketData?.current_price?.[currencyLower]?.toLocaleString() ||
                                0}
                            </strong>
                          </div>
                          <div>
                            <span>24h Change:</span>
                            <strong
                              className={
                                marketData?.price_change_percentage_24h > 0
                                  ? styles.positive
                                  : styles.negative
                              }
                            >
                              {marketData?.price_change_percentage_24h?.toFixed(2) || 0}%
                            </strong>
                          </div>
                          <div>
                            <span>Market Cap:</span>
                            <strong>
                              {symbol}
                              {marketData?.market_cap?.[currencyLower]?.toLocaleString() || 0}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {selectedCoins.length === 0 && (
          <div className={styles.emptyState}>
            <p>Please select coins to compare</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoinComparison;


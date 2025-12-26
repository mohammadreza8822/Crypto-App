import { useEffect, useState, useRef } from "react";
import TableCoin from "../modules/TableCoin";
import { getCoinList } from "../../services/cryptoApi.js";
import Pagination from "../modules/Pagination";
import Search from "../modules/Search";
import Chart from "../modules/Chart";
import CoinComparison from "../modules/CoinComparison";
import styles from "./HomePage.module.css";

function HomePage() {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [currency, setCurrency] = useState("USD");
  const [chart, setChart] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(getCoinList(page, currency));
        const json = await res.json();
        setCoins(json);
      } catch (error) {
        console.error("Error fetching coins:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Real-time updates every 1 minute (60000 ms)
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval for 1 minute
    intervalRef.current = setInterval(() => {
      fetchData();
    }, 60000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [page, currency]);

  return (
    <div>
      <div className={styles.actionsBar}>
        <button
          onClick={() => setShowComparison(true)}
          className={styles.compareButton}
        >
          <span className={styles.compareIcon}>📊</span>
          Compare Coins
        </button>
        <div className={styles.realtimeIndicator}>
          <span className={styles.indicatorDot}></span>
          Auto-update every 1 minute
        </div>
      </div>
      <Search currency={currency} setCurrency={setCurrency} setChart={setChart} />
      <TableCoin
        coins={coins}
        isLoading={isLoading}
        currency={currency}
        setChart={setChart}
      />
      <Pagination page={page} setPage={setPage} />
      {!!chart && <Chart chart={chart} setChart={setChart} currency={currency} />}
      {showComparison && (
        <CoinComparison
          currency={currency}
          coins={coins}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}

export default HomePage;

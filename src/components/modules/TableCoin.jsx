import { RotatingLines } from "react-loader-spinner";

import chartUp from "../../assets/chart-up.svg";
import chartDown from "../../assets/chart-down.svg";

import styles from "./TableCoin.module.css";
import { marketChart } from "../../services/cryptoApi.js";

function TableCoin({ coins, isLoading, currency, setChart }) {
  return (
    <div className={styles.container}>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <RotatingLines strokeColor="#6366f1" strokeWidth="3" width="60" />
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Coin</th>
              <th>Name</th>
              <th>Price</th>
              <th>24h</th>
              <th>Total Volume</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => (
              <TableRow
                coin={coin}
                key={coin.id}
                currency={currency}
                setChart={setChart}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TableCoin;

const TableRow = ({ coin, currency, setChart }) => {
  const {
    id,
    name,
    image,
    symbol,
    total_volume,
    current_price,
    price_change_percentage_24h: price_change,
  } = coin;

  const showHandler = async () => {
    try {
      const res = await fetch(marketChart(id, currency.toLowerCase()));
      const json = await res.json();
      setChart({ ...json, coin });
    } catch (error) {
      setChart(null);
    }
  };

  return (
    <tr>
      <td data-label="Coin">
        <div className={styles.symbol} onClick={showHandler}>
          <img src={image} alt={name} />
          <span>{symbol.toUpperCase()}</span>
        </div>
      </td>
      <td data-label="Name">{name}</td>
      <td data-label="Price">
        <div className={styles.priceContainer}>
          <span className={styles.priceValue}>
            {currency === "jpy" ? "¥" : currency === "eur" ? "€" : "$"}
            {current_price.toLocaleString()}
          </span>
          {price_change && (
            <span className={`${styles.priceTrend} ${price_change > 0 ? styles.trendUp : styles.trendDown}`}>
              {price_change > 0 ? '📈' : '📉'}
            </span>
          )}
        </div>
      </td>
      <td data-label="24h">
        {price_change !== null && price_change !== undefined ? (
          <div className={`${styles.priceChange} ${price_change > 0 ? styles.success : price_change < 0 ? styles.error : styles.neutral}`}>
            <span className={styles.priceChangeValue}>
              {price_change > 0 ? '+' : ''}{price_change.toFixed(2)}%
            </span>
            <span className={styles.priceChangeIcon}>
              {price_change > 0 ? '↗' : price_change < 0 ? '↘' : '→'}
            </span>
            {Math.abs(price_change) > 5 && (
              <span className={styles.priceChangeBadge}>
                {Math.abs(price_change) > 10 ? '🔥' : '⚡'}
              </span>
            )}
          </div>
        ) : (
          <div className={`${styles.priceChange} ${styles.neutral}`}>
            <span className={styles.priceChangeValue}>N/A</span>
          </div>
        )}
      </td>
      <td data-label="Total Volume">{total_volume.toLocaleString()}</td>
      <td data-label="">
        <img src={price_change > 0 ? chartUp : chartDown} alt={name} />
      </td>
    </tr>
  );
};

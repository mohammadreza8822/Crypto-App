import styles from "./Chart.module.css";
import { convertData } from "../../helpers/convertData";
import { useState } from "react";
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

function Chart({ chart, setChart, currency = "USD" }) {
  const [type, setType] = useState("prices");
  
  const getCurrencySymbol = () => {
    const currencyLower = currency.toLowerCase();
    return currencyLower === "jpy" ? "¥" : currencyLower === "eur" ? "€" : "$";
  };

  const typeHandler = (event) => {
    if (event.target.tagName === "BUTTON") {
      const type = event.target.innerText.toLowerCase().replace(" ", "_");
      setType(type);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.cross} onClick={() => setChart(null)} aria-label="Close chart">
        ×
      </button>
      <div className={styles.chart}>
        <div className={styles.name}>
          <img src={chart.coin.image} />
          <p>{chart.coin.name}</p>
        </div>
        <div className={styles.graph}>
          <ChartComponent data={convertData(chart, type)} type={type} />
        </div>
        <div className={styles.types} onClick={typeHandler}>
          <button className={type === "prices" ? styles.selected : null}>
            Prices
          </button>
          <button className={type === "market_caps" ? styles.selected : null}>
            Market Caps
          </button>
          <button className={type === "total_volumes" ? styles.selected : null}>
            Total Volumes
          </button>
        </div>
        <div className={styles.details}>
          <div>
            <p>Prices:</p>
            <span>{getCurrencySymbol()}{chart.coin.current_price?.toLocaleString() || 0}</span>
          </div>
          <div>
            <p>ATH:</p>
            <span>{getCurrencySymbol()}{chart.coin.ath?.toLocaleString() || 0}</span>
          </div>
          <div>
            <p>Market Cap:</p>
            <span>{getCurrencySymbol()}{chart.coin.market_cap?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chart;

const ChartComponent = ({ data, type }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart width={400} height={400} data={data}>
        <Line
          type="monotone"
          dataKey={type}
          stroke="#6366f1"
          strokeWidth="3px"
          dot={false}
          activeDot={{ r: 6, fill: "#8b5cf6" }}
        />
        <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
        <YAxis 
          dataKey={type} 
          domain={["auto", "auto"]} 
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
        />
        <XAxis 
          dataKey="date" 
          hide 
        />
        <Legend 
          wrapperStyle={{ color: "rgba(255, 255, 255, 0.8)" }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "rgba(30, 39, 70, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            color: "#fff"
          }}
          labelStyle={{ color: "#a0aec0" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

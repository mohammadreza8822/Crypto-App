const BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = "x_cg_demo_api_key=CG-oFdNY8SaZ5GADpct286ZyHah";

const getCoinList = (page) => {
  return `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=${page}&${API_KEY}`;
};

export default getCoinList;

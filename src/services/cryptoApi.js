const BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = "x_cg_demo_api_key=CG-oFdNY8SaZ5GADpct286ZyHah";

const getCoinList = (page, currency) => {
  return `${BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=20&page=${page}&${API_KEY}`;
};

const searchCoin = (query) => `${BASE_URL}/search?query=${query}&${API_KEY}`;

export { getCoinList, searchCoin };

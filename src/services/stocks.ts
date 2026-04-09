import type { Asset } from '../types';

// Top stocks, indexes, and commodities with realistic baseline data
// These serve as fallback data and are updated with live prices when APIs are available
const STOCK_DATA: Asset[] = [
  { id: 'aapl', symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', price: 189.84, change24h: 2.31, changePercent24h: 1.23, marketCap: 2950000000000, volume24h: 54200000 },
  { id: 'msft', symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', price: 378.91, change24h: 4.52, changePercent24h: 1.21, marketCap: 2810000000000, volume24h: 22100000 },
  { id: 'googl', symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', price: 141.80, change24h: -0.89, changePercent24h: -0.62, marketCap: 1780000000000, volume24h: 21500000 },
  { id: 'amzn', symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', price: 186.42, change24h: 3.15, changePercent24h: 1.72, marketCap: 1930000000000, volume24h: 44200000 },
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', price: 495.22, change24h: 12.44, changePercent24h: 2.57, marketCap: 1220000000000, volume24h: 41300000 },
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', price: 248.42, change24h: -3.28, changePercent24h: -1.30, marketCap: 789000000000, volume24h: 112000000 },
  { id: 'meta', symbol: 'META', name: 'Meta Platforms', type: 'stock', price: 353.96, change24h: 5.67, changePercent24h: 1.63, marketCap: 909000000000, volume24h: 18700000 },
  { id: 'brk-b', symbol: 'BRK.B', name: 'Berkshire Hathaway', type: 'stock', price: 362.51, change24h: 1.23, changePercent24h: 0.34, marketCap: 795000000000, volume24h: 3200000 },
  { id: 'jpm', symbol: 'JPM', name: 'JPMorgan Chase', type: 'stock', price: 172.45, change24h: -1.12, changePercent24h: -0.65, marketCap: 498000000000, volume24h: 8900000 },
  { id: 'v', symbol: 'V', name: 'Visa Inc.', type: 'stock', price: 260.89, change24h: 1.98, changePercent24h: 0.76, marketCap: 535000000000, volume24h: 6700000 },
  { id: 'jnj', symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', price: 156.74, change24h: -0.43, changePercent24h: -0.27, marketCap: 378000000000, volume24h: 7100000 },
  { id: 'wmt', symbol: 'WMT', name: 'Walmart Inc.', type: 'stock', price: 161.22, change24h: 0.88, changePercent24h: 0.55, marketCap: 434000000000, volume24h: 5800000 },
  { id: 'pg', symbol: 'PG', name: 'Procter & Gamble', type: 'stock', price: 152.31, change24h: 0.34, changePercent24h: 0.22, marketCap: 358000000000, volume24h: 6200000 },
  { id: 'ma', symbol: 'MA', name: 'Mastercard Inc.', type: 'stock', price: 421.67, change24h: 3.45, changePercent24h: 0.82, marketCap: 393000000000, volume24h: 3100000 },
  { id: 'hd', symbol: 'HD', name: 'Home Depot', type: 'stock', price: 347.89, change24h: -2.11, changePercent24h: -0.60, marketCap: 345000000000, volume24h: 3400000 },
  { id: 'dis', symbol: 'DIS', name: 'Walt Disney Co.', type: 'stock', price: 93.45, change24h: 1.22, changePercent24h: 1.32, marketCap: 171000000000, volume24h: 9800000 },
  { id: 'nflx', symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', price: 484.12, change24h: 7.89, changePercent24h: 1.66, marketCap: 213000000000, volume24h: 5400000 },
  { id: 'amd', symbol: 'AMD', name: 'Advanced Micro Devices', type: 'stock', price: 138.92, change24h: 3.71, changePercent24h: 2.74, marketCap: 224000000000, volume24h: 52600000 },
  { id: 'crm', symbol: 'CRM', name: 'Salesforce Inc.', type: 'stock', price: 263.18, change24h: -1.56, changePercent24h: -0.59, marketCap: 256000000000, volume24h: 4900000 },
  { id: 'intc', symbol: 'INTC', name: 'Intel Corp.', type: 'stock', price: 44.67, change24h: -0.89, changePercent24h: -1.95, marketCap: 189000000000, volume24h: 31200000 },
  { id: 'ko', symbol: 'KO', name: 'Coca-Cola Co.', type: 'stock', price: 59.82, change24h: 0.15, changePercent24h: 0.25, marketCap: 258000000000, volume24h: 11200000 },
  { id: 'pep', symbol: 'PEP', name: 'PepsiCo Inc.', type: 'stock', price: 170.34, change24h: -0.67, changePercent24h: -0.39, marketCap: 234000000000, volume24h: 4200000 },
  { id: 'cost', symbol: 'COST', name: 'Costco Wholesale', type: 'stock', price: 592.11, change24h: 4.23, changePercent24h: 0.72, marketCap: 263000000000, volume24h: 2100000 },
  { id: 'abbv', symbol: 'ABBV', name: 'AbbVie Inc.', type: 'stock', price: 154.89, change24h: 1.02, changePercent24h: 0.66, marketCap: 274000000000, volume24h: 5600000 },
  { id: 'baba', symbol: 'BABA', name: 'Alibaba Group', type: 'stock', price: 78.34, change24h: -1.56, changePercent24h: -1.95, marketCap: 198000000000, volume24h: 14200000 },
];

const INDEX_DATA: Asset[] = [
  { id: 'sp500', symbol: 'SPX', name: 'S&P 500', type: 'index', price: 4769.83, change24h: 23.45, changePercent24h: 0.49, volume24h: 3200000000 },
  { id: 'nasdaq', symbol: 'NDX', name: 'NASDAQ 100', type: 'index', price: 16825.93, change24h: 112.34, changePercent24h: 0.67, volume24h: 5100000000 },
  { id: 'dow', symbol: 'DJI', name: 'Dow Jones Industrial', type: 'index', price: 37689.54, change24h: 134.22, changePercent24h: 0.36, volume24h: 2800000000 },
  { id: 'russell', symbol: 'RUT', name: 'Russell 2000', type: 'index', price: 2012.67, change24h: -8.34, changePercent24h: -0.41, volume24h: 1200000000 },
  { id: 'vix', symbol: 'VIX', name: 'CBOE Volatility Index', type: 'index', price: 12.89, change24h: -0.45, changePercent24h: -3.37, volume24h: 0 },
  { id: 'ftse', symbol: 'FTSE', name: 'FTSE 100', type: 'index', price: 7733.24, change24h: 22.11, changePercent24h: 0.29, volume24h: 890000000 },
  { id: 'dax', symbol: 'DAX', name: 'DAX 40', type: 'index', price: 16751.64, change24h: 67.89, changePercent24h: 0.41, volume24h: 1100000000 },
  { id: 'nikkei', symbol: 'N225', name: 'Nikkei 225', type: 'index', price: 33464.17, change24h: -123.45, changePercent24h: -0.37, volume24h: 2300000000 },
  { id: 'hsi', symbol: 'HSI', name: 'Hang Seng Index', type: 'index', price: 16646.05, change24h: -234.12, changePercent24h: -1.39, volume24h: 1500000000 },
  { id: 'sse', symbol: 'SSE', name: 'Shanghai Composite', type: 'index', price: 2974.93, change24h: 12.34, changePercent24h: 0.42, volume24h: 4200000000 },
  { id: 'dxy', symbol: 'DXY', name: 'US Dollar Index', type: 'index', price: 102.45, change24h: 0.23, changePercent24h: 0.22, volume24h: 0 },
  { id: 'stoxx', symbol: 'SX5E', name: 'Euro Stoxx 50', type: 'index', price: 4521.65, change24h: 18.90, changePercent24h: 0.42, volume24h: 890000000 },
];

const COMMODITY_DATA: Asset[] = [
  { id: 'gold', symbol: 'XAU', name: 'Gold', type: 'commodity', price: 2045.30, change24h: 8.50, changePercent24h: 0.42, volume24h: 182000000000 },
  { id: 'silver', symbol: 'XAG', name: 'Silver', type: 'commodity', price: 24.18, change24h: 0.34, changePercent24h: 1.43, volume24h: 28000000000 },
  { id: 'platinum', symbol: 'XPT', name: 'Platinum', type: 'commodity', price: 982.40, change24h: -5.60, changePercent24h: -0.57, volume24h: 4200000000 },
  { id: 'palladium', symbol: 'XPD', name: 'Palladium', type: 'commodity', price: 1023.80, change24h: -12.30, changePercent24h: -1.19, volume24h: 1800000000 },
  { id: 'crude-oil', symbol: 'WTI', name: 'Crude Oil WTI', type: 'commodity', price: 73.89, change24h: 1.24, changePercent24h: 1.71, volume24h: 345000000000 },
  { id: 'brent', symbol: 'BRENT', name: 'Brent Crude', type: 'commodity', price: 79.12, change24h: 1.08, changePercent24h: 1.38, volume24h: 234000000000 },
  { id: 'natural-gas', symbol: 'NG', name: 'Natural Gas', type: 'commodity', price: 2.54, change24h: -0.08, changePercent24h: -3.05, volume24h: 56000000000 },
  { id: 'copper', symbol: 'HG', name: 'Copper', type: 'commodity', price: 3.87, change24h: 0.05, changePercent24h: 1.31, volume24h: 12000000000 },
  { id: 'wheat', symbol: 'ZW', name: 'Wheat', type: 'commodity', price: 612.50, change24h: -4.25, changePercent24h: -0.69, volume24h: 8900000000 },
  { id: 'corn', symbol: 'ZC', name: 'Corn', type: 'commodity', price: 478.25, change24h: 2.75, changePercent24h: 0.58, volume24h: 7800000000 },
  { id: 'soybeans', symbol: 'ZS', name: 'Soybeans', type: 'commodity', price: 1312.50, change24h: -6.50, changePercent24h: -0.49, volume24h: 5600000000 },
  { id: 'coffee', symbol: 'KC', name: 'Coffee', type: 'commodity', price: 187.45, change24h: 3.20, changePercent24h: 1.74, volume24h: 3400000000 },
  { id: 'sugar', symbol: 'SB', name: 'Sugar', type: 'commodity', price: 27.34, change24h: 0.18, changePercent24h: 0.66, volume24h: 2100000000 },
  { id: 'cotton', symbol: 'CT', name: 'Cotton', type: 'commodity', price: 79.82, change24h: -0.45, changePercent24h: -0.56, volume24h: 1800000000 },
  { id: 'lumber', symbol: 'LBS', name: 'Lumber', type: 'commodity', price: 567.00, change24h: 8.50, changePercent24h: 1.52, volume24h: 890000000 },
];

// Simulate small realistic price movements
function jitter(asset: Asset): Asset {
  const volatility = asset.type === 'commodity' ? 0.001 : 0.002;
  const delta = asset.price * (Math.random() - 0.5) * volatility;
  const newPrice = asset.price + delta;
  return {
    ...asset,
    price: Math.round(newPrice * 100) / 100,
    change24h: Math.round((asset.change24h + delta) * 100) / 100,
    changePercent24h: Math.round(((asset.change24h + delta) / (asset.price - asset.change24h)) * 10000) / 100,
  };
}

export function fetchStocks(): Asset[] {
  return STOCK_DATA.map(jitter);
}

export function fetchIndexes(): Asset[] {
  return INDEX_DATA.map(jitter);
}

export function fetchCommodities(): Asset[] {
  return COMMODITY_DATA.map(jitter);
}

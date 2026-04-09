export type AssetType = 'crypto' | 'stock' | 'index' | 'commodity';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap?: number;
  volume24h?: number;
  high24h?: number;
  low24h?: number;
  image?: string;
  rank?: number;
  sparkline?: number[];
}

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

export interface BTCDominance {
  percentage: number;
  change24h: number;
}

export interface MarketGlobal {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  fearGreed: FearGreedData;
  activeCryptos: number;
  marketCapChange24h: number;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: string;
  image?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'twitter' | 'website';
  url: string;
  enabled: boolean;
}

export interface DashboardWidget {
  id: string;
  type: 'favorites' | 'watchlist' | 'feargreed' | 'news' | 'topmovers' | 'portfolio' | 'dominance' | 'quickstats';
  position: number;
  visible: boolean;
}

export interface UserPreferences {
  favorites: string[];
  newsSources: NewsSource[];
  defaultTab: string;
  refreshInterval: number;
  dashboardWidgets: DashboardWidget[];
  pinnedAssets: string[];
}

export type TabId = 'dashboard' | 'all' | 'favorites' | 'crypto' | 'stocks' | 'indexes' | 'commodities' | 'news';
export type AssetType = 'crypto' | 'stock' | 'index' | 'commodity';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap?: number;
  volume24h?: number;
  high24h?: number;
  low24h?: number;
  image?: string;
  rank?: number;
  sparkline?: number[];
}

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

export interface BTCDominance {
  percentage: number;
  change24h: number;
}

export interface MarketGlobal {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  fearGreed: FearGreedData;
  activeCryptos: number;
  marketCapChange24h: number;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: string;
  image?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'twitter' | 'website';
  url: string;
  enabled: boolean;
}

export interface UserPreferences {
  favorites: string[];
  newsSources: NewsSource[];
  defaultTab: string;
  refreshInterval: number; // in seconds
}

export type TabId = 'all' | 'favorites' | 'crypto' | 'stocks' | 'indexes' | 'commodities' | 'news';

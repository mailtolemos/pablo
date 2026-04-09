import type { Asset, MarketGlobal, FearGreedData } from '../types';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export async function fetchCryptoAssets(page = 1, perPage = 100): Promise<Asset[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`
    );
    if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
    const data = await res.json();
    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      type: 'crypto' as const,
      price: coin.current_price ?? 0,
      change24h: coin.price_change_24h ?? 0,
      changePercent24h: coin.price_change_percentage_24h ?? 0,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      image: coin.image,
      rank: coin.market_cap_rank,
      sparkline: coin.sparkline_in_7d?.price ?? [],
    }));
  } catch (err) {
    console.error('Failed to fetch crypto assets:', err);
    return [];
  }
}

export async function fetchGlobalData(): Promise<MarketGlobal | null> {
  try {
    const [globalRes, fearRes] = await Promise.all([
      fetch(`${BASE_URL}/global`),
      fetch('https://api.alternative.me/fng/?limit=1'),
    ]);

    const globalData = await globalRes.json();
    const fearData = await fearRes.json().catch(() => null);

    const g = globalData.data;
    const fearGreed: FearGreedData = fearData?.data?.[0]
      ? {
          value: parseInt(fearData.data[0].value),
          classification: fearData.data[0].value_classification,
          timestamp: fearData.data[0].timestamp,
        }
      : { value: 50, classification: 'Neutral', timestamp: new Date().toISOString() };

    return {
      totalMarketCap: g.total_market_cap?.usd ?? 0,
      totalVolume: g.total_volume?.usd ?? 0,
      btcDominance: g.market_cap_percentage?.btc ?? 0,
      ethDominance: g.market_cap_percentage?.eth ?? 0,
      fearGreed,
      activeCryptos: g.active_cryptocurrencies ?? 0,
      marketCapChange24h: g.market_cap_change_percentage_24h_usd ?? 0,
    };
  } catch (err) {
    console.error('Failed to fetch global data:', err);
    return null;
  }
}

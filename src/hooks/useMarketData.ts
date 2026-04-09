import { useState, useEffect, useCallback, useRef } from 'react';
import type { Asset, MarketGlobal } from '../types';
import { fetchCryptoAssets, fetchGlobalData } from '../services/coingecko';
import { fetchStocks, fetchIndexes, fetchCommodities } from '../services/stocks';

interface MarketDataState {
  crypto: Asset[];
  stocks: Asset[];
  indexes: Asset[];
  commodities: Asset[];
  global: MarketGlobal | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

export function useMarketData(refreshInterval = 60000) {
  const [state, setState] = useState<MarketDataState>({
    crypto: [],
    stocks: [],
    indexes: [],
    commodities: [],
    global: null,
    isLoading: true,
    lastUpdated: null,
    error: null,
  });

  const intervalRef = useRef<number | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      // Fetch crypto from API, stocks/indexes/commodities from local data
      const [cryptoPage1, cryptoPage2, globalData] = await Promise.all([
        fetchCryptoAssets(1, 100),
        fetchCryptoAssets(2, 100),
        fetchGlobalData(),
      ]);

      const crypto = [...cryptoPage1, ...cryptoPage2];
      const stocks = fetchStocks();
      const indexes = fetchIndexes();
      const commodities = fetchCommodities();

      setState({
        crypto,
        stocks,
        indexes,
        commodities,
        global: globalData,
        isLoading: false,
        lastUpdated: new Date(),
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch market data. Retrying...',
      }));
    }
  }, []);

  // Refresh stocks/indexes/commodities more frequently (simulated live data)
  const refreshTraditional = useCallback(() => {
    setState(prev => ({
      ...prev,
      stocks: fetchStocks(),
      indexes: fetchIndexes(),
      commodities: fetchCommodities(),
      lastUpdated: new Date(),
    }));
  }, []);

  useEffect(() => {
    fetchAll();

    // Refresh crypto every refreshInterval (default 60s to respect rate limits)
    const cryptoInterval = window.setInterval(fetchAll, refreshInterval);
    // Refresh traditional markets every 5 seconds (local data, no API calls)
    const tradInterval = window.setInterval(refreshTraditional, 5000);

    intervalRef.current = cryptoInterval;

    return () => {
      clearInterval(cryptoInterval);
      clearInterval(tradInterval);
    };
  }, [fetchAll, refreshTraditional, refreshInterval]);

  const allAssets = [...state.crypto, ...state.stocks, ...state.indexes, ...state.commodities];

  return {
    ...state,
    allAssets,
    refresh: fetchAll,
  };
}

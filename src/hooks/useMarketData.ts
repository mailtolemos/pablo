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

export function useMarketData(refreshInterval = 120000) {
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
      // Fetch crypto from API, stocks/indexes/commodities from static local data
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

  useEffect(() => {
    fetchAll();

    // Refresh crypto data on interval (default 120s = 2 minutes to respect API rate limits)
    // Stocks/indexes/commodities are static reference data and only fetched once on mount
    const cryptoInterval = window.setInterval(fetchAll, refreshInterval);

    intervalRef.current = cryptoInterval;

    return () => {
      clearInterval(cryptoInterval);
    };
  }, [fetchAll, refreshInterval]);

  const allAssets = [...state.crypto, ...state.stocks, ...state.indexes, ...state.commodities];

  return {
    ...state,
    allAssets,
    refresh: fetchAll,
  };
}

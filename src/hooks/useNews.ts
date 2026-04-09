import { useState, useEffect, useCallback, useRef } from 'react';
import type { NewsItem, NewsSource } from '../types';
import { fetchAllNews } from '../services/news';

export function useNews(sources: NewsSource[], refreshInterval = 120000) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      const items = await fetchAllNews(sources);
      setNews(items);
      setLastFetched(new Date());
    } catch (err) {
      console.error('News fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sources]);

  useEffect(() => {
    fetchNews();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(fetchNews, refreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNews, refreshInterval]);

  return { news, isLoading, lastFetched, refresh: fetchNews };
}

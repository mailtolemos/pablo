import type { NewsItem, NewsSource } from '../types';

const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';

export const DEFAULT_NEWS_SOURCES: NewsSource[] = [
  { id: 'coindesk', name: 'CoinDesk', type: 'rss', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', enabled: true },
  { id: 'cointelegraph', name: 'CoinTelegraph', type: 'rss', url: 'https://cointelegraph.com/rss', enabled: true },
  { id: 'decrypt', name: 'Decrypt', type: 'rss', url: 'https://decrypt.co/feed', enabled: true },
  { id: 'theblock', name: 'The Block', type: 'rss', url: 'https://www.theblock.co/rss.xml', enabled: true },
  { id: 'bitcoinmag', name: 'Bitcoin Magazine', type: 'rss', url: 'https://bitcoinmagazine.com/.rss/full/', enabled: true },
  { id: 'cryptoslate', name: 'CryptoSlate', type: 'rss', url: 'https://cryptoslate.com/feed/', enabled: true },
];

export async function fetchNewsFromSource(source: NewsSource): Promise<NewsItem[]> {
  if (source.type !== 'rss' || !source.enabled) return [];

  try {
    const res = await fetch(`${RSS2JSON_API}?rss_url=${encodeURIComponent(source.url)}`);
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const data = await res.json();

    if (data.status !== 'ok') return [];

    return (data.items || []).slice(0, 15).map((item: any, i: number) => ({
      id: `${source.id}-${i}-${Date.now()}`,
      title: item.title || 'Untitled',
      description: stripHtml(item.description || item.content || '').slice(0, 200),
      url: item.link || '',
      source: source.name,
      publishedAt: item.pubDate || new Date().toISOString(),
      image: item.thumbnail || item.enclosure?.link || undefined,
    }));
  } catch (err) {
    console.error(`Failed to fetch news from ${source.name}:`, err);
    return [];
  }
}

export async function fetchAllNews(sources: NewsSource[]): Promise<NewsItem[]> {
  const enabledSources = sources.filter(s => s.enabled);
  const results = await Promise.allSettled(enabledSources.map(fetchNewsFromSource));
  const allNews: NewsItem[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    }
  }

  // Sort by date, newest first
  allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return allNews;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

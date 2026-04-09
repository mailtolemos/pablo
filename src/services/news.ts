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

// Validate URL to prevent SSRF
function isValidRssUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http/https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    // Block internal/private IPs
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') || hostname.startsWith('172.') || hostname === '0.0.0.0') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchNewsFromSource(source: NewsSource): Promise<NewsItem[]> {
  if (source.type !== 'rss' || !source.enabled) return [];
  if (!isValidRssUrl(source.url)) return [];

  try {
    const res = await fetch(`${RSS2JSON_API}?rss_url=${encodeURIComponent(source.url)}`);
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const data = await res.json();

    if (data.status !== 'ok') return [];

    return (data.items || []).slice(0, 15).map((item: any, i: number) => ({
      id: `${source.id}-${i}-${Date.now()}`,
      title: sanitizeText(item.title || 'Untitled'),
      description: sanitizeText(stripHtml(item.description || item.content || '')).slice(0, 200),
      url: sanitizeUrl(item.link || ''),
      source: source.name,
      publishedAt: item.pubDate || new Date().toISOString(),
      image: sanitizeUrl(item.thumbnail || item.enclosure?.link || ''),
    }));
  } catch (err) {
    console.error(`[Pablo] Failed to fetch news from ${source.name}:`, err);
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

  allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return allNews;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim();
}

function sanitizeUrl(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
    return '';
  } catch {
    return '';
  }
}

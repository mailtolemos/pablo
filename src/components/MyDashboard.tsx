import { useMemo } from 'react';
import type { Asset, MarketGlobal, NewsItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { Sparkline } from './Sparkline';
import { FearGreedCompact } from './FearGreed';
import { TopMovers } from './TopMovers';

interface MyDashboardProps {
  allAssets: Asset[];
  crypto: Asset[];
  global: MarketGlobal | null;
  news: NewsItem[];
  newsLoading: boolean;
  onRefreshNews: () => void;
}

export function MyDashboard({ allAssets, crypto, global, news, newsLoading, onRefreshNews }: MyDashboardProps) {
  const { preferences, toggleFavorite } = useAuth();

  const favorites = useMemo(
    () => allAssets.filter(a => preferences.favorites.includes(a.id)),
    [allAssets, preferences.favorites]
  );

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatNum = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return `$${n.toLocaleString()}`;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="h-full overflow-auto bg-pablo-black">
      <div className="dashboard-grid min-h-full" style={{ gridAutoRows: 'auto' }}>

        {/* ===== ROW 1: Market Stats Bar ===== */}
        {global && (
          <div className="col-span-12 panel">
            <div className="grid grid-cols-6 divide-x divide-pablo-border/30">
              <StatCell
                label="Total Market Cap"
                value={formatNum(global.totalMarketCap)}
                change={global.marketCapChange24h}
              />
              <StatCell label="24H Volume" value={formatNum(global.totalVolume)} />
              <StatCell
                label="BTC Dominance"
                value={`${global.btcDominance.toFixed(1)}%`}
                bar={global.btcDominance}
                barColor="#C6A15B"
              />
              <StatCell
                label="ETH Dominance"
                value={`${global.ethDominance.toFixed(1)}%`}
                bar={global.ethDominance}
                barColor="#6366f1"
              />
              <StatCell
                label="Active Cryptos"
                value={global.activeCryptos.toLocaleString()}
              />
              <StatCell
                label="Fear & Greed"
                value={`${global.fearGreed.value}`}
                tag={global.fearGreed.classification}
                tagColor={
                  global.fearGreed.value >= 60 ? '#00D084'
                    : global.fearGreed.value <= 40 ? '#ef4444' : '#C6A15B'
                }
              />
            </div>
          </div>
        )}

        {/* ===== ROW 2: Favorites + Fear&Greed + Top Movers ===== */}

        {/* Favorites Watchlist — left 5 cols */}
        <div className="col-span-12 lg:col-span-5 panel" style={{ minHeight: 300 }}>
          <div className="panel-header">
            <span className="panel-title">
              Watchlist <span className="text-pablo-muted">[{favorites.length}]</span>
            </span>
          </div>
          <div className="overflow-auto" style={{ maxHeight: 320 }}>
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                <div className="text-pablo-muted text-[11px] font-mono mb-2">
                  No assets in your watchlist
                </div>
                <div className="text-pablo-muted/60 text-[10px] font-mono">
                  Star assets from any tab to add them here
                </div>
              </div>
            ) : (
              <table className="w-full text-[11px] font-mono">
                <thead className="text-pablo-muted uppercase tracking-wider sticky top-0 bg-pablo-panel z-10 text-[9px]">
                  <tr className="border-b border-pablo-border">
                    <th className="w-6 px-1 py-1"></th>
                    <th className="px-2 py-1 text-left">Asset</th>
                    <th className="px-2 py-1 text-right">Price</th>
                    <th className="px-2 py-1 text-right">24h</th>
                    <th className="px-2 py-1 text-right hidden sm:table-cell">MCap</th>
                    <th className="px-2 py-1 text-right w-16 hidden md:table-cell">7D</th>
                  </tr>
                </thead>
                <tbody>
                  {favorites.map(asset => {
                    const isPositive = asset.changePercent24h >= 0;
                    return (
                      <tr key={asset.id} className="border-b border-pablo-border/20 hover:bg-pablo-green/5 transition-colors group">
                        <td className="px-1 py-1.5">
                          <button
                            onClick={() => toggleFavorite(asset.id)}
                            className="text-pablo-gold text-xs"
                          >
                            {'\u2605'}
                          </button>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            {asset.image && <img src={asset.image} alt="" className="w-4 h-4 rounded-full" loading="lazy" />}
                            <span className="text-pablo-light font-medium">{asset.symbol}</span>
                            <span className="text-pablo-muted text-[9px] hidden sm:inline">{asset.name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-right text-pablo-light tabular-nums">{formatPrice(asset.price)}</td>
                        <td className={`px-2 py-1.5 text-right tabular-nums font-medium ${isPositive ? 'text-pablo-green' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                        </td>
                        <td className="px-2 py-1.5 text-right text-pablo-text tabular-nums text-[10px] hidden sm:table-cell">
                          {formatNum(asset.marketCap || 0)}
                        </td>
                        <td className="px-2 py-1.5 text-right hidden md:table-cell">
                          {asset.sparkline && asset.sparkline.length > 0 && (
                            <Sparkline data={asset.sparkline} positive={isPositive} width={55} height={18} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Fear & Greed Gauge — center 3 cols */}
        <div className="col-span-6 lg:col-span-3 panel" style={{ minHeight: 300 }}>
          <FearGreedCompact global={global} />
          {/* Quick dominance below gauge */}
          {global && (
            <div className="px-3 pb-3 space-y-2">
              <div className="h-px bg-pablo-border" />
              <DomBar label="BTC.D" value={global.btcDominance} color="#C6A15B" />
              <DomBar label="ETH.D" value={global.ethDominance} color="#6366f1" />
              <div className="h-px bg-pablo-border" />
              <div className="flex justify-between items-center">
                <span className="text-pablo-muted text-[9px] uppercase tracking-wider">MCap</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-pablo-light text-[10px] font-mono">{formatNum(global.totalMarketCap)}</span>
                  <span className={`text-[9px] font-mono ${global.marketCapChange24h >= 0 ? 'text-pablo-green' : 'text-red-400'}`}>
                    {global.marketCapChange24h >= 0 ? '+' : ''}{global.marketCapChange24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-pablo-muted text-[9px] uppercase tracking-wider">24H Vol</span>
                <span className="text-pablo-light text-[10px] font-mono">{formatNum(global.totalVolume)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Top Movers — right 4 cols */}
        <div className="col-span-6 lg:col-span-4 panel" style={{ minHeight: 300 }}>
          <TopMovers assets={crypto} limit={6} />
        </div>

        {/* ===== ROW 3: News Feed ===== */}
        <div className="col-span-12 panel" style={{ minHeight: 200 }}>
          <div className="panel-header">
            <span className="panel-title">
              Latest Signals <span className="text-pablo-muted">[{news.length}]</span>
            </span>
            <button
              onClick={onRefreshNews}
              className="text-pablo-muted hover:text-pablo-green transition-colors text-[10px]"
            >
              {'\u21BB'}
            </button>
          </div>
          <div className="overflow-auto" style={{ maxHeight: 280 }}>
            {newsLoading && news.length === 0 ? (
              <div className="flex items-center justify-center h-20">
                <span className="text-pablo-green text-[10px] font-mono animate-pulse">Scanning...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-pablo-border/20">
                {[0, 1, 2].map(col => (
                  <div key={col} className="divide-y divide-pablo-border/20">
                    {news.slice(col * 5, col * 5 + 5).map(item => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-3 py-2 hover:bg-pablo-green/5 transition-colors group"
                      >
                        <h3 className="text-[10px] text-pablo-light leading-relaxed group-hover:text-pablo-green transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[8px] text-pablo-green uppercase tracking-wider">{item.source}</span>
                          <span className="text-pablo-muted text-[8px]">{'\u00B7'}</span>
                          <span className="text-pablo-muted text-[8px]">{timeAgo(item.publishedAt)}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers
function StatCell({ label, value, change, bar, barColor, tag, tagColor }: {
  label: string; value: string; change?: number; bar?: number; barColor?: string; tag?: string; tagColor?: string;
}) {
  return (
    <div className="stat-cell py-2.5">
      <div className="stat-label">{label}</div>
      <div className="stat-value text-sm" style={tagColor ? { color: tagColor } : {}}>{value}</div>
      {change !== undefined && (
        <div className={`stat-change ${change >= 0 ? 'text-pablo-green' : 'text-red-400'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </div>
      )}
      {tag && <div className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color: tagColor }}>{tag}</div>}
      {bar !== undefined && (
        <div className="w-full max-w-[50px] bg-pablo-border rounded-full h-0.5 mt-1">
          <div className="h-0.5 rounded-full transition-all duration-500" style={{ width: `${bar}%`, backgroundColor: barColor }} />
        </div>
      )}
    </div>
  );
}

function DomBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-pablo-muted text-[9px] uppercase tracking-wider">{label}</span>
        <span className="text-pablo-light text-[10px] font-mono">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-pablo-border rounded-full h-1">
        <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

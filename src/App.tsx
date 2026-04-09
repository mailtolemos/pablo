import { useState, useMemo, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useMarketData } from './hooks/useMarketData';
import { useNews } from './hooks/useNews';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { AssetTable } from './components/AssetTable';
import { FearGreedWidget } from './components/FearGreed';
import { NewsFeed } from './components/NewsFeed';
import { BootScreen } from './components/BootScreen';
import type { TabId } from './types';

function Dashboard() {
  const { preferences } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [booted, setBooted] = useState(false);

  const { crypto, stocks, indexes, commodities, allAssets, global, isLoading, lastUpdated } =
    useMarketData(preferences.refreshInterval * 1000);

  const { news, isLoading: newsLoading, lastFetched, refresh: refreshNews } =
    useNews(preferences.newsSources, 120000);

  const handleBootComplete = useCallback(() => setBooted(true), []);

  const favorites = useMemo(
    () => allAssets.filter(a => preferences.favorites.includes(a.id)),
    [allAssets, preferences.favorites]
  );

  const counts: Record<TabId, number> = {
    all: allAssets.length,
    favorites: favorites.length,
    crypto: crypto.length,
    stocks: stocks.length,
    indexes: indexes.length,
    commodities: commodities.length,
    news: news.length,
  };

  if (!booted) {
    return <BootScreen onComplete={handleBootComplete} />;
  }

  return (
    <div className="terminal-grid">
      {/* Scanline overlay for terminal feel */}
      <div className="scanline-overlay" />

      <Header global={global} lastUpdated={lastUpdated} />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

      <main className="flex-1 overflow-hidden">
        {activeTab === 'news' ? (
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-0">
            <div className="lg:col-span-2 h-full overflow-hidden">
              <NewsFeed
                news={news}
                isLoading={newsLoading}
                lastFetched={lastFetched}
                onRefresh={refreshNews}
              />
            </div>
            <div className="hidden lg:block h-full overflow-auto border-l border-pablo-border">
              <FearGreedWidget global={global} />
            </div>
          </div>
        ) : (
          <div className="h-full grid grid-cols-1 xl:grid-cols-4 gap-0">
            <div className="xl:col-span-3 h-full overflow-hidden">
              {isLoading && allAssets.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-pablo-green text-sm font-mono animate-pulse mb-2">
                      Scanning markets...
                    </div>
                    <div className="text-pablo-muted text-xs font-mono">
                      Aggregating signals from global sources
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'all' && (
                    <AssetTable assets={allAssets} title="All Assets" showType />
                  )}
                  {activeTab === 'favorites' && (
                    <AssetTable assets={favorites} title="Favorites" showType />
                  )}
                  {activeTab === 'crypto' && (
                    <AssetTable assets={crypto} title="Crypto â Top 200" />
                  )}
                  {activeTab === 'stocks' && (
                    <AssetTable assets={stocks} title="Stocks" />
                  )}
                  {activeTab === 'indexes' && (
                    <AssetTable assets={indexes} title="Indexes" />
                  )}
                  {activeTab === 'commodities' && (
                    <AssetTable assets={commodities} title="Commodities" />
                  )}
                </>
              )}
            </div>

            <div className="hidden xl:block h-full overflow-auto border-l border-pablo-border">
              <FearGreedWidget global={global} />
              <div className="border-t border-pablo-border" style={{ height: 'calc(100% - 400px)' }}>
                <NewsFeed
                  news={news.slice(0, 20)}
                  isLoading={newsLoading}
                  lastFetched={lastFetched}
                  onRefresh={refreshNews}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Terminal status bar */}
      <footer className="border-t border-pablo-border bg-pablo-dark px-4 py-1 flex items-center justify-between text-[10px] font-mono text-pablo-muted">
        <div className="flex items-center gap-4">
          <span>PABLO v1.0.0</span>
          <span>|</span>
          <span className={global ? 'text-pablo-green' : 'text-red-400'}>
            {global ? 'â CONNECTED' : 'â CONNECTING'}
          </span>
          <span>|</span>
          <span>ASSETS: {allAssets.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>NEWS SOURCES: {preferences.newsSources.filter(s => s.enabled).length}</span>
          <span>|</span>
          <span>REFRESH: {preferences.refreshInterval}s</span>
          <span>|</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

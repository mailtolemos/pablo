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
import { MyDashboard } from './components/MyDashboard';
import type { TabId } from './types';

function Dashboard() {
  const { user, preferences } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>(user ? 'dashboard' : 'all');
  const [booted, setBooted] = useState(false);

  const { crypto, stocks, indexes, commodities, allAssets, global, isLoading, lastUpdated } =
    useMarketData(preferences.refreshInterval * 1000);

  const { news, isLoading: newsLoading, lastFetched, refresh: refreshNews } =
    useNews(preferences.newsSources, 120000);

  const handleBootComplete = useCallback(() => setBooted(true), []);

  // If user logs in and is on 'all', switch to dashboard
  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  const favorites = useMemo(
    () => allAssets.filter(a => preferences.favorites.includes(a.id)),
    [allAssets, preferences.favorites]
  );

  const counts: Record<TabId, number> = {
    dashboard: 0,
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
    <div className="terminal-shell">
      <div className="scanline-overlay" />
      <div className="crt-vignette" />

      <Header global={global} lastUpdated={lastUpdated} />
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} counts={counts} />

      <main className="flex-1 overflow-hidden">
        {/* MY TERMINAL — personalized dashboard */}
        {activeTab === 'dashboard' && user && (
          <MyDashboard
            allAssets={allAssets}
            crypto={crypto}
            global={global}
            news={news}
            newsLoading={newsLoading}
            onRefreshNews={refreshNews}
          />
        )}

        {/* NEWS TAB */}
        {activeTab === 'news' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-0">
            <div className="lg:col-span-3 h-full overflow-hidden">
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
        )}

        {/* ASSET TABS */}
        {activeTab !== 'dashboard' && activeTab !== 'news' && (
          <div className="h-full grid grid-cols-1 xl:grid-cols-5 gap-0">
            <div className="xl:col-span-4 h-full overflow-hidden">
              {isLoading && allAssets.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-pablo-green text-[11px] font-mono animate-pulse mb-2">
                      Scanning markets...
                    </div>
                    <div className="text-pablo-muted text-[10px] font-mono">
                      Aggregating signals from global sources
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'all' && <AssetTable assets={allAssets} title="All Assets" showType />}
                  {activeTab === 'favorites' && <AssetTable assets={favorites} title="Watchlist" showType />}
                  {activeTab === 'crypto' && <AssetTable assets={crypto} title="Crypto -- Top 200" />}
                  {activeTab === 'stocks' && <AssetTable assets={stocks} title="Stocks" />}
                  {activeTab === 'indexes' && <AssetTable assets={indexes} title="Indexes" />}
                  {activeTab === 'commodities' && <AssetTable assets={commodities} title="Commodities" />}
                </>
              )}
            </div>

            <div className="hidden xl:flex xl:flex-col h-full overflow-hidden border-l border-pablo-border">
              <div className="flex-shrink-0" style={{ maxHeight: '45%' }}>
                <FearGreedWidget global={global} />
              </div>
              <div className="flex-1 overflow-hidden border-t border-pablo-border">
                <NewsFeed
                  news={news.slice(0, 15)}
                  isLoading={newsLoading}
                  lastFetched={lastFetched}
                  onRefresh={refreshNews}
                  compact
                  maxItems={15}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Status bar */}
      <footer className="status-bar flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="tracking-wider">PABLO v2.0</span>
          <span className="text-pablo-border">|</span>
          <span className="flex items-center gap-1.5">
            <span className={`status-dot ${global ? 'status-dot-live' : 'status-dot-offline'}`} />
            <span className={global ? 'text-pablo-green' : 'text-red-400'}>
              {global ? 'CONNECTED' : 'CONNECTING'}
            </span>
          </span>
          <span className="text-pablo-border">|</span>
          <span>ASSETS: {allAssets.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>SOURCES: {preferences.newsSources.filter(s => s.enabled).length}</span>
          <span className="text-pablo-border">|</span>
          <span>REFRESH: {preferences.refreshInterval}s</span>
          <span className="text-pablo-border">|</span>
          <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
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

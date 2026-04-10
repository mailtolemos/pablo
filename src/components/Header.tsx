import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoginModal } from './LoginModal';
import type { MarketGlobal } from '../types';

interface HeaderProps {
  global: MarketGlobal | null;
  lastUpdated: Date | null;
}

export function Header({ global, lastUpdated }: HeaderProps) {
  const { user, logout, isDemoMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLogin, setShowLogin] = useState(false);

  const userName = user
    ? ((user as any).displayName || (user as any).email?.split('@')[0]) || 'Trader'
    : null;

  return (
    <>
      <header className="border-b border-pablo-border bg-pablo-dark flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-pablo-green rounded-full" style={{ boxShadow: '0 0 6px #00D084' }} />
              <h1 className="font-serif text-lg tracking-[0.25em] text-pablo-light font-semibold">
                PABLO
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-pablo-border">
              <span className="text-pablo-muted text-[11px] tracking-[0.2em] uppercase">
                All signal. No noise.
              </span>
            </div>
          </div>

          {/* Right side: status + auth + theme */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="text-pablo-muted hover:text-pablo-light transition-colors text-xs py-1 px-2 border border-pablo-border/50 hover:border-pablo-border rounded"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {lastUpdated && (
              <span className="text-pablo-muted text-[11px] font-mono hidden md:inline tracking-wider">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2 py-1.5 border border-pablo-border bg-pablo-black/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-pablo-green" />
                  <span className="text-pablo-text text-[11px] font-mono uppercase tracking-wider">
                    {userName}
                  </span>
                  {isDemoMode && (
                    <span className="text-pablo-gold text-[11px] border border-pablo-gold/30 px-1 rounded-sm">
                      DEMO
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="text-pablo-muted text-[11px] font-mono hover:text-red-400 transition-colors uppercase tracking-wider"
                >
                  [logout]
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="btn-pablo-outline text-[11px] py-1.5 px-3"
              >
                [access]
              </button>
            )}
          </div>
        </div>

        {/* Ticker bar */}
        {global && <TickerBar global={global} />}
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}

function TickerBar({ global }: { global: MarketGlobal }) {
  const formatNum = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  };

  const items = [
    { label: 'MCap', value: formatNum(global.totalMarketCap), change: global.marketCapChange24h },
    { label: '24H Vol', value: formatNum(global.totalVolume) },
    { label: 'BTC.D', value: `${global.btcDominance.toFixed(1)}%` },
    { label: 'ETH.D', value: `${global.ethDominance.toFixed(1)}%` },
    {
      label: 'F&G',
      value: `${global.fearGreed.value}`,
      tag: global.fearGreed.classification,
      tagColor: global.fearGreed.value >= 60
        ? 'text-pablo-green'
        : global.fearGreed.value <= 40
        ? 'text-red-400'
        : 'text-pablo-gold',
    },
    { label: 'Active', value: global.activeCryptos.toLocaleString() },
  ];

  return (
    <div className="border-t border-pablo-border px-4 py-2 flex items-center gap-4 text-[11px] font-mono overflow-x-auto bg-pablo-black/30">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-pablo-muted uppercase tracking-wider text-[10px]">{item.label}</span>
          <span className="text-pablo-light font-semibold">{item.value}</span>
          {item.change !== undefined && (
            <span className={item.change >= 0 ? 'text-pablo-green' : 'text-red-400'}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
          )}
          {item.tag && <span className={item.tagColor || ''}>{item.tag}</span>}
          {i < items.length - 1 && <span className="text-pablo-border ml-2">|</span>}
        </div>
      ))}
    </div>
  );
}

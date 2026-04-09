import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import type { MarketGlobal } from '../types';

interface HeaderProps {
  global: MarketGlobal | null;
  lastUpdated: Date | null;
}

export function Header({ global, lastUpdated }: HeaderProps) {
  const { user, logout, isDemoMode } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const formatNum = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  };

  const userName = user
    ? ((user as any).displayName || (user as any).email?.split('@')[0]) || 'Trader'
    : null;

  return (
    <>
      <header className="border-b border-pablo-border bg-pablo-dark">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-xl tracking-[0.3em] text-pablo-light font-semibold">
              P A B L O
            </h1>
            <span className="text-pablo-muted text-[10px] tracking-widest uppercase hidden sm:inline">
              All signal. No noise.
            </span>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-pablo-muted text-[10px] font-mono hidden md:inline">
                LAST UPDATE: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <div className="w-2 h-2 rounded-full bg-pablo-green animate-pulse-slow" title="Live" />

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-pablo-text text-xs font-mono">
                  {userName}
                  {isDemoMode && <span className="text-pablo-muted ml-1">(demo)</span>}
                </span>
                <button
                  onClick={logout}
                  className="text-pablo-muted text-xs font-mono hover:text-pablo-red-bright transition-colors uppercase tracking-wider"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="btn-pablo-outline text-xs py-1 px-3"
              >
                Access
              </button>
            )}
          </div>
        </div>

        {/* Ticker bar */}
        {global && (
          <div className="border-t border-pablo-border px-4 py-1.5 flex items-center gap-6 text-[11px] font-mono overflow-hidden">
            <TickerItem label="TOTAL MCAP" value={formatNum(global.totalMarketCap)} change={global.marketCapChange24h} />
            <TickerItem label="24H VOL" value={formatNum(global.totalVolume)} />
            <TickerItem label="BTC.D" value={`${global.btcDominance.toFixed(1)}%`} />
            <TickerItem label="ETH.D" value={`${global.ethDominance.toFixed(1)}%`} />
            <TickerItem
              label="FEAR/GREED"
              value={`${global.fearGreed.value}`}
              tag={global.fearGreed.classification}
              tagColor={
                global.fearGreed.value >= 60
                  ? 'text-pablo-green'
                  : global.fearGreed.value <= 40
                  ? 'text-red-400'
                  : 'text-pablo-gold'
              }
            />
            <TickerItem label="ACTIVE" value={global.activeCryptos.toLocaleString()} />
          </div>
        )}
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  
  PßB[Ý[ÛXÚÙ\][JÂX[[YKÚ[ÙKYËYÐÛÛÜNÂX[Ý[ÎÂ[YNÝ[ÎÂÚ[ÙOÎ[X\ÂYÏÎÝ[ÎÂYÐÛÛÜÎÝ[ÎÂJHÂ]\
]Û\ÜÓ[YOH^][\ËXÙ[\Ø\LÚ]\ÜXÙK[ÝÜ\Ü[Û\ÜÓ[YOH^\XË[]]Y\\Ø\ÙHXÚÚ[Ë]ÚY\ÛX[OÜÜ[Ü[Û\ÜÓ[YOH^\XË[YÚÝ[Y_OÜÜ[ØÚ[ÙHOOH[Y[Y	
Ü[Û\ÜÓ[YO^ØÚ[ÙHHÈ	Ý^\XËYÜY[È	Ý^\YM	ßOØÚ[ÙHHÈ	ÊÉÈ	Éß^ØÚ[ÙKÑ^Y
_IBÜÜ[
_BÝYÈ	Ü[Û\ÜÓ[YO^Ø	ÝYÐÛÛÜ	Ý^\XË]^	ßXOÝYßOÜÜ[BÙ]
NÂB

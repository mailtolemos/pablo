import { useMemo } from 'react';
import type { Asset } from '../types';

interface TopMoversProps {
  assets: Asset[];
  limit?: number;
}

export function TopMovers({ assets, limit = 5 }: TopMoversProps) {
  const { gainers, losers } = useMemo(() => {
    const sorted = [...assets].sort((a, b) => b.changePercent24h - a.changePercent24h);
    return {
      gainers: sorted.slice(0, limit),
      losers: sorted.slice(-limit).reverse(),
    };
  }, [assets, limit]);

  const formatPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    return `$${p.toFixed(4)}`;
  };

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-title">Top Movers</span>
        <span className="text-pablo-muted text-[9px]">24H</span>
      </div>
      <div className="panel-body grid grid-cols-2 divide-x divide-pablo-border/30">
        {/* Gainers */}
        <div>
          <div className="px-2 py-1 text-[8px] text-pablo-green uppercase tracking-[0.15em] border-b border-pablo-border/30 bg-pablo-green/5">
            Gainers
          </div>
          <div className="divide-y divide-pablo-border/20">
            {gainers.map(a => (
              <div key={a.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-pablo-green/5 transition-colors">
                <div className="flex items-center gap-1.5">
                  {a.image && <img src={a.image} alt="" className="w-3.5 h-3.5 rounded-full" loading="lazy" />}
                  <span className="text-[10px] font-mono text-pablo-light">{a.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-pablo-light">{formatPrice(a.price)}</div>
                  <div className="text-[9px] font-mono text-pablo-green">+{a.changePercent24h.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div>
          <div className="px-2 py-1 text-[8px] text-red-400 uppercase tracking-[0.15em] border-b border-pablo-border/30 bg-red-400/5">
            Losers
          </div>
          <div className="divide-y divide-pablo-border/20">
            {losers.map(a => (
              <div key={a.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-red-400/5 transition-colors">
                <div className="flex items-center gap-1.5">
                  {a.image && <img src={a.image} alt="" className="w-3.5 h-3.5 rounded-full" loading="lazy" />}
                  <span className="text-[10px] font-mono text-pablo-light">{a.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-pablo-light">{formatPrice(a.price)}</div>
                  <div className="text-[9px] font-mono text-red-400">{a.changePercent24h.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

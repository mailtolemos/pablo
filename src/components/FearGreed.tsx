import type { MarketGlobal } from '../types';

interface FearGreedProps {
  global: MarketGlobal | null;
}

export function FearGreedWidget({ global }: FearGreedProps) {
  if (!global) return null;

  const { fearGreed, btcDominance, totalMarketCap, totalVolume, marketCapChange24h } = global;
  const value = fearGreed.value;

  const angle = (value / 100) * 180 - 90;
  const getColor = (v: number) => {
    if (v <= 25) return '#ef4444';
    if (v <= 45) return '#f97316';
    if (v <= 55) return '#C6A15B';
    if (v <= 75) return '#84cc16';
    return '#00D084';
  };

  const formatNum = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-title">Market Intel</span>
        <span className="text-pablo-green animate-pulse text-[9px]">LIVE</span>
      </div>

      <div className="panel-body p-4 space-y-4">
        {/* Fear & Greed Gauge */}
        <div className="text-center">
          <div className="text-pablo-muted text-[10px] uppercase tracking-[0.2em] mb-2">
            Fear & Greed Index
          </div>
          <div className="relative mx-auto" style={{ width: 140, height: 80 }}>
            <svg viewBox="0 0 160 90" className="w-full h-full">
              <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#222228" strokeWidth="8" strokeLinecap="round" />
              <path d="M 10 80 A 70 70 0 0 1 36 30" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
              <path d="M 36 30 A 70 70 0 0 1 58 14" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
              <path d="M 58 14 A 70 70 0 0 1 102 14" fill="none" stroke="#C6A15B" strokeWidth="8" strokeLinecap="round" />
              <path d="M 102 14 A 70 70 0 0 1 124 30" fill="none" stroke="#84cc16" strokeWidth="8" strokeLinecap="round" />
              <path d="M 124 30 A 70 70 0 0 1 150 80" fill="none" stroke="#00D084" strokeWidth="8" strokeLinecap="round" />
              <line
                x1="80" y1="80"
                x2={80 + 50 * Math.cos((angle * Math.PI) / 180)}
                y2={80 + 50 * Math.sin((angle * Math.PI) / 180)}
                stroke={getColor(value)} strokeWidth="2" strokeLinecap="round"
              />
              <circle cx="80" cy="80" r="3" fill={getColor(value)} />
            </svg>
          </div>
          <div className="text-4xl font-bold font-mono mt-2" style={{ color: getColor(value) }}>
            {value}
          </div>
          <div className="text-[12px] uppercase tracking-[0.15em] mt-1" style={{ color: getColor(value) }}>
            {fearGreed.classification}
          </div>
        </div>

        <div className="h-px bg-pablo-border" />

        {/* Dominance bars */}
        <DominanceBar label="BTC Dominance" value={btcDominance} color="bg-pablo-gold" />
        <DominanceBar label="ETH Dominance" value={global.ethDominance} color="bg-blue-500" />

        <div className="h-px bg-pablo-border" />

        {/* Quick Stats */}
        <div className="space-y-1.5">
          <StatRow label="Total MCap" value={formatNum(totalMarketCap)} change={marketCapChange24h} />
          <StatRow label="24h Volume" value={formatNum(totalVolume)} />
          <StatRow label="Active Cryptos" value={global.activeCryptos.toLocaleString()} />
        </div>
      </div>
    </div>
  );
}

function DominanceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-pablo-muted text-[10px] uppercase tracking-[0.15em]">{label}</span>
        <span className="text-pablo-light text-[12px] font-mono font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-pablo-border rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StatRow({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-pablo-muted text-[10px] uppercase tracking-[0.15em]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-pablo-light text-[12px] font-mono font-medium">{value}</span>
        {change !== undefined && (
          <span className={`text-[10px] font-mono ${change >= 0 ? 'text-pablo-green' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}

// Compact version for dashboard
export function FearGreedCompact({ global }: FearGreedProps) {
  if (!global) return null;
  const value = global.fearGreed.value;
  const getColor = (v: number) => {
    if (v <= 25) return '#ef4444';
    if (v <= 45) return '#f97316';
    if (v <= 55) return '#C6A15B';
    if (v <= 75) return '#84cc16';
    return '#00D084';
  };
  const angle = (value / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="text-pablo-muted text-[10px] uppercase tracking-[0.2em] mb-2">Fear & Greed</div>
      <div className="relative mx-auto" style={{ width: 110, height: 62 }}>
        <svg viewBox="0 0 160 90" className="w-full h-full">
          <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#222228" strokeWidth="10" strokeLinecap="round" />
          <path d="M 10 80 A 70 70 0 0 1 36 30" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />
          <path d="M 36 30 A 70 70 0 0 1 58 14" fill="none" stroke="#f97316" strokeWidth="10" strokeLinecap="round" />
          <path d="M 58 14 A 70 70 0 0 1 102 14" fill="none" stroke="#C6A15B" strokeWidth="10" strokeLinecap="round" />
          <path d="M 102 14 A 70 70 0 0 1 124 30" fill="none" stroke="#84cc16" strokeWidth="10" strokeLinecap="round" />
          <path d="M 124 30 A 70 70 0 0 1 150 80" fill="none" stroke="#00D084" strokeWidth="10" strokeLinecap="round" />
          <line x1="80" y1="80"
            x2={80 + 45 * Math.cos((angle * Math.PI) / 180)}
            y2={80 + 45 * Math.sin((angle * Math.PI) / 180)}
            stroke={getColor(value)} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="80" cy="80" r="4" fill={getColor(value)} />
        </svg>
      </div>
      <div className="text-2xl font-bold font-mono mt-1" style={{ color: getColor(value) }}>{value}</div>
      <div className="text-[10px] uppercase tracking-[0.12em]" style={{ color: getColor(value) }}>
        {global.fearGreed.classification}
      </div>
    </div>
  );
}

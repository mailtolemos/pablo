import type { MarketGlobal } from '../types';

interface FearGreedProps {
  global: MarketGlobal | null;
}

export function FearGreedWidget({ global }: FearGreedProps) {
  if (!global) return null;

  const { fearGreed, btcDominance, totalMarketCap, totalVolume, marketCapChange24h } = global;
  const value = fearGreed.value;

  // Gauge calculations
  const angle = (value / 100) * 180 - 90; // -90 to 90 degrees
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
    <div className="panel h-full">
      <div className="panel-header">
        <span>Market Intelligence</span>
        <span className="text-pablo-green animate-pulse text-[10px]">â LIVE</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Fear & Greed Gauge */}
        <div className="text-center">
          <div className="text-pablo-muted text-[10px] uppercase tracking-widest mb-2">
            Fear & Greed Index
          </div>
          <div className="relative mx-auto" style={{ width: 160, height: 90 }}>
            <svg viewBox="0 0 160 90" className="w-full h-full">
              {/* Background arc */}
              <path
                d="M 10 80 A 70 70 0 0 1 150 80"
                fill="none"
                stroke="#222228"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Colored segments */}
              <path d="M 10 80 A 70 70 0 0 1 36 30" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
              <path d="M 36 30 A 70 70 0 0 1 58 14" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
              <path d="M 58 14 A 70 70 0 0 1 102 14" fill="none" stroke="#C6A15B" strokeWidth="8" strokeLinecap="round" />
              <path d="M 102 14 A 70 70 0 0 1 124 30" fill="none" stroke="#84cc16" strokeWidth="8" strokeLinecap="round" />
              <path d="M 124 30 A 70 70 0 0 1 150 80" fill="none" stroke="#00D084" strokeWidth="8" strokeLinecap="round" />
              {/* Needle */}
              <line
                x1="80"
                y1="80"
                x2={80 + 50 * Math.cos((angle * Math.PI) / 180)}
                y2={80 + 50 * Math.sin((angle * Math.PI) / 180)}
                stroke={getColor(value)}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="80" cy="80" r="4" fill={getColor(value)} />
            </svg>
          </div>
          <div className="text-3xl font-bold font-mono mt-1" style={{ color: getColor(value) }}>
            {value}
          </div>
          <div className="text-xs uppercase tracking-widest" style={{ color: getColor(value) }}>
            {fearGreed.classification}
          </div>
        </div>

        <div className="h-px bg-pablo-border" />

        {/* BTC Dominance */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-pablo-muted text-[10px] uppercase tracking-widest">BTC Dominance</span>
            <span className="text-pablo-light text-sm font-mono font-medium">{btcDominance.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-pablo-border rounded-full h-1.5">
            <div
              className="bg-pablo-gold h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${btcDominance}%` }}
            />
          </div>
        </div>

        {/* ETH Dominance */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-pablo-muted text-[10px] uppercase tracking-widest">ETH Dominance</span>
            <span className="text-pablo-light text-sm font-mono font-medium">{global.ethDominance.toFixed(1)}%</span>
          </div>
          <div className="w full bg-pablo-border rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${global.ethDominance}%` }}
            />
          </div>
        </div>

        <div className="h-px bg-pablo-border" />

        {/* Quick Stats */}
        <div className="space-y-2">
          <StatRow label="Total Market Cap" value={formatNum(totalMarketCap)} change={marketCapChange24h} />
          <StatRow label="24h Volume" value={formatNum(totalVolume)} />
          <StatRow label="Active Cryptos" value={global.activeCryptos.toLocaleString()} />
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-pablo-muted text-[10px] uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-pablo-light text-xs font-mono">{value}</span>
        {change !== undefined && (
          <span className={`text-[10px] font-mono ${change >= 0 ? 'text-pablo-green' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}

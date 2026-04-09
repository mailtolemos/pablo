import type { MarketGlobal } from '../types';

interface QuickStatsProps {
  global: MarketGlobal | null;
}

export function QuickStats({ global }: QuickStatsProps) {
  if (!global) return null;

  const formatNum = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    return `$${n.toLocaleString()}`;
  };

  const stats = [
    {
      label: 'Total Market Cap',
      value: formatNum(global.totalMarketCap),
      change: global.marketCapChange24h,
    },
    {
      label: '24H Volume',
      value: formatNum(global.totalVolume),
    },
    {
      label: 'BTC Dominance',
      value: `${global.btcDominance.toFixed(1)}%`,
      bar: global.btcDominance,
      barColor: '#C6A15B',
    },
    {
      label: 'ETH Dominance',
      value: `${global.ethDominance.toFixed(1)}%`,
      bar: global.ethDominance,
      barColor: '#6366f1',
    },
    {
      label: 'Active Cryptos',
      value: global.activeCryptos.toLocaleString(),
    },
    {
      label: 'Fear & Greed',
      value: `${global.fearGreed.value}`,
      tag: global.fearGreed.classification,
      tagColor: global.fearGreed.value >= 60 ? '#00D084'
        : global.fearGreed.value <= 40 ? '#ef4444' : '#C6A15B',
    },
  ];

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-title">Market Overview</span>
      </div>
      <div className="panel-body grid grid-cols-3 divide-x divide-pablo-border/30">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`stat-cell ${i >= 3 ? 'border-t border-pablo-border/30' : ''}`}
          >
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={stat.tagColor ? { color: stat.tagColor } : {}}>
              {stat.value}
            </div>
            {stat.change !== undefined && (
              <div className={`stat-change ${stat.change >= 0 ? 'text-pablo-green' : 'text-red-400'}`}>
                {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(2)}%
              </div>
            )}
            {stat.tag && (
              <div className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color: stat.tagColor }}>
                {stat.tag}
              </div>
            )}
            {stat.bar !== undefined && (
              <div className="w-full max-w-[60px] bg-pablo-border rounded-full h-0.5 mt-1">
                <div
                  className="h-0.5 rounded-full transition-all duration-500"
                  style={{ width: `${stat.bar}%`, backgroundColor: stat.barColor }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

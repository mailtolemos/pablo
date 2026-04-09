import { useState, useMemo } from 'react';
import type { Asset, AssetType } from '../types';
import { useAuth } from '../context/AuthContext';
import { Sparkline } from './Sparkline';

interface AssetTableProps {
  assets: Asset[];
  title: string;
  showType?: boolean;
  compact?: boolean;
}

type SortField = 'rank' | 'name' | 'price' | 'change' | 'marketCap' | 'volume';
type SortDir = 'asc' | 'desc';

export function AssetTable({ assets, title, showType = false, compact = false }: AssetTableProps) {
  const { user, preferences, toggleFavorite } = useAuth();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'change' ? 'desc' : 'asc');
    }
  };

  const filtered = useMemo(() => {
    let result = [...assets];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        a => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let valA: number, valB: number;
      switch (sortField) {
        case 'rank': valA = a.rank ?? 9999; valB = b.rank ?? 9999; break;
        case 'name': return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'price': valA = a.price; valB = b.price; break;
        case 'change': valA = a.changePercent24h; valB = b.changePercent24h; break;
        case 'marketCap': valA = a.marketCap ?? 0; valB = b.marketCap ?? 0; break;
        case 'volume': valA = a.volume24h ?? 0; valB = b.volume24h ?? 0; break;
        default: valA = 0; valB = 0;
      }
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
    return result;
  }, [assets, search, sortField, sortDir]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatLarge = (n: number | undefined) => {
    if (!n) return '--';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return `$${n.toLocaleString()}`;
  };

  const typeLabel = (t: AssetType) => {
    const map: Record<AssetType, string> = {
      crypto: 'CRYPTO', stock: 'STOCK', index: 'INDEX', commodity: 'CMDTY',
    };
    const colorMap: Record<AssetType, string> = {
      crypto: 'text-pablo-green', stock: 'text-blue-400', index: 'text-pablo-gold', commodity: 'text-orange-400',
    };
    return <span className={`${colorMap[t]} text-[9px]`}>{map[t]}</span>;
  };

  const SortHeader = ({ field, children, className = '' }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <th
      className={`px-2 py-1.5 text-left cursor-pointer hover:text-pablo-light select-none transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-pablo-green text-[9px]">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-title">
          {title} <span className="text-pablo-muted ml-1">[{filtered.length}]</span>
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="search..."
          className="bg-pablo-black border border-pablo-border px-2 py-0.5 text-[10px] text-pablo-light font-mono
                     focus:outline-none focus:border-pablo-green/50 transition-colors w-28 placeholder-pablo-muted"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px] font-mono">
          <thead className="text-pablo-muted uppercase tracking-wider sticky top-0 bg-pablo-panel z-10 text-[9px]">
            <tr className="border-b border-pablo-border">
              {user && <th className="w-6 px-1 py-1.5"></th>}
              <SortHeader field="rank" className="w-8">#</SortHeader>
              <SortHeader field="name">Asset</SortHeader>
              {showType && <th className="px-2 py-1.5 text-left">Type</th>}
              <SortHeader field="price" className="text-right">Price</SortHeader>
              <SortHeader field="change" className="text-right">24h</SortHeader>
              {!compact && <SortHeader field="marketCap" className="text-right hidden lg:table-cell">MCap</SortHeader>}
              {!compact && <SortHeader field="volume" className="text-right hidden md:table-cell">Vol</SortHeader>}
              {!compact && <th className="px-2 py-1.5 text-right hidden xl:table-cell w-20">7D</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset, i) => {
              const isFav = preferences.favorites.includes(asset.id);
              const isPositive = asset.changePercent24h >= 0;
              return (
                <tr
                  key={asset.id}
                  className="border-b border-pablo-border/30 hover:bg-pablo-green/5 transition-colors group"
                >
                  {user && (
                    <td className="px-1 py-1.5">
                      <button
                        onClick={() => toggleFavorite(asset.id)}
                        className={`text-xs transition-all ${
                          isFav ? 'text-pablo-gold' : 'text-pablo-muted/20 group-hover:text-pablo-muted/60'
                        }`}
                      >
                        {isFav ? '\u2605' : '\u2606'}
                      </button>
                    </td>
                  )}
                  <td className="px-2 py-1.5 text-pablo-muted text-[10px]">{asset.rank ?? i + 1}</td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      {asset.image && (
                        <img src={asset.image} alt="" className="w-4 h-4 rounded-full" loading="lazy" />
                      )}
                      <span className="text-pablo-light font-medium">{asset.symbol}</span>
                      <span className="text-pablo-muted hidden sm:inline text-[10px]">{asset.name}</span>
                    </div>
                  </td>
                  {showType && <td className="px-2 py-1.5">{typeLabel(asset.type)}</td>}
                  <td className="px-2 py-1.5 text-right text-pablo-light tabular-nums">
                    {formatPrice(asset.price)}
                  </td>
                  <td className={`px-2 py-1.5 text-right tabular-nums font-medium ${
                    isPositive ? 'text-pablo-green' : 'text-red-400'
                  }`}>
                    {isPositive ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                  </td>
                  {!compact && (
                    <td className="px-2 py-1.5 text-right text-pablo-text tabular-nums hidden lg:table-cell text-[10px]">
                      {formatLarge(asset.marketCap)}
                    </td>
                  )}
                  {!compact && (
                    <td className="px-2 py-1.5 text-right text-pablo-text tabular-nums hidden md:table-cell text-[10px]">
                      {formatLarge(asset.volume24h)}
                    </td>
                  )}
                  {!compact && (
                    <td className="px-2 py-1.5 text-right hidden xl:table-cell">
                      {asset.sparkline && asset.sparkline.length > 0 && (
                        <Sparkline data={asset.sparkline} positive={isPositive} width={70} height={20} />
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-24 text-pablo-muted text-[10px] font-mono">
            No assets found.
          </div>
        )}
      </div>
    </div>
  );
}

import type { TabId } from '../types';
import { useAuth } from '../context/AuthContext';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  counts: Record<TabId, number>;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'all', label: 'All Assets', icon: 'â' },
  { id: 'favorites', label: 'Favorites', icon: 'â' },
  { id: 'crypto', label: 'Crypto', icon: 'â¿' },
  { id: 'stocks', label: 'Stocks', icon: '$' },
  { id: 'indexes', label: 'Indexes', icon: 'â' },
  { id: 'commodities', label: 'Commodities', icon: 'â¬¡' },
  { id: 'news', label: 'Signal Feed', icon: 'ð¡' },
];

export function TabBar({ activeTab, onTabChange, counts }: TabBarProps) {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-pablo-dark border-b border-pablo-border overflow-x-auto">
      {TABS.map(tab => {
        // Only show favorites tab if logged in
        if (tab.id === 'favorites' && !user) return null;

        const isActive = activeTab === tab.id;
        const count = counts[tab.id] ?? 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider
                        rounded-sm transition-all whitespace-nowrap ${
              isActive
                ? 'bg-pablo-green/10 text-pablo-green border border-pablo-green/30'
                : 'text-pablo-muted hover:text-pablo-light hover:bg-pablo-border/20 border border-transparent'
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
            {count > 0 && tab.id !== 'news' && (
              <span className={`text-[9px] ${isActive ? 'text-pablo-green/70' : 'text-pablo-muted/50'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

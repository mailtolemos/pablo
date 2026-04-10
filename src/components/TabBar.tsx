import type { TabId } from '../types';
import { useAuth } from '../context/AuthContext';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  counts: Record<TabId, number>;
}

const TABS: { id: TabId; label: string; shortLabel?: string }[] = [
  { id: 'dashboard', label: 'My Terminal' },
  { id: 'all', label: 'All Assets' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'indexes', label: 'Indexes' },
  { id: 'commodities', label: 'Commodities' },
  { id: 'news', label: 'Signal Feed' },
];

export function TabBar({ activeTab, onTabChange, counts }: TabBarProps) {
  const { user } = useAuth();

  return (
    <div className="flex items-center bg-pablo-dark border-b border-pablo-border overflow-x-auto flex-shrink-0">
      {TABS.map((tab, i) => {
        // Only show dashboard tab if logged in
        if (tab.id === 'dashboard' && !user) return null;

        const isActive = activeTab === tab.id;
        const count = counts[tab.id] ?? 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`btn-tab ${isActive ? 'btn-tab-active' : ''} ${i === 0 ? 'ml-2' : ''} py-2 text-[12px]`}
          >
            <span className="flex items-center gap-2">
              <span>{tab.label}</span>
              {count > 0 && tab.id !== 'news' && tab.id !== 'dashboard' && (
                <span className={`text-[10px] font-mono ${isActive ? 'text-pablo-green/70' : 'text-pablo-muted/50'}`}>
                  ({count})
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

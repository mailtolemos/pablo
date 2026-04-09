import { useState } from 'react';
import type { NewsItem, NewsSource } from '../types';
import { useAuth } from '../context/AuthContext';

interface NewsFeedProps {
  news: NewsItem[];
  isLoading: boolean;
  lastFetched: Date | null;
  onRefresh: () => void;
  compact?: boolean;
  maxItems?: number;
}

export function NewsFeed({ news, isLoading, lastFetched, onRefresh, compact = false, maxItems }: NewsFeedProps) {
  const { user, preferences, updateNewsSources } = useAuth();
  const [showSources, setShowSources] = useState(false);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceName, setNewSourceName] = useState('');

  const displayNews = maxItems ? news.slice(0, maxItems) : news;

  const addSource = () => {
    if (!newSourceUrl || !newSourceName) return;
    const newSource: NewsSource = {
      id: `custom-${Date.now()}`,
      name: newSourceName,
      type: 'rss',
      url: newSourceUrl,
      enabled: true,
    };
    updateNewsSources([...preferences.newsSources, newSource]);
    setNewSourceUrl('');
    setNewSourceName('');
  };

  const toggleSource = (id: string) => {
    const updated = preferences.newsSources.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    updateNewsSources(updated);
  };

  const removeSource = (id: string) => {
    updateNewsSources(preferences.newsSources.filter(s => s.id !== id));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-title">
          Signal Feed <span className="text-pablo-muted">[{news.length}]</span>
        </span>
        <div className="flex items-center gap-2">
          {!compact && (
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-pablo-muted hover:text-pablo-green transition-colors text-[9px] uppercase tracking-wider"
            >
              src
            </button>
          )}
          <button
            onClick={onRefresh}
            className="text-pablo-muted hover:text-pablo-green transition-colors text-[10px]"
          >
            {'\u21BB'}
          </button>
        </div>
      </div>

      {/* Sources panel */}
      {showSources && !compact && (
        <div className="border-b border-pablo-border p-3 space-y-2 bg-pablo-dark">
          <div className="text-[9px] text-pablo-muted uppercase tracking-[0.15em] mb-1">Sources</div>
          {preferences.newsSources.map(source => (
            <div key={source.id} className="flex items-center justify-between gap-2">
              <button
                onClick={() => toggleSource(source.id)}
                className={`flex items-center gap-1.5 text-[10px] font-mono ${
                  source.enabled ? 'text-pablo-green' : 'text-pablo-muted'
                }`}
              >
                <span className="text-[8px]">{source.enabled ? '\u25C9' : '\u25CB'}</span>
                {source.name}
              </button>
              <button
                onClick={() => removeSource(source.id)}
                className="text-pablo-muted hover:text-red-400 text-[9px] transition-colors"
              >
                x
              </button>
            </div>
          ))}

          {user && (
            <div className="pt-2 border-t border-pablo-border">
              <div className="text-[9px] text-pablo-muted uppercase tracking-[0.15em] mb-1">Add RSS</div>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newSourceName}
                  onChange={e => setNewSourceName(e.target.value)}
                  placeholder="Name"
                  className="bg-pablo-black border border-pablo-border px-1.5 py-0.5 text-[10px] text-pablo-light font-mono
                             focus:outline-none focus:border-pablo-green/50 transition-colors w-20 placeholder-pablo-muted"
                />
                <input
                  type="url"
                  value={newSourceUrl}
                  onChange={e => setNewSourceUrl(e.target.value)}
                  placeholder="RSS URL"
                  className="bg-pablo-black border border-pablo-border px-1.5 py-0.5 text-[10px] text-pablo-light font-mono
                             focus:outline-none focus:border-pablo-green/50 transition-colors flex-1 placeholder-pablo-muted"
                />
                <button
                  onClick={addSource}
                  className="text-pablo-green border border-pablo-green/40 px-1.5 py-0.5 text-[9px]
                             hover:bg-pablo-green/10 transition-all"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* News list */}
      <div className="flex-1 overflow-auto">
        {isLoading && news.length === 0 ? (
          <div className="flex items-center justify-center h-24">
            <div className="text-pablo-green text-[10px] font-mono animate-pulse">
              Scanning sources...
            </div>
          </div>
        ) : (
          <div className="divide-y divide-pablo-border/30">
            {displayNews.map(item => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 hover:bg-pablo-green/5 transition-colors group"
              >
                <h3 className="text-[11px] text-pablo-light leading-relaxed group-hover:text-pablo-green transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {!compact && item.description && (
                  <p className="text-[10px] text-pablo-muted mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] text-pablo-green uppercase tracking-wider">
                    {item.source}
                  </span>
                  <span className="text-pablo-muted text-[9px]">{'\u00B7'}</span>
                  <span className="text-pablo-muted text-[9px]">{timeAgo(item.publishedAt)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {!isLoading && news.length === 0 && (
          <div className="flex items-center justify-center h-24 text-pablo-muted text-[10px] font-mono">
            No signals. Enable sources above.
          </div>
        )}
      </div>
    </div>
  );
}

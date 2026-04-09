import { useState } from 'react';
import type { NewsItem, NewsSource } from '../types';
import { useAuth } from '../context/AuthContext';

interface NewsFeedProps {
  news: NewsItem[];
  isLoading: boolean;
  lastFetched: Date | null;
  onRefresh: () => void;
}

export function NewsFeed({ news, isLoading, lastFetched, onRefresh }: NewsFeedProps) {
  const { user, preferences, updateNewsSources } = useAuth();
  const [showSources, setShowSources] = useState(false);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceName, setNewSourceName] = useState('');

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
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span>
          Signal Feed
          <span className="text-pablo-muted ml-2">[{news.length}]</span>
        </span>
        <div className="flex items-center gap-3">
          {lastFetched && (
            <span className="text-pablo-muted text-[10px]">
              {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => setShowSources(!showSources)}
            className="text-pablo-muted hover:text-pablo-green transition-colors text-[10px] uppercase tracking-wider"
          >
            Sources
          </button>
          <button
            onClick={onRefresh}
            className="text-pablo-muted hover:text-pablo-green transition-colors text-[10px]"
            title="Refresh now"
          >
            â»
          </button>
        </div>
      </div>

      {/* Sources panel */}
      {showSources && (
        <div className="border-b border-pablo-border p-3 space-y-3 bg-pablo-dark animate-fadeIn">
          <div className="text-[10px] text-pablo-muted uppercase tracking-widest mb-2">
            Active Sources
          </div>
          {preferences.newsSources.map(source => (
            <div key={source.id} className="flex items-center justify-between gap-2">
              <button
                onClick={() => toggleSource(source.id)}
                className={`flex items-center gap-2 text-xs font-mono ${
                  source.enabled ? 'text-pablo-green' : 'text-pablo-muted'
                }`}
              >
                <span className="text-[10px]">{source.enabled ? 'â' : 'â'}</span>
                {source.name}
              </button>
              <button
                onClick={() => removeSource(source.id)}
                className="text-pablo-muted hover:text-red-400 text-[10px] transition-colors"
              >
                â
              </button>
            </div>
          ))}

          {user && (
            <div className="pt-2 border-t border-pablo-border">
              <div className="text-[10px] text-pablo-muted uppercase tracking-widest mb-2">
                Add RSS Source
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSourceName}
                  onChange={e => setNewSourceName(e.target.value)}
                  placeholder="Name"
                  className="bg-pablo-black border border-pablo-border px-2 py-1 text-[11px] text-pablo-light font-mono
                             focus:outline-none focus:border-pablo-green transition-colors rounded-sm w-24 placeholder-pablo-muted"
                />
                <input
                  type="url"
                  value={newSourceUrl}
                  onChange={e => setNewSourceUrl(e.target.value)}
                  placeholder="RSS URL"
                  className="bg-pablo-black border border-pablo-border px-2 py-1 text-[11px] text-pablo-light font-mono
                             focus:outline-none focus:border-pablo-green transition-colors rounded-sm flex-1 placeholder-pablo-muted"
                />
                <button
                  onClick={addSource}
                  className="text-pablo-green border border-pablo-green px-2 py-1 text-[10px] rounded-sm
                             hover:bg-pablo-green hover:text-pablo-black transition-all"
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
          <div className="flex items-center justify-center h-32">
            <div className="text-pablo-green text-xs font-mono animate-pulse">
              Scanning sources...
            </div>
          </div>
        ) : (
          <div className="divide-y divide-pablo-border/50">
            {news.map(item => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 hover:bg-pablo-border/10 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs text-pablo-light font-medium leading-relaxed group-hover:text-pablo-green transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-[11px] text-pablo-muted mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-pablo-green uppercase tracking-wider">
                        {item.source}
                      </span>
                      <span className="text-pablo-muted text-[10px]">â¢</span>
                      <span className="text-pablo-muted text-[10px]">
                        {timeAgo(item.publishedAt)}
                      </span>
                    </div>
                  </div>
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="w-16 h-16 object-cover rounded-sm flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {!isLoading && news.length === 0 && (
          <div className="flex items-center justify-center h-32 text-pablo-muted text-xs font-mono">
            No signals detected. Enable news sources above.
          </div>
        )}
      </div>
    </div>
  );
}

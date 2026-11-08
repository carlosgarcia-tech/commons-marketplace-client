'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui';

const RECENT_SEARCHES_KEY = 'recent-searches';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  const recent = getRecentSearches().filter(s => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, 5)));
}

function SearchBarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showRecent, setShowRecent] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Deferred to a timeout: synchronous setState inside effect bodies
    // is disallowed by react-hooks/set-state-in-effect, and localStorage
    // is an external system that should not be read during render.
    const search = searchParams.get('search') || '';
    const timer = setTimeout(() => {
      setQuery(search);
      setRecentSearches(getRecentSearches());
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const performSearch = useCallback((searchQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
      saveRecentSearch(searchQuery.trim());
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleClear = () => {
    setQuery('');
    performSearch('');
  };

  const handleRecentClick = (search: string) => {
    setQuery(search);
    performSearch(search);
    setShowRecent(false);
  };

  return (
    <div className="relative max-w-xl w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 200)}
            className="flex-1 pr-8"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {showRecent && recentSearches.length > 0 && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl p-2 z-50">
          <p className="text-[10px] font-mono tracking-wider text-gray-400 mb-1 px-2">
            Búsquedas recientes
          </p>
          {recentSearches.map((search, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleRecentClick(search)}
              className="block w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchBar() {
  return <SearchBarContent />;
}
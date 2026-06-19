'use client';

import { useState } from 'react';
import type { CategoryInternal, EventResult } from '@wanderaza/types';
import { searchEvents } from './api/searchEvents';
import { CategoryFilters } from './components/CategoryFilters';
import { EventResultsList } from './components/EventResultsList';
import { SearchForm } from './components/SearchForm';

const EVENT_CATEGORIES: CategoryInternal[] = ['music', 'sports', 'arts', 'festival', 'comedy'];

export function SearchExperience() {
  const [results, setResults] = useState<EventResult[]>([]);
  const [category, setCategory] = useState<CategoryInternal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(params: { city: string; startDate: string; endDate: string }) {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      setResults(await searchEvents(params));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  const visibleResults = category
    ? results.filter((event) => event.categoryInternal === category)
    : results;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
      <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      {hasSearched && (
        <CategoryFilters categories={EVENT_CATEGORIES} selected={category} onSelect={setCategory} />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {hasSearched && !error && <EventResultsList events={visibleResults} isLoading={isLoading} />}
    </div>
  );
}

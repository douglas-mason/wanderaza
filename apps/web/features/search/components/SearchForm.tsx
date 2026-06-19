'use client';

import { useState, type FormEvent } from 'react';

interface SearchFormProps {
  onSearch: (params: { city: string; startDate: string; endDate: string }) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!city || !startDate || !endDate) return;
    onSearch({ city, startDate, endDate });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="city" className="block text-sm font-medium text-muted-foreground mb-1">
          Destination
        </label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Nashville, TN"
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-muted-foreground mb-1">
          From
        </label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>
      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-muted-foreground mb-1">
          To
        </label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(event) => setEndDate(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="h-10 rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}

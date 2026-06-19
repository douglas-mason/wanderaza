'use client';

import type { CategoryInternal } from '@wanderaza/types';

interface CategoryFiltersProps {
  categories: CategoryInternal[];
  selected: CategoryInternal | null;
  onSelect: (category: CategoryInternal | null) => void;
}

const LABELS: Record<CategoryInternal, string> = {
  music: 'Music',
  sports: 'Sports',
  arts: 'Arts',
  festival: 'Festival',
  comedy: 'Comedy',
  restaurant: 'Restaurants',
  bar: 'Bars',
  cafe: 'Cafes',
  attraction: 'Attractions',
  shopping: 'Shopping',
  hotel: 'Hotels',
};

function pillClass(active: boolean) {
  return `text-xs px-3 py-1.5 rounded-full border transition-colors ${
    active
      ? 'bg-primary text-primary-foreground border-primary'
      : 'border-border text-muted-foreground hover:bg-secondary'
  }`;
}

export function CategoryFilters({ categories, selected, onSelect }: CategoryFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button type="button" onClick={() => onSelect(null)} className={pillClass(selected === null)}>
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={pillClass(selected === category)}
        >
          {LABELS[category]}
        </button>
      ))}
    </div>
  );
}

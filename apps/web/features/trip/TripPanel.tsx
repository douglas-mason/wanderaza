'use client';

import { useState } from 'react';
import type { TripItemDetail, TripSummary } from '@wanderaza/types';

interface TripPanelProps {
  trip: TripSummary | null;
  items: TripItemDetail[];
  onRemoveItem?: (itemId: string) => void;
}

function localDayKey(startTime: string) {
  const date = new Date(startTime);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDayLabel(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatItemTime(startTime?: string) {
  if (!startTime) return null;
  return new Date(startTime).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function groupItemsByDay(items: TripItemDetail[]): [string, TripItemDetail[]][] {
  const groups = new Map<string, TripItemDetail[]>();
  const undated: TripItemDetail[] = [];

  for (const item of items) {
    if (!item.startTime) {
      undated.push(item);
      continue;
    }
    const dateKey = localDayKey(item.startTime);
    const group = groups.get(dateKey) ?? [];
    group.push(item);
    groups.set(dateKey, group);
  }

  const sorted = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  if (undated.length > 0) {
    sorted.push(['Unscheduled', undated]);
  }
  return sorted;
}

export function TripPanel({ trip, items, onRemoveItem }: TripPanelProps) {
  const [copied, setCopied] = useState(false);
  const isOwner = Boolean(onRemoveItem);

  if (!trip) {
    return (
      <div className="border border-dashed border-border rounded-lg p-6 text-sm text-muted-foreground">
        Add an event to start building your trip.
      </div>
    );
  }

  const dayGroups = groupItemsByDay(items);
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/trip/${trip.shareSlug}`
      : `/trip/${trip.shareSlug}`;

  async function handleCopyShareLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{trip.title}</h2>
        <p className="text-sm text-muted-foreground">
          {trip.destination} · {trip.startDate} – {trip.endDate}
        </p>
      </div>
      {isOwner && (
        <div className="flex items-center gap-2 border border-border rounded-lg p-3">
          <span className="text-xs text-muted-foreground truncate flex-1">{shareUrl}</span>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-accent transition-colors whitespace-nowrap"
          >
            {copied ? 'Copied!' : 'Copy share link'}
          </button>
        </div>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet — add an event from search.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {dayGroups.map(([dateKey, dayItems]) => (
            <div key={dateKey} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {dateKey === 'Unscheduled' ? 'Unscheduled' : formatDayLabel(dateKey)}
              </h3>
              <div className="flex flex-col gap-2">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-border rounded-lg p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[item.venue, formatItemTime(item.startTime)].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    {onRemoveItem && (
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors whitespace-nowrap"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

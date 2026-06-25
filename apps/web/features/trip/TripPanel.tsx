import type { TripItemDetail, TripSummary } from '@wanderaza/types';

interface TripPanelProps {
  trip: TripSummary | null;
  items: TripItemDetail[];
}

function formatDayLabel(dateKey: string) {
  return new Date(dateKey).toLocaleDateString(undefined, {
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
    const dateKey = item.startTime.slice(0, 10);
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

export function TripPanel({ trip, items }: TripPanelProps) {
  if (!trip) {
    return (
      <div className="border border-dashed border-border rounded-lg p-6 text-sm text-muted-foreground">
        Add an event to start building your trip.
      </div>
    );
  }

  const dayGroups = groupItemsByDay(items);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{trip.title}</h2>
        <p className="text-sm text-muted-foreground">
          {trip.destination} · {trip.startDate} – {trip.endDate}
        </p>
      </div>
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
                  <div key={item.id} className="border border-border rounded-lg p-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[item.venue, formatItemTime(item.startTime)].filter(Boolean).join(' · ')}
                    </p>
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

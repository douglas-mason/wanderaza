import type { EventResult } from '@wanderaza/types';
import { EventResultCard } from './EventResultCard';

interface EventResultsListProps {
  events: EventResult[];
  isLoading: boolean;
  addedEventKeys: Set<string>;
  onAddToTrip: (event: EventResult) => void;
}

export function EventResultsList({
  events,
  isLoading,
  addedEventKeys,
  onAddToTrip,
}: EventResultsListProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Searching for events…</p>;
  }

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No events found for those dates.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((event) => {
        const key = `${event.source}-${event.externalId}`;
        return (
          <EventResultCard
            key={key}
            event={event}
            isAdded={addedEventKeys.has(key)}
            onAdd={() => onAddToTrip(event)}
          />
        );
      })}
    </div>
  );
}

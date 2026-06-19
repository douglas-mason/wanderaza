import type { EventResult } from '@wanderaza/types';
import { EventResultCard } from './EventResultCard';

interface EventResultsListProps {
  events: EventResult[];
  isLoading: boolean;
}

export function EventResultsList({ events, isLoading }: EventResultsListProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Searching for events…</p>;
  }

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No events found for those dates.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((event) => (
        <EventResultCard key={`${event.source}-${event.externalId}`} event={event} />
      ))}
    </div>
  );
}

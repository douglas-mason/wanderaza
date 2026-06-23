import type { EventResult } from '@wanderaza/types';

function formatStartTime(startTime?: string) {
  if (!startTime) return null;
  return new Date(startTime).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface EventResultCardProps {
  event: EventResult;
  isAdded: boolean;
  onAdd: () => void;
}

export function EventResultCard({ event, isAdded, onAdd }: EventResultCardProps) {
  const formattedTime = formatStartTime(event.startTime);

  return (
    <div className="border border-border rounded-lg p-3 flex gap-3 hover:border-muted-foreground/40 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{event.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {[event.venueName, formattedTime].filter(Boolean).join(' · ')}
        </p>
        {event.priceRange && (
          <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {event.priceRange}
          </span>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 self-center">
        <button
          type="button"
          onClick={onAdd}
          disabled={isAdded}
          className={`text-xs px-2.5 py-1 rounded-md border whitespace-nowrap transition-colors ${
            isAdded
              ? 'border-border bg-secondary text-secondary-foreground cursor-default'
              : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
          }`}
        >
          {isAdded ? 'Added' : 'Add to trip'}
        </button>
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline whitespace-nowrap"
          >
            View tickets
          </a>
        )}
      </div>
    </div>
  );
}

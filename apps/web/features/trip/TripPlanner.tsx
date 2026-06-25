'use client';

import { useEffect, useState } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import type { EventResult, TripItemDetail, TripSummary } from '@wanderaza/types';
import { SearchExperience, type SearchContext } from '../search/SearchExperience';
import { addEventToTrip, createTrip, getTrip } from './api/tripsApi';
import { TripPanel } from './TripPanel';

function eventKey(event: EventResult) {
  return `${event.source}-${event.externalId}`;
}

function itemKey(item: TripItemDetail) {
  return item.source && item.externalId ? `${item.source}-${item.externalId}` : undefined;
}

interface TripPlannerProps {
  tripId?: string;
}

export function TripPlanner({ tripId }: TripPlannerProps = {}) {
  const { isSignedIn, getToken } = useAuth();
  const { openSignIn } = useClerk();
  const [trip, setTrip] = useState<TripSummary | null>(null);
  const [items, setItems] = useState<TripItemDetail[]>([]);
  const [addedEventKeys, setAddedEventKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(tripId));

  useEffect(() => {
    if (!tripId) return;
    const activeTripId = tripId;

    let cancelled = false;

    async function loadTrip() {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) {
          openSignIn();
          return;
        }

        const detail = await getTrip(token, activeTripId);
        if (cancelled) return;

        setTrip(detail);
        setItems(detail.items);
        setAddedEventKeys(
          new Set(detail.items.map(itemKey).filter((key): key is string => Boolean(key)))
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load trip');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadTrip();
    return () => {
      cancelled = true;
    };
  }, [tripId, getToken, openSignIn]);

  async function handleAddToTrip(event: EventResult, context: SearchContext) {
    setError(null);

    if (!isSignedIn) {
      openSignIn();
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        openSignIn();
        return;
      }

      let activeTrip = trip;
      if (!activeTrip) {
        activeTrip = await createTrip(token, {
          title: `${context.city} trip`,
          destination: context.city,
          startDate: context.startDate,
          endDate: context.endDate,
        });
        setTrip(activeTrip);
      }

      const item = await addEventToTrip(token, activeTrip.id, event);
      setItems((prev) => [...prev, item]);
      setAddedEventKeys((prev) => new Set(prev).add(eventKey(event)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add event to trip');
    }
  }

  if (isLoading) {
    return <p className="max-w-6xl mx-auto px-6 py-10 text-sm text-muted-foreground">Loading trip…</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <SearchExperience addedEventKeys={addedEventKeys} onAddToTrip={handleAddToTrip} />
      <div className="flex flex-col gap-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <TripPanel trip={trip} items={items} />
      </div>
    </div>
  );
}

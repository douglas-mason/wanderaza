'use client';

import { useState } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import type { EventResult, TripItemDetail, TripSummary } from '@wanderaza/types';
import { SearchExperience, type SearchContext } from '../search/SearchExperience';
import { addEventToTrip, createTrip } from './api/tripsApi';
import { TripPanel } from './TripPanel';

function eventKey(event: EventResult) {
  return `${event.source}-${event.externalId}`;
}

export function TripPlanner() {
  const { isSignedIn, getToken } = useAuth();
  const { openSignIn } = useClerk();
  const [trip, setTrip] = useState<TripSummary | null>(null);
  const [items, setItems] = useState<TripItemDetail[]>([]);
  const [addedEventKeys, setAddedEventKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

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

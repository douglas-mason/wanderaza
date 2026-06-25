'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import type { TripSummary } from '@wanderaza/types';
import { listTrips } from './api/tripsApi';

export function MyTrips() {
  const { isSignedIn, getToken } = useAuth();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTrips() {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) return;
        const result = await listTrips(token);
        if (!cancelled) setTrips(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load trips');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadTrips();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);

  if (!isSignedIn) {
    return <p className="text-sm text-muted-foreground">Sign in to see your trips.</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading your trips…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (trips.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No trips yet — start planning one from the home page.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {trips.map((trip) => (
        <li key={trip.id}>
          <Link
            href={`/trips/${trip.id}`}
            className="block border border-border rounded-lg p-4 hover:bg-accent transition-colors"
          >
            <p className="text-sm font-medium">{trip.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {trip.destination} · {trip.startDate} – {trip.endDate}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

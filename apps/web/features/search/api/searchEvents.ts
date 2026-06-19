import type { EventResult } from '@wanderaza/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface SearchEventsParams {
  city: string;
  startDate: string;
  endDate: string;
}

export async function searchEvents(params: SearchEventsParams): Promise<EventResult[]> {
  const query = new URLSearchParams({
    city: params.city,
    startDate: params.startDate,
    endDate: params.endDate,
  });
  const response = await fetch(`${API_URL}/events/search?${query.toString()}`);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? 'Failed to fetch events');
  }

  const data = (await response.json()) as { events: EventResult[] };
  return data.events;
}

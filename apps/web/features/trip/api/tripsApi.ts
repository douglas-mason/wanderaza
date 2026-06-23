import type { EventResult, TripDetail, TripItemDetail, TripSummary } from '@wanderaza/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface CreateTripInput {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
}

async function authedFetch(token: string, path: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? 'Request failed');
  }

  return response;
}

export async function createTrip(token: string, input: CreateTripInput): Promise<TripSummary> {
  const response = await authedFetch(token, '/trips', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as { trip: TripSummary };
  return data.trip;
}

export async function addEventToTrip(
  token: string,
  tripId: string,
  event: EventResult
): Promise<TripItemDetail> {
  const response = await authedFetch(token, `/trips/${tripId}/items`, {
    method: 'POST',
    body: JSON.stringify(event),
  });
  const data = (await response.json()) as { item: TripItemDetail };
  return data.item;
}

export async function getTrip(token: string, tripId: string): Promise<TripDetail> {
  const response = await authedFetch(token, `/trips/${tripId}`);
  const data = (await response.json()) as { trip: TripDetail };
  return data.trip;
}

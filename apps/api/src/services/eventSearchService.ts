import type { EventResult } from '@wanderaza/types';
import { eventsQueryService } from '../query-services/eventsQueryService';

export class ValidationError extends Error {}

export interface EventSearchInput {
  city: string;
  startDate: string;
  endDate: string;
  category?: string;
}

export async function searchEvents(input: EventSearchInput): Promise<EventResult[]> {
  const city = input.city.trim();
  if (!city) {
    throw new ValidationError('city is required');
  }

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ValidationError('startDate and endDate must be valid dates');
  }
  if (start > end) {
    throw new ValidationError('startDate must be before endDate');
  }

  const results = await eventsQueryService.searchEvents({
    city,
    startDateTime: `${input.startDate}T00:00:00Z`,
    endDateTime: `${input.endDate}T23:59:59Z`,
  });

  if (!input.category) return results;
  return results.filter((event) => event.categoryInternal === input.category);
}

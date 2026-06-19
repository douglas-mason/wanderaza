import { normalizeCategory, type NewEvent } from '@wanderaza/db';
import type { EventResult } from '@wanderaza/types';
import { eventsRepository } from '../repositories/eventsRepository';
import {
  ticketmasterRepository,
  type TicketmasterEvent,
  type TicketmasterSearchParams,
} from '../repositories/ticketmasterRepository';

function toNewEvent(tmEvent: TicketmasterEvent): NewEvent {
  const venue = tmEvent._embedded?.venues?.[0];
  const priceRange = tmEvent.priceRanges?.[0];
  const categoryRaw = tmEvent.classifications?.[0]?.segment?.name ?? '';

  return {
    externalId: tmEvent.id,
    source: 'ticketmaster',
    name: tmEvent.name,
    categoryRaw,
    categoryInternal: normalizeCategory(categoryRaw),
    venueName: venue?.name,
    lat: venue?.location?.latitude ? Number(venue.location.latitude) : undefined,
    lng: venue?.location?.longitude ? Number(venue.location.longitude) : undefined,
    addressFormatted: venue?.address?.line1,
    street: venue?.address?.line1,
    city: venue?.city?.name,
    state: venue?.state?.stateCode,
    country: venue?.country?.countryCode,
    postalCode: venue?.postalCode,
    startTime: tmEvent.dates?.start?.dateTime ? new Date(tmEvent.dates.start.dateTime) : undefined,
    priceRange: priceRange
      ? `${priceRange.min ?? ''}-${priceRange.max ?? ''} ${priceRange.currency ?? ''}`.trim()
      : undefined,
    url: tmEvent.url,
  };
}

function toEventResult(event: NewEvent): EventResult {
  return {
    externalId: event.externalId,
    source: 'ticketmaster',
    name: event.name,
    categoryInternal: (event.categoryInternal ?? 'attraction') as EventResult['categoryInternal'],
    venueName: event.venueName ?? undefined,
    addressFormatted: event.addressFormatted ?? undefined,
    city: event.city ?? undefined,
    startTime: event.startTime ? event.startTime.toISOString() : undefined,
    priceRange: event.priceRange ?? undefined,
    url: event.url ?? undefined,
    lat: event.lat ?? undefined,
    lng: event.lng ?? undefined,
  };
}

async function searchEvents(params: TicketmasterSearchParams): Promise<EventResult[]> {
  const tmEvents = await ticketmasterRepository.searchEvents(params);
  const newEvents = tmEvents.map(toNewEvent);

  if (newEvents.length > 0) {
    await eventsRepository.upsertMany(newEvents);
  }

  return newEvents.map(toEventResult);
}

export const eventsQueryService = {
  searchEvents,
};

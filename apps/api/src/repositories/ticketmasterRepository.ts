const DISCOVERY_EVENTS_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

export interface TicketmasterVenue {
  name?: string;
  address?: { line1?: string };
  city?: { name?: string };
  state?: { stateCode?: string };
  country?: { countryCode?: string };
  postalCode?: string;
  location?: { latitude?: string; longitude?: string };
}

export interface TicketmasterEvent {
  id: string;
  name: string;
  url?: string;
  classifications?: Array<{ segment?: { name?: string } }>;
  dates?: { start?: { dateTime?: string } };
  priceRanges?: Array<{ min?: number; max?: number; currency?: string }>;
  _embedded?: { venues?: TicketmasterVenue[] };
}

interface TicketmasterEventsResponse {
  _embedded?: { events?: TicketmasterEvent[] };
}

export interface TicketmasterSearchParams {
  city: string;
  startDateTime: string;
  endDateTime: string;
}

async function searchEvents(params: TicketmasterSearchParams): Promise<TicketmasterEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    throw new Error('TICKETMASTER_API_KEY not configured');
  }

  const url = new URL(DISCOVERY_EVENTS_URL);
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('city', params.city);
  url.searchParams.set('startDateTime', params.startDateTime);
  url.searchParams.set('endDateTime', params.endDateTime);
  url.searchParams.set('size', '50');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Ticketmaster request failed with status ${response.status}`);
  }

  const data = (await response.json()) as TicketmasterEventsResponse;
  return data._embedded?.events ?? [];
}

export const ticketmasterRepository = {
  searchEvents,
};

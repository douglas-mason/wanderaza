export type CategoryInternal =
  | 'music'
  | 'sports'
  | 'arts'
  | 'festival'
  | 'comedy'
  | 'restaurant'
  | 'bar'
  | 'cafe'
  | 'attraction'
  | 'shopping'
  | 'hotel';

export type ItemType = 'event' | 'place' | 'hotel';
export type Source = 'ticketmaster' | 'eventbrite' | 'google_places' | 'booking';
export type Visibility = 'public' | 'private' | 'unlisted';

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface SearchParams {
  city: string;
  startDate: string;
  endDate: string;
  category?: CategoryInternal;
}

export interface EventResult {
  externalId: string;
  source: Source;
  name: string;
  categoryInternal: CategoryInternal;
  venueName?: string;
  addressFormatted?: string;
  city?: string;
  startTime?: string;
  priceRange?: string;
  url?: string;
  lat?: number;
  lng?: number;
}

export interface PlaceResult {
  externalId: string;
  source: Source;
  name: string;
  categoryInternal: CategoryInternal;
  addressFormatted?: string;
  city?: string;
  rating?: number;
  lat?: number;
  lng?: number;
}

export interface TripSummary {
  id: string;
  shareSlug: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  visibility: Visibility;
  createdAt: string;
}

export interface TripItemDetail {
  id: string;
  itemType: ItemType;
  externalId?: string;
  source?: Source;
  title: string;
  venue?: string;
  startTime?: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}

export interface TripDetail extends TripSummary {
  lat?: number;
  lng?: number;
  items: TripItemDetail[];
}

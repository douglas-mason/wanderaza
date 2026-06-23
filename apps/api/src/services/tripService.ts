import { randomBytes } from 'node:crypto';
import type { Trip, TripItem } from '@wanderaza/db';
import type { EventResult, TripDetail, TripItemDetail, TripSummary } from '@wanderaza/types';
import { tripsQueryService } from '../query-services/tripsQueryService';

export class ValidationError extends Error {}
export class NotFoundError extends Error {}
export class ForbiddenError extends Error {}

export interface CreateTripInput {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
}

function toTripSummary(trip: Trip): TripSummary {
  return {
    id: trip.id,
    shareSlug: trip.shareSlug,
    title: trip.title,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    visibility: trip.visibility as TripSummary['visibility'],
    createdAt: trip.createdAt.toISOString(),
  };
}

function toTripItemDetail(item: TripItem): TripItemDetail {
  return {
    id: item.id,
    itemType: item.itemType as TripItemDetail['itemType'],
    externalId: item.externalId ?? undefined,
    source: (item.source as TripItemDetail['source']) ?? undefined,
    title: item.title,
    venue: item.venue ?? undefined,
    startTime: item.startTime ? item.startTime.toISOString() : undefined,
    sortOrder: item.sortOrder,
    metadata: (item.metadata as Record<string, unknown>) ?? undefined,
  };
}

export async function createTrip(userId: string, input: CreateTripInput): Promise<TripSummary> {
  const title = input.title.trim();
  const destination = input.destination.trim();
  if (!title || !destination) {
    throw new ValidationError('title and destination are required');
  }

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new ValidationError('startDate and endDate must form a valid range');
  }

  const trip = await tripsQueryService.createTrip({
    userId,
    title,
    destination,
    startDate: input.startDate,
    endDate: input.endDate,
    shareSlug: randomBytes(6).toString('base64url'),
  });

  return toTripSummary(trip);
}

async function requireOwnedTrip(userId: string, tripId: string): Promise<Trip> {
  const trip = await tripsQueryService.findTripById(tripId);
  if (!trip) throw new NotFoundError('Trip not found');
  if (trip.userId !== userId) throw new ForbiddenError('Trip does not belong to this user');
  return trip;
}

export async function addEventToTrip(
  userId: string,
  tripId: string,
  event: EventResult
): Promise<TripItemDetail> {
  await requireOwnedTrip(userId, tripId);

  const item = await tripsQueryService.addItemToTrip({
    tripId,
    itemType: 'event',
    externalId: event.externalId,
    source: event.source,
    title: event.name,
    venue: event.venueName,
    startTime: event.startTime ? new Date(event.startTime) : undefined,
    metadata: {
      priceRange: event.priceRange,
      url: event.url,
      addressFormatted: event.addressFormatted,
    },
  });

  return toTripItemDetail(item);
}

export async function getTrip(userId: string, tripId: string): Promise<TripDetail> {
  const trip = await requireOwnedTrip(userId, tripId);
  const items = await tripsQueryService.getTripItems(tripId);

  return {
    ...toTripSummary(trip),
    lat: trip.lat ?? undefined,
    lng: trip.lng ?? undefined,
    items: items.map(toTripItemDetail),
  };
}

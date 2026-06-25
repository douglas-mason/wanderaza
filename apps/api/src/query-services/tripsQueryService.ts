import type { NewTrip, NewTripItem } from '@wanderaza/db';
import { tripItemsRepository } from '../repositories/tripItemsRepository';
import { tripsRepository } from '../repositories/tripsRepository';

async function createTrip(input: NewTrip) {
  return tripsRepository.insertTrip(input);
}

async function findTripById(id: string) {
  return tripsRepository.findById(id);
}

async function findTripByShareSlug(shareSlug: string) {
  return tripsRepository.findByShareSlug(shareSlug);
}

async function findTripsByUserId(userId: string) {
  return tripsRepository.findByUserId(userId);
}

async function addItemToTrip(input: NewTripItem) {
  return tripItemsRepository.insertItem(input);
}

async function getTripItems(tripId: string) {
  return tripItemsRepository.findByTripId(tripId);
}

async function removeItemFromTrip(itemId: string, tripId: string) {
  return tripItemsRepository.deleteById(itemId, tripId);
}

async function deleteTrip(id: string) {
  return tripsRepository.deleteById(id);
}

export const tripsQueryService = {
  createTrip,
  findTripById,
  findTripByShareSlug,
  findTripsByUserId,
  addItemToTrip,
  getTripItems,
  removeItemFromTrip,
  deleteTrip,
};

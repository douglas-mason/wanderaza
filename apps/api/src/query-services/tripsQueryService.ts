import type { NewTrip, NewTripItem } from '@wanderaza/db';
import { tripItemsRepository } from '../repositories/tripItemsRepository';
import { tripsRepository } from '../repositories/tripsRepository';

async function createTrip(input: NewTrip) {
  return tripsRepository.insertTrip(input);
}

async function findTripById(id: string) {
  return tripsRepository.findById(id);
}

async function addItemToTrip(input: NewTripItem) {
  return tripItemsRepository.insertItem(input);
}

async function getTripItems(tripId: string) {
  return tripItemsRepository.findByTripId(tripId);
}

export const tripsQueryService = {
  createTrip,
  findTripById,
  addItemToTrip,
  getTripItems,
};

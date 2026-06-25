import { db, tripItems, type NewTripItem, type TripItem } from '@wanderaza/db';
import { and, asc, eq } from 'drizzle-orm';

async function insertItem(input: NewTripItem): Promise<TripItem> {
  const [item] = await db.insert(tripItems).values(input).returning();
  return item;
}

async function findByTripId(tripId: string): Promise<TripItem[]> {
  return db
    .select()
    .from(tripItems)
    .where(eq(tripItems.tripId, tripId))
    .orderBy(asc(tripItems.startTime));
}

async function deleteById(itemId: string, tripId: string): Promise<boolean> {
  const deleted = await db
    .delete(tripItems)
    .where(and(eq(tripItems.id, itemId), eq(tripItems.tripId, tripId)))
    .returning();
  return deleted.length > 0;
}

export const tripItemsRepository = {
  insertItem,
  findByTripId,
  deleteById,
};

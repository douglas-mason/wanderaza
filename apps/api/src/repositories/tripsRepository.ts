import { db, trips, type NewTrip, type Trip } from '@wanderaza/db';
import { eq } from 'drizzle-orm';

async function insertTrip(input: NewTrip): Promise<Trip> {
  const [trip] = await db.insert(trips).values(input).returning();
  return trip;
}

async function findById(id: string): Promise<Trip | undefined> {
  const [trip] = await db.select().from(trips).where(eq(trips.id, id));
  return trip;
}

async function findByShareSlug(shareSlug: string): Promise<Trip | undefined> {
  const [trip] = await db.select().from(trips).where(eq(trips.shareSlug, shareSlug));
  return trip;
}

export const tripsRepository = {
  insertTrip,
  findById,
  findByShareSlug,
};

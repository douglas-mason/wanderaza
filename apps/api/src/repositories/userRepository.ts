import { db, users } from '@wanderaza/db';
import { eq } from 'drizzle-orm';

async function upsertByClerkId(input: {
  clerkId: string;
  email: string;
  displayName: string | null;
}) {
  await db
    .insert(users)
    .values(input)
    .onConflictDoUpdate({
      target: users.clerkId,
      set: { email: input.email, displayName: input.displayName },
    });
}

async function deleteByClerkId(clerkId: string) {
  await db.delete(users).where(eq(users.clerkId, clerkId));
}

export const userRepository = {
  upsertByClerkId,
  deleteByClerkId,
};

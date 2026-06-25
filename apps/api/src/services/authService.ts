import { verifyToken } from '@clerk/backend';
import { userQueryService } from '../query-services/userQueryService';

export class UnauthorizedError extends Error {}

export async function getAuthenticatedUserId(authHeader: string | undefined): Promise<string> {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;
  if (!token) {
    throw new UnauthorizedError('Missing bearer token');
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY not configured');
  }

  let clerkUserId: string;
  try {
    const verified = await verifyToken(token, { secretKey });
    clerkUserId = verified.sub;
  } catch {
    throw new UnauthorizedError('Invalid session token');
  }

  const user = await userQueryService.findUserByClerkId(clerkUserId);
  if (!user) {
    throw new UnauthorizedError('Account not found — try signing in again');
  }

  return user.id;
}

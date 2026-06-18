import type { FastifyInstance } from 'fastify';
import { Webhook } from 'svix';
import { db, users } from '@wanderaza/db';

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserEventData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface ClerkWebhookEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted' | string;
  data: ClerkUserEventData;
}

export async function webhookRoutes(server: FastifyInstance) {
  // Override JSON parser in this scope to get raw string body for svix verification
  server.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (_req, body: string, done) => done(null, body)
  );

  server.post('/webhooks/clerk', async (request, reply) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      server.log.error('CLERK_WEBHOOK_SECRET not configured');
      return reply.status(500).send({ error: 'Webhook not configured' });
    }

    const svixId = request.headers['svix-id'] as string;
    const svixTimestamp = request.headers['svix-timestamp'] as string;
    const svixSignature = request.headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      return reply.status(400).send({ error: 'Missing svix headers' });
    }

    const wh = new Webhook(secret);
    let evt: ClerkWebhookEvent;

    try {
      evt = wh.verify(request.body as string, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;
    } catch {
      return reply.status(400).send({ error: 'Invalid webhook signature' });
    }

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const { id: clerkId, email_addresses, primary_email_address_id, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses.find(e => e.id === primary_email_address_id);

      if (primaryEmail) {
        const nameParts = [first_name, last_name].filter((p): p is string => Boolean(p));
        const displayName = nameParts.length > 0 ? nameParts.join(' ') : null;

        await db
          .insert(users)
          .values({ clerkId, email: primaryEmail.email_address, displayName })
          .onConflictDoUpdate({
            target: users.clerkId,
            set: { email: primaryEmail.email_address, displayName },
          });

        server.log.info({ clerkId, event: evt.type }, 'User upserted');
      }
    }

    return reply.send({ received: true });
  });
}

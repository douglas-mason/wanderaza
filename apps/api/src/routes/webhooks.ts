import type { FastifyInstance } from 'fastify';
import { Webhook } from 'svix';
import { handleUserCreatedOrUpdated, handleUserDeleted } from '../services/userService';
import type { ClerkWebhookEvent } from '../types/clerk';

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
      await handleUserCreatedOrUpdated(evt.data);
      server.log.info({ clerkId: evt.data.id, event: evt.type }, 'User upserted');
    } else if (evt.type === 'user.deleted') {
      await handleUserDeleted(evt.data);
      server.log.info({ clerkId: evt.data.id }, 'User deleted');
    }

    return reply.send({ received: true });
  });
}

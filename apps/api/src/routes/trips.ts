import type { EventResult } from '@wanderaza/types';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { getAuthenticatedUserId, UnauthorizedError } from '../services/authService';
import {
  addEventToTrip,
  createTrip,
  ForbiddenError,
  getPublicTripByShareSlug,
  getTrip,
  NotFoundError,
  ValidationError,
} from '../services/tripService';

interface CreateTripBody {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
}

export async function tripRoutes(server: FastifyInstance) {
  server.get<{ Params: { shareSlug: string } }>(
    '/trips/shared/:shareSlug',
    async (request, reply) => {
      try {
        const trip = await getPublicTripByShareSlug(request.params.shareSlug);
        return reply.send({ trip });
      } catch (err) {
        return handleError(err, reply);
      }
    }
  );

  server.post<{ Body: CreateTripBody }>('/trips', async (request, reply) => {
    try {
      const userId = await getAuthenticatedUserId(request.headers.authorization);
      const trip = await createTrip(userId, request.body);
      return reply.status(201).send({ trip });
    } catch (err) {
      return handleError(err, reply);
    }
  });

  server.get<{ Params: { id: string } }>('/trips/:id', async (request, reply) => {
    try {
      const userId = await getAuthenticatedUserId(request.headers.authorization);
      const trip = await getTrip(userId, request.params.id);
      return reply.send({ trip });
    } catch (err) {
      return handleError(err, reply);
    }
  });

  server.post<{ Params: { id: string }; Body: EventResult }>(
    '/trips/:id/items',
    async (request, reply) => {
      try {
        const userId = await getAuthenticatedUserId(request.headers.authorization);
        const item = await addEventToTrip(userId, request.params.id, request.body);
        return reply.status(201).send({ item });
      } catch (err) {
        return handleError(err, reply);
      }
    }
  );

  function handleError(err: unknown, reply: FastifyReply) {
    if (err instanceof UnauthorizedError) return reply.status(401).send({ error: err.message });
    if (err instanceof ForbiddenError) return reply.status(403).send({ error: err.message });
    if (err instanceof NotFoundError) return reply.status(404).send({ error: err.message });
    if (err instanceof ValidationError) return reply.status(400).send({ error: err.message });
    server.log.error(err);
    return reply.status(500).send({ error: 'Something went wrong' });
  }
}

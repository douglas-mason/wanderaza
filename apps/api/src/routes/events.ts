import type { FastifyInstance } from 'fastify';
import { searchEvents, ValidationError } from '../services/eventSearchService';

interface EventSearchQuery {
  city?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

export async function eventRoutes(server: FastifyInstance) {
  server.get<{ Querystring: EventSearchQuery }>('/events/search', async (request, reply) => {
    const { city, startDate, endDate, category } = request.query;

    if (!city || !startDate || !endDate) {
      return reply.status(400).send({ error: 'city, startDate, and endDate are required' });
    }

    try {
      const events = await searchEvents({ city, startDate, endDate, category });
      return reply.send({ events });
    } catch (err) {
      if (err instanceof ValidationError) {
        return reply.status(400).send({ error: err.message });
      }
      server.log.error(err);
      return reply.status(502).send({ error: 'Failed to fetch events from Ticketmaster' });
    }
  });
}

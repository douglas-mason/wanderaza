import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { webhookRoutes } from './routes/webhooks';
import { eventRoutes } from './routes/events';

const server = Fastify({ logger: true });

server.register(cors, {
  origin: process.env.WEB_URL ?? 'http://localhost:3000',
});

server.get('/health', async () => ({ ok: true, version: '0.0.1' }));

server.register(webhookRoutes);
server.register(eventRoutes);

const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3001);
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

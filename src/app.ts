import './env';
import 'reflect-metadata';

import { fastify as Fastify, FastifyInstance, FastifyServerOptions } from 'fastify';
import { valuationRoutes } from './routes/valuation';

import caching from '@fastify/caching';
import databaseConnection from 'typeorm-fastify-plugin';
import { VehicleValuation } from './models/vehicle-valuation';
import { ProviderLogs } from './models/provider-logs';

export let fastifyInstance: FastifyInstance;

export const app = (opts?: FastifyServerOptions) => {
  const fastify = Fastify(opts);
  fastify
    .register(databaseConnection, {
      type: 'sqlite',
      database: process.env.DATABASE_PATH!,
      synchronize: process.env.SYNC_DATABASE === 'true',
      logging: false,
      entities: [VehicleValuation, ProviderLogs],
      migrations: [],
      subscribers: [],
    })
    .ready();

  fastify.get('/', async () => {
    return { message: 'Motorway vehicle valuations api' };
  });

  // Register fastify plugins
  fastify.register(caching);

  fastifyInstance = fastify;

  // Instantiate api routes
  valuationRoutes(fastify);

  return fastify;
};

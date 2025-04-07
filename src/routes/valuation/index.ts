import { FastifyInstance } from 'fastify';
import { VehicleValuationRequest } from './types/vehicle-valuation-request';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { cacheValuation, checkCachedValuation } from '@app/utils/cache';
import { VehicleValuationService } from '@app/services/vehicle-valuation';

/**
 * Initialise vehicle valuation service singleton to ensure single service instance.
 */
export const valuationSvc = new VehicleValuationService();

export function valuationRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const valuationRepository = fastify.orm.getRepository(VehicleValuation);
    const { vrm } = request.params;

    if (vrm === null || vrm === '' || vrm.length > 7) {
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    const result = await valuationRepository.findOneBy({ vrm: vrm });

    if (result == null) {
      return reply.code(404).send({
        message: `Valuation for VRM ${vrm} not found`,
        statusCode: 404,
      });
    }

    return result;
  });

  fastify.put<{
    Body: VehicleValuationRequest;
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const valuationRepository = fastify.orm.getRepository(VehicleValuation);
    const { vrm } = request.params;
    const { mileage } = request.body;
    const valuationCacheKey = `${vrm}-${mileage}`;

    const cachedValue = await checkCachedValuation(valuationCacheKey);
    if (cachedValue) {
      return cachedValue;
    }

    if (vrm.length > 7) {
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    if (mileage === null || mileage <= 0) {
      return reply.code(400).send({
        message: 'mileage must be a positive number',
        statusCode: 400,
      });
    }

    const valuation = await valuationSvc.getValuation({ vrm, mileage });

    if (valuation === null) {
      return reply.code(503).send({
        message: 'Service Unavailable',
        statusCode: 503,
      });
    }

    // Save to DB.
    await valuationRepository.insert(valuation).catch((err) => {
      if (err.code !== 'SQLITE_CONSTRAINT') {
        throw err;
      }
    });

    cacheValuation(valuationCacheKey, valuation);
    fastify.log.info('Valuation created: ', valuation);

    return valuation;
  });
}

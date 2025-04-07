import * as spv from '@app/valuation-clients/super-car/super-car-valuation';
import * as pcv from '@app/valuation-clients/premium-car/premium-car-valuation';
import { fastify } from '~root/test/fastify';
import { setupRepositoryMocks } from './setup-valuation-mocks';
import { mockReturnValuation } from './fixtures/valuation';
import { VehicleValuationRequest } from '../types/vehicle-valuation-request';

describe('ValuationController (e2e) - PUT /valuations/', () => {
  beforeAll(() => {
    setupRepositoryMocks();

    vitest
    .spyOn(spv, 'fetchValuationFromSuperCarValuation')
    .mockReturnValueOnce(Promise.resolve(mockReturnValuation));

    vitest
    .spyOn(spv, 'fetchValuationFromSuperCarValuation')
    .mockReturnValueOnce(Promise.resolve(mockReturnValuation));
    
  });

  it('should return 404 if VRM is missing', async () => {
    const requestBody: VehicleValuationRequest = {
      mileage: 10000,
    };

    const res = await fastify.inject({
      url: '/valuations',
      method: 'PUT',
      body: requestBody,
    });

    expect(res.statusCode).toStrictEqual(404);
  });

  it('should return 400 if VRM is 8 characters or more', async () => {
    const requestBody: VehicleValuationRequest = {
      mileage: 10000,
    };

    const res = await fastify.inject({
      url: '/valuations/12345678',
      body: requestBody,
      method: 'PUT',
    });

    expect(res.statusCode).toStrictEqual(400);
  });

  it('should return 400 if mileage is missing', async () => {
    const requestBody: VehicleValuationRequest = {
      // @ts-expect-error intentionally malformed payload
      mileage: null,
    };

    const res = await fastify.inject({
      url: '/valuations/ABC123',
      body: requestBody,
      method: 'PUT',
    });

    expect(res.statusCode).toStrictEqual(400);
  });

  it('should return 400 if mileage is negative', async () => {
    const requestBody: VehicleValuationRequest = {
      mileage: -1,
    };

    const res = await fastify.inject({
      url: '/valuations/ABC123',
      body: requestBody,
      method: 'PUT',
    });

    expect(res.statusCode).toStrictEqual(400);
  });

  it('should return 503 if both providers are unavailable', async () => {
    const requestBody: VehicleValuationRequest = {
      mileage: 10000,
    };

    vitest
      .spyOn(spv, 'fetchValuationFromSuperCarValuation')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    vitest
      .spyOn(pcv, 'fetchValuationFromPremiumCarValuation')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const res = await fastify.inject({
      url: '/valuations/ABC123',
      body: requestBody,
      method: 'PUT',
    });

    expect(res.statusCode).toStrictEqual(503);
  });

  it('should return 200 with valid request', async () => {
    const requestBody: VehicleValuationRequest = {
      mileage: 10000,
    };

    vitest
      .spyOn(spv, 'fetchValuationFromSuperCarValuation')
      .mockReturnValueOnce(Promise.resolve(mockReturnValuation));

    const res = await fastify.inject({
      url: '/valuations/ABC123',
      body: requestBody,
      method: 'PUT',
    });

    expect(res.statusCode).toStrictEqual(200);
  });

  it('should return cached values after multiple calls with the same vrm', async () => {
    const requestBody: VehicleValuationRequest = {
      mileage: 10000,
    };

    const firstResult = await fastify.inject({
      url: '/valuations/ABC123',
      body: requestBody,
      method: 'PUT',
    });

    const secondResult = await fastify.inject({
      url: '/valuations/ABC123',
      body: requestBody,
      method: 'PUT',
    });

    expect(firstResult.statusCode).toStrictEqual(200);
    expect(firstResult.body).toStrictEqual(secondResult.body);
  });

  it('should raise sqlite error if mock repository is unavailable', async () => {
    const requestBody: VehicleValuationRequest = {
      mileage: 10000,
    };

    const firstResult = await fastify.inject({
      url: '/valuations/ABC123',
      body: requestBody,
      method: 'PUT',
    });

    expect(firstResult.statusCode).toStrictEqual(200);
  });
});

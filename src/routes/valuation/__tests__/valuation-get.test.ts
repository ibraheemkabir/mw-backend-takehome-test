import { fastify } from '~root/test/fastify';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { MockInstance } from 'vitest';
import { setupRepositoryMocks } from './setup-valuation-mocks';

describe('ValuationController (e2e) - GET /valuations/:vrm', () => {
  let mockedGetRepository: MockInstance;

  beforeAll(() => {
    mockedGetRepository = setupRepositoryMocks();
  });

  it('should return 400 if VRM param is missing', async () => {
    const res = await fastify.inject({
      url: '/valuations/',
      method: 'GET',
    });

    expect(res.statusCode).toStrictEqual(400);
  });

  it('should return 400 if VRM param is 8 characters or more', async () => {
    const res = await fastify.inject({
      url: '/valuations/1000000000',
      method: 'GET',
    });

    expect(res.statusCode).toStrictEqual(400);
  });

  it('should return 404 if vrm valuation is not found', async () => {
    const mockFindOne = vitest.fn(() => {
      return {
        findOneBy: (): Promise<VehicleValuation[] | null> =>
          Promise.resolve(null),
      };
    });

    mockedGetRepository.mockImplementationOnce(mockFindOne);

    const res = await fastify.inject({
      url: '/valuations/ABC123',
      method: 'GET',
    });

    expect(res.statusCode).toStrictEqual(404);
  });

  it('should return 200 if valid param and valuation returned', async () => {
    const res = await fastify.inject({
      url: '/valuations/ABC123',
      method: 'GET',
    });

    expect(res.statusCode).toStrictEqual(200);
  });
});

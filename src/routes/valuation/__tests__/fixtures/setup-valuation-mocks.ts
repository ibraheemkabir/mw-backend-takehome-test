import { ObjectLiteral, Repository } from 'typeorm';
import { fastify } from '~root/test/fastify';
import { mockReturnValuation } from '../fixtures/valuation';
import { MockInstance } from 'vitest';

/**
 * Sets up repostory mocks with mocked methods for get repository.
 * @returns {MockInstance}
 */
export function setupRepositoryMocks(): MockInstance {
  const mockedGetRepository = vitest.spyOn(fastify.orm, 'getRepository');

  mockedGetRepository.mockImplementation(() => {
    return {
      insert: () =>
        Promise.resolve(vitest.fn().mockReturnValue(mockReturnValuation)),
      findOneBy: () =>
        Promise.resolve(vitest.fn().mockReturnValue([mockReturnValuation])),
    } as unknown as Repository<ObjectLiteral>;
  });

  return mockedGetRepository;
}

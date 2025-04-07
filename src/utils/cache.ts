import { fastifyInstance } from '@app/app';
import { VehicleValuation } from '@app/models/vehicle-valuation';

/**
 * Checks cache for valuation details.
 * @param key
 * @returns
 */
export async function checkCachedValuation(key: string) {
  let value;

  await fastifyInstance.cache.get(key, (_, result) => {
    value = result?.item;
  });

  return value;
}

/**
 * Sets valuation details in cache.
 * @param key
 * @param value
 * @returns
 */
export async function cacheValuation(
  key: string,
  value: VehicleValuation,
  callback = () => {},
) {
  await fastifyInstance.cache.set(key, value, 10000, callback);
  return;
}

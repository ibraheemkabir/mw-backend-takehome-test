import { ProviderLogs } from '@app/models/provider-logs';
import { fastifyInstance as fastify } from '@app/app';

/**
 * Logs valuation request details and saves in provider logs table.
 * @param {ProviderLogs} options
 * @returns {ProviderLogs}
 */
export async function requestLogger(options: ProviderLogs) {
  try {
    const providerLogsRepository = fastify.orm.getRepository(ProviderLogs);
    const savedLogs = await providerLogsRepository.save(options);
    return savedLogs;
  } catch (error) {
    // fail logging silently
    return;
  }
}

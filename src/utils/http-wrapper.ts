import axios, { isAxiosError } from 'axios';
import { ProviderLogs } from '@app/models/provider-logs';
import { ValuationProviders } from '@app/valuation-clients/types';
import { requestLogger as logProviderRequest } from './request-logger';

/**
 * An http request wrapper with time logging request properties and response times.
 * @param requestUrl
 * @param vrm
 * @param provider
 * @returns
 */
export async function httpGetWrapper<T>(
  requestUrl: string,
  vrm: string,
  provider: ValuationProviders,
) {
  const startDateTime = new Date();
  const startTime = startDateTime.getTime();

  let endTime = startTime;
  let statusCode;
  let errorCode;
  let errorMessage;

  try {
    const response = await axios.get<T>(requestUrl);

    endTime = new Date().getTime();
    statusCode = response.status;

    return response;
  } catch (error) {
    endTime = new Date().getTime();

    if (isAxiosError(error)) {
      errorCode = error?.response?.status;
      errorMessage = error?.response?.data;
    }
    throw error;
  } finally {
    const duration = endTime - startTime;
    const requestLog = new ProviderLogs();
    requestLog.responseCode = Number(statusCode);
    requestLog.errorMessage = errorMessage;
    requestLog.errorCode = Number(errorCode);
    requestLog.provider = provider;
    requestLog.requestDatetime = startDateTime;
    requestLog.requestDuration = `${startTime.toString()}ms`;
    requestLog.vrm = vrm;

    await logProviderRequest(requestLog);
    console.log(`Request duration is ${duration}ms`);
  }
}

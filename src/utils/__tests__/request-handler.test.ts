import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ValuationProviders } from '@app/valuation-clients/types';
import { httpGetWrapper } from '../http-wrapper';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { MockInstance } from 'vitest';
import { setupRepositoryMocks } from '@app/routes/valuation/__tests__/setup-valuation-mocks';
import { mockedResponse } from './fixtures';
import { ProviderLogs } from '@app/models/provider-logs';

describe('Test request handler function', () => {
  let mockedGetRepository: MockInstance;
  const requestUrl = 'https://www.test.com';

  beforeAll(() => {
    mockedGetRepository = setupRepositoryMocks();

    vitest.spyOn(axios, 'get').mockResolvedValueOnce(
      Promise.resolve({
        status: 200,
        data: mockedResponse,
      }),
    );
  });

  it('should call axios request and log response', async () => {
    const vrm = 'AA69BCF';
    const provider = ValuationProviders.PREMIUM_CAR;

    const mockRepositorySave = vitest.fn(() => {
      return {
        save: (): Promise<VehicleValuation[] | null> => Promise.resolve(null),
      };
    });

    mockedGetRepository.mockImplementationOnce(mockRepositorySave);
    const response = await httpGetWrapper(requestUrl, vrm, provider);

    expect(mockedGetRepository).toHaveBeenCalledWith(ProviderLogs);
    expect(mockRepositorySave).toHaveBeenCalled();
    expect(response.status).toEqual(200);
  });

  it('should raise request error and log response', async () => {
    const vrm = 'AA69BCF';
    const provider = ValuationProviders.PREMIUM_CAR;

    vitest.spyOn(axios, 'get').mockImplementationOnce(() => {
      throw new AxiosError('error occured', '400', undefined, undefined, {
        status: 400,
        data: 'Error occured',
        statusText: 'Not found',
        headers: {},
        config: {} as unknown as InternalAxiosRequestConfig,
      });
    });

    expect(mockedGetRepository).toHaveBeenCalledWith(ProviderLogs);
    expect(async () =>
      httpGetWrapper(requestUrl, vrm, provider),
    ).rejects.toThrowError();
  });
});

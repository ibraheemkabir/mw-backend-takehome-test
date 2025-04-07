import axios from 'axios';
import { mockSuperCarValuationResponse } from './fixtures';
import { fetchValuationFromSuperCarValuation } from '../super-car-valuation';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { MockInstance } from 'vitest';
import { setupRepositoryMocks } from '@app/routes/valuation/__tests__/setup-valuation-mocks';
import { ProviderLogs } from '@app/models/provider-logs';
import { ValuationProviders } from '@app/valuation-clients/types';

describe('Test fetchValuationFromSuperCarValuation', () => {
  let mockedGetRepository: MockInstance;

  beforeAll(() => {
    mockedGetRepository = setupRepositoryMocks();
  });

  beforeEach(() => {
    vitest.spyOn(axios, 'get').mockResolvedValueOnce(
      Promise.resolve({
        status: 200,
        data: mockSuperCarValuationResponse,
      }),
    );
  });

  it('should return valuation on successful request', async () => {
    const vrm = 'AA69BCF';
    const mileage = 1000;

    const expectedValuation = new VehicleValuation();
    expectedValuation.highestValue =
      mockSuperCarValuationResponse.valuation.upperValue;
    expectedValuation.lowestValue =
      mockSuperCarValuationResponse.valuation.lowerValue;
    expectedValuation.provider = ValuationProviders.SUPER_CAR;
    expectedValuation.vrm = vrm;

    const res = await fetchValuationFromSuperCarValuation(vrm, mileage);
    expect(res).toStrictEqual(expectedValuation);
  });

  it('should return null on failed provided request', async () => {
    const vrm = 'AA69BCF';
    const mileage = 1000;
    vitest.spyOn(axios, 'get').mockResolvedValueOnce(() => {
      throw new Error('Provider error');
    });

    const res = await fetchValuationFromSuperCarValuation(vrm, mileage);

    expect(res.lowestValue).toStrictEqual(undefined);
    expect(res.highestValue).toStrictEqual(undefined);
  });

  it('should save request details in provider logs on failed valuation request', async () => {
    vitest.spyOn(axios, 'get').mockResolvedValueOnce(() => {
      throw new Error('Provider error');
    });

    const mockRepositorySave = vitest.fn(() => {
      return {
        save: (): Promise<VehicleValuation[] | null> => Promise.resolve(null),
      };
    });
    mockedGetRepository.mockImplementationOnce(mockRepositorySave);

    const vrm = 'AA69BCF';
    const mileage = 1000;

    await fetchValuationFromSuperCarValuation(vrm, mileage);

    expect(mockedGetRepository).toHaveBeenCalledWith(ProviderLogs);
    expect(mockRepositorySave).toHaveBeenCalled();
  });

  it('should save request details in provider logs on successful valuation request', async () => {
    const vrm = 'AA69BCF';
    const mileage = 1000;

    const expectedValuation = new VehicleValuation();
    expectedValuation.highestValue = 12750;
    expectedValuation.lowestValue = 11500;
    expectedValuation.provider = 'PREMIUM_CAR';
    expectedValuation.vrm = vrm;

    const mockRepositorySave = vitest.fn(() => {
      return {
        save: (): Promise<VehicleValuation[] | null> => Promise.resolve(null),
      };
    });
    mockedGetRepository.mockImplementationOnce(mockRepositorySave);

    await fetchValuationFromSuperCarValuation(vrm, mileage);

    expect(mockedGetRepository).toHaveBeenCalledWith(ProviderLogs);
    expect(mockRepositorySave).toHaveBeenCalled();
  });
});

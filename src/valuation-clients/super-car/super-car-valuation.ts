import { VehicleValuation } from '../../models/vehicle-valuation';
import { ValuationProviders } from '../types';
import { httpGetWrapper } from '@app/utils/http-wrapper';
import { SuperCarValuationResponse } from './types/super-car-valuation-response';

/**
 * Fetches car valuation by vrm and mileage from super car provider.
 * @param vrm
 * @param mileage
 * @returns {VehicleValuation} vehicle valuation information
 */
export async function fetchValuationFromSuperCarValuation(
  vrm: string,
  mileage: number,
): Promise<VehicleValuation> {
  const response = await httpGetWrapper<SuperCarValuationResponse>(
    `https://run.mocky.io/v3/9245229e-5c57-44e1-964b-36c7fb29168b/${vrm}?mileage=${mileage}`,
    vrm,
    ValuationProviders.SUPER_CAR,
  );
  const valuation = new VehicleValuation();

  if (response?.data) {
    valuation.lowestValue = response.data.valuation.lowerValue;
    valuation.highestValue = response.data.valuation.upperValue;
  }
  valuation.vrm = vrm;
  valuation.provider = ValuationProviders.SUPER_CAR;

  return valuation;
}

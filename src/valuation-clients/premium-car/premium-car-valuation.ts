import convert from 'xml-js';
import { VehicleValuation } from '../../models/vehicle-valuation';
import { PremiumCarValuationResponse } from './types/premium-car-valuation-response';
import { ValuationProviders } from '../types';
import { httpGetWrapper } from '@app/utils/http-wrapper';

/**
 * Fetches car valuation by vrm from premium car provider.
 * @param vrm
 * @param mileage
 * @returns {VehicleValuation}
 */
export async function fetchValuationFromPremiumCarValuation(
  vrm: string,
  mileage: number,
): Promise<VehicleValuation> {
  const response = await httpGetWrapper<string>(
    `https://run.mocky.io/v3/0dfda26a-3a5a-43e5-b68c-51f148eda473/valueCar?vrm=${vrm}&mileage=${mileage}`,
    vrm,
    ValuationProviders.PREMIUM_CAR,
  );

  const valuation = new VehicleValuation();

  if (response?.data) {
    //parse xml response to json
    const parsedResponse: PremiumCarValuationResponse = JSON.parse(
      convert.xml2json(response?.data, { compact: true, spaces: 4 }),
    ).Response;

    valuation.vrm = vrm;
    valuation.lowestValue = Number(
      parsedResponse.ValuationPrivateSaleMinimum._text,
    );
    valuation.highestValue = Number(
      parsedResponse.ValuationPrivateSaleMaximum._text,
    );
    valuation.provider = ValuationProviders.PREMIUM_CAR;
  }

  return valuation;
}

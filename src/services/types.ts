import { VehicleValuation } from '@app/models/vehicle-valuation';

export interface ValuationClientParams {
  vrm: string;
  mileage: number;
}

export interface ValuationClientLogParams {
  requestDatetime: string;
  requestDuration: string;
  requestUrl: string;
  requestCode: number;
  errorCode: number;
  provider: string;
  errorMessage: string;
  startDateTime: string;
  startTime: number;
  vrm: string;
}

export type ValuationClient = (
  vrm: string,
  mileage: number,
) => Promise<VehicleValuation>;

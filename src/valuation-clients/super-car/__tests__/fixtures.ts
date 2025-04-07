import { SuperCarValuationResponse } from '../types/super-car-valuation-response';

export const mockSuperCarValuationResponse: SuperCarValuationResponse = {
  vin: 'AA69BCF',
  registrationDate: '2012-06-14T00:00:00.0000000',
  plate: {
    year: 2012,
    month: 4,
  },
  valuation: {
    lowerValue: 22350,
    upperValue: 24750,
  },
};

import { VehicleValuation } from '@app/models/vehicle-valuation';
import { ValuationClient, ValuationClientParams } from '@app/services/types';
import { FailOverService } from '@app/services/failover-service';
import { fetchValuationFromPremiumCarValuation } from '@app/valuation-clients/premium-car/premium-car-valuation';
import { fetchValuationFromSuperCarValuation } from '@app/valuation-clients/super-car/super-car-valuation';

const FAILURE_THRESHOLD_PERCENTAGE = 50;
const MINIMUM_FAILURE_COUNT = 5;
const RESET_TIMEOUT = 300000;

/**
 * Vehicle valuation service fetches vehicla valuation with provision
 * for primary and fallback requests.
 */
export class VehicleValuationService {
  private fallbackHandler: FailOverService;

  constructor() {
    this.fallbackHandler = new FailOverService({
      minimumFailurePercentage: FAILURE_THRESHOLD_PERCENTAGE,
      minimumFailureCount: MINIMUM_FAILURE_COUNT,
      resetTimeout: RESET_TIMEOUT,
    });
  }

  /**
   * get valuation method
   * @param params
   * @returns
   */
  async getValuation(
    params: ValuationClientParams,
  ): Promise<VehicleValuation | null> {
    const primaryClient = this.registerValuationClient(
      fetchValuationFromSuperCarValuation,
      params,
    );
    const secondaryClient = this.registerValuationClient(
      fetchValuationFromPremiumCarValuation,
      params,
    );

    const valuation = this.fallbackHandler.execute<VehicleValuation | null>(
      primaryClient,
      secondaryClient,
    );

    return valuation;
  }

  /**
   *
   * @param client
   * @param params
   * @returns
   */
  registerValuationClient(
    client: ValuationClient,
    params: ValuationClientParams,
  ) {
    return function () {
      return client(params.vrm, params.mileage);
    };
  }
}

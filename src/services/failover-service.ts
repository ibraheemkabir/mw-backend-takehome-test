import { ExecutingFunction, IFallbackHandler } from '../utils/types';

/**
 * Fallbak handler class implementing circuit breaker strategy for handling fallback
 * function execution with application when threshold parameters are not
 * met.
 */
export class FailOverService {
  private failurePercentageThreshold: number;
  private minimumFailureCount: number = 0;
  private state: string;
  private lastFailureTime: number = 0;
  private resetTimeout: number;
  private failures: number = 0;
  private successfulRequests: number = 0;

  /**
   * Fallback handler constructor.
   * @param options {IFallbackHandler}
   */
  constructor(options: IFallbackHandler) {
    this.failurePercentageThreshold = options.minimumFailurePercentage;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
    this.minimumFailureCount = options.minimumFailureCount;
    this.resetTimeout = options.resetTimeout;
  }

  /**
   * Executes main function if circuit is closed and triggers fallback otherwise.
   * @param fn
   * @param fallbackFn
   * @returns {T} generic return type provide on initialise.
   */
  async execute<T>(
    fn: ExecutingFunction<T>,
    fallbackFn: ExecutingFunction<T>,
  ): Promise<T | null> {
    if (this.state === 'OPEN') {
      const isPastResetTime =
        Date.now() - this.lastFailureTime >= this.resetTimeout;

      if (isPastResetTime) {
        this.state = 'HALF_OPEN';
        this.failures = 0;
        this.successfulRequests = 0;
        this.lastFailureTime = 0;
      } else {
        return this.executeFallback<T>(fallbackFn);
      }
    }

    try {
      const result = await fn();

      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failures = 0;
      }

      this.successfulRequests++;
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      const failurePercentage = this.calculateFailPercentage();
      const isPastFailurePercentageThreshold =
        failurePercentage >= this.failurePercentageThreshold;
      const isPastFailureCountThreshold =
        this.failures >= this.minimumFailureCount;

      if (isPastFailurePercentageThreshold && isPastFailureCountThreshold) {
        this.state = 'OPEN';
      }

      return this.executeFallback<T>(fallbackFn);
    }
  }

  /**
   * Executes fallback function and returns null if unavailable.
   * @param fallbackFn
   * @returns {T | null}
   */
  private async executeFallback<T>(
    fallbackFn: ExecutingFunction<T>,
  ): Promise<T | null> {
    try {
      const response = await fallbackFn();
      return response;
    } catch (error) {
      // fallback function is unavailable
      return null;
    }
  }

  /**
   * calculate fail percentage for primary function.
   * @returns
   */
  calculateFailPercentage() {
    const totalRequests = this.failures + this.successfulRequests;
    const failurePercentage = (this.failures / totalRequests) * 100;
    return failurePercentage;
  }
}

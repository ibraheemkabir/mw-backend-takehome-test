export interface IFallbackHandler {
  minimumFailureCount: number;
  state?: string;
  minimumFailurePercentage: number;
  resetTimeout: number;
}

export type ExecutingFunction<T> = () => Promise<T>;

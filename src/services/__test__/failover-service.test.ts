import { FailOverHandler } from '../failover-service';

describe('Test fallback handler class', () => {
  afterAll(() => {
    vitest.clearAllMocks();
  });

  it('should nopt call secondary/fallback function when primary function is successful', () => {
    const fallbackHandlerInstance = new FailOverHandler({
      minimumFailurePercentage: 50,
      resetTimeout: 1000,
      minimumFailureCount: 3,
    });

    const mockPrimaryFn = vitest.fn();
    const mockSecondaryFn = vitest.fn();

    fallbackHandlerInstance.execute(mockPrimaryFn, mockSecondaryFn);

    expect(mockPrimaryFn).toHaveBeenCalled();
    expect(mockSecondaryFn).toHaveBeenCalledTimes(0);
  });

  it('should call secondary/fallback function only when primary function call fails', () => {
    const fallbackHandlerInstance = new FailOverHandler({
      minimumFailurePercentage: 50,
      resetTimeout: 1000,
      minimumFailureCount: 3,
    });

    const mockPrimaryFn = vitest.fn().mockImplementationOnce(() => {
      throw new Error('error occured');
    });
    const mockSecondaryFn = vitest.fn();

    fallbackHandlerInstance.execute(mockPrimaryFn, mockSecondaryFn);

    expect(mockPrimaryFn).toHaveBeenCalled();
    expect(mockSecondaryFn).toHaveBeenCalled();
  });

  it('should call primary function until failure threshold count is surpassed', async () => {
    const fallbackHandlerInstance = new FailOverHandler({
      minimumFailurePercentage: 50,
      resetTimeout: 2000,
      minimumFailureCount: 2,
    });

    const mockPrimaryFn = vitest.fn().mockImplementation(() => {
      throw new Error('error occured');
    });
    const mockSecondaryFn = vitest.fn();

    await fallbackHandlerInstance.execute(mockPrimaryFn, mockSecondaryFn);
    await fallbackHandlerInstance.execute(mockPrimaryFn, mockSecondaryFn);
    await fallbackHandlerInstance.execute(mockPrimaryFn, mockSecondaryFn);

    expect(mockPrimaryFn).toHaveBeenCalledTimes(2);
    expect(mockSecondaryFn).toHaveBeenCalledTimes(3);
  });

  it('should retry primary function when reset timeout is surpassed', async () => {
    const fallbackHandlerInstance = new FailOverHandler({
      minimumFailurePercentage: 50,
      resetTimeout: 500,
      minimumFailureCount: 2,
    });

    const mockPrimaryFn = vitest.fn().mockImplementation(() => {
      throw new Error('error occured');
    });
    const mockSecondaryFn = vitest.fn();

    vi.useFakeTimers();
    await fallbackHandlerInstance.execute(mockPrimaryFn, mockSecondaryFn);
    await fallbackHandlerInstance.execute(mockPrimaryFn, mockSecondaryFn);
    vitest.advanceTimersByTime(500);

    await fallbackHandlerInstance.execute(mockPrimaryFn, mockSecondaryFn);
    expect(mockPrimaryFn).toHaveBeenCalledTimes(3);
    expect(mockSecondaryFn).toHaveBeenCalledTimes(3);
    vitest.clearAllTimers();
  });

  it('should retry and execute passing primary function when reset timeout is surpassed', async () => {
    const fallbackHandlerInstance = new FailOverHandler({
      minimumFailurePercentage: 50,
      resetTimeout: 500,
      minimumFailureCount: 2,
    });

    const mockPrimaryFn = vitest.fn().mockImplementation(() => {
      throw new Error('error occured');
    });
    const mockSecondaryFn = vitest.fn();

    vi.useFakeTimers();
    await fallbackHandlerInstance.execute(mockPrimaryFn, mockSecondaryFn);
    await fallbackHandlerInstance.execute(mockPrimaryFn, mockSecondaryFn);
    vitest.advanceTimersByTime(500);

    const mockPassingPrimaryFn = vitest.fn();
    await fallbackHandlerInstance.execute(
      mockPassingPrimaryFn,
      mockSecondaryFn,
    );

    expect(mockPrimaryFn).toHaveBeenCalledTimes(2);
    expect(mockSecondaryFn).toHaveBeenCalledTimes(2);
  });

  it('should return null when primary and secondary fallback function fails', async () => {
    const fallbackHandlerInstance = new FailOverHandler({
      minimumFailurePercentage: 50,
      resetTimeout: 500,
      minimumFailureCount: 1,
    });

    const mockPrimaryFn = vitest.fn().mockImplementation(() => {
      throw new Error('error occured');
    });
    const mockSecondaryFn = vitest.fn().mockImplementation(() => {
      throw new Error('error occured');
    });

    const response = await fallbackHandlerInstance.execute(
      mockPrimaryFn,
      mockSecondaryFn,
    );
    expect(response).toEqual(null);
  });
});

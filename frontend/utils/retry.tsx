export const retry = async (
  fn: Function,
  maxRetries: number,
  maxBackoff: number,
  identifier: string
) => {
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      console.log(`catching error on ${identifier} in retry function`);
      let waitTime = Math.min(
        2 ** retryCount * 1000 + Math.random() * 1000,
        maxBackoff
      );
      console.log(`Waiting for ${waitTime}ms before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      retryCount++;
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
};

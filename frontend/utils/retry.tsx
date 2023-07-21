export const retry = async (
  fn: Function,
  maxRetries: number,
  maxBackoff: number
) => {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      console.log("catching error");
      //   if (error.data.error.code === 429) {
      let waitTime = Math.min(
        2 ** retryCount * 1000 + Math.random() * 1000,
        maxBackoff
      );
      console.log(`Waiting for ${waitTime}ms before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      retryCount++;
      //   } else {
      //     throw error.message; // rethrow the error to be handled by the calling code
      //   }
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
};

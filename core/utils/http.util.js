/**
 * Sleep function to add delay (ms)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function to execute an async function with retry logic
 * @param {function} fn - Async function to execute
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryDelay - Delay between retries in milliseconds
 * @returns {Promise<any>}
 */
async function retry(fn, maxRetries, retryDelay) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt >= maxRetries) {
        throw new Error(
          `Failed after ${maxRetries} attempts: ${error.message}`
        );
      }
      await sleep(retryDelay);
    }
  }
}

module.exports = {
  retry,
};

function isTimeExpired(timestamp, offsetInSeconds) {
  const tt = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  const currentTime = Date.now();
  const timeDifference = tt.getTime() - currentTime;
  const timeDifferenceInSeconds = timeDifference / 1000; // Convert milliseconds to seconds

  // Calculate the total time remaining including the offset
  const totalRemainingTime = timeDifferenceInSeconds + offsetInSeconds;

  return !(totalRemainingTime > 0);
}

module.exports = {
  isTimeExpired,
};

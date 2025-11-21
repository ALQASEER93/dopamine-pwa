export function averageDurationMinutes(totalSeconds, count) {
  if (
    !Number.isFinite(totalSeconds) ||
    !Number.isFinite(count) ||
    totalSeconds <= 0 ||
    count <= 0
  ) {
    return 0;
  }

  const avg = totalSeconds / count / 60;
  return Number(avg.toFixed(1));
}


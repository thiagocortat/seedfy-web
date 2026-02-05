export function calculateStreak(dateKeys: string[], todayKey: string): { streakCurrent: number; streakBest: number } {
  if (!dateKeys.length) {
    return { streakCurrent: 0, streakBest: 0 };
  }

  // Deduplicate and sort descending (newest first)
  const sortedDates = Array.from(new Set(dateKeys)).sort((a, b) => b.localeCompare(a));

  // Helper to get day difference
  const getDiffDays = (d1: string, d2: string) => {
    // Treat strings as UTC to avoid timezone shifts
    const date1 = new Date(d1 + 'T00:00:00Z');
    const date2 = new Date(d2 + 'T00:00:00Z');
    const diffTime = date1.getTime() - date2.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  let best = 0;
  let currentRun = 0;

  // Calculate Best Streak
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentRun = 1;
    } else {
      const diff = getDiffDays(sortedDates[i - 1], sortedDates[i]);
      if (diff === 1) {
        currentRun++;
      } else {
        best = Math.max(best, currentRun);
        currentRun = 1;
      }
    }
  }
  best = Math.max(best, currentRun);

  // Calculate Current Streak
  // PRD: "Streak atual: número de dias consecutivos até hoje... Se não houver check-in hoje, streak atual = 0"
  let current = 0;
  
  // Check if today is present
  if (sortedDates.includes(todayKey)) {
    current = 1;
    const todayIndex = sortedDates.indexOf(todayKey);
    
    // Count backwards from today
    for (let i = todayIndex + 1; i < sortedDates.length; i++) {
      const diff = getDiffDays(sortedDates[i - 1], sortedDates[i]);
      if (diff === 1) {
        current++;
      } else {
        break;
      }
    }
  } else {
      current = 0;
  }

  return { streakCurrent: current, streakBest: best };
}

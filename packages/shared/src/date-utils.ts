import { format, differenceInDays } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * Returns the current date in YYYY-MM-DD format based on the given timezone.
 * Defaults to browser's timezone if not provided.
 */
export function getTodayKey(timezone?: string | null): string {
  const timeZone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  
  try {
    // formatInTimeZone ensures we get the YYYY-MM-DD relative to the specific timezone
    return formatInTimeZone(now, timeZone, 'yyyy-MM-dd');
  } catch (error) {
    console.error(`Invalid timezone: ${timeZone}, falling back to UTC`);
    return formatInTimeZone(now, 'UTC', 'yyyy-MM-dd');
  }
}

/**
 * Calculates the current day index (1-based) of a challenge based on its start date and timezone.
 * Returns 0 if challenge hasn't started yet.
 */
export function getDayIndex(startDateStr: string | null | undefined, timezone?: string | null): number {
  if (!startDateStr) return 1;

  // Use getTodayKey to ensure consistent "today" logic
  const todayStr = getTodayKey(timezone);
  
  // Parse as UTC midnight to compare pure dates
  const today = new Date(todayStr + 'T00:00:00Z');
  const start = new Date(startDateStr + 'T00:00:00Z');
  
  const diff = differenceInDays(today, start);
  
  // diff is 0-based index from start date (0 = first day)
  // We want 1-based index
  const dayIndex = diff + 1;
  
  return dayIndex > 0 ? dayIndex : 0;
}

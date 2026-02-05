import { getTodayKey } from '@seedfy/shared';

export interface CheckinStatus {
  done: boolean;
  todayKey: string;
  debug?: {
    challengeId: string;
    todayKey: string;
    done: boolean;
    reason: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFilter: any;
  };
}

export async function getCheckinStatusMap(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  challenges: { id: string; timezone?: string }[]
): Promise<Map<string, CheckinStatus>> {
  if (!challenges.length) {
    return new Map();
  }

  // 1. Calculate todayKey for each challenge
  const challengeDateMap = new Map<string, string>();
  const allTodayKeys = new Set<string>();

  challenges.forEach(c => {
    const key = getTodayKey(c.timezone);
    challengeDateMap.set(c.id, key);
    allTodayKeys.add(key);
  });

  const challengeIds = challenges.map(c => c.id);
  const dateKeysArray = Array.from(allTodayKeys);

  // 2. Query with strict filters
  // We fetch ALL checkins that match (user + any of the dates + any of the challenges)
  // Then we filter in memory to match the EXACT date for each challenge
  const { data: checkins, error } = await supabase
    .from('daily_checkins')
    .select('challenge_id, date_key')
    .eq('user_id', userId)
    .in('date_key', dateKeysArray)
    .in('challenge_id', challengeIds);

  // --- SERVER LOG PROOF ---
  console.log('[CheckinHelper] Query Executed:', {
    userId,
    dateKeys: dateKeysArray,
    challengeIdsCount: challengeIds.length,
    challengeIdsSample: challengeIds.slice(0, 3),
    returnedRows: checkins?.length || 0
  });
  // ------------------------

  if (error) {
    console.error('Error fetching checkins:', error);
    // Fallback: return empty map (all pending), do NOT default to done
    return new Map();
  }

  // 3. Build the result map
  const resultMap = new Map<string, CheckinStatus>();

  // Create a lookup for the fetched checkins: "challengeId_dateKey"
  const fetchedCheckinsSet = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkins?.map((c: any) => `${c.challenge_id}_${c.date_key}`) || []
  );

  challenges.forEach(c => {
    const todayKey = challengeDateMap.get(c.id)!;
    const isDone = fetchedCheckinsSet.has(`${c.id}_${todayKey}`);

    resultMap.set(c.id, {
      done: isDone,
      todayKey,
      debug: {
        challengeId: c.id,
        todayKey,
        done: isDone,
        reason: isDone ? 'Found in daily_checkins' : 'Not found',
        queryFilter: {
          user_id: userId,
          date_key_in: dateKeysArray,
          challenge_id_in: challengeIds
        }
      }
    });
  });

  return resultMap;
}

import { SupabaseClient } from '@supabase/supabase-js';
import { calculateStreak } from './streak-calculator';
import { getTodayKey } from '@seedfy/shared';

export type ProfileProgressDTO = {
  activeDaysTotal: number;
  streakCurrent: number;
  streakBest: number;
  challengesCompletedTotal: number;
  trophiesPreview: Array<TrophyDTO>;
};

export type TrophyDTO = {
  challengeId: string;
  title: string;
  type: string;
  durationDays: number;
  completedAt: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

export async function getCompletedChallenges(
  supabase: SupabaseClient,
  userId: string
): Promise<TrophyDTO[]> {
  // Parallel fetch: Explicit Completed AND All Check-ins (for fallback)
  const [explicitResult, checkinsResult] = await Promise.all([
    supabase
      .from('challenge_participants')
      .select(`
        challenge_id,
        status,
        challenges (
            id,
            title,
            type,
            duration_days,
            end_date,
            start_date
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed'),

    supabase
      .from('daily_checkins')
      .select('challenge_id, date_key, completed_at')
      .eq('user_id', userId)
  ]);

  const { data: explicitCompleted, error: explicitError } = explicitResult;
  const { data: checkins, error: checkinsError } = checkinsResult;

  if (explicitError) {
    console.error('Error fetching explicit completed:', explicitError);
  }

  if (checkinsError) {
    console.error('Error fetching checkins for fallback:', checkinsError);
  }

  // Calculate distinct dates per challenge
  const checkinCounts = new Map<string, Set<string>>();
  const lastCheckinDates = new Map<string, string>();

  (checkins || []).forEach((c) => {
    if (!checkinCounts.has(c.challenge_id)) {
      checkinCounts.set(c.challenge_id, new Set());
    }
    checkinCounts.get(c.challenge_id)!.add(c.date_key);
    
    // Track latest checkin time for fallback completedAt
    const currentMax = lastCheckinDates.get(c.challenge_id);
    if (!currentMax || (c.completed_at && c.completed_at > currentMax)) {
      lastCheckinDates.set(c.challenge_id, c.completed_at || c.date_key);
    }
  });

  // Identify candidate challenges for fallback (those with checkins but not in explicit list)
  const explicitIds = new Set(explicitCompleted?.map((p) => p.challenge_id));
  const candidateIds = Array.from(checkinCounts.keys()).filter(id => !explicitIds.has(id));

  let fallbackCompleted: TrophyDTO[] = [];

  if (candidateIds.length > 0) {
    // Fetch details for candidates
    const { data: candidateChallenges } = await supabase
      .from('challenges')
      .select('id, title, type, duration_days, end_date, start_date')
      .in('id', candidateIds);

    fallbackCompleted = (candidateChallenges || [])
      .filter((c) => {
        const count = checkinCounts.get(c.id)?.size || 0;
        return count >= (c.duration_days || 0);
      })
      .map((c) => ({
        challengeId: c.id,
        title: c.title,
        type: c.type,
        durationDays: c.duration_days,
        completedAt: lastCheckinDates.get(c.id) || c.end_date || new Date().toISOString(),
        startDate: c.start_date,
        endDate: c.end_date
      }));
  }

  // Combine and Format Explicit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedExplicit = (explicitCompleted || []).map((p: any) => ({
    challengeId: p.challenges.id,
    title: p.challenges.title,
    type: p.challenges.type,
    durationDays: p.challenges.duration_days,
    completedAt: p.challenges.end_date || new Date().toISOString(),
    startDate: p.challenges.start_date,
    endDate: p.challenges.end_date
  }));

  const allTrophies = [...formattedExplicit, ...fallbackCompleted];
  
  // Sort by completedAt desc
  allTrophies.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return allTrophies;
}

export async function getProfileProgress(
  supabase: SupabaseClient,
  userId: string,
  userTimezone: string = 'America/Sao_Paulo'
): Promise<ProfileProgressDTO> {
  // Parallel fetch: Check-ins (for streaks) AND Completed Challenges (for trophies)
  const [allCheckinsResult, trophies] = await Promise.all([
    supabase
      .from('daily_checkins')
      .select('date_key')
      .eq('user_id', userId)
      .order('date_key', { ascending: false }),
    
    getCompletedChallenges(supabase, userId)
  ]);

  const { data: allCheckins, error: checkinsError } = allCheckinsResult;

  if (checkinsError) {
    console.error('Error fetching checkins:', checkinsError);
    return {
      activeDaysTotal: 0,
      streakCurrent: 0,
      streakBest: 0,
      challengesCompletedTotal: 0,
      trophiesPreview: [],
    };
  }

  const uniqueDates = Array.from(new Set(allCheckins?.map(c => c.date_key) || []));
  const activeDaysTotal = uniqueDates.length;

  // 2. Calculate Streaks (Sync operation)
  const todayKey = getTodayKey(userTimezone);
  const { streakCurrent, streakBest } = calculateStreak(uniqueDates, todayKey);

  return {
    activeDaysTotal,
    streakCurrent,
    streakBest,
    challengesCompletedTotal: trophies.length,
    trophiesPreview: trophies.slice(0, 6),
  };
}

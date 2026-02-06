'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient, getTodayKey } from '@seedfy/shared';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CheckinButtonProps {
  challengeId: string;
  userId: string;
  latestCheckinDate?: string | null;
  participantId: string;
  dayIndex?: number;
  timezone?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debugInfo?: any;
  disabled?: boolean;
  disabledLabel?: string;
}

export function CheckinButton({ 
  challengeId, 
  userId, 
  latestCheckinDate, 
  participantId, 
  dayIndex, 
  timezone,
  disabled,
  disabledLabel
}: CheckinButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCheckedToday, setIsCheckedToday] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const supabase = createBrowserClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Check if latest checkin matches today in challenge timezone
    // Only run this logic on client to ensure browser timezone is used if 'timezone' prop is missing
    if (latestCheckinDate && isClient) {
      const today = getTodayKey(timezone);
      if (latestCheckinDate === today) {
        setIsCheckedToday(true);
      }
    }
  }, [latestCheckinDate, timezone, isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-12 bg-gray-100 animate-pulse rounded-xl" />
    );
  }

  if (disabled) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-all bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
      >
        {disabledLabel || 'Indisponível'}
      </button>
    );
  }

  const handleCheckin = async () => {
    if (isCheckedToday) return;
    
    setLoading(true);
    // Use challenge timezone for the key
    const todayKey = getTodayKey(timezone); 

    try {
      // 1. Insert check-in
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        challenge_id: challengeId,
        user_id: userId,
        date_key: todayKey,
        completed_at: new Date().toISOString(),
      };

      if (dayIndex) {
        payload.day_index = dayIndex;
      }

      const { error: checkinError } = await supabase
        .from('daily_checkins')
        .insert(payload);

      if (checkinError) {
        if (checkinError.code === '23505') { // Unique violation
          toast.info('Você já fez o check-in hoje!');
          setIsCheckedToday(true);
          return;
        }
        throw checkinError;
      }

      // 2. Fetch current progress to increment manually
      const { data: currentParticipant } = await supabase
        .from('challenge_participants')
        .select('progress')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();

      if (currentParticipant) {
        await supabase
          .from('challenge_participants')
          .update({ progress: (currentParticipant.progress || 0) + 1 })
          .eq('challenge_id', challengeId)
          .eq('user_id', userId);
      }
      
      toast.success('Check-in realizado com sucesso!');
      setIsCheckedToday(true);
      router.refresh();
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error('Erro ao realizar check-in. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckedToday) {
    return (
      <button 
        disabled
        className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 py-3 rounded-xl font-medium cursor-default"
      >
        <CheckCircle className="w-5 h-5" />
        Check-in de hoje realizado
      </button>
    );
  }

  return (
    <button
      onClick={handleCheckin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CheckCircle className="w-5 h-5" />
      )}
      {loading ? 'Registrando...' : 'Fazer Check-in do Dia'}
    </button>
  );
}

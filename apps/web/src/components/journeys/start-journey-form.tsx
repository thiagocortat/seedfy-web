'use client';

import { useState } from 'react';
import { JourneyTemplate } from '@seedfy/shared';
import { createBrowserClient } from '@seedfy/shared';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Clock, Play, Loader2, Calendar } from 'lucide-react';

interface StartJourneyFormProps {
  journey: JourneyTemplate;
}

export function StartJourneyForm({ journey }: StartJourneyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Defaults
  const [duration, setDuration] = useState(journey.durations_supported[0] || 1);
  const [startDate] = useState(new Date().toISOString().split('T')[0]); // Today YYYY-MM-DD
  
  const supabase = createBrowserClient();

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado.');
        return;
      }

      // Calculate end_date
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + duration);

      // 1. Create Challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          journey_id: journey.id,
          created_by: user.id,
          title: journey.title, // Copy title from template
          type: 'reading', // Default for journeys usually
          duration_days: duration,
          start_date: startDate,
          end_date: end.toISOString().split('T')[0],
          status: 'active',
          unlock_policy: 'daily',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
        .select()
        .single();

      if (challengeError) {
        console.error('Error creating challenge:', challengeError);
        if (challengeError.code === '42501') {
           toast.error('Permissão negada. Use o app móvel para iniciar jornadas.');
        } else {
           toast.error('Erro ao iniciar jornada. Tente novamente.');
        }
        return;
      }

      // 2. Create Participant (Self)
      const { error: partError } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          status: 'active',
          joined_at: new Date().toISOString(),
          progress: 0
        });

      if (partError) {
        console.error('Error adding participant:', partError);
        toast.error('Jornada criada, mas houve erro ao entrar. Verifique em "Meus Desafios".');
      } else {
        toast.success('Jornada iniciada com sucesso!');
        router.push(`/app/challenges/${challenge.id}`);
        router.refresh();
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h3 className="font-semibold text-gray-900">Configurar sua Jornada</h3>
      
      {/* Duration Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Duração (dias)
        </label>
        <div className="flex flex-wrap gap-2">
          {journey.durations_supported.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                ${duration === d 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}
              `}
            >
              {d} dias
            </button>
          ))}
        </div>
      </div>

      {/* Start Date Info (Read-only for MVP simplicity, assume starts today) */}
      <div>
         <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Início
        </label>
        <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          Hoje ({new Date().toLocaleDateString('pt-BR')})
        </p>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5 fill-current" />
          )}
          {loading ? 'Iniciando...' : 'Começar Agora'}
        </button>
        <p className="text-xs text-center text-gray-500 mt-3">
          Ao começar, um desafio será criado em sua conta.
        </p>
      </div>
    </div>
  );
}

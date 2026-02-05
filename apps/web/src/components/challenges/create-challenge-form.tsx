'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';
import { z } from 'zod';
import { Target, Clock, Calendar, Lock, Save, Loader2 } from 'lucide-react';

// Explicitly define schema locally to avoid runtime errors with pick/extend from shared package
const CreateChallengeSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  duration_days: z.number().min(1, "Duração mínima de 1 dia").max(365, "Máximo de 1 ano"),
  start_date: z.string().optional(),
  unlock_policy: z.enum(['daily', 'all_open']),
});

type CreateChallengeFormData = z.infer<typeof CreateChallengeSchema>;

export function CreateChallengeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateChallengeFormData>({
    resolver: zodResolver(CreateChallengeSchema),
    defaultValues: {
      title: '',
      duration_days: 7,
      start_date: new Date().toISOString().split('T')[0],
      unlock_policy: 'daily',
    },
  });

  const onSubmit = async (data: CreateChallengeFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado.');
        return;
      }

      // Calculate end_date
      const start = new Date(data.start_date || new Date());
      const end = new Date(start);
      end.setDate(end.getDate() + data.duration_days);

      // 1. Create Challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          created_by: user.id,
          title: data.title,
          type: 'reading', // Default for now
          duration_days: data.duration_days,
          start_date: data.start_date,
          end_date: end.toISOString().split('T')[0],
          status: 'active',
          unlock_policy: data.unlock_policy,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          // group_id: null // Could be extended to support group selection
        })
        .select()
        .single();

      if (challengeError) {
        console.error('Error creating challenge:', challengeError);
        toast.error('Erro ao criar desafio.');
        return;
      }

      // 2. Add creator as participant
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
        toast.error('Desafio criado, mas houve erro ao entrar.');
      } else {
        toast.success('Desafio criado com sucesso!');
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
          Título do Desafio
        </label>
        <div className="relative">
          <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            {...register('title')}
            id="title"
            type="text"
            className={`w-full pl-9 pr-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-input'
            }`}
            placeholder="Ex: Leitura de Provérbios"
          />
        </div>
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duration */}
        <div>
          <label htmlFor="duration_days" className="block text-sm font-medium text-foreground mb-1">
            Duração (dias)
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              {...register('duration_days', { valueAsNumber: true })}
              id="duration_days"
              type="number"
              min="1"
              max="365"
              className={`w-full pl-9 pr-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.duration_days ? 'border-red-500' : 'border-input'
              }`}
            />
          </div>
          {errors.duration_days && (
            <p className="mt-1 text-xs text-red-500">{errors.duration_days.message}</p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-foreground mb-1">
            Data de Início
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              {...register('start_date')}
              id="start_date"
              type="date"
              className={`w-full pl-9 pr-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.start_date ? 'border-red-500' : 'border-input'
              }`}
            />
          </div>
          {errors.start_date && (
            <p className="mt-1 text-xs text-red-500">{errors.start_date.message}</p>
          )}
        </div>
      </div>

      {/* Unlock Policy */}
      <div>
        <label htmlFor="unlock_policy" className="block text-sm font-medium text-foreground mb-1">
          Liberação de Conteúdo
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            {...register('unlock_policy')}
            id="unlock_policy"
            className="w-full pl-9 pr-10 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
          >
            <option value="daily">Diária (um dia por vez)</option>
            <option value="all_open">Tudo Aberto (livre)</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Define se os participantes podem avançar livremente ou devem seguir o cronograma.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? 'Criando...' : 'Criar Desafio'}
        </button>
      </div>
    </form>
  );
}

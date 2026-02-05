'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InterestsStepProps {
  onFinish: () => void;
}

const AVAILABLE_INTERESTS = [
  'Louvor',
  'Pregação',
  'Estudos Bíblicos',
  'Jovens',
  'Missões',
  'Voluntariado',
  'Família',
  'Crianças',
  'Tecnologia',
  'Ação Social'
];

export function InterestsStep({ onFinish }: InterestsStepProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const loadInterests = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('users')
        .select('interests')
        .eq('id', user.id)
        .single();

      if (profile?.interests) {
        setSelectedInterests(profile.interests);
      }
    };
    loadInterests();
  }, []);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // 1. Save Interests
      const { error: updateError } = await supabase
        .from('users')
        .update({ interests: selectedInterests })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 2. Mark Onboarding as Completed
      const { error: completeError } = await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (completeError) throw completeError;

      toast.success('Perfil configurado com sucesso!');
      
      // Force router refresh to update server components before navigation
      router.refresh();
      
      // Call parent finish handler
      onFinish();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao finalizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Seus Interesses</h2>
        <p className="text-muted-foreground">O que você busca no Seedfy?</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {AVAILABLE_INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest);
          return (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`
                relative flex items-center justify-center p-3 rounded-lg text-sm font-medium border transition-all
                ${isSelected 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground'}
              `}
            >
              {interest}
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Finalizar
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Pular por enquanto
        </button>
      </div>
    </div>
  );
}

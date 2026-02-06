'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';
import { LogOut, RotateCcw, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

interface QuitChallengeButtonProps {
  challengeId: string;
  userId: string;
  status: 'active' | 'quit' | 'completed';
}

export function QuitChallengeButton({ challengeId, userId, status }: QuitChallengeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const supabase = createBrowserClient();

  const handleQuit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .update({ status: 'quit' })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Você saiu do desafio.');
      setOpen(false);
      router.refresh();
      // Optional: Redirect to challenges list
      // router.push('/app/challenges'); 
    } catch (error) {
      console.error('Error quitting challenge:', error);
      toast.error('Erro ao sair do desafio.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejoin = async () => {
    setLoading(true);
    try {
      // Option A from PRD: status -> active, keep joined_at
      const { error } = await supabase
        .from('challenge_participants')
        .update({ status: 'active' })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Você entrou novamente no desafio!');
      router.refresh();
    } catch (error) {
      console.error('Error rejoining challenge:', error);
      toast.error('Erro ao reentrar no desafio.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'completed') {
    return null;
  }

  if (status === 'quit') {
    return (
      <button
        onClick={handleRejoin}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
        Entrar novamente
      </button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Desistir
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desistir deste desafio?</DialogTitle>
          <DialogDescription>
            Você pode entrar novamente depois. Seus check-ins já realizados não serão apagados.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              Cancelar
            </button>
          </DialogClose>
          <button
            onClick={handleQuit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center justify-center min-w-[80px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Desistir'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

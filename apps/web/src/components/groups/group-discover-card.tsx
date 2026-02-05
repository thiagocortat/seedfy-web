'use client';

import { useState } from 'react';
import { Group, GroupJoinPolicyEnum } from '@seedfy/shared';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';
import { Users, Lock, UserPlus, ArrowRight, Check, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GroupDiscoverCardProps {
  group: Group;
  membershipStatus: 'member' | 'pending' | 'none';
}

export function GroupDiscoverCard({ group, membershipStatus }: GroupDiscoverCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleJoin = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado.');
        return;
      }

      if (group.join_policy === 'open') {
        const { error } = await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'member',
          });

        if (error) throw error;
        toast.success(`Você entrou no grupo ${group.name}!`);
        router.refresh();
      } else if (group.join_policy === 'request') {
        const { error } = await supabase
          .from('group_join_requests')
          .insert({
            group_id: group.id,
            requester_user_id: user.id,
            status: 'pending',
          });

        if (error) throw error;
        toast.success('Solicitação enviada com sucesso!');
        router.refresh();
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const getButton = () => {
    if (membershipStatus === 'member') {
      return (
        <button
          onClick={() => router.push(`/app/groups/${group.id}`)}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver Grupo <ArrowRight className="w-4 h-4" />
        </button>
      );
    }

    if (membershipStatus === 'pending') {
      return (
        <span className="flex items-center gap-1 text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
          <Clock className="w-4 h-4" />
          Pendente
        </span>
      );
    }

    if (group.join_policy === 'invite_only') {
      return (
        <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <Lock className="w-4 h-4" />
          Apenas Convite
        </span>
      );
    }

    return (
      <button
        onClick={handleJoin}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          group.join_policy === 'open'
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : group.join_policy === 'open' ? (
          <>
            <UserPlus className="w-4 h-4" />
            Entrar
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            Solicitar
          </>
        )}
      </button>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center border border-border">
        {group.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
        ) : (
          <Users className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-foreground truncate">{group.name}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
          {group.join_policy === 'open' && <span className="text-green-600 flex items-center gap-1"><Globe className="w-3 h-3" /> Aberto</span>}
          {group.join_policy === 'request' && <span className="text-blue-600 flex items-center gap-1"><Lock className="w-3 h-3" /> Moderado</span>}
          {group.join_policy === 'invite_only' && <span className="text-gray-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Fechado</span>}
        </p>
      </div>

      <div className="flex-shrink-0">
        {getButton()}
      </div>
    </div>
  );
}

// Icon helper
function Globe({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

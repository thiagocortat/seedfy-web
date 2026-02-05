'use client';

import { useState } from 'react';
import { Group, GroupInvitation, GroupJoinRequest, User } from '@seedfy/shared';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';
import { Check, X, Users, User as UserIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Extended types for UI
export type ExtendedInvitation = GroupInvitation & {
  groups: Group;
  inviter: User; // We assume we fetch inviter details from users table
};

export type ExtendedRequest = GroupJoinRequest & {
  groups: Group;
  users: User; // requester
};

export function InvitationCard({ invitation }: { invitation: ExtendedInvitation }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleResponse = async (status: 'accepted' | 'declined') => {
    setLoading(true);
    try {
      // 1. Update invitation status
      const { error: inviteError } = await supabase
        .from('group_invitations')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (inviteError) throw inviteError;

      // 2. If accepted, add to group members
      if (status === 'accepted') {
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: invitation.group_id,
            user_id: invitation.invited_user_id,
            role: 'member',
          });

        if (memberError) {
          // If member creation fails, we might need to rollback invitation status or warn
          console.error('Error adding member:', memberError);
          toast.error('Erro ao adicionar você ao grupo.');
          return;
        }
        toast.success(`Você entrou no grupo ${invitation.groups.name}!`);
      } else {
        toast.success('Convite recusado.');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Erro ao processar resposta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center border border-border">
          {invitation.groups.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={invitation.groups.image_url} alt={invitation.groups.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <Users className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <h4 className="font-medium text-foreground">Convite para: {invitation.groups.name}</h4>
          <p className="text-sm text-muted-foreground">
            Convidado por {invitation.inviter?.name || 'um usuário'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleResponse('declined')}
          disabled={loading}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Recusar"
        >
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleResponse('accepted')}
          disabled={loading}
          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
          title="Aceitar"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

export function JoinRequestCard({ request }: { request: ExtendedRequest }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleResponse = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Update request status
      const { error: reqError } = await supabase
        .from('group_join_requests')
        .update({
          status,
          resolved_at: new Date().toISOString(),
          resolved_by_user_id: user.id,
        })
        .eq('id', request.id);

      if (reqError) throw reqError;

      // 2. If approved, add to group members
      if (status === 'approved') {
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: request.group_id,
            user_id: request.requester_user_id,
            role: 'member',
          });

        if (memberError) {
          console.error('Error adding member:', memberError);
          toast.error('Erro ao adicionar membro.');
          return;
        }
        toast.success('Solicitação aprovada!');
      } else {
        toast.success('Solicitação rejeitada.');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center border border-border">
          {request.users.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={request.users.photo_url} alt={request.users.name || ''} className="w-full h-full object-cover rounded-full" />
          ) : (
            <UserIcon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <h4 className="font-medium text-foreground">{request.users.name || 'Usuário'}</h4>
          <p className="text-sm text-muted-foreground">
            Solicitou entrada em <strong>{request.groups.name}</strong>
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleResponse('rejected')}
          disabled={loading}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Rejeitar"
        >
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleResponse('approved')}
          disabled={loading}
          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
          title="Aprovar"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

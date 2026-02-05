'use client';

import { useState } from 'react';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';
import { Mail, Send, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const InviteSchema = z.object({
  email: z.string().email("Email inválido"),
});

type InviteFormData = z.infer<typeof InviteSchema>;

export function InviteUserForm({ groupId }: { groupId: string }) {
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(InviteSchema),
  });

  const onSubmit = async (data: InviteFormData) => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // 1. Find user by email
      // Note: This relies on RLS allowing us to query users by email, or a specific RPC.
      // If public.users is readable, we can do this.
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .ilike('email', data.email) // Case insensitive
        .limit(1);

      if (userError) {
        console.error('Error finding user:', userError);
        toast.error('Erro ao buscar usuário.');
        return;
      }

      const targetUser = users?.[0];

      if (!targetUser) {
        toast.error('Usuário não encontrado com este e-mail.');
        return;
      }

      if (targetUser.id === currentUser.id) {
        toast.error('Você não pode convidar a si mesmo.');
        return;
      }

      // 2. Check if already member
      const { data: membership } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', targetUser.id)
        .single();

      if (membership) {
        toast.error('Este usuário já é membro do grupo.');
        return;
      }

      // 3. Check if already invited
      const { data: existingInvite } = await supabase
        .from('group_invitations')
        .select('id')
        .eq('group_id', groupId)
        .eq('invited_user_id', targetUser.id)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        toast.error('Já existe um convite pendente para este usuário.');
        return;
      }

      // 4. Create invitation
      const { error: inviteError } = await supabase
        .from('group_invitations')
        .insert({
          group_id: groupId,
          inviter_user_id: currentUser.id,
          invited_user_id: targetUser.id,
          status: 'pending',
        });

      if (inviteError) {
        throw inviteError;
      }

      toast.success(`Convite enviado para ${targetUser.name || data.email}!`);
      reset();

    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Erro ao enviar convite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Mail className="w-5 h-5" />
        Convidar Membro
      </h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            {...register('email')}
            type="email"
            placeholder="Digite o e-mail do usuário..."
            className={`w-full px-4 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-input'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 min-w-[120px]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-muted/50 rounded-lg flex gap-2 text-xs text-muted-foreground">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <p>
          O usuário receberá o convite na seção &quot;Inbox&quot; do app e poderá aceitar ou recusar.
        </p>
      </div>
    </div>
  );
}

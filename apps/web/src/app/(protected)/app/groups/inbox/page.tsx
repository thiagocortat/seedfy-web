import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { ExtendedInvitation, ExtendedRequest, InvitationCard, JoinRequestCard } from '@/components/groups/inbox-items';
import { ArrowLeft, Inbox } from 'lucide-react';
import Link from 'next/link';

export default async function GroupsInboxPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch Invitations for me
  const { data: invitations } = await supabase
    .from('group_invitations')
    .select(`
      *,
      groups:group_id (*),
      inviter:inviter_user_id (name, photo_url)
    `)
    .eq('invited_user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // 2. Fetch Requests for my groups
  // First get groups where I am owner/admin
  const { data: myManagedGroups } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin']);

  const managedGroupIds = myManagedGroups?.map(g => g.group_id) || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let requests: any[] = [];
  if (managedGroupIds.length > 0) {
    const { data: requestsData } = await supabase
      .from('group_join_requests')
      .select(`
        *,
        groups:group_id (name),
        users:requester_user_id (name, photo_url, email)
      `)
      .in('group_id', managedGroupIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    requests = requestsData || [];
  }

  const hasItems = (invitations?.length || 0) > 0 || requests.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          href="/app/groups" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Meus Grupos
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Caixa de Entrada</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie convites e solicitações de entrada.
        </p>
      </div>

      {!hasItems ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Tudo limpo por aqui</h3>
          <p className="text-gray-500 max-w-sm">
            Você não tem convites ou solicitações pendentes.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Invitations */}
          {invitations && invitations.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Convites Recebidos</h2>
              <div className="grid gap-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {invitations.map((invitation: any) => (
                  <InvitationCard 
                    key={invitation.id} 
                    invitation={invitation as unknown as ExtendedInvitation} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* Requests */}
          {requests.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Solicitações Pendentes</h2>
              <div className="grid gap-4">
                {requests.map((request) => (
                  <JoinRequestCard 
                    key={request.id} 
                    request={request as unknown as ExtendedRequest} 
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { GroupCard } from '@/components/groups/group-card';
import { Group } from '@seedfy/shared';
import { Users, Plus, Search, Inbox } from 'lucide-react';
import Link from 'next/link';

export default async function GroupsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Layout handles redirect or protected routes
  }

  // 2. Fetch user groups via join
  const { data: userGroups } = await supabase
    .from('group_members')
    .select(`
      group_id,
      groups:group_id (
        id,
        name,
        image_url,
        created_at,
        created_by
      )
    `)
    .eq('user_id', user.id);

  // Flatten the data
  const groups = userGroups?.map(item => item.groups).filter(Boolean) as unknown as Group[];

  // 3. Check for Inbox items (Invitations & Requests)
  // Invitations
  const { count: inviteCount } = await supabase
    .from('group_invitations')
    .select('*', { count: 'exact', head: true })
    .eq('invited_user_id', user.id)
    .eq('status', 'pending');

  // Requests (for managed groups)
  const { data: myManagedGroups } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin']);
  
  let requestCount = 0;
  if (myManagedGroups && myManagedGroups.length > 0) {
    const managedGroupIds = myManagedGroups.map(g => g.group_id);
    const { count } = await supabase
      .from('group_join_requests')
      .select('*', { count: 'exact', head: true })
      .in('group_id', managedGroupIds)
      .eq('status', 'pending');
    requestCount = count || 0;
  }

  const totalInboxCount = (inviteCount || 0) + requestCount;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Grupos</h1>
          <p className="text-gray-600 mt-1">Grupos que você participa</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href="/app/groups/inbox"
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Caixa de Entrada"
          >
            <Inbox className="w-5 h-5" />
            {totalInboxCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </Link>
          <Link 
            href="/app/groups/discover"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            Buscar
          </Link>
          <Link 
            href="/app/groups/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar Grupo
          </Link>
        </div>
      </div>

      {totalInboxCount > 0 && (
        <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Você tem {totalInboxCount} {totalInboxCount === 1 ? 'item pendente' : 'itens pendentes'}
              </p>
              <p className="text-xs text-blue-700">
                Verifique seus convites e solicitações de entrada.
              </p>
            </div>
          </div>
          <Link 
            href="/app/groups/inbox"
            className="text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
          >
            Ver Inbox
          </Link>
        </div>
      )}

      {groups && groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Você não participa de nenhum grupo</h3>
          <p className="text-gray-500 max-w-sm mb-6">
            Crie seu próprio grupo para compartilhar jornadas ou busque grupos existentes.
          </p>
          <div className="flex gap-3">
            <Link 
              href="/app/groups/discover"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Explorar Grupos
            </Link>
            <Link 
              href="/app/groups/new"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Criar meu primeiro grupo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

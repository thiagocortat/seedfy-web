import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { Group } from '@seedfy/shared';
import { GroupDiscoverCard } from '@/components/groups/group-discover-card';
import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function DiscoverGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch discoverable groups
  let groupsQuery = supabase
    .from('groups')
    .select('*')
    .eq('discoverable', true)
    .order('created_at', { ascending: false });

  if (query) {
    groupsQuery = groupsQuery.ilike('name', `%${query}%`);
  }

  const { data: groups } = await groupsQuery;

  // 2. Fetch my memberships
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id);

  const memberGroupIds = new Set(memberships?.map(m => m.group_id));

  // 3. Fetch my pending requests
  const { data: requests } = await supabase
    .from('group_join_requests')
    .select('group_id')
    .eq('requester_user_id', user.id)
    .eq('status', 'pending');

  const pendingGroupIds = new Set(requests?.map(r => r.group_id));

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
        <h1 className="text-2xl font-bold text-foreground">Explorar Grupos</h1>
        <p className="text-muted-foreground mt-1">
          Encontre novos grupos para participar.
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-8">
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar grupos por nome..."
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
          />
        </form>
      </div>

      {/* Results */}
      <div className="grid gap-4">
        {groups && groups.length > 0 ? (
          groups.map((group) => {
             let status: 'member' | 'pending' | 'none' = 'none';
             if (memberGroupIds.has(group.id)) status = 'member';
             else if (pendingGroupIds.has(group.id)) status = 'pending';

             return (
               <GroupDiscoverCard 
                 key={group.id} 
                 group={group as unknown as Group} 
                 membershipStatus={status} 
               />
             );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum grupo encontrado.</p>
            {query && (
              <p className="text-sm text-muted-foreground mt-2">
                Tente buscar com outros termos.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

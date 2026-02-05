import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { GroupView } from '@/components/groups/group-view';
import { GroupDiscoverCard } from '@/components/groups/group-discover-card';
import { Group, GroupMember, User } from '@seedfy/shared';
import { notFound, redirect } from 'next/navigation';
import { Users, Calendar, ChevronLeft, Lock } from 'lucide-react';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch group details
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single();

  if (!group) {
    notFound();
  }

  // 2. Fetch members with user details
  const { data: members } = await supabase
    .from('group_members')
    .select(`
      *,
      users:user_id (
        id,
        name,
        photo_url,
        role
      )
    `)
    .eq('group_id', id);

  // 3. Verify membership
  const myMembership = members?.find(m => m.user_id === user.id);
  const isMember = !!myMembership;

  const typedGroup = group as Group;
  const typedMembers = (members || []) as unknown as (GroupMember & { users: User })[];

  // 4. If not member, check if there is a pending request
  let pendingStatus: 'member' | 'pending' | 'none' = isMember ? 'member' : 'none';
  
  if (!isMember) {
    const { data: request } = await supabase
      .from('group_join_requests')
      .select('id')
      .eq('group_id', id)
      .eq('requester_user_id', user.id)
      .eq('status', 'pending')
      .single();
    
    if (request) {
      pendingStatus = 'pending';
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        href="/app/groups"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Voltar para meus grupos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {typedGroup.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={typedGroup.image_url} 
                  alt={typedGroup.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Users className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="p-6">
              <h1 className="text-xl font-bold text-gray-900 mb-2">{typedGroup.name}</h1>
              <div className="flex items-center text-sm text-gray-500 gap-2 mb-4">
                <Calendar className="w-4 h-4" />
                <span>Criado em {new Date(typedGroup.created_at!).toLocaleDateString('pt-BR')}</span>
              </div>
              
              {!isMember && (
                <div className="pt-4 border-t border-gray-100">
                  <GroupDiscoverCard group={typedGroup} membershipStatus={pendingStatus} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {isMember ? (
            <GroupView 
              group={typedGroup} 
              members={typedMembers} 
              currentUserRole={myMembership!.role as 'owner' | 'member'} 
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Conteúdo Exclusivo</h3>
              <p className="text-gray-500 max-w-sm mb-6">
                Você precisa fazer parte deste grupo para ver seus membros e atividades.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { GroupMembersList } from '@/components/groups/group-members-list';
import { Group, GroupMember, User } from '@seedfy/shared';
import { notFound, redirect } from 'next/navigation';
import { Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

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

  // 3. Verify if current user is member
  const isMember = members?.some(m => m.user_id === user.id);

  if (!isMember) {
    // If not member, show restricted access or redirect
    // For MVP, we redirect to groups list
    redirect('/app/groups');
  }

  const typedGroup = group as Group;
  const typedMembers = (members || []) as unknown as (GroupMember & { users: User })[];

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
              <div className="flex items-center text-sm text-gray-500 gap-2">
                <Calendar className="w-4 h-4" />
                <span>Criado em {new Date(typedGroup.created_at!).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <GroupMembersList members={typedMembers} />
          
          {/* Future sections like Feed or Challenges could go here */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-blue-900 font-medium mb-2">Sobre este grupo</h3>
            <p className="text-blue-700 text-sm">
              Você está visualizando a área de membros. Em breve você poderá ver desafios e atividades do grupo aqui.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

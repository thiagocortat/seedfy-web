import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { GroupCard } from '@/components/groups/group-card';
import { Group } from '@seedfy/shared';
import { Users } from 'lucide-react';

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Grupos</h1>
          <p className="text-gray-600 mt-1">Grupos que você participa</p>
        </div>
      </div>

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
          <p className="text-gray-500 max-w-sm">
            Quando você for convidado para um grupo, ele aparecerá aqui.
          </p>
        </div>
      )}
    </div>
  );
}

import { createServerClient } from '@seedfy/shared/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowRight, Play, Users, Trophy, CheckCircle } from 'lucide-react';
import { getCheckinStatusMap } from '@/lib/checkin-helper';
import { MyChurchBlock } from '@/components/home/my-church-block';
import { Church, ChurchPost } from '@seedfy/shared';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const showDebug = process.env.NEXT_PUBLIC_DEBUG_CHECKINS === 'true';

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Carregando...</div>;
  }

  // Helper to fetch content with fallback logic
  const fetchContent = async () => {
    // 1. Check if we have any live content
    const { count } = await supabase
      .from('content_items')
      .select('*', { count: 'exact', head: true })
      .eq('is_live', true);
    
    const hasLiveContent = count !== null && count > 0;
    const isPreviewMode = !hasLiveContent;

    // 2. Fetch data based on availability
    let query = supabase
      .from('content_items')
      .select('id, title, cover_url, type, created_at')
      .order('created_at', { ascending: false })
      .limit(6);

    if (hasLiveContent) {
      query = query.eq('is_live', true);
    }

    const { data } = await query;
    return { data, isPreviewMode };
  };

  // Helper to fetch church data
  const fetchChurchData = async (userId: string) => {
    const { data: userData } = await supabase
      .from('users')
      .select('church_id')
      .eq('id', userId)
      .single();

    const churchId = userData?.church_id;
    let church = null;
    let posts: ChurchPost[] = [];

    if (churchId) {
      // Fetch Church Details
      const { data: churchData } = await supabase
        .from('churches')
        .select('*')
        .eq('id', churchId)
        .single();
      church = churchData;

      // Fetch Recent Posts
      const { data: postsData } = await supabase
        .from('church_posts')
        .select('*')
        .eq('church_id', churchId)
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('pinned', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(3);
      
      posts = postsData || [];
    }

    return { churchId, church, posts };
  };

  const [groupsResult, challengesResult, contentResult, churchResult] = await Promise.all([
    supabase
      .from('group_members')
      .select('groups(id, name, image_url)')
      .eq('user_id', user.id)
      .limit(5),
    supabase
      .from('challenge_participants')
      .select('challenges(id, title, start_date, duration_days, timezone)')
      .eq('user_id', user.id)
      .eq('status', 'active') // Only active challenges
      .limit(5),
    fetchContent(),
    fetchChurchData(user.id),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups = groupsResult.data?.map((item: any) => item.groups)?.filter(Boolean) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const challenges = challengesResult.data?.map((item: any) => item.challenges)?.filter(Boolean) || [];
  const content = contentResult.data || [];
  const isContentPreview = contentResult.isPreviewMode;
  const { churchId, church, posts } = churchResult;

  // Single Source of Truth for Checkins
  const checkinStatusMap = await getCheckinStatusMap(supabase, user.id, challenges);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo, {user.user_metadata?.full_name?.split(' ')[0] || 'ao Seedfy'}</h1>
        <p className="text-gray-600">
          Seu painel de crescimento espiritual.
        </p>
      </div>

      {/* My Church Block (New) */}
      <MyChurchBlock 
        churchId={churchId} 
        church={church as Church} 
        posts={posts} 
      />
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Widget A — “Meus Grupos” */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Meus Grupos
            </h3>
            {groups.length > 0 && (
              <Link href="/app/groups" className="text-xs text-blue-600 hover:underline">
                Ver todos
              </Link>
            )}
          </div>
          
          <div className="space-y-3 flex-1">
            {groups.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              groups.map((group: any) => (
                <Link 
                  key={group.id} 
                  href={`/app/groups/${group.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {group.image_url ? (
                      <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                        {group.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{group.name}</p>
                    <p className="text-xs text-gray-500">Membro</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-3">Você ainda não participa de grupos</p>
                <Link 
                  href="/app/groups" 
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Encontrar grupos
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Widget B — “Desafios Ativos” */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              Desafios Ativos
            </h3>
            {challenges.length > 0 && (
              <Link href="/app/challenges" className="text-xs text-blue-600 hover:underline">
                Ver todos
              </Link>
            )}
          </div>
          
          <div className="space-y-3 flex-1">
            {challenges.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              challenges.map((challenge: any) => {
                const status = checkinStatusMap.get(challenge.id);
                const isChecked = status?.done || false;
                const debugInfo = status?.debug;

                return (
                  <Link 
                    key={challenge.id} 
                    href={`/app/challenges/${challenge.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 relative group"
                  >
                    {showDebug && debugInfo && (
                      <div className="absolute inset-0 bg-black/90 p-2 text-[10px] text-green-400 font-mono overflow-auto z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-bold text-white mb-1">DEBUG MODE</p>
                        <p>ID: {debugInfo.challengeId.slice(0,8)}...</p>
                        <p>Key: {debugInfo.todayKey}</p>
                        <p>Done: {String(debugInfo.done)}</p>
                        <p>Reason: {debugInfo.reason}</p>
                        <div className="mt-1 border-t border-gray-700 pt-1">
                           Filter: {JSON.stringify(debugInfo.queryFilter)}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{challenge.title}</p>
                      </div>
                      {isChecked && (
                         <span className="text-green-600 flex-shrink-0" title="Check-in feito hoje">
                           <CheckCircle className="w-4 h-4" />
                         </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{challenge.duration_days ? `${challenge.duration_days} dias` : 'Em andamento'}</span>
                      <span className={isChecked ? "text-green-600 font-medium" : "text-blue-600 font-medium"}>
                        {isChecked ? 'Feito hoje' : 'Fazer check-in'}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-3">Nenhum desafio ativo no momento</p>
                <Link 
                  href="/app/challenges" 
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  Explorar desafios
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Widget C — “Conteúdos Recentes” */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-600" />
              Conteúdos Recentes
            </h3>
            <Link href="/app/content" className="text-xs text-blue-600 hover:underline">
              Ver biblioteca
            </Link>
          </div>
          
          {isContentPreview && content.length > 0 && (
             <div className="mb-3 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-200 inline-block">
               Modo Preview (Não Publicado)
             </div>
          )}

          <div className="space-y-3 flex-1">
            {content.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content.map((item: any) => (
                <Link 
                  key={item.id} 
                  href={`/app/content/${item.id}`}
                  className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden relative">
                    {item.cover_url ? (
                      <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <Play className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">Nenhum conteúdo recente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

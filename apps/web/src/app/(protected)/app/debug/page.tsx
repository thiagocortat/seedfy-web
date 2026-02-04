import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';

export default async function DebugPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
          Usuário não autenticado. Erro: {authError?.message || 'Sem sessão'}
        </div>
      </div>
    );
  }

  // 1. Check Content Items (Raw)
  const { data: rawContent, error: contentError } = await supabase
    .from('content_items')
    .select('id, title, is_live, type, created_at')
    .limit(5);

  // 2. Check Content Items (With Filter)
  const { data: filteredContent, error: filteredContentError } = await supabase
    .from('content_items')
    .select('id, title, is_live, type')
    .eq('is_live', true)
    .limit(5);

  // 3. Check Groups
  const { data: groups, error: groupsError } = await supabase
    .from('group_members')
    .select('group_id, role, groups(id, name)')
    .eq('user_id', user.id)
    .limit(5);

  // 4. Check Challenges & Checkins
  const todayKey = new Date().toLocaleDateString('en-CA');
  const { data: checkins, error: checkinsError } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .eq('date_key', todayKey)
    .limit(5);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico do Sistema</h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <strong>User ID:</strong> {user.id}<br/>
        <strong>Email:</strong> {user.email}<br/>
        <strong>Date (Server Local):</strong> {new Date().toLocaleDateString('en-CA')}
      </div>

      <section>
        <h2 className="text-xl font-bold mb-2">1. Conteúdo (Sem filtro)</h2>
        {contentError ? (
          <div className="bg-red-50 text-red-700 p-4 rounded">Error: {contentError.message}</div>
        ) : (
          <pre className="bg-gray-50 p-4 rounded overflow-auto">{JSON.stringify(rawContent, null, 2)}</pre>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">2. Conteúdo (is_live=true)</h2>
        {filteredContentError ? (
          <div className="bg-red-50 text-red-700 p-4 rounded">Error: {filteredContentError.message}</div>
        ) : (
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {filteredContent?.length === 0 ? 'Nenhum item encontrado com is_live=true' : JSON.stringify(filteredContent, null, 2)}
          </pre>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">3. Meus Grupos</h2>
        {groupsError ? (
          <div className="bg-red-50 text-red-700 p-4 rounded">Error: {groupsError.message}</div>
        ) : (
          <pre className="bg-gray-50 p-4 rounded overflow-auto">{JSON.stringify(groups, null, 2)}</pre>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">4. Check-ins de Hoje ({todayKey})</h2>
        {checkinsError ? (
          <div className="bg-red-50 text-red-700 p-4 rounded">Error: {checkinsError.message}</div>
        ) : (
          <pre className="bg-gray-50 p-4 rounded overflow-auto">{JSON.stringify(checkins, null, 2)}</pre>
        )}
      </section>
    </div>
  );
}

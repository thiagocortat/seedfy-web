import { createServiceClient } from '@seedfy/shared/server';
import { Plus, Edit, Trash2, Pin, FileText } from 'lucide-react';
import Link from 'next/link';
import { deleteChurchPost, togglePinChurchPost } from '../../../../../actions/church-posts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PostFilters } from './post-filters';

export const dynamic = 'force-dynamic';

export default async function ChurchPostsListPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const supabase = createServiceClient();
  const q = searchParams?.q || '';
  const status = searchParams?.status || 'all';

  // Fetch church details
  const { data: church } = await supabase
    .from('churches')
    .select('name')
    .eq('id', params.id)
    .single();

  let query = supabase
    .from('church_posts')
    .select('*')
    .eq('church_id', params.id)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (q) {
    query = query.ilike('title', `%${q}%`);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: posts } = await query;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feed da Igreja</h1>
          <p className="text-gray-500 mt-1">{church?.name || 'Carregando...'}</p>
        </div>
        <Link
          href={`/dashboard/churches/${params.id}/posts/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Post
        </Link>
      </div>

      {/* Filters */}
      <PostFilters q={q} status={status} />

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-medium">
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts?.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    {post.image_url ? (
                      <img src={post.image_url} alt="" className="w-10 h-10 rounded object-cover bg-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {post.pinned && <Pin className="w-3 h-3 text-blue-500 fill-blue-500" />}
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1">{post.excerpt || post.body}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.status === 'published' ? 'bg-green-100 text-green-800' :
                    post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status === 'published' ? 'Publicado' :
                     post.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {post.published_at 
                    ? format(new Date(post.published_at), "d 'de' MMM, HH:mm", { locale: ptBR })
                    : format(new Date(post.updated_at), "d 'de' MMM '(atualizado)'", { locale: ptBR })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <form action={async () => {
                      'use server';
                      await togglePinChurchPost(post.id, params.id, post.pinned);
                    }}>
                      <button className={`p-2 rounded-lg transition-colors ${post.pinned ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                        <Pin className="w-4 h-4" />
                      </button>
                    </form>
                    <Link
                      href={`/dashboard/churches/${params.id}/posts/${post.id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <form action={async () => {
                      'use server';
                      await deleteChurchPost(post.id, params.id);
                    }}>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {posts?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Nenhum post encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

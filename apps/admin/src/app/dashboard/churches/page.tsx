import { createServiceClient } from '@seedfy/shared/server';
import { Plus, Edit, Trash2, Search, MapPin, MessageSquare, Zap } from 'lucide-react';
import Link from 'next/link';
import { deleteChurch } from '../../../actions/churches';

export const dynamic = 'force-dynamic';

export default async function ChurchListPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = createServiceClient();
  const q = searchParams?.q || '';

  let query = supabase
    .from('churches')
    .select('*')
    .order('name', { ascending: true });

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  const { data: churches } = await query;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Diretório de Igrejas</h1>
        <Link
          href="/dashboard/churches/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Igreja
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <form>
            <input
              name="q"
              placeholder="Buscar por nome..."
              defaultValue={q}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Igreja</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Localização</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {churches?.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {item.logo_url ? (
                        <img src={item.logo_url} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <MapPin className="w-5 h-5" />
                        </div>
                    )}
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-600">
                    {item.city}{item.city && item.state ? ', ' : ''}{item.state}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/churches/${item.id}/quick-actions`}
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Quick Actions"
                    >
                      <Zap className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/dashboard/churches/${item.id}/posts`}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Gerenciar Posts"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/dashboard/churches/${item.id}`}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar Igreja"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <form action={async () => {
                      'use server';
                      await deleteChurch(item.id);
                    }}>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors" type="submit" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {churches?.length === 0 && (
                <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                        Nenhuma igreja encontrada.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PostFilters({ q, status }: { q: string; status: string }) {
  const router = useRouter();

  const handleSearch = (formData: FormData) => {
    const searchParams = new URLSearchParams();
    const query = formData.get('q') as string;
    const stat = formData.get('status') as string;

    if (query) searchParams.set('q', query);
    if (stat && stat !== 'all') searchParams.set('status', stat);

    router.push(`?${searchParams.toString()}`);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <form action={handleSearch}>
          <input
            name="q"
            placeholder="Buscar posts..."
            defaultValue={q}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
          />
          <input type="hidden" name="status" value={status} />
        </form>
      </div>
      <div className="w-48">
        <form>
          <input type="hidden" name="q" value={q} />
          <select
            name="status"
            defaultValue={status}
            onChange={(e) => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set('status', e.target.value);
              router.push(`?${searchParams.toString()}`);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value="all">Todos os Status</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </form>
      </div>
    </div>
  );
}

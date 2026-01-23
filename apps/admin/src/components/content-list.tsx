'use client';

import { Plus, Edit, Trash2, Search, Play } from 'lucide-react';
import Link from 'next/link';
import { deleteContent } from '@/actions/content';
import { useState } from 'react';
import { PreviewModal } from '@/components/preview-modal';
import { toast } from 'sonner';

// Client component wrapper for the list to handle state (modal)
// Note: We're making the whole page client-side for simplicity of state management in MVP, 
// but ideally we'd separate the list into a client component.
// However, since we need to accept searchParams in the Page (server component), 
// we'll keep the Page as Server Component and create a Client Component for the list.

export default function ContentList({ contents }: { contents: any[] }) {
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return;
    
    setIsDeleting(id);
    try {
      await deleteContent(id);
      toast.success('Conteúdo excluído');
    } catch (error) {
      toast.error('Erro ao excluir');
    } finally {
      setIsDeleting(null);
    }
  };

  if (contents.length === 0) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum conteúdo encontrado</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Não encontramos nenhum item com os filtros atuais. Tente mudar a busca ou adicione novo conteúdo.
            </p>
            <Link
                href="/dashboard/content/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Plus className="w-4 h-4 mr-2" />
                Criar Conteúdo
            </Link>
        </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Conteúdo</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contents.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        {item.cover_url ? (
                            <img src={item.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Play className="w-5 h-5" />
                            </div>
                        )}
                        {item.media_url && (
                            <button 
                                onClick={() => setPreviewItem(item)}
                                className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Play className="w-6 h-6 text-white drop-shadow-md fill-current" />
                            </button>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">{item.description || 'Sem descrição'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                    ${item.type === 'podcast' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      item.type === 'video' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-purple-50 text-purple-700 border-purple-200'}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                    {item.is_live ? (
                        <span className="inline-flex items-center gap-1.5 text-green-700 text-xs font-medium bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live
                        </span>
                    ) : (
                        <span className="text-gray-500 text-xs font-medium bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                            Offline
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.media_url && (
                        <button
                            onClick={() => setPreviewItem(item)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview"
                        >
                            <Play className="w-4 h-4" />
                        </button>
                    )}
                    <Link
                      href={`/dashboard/content/${item.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting === item.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Excluir"
                    >
                        {isDeleting === item.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PreviewModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={previewItem?.title || ''}
        mediaUrl={previewItem?.media_url || ''}
        type={previewItem?.type || ''}
      />
    </>
  );
}

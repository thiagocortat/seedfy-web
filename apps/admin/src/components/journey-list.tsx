'use client';

import { Plus, Edit, Trash2, Search, Map } from 'lucide-react';
import Link from 'next/link';
import { deleteJourney, toggleJourneyStatus } from '@/actions/journeys';
import { useState } from 'react';
import { toast } from 'sonner';
import { JourneyTemplate } from '@seedfy/shared';

export default function JourneyList({ journeys }: { journeys: JourneyTemplate[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja excluir esta jornada?')) return;
    
    setIsDeleting(id);
    try {
      const result = await deleteJourney(id);
      if (result?.message) {
          toast.error(result.message);
      } else {
          toast.success('Jornada excluída');
      }
    } catch (error) {
      toast.error('Erro ao excluir');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
      if (!id) return;
      setIsToggling(id);
      try {
          const result = await toggleJourneyStatus(id, !currentStatus);
          if (result?.message) {
              toast.error(result.message);
          } else {
              toast.success(`Jornada ${!currentStatus ? 'ativada' : 'desativada'}`);
          }
      } catch (error) {
          toast.error('Erro ao atualizar status');
      } finally {
          setIsToggling(null);
      }
  };

  if (journeys.length === 0) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma jornada encontrada</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Não encontramos nenhuma jornada com os filtros atuais.
            </p>
            <Link
                href="/dashboard/journeys/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Plus className="w-4 h-4 mr-2" />
                Criar Jornada
            </Link>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jornada</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durações</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {journeys.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        {item.cover_image_url ? (
                            <img src={item.cover_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Map className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">{item.description_short}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                      {item.tags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              {tag}
                          </span>
                      ))}
                      {item.tags && item.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                      )}
                  </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex gap-1">
                        {item.durations_supported?.map((d) => (
                            <span key={d} className="text-xs font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                {d}d
                            </span>
                        ))}
                    </div>
                </td>
                <td className="px-6 py-4">
                   <button
                        onClick={() => item.id && handleToggleStatus(item.id, item.is_active)}
                        disabled={isToggling === item.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer
                            ${item.is_active 
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                            }`}
                   >
                        {isToggling === item.id ? (
                             <div className="w-2 h-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                             <span className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        )}
                        {item.is_active ? 'Ativa' : 'Rascunho'}
                   </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/journeys/${item.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                        onClick={() => item.id && handleDelete(item.id)}
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
  );
}

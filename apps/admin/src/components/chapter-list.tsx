'use client';

import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { deleteChapter, reorderChapters } from '@/actions/chapters';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { JourneyChapterTemplate } from '@seedfy/shared';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ 
    chapter, 
    journeyId, 
    handleDelete, 
    isDeleting 
}: { 
    chapter: JourneyChapterTemplate, 
    journeyId: string, 
    handleDelete: (id: string) => void,
    isDeleting: string | null
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: chapter.id || '' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50 bg-white border-b border-gray-100 last:border-0">
        <td className="px-4 py-3 w-10">
            <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
            </button>
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-900 w-24">
            Dia {chapter.day_index}
        </td>
        <td className="px-4 py-3">
            <div className="text-sm font-medium text-gray-900">{chapter.title}</div>
            <div className="text-xs text-gray-500">{chapter.focus}</div>
        </td>
        <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-2">
                <Link
                    href={`/dashboard/journeys/${journeyId}/chapters/${chapter.id}`}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Editar"
                >
                    <Edit className="w-4 h-4" />
                </Link>
                <button 
                    onClick={() => chapter.id && handleDelete(chapter.id)}
                    disabled={isDeleting === chapter.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    title="Excluir"
                >
                    {isDeleting === chapter.id ? (
                        <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                </button>
            </div>
        </td>
    </tr>
  );
}

export default function ChapterList({ 
    chapters: initialChapters, 
    journeyId 
}: { 
    chapters: JourneyChapterTemplate[], 
    journeyId: string 
}) {
  const [chapters, setChapters] = useState(initialChapters);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
      setChapters(initialChapters);
  }, [initialChapters]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este capítulo?')) return;
    
    setIsDeleting(id);
    try {
      const result = await deleteChapter(id, journeyId);
      if (result?.message) {
          toast.error(result.message);
      } else {
          toast.success('Capítulo excluído');
      }
    } catch (error) {
      toast.error('Erro ao excluir');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setIsReordering(true);
      const oldIndex = chapters.findIndex((c) => c.id === active.id);
      const newIndex = chapters.findIndex((c) => c.id === over.id);
      
      const newOrder = arrayMove(chapters, oldIndex, newIndex);
      
      // Optimistic update
      // Update day_index visually immediately
      const optimisticOrder = newOrder.map((c, i) => ({ ...c, day_index: i + 1 }));
      setChapters(optimisticOrder);

      try {
          const orderedIds = optimisticOrder.map(c => c.id).filter(Boolean) as string[];
          await reorderChapters(journeyId, orderedIds);
          toast.success('Ordem atualizada');
      } catch (error) {
          toast.error('Erro ao salvar nova ordem');
          setChapters(initialChapters); // Revert
      } finally {
          setIsReordering(false);
      }
    }
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
                Capítulos
                {isReordering && <span className="ml-2 text-xs text-blue-500 font-normal animate-pulse">Salvando ordem...</span>}
            </h3>
            <Link
                href={`/dashboard/journeys/${journeyId}/chapters/new`}
                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
                <Plus className="w-4 h-4 mr-1.5" />
                Adicionar Capítulo
            </Link>
        </div>

        {chapters.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500 text-sm">
                Nenhum capítulo criado ainda.
            </div>
        ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="w-10"></th>
                                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase w-24">Dia</th>
                                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Título / Foco</th>
                                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <SortableContext 
                            items={chapters.map(c => c.id || '')}
                            strategy={verticalListSortingStrategy}
                        >
                            <tbody className="divide-y divide-gray-200">
                                {chapters.map((chapter) => (
                                    <SortableItem 
                                        key={chapter.id} 
                                        chapter={chapter} 
                                        journeyId={journeyId} 
                                        handleDelete={handleDelete}
                                        isDeleting={isDeleting}
                                    />
                                ))}
                            </tbody>
                        </SortableContext>
                    </table>
                </DndContext>
            </div>
        )}
    </div>
  );
}

'use client';

import { createChapter, updateChapter } from '@/actions/chapters';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { JourneyChapterTemplate } from '@seedfy/shared';
import Link from 'next/link';
import { ChapterPreviewModal } from './chapter-preview-modal';

import { FileUpload } from '@/components/file-upload';

export function ChapterForm({ 
    initialData, 
    journeyId 
}: { 
    initialData?: JourneyChapterTemplate, 
    journeyId: string 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(initialData?.media_url || '');
  const router = useRouter();

  // Controlled state for Preview
  const [data, setData] = useState<Partial<JourneyChapterTemplate>>({
      day_index: initialData?.day_index,
      title: initialData?.title || '',
      focus: initialData?.focus || '',
      narrative: initialData?.narrative || '',
      practice: initialData?.practice || '',
      reflection_prompt: initialData?.reflection_prompt || '',
      prayer: initialData?.prayer || '',
      verse_reference: initialData?.verse_reference || '',
      verse_text: initialData?.verse_text || '',
      media_url: initialData?.media_url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaUpload = (url: string) => {
      setMediaUrl(url);
      setData(prev => ({ ...prev, media_url: url }));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    if (!initialData) {
        formData.append('journey_id', journeyId);
    }
    
    formData.set('media_url', mediaUrl);
    // Auto-detect media type or default to 'video' if URL exists, or null
    // We can't easily know if it is audio or video from URL alone without metadata, 
    // but for now we can assume based on bucket or just generic.
    // Let's assume 'video' for now if not specified, or add a selector.
    // For MVP simplification, if there is a URL, we send it.
    if (mediaUrl) {
         formData.set('media_type', 'video'); // Defaulting to video/audio generic
    }

    try {
        let result;
        if (initialData?.id) {
            result = await updateChapter(initialData.id, formData);
        } else {
            result = await createChapter(formData);
        }

        if (result?.error) {
            const errorMsg = typeof result.error === 'string' 
                ? result.error 
                : Object.values(result.error).flat().join(', ');
            toast.error('Erro ao salvar: ' + errorMsg);
        } else if (result?.message) {
            toast.error(result.message);
        } else {
            toast.success('Capítulo salvo com sucesso!');
            router.push(`/dashboard/journeys/${journeyId}`);
            router.refresh();
        }
    } catch (err) {
        if ((err as Error).message === 'NEXT_REDIRECT') {
            return;
        }
        toast.error('Ocorreu um erro inesperado.');
        console.error(err);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link 
                    href={`/dashboard/journeys/${journeyId}`}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {initialData ? `Editar Capítulo (Dia ${initialData.day_index})` : 'Novo Capítulo'}
                    </h1>
                    <p className="text-gray-500 text-sm">Preencha o conteúdo diário da jornada.</p>
                </div>
            </div>
            
            <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
            >
                  <Smartphone className="w-4 h-4" />
                  Preview Mobile
            </button>
        </div>

        <form action={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dia da Jornada (Índice)</label>
                    <input
                        type="number"
                        name="day_index"
                        value={data.day_index ?? ''}
                        onChange={handleChange}
                        required
                        min={1}
                        placeholder="Ex: 1"
                        className="mt-1 block w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 bg-white placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">O dia sequencial na jornada (1, 2, 3...).</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Título do Capítulo</label>
                    <input
                        name="title"
                        value={data.title}
                        onChange={handleChange}
                        required
                        placeholder="Ex: O Início da Caminhada"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 bg-white placeholder:text-gray-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Foco do Dia</label>
                    <input
                        name="focus"
                        value={data.focus}
                        onChange={handleChange}
                        required
                        placeholder="Ex: Gratidão pelas pequenas coisas"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 bg-white placeholder:text-gray-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Narrativa (Conteúdo Principal)</label>
                    <textarea
                        name="narrative"
                        value={data.narrative}
                        onChange={handleChange}
                        required
                        rows={10}
                        placeholder="Escreva o texto devocional ou explicativo do dia..."
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 placeholder:text-gray-500 font-mono text-sm"
                    />
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-4">
                        <FileUpload
                            bucket="media"
                            path="chapters"
                            label="Mídia do Capítulo (Áudio/Vídeo)"
                            accept="audio/*,video/*"
                            maxSizeMB={50}
                            onUploadComplete={handleMediaUpload}
                        />
                        <input type="hidden" name="media_url" value={mediaUrl} />
                        {mediaUrl && (
                            <div className="mt-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Preview:</label>
                                <video 
                                    src={mediaUrl} 
                                    controls 
                                    className="w-full rounded-lg border border-gray-200 bg-black max-h-[150px]"
                                >
                                    Seu navegador não suporta o elemento de vídeo.
                                </video>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prática (Ação do Dia)</label>
                    <textarea
                        name="practice"
                        value={data.practice}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="O que o usuário deve fazer hoje?"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 placeholder:text-gray-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Prompt de Reflexão</label>
                    <textarea
                        name="reflection_prompt"
                        value={data.reflection_prompt}
                        onChange={handleChange}
                        required
                        rows={3}
                        placeholder="Pergunta para o usuário refletir..."
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 placeholder:text-gray-500"
                    />
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Espiritualidade (Opcional)</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Oração</label>
                            <textarea
                                name="prayer"
                                value={data.prayer || ''}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Sugestão de oração..."
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 placeholder:text-gray-500"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Ref. Versículo</label>
                                <input
                                    name="verse_reference"
                                    value={data.verse_reference || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Salmos 23:1"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 bg-white placeholder:text-gray-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Texto do Versículo</label>
                                <textarea
                                    name="verse_text"
                                    value={data.verse_text || ''}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="O Senhor é meu pastor..."
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 placeholder:text-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
            Cancelar
            </button>
            <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Capítulo')}
            </button>
        </div>
        </form>

        <ChapterPreviewModal 
            isOpen={isPreviewOpen} 
            onClose={() => setIsPreviewOpen(false)} 
            data={data} 
        />
    </div>
  );
}

'use client';

import { createContent, updateContent } from '@/actions/content';
import { FileUpload } from '@/components/file-upload';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ContentForm({ initialData }: { initialData?: any }) {
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_url || '');
  const [mediaUrl, setMediaUrl] = useState(initialData?.media_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
        let result;
        if (initialData?.id) {
            result = await updateContent(initialData.id, formData);
        } else {
            result = await createContent(formData);
        }

        if (result?.error) {
            // Check if error is an object (field errors) or string
            const errorMsg = typeof result.error === 'string' 
                ? result.error 
                : Object.values(result.error).flat().join(', ');
            toast.error('Erro ao salvar: ' + errorMsg);
        } else if (result?.message) {
            toast.error(result.message);
        } else {
            toast.success('Conteúdo salvo com sucesso!');
        }
    } catch (err) {
        // Ignora erro de redirect do Next.js
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
    <form action={handleSubmit} className="space-y-8 max-w-4xl bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                name="title"
                defaultValue={initialData?.title}
                required
                placeholder="Ex: Podcast #01 - Fé e Esperança"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-black bg-white placeholder:text-gray-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Conteúdo</label>
                <select
                name="type"
                defaultValue={initialData?.type || 'podcast'}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-black bg-white"
                >
                <option value="podcast">Podcast (Áudio)</option>
                <option value="video">Vídeo</option>
                <option value="music">Música</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                name="description"
                defaultValue={initialData?.description}
                rows={4}
                placeholder="Breve descrição do conteúdo..."
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 placeholder:text-gray-500"
                />
            </div>
            
             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <input
                type="checkbox"
                name="is_live"
                id="is_live"
                defaultChecked={initialData?.is_live}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="is_live" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                Marcar como Live (Ao Vivo)
                </label>
            </div>
        </div>

        <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                <FileUpload
                    bucket="covers"
                    path="content"
                    label="Imagem de Capa"
                    accept="image/*"
                    maxSizeMB={5}
                    onUploadComplete={(url) => setCoverUrl(url)}
                />
                <input type="hidden" name="cover_url" value={coverUrl} />
                {coverUrl ? (
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="aspect-video w-full rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
                        Sem capa
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                <FileUpload
                    bucket="media"
                    path="content"
                    label="Arquivo de Mídia (Áudio/Vídeo)"
                    accept="audio/*,video/*"
                    maxSizeMB={100}
                    onUploadComplete={(url) => setMediaUrl(url)}
                />
                <input type="hidden" name="media_url" value={mediaUrl} />
                {mediaUrl && (
                    <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Preview:</label>
                        {/* Simple detection based on extension or generic player */}
                        <video 
                            src={mediaUrl} 
                            controls 
                            className="w-full rounded-lg border border-gray-200 bg-black max-h-[200px]"
                        >
                            Seu navegador não suporta o elemento de vídeo.
                        </video>
                    </div>
                )}
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
          {initialData ? 'Salvar Alterações' : 'Criar Conteúdo'}
        </button>
      </div>
    </form>
  );
}

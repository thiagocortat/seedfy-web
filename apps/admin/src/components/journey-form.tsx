'use client';

import { createJourney, updateJourney } from '@/actions/journeys';
import { FileUpload } from '@/components/file-upload';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { JourneyTemplate } from '@seedfy/shared';

export function JourneyForm({ initialData }: { initialData?: JourneyTemplate }) {
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_image_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Manage tags state
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [currentTag, setCurrentTag] = useState('');

  // Manage durations state
  const [durations, setDurations] = useState<number[]>(initialData?.durations_supported || [7, 14, 21]);
  const [currentDuration, setCurrentDuration] = useState('');
  
  // Manage active state explicitly to ensure we send false when unchecked
  const [isActive, setIsActive] = useState(initialData?.is_active || false);

  const router = useRouter();

  const handleAddTag = () => {
      if (currentTag.trim() && !tags.includes(currentTag.trim())) {
          setTags([...tags, currentTag.trim()]);
          setCurrentTag('');
      }
  };

  const handleRemoveTag = (tag: string) => {
      setTags(tags.filter(t => t !== tag));
  };

  const handleAddDuration = () => {
      const d = parseInt(currentDuration);
      if (!isNaN(d) && d > 0 && !durations.includes(d)) {
          setDurations([...durations, d].sort((a, b) => a - b));
          setCurrentDuration('');
      }
  };

  const handleRemoveDuration = (d: number) => {
      setDurations(durations.filter(x => x !== d));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    // Append complex fields
    formData.set('tags', JSON.stringify(tags));
    formData.set('durations_supported', JSON.stringify(durations));
    formData.set('cover_image_url', coverUrl);
    
    // Explicitly set is_active. 
    // We send 'true' or 'false' as string, server action should handle it.
    // However, standard checkboxes send 'on' or nothing.
    // Since we are using a controlled state for UI, let's enforce the value in formData.
    formData.set('is_active', String(isActive));

    try {
        let result;
        if (initialData?.id) {
            result = await updateJourney(initialData.id, formData);
        } else {
            result = await createJourney(formData);
        }

        if (result?.error) {
            const errorMsg = typeof result.error === 'string' 
                ? result.error 
                : Object.values(result.error).flat().join(', ');
            toast.error('Erro ao salvar: ' + errorMsg);
        } else if (result?.message) {
            toast.error(result.message);
        } else {
            toast.success('Jornada salva com sucesso!');
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
    <form action={handleSubmit} className="space-y-8 max-w-5xl bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Título da Jornada</label>
                <input
                    name="title"
                    defaultValue={initialData?.title}
                    required
                    placeholder="Ex: Jornada da Gratidão"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 bg-white placeholder:text-gray-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Descrição Curta (App Card)</label>
                <textarea
                    name="description_short"
                    defaultValue={initialData?.description_short}
                    required
                    rows={2}
                    placeholder="Uma frase impactante que aparece na listagem..."
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 placeholder:text-gray-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Descrição Longa (Detalhes)</label>
                <textarea
                    name="description_long"
                    defaultValue={initialData?.description_long || ''}
                    rows={5}
                    placeholder="Explique o propósito e o que esperar desta jornada..."
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 placeholder:text-gray-500"
                />
            </div>

            {/* Tags Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <div className="flex gap-2 mt-1">
                    <input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Adicionar tag..."
                        className="block flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 placeholder:text-gray-500"
                    />
                    <button 
                        type="button" 
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        Adicionar
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-100">
                            {tag}
                            <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                        </span>
                    ))}
                </div>
            </div>
            
            {/* Durations Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Durações Suportadas (dias)</label>
                <p className="text-xs text-gray-500 mb-2">Quantos dias essa jornada pode durar? (Ex: 7, 14, 21)</p>
                <div className="flex gap-2 mt-1">
                    <input
                        type="number"
                        value={currentDuration}
                        onChange={(e) => setCurrentDuration(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDuration())}
                        placeholder="Ex: 7"
                        className="block w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border text-gray-900 placeholder:text-gray-500"
                    />
                    <button 
                        type="button" 
                        onClick={handleAddDuration}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        Adicionar
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {durations.map(d => (
                        <span key={d} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700 border border-purple-100">
                            {d} dias
                            <button type="button" onClick={() => handleRemoveDuration(d)} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
                        </span>
                    ))}
                    {durations.length === 0 && <span className="text-sm text-red-500">Adicione pelo menos uma duração.</span>}
                </div>
            </div>
        </div>

        {/* Right Column: Media & Status */}
        <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                <FileUpload
                    bucket="covers"
                    path="journeys"
                    label="Capa da Jornada"
                    accept="image/*"
                    maxSizeMB={5}
                    onUploadComplete={(url) => setCoverUrl(url)}
                />
                <input type="hidden" name="cover_image_url" value={coverUrl} />
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

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                 <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {isActive ? 'Ativa' : 'Rascunho'}
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="is_active"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="is_active" className="text-sm text-gray-600 cursor-pointer select-none">
                        Ativar Jornada (Visível no App)
                    </label>
                 </div>
                 <p className="text-xs text-gray-500 mt-2">
                    Para ativar, a jornada deve ter capítulos suficientes para a maior duração suportada.
                 </p>
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
          {initialData ? 'Salvar Alterações' : 'Criar Jornada'}
        </button>
      </div>
    </form>
  );
}

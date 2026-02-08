import { JourneyAIOutput, AIChapter, Briefing } from '@/lib/ai-schemas';
import { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, AlertTriangle, Check, Save } from 'lucide-react';
import { toast } from 'sonner';

interface StepReviewProps {
  initialData: JourneyAIOutput;
  briefing: Briefing;
  onSave: (data: JourneyAIOutput, activate: boolean) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function StepReview({ initialData, briefing, onSave, onBack, onCancel }: StepReviewProps) {
  const [data, setData] = useState<JourneyAIOutput>(initialData);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);

  const handleChapterChange = (dayIndex: number, field: keyof AIChapter, value: string) => {
    setData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c) =>
        c.day_index === dayIndex ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleJourneyChange = (field: keyof typeof data.journey, value: any) => {
    setData((prev) => ({
      ...prev,
      journey: { ...prev.journey, [field]: value },
    }));
  };

  const handleRegenerateChapter = async (dayIndex: number) => {
    setRegeneratingDay(dayIndex);
    try {
      const currentChapter = data.chapters.find(c => c.day_index === dayIndex);
      
      const response = await fetch('/api/admin/journeys/ai-regenerate-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefing,
          day_index: dayIndex,
          current_content: currentChapter,
          instruction: "Reescreva com base no original, melhorando a fluidez.",
        }),
      });

      if (!response.ok) throw new Error('Falha ao regenerar');
      
      const newChapter = await response.json();
      
      setData((prev) => ({
        ...prev,
        chapters: prev.chapters.map((c) =>
          c.day_index === dayIndex ? { ...c, ...newChapter } : c
        ),
      }));
      
      toast.success(`Dia ${dayIndex} regenerado!`);
    } catch (error) {
      toast.error('Erro ao regenerar capítulo.');
      console.error(error);
    } finally {
      setRegeneratingDay(null);
    }
  };

  const isRisk = data.safety.risk_flags.some(f => f !== 'none');

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto pr-2 space-y-8">
        
        {/* Safety Warning */}
        {isRisk && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Atenção: Conteúdo Sensível Detectado</h4>
              <p className="text-sm text-yellow-700 mt-1">
                A IA sinalizou possíveis riscos ({data.safety.risk_flags.join(', ')}). 
                Revise cuidadosamente antes de publicar. A ativação direta pode estar bloqueada.
              </p>
            </div>
          </div>
        )}

        {/* Journey Details */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Metadados da Jornada</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Título</label>
              <input
                value={data.journey.title}
                onChange={(e) => handleJourneyChange('title', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Descrição Curta</label>
              <input
                value={data.journey.description_short}
                onChange={(e) => handleJourneyChange('description_short', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Sugestão de Capa (Query)</label>
              <div className="flex gap-2">
                <input
                    value={data.journey.cover_image_query}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 text-gray-500 text-sm border p-2"
                />
                <button 
                    type="button"
                    onClick={() => {
                        navigator.clipboard.writeText(data.journey.cover_image_query);
                        toast.success('Copiado!');
                    }}
                    className="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-50"
                >
                    Copiar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Capítulos ({data.chapters.length})</h3>
          </div>

          <div className="space-y-2">
            {data.chapters.map((chapter) => {
              const isExpanded = expandedDay === chapter.day_index;
              const isRegenerating = regeneratingDay === chapter.day_index;

              return (
                <div key={chapter.day_index} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : chapter.day_index)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                        {chapter.day_index}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{chapter.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{chapter.focus}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-gray-200 space-y-4 bg-gray-50/50">
                      {isRegenerating ? (
                         <div className="py-8 text-center text-gray-500 flex flex-col items-center gap-2">
                             <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                             Regenerando...
                         </div>
                      ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Título</label>
                                <input
                                    value={chapter.title}
                                    onChange={(e) => handleChapterChange(chapter.day_index, 'title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2"
                                />
                                </div>
                                
                                <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Foco</label>
                                <input
                                    value={chapter.focus}
                                    onChange={(e) => handleChapterChange(chapter.day_index, 'focus', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2"
                                />
                                </div>

                                <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Narrativa</label>
                                <textarea
                                    rows={6}
                                    value={chapter.narrative}
                                    onChange={(e) => handleChapterChange(chapter.day_index, 'narrative', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2"
                                />
                                </div>

                                <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Prática</label>
                                <textarea
                                    rows={2}
                                    value={chapter.practice}
                                    onChange={(e) => handleChapterChange(chapter.day_index, 'practice', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2"
                                />
                                </div>

                                <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Pergunta de Reflexão</label>
                                <textarea
                                    rows={2}
                                    value={chapter.reflection_prompt}
                                    onChange={(e) => handleChapterChange(chapter.day_index, 'reflection_prompt', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2"
                                />
                                </div>
                                
                                {(chapter.prayer !== null) && (
                                    <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Oração</label>
                                    <textarea
                                        rows={3}
                                        value={chapter.prayer || ''}
                                        onChange={(e) => handleChapterChange(chapter.day_index, 'prayer', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2"
                                    />
                                    </div>
                                )}

                                {(chapter.verse_text !== null) && (
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-1">
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Ref. Versículo</label>
                                            <input
                                                value={chapter.verse_reference || ''}
                                                onChange={(e) => handleChapterChange(chapter.day_index, 'verse_reference', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Texto Versículo</label>
                                            <textarea
                                                rows={2}
                                                value={chapter.verse_text || ''}
                                                onChange={(e) => handleChapterChange(chapter.day_index, 'verse_text', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => handleRegenerateChapter(chapter.day_index)}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <RefreshCw className="w-3 h-3" /> Regenerar Dia {chapter.day_index}
                                </button>
                            </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4 bg-white z-10">
        <div className="flex gap-2">
            <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
            Cancelar
            </button>
            <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
            Voltar
            </button>
        </div>
        
        <div className="flex gap-2">
            <button
            onClick={() => onSave(data, false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
            <Save className="w-4 h-4" />
            Salvar Rascunho
            </button>
            
            <button
            onClick={() => onSave(data, true)}
            disabled={isRisk}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title={isRisk ? "Revise os riscos antes de ativar" : ""}
            >
            <Check className="w-4 h-4" />
            Salvar e Ativar
            </button>
        </div>
      </div>
    </div>
  );
}

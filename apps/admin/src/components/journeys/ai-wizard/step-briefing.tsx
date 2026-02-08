import { Briefing } from '@/lib/ai-schemas';
import { useState } from 'react';

interface StepBriefingProps {
  initialData?: Partial<Briefing>;
  onGenerate: (data: Briefing) => void;
  onCancel: () => void;
}

export function StepBriefing({ initialData, onGenerate, onCancel }: StepBriefingProps) {
  const [formData, setFormData] = useState<Partial<Briefing>>({
    theme: '',
    tone: 'Acolhedor',
    durations_supported: [7, 14, 21],
    include_prayer: true,
    include_verses: true,
    avoid_denomination: true,
    avoid_polemics: true,
    language: 'pt-BR',
    ...initialData,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.theme) return;
    
    // Default values if missing
    const finalData: Briefing = {
      theme: formData.theme!,
      tone: formData.tone as any || 'Acolhedor',
      goal: formData.goal || [],
      audience: formData.audience as any,
      language: 'pt-BR',
      durations_supported: formData.durations_supported || [7, 14, 21],
      max_days: Math.max(...(formData.durations_supported || [21])),
      include_prayer: formData.include_prayer ?? true,
      include_verses: formData.include_verses ?? true,
      avoid_denomination: formData.avoid_denomination ?? true,
      avoid_polemics: formData.avoid_polemics ?? true,
      reference_bible: formData.reference_bible,
      tags_suggested: formData.tags_suggested || [],
    };

    onGenerate(finalData);
  };

  const toggleDuration = (days: number) => {
    const current = formData.durations_supported || [];
    const next = current.includes(days)
      ? current.filter((d) => d !== days)
      : [...current, days].sort((a, b) => a - b);
    
    if (next.length === 0) return; // Must have at least one
    setFormData({ ...formData, durations_supported: next });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tema / Assunto *</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            placeholder="Ex: Ansiedade, Gratidão, Identidade..."
            value={formData.theme || ''}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tom</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
            >
              <option value="Acolhedor">Acolhedor</option>
              <option value="Direto">Direto</option>
              <option value="Contemplativo">Contemplativo</option>
              <option value="Didático">Didático</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Público-alvo</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={formData.audience || ''}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
            >
              <option value="">Geral</option>
              <option value="Novos convertidos">Novos convertidos</option>
              <option value="Jovens">Jovens</option>
              <option value="Líderes">Líderes</option>
              <option value="Casais">Casais</option>
              <option value="Mulheres">Mulheres</option>
              <option value="Homens">Homens</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Durações Suportadas</label>
          <div className="flex gap-3">
            {[7, 14, 21].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => toggleDuration(days)}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  formData.durations_supported?.includes(days)
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {days} dias
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            A IA gerará conteúdo até o maior dia selecionado ({Math.max(...(formData.durations_supported || [21]))} dias).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
             <label className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 className="rounded text-blue-600 focus:ring-blue-500"
                 checked={formData.include_prayer}
                 onChange={(e) => setFormData({ ...formData, include_prayer: e.target.checked })}
               />
               <span className="text-sm text-gray-700">Incluir Oração</span>
             </label>
             <label className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 className="rounded text-blue-600 focus:ring-blue-500"
                 checked={formData.include_verses}
                 onChange={(e) => setFormData({ ...formData, include_verses: e.target.checked })}
               />
               <span className="text-sm text-gray-700">Incluir Versículos</span>
             </label>
           </div>
           
           <div className="space-y-2">
             <label className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 className="rounded text-blue-600 focus:ring-blue-500"
                 checked={formData.avoid_denomination}
                 onChange={(e) => setFormData({ ...formData, avoid_denomination: e.target.checked })}
               />
               <span className="text-sm text-gray-700">Evitar Denominacionalismo</span>
             </label>
             <label className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 className="rounded text-blue-600 focus:ring-blue-500"
                 checked={formData.avoid_polemics}
                 onChange={(e) => setFormData({ ...formData, avoid_polemics: e.target.checked })}
               />
               <span className="text-sm text-gray-700">Evitar Polêmicas</span>
             </label>
           </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Referências Bíblicas (Opcional)</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            placeholder="Ex: Salmos, Evangelho de João..."
            value={formData.reference_bible || ''}
            onChange={(e) => setFormData({ ...formData, reference_bible: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.theme}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Gerar Jornada com IA
        </button>
      </div>
    </div>
  );
}

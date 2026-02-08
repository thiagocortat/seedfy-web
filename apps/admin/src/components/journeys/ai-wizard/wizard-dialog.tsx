'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { Briefing, JourneyAIOutput } from '@/lib/ai-schemas';
import { StepBriefing } from './step-briefing';
import { StepGenerating } from './step-generating';
import { StepReview } from './step-review';
import { saveAIJourney } from '@/actions/journeys';

interface WizardDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WizardDialog({ isOpen, onClose }: WizardDialogProps) {
  const [step, setStep] = useState<'briefing' | 'generating' | 'review'>('briefing');
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [generatedData, setGeneratedData] = useState<JourneyAIOutput | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (briefingData: Briefing) => {
    setBriefing(briefingData);
    setStep('generating');
    
    try {
      const response = await fetch('/api/admin/journeys/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefing: briefingData }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('AI Generation Error:', data);
        throw new Error(data.error || data.details || 'Erro na geração');
      }
      
      setGeneratedData(data);
      setStep('review');
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao gerar jornada: ' + error.message);
      setStep('briefing');
    }
  };

  const handleSave = async (data: JourneyAIOutput, isActive: boolean) => {
    try {
        const result = await saveAIJourney(data, isActive);
        if (result.error) {
            throw new Error(result.error);
        }
        toast.success(isActive ? 'Jornada criada e ativada!' : 'Jornada salva como rascunho!');
        onClose();
        // Reset state
        setStep('briefing');
        setBriefing(null);
        setGeneratedData(null);
    } catch (error: any) {
        toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Gerar Jornada com IA</h2>
                <p className="text-xs text-gray-500">Crie jornadas completas em segundos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {step === 'briefing' && (
            <StepBriefing 
                onGenerate={handleGenerate} 
                onCancel={onClose} 
            />
          )}

          {step === 'generating' && (
            <StepGenerating onCancel={() => setStep('briefing')} />
          )}

          {step === 'review' && generatedData && briefing && (
            <StepReview
              initialData={generatedData}
              briefing={briefing}
              onSave={handleSave}
              onBack={() => setStep('briefing')}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

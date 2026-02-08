import { Loader2 } from 'lucide-react';

interface StepGeneratingProps {
  onCancel: () => void;
}

export function StepGenerating({ onCancel }: StepGeneratingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-white p-4 rounded-full shadow-lg border border-blue-100">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">Gerando sua Jornada...</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          A IA está criando a estrutura, capítulos e conteúdo devocional. Isso pode levar cerca de 30-60 segundos.
        </p>
      </div>

      <div className="w-full max-w-md bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-blue-600 animate-progress origin-left w-full" style={{ animationDuration: '30s' }}></div>
      </div>

      <button
        onClick={onCancel}
        className="text-sm text-gray-400 hover:text-gray-600 underline"
      >
        Cancelar
      </button>
    </div>
  );
}

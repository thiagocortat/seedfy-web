'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { WizardDialog } from '@/components/journeys/ai-wizard/wizard-dialog';

export function AiTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors shadow-sm font-medium"
      >
        <Sparkles className="w-5 h-5" />
        Gerar com IA
      </button>
      <WizardDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

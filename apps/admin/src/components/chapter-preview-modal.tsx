'use client';

import { X } from 'lucide-react';
import { JourneyChapterTemplate } from '@seedfy/shared';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Partial<JourneyChapterTemplate>;
}

export function ChapterPreviewModal({ isOpen, onClose, data }: PreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-8 border-gray-900 flex flex-col">
        {/* Status Bar Fake */}
        <div className="h-12 bg-gray-900 w-full flex items-center justify-center text-white text-xs font-medium relative shrink-0">
             <div className="w-32 h-6 bg-black rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2"></div>
             <span className="mt-2">Preview Mobile</span>
             <button 
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50 no-scrollbar">
            {/* Header / Hero */}
            <div className="bg-blue-600 text-white p-6 pb-10 rounded-b-[32px]">
                <div className="text-xs font-medium opacity-80 uppercase tracking-wider mb-2">
                    Dia {data.day_index || 1}
                </div>
                <h2 className="text-2xl font-bold leading-tight">
                    {data.title || 'Título do Capítulo'}
                </h2>
                <div className="mt-4 inline-flex bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    🎯 {data.focus || 'Foco do dia'}
                </div>
            </div>

            <div className="px-5 -mt-6 space-y-6 pb-8">
                {/* Narrative Card */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Leitura</h3>
                    <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap font-serif">
                        {data.narrative || 'Conteúdo da narrativa...'}
                    </div>
                </div>

                {/* Spirituality Card (Optional) */}
                {(data.verse_text || data.prayer) && (
                    <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
                        {data.verse_text && (
                            <div className="mb-4">
                                <p className="text-purple-900 italic font-serif text-sm">"{data.verse_text}"</p>
                                <p className="text-purple-700 text-xs font-bold mt-2 text-right">{data.verse_reference}</p>
                            </div>
                        )}
                        {data.prayer && (
                             <div>
                                <h3 className="text-xs font-bold text-purple-900 uppercase mb-2">Oração</h3>
                                <p className="text-purple-800 text-sm leading-relaxed">{data.prayer}</p>
                             </div>
                        )}
                    </div>
                )}

                {/* Practice Card */}
                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                    <h3 className="text-sm font-bold text-orange-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                        ⚡ Prática
                    </h3>
                    <p className="text-orange-800 text-sm leading-relaxed">
                        {data.practice || 'Prática do dia...'}
                    </p>
                </div>

                {/* Reflection Card */}
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                     <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                        🤔 Reflexão
                    </h3>
                    <p className="text-blue-800 text-sm font-medium mb-4">
                        {data.reflection_prompt || 'Pergunta para reflexão...'}
                    </p>
                    <div className="bg-white rounded-xl h-24 border border-blue-200 w-full p-3 text-sm text-gray-400">
                        Sua resposta aqui...
                    </div>
                </div>

                {/* Complete Button Fake */}
                <div className="pt-2">
                    <button className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg">
                        Concluir Capítulo
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

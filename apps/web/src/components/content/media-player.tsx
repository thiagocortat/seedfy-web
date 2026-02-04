'use client';

import { useState } from 'react';
import { ContentItem } from '@seedfy/shared';
import { Music, AlertCircle } from 'lucide-react';

export function MediaPlayer({ item }: { item: ContentItem }) {
  const [error, setError] = useState<string | null>(null);

  if (!item.media_url) {
    return (
      <div className="w-full p-8 bg-gray-50 border border-gray-200 border-dashed rounded-xl flex items-center justify-center text-gray-500">
        Mídia indisponível
      </div>
    );
  }

  const handleMediaError = () => {
    setError('Não foi possível carregar a mídia. Verifique sua conexão ou tente novamente mais tarde.');
  };

  if (error) {
    return (
      <div className="w-full p-8 bg-red-50 border border-red-100 rounded-xl flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-red-900 font-medium mb-1">Erro na reprodução</h3>
        <p className="text-red-600 text-sm max-w-md">{error}</p>
      </div>
    );
  }

  if (item.type === 'video') {
    return (
      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative group">
        <video 
          src={item.media_url} 
          controls 
          className="w-full h-full" 
          poster={item.cover_url || undefined}
          controlsList="nodownload"
          onError={handleMediaError}
        >
          Seu navegador não suporta o elemento de vídeo.
        </video>
      </div>
    );
  }

  // Audio/Music
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
      <div className="w-full md:w-64 aspect-square flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative shadow-md">
        {item.cover_url ? (
          <img 
            src={item.cover_url} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
            <Music className="w-20 h-20" />
          </div>
        )}
      </div>
      <div className="flex-1 w-full text-center md:text-left">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.title}</h3>
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">{item.type}</p>
        </div>
        <audio 
          src={item.media_url} 
          controls 
          className="w-full"
          controlsList="nodownload"
          onError={handleMediaError}
        >
          Seu navegador não suporta o elemento de áudio.
        </audio>
      </div>
    </div>
  );
}

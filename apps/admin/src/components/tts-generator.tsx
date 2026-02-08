'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Loader2, Play, Check, Trash2, RefreshCw, Volume2 } from 'lucide-react';
import { KokoroVoicesResponse, TTSGenerateResponse, TTSAcceptResponse } from '@/lib/tts-types';

interface TTSGeneratorProps {
  onAccept: (url: string) => void;
  onCancel?: () => void;
  type?: string; // 'podcast', 'music'
  contentId?: string;
}

export function TTSGenerator({ onAccept, onCancel, type = 'podcast', contentId }: TTSGeneratorProps) {
  const [voices, setVoices] = useState<string[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('');
  const [speed, setSpeed] = useState(1.0);
  
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tempPath, setTempPath] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchVoices();
  }, []);

  useEffect(() => {
    if (previewUrl && audioRef.current && !isAccepted) {
        audioRef.current.load();
    }
  }, [previewUrl, isAccepted]);

  const fetchVoices = async () => {
    try {
      const res = await fetch('/api/admin/content/tts/voices');
      const data: KokoroVoicesResponse = await res.json();
      if (data.voices && Array.isArray(data.voices)) {
        setVoices(data.voices);
        if (data.voices.length > 0) setVoice(data.voices[0]);
      } else {
          // Fallback voices if API fails or returns empty
          setVoices(['af_bella', 'af_sky', 'af_sarah', 'am_adam']);
          setVoice('af_bella');
      }
    } catch (error) {
      console.error('Failed to fetch voices', error);
      toast.error('Erro ao carregar vozes, usando lista padrão');
      setVoices(['af_bella', 'af_sky', 'af_sarah', 'am_adam']);
      setVoice('af_bella');
    } finally {
      setLoadingVoices(false);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return toast.error('Digite um texto');
    if (!voice) return toast.error('Selecione uma voz');

    setGenerating(true);
    setPreviewUrl(null);
    setTempPath(null);
    setIsAccepted(false);

    try {
      const res = await fetch('/api/admin/content/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, speed })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na geração');
      }

      const data: TTSGenerateResponse = await res.json();
      setPreviewUrl(data.temp_audio_url);
      setTempPath(data.temp_storage_path);
      toast.success('Áudio gerado! Confira o preview.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = async () => {
    if (!tempPath) return;
    setAccepting(true);
    try {
      const res = await fetch('/api/admin/content/tts/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_storage_path: tempPath, type, contentId })
      });

      if (!res.ok) throw new Error('Falha ao aceitar áudio');

      const data: TTSAcceptResponse = await res.json();
      onAccept(data.final_media_url);
      setIsAccepted(true);
      // We don't toast success here, let the parent form handle the "file selected" state
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleDiscard = () => {
    setPreviewUrl(null);
    setTempPath(null);
    setIsAccepted(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Voz</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            disabled={loadingVoices || generating}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white"
          >
            {loadingVoices ? (
                <option>Carregando...</option>
            ) : (
                voices.map((v) => (
                    <option key={v} value={v}>{v}</option>
                ))
            )}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Velocidade: {speed}x
          </label>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            disabled={generating}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0.8x</span>
            <span>1.0x</span>
            <span>1.2x</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            Texto / Roteiro
            <span className={`float-right text-xs ${text.length > 6000 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {text.length}/6000
            </span>
        </label>
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={generating}
            rows={6}
            placeholder="Digite o texto para converter em áudio..."
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border placeholder:text-gray-400"
        />
      </div>

      {!previewUrl ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !text || text.length > 6000}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando Áudio...
                </>
            ) : (
                <>
                    <Volume2 className="w-4 h-4" />
                    Gerar Áudio
                </>
            )}
          </button>
      ) : isAccepted ? (
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 space-y-4 text-center">
            <div className="flex flex-col items-center justify-center text-green-700 gap-2">
                <div className="bg-green-100 p-3 rounded-full">
                    <Check className="w-6 h-6" />
                </div>
                <span className="font-medium">Áudio Aceito e Vinculado!</span>
            </div>
            <button 
                type="button"
                onClick={() => { setPreviewUrl(null); setTempPath(null); setIsAccepted(false); }}
                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
                Gerar novo áudio (substituir atual)
            </button>
        </div>
      ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
              <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Preview Gerado</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {voice} • {speed}x
                  </span>
              </div>
              
              <audio 
                ref={audioRef}
                controls 
                className="w-full h-10" 
                src={previewUrl}
              >
                  Seu navegador não suporta áudio.
              </audio>

              <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={accepting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                      {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Aceitar Áudio
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={accepting}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
                  >
                      <Trash2 className="w-4 h-4" />
                      Descartar
                  </button>
              </div>
              <div className="text-center">
                <button 
                    type="button"
                    onClick={() => { setPreviewUrl(null); setTempPath(null); }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                    Gerar novamente com outros parâmetros
                </button>
              </div>
          </div>
      )}
    </div>
  );
}

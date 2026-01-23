'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mediaUrl: string;
  type: string;
}

export function PreviewModal({ isOpen, onClose, title, mediaUrl, type }: PreviewModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/50 rounded-xl shadow-2xl p-0 w-full max-w-2xl bg-white overflow-hidden"
      onClose={onClose}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 truncate pr-4">{title}</h3>
        <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      <div className="p-0 bg-black flex items-center justify-center min-h-[300px]">
        {type === 'music' || type === 'podcast' ? (
          <audio controls className="w-full max-w-md" src={mediaUrl}>
            Seu navegador não suporta áudio.
          </audio>
        ) : (
          <video controls className="w-full max-h-[70vh]" src={mediaUrl}>
            Seu navegador não suporta vídeo.
          </video>
        )}
      </div>

      <div className="p-4 bg-gray-50 text-sm text-gray-500 text-right">
        <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
          Abrir original em nova aba
        </a>
      </div>
    </dialog>
  );
}

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
      className="backdrop:bg-black/80 rounded-xl shadow-2xl p-0 w-full max-w-2xl bg-card text-card-foreground border border-border overflow-hidden"
      onClose={onClose}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground truncate pr-4">{title}</h3>
        <button onClick={handleClose} className="p-1 hover:bg-muted rounded-full transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
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

      <div className="p-4 bg-muted text-sm text-muted-foreground text-right">
        <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
          Abrir original em nova aba
        </a>
      </div>
    </dialog>
  );
}

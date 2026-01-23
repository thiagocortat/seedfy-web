'use client';

import { createBrowserClient } from '@seedfy/shared';
import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, X, Check, Loader2 } from 'lucide-react';

interface UploadProps {
  bucket: string;
  path: string;
  onUploadComplete: (url: string) => void;
  accept?: string;
  label: string;
  maxSizeMB?: number;
}

export function FileUpload({ 
  bucket, 
  path, 
  onUploadComplete, 
  accept, 
  label,
  maxSizeMB = 50 
}: UploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const supabase = createBrowserClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB`);
        e.target.value = ''; // Reset input
        return;
      }

      setUploading(true);
      setFileName(file.name);

      const fileExt = file.name.split('.').pop();
      const uniqueId = Math.random().toString(36).substring(2);
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `${path}/${uniqueId}_${cleanFileName}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      
      onUploadComplete(data.publicUrl);
      toast.success('Upload concluído com sucesso!');
    } catch (error: any) {
      console.error(error);
      toast.error('Erro no upload: ' + error.message);
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <label className={`
          flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed cursor-pointer transition-colors
          ${uploading ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-blue-500'}
        `}>
          <input
            type="file"
            accept={accept}
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <Upload className="w-5 h-5 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {uploading ? 'Enviando...' : 'Selecionar arquivo'}
          </span>
        </label>

        {fileName && !uploading && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <Check className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{fileName}</span>
          </div>
        )}
        
        <span className="text-xs text-gray-400">
            Máx: {maxSizeMB}MB
        </span>
      </div>
    </div>
  );
}

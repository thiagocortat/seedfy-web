'use client';

import { createBrowserClient } from '@seedfy/shared';
import { useState } from 'react';
import { Upload, X } from 'lucide-react';

export function ImageUpload({ 
  value, 
  onChange, 
  bucket = 'church-posts' 
}: { 
  value?: string | null; 
  onChange: (url: string) => void;
  bucket?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const supabase = createBrowserClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onChange(data.publicUrl);
    } catch (error) {
      alert('Error uploading avatar!');
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
        <img src={value} alt="Upload preview" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors bg-gray-50 hover:bg-blue-50/10 flex flex-col items-center justify-center gap-2 cursor-pointer relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      {uploading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      ) : (
        <>
          <div className="p-3 bg-white rounded-full shadow-sm">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-gray-900">Clique para upload</span>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF até 10MB</p>
          </div>
        </>
      )}
    </div>
  );
}

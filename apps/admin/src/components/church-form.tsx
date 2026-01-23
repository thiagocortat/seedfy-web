'use client';

import { createChurch, updateChurch } from '@/actions/churches';
import { FileUpload } from '@/components/file-upload';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ChurchForm({ initialData }: { initialData?: any }) {
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || '');
  const router = useRouter();

  return (
    <form action={async (formData) => {
        if (initialData?.id) {
            await updateChurch(initialData.id, formData);
        } else {
            await createChurch(formData);
        }
    }} className="space-y-6 max-w-2xl bg-white p-6 rounded-xl border border-gray-200">
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome da Igreja</label>
        <input
          name="name"
          defaultValue={initialData?.name}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Cidade</label>
            <input
            name="city"
            defaultValue={initialData?.city}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <input
            name="state"
            defaultValue={initialData?.state}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
        </div>
      </div>

      <div className="space-y-4 border-t border-gray-100 pt-4">
        <FileUpload
            bucket="churches"
            path="logos"
            label="Logo da Igreja"
            accept="image/*"
            onUploadComplete={(url) => setLogoUrl(url)}
        />
        <input type="hidden" name="logo_url" value={logoUrl} />
        {logoUrl && (
            <img src={logoUrl} alt="Preview" className="h-24 w-24 object-contain rounded-lg border border-gray-200 p-2" />
        )}
      </div>

      <div className="pt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}

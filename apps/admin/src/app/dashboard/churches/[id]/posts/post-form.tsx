'use client';

import { createChurchPost, updateChurchPost } from '../../../../../actions/church-posts';
import { ChurchPost } from '@seedfy/shared';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '../../../../../components/image-upload';

export default function PostForm({ 
  churchId, 
  post 
}: { 
  churchId: string; 
  post?: ChurchPost;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const [formData, setFormData] = useState<Partial<ChurchPost>>({
    title: post?.title || '',
    body: post?.body || '',
    excerpt: post?.excerpt || '',
    image_url: post?.image_url || '',
    link_url: post?.link_url || '',
    pinned: post?.pinned || false,
    status: post?.status || 'draft',
    church_id: churchId,
  });

  const handleSubmit = async (e: React.FormEvent, targetStatus?: 'draft' | 'published') => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const dataToSubmit = {
      ...formData,
      status: targetStatus || formData.status,
    };

    try {
      let result;
      if (post?.id) {
        result = await updateChurchPost(post.id, dataToSubmit);
      } else {
        result = await createChurchPost(dataToSubmit);
      }

      if (result?.error) {
        if (typeof result.error === 'string') {
          setError(result.error);
        } else {
          setFieldErrors(result.error);
        }
      }
    } catch (err) {
      if ((err as Error).message === 'NEXT_REDIRECT') {
        return;
      }
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/churches/${churchId}/posts`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {post ? 'Editar Post' : 'Novo Post'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {post ? 'Atualize as informações do post' : 'Crie uma nova publicação para o feed'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Salvar Rascunho
          </button>
          <button
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {post?.status === 'published' ? 'Atualizar' : 'Publicar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                placeholder="Título do post"
              />
              {fieldErrors.title && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.title[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900 placeholder:text-gray-500"
                placeholder="Escreva o conteúdo do post (suporta Markdown simples)..."
              />
              {fieldErrors.body && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.body[0]}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">Mínimo de 20 caracteres.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-medium text-gray-900">Configurações Opcionais</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resumo (Excerpt)
              </label>
              <textarea
                value={formData.excerpt || ''}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                placeholder="Um breve resumo que aparecerá na listagem..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Externo
              </label>
              <input
                type="url"
                value={formData.link_url || ''}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                placeholder="https://..."
              />
              {fieldErrors.link_url && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.link_url[0]}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem de Capa
              </label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                bucket="church-posts"
              />
              {fieldErrors.image_url && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.image_url[0]}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <input
                type="checkbox"
                id="pinned"
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="pinned" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                Fixar no topo do feed
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

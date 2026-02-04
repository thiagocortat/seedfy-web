'use client';

import { useState } from 'react';
import { User, Church } from '@seedfy/shared';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';
import { User as UserIcon, Building, Mail, Camera, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
  user: User;
  churches: Church[];
}

export function ProfileForm({ user, churches }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    church_id: user.church_id || '',
    photo_url: user.photo_url || '',
  });

  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          church_id: formData.church_id || null,
          photo_url: formData.photo_url || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Photo Section */}
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b border-border">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-muted border-2 border-background shadow-sm overflow-hidden flex items-center justify-center">
            {formData.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={formData.photo_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-md">
          <label htmlFor="photo_url" className="block text-sm font-medium text-foreground mb-1">
            URL da Foto (Avatar)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="url"
                id="photo_url"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                placeholder="https://..."
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Cole uma URL pública de imagem para seu avatar.
          </p>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
            Nome Completo
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
              placeholder="Seu nome"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full pl-9 pr-3 py-2 bg-muted border border-input rounded-lg text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">O email não pode ser alterado.</p>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="church" className="block text-sm font-medium text-foreground mb-1">
            Minha Igreja
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              id="church"
              value={formData.church_id || ''}
              onChange={(e) => setFormData({ ...formData, church_id: e.target.value })}
              className="w-full pl-9 pr-10 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none text-foreground"
            >
              <option value="">Selecione sua igreja...</option>
              {churches.map((church) => (
                <option key={church.id} value={church.id!}>
                  {church.name} {church.city ? `(${church.city})` : ''}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Vincule-se a uma igreja para acessar conteúdos exclusivos (se houver).
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
}

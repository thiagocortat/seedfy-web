'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProfileStepProps {
  initialName?: string;
  initialPhoto?: string;
  onNext: () => void;
}

export function ProfileStep({ initialName = '', initialPhoto = '', onNext }: ProfileStepProps) {
  const [name, setName] = useState(initialName);
  const [photoUrl, setPhotoUrl] = useState(initialPhoto);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('users')
        .select('name, photo_url')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.name) setName(profile.name);
        if (profile.photo_url) setPhotoUrl(profile.photo_url);
      } else if (user.user_metadata) {
        if (user.user_metadata.full_name) setName(user.user_metadata.full_name);
        if (user.user_metadata.avatar_url) setPhotoUrl(user.user_metadata.avatar_url);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('users')
        .upsert({ 
          id: user.id, 
          name, 
          photo_url: photoUrl || null,
          email: user.email, // Ensure email is present if inserting
          // updated_at removed as it might not be in the schema cache
        }, { onConflict: 'id' });

      if (error) throw error;
      
      onNext();
    } catch (error) {
      console.error('Error saving profile:', JSON.stringify(error, null, 2));
      toast.error('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Vamos nos conhecer</h2>
        <p className="text-muted-foreground">Como você gostaria de ser chamado?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Nome</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Seu nome"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="photo" className="text-sm font-medium">Foto de Perfil (URL)</label>
          <input
            id="photo"
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="https://..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || name.length < 2}
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continuar
        </button>
      </form>
    </div>
  );
}

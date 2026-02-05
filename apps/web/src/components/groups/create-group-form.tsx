'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GroupSchema, GroupJoinPolicyEnum } from '@seedfy/shared';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';
import { z } from 'zod';
import { Users, Image as ImageIcon, Globe, Lock, Save, Loader2 } from 'lucide-react';

// Create a schema specifically for creation (some fields are optional in base but might be required here, or vice versa)
const CreateGroupSchema = GroupSchema.pick({
  name: true,
  image_url: true,
  discoverable: true,
  join_policy: true,
});

type CreateGroupFormData = z.infer<typeof CreateGroupSchema>;

export function CreateGroupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateGroupFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateGroupSchema) as any,
    defaultValues: {
      name: '',
      image_url: '',
      discoverable: true,
      join_policy: 'open',
    },
  });

  const onSubmit = async (data: CreateGroupFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para criar um grupo.');
        return;
      }

      // 1. Create Group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: data.name,
          image_url: data.image_url || null,
          discoverable: data.discoverable,
          join_policy: data.join_policy,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) {
        console.error('Error creating group:', groupError);
        if (groupError.code === '42501') { // RLS error
          toast.error('Você não tem permissão para criar grupos. Use o aplicativo móvel.');
        } else {
          toast.error('Erro ao criar grupo. Tente novamente.');
        }
        return;
      }

      // 2. Add creator as owner
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) {
        console.error('Error adding member:', memberError);
        // If member creation fails, we might want to warn user or rollback (hard with RLS/client)
        // For now, just show error
        toast.error('Grupo criado, mas houve um erro ao adicionar você como membro.');
      } else {
        toast.success('Grupo criado com sucesso!');
        router.push(`/app/groups/${group.id}`);
        router.refresh();
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erro ao criar grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Nome do Grupo
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            {...register('name')}
            id="name"
            type="text"
            className={`w-full pl-9 pr-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-input'
            }`}
            placeholder="Ex: Grupo de Jovens"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-foreground mb-1">
          URL da Imagem (Opcional)
        </label>
        <div className="relative">
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            {...register('image_url')}
            id="image_url"
            type="url"
            className={`w-full pl-9 pr-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.image_url ? 'border-red-500' : 'border-input'
            }`}
            placeholder="https://..."
          />
        </div>
        {errors.image_url && (
          <p className="mt-1 text-xs text-red-500">{errors.image_url.message}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Cole uma URL pública para a imagem do grupo.
        </p>
      </div>

      {/* Discoverable */}
      <div className="flex items-center gap-3 p-4 border border-input rounded-lg bg-card">
        <div className="p-2 bg-muted rounded-full">
          <Globe className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <label htmlFor="discoverable" className="block text-sm font-medium text-foreground">
            Grupo visível na busca?
          </label>
          <p className="text-xs text-muted-foreground">
            Se desmarcado, o grupo só será acessível via convite.
          </p>
        </div>
        <input
          {...register('discoverable')}
          id="discoverable"
          type="checkbox"
          className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
        />
      </div>

      {/* Join Policy */}
      <div>
        <label htmlFor="join_policy" className="block text-sm font-medium text-foreground mb-1">
          Política de Entrada
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            {...register('join_policy')}
            id="join_policy"
            className="w-full pl-9 pr-10 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
          >
            <option value="open">Aberto (Entrar direto)</option>
            <option value="request">Solicitação (Requer aprovação)</option>
            <option value="invite_only">Apenas Convite</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Define como novos membros podem entrar no grupo.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? 'Criando...' : 'Criar Grupo'}
        </button>
      </div>
    </form>
  );
}

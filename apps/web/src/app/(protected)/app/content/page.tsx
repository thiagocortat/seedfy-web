import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { ContentLibrary } from '@/components/content/content-library';
import { ContentItem } from '@seedfy/shared';

export default async function ContentPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  
  // 1. Check for live content
  const { count } = await supabase
    .from('content_items')
    .select('*', { count: 'exact', head: true })
    .eq('is_live', true);

  const hasLiveContent = count !== null && count > 0;
  const isPreviewMode = !hasLiveContent;

  // 2. Fetch content
  let query = supabase
    .from('content_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (hasLiveContent) {
    query = query.eq('is_live', true);
  }

  const { data: items, error } = await query;

  if (error) {
    console.error('Error fetching content:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-4">Biblioteca</h1>
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg relative">
          <strong className="font-bold block mb-1">Erro ao carregar conteúdo</strong>
          <span className="block text-sm opacity-90">{error.message}</span>
          <p className="text-xs mt-2 opacity-75">Verifique se as permissões (RLS) estão configuradas corretamente para leitura pública/autenticada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            Biblioteca
            {isPreviewMode && items && items.length > 0 && (
              <span className="text-xs font-normal px-2 py-1 bg-accent/10 text-accent-foreground rounded border border-accent/20">
                Modo Preview (Não Publicado)
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Explore nossos conteúdos disponíveis</p>
        </div>
      </div>
      
      <ContentLibrary initialItems={(items as ContentItem[]) || []} />
    </div>
  );
}

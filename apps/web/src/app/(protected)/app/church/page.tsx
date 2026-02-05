import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { ChurchHeader } from '@/components/church/church-header';
import { QuickActions } from '@/components/church/quick-actions';
import { ChurchFeed } from '@/components/church/church-feed';
import { ChurchPicker } from '@/components/church/church-picker';
import { Building2, Smartphone, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default async function ChurchPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Check user's church_id
  const { data: userData } = await supabase
    .from('users')
    .select('church_id')
    .eq('id', user.id)
    .single();

  const churchId = userData?.church_id;

  if (!churchId) {
    return (
      <div className="max-w-md mx-auto mt-20 px-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Sua igreja não está conectada
        </h1>
        <p className="text-muted-foreground mb-8">
          Selecione sua igreja para acessar conteúdos exclusivos e ficar por dentro das novidades.
        </p>
        
        <div className="flex flex-col gap-3">
          <ChurchPicker 
            trigger={
              <button className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors w-full">
                Selecionar Igreja
              </button>
            }
          />
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-3 bg-muted text-muted-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors w-full"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Baixar App
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch Church Data
  const { data: church } = await supabase
    .from('churches')
    .select('*')
    .eq('id', churchId)
    .single();

  if (!church) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Igreja não encontrada ou indisponível.</p>
        <ChurchPicker 
          trigger={
            <button className="text-primary hover:underline font-medium">
              Selecionar outra igreja
            </button>
          }
        />
      </div>
    );
  }

  // 3. Fetch Quick Actions
  const { data: actions } = await supabase
    .from('church_quick_actions')
    .select('*')
    .eq('church_id', churchId)
    .eq('is_enabled', true)
    .order('sort_order', { ascending: true });

  // 4. Fetch Posts
  const { data: posts } = await supabase
    .from('church_posts')
    .select('*')
    .eq('church_id', churchId)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false });

  return (
    <div className="pb-20 relative">
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10">
        <ChurchPicker 
          currentChurchId={church.id}
          trigger={
            <button className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors shadow-sm">
              <RefreshCw className="w-3.5 h-3.5" />
              Trocar Igreja
            </button>
          }
        />
      </div>

      <ChurchHeader church={church} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <QuickActions actions={actions || []} />
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Mural da Igreja</h2>
          <p className="text-sm text-muted-foreground">Fique por dentro das novidades</p>
        </div>

        <ChurchFeed posts={posts || []} />
      </div>
    </div>
  );
}

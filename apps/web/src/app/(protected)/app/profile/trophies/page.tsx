import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { redirect } from 'next/navigation';
import { TrophyCard } from '@/components/profile/trophy-card';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getCompletedChallenges } from '@/lib/profile-progress';

export default async function TrophiesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect('/login');
  }

  // Fetch ALL completed trophies (using shared logic with fallback)
  const trophies = await getCompletedChallenges(supabase, authUser.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          href="/app/profile" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar para Perfil
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Minhas Conquistas</h1>
        <p className="text-muted-foreground mt-1">
          {trophies.length} desafios concluídos
        </p>
      </div>

      {trophies.length === 0 ? (
        <div className="text-center py-12 bg-card border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">Nenhum troféu conquistado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trophies.map((trophy) => (
            <TrophyCard key={trophy.challengeId} {...trophy} />
          ))}
        </div>
      )}
    </div>
  );
}

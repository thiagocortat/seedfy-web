import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { redirect, notFound } from 'next/navigation';
import { ChevronLeft, Calendar, Award, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getCompletedChallenges } from '@/lib/profile-progress';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrophyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect('/login');
  }

  // Fetch all completed trophies for user and find the specific one
  // This reuses the shared logic including fallback
  const allTrophies = await getCompletedChallenges(supabase, authUser.id);
  const trophy = allTrophies.find(t => t.challengeId === id);

  if (!trophy) {
    // If not found in the completed list, user shouldn't see trophy detail
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        href="/app/profile/trophies" 
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Voltar para Troféus
      </Link>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 sm:p-10 text-center border-b border-border bg-muted/20">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{trophy.title}</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="capitalize">{trophy.type}</span>
            <span>•</span>
            <span>{trophy.durationDays} dias</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Período</h3>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-foreground">
                            {trophy.startDate ? new Date(trophy.startDate).toLocaleDateString() : 'N/A'} — {trophy.endDate ? new Date(trophy.endDate).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Status</h3>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-foreground font-medium">Concluído</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Sobre o Desafio</h3>
                <p className="text-foreground/80 leading-relaxed">
                    {trophy.description || "Sem descrição disponível."}
                </p>
            </div>
            
             <div className="mt-8 pt-6 border-t border-border flex justify-center">
                <Link 
                    href={`/app/challenges/${trophy.challengeId}`}
                    className="text-primary hover:underline text-sm font-medium"
                >
                    Ver página do desafio original
                </Link>
             </div>
        </div>
      </div>
    </div>
  );
}

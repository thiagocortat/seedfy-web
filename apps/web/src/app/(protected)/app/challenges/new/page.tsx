import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { CreateChallengeWizard } from '@/components/challenges/create-challenge-wizard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Group } from '@seedfy/shared';

export default async function CreateChallengePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user groups for the selection step
  const { data: userGroups } = await supabase
    .from('group_members')
    .select(`
      group_id,
      groups:group_id (
        id,
        name,
        image_url
      )
    `)
    .eq('user_id', user.id);

  // Flatten the data structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups = userGroups?.map((item: any) => item.groups).filter(Boolean) as Group[] || [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          href="/app/challenges" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Meus Desafios
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Criar Novo Desafio</h1>
        <p className="text-muted-foreground mt-1">
          Crie um desafio para sua comunidade.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <CreateChallengeWizard groups={groups} />
      </div>
    </div>
  );
}

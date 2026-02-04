import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { ProfileForm } from '@/components/profile/profile-form';
import { User, Church } from '@seedfy/shared';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // 1. Get authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect('/login');
  }

  // 2. Fetch user profile data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  // 3. Fetch churches for dropdown
  const { data: churches } = await supabase
    .from('churches')
    .select('id, name, city, state, logo_url')
    .order('name');

  // If user record doesn't exist in public table yet (rare but possible), use auth data
  const user: User = userData || {
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata?.name || authUser.user_metadata?.full_name,
    photo_url: authUser.user_metadata?.avatar_url,
    role: 'viewer'
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais e vínculo com a igreja.</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 sm:p-8">
        <ProfileForm 
          user={user} 
          churches={(churches as Church[]) || []} 
        />
      </div>
    </div>
  );
}

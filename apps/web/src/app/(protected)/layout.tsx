import { createServerClient } from '@seedfy/shared/server';
import { cookies } from 'next/headers';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { MobileNav } from '@/components/mobile-nav';
import { OnboardingGuard } from '@/components/onboarding-guard';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // If no user, middleware handles it, but we provide fallback
  if (!user) {
    return <>{children}</>;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  const isCompleted = profile?.onboarding_completed ?? false;

  return (
    <OnboardingGuard completed={isCompleted}>
      {!isCompleted ? (
        <main className="min-h-screen bg-background flex items-center justify-center p-4">
           {children}
        </main>
      ) : (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
          <AppHeader />
          <AppSidebar />
          <main className="pt-16 md:pl-64 min-h-screen transition-all duration-200">
            <div className="container mx-auto p-4 md:p-8">
              {children}
            </div>
          </main>
          <MobileNav />
        </div>
      )}
    </OnboardingGuard>
  );
}

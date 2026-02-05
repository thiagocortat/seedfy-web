'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface OnboardingGuardProps {
  children: React.ReactNode;
  completed: boolean;
}

export function OnboardingGuard({ children, completed }: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Avoid running on server or before hydration
    if (typeof window === 'undefined') return;

    // If onboarding is NOT completed
    if (!completed) {
      // If we are NOT on the onboarding page, redirect to it
      if (!pathname.startsWith('/app/onboarding')) {
        router.push('/app/onboarding');
      }
    } 
    // If onboarding IS completed
    else {
      // If we ARE on the onboarding page, redirect to app
      if (pathname.startsWith('/app/onboarding')) {
        router.push('/app');
      }
    }
  }, [completed, pathname, router]);

  // Prevent flash of content while redirecting
  const shouldRedirectToOnboarding = !completed && !pathname.startsWith('/app/onboarding');
  const shouldRedirectToApp = completed && pathname.startsWith('/app/onboarding');

  if (shouldRedirectToOnboarding || shouldRedirectToApp) {
     return (
        <div className="h-screen w-full flex items-center justify-center bg-background">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
     );
  }
  
  return <>{children}</>;
}

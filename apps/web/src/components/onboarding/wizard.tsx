'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileStep } from './steps/profile-step';
import { ChurchStep } from './steps/church-step';
import { InterestsStep } from './steps/interests-step';
import { LogOut } from 'lucide-react';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleFinish = () => {
    // Force hard refresh to clear server cache of user profile in layout
    window.location.href = '/app';
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Você saiu com sucesso.');
      window.location.href = '/login';
    } catch (error) {
      console.error(error);
      toast.error('Erro ao sair.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-xl shadow-sm border border-border relative">
      <button 
        onClick={handleLogout}
        className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
        title="Sair"
      >
        <LogOut className="w-5 h-5" />
      </button>

      <div className="mb-8 flex justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div 
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              s === step ? 'w-8 bg-primary' : 
              s < step ? 'w-2 bg-primary/50' : 'w-2 bg-muted'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <ProfileStep onNext={() => setStep(2)} />
      )}
      
      {step === 2 && (
        <ChurchStep onNext={() => setStep(3)} />
      )}

      {step === 3 && (
        <InterestsStep onFinish={handleFinish} />
      )}
    </div>
  );
}

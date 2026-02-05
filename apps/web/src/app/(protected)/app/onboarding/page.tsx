import { OnboardingWizard } from '@/components/onboarding/wizard';

export default function OnboardingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <div className="w-full text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Bem-vindo ao Seedfy</h1>
        <p className="text-muted-foreground">Vamos configurar seu perfil para começar.</p>
      </div>
      <OnboardingWizard />
    </div>
  );
}

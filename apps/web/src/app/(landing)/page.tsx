import { Hero } from '@/components/landing/hero';
import { PlatformSplit } from '@/components/landing/platform-split';
import { FeatureHighlights } from '@/components/landing/feature-highlights';
import { HowItWorks } from '@/components/landing/how-it-works';
import { FinalCTA } from '@/components/landing/final-cta';
import { getRedirectForWebCTA } from '@/lib/auth-helper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seedfy | Sua jornada de fé na Web e no Mobile',
  description: 'Acesse desafios, grupos e conteúdos exclusivos onde preferir. O Seedfy agora está disponível no navegador e no aplicativo.',
};

export default async function Home() {
  const webAppUrl = await getRedirectForWebCTA();

  return (
    <>
      <Hero webAppUrl={webAppUrl} />
      <PlatformSplit webAppUrl={webAppUrl} />
      <FeatureHighlights />
      <HowItWorks />
      <FinalCTA />
    </>
  );
}

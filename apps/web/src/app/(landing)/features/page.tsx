import { PlatformSplit } from '@/components/landing/platform-split';
import { getRedirectForWebCTA } from '@/lib/auth-helper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Funcionalidades | Seedfy',
  description: 'Descubra todas as ferramentas do Seedfy para Web e Mobile. Desafios, grupos, conteúdo e muito mais.',
};

export default async function FeaturesPage() {
  const webAppUrl = await getRedirectForWebCTA();
  
  return (
    <div className="bg-background">
       <section className="pt-20 pb-10 container mx-auto px-4 text-center">
         <h1 className="text-4xl font-bold mb-6">Nossas Funcionalidades</h1>
         <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
           Conheça em detalhes o que o Seedfy oferece para impulsionar seu crescimento espiritual na Web e no Mobile.
         </p>
       </section>
       <PlatformSplit webAppUrl={webAppUrl} />
    </div>
  );
}

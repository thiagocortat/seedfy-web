import Link from 'next/link';
import { Monitor, Smartphone, Check } from 'lucide-react';
import { Button } from '@seedfy/ui';

interface PlatformSplitProps {
  webAppUrl: string;
}

export function PlatformSplit({ webAppUrl }: PlatformSplitProps) {
  return (
    <section id="platforms" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Uma experiência, duas plataformas</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Escolha a melhor forma de interagir com sua comunidade, seja no computador ou no celular.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Web Card */}
          <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
              <Monitor className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-4">Web App</h3>
            <p className="text-muted-foreground mb-6">
              Ideal para quem prefere uma tela maior para leitura aprofundada, gestão de grupos e consumo de conteúdo em vídeo.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Gestão completa de grupos',
                'Visualização detalhada de jornadas',
                'Player de vídeo imersivo',
                'Digitação facilitada para chat'
              ].map((item) => (
                <li key={item} className="flex items-center text-sm text-card-foreground">
                  <Check className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={webAppUrl} className="w-full">
              <Button className="w-full" variant="secondary">Acessar Web App</Button>
            </Link>
          </div>

          {/* Mobile Card */}
          <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-4">Mobile App</h3>
            <p className="text-muted-foreground mb-6">
              A companhia perfeita para o dia a dia. Faça seus check-ins, receba notificações e ouça áudios onde estiver.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Check-in rápido de hábitos',
                'Notificações push em tempo real',
                'Modo offline para áudios baixados',
                'Experiência tátil fluida'
              ].map((item) => (
                <li key={item} className="flex items-center text-sm text-card-foreground">
                  <Check className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="https://apps.apple.com" className="w-full">
              <Button className="w-full">Baixar App</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

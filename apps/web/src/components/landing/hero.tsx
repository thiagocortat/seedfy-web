import Link from 'next/link';
import { ArrowRight, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@seedfy/ui';

interface HeroProps {
  webAppUrl: string;
}

export function Hero({ webAppUrl }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-32">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Agora disponível na Web e Mobile
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-500">
          Sua jornada de fé <br className="hidden md:block" />
          <span className="text-primary">em qualquer lugar</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
          O Seedfy conecta você à sua igreja e comunidade através de desafios, 
          conteúdo e grupos de crescimento. Acesse pelo navegador ou baixe o app.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-7 duration-1000">
          <Link href={webAppUrl}>
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full gap-2">
              <Monitor className="w-5 h-5" />
              Acessar Web
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          
          <Link href="https://apps.apple.com">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full gap-2">
              <Smartphone className="w-5 h-5" />
              Baixar App
            </Button>
          </Link>
        </div>
        
        {/* Mockups */}
        <div className="mt-20 relative mx-auto max-w-5xl animate-in fade-in zoom-in duration-1000 delay-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Web Mockup */}
            <div className="relative rounded-xl border border-border shadow-2xl bg-card overflow-hidden aspect-[16/10] md:translate-x-12 z-10">
              <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
                <div className="text-center p-6">
                  <Monitor className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Seedfy Web Dashboard</p>
                </div>
              </div>
            </div>
            
            {/* Mobile Mockup */}
            <div className="relative rounded-[2.5rem] border-[8px] border-foreground/10 shadow-2xl bg-card overflow-hidden w-[280px] mx-auto md:-translate-x-12 z-20 aspect-[9/19]">
               <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
                <div className="text-center p-6">
                  <Smartphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Mobile App</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

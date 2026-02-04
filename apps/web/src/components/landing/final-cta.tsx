import Link from 'next/link';
import { Button } from '@seedfy/ui';

export function FinalCTA() {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          Comece agora no Web ou no App
        </h2>
        <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
          Junte-se a milhares de pessoas que estão transformando sua vida espiritual através da constância e comunidade.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg font-bold">
              Criar conta grátis
            </Button>
          </Link>
          
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-primary-foreground/20 hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground">
              Entrar
            </Button>
          </Link>
          
          <Link href="https://apps.apple.com">
            <Button size="lg" variant="ghost" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground">
              Baixar o App
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

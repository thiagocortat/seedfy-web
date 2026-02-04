import { UserPlus, LogIn, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Como funciona</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Começar sua jornada no Seedfy é simples e rápido.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
           {/* Connecting Line (Desktop) */}
           <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10"></div>

          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-card border-4 border-muted rounded-full flex items-center justify-center mb-6 shadow-sm z-10">
              <UserPlus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">1. Crie sua conta</h3>
            <p className="text-muted-foreground max-w-xs">
              Cadastre-se gratuitamente em poucos segundos pelo site ou aplicativo.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-card border-4 border-muted rounded-full flex items-center justify-center mb-6 shadow-sm z-10">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">2. Entre em um Grupo</h3>
            <p className="text-muted-foreground max-w-xs">
              Encontre sua igreja ou crie um grupo de desafios com seus amigos.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-card border-4 border-muted rounded-full flex items-center justify-center mb-6 shadow-sm z-10">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">3. Participe e Cresça</h3>
            <p className="text-muted-foreground max-w-xs">
              Faça check-ins diários, consuma conteúdos e fortaleça sua fé com constância.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

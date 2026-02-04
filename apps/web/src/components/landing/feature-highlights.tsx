import { Headphones, Users, Church } from 'lucide-react';

export function FeatureHighlights() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">O que você faz no Seedfy</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ferramentas desenhadas para fortalecer sua fé no dia a dia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <div className="text-center p-6 rounded-2xl hover:bg-muted/50 transition-colors">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Headphones className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Conteúdo Edificante</h3>
            <p className="text-muted-foreground">
              Acesse podcasts, vídeos e devocionais selecionados para sua jornada espiritual.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center p-6 rounded-2xl hover:bg-muted/50 transition-colors">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Grupos e Desafios</h3>
            <p className="text-muted-foreground">
              Participe de desafios de leitura, jejum e oração com amigos. Acompanhe o progresso juntos.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center p-6 rounded-2xl hover:bg-muted/50 transition-colors">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Church className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Conexão com a Igreja</h3>
            <p className="text-muted-foreground">
              Fique por dentro das novidades da sua comunidade local e participe ativamente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

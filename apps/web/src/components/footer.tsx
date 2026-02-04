import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-muted border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="font-bold text-2xl text-primary mb-4 block">
              Seedfy
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Crescimento espiritual com comunidade e constância. 
              Conecte-se com sua igreja e fortaleça sua fé diariamente.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:suporte@seedfy.app" className="text-muted-foreground hover:text-primary">
                  Fale Conosco
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Seedfy. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

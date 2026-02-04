import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seedfy - Crescimento Espiritual Constante',
  description: 'Conecte-se com sua igreja, participe de desafios em grupo e consuma conteúdo edificante. Baixe o app Seedfy.',
  openGraph: {
    title: 'Seedfy - Crescimento Espiritual Constante',
    description: 'Conecte-se com sua igreja, participe de desafios em grupo e consuma conteúdo edificante.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Seedfy',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col font-sans">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

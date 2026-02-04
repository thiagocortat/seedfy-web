import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';
import { Button } from '@seedfy/ui';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suporte | Seedfy',
  description: 'Precisa de ajuda? Entre em contato com a equipe do Seedfy.',
};

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
      <h1 className="text-4xl font-bold mb-6">Como podemos ajudar?</h1>
      <p className="text-xl text-muted-foreground mb-12">
        Estamos aqui para garantir que você tenha a melhor experiência possível.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
          <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Dúvidas Frequentes</h2>
          <p className="text-muted-foreground mb-6">
            Encontre respostas rápidas para as perguntas mais comuns.
          </p>
          <Link href="/faq">
            <Button variant="outline" className="w-full">Acessar FAQ</Button>
          </Link>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
          <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Fale Conosco</h2>
          <p className="text-muted-foreground mb-6">
            Envie um e-mail para nossa equipe de suporte.
          </p>
          <a href="mailto:suporte@seedfy.app?subject=Preciso de ajuda com o Seedfy">
            <Button className="w-full">Enviar E-mail</Button>
          </a>
        </div>
      </div>
    </div>
  );
}

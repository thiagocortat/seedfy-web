import { CreateChallengeForm } from '@/components/challenges/create-challenge-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateChallengePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          href="/app/challenges" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Meus Desafios
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Criar Novo Desafio</h1>
        <p className="text-muted-foreground mt-1">
          Crie um compromisso pessoal ou em grupo para leitura e oração.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <CreateChallengeForm />
      </div>
    </div>
  );
}

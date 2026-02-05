import { CreateGroupForm } from '@/components/groups/create-group-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateGroupPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          href="/app/groups" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Meus Grupos
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Criar Novo Grupo</h1>
        <p className="text-muted-foreground mt-1">
          Crie um espaço para compartilhar jornadas e desafios com outras pessoas.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <CreateGroupForm />
      </div>
    </div>
  );
}

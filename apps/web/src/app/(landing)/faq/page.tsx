import { ChevronDown } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes | Seedfy',
  description: 'Tire suas dúvidas sobre o Seedfy. Como funciona, custos, privacidade e mais.',
};

export default function FAQPage() {
  const faqs = [
    {
      q: "O aplicativo é gratuito?",
      a: "Sim, o Seedfy é gratuito para baixar e usar. Algumas igrejas podem oferecer conteúdos exclusivos para membros."
    },
    {
      q: "Como encontro minha igreja?",
      a: "Ao criar sua conta, você poderá buscar sua igreja pelo nome ou localização e solicitar participação."
    },
    {
      q: "Posso criar grupos com amigos de outras igrejas?",
      a: "Sim! Os grupos de desafio podem ser formados com qualquer usuário do app, independente da igreja."
    },
    {
      q: "Preciso estar em uma igreja para usar?",
      a: "Não. Você pode usar o Seedfy individualmente ou criar grupos com amigos, mesmo sem vínculo com uma igreja específica."
    },
    {
      q: "O que acontece se eu esquecer de fazer o check-in?",
      a: "O Seedfy incentiva a constância. Se perder um dia, você pode continuar no dia seguinte, mas sua sequência (ofensiva) será reiniciada."
    },
    {
      q: "Como funciona o suporte?",
      a: "Você pode entrar em contato conosco a qualquer momento através do email suporte@seedfy.app."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <h1 className="text-4xl font-bold text-center mb-10">Perguntas Frequentes</h1>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-card rounded-xl shadow-sm border border-border open:ring-1 open:ring-primary/20">
            <summary className="flex justify-between items-center cursor-pointer p-6 font-medium text-card-foreground list-none focus:outline-none">
              {faq.q}
              <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-6 text-muted-foreground border-t border-border/50 pt-4">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

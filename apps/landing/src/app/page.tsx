import { Headphones, Users, Church, ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-20 pb-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Crescimento espiritual com <br className="hidden md:block" />
            <span className="text-blue-600">comunidade e constância</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            O Seedfy ajuda você a manter sua jornada de fé ativa através de desafios em grupo, 
            conteúdo exclusivo e conexão direta com sua igreja.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="https://apps.apple.com" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
            >
              Baixar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
          
          {/* App Preview Placeholder */}
          <div className="mt-20 relative mx-auto max-w-4xl">
            <div className="aspect-[16/9] bg-gray-100 rounded-2xl shadow-2xl border border-gray-200 flex items-center justify-center">
              <p className="text-gray-400 font-medium">App Preview Screenshot Placeholder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tudo o que você precisa para crescer</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Ferramentas desenhadas para fortalecer sua fé no dia a dia, onde quer que você esteja.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Headphones className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Conteúdo Multimídia</h3>
              <p className="text-gray-600">
                Acesse podcasts, vídeos e músicas selecionadas para sua edificação espiritual em qualquer momento.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Desafios em Grupo</h3>
              <p className="text-gray-600">
                Participe de desafios de leitura, jejum e oração com amigos. Acompanhe o progresso juntos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Church className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sua Igreja Conectada</h3>
              <p className="text-gray-600">
                Fique por dentro das novidades da sua comunidade local e participe ativamente da vida da igreja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4">
            <details className="group bg-white rounded-xl shadow-sm border border-gray-100">
              <summary className="flex justify-between items-center cursor-pointer p-6 font-medium text-gray-900">
                O aplicativo é gratuito?
                <ChevronDown className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Sim, o Seedfy é gratuito para baixar e usar. Algumas igrejas podem oferecer conteúdos exclusivos para membros.
              </div>
            </details>

            <details className="group bg-white rounded-xl shadow-sm border border-gray-100">
              <summary className="flex justify-between items-center cursor-pointer p-6 font-medium text-gray-900">
                Como encontro minha igreja?
                <ChevronDown className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Ao criar sua conta, você poderá buscar sua igreja pelo nome ou localização e solicitar participação.
              </div>
            </details>

            <details className="group bg-white rounded-xl shadow-sm border border-gray-100">
              <summary className="flex justify-between items-center cursor-pointer p-6 font-medium text-gray-900">
                Posso criar grupos com amigos de outras igrejas?
                <ChevronDown className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Sim! Os grupos de desafio podem ser formados com qualquer usuário do app, independente da igreja.
              </div>
            </details>
            
            <details className="group bg-white rounded-xl shadow-sm border border-gray-100">
              <summary className="flex justify-between items-center cursor-pointer p-6 font-medium text-gray-900">
                Como funciona o suporte?
                <ChevronDown className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Você pode entrar em contato conosco a qualquer momento através do email suporte@seedfy.app.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Comece sua jornada hoje mesmo
          </h2>
          <Link 
            href="https://apps.apple.com" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-full hover:bg-gray-100 transition-all shadow-lg"
          >
            Baixar Seedfy Gratuitamente
          </Link>
        </div>
      </section>
    </>
  );
}

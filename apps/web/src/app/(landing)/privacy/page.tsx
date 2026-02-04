export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
      <div className="prose prose-blue max-w-none text-gray-600">
        <p className="mb-4">Última atualização: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Coleta de Dados</h2>
        <p className="mb-4">
          Coletamos informações que você nos fornece diretamente ao usar o Seedfy, como nome, 
          email e foto de perfil, além de dados de uso do aplicativo para melhorar sua experiência.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Uso das Informações</h2>
        <p className="mb-4">
          Utilizamos seus dados para:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Fornecer e manter nossos serviços;</li>
            <li>Conectar você com sua igreja e grupos;</li>
            <li>Enviar notificações importantes sobre sua conta.</li>
          </ul>
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Compartilhamento</h2>
        <p className="mb-4">
          Não vendemos seus dados pessoais. Compartilhamos informações apenas com sua permissão 
          explícita (ex: ao entrar em uma igreja no app) ou para cumprir obrigações legais.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Contato</h2>
        <p>
          Para questões sobre privacidade, contate: privacidade@seedfy.app
        </p>
      </div>
    </div>
  );
}

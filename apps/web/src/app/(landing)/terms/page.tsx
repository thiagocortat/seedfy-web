export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>
      <div className="prose prose-blue max-w-none text-gray-600">
        <p className="mb-4">Última atualização: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Aceitação</h2>
        <p className="mb-4">
          Ao acessar e usar o Seedfy, você concorda com estes termos. Se não concordar, 
          por favor não utilize o serviço.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Uso do Serviço</h2>
        <p className="mb-4">
          Você se compromete a usar o Seedfy apenas para propósitos lícitos e de acordo com 
          os valores da comunidade. Comportamento abusivo ou conteúdo impróprio resultará 
          no encerramento da conta.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Conteúdo</h2>
        <p className="mb-4">
          Todo conteúdo disponibilizado no app é de propriedade do Seedfy ou de seus parceiros 
          licenciados. É proibida a reprodução sem autorização.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Modificações</h2>
        <p>
          Podemos atualizar estes termos periodicamente. O uso contínuo após alterações 
          constitui aceitação dos novos termos.
        </p>
      </div>
    </div>
  );
}

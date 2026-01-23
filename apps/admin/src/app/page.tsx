import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seedfy Admin</h1>
        <p className="text-gray-600 mb-8">Painel administrativo para gestão de igrejas e conteúdo.</p>
        
        <div className="space-y-4">
          <Link 
            href="/login" 
            className="block w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </Link>
          
          <Link 
            href="/dashboard" 
            className="block w-full py-3 px-4 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Acessar Dashboard
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-400">
          Acesso restrito a administradores
        </div>
      </div>
    </div>
  );
}

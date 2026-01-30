import { JourneyForm } from '@/components/journey-form';

export default function NewJourneyPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nova Jornada</h1>
        <p className="text-gray-500 mt-1">Crie uma nova jornada de conteúdo.</p>
      </div>
      <JourneyForm />
    </div>
  );
}

import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { StartJourneyForm } from '@/components/journeys/start-journey-form';
import { JourneyTemplate } from '@seedfy/shared';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Tag, FileText } from 'lucide-react';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JourneyDetailPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // 1. Fetch Journey Template
  const { data: journey } = await supabase
    .from('journey_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (!journey) {
    notFound();
  }

  const typedJourney = journey as unknown as JourneyTemplate;

  // 2. Fetch first chapter preview (optional)
  const { data: firstChapter } = await supabase
    .from('journey_chapter_templates')
    .select('title, narrative')
    .eq('journey_id', id)
    .eq('day_index', 1)
    .single();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        href="/app/journeys"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Voltar para catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-6 relative">
               {typedJourney.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={typedJourney.cover_image_url} 
                  alt={typedJourney.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Tag className="w-16 h-16" />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {typedJourney.tags?.map((tag) => (
                <span key={tag} className="inline-flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{typedJourney.title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {typedJourney.description_long || typedJourney.description_short}
            </p>
          </div>

          {/* Preview Chapter */}
          {firstChapter && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Preview: Dia 1
              </h3>
              <h4 className="text-md font-medium text-gray-800 mb-2">{firstChapter.title}</h4>
              <div className="text-sm text-gray-600 line-clamp-3 italic">
                &quot;{firstChapter.narrative}&quot;
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Action */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <StartJourneyForm journey={typedJourney} />
          </div>
        </div>
      </div>
    </div>
  );
}

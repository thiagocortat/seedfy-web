'use client';

import { JourneyTemplate } from '@seedfy/shared';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import Link from 'next/link';

interface JourneyCardProps {
  journey: JourneyTemplate;
}

export function JourneyCard({ journey }: JourneyCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {journey.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={journey.cover_image_url} 
            alt={journey.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary/30">
            <Tag className="w-12 h-12" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          {journey.durations_supported && journey.durations_supported.length > 0 && (
            <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
              <Clock className="w-3 h-3 mr-1" />
              {Math.min(...journey.durations_supported)} - {Math.max(...journey.durations_supported)} dias
            </span>
          )}
          {journey.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{journey.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{journey.description_short}</p>

        <Link
          href={`/app/journeys/${journey.id}`}
          className="w-full mt-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          Ver detalhes
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

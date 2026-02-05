'use client';

import { CheckinButton } from './checkin-button';
import { JourneyChapterTemplate } from '@seedfy/shared';
import { PlayCircle, Mic, BookOpen } from 'lucide-react';

interface JourneyTodayViewProps {
  chapter: JourneyChapterTemplate;
  challengeId: string;
  userId: string;
  latestCheckinDate?: string | null;
  participantId: string;
  dayIndex: number;
  timezone?: string;
}

export function JourneyTodayView({
  chapter,
  challengeId,
  userId,
  latestCheckinDate,
  participantId,
  dayIndex,
  timezone
}: JourneyTodayViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{chapter.title}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Dia {dayIndex}</span>
            <span>•</span>
            <span>{chapter.focus}</span>
          </div>
        </div>

        {chapter.media_url && (
          <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden group cursor-pointer">
            {chapter.media_type === 'video' ? (
              <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Mic className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          </div>
        )}

        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <h3 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Leitura Bíblica
          </h3>
          <p className="text-purple-800 font-medium">{chapter.verse_reference}</p>
          {chapter.verse_text && (
            <p className="text-purple-700 mt-2 text-sm italic leading-relaxed">&quot;{chapter.verse_text}&quot;</p>
          )}
        </div>

        <div className="prose prose-gray max-w-none">
          <h3 className="text-lg font-semibold text-gray-900">Reflexão</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {chapter.narrative}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Prática do Dia</h3>
          <p className="text-gray-600 text-sm">{chapter.practice}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Oração</h3>
          <p className="text-blue-800 text-sm italic">{chapter.prayer}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <CheckinButton 
          challengeId={challengeId}
          userId={userId}
          latestCheckinDate={latestCheckinDate}
          participantId={participantId}
          dayIndex={dayIndex}
          timezone={timezone}
        />
      </div>
    </div>
  );
}

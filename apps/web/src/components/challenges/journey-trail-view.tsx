'use client';

import { JourneyChapterTemplate } from '@seedfy/shared';
import { CheckCircle, Lock, PlayCircle } from 'lucide-react';

interface JourneyTrailViewProps {
  chapters: JourneyChapterTemplate[];
  currentDayIndex: number;
  completedDayIndexes: number[];
}

export function JourneyTrailView({ 
  chapters, 
  currentDayIndex, 
  completedDayIndexes 
}: JourneyTrailViewProps) {
  const completedSet = new Set(completedDayIndexes);

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => {
        const isCompleted = completedSet.has(chapter.day_index);
        const isLocked = chapter.day_index > currentDayIndex;
        const isCurrent = chapter.day_index === currentDayIndex;

        return (
          <div 
            key={chapter.id}
            className={`
              relative flex items-center gap-4 p-4 rounded-xl border transition-all
              ${isCompleted ? 'bg-green-50 border-green-100' : ''}
              ${isCurrent ? 'bg-white border-purple-200 shadow-sm ring-1 ring-purple-100' : ''}
              ${isLocked ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200'}
            `}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
              ${isCompleted ? 'bg-green-100 text-green-700' : ''}
              ${isCurrent ? 'bg-purple-100 text-purple-700' : ''}
              ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-500' : ''}
            `}>
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : chapter.day_index}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className={`font-medium truncate ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                {chapter.title}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {chapter.focus}
              </p>
            </div>

            <div className="flex-shrink-0">
              {isLocked ? (
                <Lock className="w-4 h-4 text-gray-400" />
              ) : (
                <PlayCircle className={`w-5 h-5 ${isCurrent ? 'text-purple-400' : 'text-gray-300'}`} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

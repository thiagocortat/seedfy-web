'use client';

import { useState, useEffect } from 'react';
import { Challenge, ChallengeParticipant } from '@seedfy/shared';
import { ChallengeCard } from './challenge-card';
import { Target } from 'lucide-react';

interface CheckinStatus {
  done: boolean;
  todayKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug?: any;
}

interface ChallengeListProps {
  items: {
    challenge: Challenge & { journey_id?: string; timezone?: string };
    participant: ChallengeParticipant;
  }[];
  checkinStatus: Record<string, CheckinStatus>;
}

export function ChallengeList({ items, checkinStatus }: ChallengeListProps) {
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  const filteredItems = items.filter(item => {
    if (tab === 'active') return item.participant.status === 'active';
    return item.participant.status === 'completed';
  });

  return (
    <div>
      <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8 w-fit">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'active' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Ativos
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'completed' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Concluídos
        </button>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(({ challenge, participant }) => {
            const status = checkinStatus[String(challenge.id)];
            const isCheckedIn = !!status?.done;

            return (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                participant={participant}
                isJourney={!!challenge.journey_id}
                checkedInToday={isCheckedIn}
                debugInfo={status?.debug}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {tab === 'active' ? 'Nenhum desafio ativo' : 'Nenhum desafio concluído'}
          </h3>
          <p className="text-gray-500">
            {tab === 'active' 
              ? 'Participe de grupos para iniciar novos desafios.' 
              : 'Complete seus desafios ativos para vê-los aqui.'}
          </p>
        </div>
      )}
    </div>
  );
}

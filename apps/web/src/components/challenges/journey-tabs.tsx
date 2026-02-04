'use client';

import { useState } from 'react';

interface JourneyTabsProps {
  todayContent: React.ReactNode;
  trailContent: React.ReactNode;
}

export function JourneyTabs({ todayContent, trailContent }: JourneyTabsProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'trail'>('today');

  return (
    <div>
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${
            activeTab === 'today'
              ? 'text-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Hoje
          {activeTab === 'today' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('trail')}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${
            activeTab === 'trail'
              ? 'text-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Trilha
          {activeTab === 'trail' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />
          )}
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'today' ? todayContent : trailContent}
      </div>
    </div>
  );
}

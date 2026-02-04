'use client';

import { Search } from 'lucide-react';
import { ContentItem } from '@seedfy/shared';

interface ContentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: ContentItem['type'] | 'all';
  onTypeChange: (value: ContentItem['type'] | 'all') => void;
}

export function ContentFilters({ 
  search, 
  onSearchChange, 
  type, 
  onTypeChange 
}: ContentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar conteúdo..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
        <FilterButton 
          active={type === 'all'} 
          onClick={() => onTypeChange('all')}
        >
          Todos
        </FilterButton>
        <FilterButton 
          active={type === 'video'} 
          onClick={() => onTypeChange('video')}
        >
          Vídeos
        </FilterButton>
        <FilterButton 
          active={type === 'podcast'} 
          onClick={() => onTypeChange('podcast')}
        >
          Podcasts
        </FilterButton>
        <FilterButton 
          active={type === 'music'} 
          onClick={() => onTypeChange('music')}
        >
          Músicas
        </FilterButton>
      </div>
    </div>
  );
}

function FilterButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
        active 
          ? 'bg-primary text-primary-foreground shadow-sm' 
          : 'bg-card text-muted-foreground border border-border hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

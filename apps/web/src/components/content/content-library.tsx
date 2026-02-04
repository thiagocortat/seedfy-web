'use client';

import { useState, useMemo } from 'react';
import { ContentItem } from '@seedfy/shared';
import { ContentCard } from './content-card';
import { ContentFilters } from './content-filters';
import { FileQuestion } from 'lucide-react';

interface ContentLibraryProps {
  initialItems: ContentItem[];
}

export function ContentLibrary({ initialItems }: ContentLibraryProps) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<ContentItem['type'] | 'all'>('all');

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === 'all' || item.type === type;
      return matchesSearch && matchesType;
    });
  }, [initialItems, search, type]);

  return (
    <div>
      <ContentFilters 
        search={search} 
        onSearchChange={setSearch}
        type={type} 
        onTypeChange={setType}
      />

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileQuestion className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">Nenhum conteúdo encontrado</h3>
          <p className="text-muted-foreground max-w-sm">
            {search || type !== 'all' 
              ? 'Tente ajustar seus filtros de busca.' 
              : 'Não há conteúdos disponíveis no momento.'}
          </p>
          {(search || type !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setType('all');
              }}
              className="mt-4 text-primary font-medium hover:text-primary/90 hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}

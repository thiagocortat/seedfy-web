import Link from 'next/link';
import { Play, Music, Video, Mic } from 'lucide-react';
import { ContentItem } from '@seedfy/shared';

interface ContentCardProps {
  item: ContentItem;
}

const iconMap = {
  video: Video,
  podcast: Mic,
  music: Music,
} as const;

export function ContentCard({ item }: ContentCardProps) {
  // Fallback to Play if type doesn't match known types, though TS should prevent this if schema is strict
  const Icon = item.type in iconMap ? iconMap[item.type as keyof typeof iconMap] : Play;

  return (
    <Link 
      href={`/app/content/${item.id}`}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video bg-muted">
        {item.cover_url ? (
          <img 
            src={item.cover_url} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Icon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all shadow-sm">
            <Play className="w-5 h-5 text-gray-900 fill-current ml-1" />
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md capitalize flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {item.type}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-card-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </Link>
  );
}

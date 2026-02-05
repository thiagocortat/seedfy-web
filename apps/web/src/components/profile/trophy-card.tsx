import { Award, BookOpen, Coffee } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TrophyCardProps {
  challengeId: string;
  title: string;
  type: string;
  durationDays: number;
  completedAt: string;
  className?: string;
}

export function TrophyCard({ challengeId, title, type, durationDays, completedAt, className }: TrophyCardProps) {
  // Map type to icon
  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'reading': return <BookOpen className="w-5 h-5" />;
      case 'fasting': return <Coffee className="w-5 h-5" />; // Or generic
      default: return <Award className="w-5 h-5" />;
    }
  };

  const dateFormatted = new Date(completedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Link 
      href={`/app/profile/trophies/${challengeId}`}
      className={cn(
        "group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors shadow-sm",
        className
      )}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {getIcon(type)}
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {durationDays} dias
          </span>
        </div>
        
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 flex-1">
          {title}
        </h3>
        
        <div className="mt-auto pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
          <span>Concluído em</span>
          <span className="font-medium">{dateFormatted}</span>
        </div>
      </div>
    </Link>
  );
}

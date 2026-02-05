import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { TrophyCard } from './trophy-card';

interface TrophiesPreviewProps {
  trophies: Array<{
    challengeId: string;
    title: string;
    type: string;
    durationDays: number;
    completedAt: string;
  }>;
  totalCompleted: number;
}

export function TrophiesPreview({ trophies, totalCompleted }: TrophiesPreviewProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Conquistas
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-1">
            {totalCompleted}
          </span>
        </h2>
        
        {trophies.length > 0 && (
          <Link 
            href="/app/profile/trophies" 
            className="text-sm text-primary hover:underline font-medium"
          >
            Ver todos
          </Link>
        )}
      </div>

      {trophies.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
          <p>Você ainda não completou nenhum desafio.</p>
          <Link href="/app/challenges" className="text-primary hover:underline text-sm mt-2 inline-block">
            Começar agora
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trophies.map((trophy) => (
            <TrophyCard key={trophy.challengeId} {...trophy} />
          ))}
        </div>
      )}
    </div>
  );
}

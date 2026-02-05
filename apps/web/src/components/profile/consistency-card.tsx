import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsistencyCardProps {
  streakCurrent: number;
  streakBest: number;
  activeDays: number;
  className?: string;
}

export function ConsistencyCard({ streakCurrent, streakBest, activeDays, className }: ConsistencyCardProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-sm p-6 mb-6", className)}>
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-500" />
        Consistência
      </h2>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg text-center">
          <span className="text-3xl font-bold text-orange-500">{streakCurrent}</span>
          <span className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide">
            Sequência Atual
          </span>
        </div>

        {/* Best Streak */}
        <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg text-center">
          <span className="text-3xl font-bold text-foreground">{streakBest}</span>
          <span className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide">
            Melhor Sequência
          </span>
        </div>

        {/* Active Days */}
        <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg text-center">
          <span className="text-3xl font-bold text-foreground">{activeDays}</span>
          <span className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide">
            Dias Ativos
          </span>
        </div>
      </div>

      {streakCurrent === 0 && activeDays > 0 && (
        <div className="mt-4 p-3 bg-orange-500/10 text-orange-700 dark:text-orange-400 text-sm rounded-lg text-center">
          Faça um check-in hoje para retomar sua sequência!
        </div>
      )}
      
      {activeDays === 0 && (
        <div className="mt-4 p-3 bg-primary/10 text-primary text-sm rounded-lg text-center">
          Comece um desafio hoje para iniciar sua jornada!
        </div>
      )}
    </div>
  );
}

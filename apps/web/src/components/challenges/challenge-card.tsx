import Link from 'next/link';
import { Challenge, ChallengeParticipant } from '@seedfy/shared';
import { Target, CheckCircle, Clock, BookOpen, Utensils, Zap, Users } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  participant?: ChallengeParticipant;
  isJourney?: boolean;
  checkedInToday?: boolean;
  debugInfo?: any;
}

const iconMap = {
  reading: BookOpen,
  meditation: Zap,
  fasting: Utensils,
  communion: Users,
};

export function ChallengeCard({ challenge, participant, isJourney, checkedInToday, debugInfo }: ChallengeCardProps) {
  const Icon = iconMap[challenge.type as keyof typeof iconMap] || Target;
  
  const progress = participant?.progress || 0;
  const total = challenge.duration_days || 0;
  const percent = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  
  const isLoading = checkedInToday === undefined;
  const showDebug = process.env.NEXT_PUBLIC_DEBUG_CHECKINS === 'true';

  return (
    <Link 
      href={`/app/challenges/${challenge.id}`}
      className="group flex flex-col bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden"
    >
      {showDebug && debugInfo && (
        <div className="absolute inset-0 bg-black/90 p-2 text-[10px] text-green-400 font-mono overflow-auto z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="font-bold text-white mb-1">DEBUG MODE</p>
          <p>ID: {debugInfo.challengeId.slice(0,8)}...</p>
          <p>Key: {debugInfo.todayKey}</p>
          <p>Done: {String(debugInfo.done)}</p>
          <p>Reason: {debugInfo.reason}</p>
          <div className="mt-1 border-t border-gray-700 pt-1">
             Filter: {JSON.stringify(debugInfo.queryFilter)}
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${
          isJourney ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
          challenge.type === 'reading' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
          challenge.type === 'fasting' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
          challenge.type === 'meditation' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
          'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {isJourney ? <Target className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
        </div>
        
        <div className="flex gap-2">
          {isLoading ? (
            <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
          ) : checkedInToday && (
             <div className="flex items-center text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Feito hoje
            </div>
          )}
          {isJourney && (
            <div className="flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-full border border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30">
              Jornada
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors mb-1 line-clamp-1">
          {challenge.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {challenge.duration_days} dias • {translateType(challenge.type)}
        </p>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progresso</span>
          <span className="font-medium text-foreground">{progress} / {total} dias</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              percent === 100 ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function translateType(type: string) {
  const map: Record<string, string> = {
    reading: 'Leitura',
    meditation: 'Meditação',
    fasting: 'Jejum',
    communion: 'Comunhão',
  };
  return map[type] || type;
}

import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { CheckinButton } from '@/components/challenges/checkin-button';
import { QuitChallengeButton } from '@/components/challenges/quit-challenge-button';
import { Challenge, ChallengeParticipant, getTodayKey, getDayIndex } from '@seedfy/shared';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft, Calendar, Trophy, BarChart, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { JourneyTodayView } from '@/components/challenges/journey-today-view';
import { JourneyTrailView } from '@/components/challenges/journey-trail-view';
import { JourneyTabs } from '@/components/challenges/journey-tabs';
import { getCheckinStatusMap } from '@/lib/checkin-helper';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeDetailPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch challenge details
  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single();

  if (!challenge) {
    notFound();
  }

  // 2. Fetch participant info
  const { data: participant } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', id)
    .eq('user_id', user.id)
    .single();

  if (!participant) {
    // If user is not participant, redirect (or show join button - out of scope for now)
    redirect('/app/challenges');
  }

  const showDebug = process.env.NEXT_PUBLIC_DEBUG_CHECKINS === 'true';

  const typedChallenge = challenge as Challenge & { journey_id?: string; timezone?: string };
  const typedParticipant = participant as ChallengeParticipant;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isQuit = (typedParticipant as any).status === 'quit';

  // Single Source of Truth for Checkins
  const checkinStatusMap = await getCheckinStatusMap(supabase, user.id, [{ ...typedChallenge, id }]);
  const status = checkinStatusMap.get(id);
  const isDoneToday = status?.done || false;
  // If done today, pass todayKey to disable button. If not, pass null (button enabled).
  const latestCheckinDate = isDoneToday ? status?.todayKey : null; 
  const debugInfo = status?.debug;

  // Handle Journey Mode
  if (typedChallenge.journey_id) {
    // Calculate current day based on timezone
    // If timezone is not set on challenge, we might default to browser (client-side) but here we are server-side.
    // Ideally we use the challenge's timezone or a default.
    // The getDayIndex function handles the date diff logic.
    const dayIndex = getDayIndex(typedChallenge.start_date, typedChallenge.timezone);
    
    // Clamp dayIndex to duration
    const currentDay = Math.min(Math.max(1, dayIndex), typedChallenge.duration_days || 1);

    // Fetch Journey Template Chapters
    const { data: chapters } = await supabase
      .from('journey_chapter_templates')
      .select('*')
      .eq('journey_id', typedChallenge.journey_id)
      .order('day_index', { ascending: true });

    // Fetch user's completed chapters (checkins) for this challenge
    const { data: completedCheckins } = await supabase
      .from('daily_checkins')
      .select('day_index')
      .eq('challenge_id', id)
      .eq('user_id', user.id);
    
    const completedDayIndexes = completedCheckins?.map(c => c.day_index).filter(Boolean) as number[] || [];
    
    // Find today's chapter
    const currentChapter = chapters?.find(c => c.day_index === currentDay);
    
    return (
       <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {showDebug && debugInfo && (
          <div className="absolute top-0 right-0 bg-black/90 p-2 text-[10px] text-green-400 font-mono z-50 pointer-events-none rounded">
            <p className="font-bold text-white mb-1">DEBUG MODE</p>
            <p>ID: {debugInfo.challengeId.slice(0,8)}...</p>
            <p>Key: {debugInfo.todayKey}</p>
            <p>Done: {String(debugInfo.done)}</p>
            <div className="mt-1 border-t border-gray-700 pt-1">
               Filter: {JSON.stringify(debugInfo.queryFilter)}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/app/challenges"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Voltar para meus desafios
          </Link>
          
          <QuitChallengeButton 
            challengeId={id} 
            userId={user.id} 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            status={(typedParticipant as any).status} 
          />
        </div>

        {isQuit && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-900">Você desistiu deste desafio</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Seus check-ins anteriores foram mantidos. Se desejar continuar, clique em &quot;Entrar novamente&quot; acima.
              </p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-6">
           <div className="p-6 border-b border-border">
             <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide bg-white border border-gray-200 text-purple-600 shadow-sm">
                  Jornada
                </span>
                <span className="text-sm text-muted-foreground">Dia {currentDay} de {typedChallenge.duration_days}</span>
             </div>
             <h1 className="text-2xl font-bold text-card-foreground mb-2">{typedChallenge.title}</h1>
           </div>
           
           <JourneyTabs 
             todayContent={
               currentChapter ? (
                 <JourneyTodayView 
                   chapter={currentChapter}
                   challengeId={id}
                   userId={user.id}
                   latestCheckinDate={latestCheckinDate}
                   participantId={typedParticipant.challenge_id + '_' + typedParticipant.user_id}
                   dayIndex={currentDay}
                   timezone={typedChallenge.timezone}
                   isQuit={isQuit}
                 />
               ) : (
                 <div className="text-center py-12 text-muted-foreground">
                   <p>Nenhum conteúdo disponível para hoje.</p>
                 </div>
               )
             }
             trailContent={
               <JourneyTrailView 
                 chapters={chapters || []}
                 currentDayIndex={currentDay}
                 completedDayIndexes={completedDayIndexes}
               />
             }
           />
        </div>
       </div>
    );
  }

  // Legacy View Logic
  const progress = typedParticipant.progress || 0;
  const total = typedChallenge.duration_days || 1;
  const percent = Math.min(100, Math.round((progress / total) * 100));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/app/challenges"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Voltar para meus desafios
        </Link>
        <QuitChallengeButton 
          challengeId={id} 
          userId={user.id} 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status={(typedParticipant as any).status} 
        />
      </div>

      {isQuit && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-900">Você desistiu deste desafio</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Seus check-ins anteriores foram mantidos. Se desejar continuar, clique em &quot;Entrar novamente&quot; acima.
            </p>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-6">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide border shadow-sm bg-white ${
              typedChallenge.type === 'reading' ? 'border-gray-200 text-blue-600' :
              typedChallenge.type === 'fasting' ? 'border-gray-200 text-orange-600' :
              'border-gray-200 text-gray-600'
            }`}>
              {translateType(typedChallenge.type)}
            </span>
            {typedParticipant.status === 'completed' && (
              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Concluído
              </span>
            )}
            {isQuit && (
              <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Desistiu
              </span>
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">{typedChallenge.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{typedChallenge.duration_days} dias</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              <span>Dia {progress}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-muted/30 px-6 sm:px-8 py-6 border-t border-border">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-card-foreground">Seu progresso</span>
            <span className="text-muted-foreground">{percent}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percent === 100 ? 'bg-success' : 'bg-primary'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Check-in Action */}
      {(typedParticipant.status === 'active' || isQuit) && (
        <div className={`bg-card rounded-xl border border-border shadow-sm p-6 mb-6 ${isQuit ? 'opacity-70 grayscale' : ''}`}>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <BarChart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Check-in Diário</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Registre sua atividade de hoje para manter o progresso e a constância no desafio.
              </p>
            </div>
          </div>

          <CheckinButton 
            challengeId={id} 
            userId={user.id} 
            latestCheckinDate={latestCheckinDate}
            participantId={typedParticipant.challenge_id + '_' + typedParticipant.user_id} 
            timezone={typedChallenge.timezone}
            disabled={isQuit}
            disabledLabel="Você saiu deste desafio"
          />
        </div>
      )}
    </div>
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient, ChallengeTypeEnum, Group } from '@seedfy/shared';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Brain, 
  UtensilsCrossed, 
  Users, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Loader2, 
  Target, 
  Calendar 
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists, standard in shadcn/ui

// Types
type ChallengeType = 'reading' | 'meditation' | 'fasting' | 'communion';
type DurationPreset = 3 | 7 | 14 | 21;

interface CreateChallengeWizardProps {
  groups: Group[];
}

interface WizardState {
  type: ChallengeType | null;
  title: string;
  duration_days: DurationPreset | null;
  group_id: string | null;
}

const STEPS = [
  { id: 1, title: 'Tipo' },
  { id: 2, title: 'Detalhes' },
  { id: 3, title: 'Grupo' },
  { id: 4, title: 'Confirmar' },
];

export function CreateChallengeWizard({ groups }: CreateChallengeWizardProps) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<WizardState>({
    type: null,
    title: '',
    duration_days: 7, // Default to 7
    group_id: null,
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!formData.type;
      case 2: return !!formData.title && formData.title.length >= 3 && !!formData.duration_days;
      case 3: return !!formData.group_id;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.duration_days || !formData.group_id) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado.');
        return;
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (formData.duration_days - 1)); // -1 because start day counts

      // 1. Create Challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          created_by: user.id,
          title: formData.title,
          type: formData.type,
          duration_days: formData.duration_days,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          group_id: formData.group_id,
          unlock_policy: 'daily', // Default per PRD
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
        .select()
        .single();

      if (challengeError) {
        console.error('Error creating challenge:', challengeError);
        toast.error('Erro ao criar desafio.');
        setLoading(false);
        return;
      }

      // 2. Add creator as participant
      const { error: partError } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          status: 'active',
          joined_at: new Date().toISOString(),
          progress: 0
        });

      if (partError) {
        console.error('Error adding participant:', partError);
        // We might want to rollback here in a real app, but for now just warn
        toast.error('Desafio criado, mas houve erro ao entrar.');
      } else {
        toast.success('Desafio criado com sucesso!');
        router.push(`/app/challenges/${challenge.id}`);
        router.refresh();
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="relative flex items-center justify-between px-2 mb-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-300 -z-10" 
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-card">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors border-2",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  !isActive && !isCompleted && "border-gray-200 bg-white text-gray-500"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={cn(
                "text-xs font-medium hidden sm:block",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {currentStep === 1 && (
          <StepType 
            selected={formData.type} 
            onSelect={(type) => setFormData(prev => ({ ...prev, type }))} 
          />
        )}
        {currentStep === 2 && (
          <StepDetails 
            title={formData.title}
            duration={formData.duration_days}
            onUpdate={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
          />
        )}
        {currentStep === 3 && (
          <StepGroup 
            groups={groups}
            selectedGroupId={formData.group_id}
            onSelect={(group_id) => setFormData(prev => ({ ...prev, group_id }))}
          />
        )}
        {currentStep === 4 && (
          <StepConfirm 
            data={formData} 
            groups={groups}
          />
        )}
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>

        {currentStep === STEPS.length ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Criar Challenge
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function StepType({ selected, onSelect }: { selected: ChallengeType | null, onSelect: (t: ChallengeType) => void }) {
  const types: { id: ChallengeType; label: string; icon: any; desc: string }[] = [
    { id: 'reading', label: 'Leitura Bíblica', icon: BookOpen, desc: 'Ler capítulos da Bíblia diariamente' },
    { id: 'meditation', label: 'Meditação', icon: Brain, desc: 'Tempo focado em oração e reflexão' },
    { id: 'fasting', label: 'Jejum', icon: UtensilsCrossed, desc: 'Abstinência parcial ou total' },
    { id: 'communion', label: 'Comunhão', icon: Users, desc: 'Encontros e partilha em grupo' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-6">Escolha o tipo de desafio</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {types.map((type) => {
          const Icon = type.icon;
          const isSelected = selected === type.id;
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={cn(
                "flex flex-col items-center p-6 rounded-xl border-2 transition-all hover:border-primary/50 text-center",
                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground">{type.label}</h3>
              <p className="text-xs text-muted-foreground mt-2">{type.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepDetails({ 
  title, 
  duration, 
  onUpdate 
}: { 
  title: string; 
  duration: DurationPreset | null;
  onUpdate: (data: Partial<WizardState>) => void;
}) {
  const presets: DurationPreset[] = [3, 7, 14, 21];

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-center mb-6">Detalhes do desafio</h2>
      
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
          Título do Desafio
        </label>
        <div className="relative">
          <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ex: Leitura de Provérbios"
            maxLength={60}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground text-right">
          {title.length}/60
        </p>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Duração (dias)
        </label>
        <div className="grid grid-cols-4 gap-3">
          {presets.map((days) => (
            <button
              key={days}
              onClick={() => onUpdate({ duration_days: days })}
              className={cn(
                "py-2 px-1 rounded-lg text-sm font-medium border transition-all",
                duration === days 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : "border-input hover:border-primary/50 text-foreground"
              )}
            >
              {days} dias
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepGroup({ 
  groups, 
  selectedGroupId, 
  onSelect 
}: { 
  groups: Group[]; 
  selectedGroupId: string | null;
  onSelect: (id: string) => void;
}) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo encontrado</h3>
        <p className="text-gray-500 mb-6">
          Você precisa participar de um grupo para criar um desafio.
        </p>
        <a 
          href="/app/groups/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
        >
          Criar Grupo
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-center mb-6">Escolha um grupo</h2>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {groups.map((group) => {
          const isSelected = selectedGroupId === group.id;
          return (
            <button
              key={group.id}
              onClick={() => group.id && onSelect(group.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl border transition-all text-left",
                isSelected 
                  ? "border-primary bg-primary/5 ring-1 ring-primary" 
                  : "border-border hover:bg-muted/50"
              )}
            >
              {group.image_url ? (
                <img src={group.image_url} alt={group.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {group.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{group.name}</p>
                {/* Optional: Add member count if available in type */}
              </div>
              {isSelected && <Check className="w-5 h-5 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepConfirm({ data, groups }: { data: WizardState; groups: Group[] }) {
  const selectedGroup = groups.find(g => g.id === data.group_id);
  const typeLabels: Record<string, string> = {
    reading: 'Leitura Bíblica',
    meditation: 'Meditação',
    fasting: 'Jejum',
    communion: 'Comunhão',
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-center mb-6">Revisar e Confirmar</h2>
      
      <div className="bg-muted/30 rounded-xl border border-border overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Tipo</span>
            <span className="font-medium flex items-center gap-2">
              {data.type && typeLabels[data.type]}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Título</span>
            <span className="font-medium">{data.title}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Duração</span>
            <span className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {data.duration_days} dias
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Grupo</span>
            <span className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              {selectedGroup?.name}
            </span>
          </div>
        </div>
        
        <div className="bg-primary/5 p-4 text-xs text-muted-foreground text-center">
          Ao criar, o desafio iniciará imediatamente e você será inscrito automaticamente.
        </div>
      </div>
    </div>
  );
}

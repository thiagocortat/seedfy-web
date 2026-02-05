'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient, Church } from '@seedfy/shared';
import { ChurchPicker } from '@/components/church/church-picker';
import { Loader2, MapPin, Building2 } from 'lucide-react';

interface ChurchStepProps {
  onNext: () => void;
}

export function ChurchStep({ onNext }: ChurchStepProps) {
  const [churchId, setChurchId] = useState<string | null>(null);
  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchCurrentChurch();
  }, []);

  const fetchCurrentChurch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Force fresh fetch
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('church_id')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      if (userData?.church_id) {
        setChurchId(userData.church_id);
        const { data: churchData, error: churchError } = await supabase
          .from('churches')
          .select('*')
          .eq('id', userData.church_id)
          .single();
        
        if (churchError) throw churchError;
        setChurch(churchData);
      } else {
        setChurchId(null);
        setChurch(null);
      }
    } catch (error) {
      console.error('Error fetching church:', JSON.stringify(error, null, 2));
      // Optional: toast.error('Erro ao carregar igreja.');
    } finally {
      setLoading(false);
    }
  };

  const handleChurchSelect = async () => {
    // Add a small delay to ensure DB write propagation if necessary, 
    // though usually not needed with strong consistency.
    // Re-fetch immediately.
    await fetchCurrentChurch();
  };

  const handleSkip = () => {
    onNext();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Sua Igreja</h2>
        <p className="text-muted-foreground">Encontre sua comunidade local</p>
      </div>

      <div className="space-y-4">
        {church ? (
          <div className="bg-muted p-4 rounded-lg flex items-center gap-4 border border-border">
             <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border overflow-hidden">
                {church.logo_url ? (
                   <img src={church.logo_url} alt={church.name} className="w-full h-full object-cover" />
                ) : (
                   <Building2 className="w-6 h-6 text-muted-foreground" />
                )}
             </div>
             <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{church.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{[church.city, church.state].filter(Boolean).join(', ')}</p>
             </div>
          </div>
        ) : (
          <div className="bg-muted/50 p-8 rounded-lg border border-dashed border-muted-foreground/25 flex flex-col items-center justify-center text-center space-y-2">
            <MapPin className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhuma igreja selecionada</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
           <ChurchPicker 
             currentChurchId={churchId || undefined}
             onSuccess={handleChurchSelect}
             trigger={
               <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                 {church ? 'Alterar Igreja' : 'Selecionar Igreja'}
               </button>
             }
           />
           
           <button
             onClick={onNext}
             className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
           >
             Continuar
           </button>

           {!church && (
             <button
               onClick={handleSkip}
               className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
             >
               Pular por enquanto
             </button>
           )}
        </div>
      </div>
    </div>
  );
}

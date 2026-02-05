'use client';

import { useState, useEffect } from 'react';
import { Church, createBrowserClient } from '@seedfy/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, MapPin, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ChurchPickerProps {
  currentChurchId?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ChurchPicker({ currentChurchId, trigger, onSuccess }: ChurchPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    if (open) {
      fetchChurches();
    }
  }, [open, query]);

  const fetchChurches = async () => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('churches')
        .select('*')
        .order('name');

      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      setChurches(data || []);
    } catch (error) {
      console.error('Error fetching churches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (churchId: string) => {
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({ church_id: churchId })
        .eq('id', user.id);

      if (error) {
        if (error.code === '42501') {
          toast.error('Não foi possível alterar sua igreja neste ambiente.');
        } else {
          toast.error('Erro ao atualizar igreja.');
        }
        throw error;
      }

      toast.success('Igreja atualizada com sucesso!');
      setOpen(false);
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating church:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-sm text-primary hover:underline">
            Selecionar Igreja
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Igreja</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full pl-9 pr-3 py-2 bg-muted border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : churches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma igreja encontrada.
            </div>
          ) : (
            churches.map((church) => {
              const isSelected = church.id === currentChurchId;
              return (
                <button
                  key={church.id}
                  onClick={() => handleSelect(church.id!)}
                  disabled={updating}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                    isSelected 
                      ? 'bg-primary/5 border border-primary/20' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 overflow-hidden border border-border">
                      {church.logo_url ? (
                        <img src={church.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <MapPin className="w-5 h-5 m-auto text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-foreground">{church.name}</div>
                      {(church.city || church.state) && (
                        <div className="text-xs text-muted-foreground">
                          {[church.city, church.state].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                  {updating && isSelected && <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

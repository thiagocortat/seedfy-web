'use client';

import { Church, ChurchPost } from '@seedfy/shared';
import { ChurchPicker } from '@/components/church/church-picker';
import { Building2, ArrowRight, Pin, Calendar } from 'lucide-react';
import Link from 'next/link';

interface MyChurchBlockProps {
  churchId?: string | null;
  church?: Church | null;
  posts?: ChurchPost[];
}

export function MyChurchBlock({ churchId, church, posts = [] }: MyChurchBlockProps) {
  // 1. Empty State (No Church Selected)
  if (!churchId || !church) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 mb-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Minha Igreja</h3>
        <p className="text-muted-foreground text-sm max-w-xs mb-6">
          Selecione sua igreja para ver posts, avisos e ações rápidas da sua comunidade.
        </p>
        <ChurchPicker 
          trigger={
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Selecionar Igreja
            </button>
          }
        />
      </div>
    );
  }

  // 2. Active State (Church Selected)
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden">
            {church.logo_url ? (
              <img src={church.logo_url} alt={church.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-foreground">{church.name}</h3>
            {(church.city || church.state) && (
              <p className="text-xs text-muted-foreground">
                {[church.city, church.state].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ChurchPicker 
            currentChurchId={church.id}
            trigger={
              <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Trocar
              </button>
            }
          />
          <Link 
            href="/app/church"
            className="hidden sm:inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-md hover:bg-primary/20 transition-colors"
          >
            Ver Igreja
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-foreground">Últimos Avisos</h4>
          <Link href="/app/church" className="text-xs text-primary hover:underline flex items-center">
            Ver todos <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/app/church/posts/${post.id}`}
                className="block group p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
              >
                <div className="flex gap-3">
                  {post.image_url && (
                    <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {post.pinned && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                          <Pin className="w-3 h-3 mr-1 rotate-45" />
                          Fixado
                        </span>
                      )}
                      {post.published_at && (
                        <span className="flex items-center text-[10px] text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(post.published_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {post.title}
                    </h5>
                    {post.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed border-border">
            Nenhum aviso recente.
          </div>
        )}
      </div>
    </div>
  );
}

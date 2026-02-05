import { ChurchPost } from '@seedfy/shared';
import { Calendar, Pin, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PostDetailProps {
  post: ChurchPost;
}

export function PostDetail({ post }: PostDetailProps) {
  const date = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  return (
    <article className="max-w-3xl mx-auto bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {post.image_url && (
        <div className="relative w-full h-64 sm:h-96">
          <img 
            src={post.image_url} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {post.pinned && (
            <span className="inline-flex items-center text-primary bg-primary/10 px-2.5 py-1 rounded-full text-xs font-medium">
              <Pin className="w-3 h-3 mr-1 rotate-45" />
              Fixado
            </span>
          )}
          {date && (
            <span className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-1.5" />
              {date}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="prose prose-gray max-w-none mb-8">
          {post.body.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {post.link_url && (
          <div className="border-t border-border pt-6 mt-8">
            <a 
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Acessar Link Externo
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

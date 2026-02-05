import Link from 'next/link';
import { ChurchPost } from '@seedfy/shared';
import { Pin, Calendar, ArrowRight } from 'lucide-react';

interface PostCardProps {
  post: ChurchPost;
}

export function PostCard({ post }: PostCardProps) {
  const date = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  return (
    <Link 
      href={`/app/church/posts/${post.id}`}
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-primary/20"
    >
      {post.image_url && (
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={post.image_url} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {post.pinned && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-md flex items-center shadow-sm">
              <Pin className="w-3 h-3 mr-1 rotate-45" />
              Fixado
            </div>
          )}
        </div>
      )}
      
      <div className="p-5">
        {!post.image_url && post.pinned && (
          <div className="inline-flex items-center text-primary text-xs font-medium mb-3 bg-primary/10 px-2 py-1 rounded-md">
            <Pin className="w-3 h-3 mr-1 rotate-45" />
            Fixado
          </div>
        )}

        {date && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Calendar className="w-3 h-3 mr-1" />
            {date}
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        
        {post.excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center text-primary text-sm font-medium mt-auto">
          Ler mais
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

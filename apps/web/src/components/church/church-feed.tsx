import { ChurchPost } from '@seedfy/shared';
import { PostCard } from './post-card';
import { FileText } from 'lucide-react';

interface ChurchFeedProps {
  posts: ChurchPost[];
}

export function ChurchFeed({ posts }: ChurchFeedProps) {
  if (!posts.length) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">Nenhuma publicação ainda</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Fique de olho, em breve teremos novidades por aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

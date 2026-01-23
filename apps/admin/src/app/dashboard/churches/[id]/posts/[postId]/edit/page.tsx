import { createServiceClient } from '@seedfy/shared/server';
import PostForm from '../../post-form';
import { notFound } from 'next/navigation';

export default async function EditPostPage(props: { 
  params: Promise<{ id: string; postId: string }> 
}) {
  const params = await props.params;
  const supabase = createServiceClient();

  const { data: post } = await supabase
    .from('church_posts')
    .select('*')
    .eq('id', params.postId)
    .single();

  if (!post) {
    notFound();
  }

  return <PostForm churchId={params.id} post={post} />;
}

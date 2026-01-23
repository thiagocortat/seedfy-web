import PostForm from '../post-form';

export default async function NewPostPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <PostForm churchId={params.id} />;
}

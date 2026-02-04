import { createServerClient } from '@seedfy/shared/server';
import { cookies } from 'next/headers';

export async function getRedirectForWebCTA() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  return session ? '/app' : '/login';
}

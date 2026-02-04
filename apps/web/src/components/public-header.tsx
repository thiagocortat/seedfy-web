import { getRedirectForWebCTA } from '@/lib/auth-helper';
import { PublicHeaderClient } from './public-header-client';

export async function PublicHeader() {
  const webAppUrl = await getRedirectForWebCTA();
  return <PublicHeaderClient webAppUrl={webAppUrl} />;
}

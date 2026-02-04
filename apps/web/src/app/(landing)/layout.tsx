import { PublicHeader } from '@/components/public-header';
import { PublicFooter } from '@/components/public-footer';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />
      <main className="flex-grow pt-16 min-h-screen flex flex-col">
        {children}
      </main>
      <PublicFooter />
    </>
  );
}

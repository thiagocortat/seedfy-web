'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="h-16 bg-card border-b border-border fixed top-0 left-0 right-0 z-40 flex items-center px-4 md:px-6 justify-between">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 -ml-2 text-muted-foreground">
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/app" className="text-xl font-bold text-primary">
          Seedfy
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold">
          U
        </div>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Library, Users, Trophy, User, LogOut } from 'lucide-react';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';

const navItems = [
  { href: '/app', label: 'Início', icon: LayoutDashboard },
  { href: '/app/content', label: 'Conteúdo', icon: Library },
  { href: '/app/groups', label: 'Grupos', icon: Users },
  { href: '/app/challenges', label: 'Desafios', icon: Trophy },
  { href: '/app/profile', label: 'Perfil', icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado com sucesso');
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-border min-h-screen flex-col fixed left-0 top-0 pt-16 z-30">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/app' 
            ? pathname === item.href 
            : pathname.startsWith(item.href) && item.href !== '/app';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-muted text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Library, Users, Trophy, User } from 'lucide-react';

const navItems = [
  { href: '/app', label: 'Início', icon: LayoutDashboard },
  { href: '/app/groups', label: 'Grupos', icon: Users },
  { href: '/app/content', label: 'Conteúdo', icon: Library },
  { href: '/app/challenges', label: 'Desafios', icon: Trophy },
  { href: '/app/profile', label: 'Perfil', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-4 pb-4 pt-2 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/app' 
            ? pathname === item.href 
            : pathname.startsWith(item.href) && item.href !== '/app';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors min-w-[64px] ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

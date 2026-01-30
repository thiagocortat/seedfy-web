'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Library, Church, LogOut, Map } from 'lucide-react';
import { createBrowserClient } from '@seedfy/shared';
import { toast } from 'sonner';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/content', label: 'Conteúdo', icon: Library },
  { href: '/dashboard/journeys', label: 'Jornadas', icon: Map },
  { href: '/dashboard/churches', label: 'Igrejas', icon: Church },
];

export function Sidebar() {
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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-blue-600">Seedfy Admin</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // Fix logic to avoid partial match on root dashboard route
          // If href is exactly '/dashboard', require exact match
          // Otherwise, allow sub-paths (e.g. /dashboard/content/new should match /dashboard/content)
          const isActive = item.href === '/dashboard' 
            ? pathname === item.href 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}

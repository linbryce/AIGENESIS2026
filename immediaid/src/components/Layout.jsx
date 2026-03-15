import { Link, Outlet, useLocation } from 'react-router-dom';
import { Map, Upload, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/Visualization', icon: Map, label: 'Map' },
  { path: '/Upload', icon: Upload, label: 'Upload' },
  { path: '/Profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-background font-inter">
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <nav className="bg-card border-t border-border flex items-center justify-around px-4 py-2 safe-area-pb shrink-0"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        {tabs.map(({ path, icon: TabIcon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path}
              className={cn(
                'flex flex-col items-center gap-1 px-6 py-1.5 rounded-xl transition-all',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}>
              <TabIcon className={cn('w-5 h-5 transition-all', active && 'scale-110')} />
              <span className={cn('text-xs font-medium', active ? 'font-semibold' : '')}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, Bell, Calendar, CreditCard, FileText, History, LayoutDashboard, LogOut, Zap, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bills', label: 'My Bills', icon: FileText },
  { to: '/bills/calendar', label: 'Due Calendar', icon: Calendar },
  { to: '/payments', label: 'Pay Bills', icon: CreditCard },
  { to: '/history', label: 'History', icon: History },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/activity', label: 'Activity Log', icon: Activity },
];

function SidebarItem({ to, label, icon: Icon }: { to: string; label: string; icon: LucideIcon }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <button
      onClick={() => navigate(to)}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
        active ? 'gradient-primary text-white shadow-glow' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export default function UserSidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login/user', { replace: true });
  };

  return (
    <aside className="hidden min-h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
        <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-glow">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-extrabold tracking-tight">BillStack</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {userLinks.map((link) => <SidebarItem key={link.to} {...link} />)}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="mb-3 px-3">
          <div className="flex items-center gap-2">
            <div className="gradient-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground/80">{user?.name || user?.email}</p>
              <p className="truncate text-[10px] text-sidebar-foreground/40">User</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start rounded-xl text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>
    </aside>
  );
}

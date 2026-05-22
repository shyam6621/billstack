import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, FileText, CreditCard, History, Users, BarChart3, LogOut, Zap, Shield, Activity, Bell, ShieldAlert, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: Shield },
    { to: '/admin/users', label: 'Users Management', icon: Users },
    { to: '/admin/bills', label: 'Bills Management', icon: FileText },
    { to: '/admin/transactions', label: 'Transactions', icon: BarChart3 },
    { to: '/admin/revenue', label: 'Revenue Analytics', icon: TrendingUp },
    { to: '/admin/fraud', label: 'Fraud Alerts', icon: ShieldAlert },
];

function NavItem({ to, label, icon: Icon, active, onClick }: { to: string; label: string; icon: any; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                    ? 'gradient-primary text-white shadow-glow'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );
}

export default function Sidebar() {
    const { role, signOut, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = role === 'admin';

    return (
        <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
                    <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-extrabold text-xl tracking-tight">BillStack</span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {/* User Section */}
                {!isAdmin && userLinks.map(link => (
                    <NavItem
                        key={link.to}
                        {...link}
                        active={location.pathname === link.to}
                        onClick={() => navigate(link.to)}
                    />
                ))}

                {/* Admin Section */}
                {isAdmin && (
                    <>
                        <div className="pt-4 pb-2 px-3">
                            <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Admin Panel</p>
                        </div>
                        {adminLinks.map(link => (
                            <NavItem
                                key={link.to}
                                {...link}
                                active={location.pathname === link.to}
                                onClick={() => navigate(link.to)}
                            />
                        ))}
                    </>
                )}
            </nav>

            <div className="px-3 py-4 border-t border-sidebar-border">
                <div className="px-3 mb-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-sidebar-foreground/80 truncate">{user?.name || user?.email}</p>
                            <p className="text-[10px] text-sidebar-foreground/40 truncate">{role === 'admin' ? '🛡️ Admin' : '👤 User'}</p>
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl"
                    onClick={() => { signOut(); navigate('/login'); }}
                >
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
            </div>
        </aside>
    );
}

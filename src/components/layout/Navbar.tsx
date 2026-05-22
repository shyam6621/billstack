import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import logo from '../../../assets/logo.png';

export default function Navbar() {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <img src={logo} alt="BillStack logo" className="h-11 w-11 rounded-2xl object-contain" />
                <h2 className="text-lg font-semibold tracking-tight lg:hidden">BillStack</h2>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground mr-2 hidden sm:inline-block">
                    Welcome back, {user?.email?.split('@')[0] || 'User'}
                </span>
                <NotificationBell />
            </div>
        </header>
    );
}

import NotificationBell from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from '../../../assets/logo.png';

export default function Navbar() {
    const { role, signOut, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const homePath = role === 'ADMIN' ? '/admin' : '/dashboard';
    const loginPath = role === 'ADMIN' ? '/login/admin' : '/login/user';
    const isHomePage = location.pathname === homePath;

    const handleBack = () => {
        if (window.history.length > 1 && !isHomePage) {
            navigate(-1);
            return;
        }

        navigate(homePath);
    };

    const handleLogout = async () => {
        await signOut();
        navigate(loginPath, { replace: true });
    };

    return (
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 sm:px-6">
            <div className="flex items-center gap-2 min-w-0 sm:gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    aria-label="Go back"
                    onClick={handleBack}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <img src={logo} alt="BillStack logo" className="h-11 w-11 rounded-2xl object-contain" />
                <h2 className="truncate text-lg font-semibold tracking-tight lg:hidden">BillStack</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
                <span className="max-w-48 truncate text-sm font-medium text-muted-foreground hidden sm:inline-block">
                    Welcome back, {user?.email?.split('@')[0] || 'User'}
                </span>
                <NotificationBell />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 shrink-0 px-3"
                    aria-label="Logout"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Logout</span>
                </Button>
            </div>
        </header>
    );
}

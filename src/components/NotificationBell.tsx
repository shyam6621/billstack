import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Bell, CheckCheck, CreditCard, FileText, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; className: string }> = {
  SUCCESS: { icon: CreditCard, className: 'text-success' },
  BILL: { icon: FileText, className: 'text-primary' },
  ERROR: { icon: AlertTriangle, className: 'text-destructive' },
  INFO: { icon: Info, className: 'text-info' },
};

export default function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const data = await fetchWithAuth('/notifications') || [];
      return (data || []) as unknown as Notification[];
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    // Refresh notifications every 30 seconds instead of using WebSockets for now
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }, 30000);
    return () => clearInterval(intervalId);
  }, [user, queryClient]);

  const markAllRead = useMutation({
    mutationFn: async () => {
      await fetchWithAuth('/notifications/mark-all-read', { method: 'PUT' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth('/notifications/mark-read', {
        method: 'PUT',
        body: JSON.stringify({ notificationIds: [id] })
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-xl"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-primary text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-card shadow-xl animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-bold text-sm">Notifications</span>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => markAllRead.mutate()}>
                    <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => {
                    const config = typeConfig[n.type] || typeConfig.INFO;
                    const Icon = config.icon;
                    return (
                      <button
                        key={n.id}
                        className={cn(
                          'w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors flex gap-3',
                          !n.read && 'bg-accent/30'
                        )}
                        onClick={() => !n.read && markRead.mutate(n.id)}
                      >
                        <div className={cn('mt-0.5', config.className)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs">{n.title}</span>
                            {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}

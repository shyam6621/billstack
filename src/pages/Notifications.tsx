import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Bell, CheckCheck, CreditCard, FileText, AlertTriangle, Info,
  Trash2, Filter, BellOff, Clock
} from 'lucide-react';

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

const typeConfig: Record<string, { icon: any; label: string; className: string; badgeClass: string }> = {
  SUCCESS: { icon: CreditCard, label: 'Payment', className: 'text-success', badgeClass: 'bg-success/10 text-success border-success/30' },
  BILL: { icon: FileText, label: 'Bill', className: 'text-primary', badgeClass: 'bg-primary/10 text-primary border-primary/30' },
  ERROR: { icon: AlertTriangle, label: 'Alert', className: 'text-destructive', badgeClass: 'bg-destructive/10 text-destructive border-destructive/30' },
  INFO: { icon: Info, label: 'Info', className: 'text-info', badgeClass: 'bg-info/10 text-info border-info/30' },
};

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications-page', user?.id],
    queryFn: async () => {
      const data = await fetchWithAuth('/notifications');
      return (data || []) as Notification[];
    },
    enabled: !!user,
  });

  const filtered = filter === 'ALL'
    ? notifications
    : filter === 'UNREAD'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await fetchWithAuth('/notifications/mark-read', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setSelectedIds(new Set());
      toast({ title: 'Notifications marked as read' });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await fetchWithAuth('/notifications/mark-all-read', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: 'All notifications marked as read' });
    },
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(n => n.id)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <Card className="border-0 shadow-md">
        <CardContent className="py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="UNREAD">Unread</SelectItem>
                <SelectItem value="SUCCESS">Payments</SelectItem>
                <SelectItem value="BILL">Bills</SelectItem>
                <SelectItem value="ERROR">Alerts</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markReadMutation.mutate(Array.from(selectedIds))}
                disabled={markReadMutation.isPending}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark Read
              </Button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notification List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BellOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold">No notifications</p>
            <p className="text-muted-foreground text-sm">
              {filter !== 'ALL' ? 'Try changing the filter' : 'You\'re all caught up!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Select All */}
          <div className="flex items-center gap-3 px-4 py-2">
            <Checkbox
              checked={selectedIds.size === filtered.length && filtered.length > 0}
              onCheckedChange={selectAll}
            />
            <span className="text-xs text-muted-foreground font-medium">Select All</span>
          </div>

          {filtered.map((n, i) => {
            const config = typeConfig[n.type] || typeConfig.INFO;
            const Icon = config.icon;
            return (
              <Card
                key={n.id}
                className={cn(
                  'border-0 shadow-sm card-hover animate-fade-in',
                  !n.read && 'ring-1 ring-primary/20 bg-accent/30'
                )}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <CardContent className="py-4 flex items-start gap-4">
                  <Checkbox
                    checked={selectedIds.has(n.id)}
                    onCheckedChange={() => toggleSelect(n.id)}
                  />
                  <div className={cn('mt-0.5 p-2 rounded-xl', n.read ? 'bg-muted' : 'gradient-primary')}>
                    <Icon className={cn('h-4 w-4', n.read ? config.className : 'text-white')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{n.title}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                      <Badge variant="outline" className={cn('text-[10px] ml-auto', config.badgeClass)}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/60">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                      <span className="mx-1">·</span>
                      <span>{format(new Date(n.created_at), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => markReadMutation.mutate([n.id])}
                    >
                      Mark Read
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

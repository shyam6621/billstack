import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Activity, Search } from 'lucide-react';

const PAGE_SIZE = 15;

const actionLabels: Record<string, { label: string; color: string }> = {
  PAYMENT_SUCCESS: { label: 'Payment Success', color: 'bg-success/10 text-success border-success/30' },
  PAYMENT_COMPLETED: { label: 'Payment Success', color: 'bg-success/10 text-success border-success/30' },
  PAYMENT_FAILED: { label: 'Payment Failed', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: 'bg-warning/10 text-warning border-warning/30' },
  BILL_STATUS_PAID: { label: 'Bill Paid', color: 'bg-success/10 text-success border-success/30' },
  BILL_STATUS_OVERDUE: { label: 'Bill Overdue', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  BILL_REMINDER_SENT: { label: 'Reminder Sent', color: 'bg-primary/10 text-primary border-primary/30' },
  USER_REGISTERED: { label: 'User Registered', color: 'bg-primary/10 text-primary border-primary/30' },
};

function parseLogDetails(details: unknown): Record<string, unknown> | null {
  if (!details) return null;
  if (typeof details === 'object') return details as Record<string, unknown>;
  if (typeof details === 'string') {
    try {
      return JSON.parse(details) as Record<string, unknown>;
    } catch {
      return { message: details };
    }
  }
  return null;
}

function logCreatedAtValue(createdAt: unknown): string {
  if (!createdAt) return '';
  if (typeof createdAt === 'string') return createdAt;
  if (Array.isArray(createdAt)) {
    const [year, month, day, hour = 0, minute = 0] = createdAt;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  return String(createdAt);
}

export default function AuditLogs() {
  const { user, role } = useAuth();
  const [page, setPage] = useState(0);
  const [dateFilter, setDateFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['audit-logs', user?.id, page, dateFilter, actionFilter, role],
    queryFn: async () => {
      const endpoint = role === 'ADMIN' ? '/admin/audit-logs' : '/activity';
      const data = await fetchWithAuth(endpoint);
      const allLogs = Array.isArray(data) ? data : (data?.content || []);
      const filtered = allLogs.filter((log: { action?: string; created_at?: unknown }) => {
        if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
        const createdAt = logCreatedAtValue(log.created_at);
        if (dateFilter && createdAt && !createdAt.startsWith(dateFilter)) return false;
        return true;
      });
      const start = page * PAGE_SIZE;
      const paginated = filtered.slice(start, start + PAGE_SIZE);
      return { logs: paginated, count: filtered.length };
    },
    enabled: !!user,
  });

  const logs = data?.logs ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">Track all system events and transactions</p>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="py-4 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-9 w-48"
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setPage(0); }}
            />
          </div>
          <Select value={actionFilter} onValueChange={v => { setActionFilter(v); setPage(0); }}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              <SelectItem value="PAYMENT_SUCCESS">Payment Success</SelectItem>
              <SelectItem value="PAYMENT_FAILED">Payment Failed</SelectItem>
              <SelectItem value="BILL_STATUS_PAID">Bill Paid</SelectItem>
              <SelectItem value="BILL_STATUS_OVERDUE">Bill Overdue</SelectItem>
              <SelectItem value="BILL_REMINDER_SENT">Reminder Sent</SelectItem>
              <SelectItem value="USER_REGISTERED">User Registered</SelectItem>
            </SelectContent>
          </Select>
          {(dateFilter || actionFilter !== 'ALL') && (
            <Button variant="ghost" size="sm" onClick={() => { setDateFilter(''); setActionFilter('ALL'); }}>
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : isError ? (
            <p className="text-center py-12 text-destructive">
              {(error as Error)?.message || 'Failed to load activity logs.'}
            </p>
          ) : logs.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No activity logs found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/30">
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => {
                  const actionInfo = actionLabels[log.action] || { label: log.action, color: 'bg-muted text-muted-foreground' };
                  const details = parseLogDetails(log.details);
                  const createdAt = logCreatedAtValue(log.created_at);
                  return (
                    <TableRow key={log.id} className="hover:bg-accent/20 transition-colors">
                      <TableCell>
                        <Badge variant="outline" className={actionInfo.color}>
                          {actionInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        <span className="font-medium">{log.entity_type}</span>
                        {log.entity_id && (
                          <span className="block text-xs text-muted-foreground font-mono">
                            {log.entity_id.slice(0, 8)}...
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {details && (
                          <div className="text-xs space-y-0.5">
                            {details.amount && <span className="block font-medium">Amount: ${Number(details.amount).toFixed(2)}</span>}
                            {details.bill_type && <span className="block">Type: {details.bill_type}</span>}
                            {details.payment_method && <span className="block">Method: {details.payment_method}</span>}
                            {details.transaction_id && (
                              <span className="block font-mono text-muted-foreground">
                                TXN: {String(details.transaction_id).slice(0, 12)}...
                              </span>
                            )}
                            {details.old_status && (
                              <span className="block">{details.old_status} → {details.new_status}</span>
                            )}
                            {details.email && <span className="block">{details.email}</span>}
                            {details.days_before !== undefined && (
                              <span className="block">{details.days_before} day(s) before due</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap font-medium">
                        {createdAt ? format(new Date(createdAt), 'MMM d, yyyy HH:mm') : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

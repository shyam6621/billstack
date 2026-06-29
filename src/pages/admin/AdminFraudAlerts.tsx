import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ShieldAlert, CheckCircle, AlertTriangle, Zap, Copy, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

const severityConfig: Record<string, { color: string; icon: any }> = {
  HIGH: { color: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertTriangle },
  MEDIUM: { color: 'bg-warning/10 text-warning border-warning/30', icon: AlertTriangle },
  LOW: { color: 'bg-info/10 text-info border-info/30', icon: AlertTriangle },
};

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  VELOCITY: { label: 'Velocity', icon: Zap, color: 'text-destructive' },
  AMOUNT_ANOMALY: { label: 'Amount Anomaly', icon: DollarSign, color: 'text-warning' },
  DUPLICATE: { label: 'Duplicate', icon: Copy, color: 'text-info' },
};

export default function AdminFraudAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [showResolved, setShowResolved] = useState(false);

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles-lookup'],
    queryFn: async () => {
      const data = await fetchWithAuth('/admin/users');
      return data || [];
    },
  });
  const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]));

  const { data, isLoading } = useQuery({
    queryKey: ['fraud-alerts'],
    queryFn: async () => {
      const data = await fetchWithAuth('/admin/fraud-alerts');
      return { alerts: data?.alerts || [], count: data?.alerts?.length || 0 };
    },
  });

  const alerts = data?.alerts ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await fetchWithAuth(`/admin/fraud-alerts/${alertId}/resolve`, { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] });
      toast({ title: 'Alert resolved', description: 'Fraud alert marked as resolved.' });
    },
  });

  const unresolvedCount = alerts.filter(a => !(a as any).resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl gradient-danger flex items-center justify-center">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Fraud Alerts</h1>
          <p className="text-muted-foreground">Monitor suspicious payment activity</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md">
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl gradient-danger flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold">{total}</p>
              <p className="text-xs text-muted-foreground">Total Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl gradient-warning flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold">{unresolvedCount}</p>
              <p className="text-xs text-muted-foreground">Unresolved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl gradient-success flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold">{total - unresolvedCount}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Button
          variant={showResolved ? 'outline' : 'default'}
          size="sm"
          onClick={() => { setShowResolved(false); setPage(0); }}
        >
          Active Only
        </Button>
        <Button
          variant={showResolved ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setShowResolved(true); setPage(0); }}
        >
          Show All
        </Button>
      </div>

      {/* Alerts table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-2xl gradient-success flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <p className="text-lg font-bold">All Clear!</p>
              <p className="text-muted-foreground">No fraud alerts to review.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/30">
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert: any) => {
                  const typeConf = typeConfig[alert.alert_type] || typeConfig.DUPLICATE;
                  const sevConf = severityConfig[alert.severity] || severityConfig.MEDIUM;
                  const TypeIcon = typeConf.icon;
                  const profile = profileMap[alert.user_id];
                  return (
                    <TableRow key={alert.id} className="transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className={`h-4 w-4 ${typeConf.color}`} />
                          <span className="font-medium text-sm">{typeConf.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={sevConf.color}>{alert.severity}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{profile?.name || profile?.email || 'Unknown'}</TableCell>
                      <TableCell className="text-sm max-w-[300px] truncate">{alert.description}</TableCell>
                      <TableCell className="text-sm">{format(new Date(alert.created_at), 'MMM d, HH:mm')}</TableCell>
                      <TableCell>
                        {alert.resolved ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/30">Resolved</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!alert.resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveMutation.mutate(alert.id)}
                            disabled={resolveMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                        )}
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
          <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages} ({total} total)</p>
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

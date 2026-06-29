import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Search, ChevronLeft, ChevronRight, Eye, CheckCircle, Clock, XCircle, History, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InvoiceDownloadButton from '@/components/InvoicePDF';

const PAGE_SIZE = 10;

function paymentStatusValue(status: unknown): string {
  if (typeof status === 'string') return status;
  if (status && typeof status === 'object' && 'name' in status) {
    return String((status as { name: string }).name);
  }
  return String(status ?? '');
}

function paymentDateValue(date: unknown): string {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (Array.isArray(date)) {
    const [year, month, day] = date;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return String(date);
}

const statusConfig: Record<string, { label: string; color: string; icon: any; gradient: string }> = {
  SUCCESS: { label: 'Success', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle, gradient: 'gradient-success' },
  FAILED: { label: 'Failed', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle, gradient: 'gradient-danger' },
  PENDING: { label: 'Pending', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock, gradient: 'gradient-warning' },
};

export default function PaymentHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const retryMutation = useMutation({
    mutationFn: async (payment: any) => {
      const data = await paymentService.payBill(payment.bill_id, payment.payment_method, payment.amount);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['pending-bills'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast({ title: 'Payment Retried', description: 'Payment retry was successful!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Retry Failed', description: err.message, variant: 'destructive' });
    },
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['payment-history', user?.id, page, dateFilter, statusFilter],
    queryFn: async () => {
      const payments = await paymentService.getMyPayments();
      const filteredPayments = (payments || []).filter((payment) => {
        const status = paymentStatusValue(payment.payment_status);
        const paymentDate = paymentDateValue(payment.payment_date);
        const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
        const matchesDate = !dateFilter || paymentDate.startsWith(dateFilter);
        return matchesStatus && matchesDate;
      });
      const start = page * PAGE_SIZE;
      const paginated = filteredPayments.slice(start, start + PAGE_SIZE);
      return { payments: paginated, count: filteredPayments.length };
    },
    enabled: !!user,
  });

  const payments = data?.payments ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
          <History className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">View all your past transactions</p>
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
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
          {(dateFilter || statusFilter !== 'ALL') && (
            <Button variant="ghost" size="sm" onClick={() => { setDateFilter(''); setStatusFilter('ALL'); }}>Clear</Button>
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
              {(error as Error)?.message || 'Failed to load payment history.'}
            </p>
          ) : payments.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No transactions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/30">
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Bill Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(p => {
                  const status = paymentStatusValue(p.payment_status);
                  const config = statusConfig[status] || statusConfig.PENDING;
                  const paymentDate = paymentDateValue(p.payment_date);
                  return (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setSelectedPayment(p)}>
                      <TableCell className="font-mono text-xs">{p.transaction_id?.slice(0, 16)}...</TableCell>
                      <TableCell className="font-medium">{p.bills?.bill_type ?? '-'}</TableCell>
                      <TableCell className="font-bold">${Number(p.amount).toFixed(2)}</TableCell>
                      <TableCell>{String(p.payment_method).replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={config.color}>{config.label}</Badge>
                      </TableCell>
                      <TableCell>{paymentDate ? format(new Date(paymentDate), 'MMM d, yyyy') : '-'}</TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="text-primary" onClick={() => setSelectedPayment(p)}><Eye className="h-4 w-4" /></Button>
                        {p.payment_status === 'SUCCESS' && (
                          <InvoiceDownloadButton payment={p} />
                        )}
                        {p.payment_status === 'FAILED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-warning"
                            onClick={(e) => { e.stopPropagation(); retryMutation.mutate(p); }}
                            disabled={retryMutation.isPending}
                          >
                            <RefreshCw className={`h-4 w-4 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
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

      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 py-4">
                {['Initiated', 'Processing', selectedPayment.payment_status === 'SUCCESS' ? 'Completed' : selectedPayment.payment_status === 'FAILED' ? 'Failed' : 'Pending'].map((step, i) => {
                  const isActive = i <= (selectedPayment.payment_status === 'SUCCESS' ? 2 : selectedPayment.payment_status === 'FAILED' ? 2 : 1);
                  const isFailed = i === 2 && selectedPayment.payment_status === 'FAILED';
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${isFailed ? 'gradient-danger' :
                          isActive ? 'gradient-success' : 'bg-muted text-muted-foreground'
                        }`}>
                        {i + 1}
                      </div>
                      <span className={`text-xs ${isActive ? 'font-semibold' : 'text-muted-foreground'}`}>{step}</span>
                      {i < 2 && <div className={`w-8 h-0.5 rounded ${isActive ? 'gradient-success' : 'bg-muted'}`} />}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl bg-accent/50 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs">{selectedPayment.transaction_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bill Type</span>
                  <span className="font-medium">{(selectedPayment as any).bills?.bill_type ?? '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-extrabold">${Number(selectedPayment.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{selectedPayment.payment_method.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={statusConfig[selectedPayment.payment_status]?.color}>
                    {selectedPayment.payment_status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Date</span>
                  <span className="font-medium">{format(new Date(selectedPayment.payment_date), 'MMM d, yyyy HH:mm:ss')}</span>
                </div>
                {selectedPayment.idempotency_key && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Idempotency Key</span>
                    <span className="font-mono text-xs truncate max-w-[200px]">{selectedPayment.idempotency_key}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                {selectedPayment.payment_status === 'SUCCESS' && (
                  <InvoiceDownloadButton payment={selectedPayment} />
                )}
                {selectedPayment.payment_status === 'FAILED' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={() => { retryMutation.mutate(selectedPayment); setSelectedPayment(null); }}
                    disabled={retryMutation.isPending}
                  >
                    <RefreshCw className="h-4 w-4" /> Retry Payment
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

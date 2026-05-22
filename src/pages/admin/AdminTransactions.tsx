import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 15;

export default function AdminTransactions() {
  const [page, setPage] = useState(0);
  const [dateFilter, setDateFilter] = useState('');

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles-lookup'],
    queryFn: async () => {
      const data = await fetchWithAuth('/admin/users');
      return data || [];
    },
  });

  const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', page, dateFilter],
    queryFn: async () => {
      const searchParams = new URLSearchParams({ page: page.toString(), size: PAGE_SIZE.toString() });
      if (dateFilter) searchParams.append('date', dateFilter);
      const data = await fetchWithAuth(`/admin/transactions?${searchParams.toString()}`);
      return { payments: data?.content || [], count: data?.totalElements || 0 };
    },
  });

  const payments = data?.payments ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statusColor: Record<string, string> = {
    SUCCESS: 'bg-success/10 text-success border-success/30',
    FAILED: 'bg-destructive/10 text-destructive border-destructive/30',
    PENDING: 'bg-warning/10 text-warning border-warning/30',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
        <p className="text-muted-foreground">Monitor all payment transactions</p>
      </div>

      <div className="flex gap-3">
        <Input type="date" className="w-48" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(0); }} />
        {dateFilter && <Button variant="ghost" size="sm" onClick={() => setDateFilter('')}>Clear</Button>}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No transactions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Bill Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p: any) => {
                  const profile = profileMap[p.user_id];
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.transaction_id.slice(0, 16)}...</TableCell>
                      <TableCell>{profile?.name || profile?.email || '-'}</TableCell>
                      <TableCell>{p.bills?.bill_type ?? '-'}</TableCell>
                      <TableCell className="font-semibold">${Number(p.amount).toFixed(2)}</TableCell>
                      <TableCell>{p.payment_method}</TableCell>
                      <TableCell><Badge variant="outline" className={statusColor[p.payment_status]}>{p.payment_status}</Badge></TableCell>
                      <TableCell>{format(new Date(p.payment_date), 'MMM d, yyyy')}</TableCell>
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
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const PAGE_SIZE = 15;

export default function TransactionsPage() {
    const [page, setPage] = useState(0);
    const [dateFilter, setDateFilter] = useState('');

    // Load user profiles for name mapping
    const { data: profiles = [] } = useQuery({
        queryKey: ['admin-profiles-lookup'],
        queryFn: async () => {
            const data = await fetchWithAuth('/admin/users');
            return data || [];
        },
    });
    const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id || p.user_id, p]));

    // Load paginated transactions
    const { data, isLoading } = useQuery({
        queryKey: ['admin-transactions', page, dateFilter],
        queryFn: async () => {
            const searchParams = new URLSearchParams({ page: page.toString(), size: PAGE_SIZE.toString() });
            const result = await fetchWithAuth(`/admin/transactions?${searchParams.toString()}`);
            // Backend returns Spring Page object
            return {
                payments: result?.content || [],
                count: result?.totalElements || 0,
                totalPages: result?.totalPages || 0,
            };
        },
    });

    const payments = data?.payments ?? [];
    const total = data?.count ?? 0;
    const totalPages = data?.totalPages ?? 0;

    const success = payments.filter((t: any) => (t.payment_status || t.paymentStatus) === 'SUCCESS');
    const failed = payments.filter((t: any) => (t.payment_status || t.paymentStatus) === 'FAILED');

    const statusColor: Record<string, string> = {
        SUCCESS: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    };

    const statusIcon: Record<string, any> = {
        SUCCESS: CheckCircle,
        FAILED: XCircle,
        PENDING: Clock,
    };

    const formatDate = (val: any) => {
        if (!val) return '-';
        try { return format(new Date(val), 'MMM d, yyyy, h:mm a'); } catch { return val; }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    All Transactions
                </h1>
                <p className="text-muted-foreground">View all payment transactions across the platform.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-sm border border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Records</p>
                            <p className="text-xl font-bold">{total}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-success">
                            <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Successful (page)</p>
                            <p className="text-xl font-bold">{success.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-danger">
                            <XCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Failed (page)</p>
                            <p className="text-xl font-bold">{failed.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex gap-3 items-center">
                <Input type="date" className="w-48" value={dateFilter}
                    onChange={e => { setDateFilter(e.target.value); setPage(0); }} />
                {dateFilter && <Button variant="ghost" size="sm" onClick={() => setDateFilter('')}>Clear</Button>}
            </div>

            {/* Table */}
            <Card className="shadow-sm border border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="flex items-center justify-center h-32 bg-muted/10 border border-dashed rounded-xl text-muted-foreground">
                            No transactions found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction ID</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bill Type</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((t: any) => {
                                        const txId = t.transaction_id || t.transactionId || '';
                                        const status = t.payment_status || t.paymentStatus || 'PENDING';
                                        const userId = t.user_id || t.userId;
                                        const profile = profileMap[userId];
                                        const billType = t.bills?.bill_type || t.billType || '-';
                                        const method = (t.payment_method || t.paymentMethod || '-').toString().replace('_', ' ');
                                        const date = t.payment_date || t.paymentDate;
                                        const StatusIcon = statusIcon[status] || Clock;
                                        return (
                                            <tr key={t.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                <td className="py-3 px-4 text-sm font-mono">{txId.slice(0, 16)}{txId.length > 16 ? '...' : ''}</td>
                                                <td className="py-3 px-4 text-sm">{profile?.name || profile?.email || userId?.slice(0, 8) || '-'}</td>
                                                <td className="py-3 px-4 text-sm">{billType}</td>
                                                <td className="py-3 px-4 font-bold text-sm">${Number(t.amount).toFixed(2)}</td>
                                                <td className="py-3 px-4 text-sm">{method}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[status] || statusColor['PENDING']}`}>
                                                        <StatusIcon className="h-3 w-3" /> {status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(date)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
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

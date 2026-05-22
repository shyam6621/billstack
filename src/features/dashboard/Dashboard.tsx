import { useMyBills } from '@/hooks/useBills';
import { useMyPayments } from '@/hooks/usePayments';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { PaymentPieChart } from '@/components/charts/PaymentPieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CreditCard, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';

export default function Dashboard() {
    const { data: bills = [], isLoading: isLoadingBills } = useMyBills();
    const { data: payments = [], isLoading: isLoadingPayments } = useMyPayments();

    // Calculations for stats
    const pending = bills.filter((b: any) => b.status === 'PENDING');
    const paid = bills.filter((b: any) => b.status === 'PAID');
    const amountDue = pending.reduce((sum: number, b: any) => sum + Number(b.amount), 0);

    // Data for Revenue Chart (Spending by month)
    const spendingByMonth = bills.reduce((acc: any, bill: any) => {
        // some fallback dates
        const dateObj = bill.dueDate || bill.due_date ? new Date(bill.dueDate || bill.due_date) : new Date();
        const month = format(dateObj, 'MMM');
        if (!acc[month]) acc[month] = 0;
        acc[month] += Number(bill.amount);
        return acc;
    }, {});

    const revenueData = Object.keys(spendingByMonth).map(month => ({
        month,
        revenue: spendingByMonth[month]
    }));

    // Data for Payment Method Pie Chart
    const methods = payments.reduce((acc: any, p: any) => {
        const method = p.payment_method || p.paymentMethod || 'Credit Card';
        if (!acc[method]) acc[method] = 0;
        acc[method] += 1;
        return acc;
    }, {});

    const pieData = Object.keys(methods).map(name => ({
        name,
        value: methods[name]
    }));

    // Upcoming bills (Pending and not overdue, sorted by date)
    const upcomingBills = pending
        .sort((a: any, b: any) => new Date(a.due_date || a.dueDate).getTime() - new Date(b.due_date || b.dueDate).getTime())
        .slice(0, 5);

    const stats = [
        { label: 'Total Bills', value: bills.length, icon: FileText, gradient: 'gradient-primary' },
        { label: 'Pending', value: pending.length, icon: AlertTriangle, gradient: 'gradient-warning' },
        { label: 'Paid', value: paid.length, icon: CheckCircle, gradient: 'gradient-success' },
        { label: 'Amount Due', value: formatCurrency(amountDue), icon: CreditCard, gradient: 'gradient-danger' },
    ];

    if (isLoadingBills || isLoadingPayments) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-48 bg-muted rounded"></div>
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="h-24 bg-card rounded-xl shadow-sm border border-border"></div>
                    <div className="h-24 bg-card rounded-xl shadow-sm border border-border"></div>
                    <div className="h-24 bg-card rounded-xl shadow-sm border border-border"></div>
                    <div className="h-24 bg-card rounded-xl shadow-sm border border-border"></div>
                </div>
                <div className="h-[300px] bg-card rounded-xl shadow-sm border border-border"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">Monitor your upcoming bills and recent activity.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <Card key={s.label} className="border border-border shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <div className="flex items-center gap-4 p-5">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.gradient} shadow-sm`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                                        <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 shadow-sm border border-border">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Monthly Bill Spending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart data={revenueData} />
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 shadow-sm border border-border">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PaymentPieChart data={pieData} />
                    </CardContent>
                </Card>
            </div>

            {/* Tables Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Upcoming Bills */}
                <Card className="shadow-sm border border-border">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-warning" /> Upcoming Due Bills
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingBills.length === 0 ? (
                            <p className="text-muted-foreground text-sm flex h-24 items-center justify-center bg-muted/20 border border-dashed rounded-lg">No pending bills, you're all caught up!</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingBills.map((b: any) => {
                                    const isOverdue = new Date(b.due_date || b.dueDate) < new Date();
                                    return (
                                        <div key={b.id || b.bill_id} className={`flex justify-between items-center p-3 rounded-lg border ${isOverdue ? 'bg-destructive/5 border-destructive/20 text-destructive' : 'bg-card'}`}>
                                            <div>
                                                <p className="font-semibold">{b.description || b.bill_type}</p>
                                                <p className={`text-xs ${isOverdue ? 'text-destructive/80 font-medium' : 'text-muted-foreground'}`}>
                                                    {isOverdue ? 'Overdue since' : 'Due'}: {format(new Date(b.dueDate || b.due_date), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                            <span className="font-bold">{formatCurrency(Number(b.amount))}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="shadow-sm border border-border">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" /> Recent Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {payments.length === 0 ? (
                            <p className="text-muted-foreground text-sm flex h-24 items-center justify-center bg-muted/20 border border-dashed rounded-lg">No recent payments.</p>
                        ) : (
                            <div className="space-y-0">
                                {payments.slice(0, 5).map((p: any) => (
                                    <div key={p.id || p.payment_id} className="flex justify-between items-center text-sm border-b border-border/50 py-3 first:pt-0 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg gradient-success flex items-center justify-center shadow-sm">
                                                <CheckCircle className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{p.transaction_id?.slice(0, 16) || p.transactionId?.slice(0, 16) || 'TRX-Recent'}</p>
                                                <p className="text-muted-foreground text-xs">{format(new Date(p.payment_date || p.paymentDate || new Date()), 'MMM d, yyyy')}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-lg">{formatCurrency(Number(p.amount))}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}

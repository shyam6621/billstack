import { useAdminStats, useAdminRevenue, useAdminPaymentMethods } from '@/hooks/useAdmin';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { PaymentPieChart } from '@/components/charts/PaymentPieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export default function AdminDashboard() {
    const { data: stats, isLoading: loadingStats } = useAdminStats();
    const { data: revenue = [], isLoading: loadingRevenue } = useAdminRevenue();
    const { data: paymentMethods = [], isLoading: loadingMethods } = useAdminPaymentMethods();

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, gradient: 'gradient-primary' },
        { label: 'Total Bills', value: stats?.totalBills ?? 0, icon: FileText, gradient: 'bg-blue-600' },
        { label: 'Pending Bills', value: stats?.pendingBills ?? 0, icon: AlertTriangle, gradient: 'gradient-warning' },
        { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue ?? 0), icon: TrendingUp, gradient: 'gradient-success' },
    ];

    if (loadingStats) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-64 bg-muted rounded" />
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-card rounded-xl border" />)}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="h-[350px] bg-card rounded-xl border" />
                    <div className="h-[350px] bg-card rounded-xl border" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">System-wide analytics and management overview.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((s) => {
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

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 shadow-sm border border-border">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Monthly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart data={Array.isArray(revenue) ? revenue : []} />
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 shadow-sm border border-border">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Payment Methods Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PaymentPieChart data={Array.isArray(paymentMethods) ? paymentMethods : []} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

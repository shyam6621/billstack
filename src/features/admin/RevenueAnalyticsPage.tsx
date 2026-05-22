import { useAdminRevenue, useAdminPaymentMethods, useAdminStats } from '@/hooks/useAdmin';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { PaymentPieChart } from '@/components/charts/PaymentPieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export default function RevenueAnalyticsPage() {
    const { data: stats } = useAdminStats();
    const { data: revenue = [], isLoading: loadingRev } = useAdminRevenue();
    const { data: paymentMethods = [], isLoading: loadingPM } = useAdminPaymentMethods();

    const isLoading = loadingRev || loadingPM;

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-64 bg-muted rounded" />
                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-28 bg-card rounded-xl border" />)}
                </div>
                <div className="h-[400px] bg-card rounded-xl border" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    Revenue Analytics
                </h1>
                <p className="text-muted-foreground">In-depth revenue charting and payment insights.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-sm border border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-success">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-extrabold">{formatCurrency(stats?.totalRevenue ?? 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Avg Monthly Revenue</p>
                            <p className="text-2xl font-extrabold">
                                {formatCurrency(Array.isArray(revenue) && revenue.length > 0
                                    ? revenue.reduce((s: number, r: any) => s + (r.revenue || 0), 0) / revenue.length
                                    : 0
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-warning">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pending Amount</p>
                            <p className="text-2xl font-extrabold">{formatCurrency(stats?.pendingAmount ?? 0)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Monthly Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <RevenueChart data={Array.isArray(revenue) ? revenue : []} />
                </CardContent>
            </Card>

            <Card className="shadow-sm border border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Payment Methods Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <PaymentPieChart data={Array.isArray(paymentMethods) ? paymentMethods : []} />
                </CardContent>
            </Card>
        </div>
    );
}

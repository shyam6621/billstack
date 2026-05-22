import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';

const PIE_COLORS = [
  'hsl(152, 69%, 41%)',  // success - PAID
  'hsl(38, 92%, 50%)',   // warning - PENDING
  'hsl(0, 72%, 51%)',    // destructive - OVERDUE
];

const METHOD_COLORS = [
  'hsl(234, 89%, 60%)',  // primary
  'hsl(199, 89%, 48%)',  // info
  'hsl(152, 69%, 41%)',  // success
  'hsl(38, 92%, 50%)',   // warning
];

export default function AdminDashboard() {
  const { data: userCount = 0 } = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: async () => {
      const data = await fetchWithAuth('/admin/users/count');
      return data?.count ?? 0;
    },
  });

  const { data: billStats } = useQuery({
    queryKey: ['admin-bill-stats'],
    queryFn: async () => {
      const data = await fetchWithAuth('/admin/bills') || [];
      const pending = data.filter((b: any) => b.status === 'PENDING');
      const paid = data.filter((b: any) => b.status === 'PAID');
      const overdue = data.filter((b: any) => b.status === 'OVERDUE');
      return {
        total: data.length,
        pending: pending.length,
        paid: paid.length,
        overdue: overdue.length,
        revenue: paid.reduce((s, b) => s + Number(b.amount), 0),
        pendingAmount: pending.reduce((s, b) => s + Number(b.amount), 0),
        overdueAmount: overdue.reduce((s, b) => s + Number(b.amount), 0),
      };
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['admin-payments-chart'],
    queryFn: async () => {
      const data = await fetchWithAuth('/admin/payments?status=SUCCESS');
      return data || [];
    },
  });

  // Monthly revenue data
  const monthlyRevenue = (() => {
    const map = new Map<string, number>();
    payments.forEach(p => {
      const d = new Date(p.payment_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) ?? 0) + Number(p.amount));
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => {
        const [y, m] = month.split('-');
        const label = new Date(+y, +m - 1).toLocaleDateString('en', { month: 'short', year: '2-digit' });
        return { month: label, revenue: +revenue.toFixed(2) };
      });
  })();

  // Bill status distribution
  const billStatusData = [
    { name: 'Paid', value: billStats?.paid ?? 0 },
    { name: 'Pending', value: billStats?.pending ?? 0 },
    { name: 'Overdue', value: billStats?.overdue ?? 0 },
  ].filter(d => d.value > 0);

  // Payment method distribution
  const methodData = (() => {
    const map = new Map<string, number>();
    payments.forEach(p => map.set(p.payment_method, (map.get(p.payment_method) ?? 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  })();

  const stats = [
    { label: 'Total Users', value: userCount, icon: Users, color: 'text-primary' },
    { label: 'Total Bills', value: billStats?.total ?? 0, icon: FileText, color: 'text-muted-foreground' },
    { label: 'Pending Bills', value: billStats?.pending ?? 0, icon: FileText, color: 'text-warning' },
    { label: 'Revenue', value: `$${(billStats?.revenue ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and analytics</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payment data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(234, 89%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(234, 89%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(234, 89%, 60%)" fill="url(#revenueGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bill Status Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Bill Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {billStatusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No bill data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={billStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {billStatusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Payment Methods */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <DollarSign className="h-4 w-4 text-info" />
            <CardTitle className="text-base">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {methodData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payment data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={methodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Transactions" radius={[6, 6, 0, 0]}>
                    {methodData.map((_, i) => (
                      <Cell key={i} fill={METHOD_COLORS[i % METHOD_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
              <span className="text-sm font-medium text-success">Total Collected</span>
              <span className="text-lg font-bold text-success">${(billStats?.revenue ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
              <span className="text-sm font-medium text-warning">Pending Amount</span>
              <span className="text-lg font-bold text-warning">${(billStats?.pendingAmount ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
              <span className="text-sm font-medium text-destructive">Overdue Amount</span>
              <span className="text-lg font-bold text-destructive">${(billStats?.overdueAmount ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <span className="text-sm font-medium text-primary">Total Transactions</span>
              <span className="text-lg font-bold text-primary">{payments.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

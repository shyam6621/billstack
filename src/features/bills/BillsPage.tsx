import { useQuery } from '@tanstack/react-query';
import { billService } from '@/services/billService';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Zap, Droplets, Flame, Wifi, Phone, HelpCircle } from 'lucide-react';

const statusColor: Record<string, string> = {
  PENDING: 'bg-warning/10 text-warning border-warning/30',
  PAID: 'bg-success/10 text-success border-success/30',
  OVERDUE: 'bg-destructive/10 text-destructive border-destructive/30',
};

const billTypeConfig: Record<string, { icon: any; gradient: string }> = {
  ELECTRICITY: { icon: Zap, gradient: 'gradient-warning' },
  WATER: { icon: Droplets, gradient: 'gradient-info' },
  GAS: { icon: Flame, gradient: 'gradient-danger' },
  INTERNET: { icon: Wifi, gradient: 'gradient-primary' },
  PHONE: { icon: Phone, gradient: 'gradient-success' },
  OTHER: { icon: HelpCircle, gradient: 'gradient-primary' },
};

export default function Bills() {
  const { user } = useAuth();

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['bills', user?.id],
    queryFn: async () => {
      const data = await billService.getMyBills();
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Bills</h1>
        <p className="text-muted-foreground">View and track all your bills</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : bills.length === 0 ? (
        <Card className="border-0 shadow-md"><CardContent className="py-12 text-center text-muted-foreground">No bills found.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill, i) => {
            const config = billTypeConfig[bill.bill_type] || billTypeConfig.OTHER;
            const Icon = config.icon;
            return (
              <Card key={bill.id} className="card-hover border-0 shadow-md animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.gradient} shadow-sm`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-base font-bold">{bill.bill_type}</CardTitle>
                  </div>
                  <Badge variant="outline" className={statusColor[bill.status]}>{bill.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {bill.description && <p className="text-sm text-muted-foreground">{bill.description}</p>}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-extrabold text-lg">${Number(bill.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="font-medium">{format(new Date(bill.due_date), 'MMM d, yyyy')}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

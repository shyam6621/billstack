import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { billService } from '@/services/billService';
import { formatCurrency } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle, Clock, Zap, Droplets, Flame, Wifi, Phone, HelpCircle } from 'lucide-react';
import PaymentGateway from '@/components/PaymentGateway';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

const billTypeConfig: Record<string, { icon: any; gradient: string }> = {
  ELECTRICITY: { icon: Zap, gradient: 'gradient-warning' },
  WATER: { icon: Droplets, gradient: 'gradient-info' },
  GAS: { icon: Flame, gradient: 'gradient-danger' },
  INTERNET: { icon: Wifi, gradient: 'gradient-primary' },
  PHONE: { icon: Phone, gradient: 'gradient-success' },
  OTHER: { icon: HelpCircle, gradient: 'gradient-primary' },
};

export default function PayBills() {
  const { user } = useAuth();
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [gatewayOpen, setGatewayOpen] = useState(false);

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['pending-bills', user?.id],
    queryFn: async () => {
      const data = await billService.getMyBills();
      return (data || []).filter((b: any) => ['PENDING', 'OVERDUE'].includes(b.status));
    },
    enabled: !!user,
  });

  const handlePayClick = (bill: any) => {
    setSelectedBill(bill);
    setGatewayOpen(true);
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Pay Bills</h1>
        <p className="text-muted-foreground">Select a bill to pay securely</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : bills.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 rounded-2xl gradient-success flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg font-bold">All caught up!</p>
            <p className="text-muted-foreground">No pending bills to pay.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bills.map((bill, i) => {
            const config = billTypeConfig[bill.bill_type] || billTypeConfig.OTHER;
            const Icon = config.icon;
            return (
              <Card key={bill.id} className={`card-hover border-0 shadow-md animate-fade-in ${isOverdue(bill.due_date) ? 'ring-2 ring-destructive/30' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.gradient} shadow-sm`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-base font-bold">{bill.bill_type}</CardTitle>
                  </div>
                  {isOverdue(bill.due_date) && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                      <Clock className="h-3 w-3 mr-1" /> Overdue
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {bill.description && <p className="text-sm text-muted-foreground">{bill.description}</p>}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-extrabold text-xl">{formatCurrency(Number(bill.amount))}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due</span>
                    <span className={isOverdue(bill.due_date) ? 'text-destructive font-semibold' : 'font-medium'}>
                      {format(new Date(bill.due_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Button
                    className={`w-full mt-2 font-semibold ${isOverdue(bill.due_date) ? '' : 'gradient-primary border-0 shadow-glow'}`}
                    variant={isOverdue(bill.due_date) ? 'destructive' : 'default'}
                    onClick={() => handlePayClick(bill)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedBill && (
        <PaymentGateway bill={selectedBill} open={gatewayOpen} onOpenChange={setGatewayOpen} />
      )}
    </div>
  );
}

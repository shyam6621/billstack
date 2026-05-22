import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  CreditCard, CheckCircle, XCircle, Loader2, Shield, ArrowRight,
  Zap, Droplets, Flame, Wifi, Phone, HelpCircle, Landmark, Smartphone, Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadInvoice } from '@/components/InvoicePDF';

type Step = 'select' | 'confirm' | 'processing' | 'success' | 'failed';

const billTypeIcons: Record<string, any> = {
  ELECTRICITY: Zap, WATER: Droplets, GAS: Flame, INTERNET: Wifi, PHONE: Phone, OTHER: HelpCircle,
};

const methodConfig: Record<string, { icon: any; label: string }> = {
  CARD: { icon: CreditCard, label: 'Credit/Debit Card' },
  BANK_TRANSFER: { icon: Landmark, label: 'Bank Transfer' },
  UPI: { icon: Smartphone, label: 'UPI' },
  WALLET: { icon: Wallet, label: 'Digital Wallet' },
};

interface PaymentGatewayProps {
  bill: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaymentGateway({ bill, open, onOpenChange }: PaymentGatewayProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('select');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [progress, setProgress] = useState(0);

  // Reset on open
  useEffect(() => {
    if (open) { setStep('select'); setPaymentMethod('CARD'); setProgress(0); }
  }, [open]);

  const payMutation = useMutation({
    mutationFn: async () => {
      const idempotencyKey = `pay_${bill.id}_${user?.id}_${Date.now()}`;
      const data = await fetchWithAuth('/payments/pay', {
        method: 'POST',
        body: JSON.stringify({
          billId: bill.id,
          paymentMethod: paymentMethod,
          idempotencyKey: idempotencyKey,
        }),
      });
      return data;
    },
    onSuccess: () => {
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['pending-bills'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
    },
    onError: () => {
      setStep('failed');
    },
  });

  const handlePay = () => {
    setStep('processing');
    setProgress(0);

    // Simulate gateway processing steps
    const intervals = [
      setTimeout(() => setProgress(20), 400),
      setTimeout(() => setProgress(45), 900),
      setTimeout(() => setProgress(70), 1500),
      setTimeout(() => setProgress(90), 2000),
      setTimeout(() => { setProgress(100); payMutation.mutate(); }, 2500),
    ];

    return () => intervals.forEach(clearTimeout);
  };

  const BillIcon = billTypeIcons[bill?.bill_type] || HelpCircle;
  const MethodIcon = methodConfig[paymentMethod]?.icon || CreditCard;

  const processingSteps = [
    { label: 'Validating payment details', done: progress >= 20 },
    { label: 'Connecting to payment gateway', done: progress >= 45 },
    { label: 'Processing transaction', done: progress >= 70 },
    { label: 'Verifying with bank', done: progress >= 90 },
    { label: 'Finalizing payment', done: progress >= 100 },
  ];

  return (
    <Dialog open={open} onOpenChange={step === 'processing' ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" aria-describedby={undefined}>
        <VisuallyHidden><DialogTitle>Secure Payment</DialogTitle></VisuallyHidden>
        {/* Header */}
        <div className="gradient-primary px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Secure Payment</h2>
              <p className="text-white/70 text-xs">Protected by idempotent processing</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Step: Select Payment Method */}
          {step === 'select' && bill && (
            <div className="space-y-5">
              {/* Bill summary */}
              <div className="rounded-xl bg-accent/50 p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                  <BillIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{bill.bill_type}</p>
                  {bill.description && <p className="text-xs text-muted-foreground">{bill.description}</p>}
                  <p className="text-xs text-muted-foreground">Due {format(new Date(bill.due_date), 'MMM d, yyyy')}</p>
                </div>
                <p className="text-2xl font-extrabold">{formatCurrency(Number(bill.amount))}</p>
              </div>


              {/* Payment methods */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Choose Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(methodConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left text-sm',
                          paymentMethod === key
                            ? 'border-primary bg-accent/50 text-foreground'
                            : 'border-border hover:border-primary/30 text-muted-foreground'
                        )}
                        onClick={() => setPaymentMethod(key)}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium text-xs">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button className="w-full gradient-primary border-0 font-bold shadow-glow h-11" onClick={() => setStep('confirm')}>
                Continue to Payment <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && bill && (
            <div className="space-y-5">
              <div className="rounded-xl bg-accent/50 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bill</span>
                  <span className="font-semibold">{bill.bill_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-extrabold text-lg">{formatCurrency(Number(bill.amount))}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">{format(new Date(bill.due_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Via</span>
                  <span className="font-medium flex items-center gap-1">
                    <MethodIcon className="h-3.5 w-3.5" />
                    {methodConfig[paymentMethod].label}
                  </span>
                </div>
              </div>

              {/* Payment flow indicator */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">PAYMENT FLOW</p>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-2">Initiated</Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 px-2">Processing</Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 px-2">Completed</Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>Back</Button>
                <Button className="flex-1 gradient-primary border-0 font-bold shadow-glow" onClick={handlePay}>
                  Pay {formatCurrency(Number(bill.amount))}
                </Button>
              </div>

            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <h3 className="font-bold text-lg">Processing Payment</h3>
                <p className="text-sm text-muted-foreground">Please don't close this window</p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="h-2 rounded-full gradient-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Processing steps */}
              <div className="space-y-2.5">
                {processingSteps.map((s, i) => (
                  <div key={i} className={cn('flex items-center gap-2 text-sm transition-all', s.done ? 'text-success' : 'text-muted-foreground')}>
                    {s.done ? (
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                    )}
                    <span className={cn(s.done && 'font-medium')}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && bill && (
            <div className="space-y-5 py-4 text-center">
              <div className="h-20 w-20 rounded-full gradient-success flex items-center justify-center mx-auto animate-fade-in">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Payment Successful!</h3>
                <p className="text-muted-foreground text-sm mt-1">Your transaction has been recorded</p>
              </div>
              <div className="rounded-xl bg-success/10 p-4 space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-bold">{formatCurrency(Number(bill.amount))}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bill Type</span>
                  <span className="font-medium">{bill.bill_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{methodConfig[paymentMethod].label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-success/20 text-success border-success/30" variant="outline">SUCCESS</Badge>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 font-bold" onClick={() => downloadInvoice({
                  transactionId: 'TXN-' + bill.id.slice(0, 8),
                  amount: Number(bill.amount),
                  paymentMethod: paymentMethod,
                  paymentDate: new Date().toISOString(),
                  paymentStatus: 'SUCCESS',
                  billType: bill.bill_type,
                  billDescription: bill.description,
                  billDueDate: bill.due_date,
                })}>
                  Download Invoice
                </Button>
                <Button className="flex-1 gradient-primary border-0 font-bold" onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Step: Failed */}
          {step === 'failed' && bill && (
            <div className="space-y-5 py-4 text-center">
              <div className="h-20 w-20 rounded-full gradient-danger flex items-center justify-center mx-auto animate-fade-in">
                <XCircle className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Payment Failed</h3>
                <p className="text-muted-foreground text-sm mt-1">Something went wrong. Please try again.</p>
              </div>
              <div className="rounded-xl bg-destructive/10 p-4 text-left">
                <p className="text-sm text-destructive font-medium">
                  {payMutation.error instanceof Error ? payMutation.error.message : 'Transaction could not be completed'}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button className="flex-1" variant="destructive" onClick={() => { setStep('select'); }}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

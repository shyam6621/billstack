import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdmin';
import { useAllBills, useCreateBill } from '@/hooks/useBills';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Zap, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';

const BILL_TYPES = ['ELECTRICITY', 'WATER', 'GAS', 'INTERNET', 'PHONE', 'CREDIT_CARD', 'RENT', 'INSURANCE', 'OTHER'];

const DEMO_BILLS = [
    { billType: 'ELECTRICITY', description: 'Electricity Bill', amount: 1200 },
    { billType: 'WATER', description: 'Water Bill', amount: 800 },
    { billType: 'INTERNET', description: 'Internet Bill', amount: 1500 },
    { billType: 'PHONE', description: 'Mobile Bill', amount: 600 },
    { billType: 'GAS', description: 'Gas Bill', amount: 950 },
];

export default function BillsManagementPage() {
    const { data: users = [] } = useAdminUsers();
    const { data: allBills = [], isLoading, refetch } = useAllBills();
    const createBillMutation = useCreateBill();
    const { toast } = useToast();

    const [selectedUser, setSelectedUser] = useState('');
    const [billType, setBillType] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [generatingDemo, setGeneratingDemo] = useState(false);
    const [demoUser, setDemoUser] = useState('');

    const handleCreateBill = async () => {
        if (!selectedUser || !billType || !amount || !dueDate) {
            toast({ title: 'Missing fields', description: 'Please fill all required fields', variant: 'destructive' });
            return;
        }
        setCreating(true);
        try {
            await createBillMutation.mutateAsync({
                user_id: selectedUser as any,
                bill_type: billType,
                amount: parseFloat(amount),
                due_date: dueDate,
                status: 'PENDING',
                description,
            } as any);
            toast({ title: 'Bill Created', description: `${billType} bill of ₹${amount} created successfully.` });
            setAmount(''); setDueDate(''); setDescription(''); setBillType('');
            refetch();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to create bill', variant: 'destructive' });
        } finally {
            setCreating(false);
        }
    };

    const handleGenerateDemo = async () => {
        if (!demoUser) {
            toast({ title: 'Select User', description: 'Please select a user first', variant: 'destructive' });
            return;
        }
        setGeneratingDemo(true);
        try {
            for (const bill of DEMO_BILLS) {
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 20) + 3);
                await createBillMutation.mutateAsync({
                    user_id: demoUser as any,
                    bill_type: bill.billType,
                    amount: bill.amount,
                    due_date: futureDate.toISOString().split('T')[0],
                    status: 'PENDING',
                    description: bill.description,
                } as any);
            }
            toast({ title: '🎉 Demo Bills Generated!', description: `5 pending bills created for selected user.` });
            refetch();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to generate demo bills', variant: 'destructive' });
        } finally {
            setGeneratingDemo(false);
        }
    };

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-64 bg-muted rounded" />
                <div className="grid gap-6 md:grid-cols-2"><div className="h-80 bg-card rounded-xl border" /><div className="h-80 bg-card rounded-xl border" /></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    Bills Management
                </h1>
                <p className="text-muted-foreground">Create, assign, and manage bills for users.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Create Bill Form */}
                <Card className="shadow-sm border border-border">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Plus className="h-5 w-5" /> Create New Bill
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Assign to User</Label>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
                                <SelectContent>
                                    {users.map((u: any) => (
                                        <SelectItem key={u.id} value={u.id.toString()}>{u.name || u.email} ({u.email})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Bill Type</Label>
                            <Select value={billType} onValueChange={setBillType}>
                                <SelectTrigger><SelectValue placeholder="Select bill type" /></SelectTrigger>
                                <SelectContent>
                                    {BILL_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount (₹)</Label>
                                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Monthly electricity bill" />
                        </div>
                        <Button onClick={handleCreateBill} disabled={creating} className="w-full gradient-primary text-white">
                            {creating ? 'Creating...' : 'Create Bill'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Generate Demo Bills */}
                <Card className="shadow-sm border border-border bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Zap className="h-5 w-5 text-purple-600" /> Generate Demo Bills
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Quickly generate <strong>5 pending bills</strong> for a user to test the payment flow.
                        </p>
                        <div className="space-y-3 text-sm">
                            {DEMO_BILLS.map((b, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-card rounded-lg border">
                                    <span className="font-medium">{b.description}</span>
                                    <span className="font-bold text-foreground">{formatCurrency(b.amount)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <span className="font-semibold">Total</span>
                                <span className="font-extrabold text-primary">{formatCurrency(DEMO_BILLS.reduce((s, b) => s + b.amount, 0))}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Select User</Label>
                            <Select value={demoUser} onValueChange={setDemoUser}>
                                <SelectTrigger><SelectValue placeholder="Choose a user" /></SelectTrigger>
                                <SelectContent>
                                    {users.filter((u: any) => u.role !== 'ADMIN').map((u: any) => (
                                        <SelectItem key={u.id} value={u.id.toString()}>{u.name || u.email}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleGenerateDemo} disabled={generatingDemo} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                            {generatingDemo ? 'Generating...' : '⚡ Generate 5 Demo Bills'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* All Bills Table */}
            <Card className="shadow-sm border border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">All Bills ({allBills.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {allBills.length === 0 ? (
                        <div className="flex items-center justify-center h-32 bg-muted/10 border border-dashed rounded-xl text-muted-foreground">
                            No bills found. Create bills above to get started.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allBills.slice(0, 20).map((bill: any) => (
                                        <tr key={bill.id || bill.bill_id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="py-3 px-4 font-medium text-sm">{(bill.billType || bill.bill_type || '').replace('_', ' ')}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">{bill.description || '-'}</td>
                                            <td className="py-3 px-4 font-bold text-sm">{formatCurrency(Number(bill.amount))}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(bill.dueDate || bill.due_date)}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${bill.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                        bill.status === 'OVERDUE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                    }`}>
                                                    {bill.status === 'PAID' && <CheckCircle className="h-3 w-3" />}
                                                    {bill.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

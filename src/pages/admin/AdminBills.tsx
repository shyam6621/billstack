import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
const BILL_TYPES = ['ELECTRICITY', 'WATER', 'GAS', 'INTERNET', 'PHONE', 'OTHER'] as const;
type BillType = typeof BILL_TYPES[number];

export default function AdminBills() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ user_id: '', bill_type: 'ELECTRICITY' as BillType, description: '', amount: '', due_date: '' });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-select'],
    queryFn: async () => {
      const data = await fetchWithAuth('/admin/users');
      return data || [];
    },
  });

  const profileMap = Object.fromEntries(users.map(u => [u.user_id, u]));

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['admin-bills'],
    queryFn: async () => {
      const data = await fetchWithAuth('/admin/bills');
      return data || [];
    },
  });

  const createBill = useMutation({
    mutationFn: async () => {
      await fetchWithAuth('/admin/bills', {
        method: 'POST',
        body: JSON.stringify({
          user_id: form.user_id,
          bill_type: form.bill_type,
          description: form.description || null,
          amount: parseFloat(form.amount),
          due_date: form.due_date,
        }),
      });
    },
    onSuccess: () => {
      toast({ title: 'Bill created successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-bills'] });
      setOpen(false);
      setForm({ user_id: '', bill_type: 'ELECTRICITY', description: '', amount: '', due_date: '' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const statusColor: Record<string, string> = {
    PENDING: 'bg-warning/10 text-warning border-warning/30',
    PAID: 'bg-success/10 text-success border-success/30',
    OVERDUE: 'bg-destructive/10 text-destructive border-destructive/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Bills</h1>
          <p className="text-muted-foreground">Create and monitor bills</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Bill</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Bill</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User</Label>
                <Select value={form.user_id} onValueChange={v => setForm(f => ({ ...f, user_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.user_id} value={u.user_id}>{u.name || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bill Type</Label>
                <Select value={form.bill_type} onValueChange={v => setForm(f => ({ ...f, bill_type: v as BillType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BILL_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <Input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
              </div>
              <Button className="w-full" onClick={() => createBill.mutate()} disabled={!form.user_id || !form.amount || !form.due_date || createBill.isPending}>
                {createBill.isPending ? 'Creating...' : 'Create Bill'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : bills.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No bills found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((b: any) => {
                  const profile = profileMap[b.user_id];
                  return (
                    <TableRow key={b.id}>
                      <TableCell>{profile?.name || profile?.email || '-'}</TableCell>
                      <TableCell>{b.bill_type}</TableCell>
                      <TableCell className="font-semibold">${Number(b.amount).toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(b.due_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell><Badge variant="outline" className={statusColor[b.status]}>{b.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

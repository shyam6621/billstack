import { useMyBills } from '@/hooks/useBills';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function BillCalendarPage() {
    const { data: bills = [], isLoading } = useMyBills();

    const pendingBills = bills.filter((b: any) => b.status === 'PENDING');

    // Group by month
    const grouped = pendingBills.reduce((acc: any, bill: any) => {
        const d = new Date(bill.dueDate || bill.due_date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!acc[key]) acc[key] = { label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, bills: [] };
        acc[key].bills.push(bill);
        return acc;
    }, {});

    const sortedGroups = Object.values(grouped).sort((a: any, b: any) => {
        return new Date(a.bills[0].dueDate || a.bills[0].due_date).getTime() - new Date(b.bills[0].dueDate || b.bills[0].due_date).getTime();
    });

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 w-48 bg-muted rounded" />
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-card rounded-xl border" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-primary" />
                    Bill Due Calendar
                </h1>
                <p className="text-muted-foreground">Visual overview of your upcoming bill due dates.</p>
            </div>

            {sortedGroups.length === 0 ? (
                <Card className="shadow-sm border border-border">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-bold">All Caught Up!</h3>
                        <p className="text-muted-foreground">No pending bills at the moment.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {(sortedGroups as any[]).map((group: any) => (
                        <Card key={group.label} className="shadow-sm border border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    {group.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {group.bills
                                        .sort((a: any, b: any) => new Date(a.dueDate || a.due_date).getTime() - new Date(b.dueDate || b.due_date).getTime())
                                        .map((bill: any) => {
                                            const dueDate = new Date(bill.dueDate || bill.due_date);
                                            const isOverdue = dueDate < new Date();
                                            const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                                            return (
                                                <div
                                                    key={bill.id || bill.bill_id}
                                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-sm ${isOverdue
                                                            ? 'bg-destructive/5 border-destructive/20'
                                                            : daysUntil <= 3
                                                                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                                                                : 'bg-card'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`flex items-center justify-center h-12 w-12 rounded-xl text-white text-sm font-bold ${isOverdue ? 'gradient-danger' : daysUntil <= 3 ? 'gradient-warning' : 'gradient-primary'
                                                            }`}>
                                                            {dueDate.getDate()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-foreground">{bill.description || bill.bill_type}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {isOverdue ? (
                                                                    <span className="text-destructive font-medium flex items-center gap-1">
                                                                        <AlertTriangle className="h-3 w-3" /> Overdue by {Math.abs(daysUntil)} days
                                                                    </span>
                                                                ) : daysUntil === 0 ? (
                                                                    <span className="text-amber-600 font-medium">Due today</span>
                                                                ) : (
                                                                    <span>Due in {daysUntil} day{daysUntil > 1 ? 's' : ''}</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold">{formatCurrency(Number(bill.amount))}</p>
                                                        <p className="text-xs text-muted-foreground">{formatDate(bill.dueDate || bill.due_date)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

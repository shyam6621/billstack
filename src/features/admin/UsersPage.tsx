import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Search, Mail, Shield, FileText, CreditCard } from 'lucide-react';

export default function UsersPage() {
    const { data: users = [], isLoading } = useAdminUsers();
    const [search, setSearch] = useState('');

    const filtered = users.filter((u: any) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-64 bg-muted rounded" />
                <div className="h-12 bg-card rounded-xl border" />
                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-card rounded-xl border" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    Users Management
                </h1>
                <p className="text-muted-foreground">View and manage all registered users.</p>
            </div>

            {/* Search */}
            <Card className="shadow-sm border border-border">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-sm border border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                            <p className="text-xl font-bold">{users.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-success">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Admins</p>
                            <p className="text-xl font-bold">{users.filter((u: any) => u.role === 'ADMIN').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-warning">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Regular Users</p>
                            <p className="text-xl font-bold">{users.filter((u: any) => u.role === 'USER').length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card className="shadow-sm border border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">All Users ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filtered.length === 0 ? (
                        <div className="flex items-center justify-center h-32 bg-muted/10 border border-dashed rounded-xl text-muted-foreground">
                            {search ? 'No users match your search.' : 'No users found.'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((user: any) => (
                                        <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                                                        {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <span className="font-medium">{user.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="h-3 w-3" /> {user.email}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{typeof user.id === 'string' ? user.id.slice(0, 8) + '...' : user.id}</td>
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

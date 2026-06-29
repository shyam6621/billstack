import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function AdminUsers() {
  const { data: roles = [] } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const data = await fetchWithAuth('/admin/user-roles');
      return data || [];
    },
  });

  const roleMap = Object.fromEntries(roles.map(r => [r.user_id, r.role]));

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const data = await fetchWithAuth('/admin/users');
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage all registered users</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || '-'}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="capitalize">{roleMap[u.id] ?? 'user'}</TableCell>
                    <TableCell>{format(new Date(u.created_at), 'MMM d, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

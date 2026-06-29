import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, UserRound } from 'lucide-react';
import { AppRole, getDashboardPath, getLoginPath, useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import logo from '../../assets/logo.png';

interface LoginProps {
  expectedRole: AppRole;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong';
}

export default function Login({ expectedRole }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAdmin = expectedRole === 'ADMIN';
  const Icon = isAdmin ? Shield : UserRound;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signIn(email, password, expectedRole);
      if (!user) {
        toast({ title: 'Login failed', description: 'Invalid credentials', variant: 'destructive' });
        return;
      }
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (error: unknown) {
      toast({ title: 'Login failed', description: getErrorMessage(error), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="gradient-primary hidden items-center justify-center p-12 lg:flex">
        <div className="max-w-md text-white">
          <div className="mb-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/20 backdrop-blur">
            <img src={logo} alt="BillStack logo" className="h-12 w-12 object-contain" />
          </div>
          <h1 className="mb-4 text-4xl font-extrabold">{isAdmin ? 'Administrator Login' : 'User Login'}</h1>
          <p className="text-lg leading-relaxed text-white/80">
            {isAdmin
              ? 'Access operational controls, revenue analytics, transaction monitoring, and user management.'
              : 'Pay bills, review history, track due dates, and manage your notifications.'}
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="gradient-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-glow">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-extrabold">{isAdmin ? 'Administrator Login' : 'User Login'}</CardTitle>
            <CardDescription>Sign in with your {isAdmin ? 'admin' : 'user'} account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder={isAdmin ? 'admin@billstack.com' : 'test@billstack.com'} value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
              </div>
              <p className="text-xs text-muted-foreground">
                Demo: {isAdmin ? 'admin@billstack.com / admin123' : 'test@billstack.com / password'}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="gradient-primary h-11 w-full border-0 font-semibold shadow-glow" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              {!isAdmin && (
                <p className="text-sm text-muted-foreground">
                  New to BillStack? <Link to="/register" className="font-semibold text-primary hover:underline">Create account</Link>
                </p>
              )}
              <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
                <Link to="/" className="font-semibold text-primary hover:underline">Choose portal</Link>
                <Link to={getLoginPath(isAdmin ? 'USER' : 'ADMIN')} className="font-semibold text-primary hover:underline">
                  {isAdmin ? 'User Login' : 'Admin Login'}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </section>
    </div>
  );
}

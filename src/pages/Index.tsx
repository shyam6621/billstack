import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, UserRound, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDashboardPath, useAuth } from '@/hooks/useAuth';
import logo from '../../assets/logo.png';

const portals = [
  {
    title: 'Admin Portal',
    description: 'Manage users, bills, revenue analytics, transactions, and fraud alerts.',
    to: '/login/admin',
    icon: Shield,
  },
  {
    title: 'User Portal',
    description: 'Pay bills, track due dates, view payment history, and monitor activity.',
    to: '/login/user',
    icon: UserRound,
  },
];

const Index = () => {
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const continueSession = () => {
    if (role) navigate(getDashboardPath(role));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <img src={logo} alt="BillStack logo" className="h-14 w-14 rounded-2xl object-contain shadow-sm" />
          <div>
            <p className="text-xl font-extrabold tracking-tight">BillStack</p>
            <p className="text-sm text-muted-foreground">Role-based bill payment operations</p>
          </div>
        </div>
        {user && (
          <Button variant="outline" onClick={continueSession}>
            Continue Session <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            <Zap className="h-4 w-4" /> Secure role selection
          </div>
          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Choose your BillStack workspace
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Admins and customers sign in through separate portals. Each session is restored from the JWT role so deployed routing stays correct after refreshes.
          </p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link key={portal.title} to={portal.to} className="group block">
                <Card className="h-full border-border/80 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                  <CardContent className="flex h-full flex-col p-7">
                    <div className="gradient-primary mb-6 flex h-14 w-14 items-center justify-center rounded-xl shadow-glow">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="mb-3 text-2xl font-extrabold tracking-tight">{portal.title}</h2>
                    <p className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground">{portal.description}</p>
                    <Button className="gradient-primary border-0 font-semibold shadow-glow">
                      Open {portal.title} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default Index;

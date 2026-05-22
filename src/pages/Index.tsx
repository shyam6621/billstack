import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Shield, CreditCard, BarChart3, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.png';

const features = [
  { icon: CreditCard, title: 'Easy Payments', desc: 'Pay electricity, water, gas, internet and phone bills in one place.', gradient: 'gradient-primary' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'Bank-grade security with encrypted transactions and JWT authentication.', gradient: 'gradient-success' },
  { icon: BarChart3, title: 'Track History', desc: 'Complete transaction history with filtering and pagination.', gradient: 'gradient-info' },
  { icon: Clock, title: 'Due Date Alerts', desc: 'Never miss a payment with overdue bill tracking.', gradient: 'gradient-warning' },
  { icon: CheckCircle, title: 'Duplicate Prevention', desc: 'Smart payment processing prevents double charges.', gradient: 'gradient-danger' },
  { icon: Zap, title: 'Instant Processing', desc: 'Bills are marked paid instantly with unique transaction IDs.', gradient: 'gradient-primary' },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <img src={logo} alt="BillStack logo" className="h-14 w-14 rounded-3xl object-contain shadow-sm" />
          <span className="font-extrabold text-xl">BillStack</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login"><Button variant="ghost" className="font-semibold">Sign In</Button></Link>
          <Link to="/register"><Button className="gradient-primary border-0 font-semibold shadow-glow">Get Started</Button></Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto text-center px-6 py-28">
        <img src={logo} alt="BillStack logo" className="mx-auto h-24 w-24 rounded-3xl shadow-lg mb-6 object-contain" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold mb-6">
          <Zap className="h-4 w-4" /> Fast & Secure Bill Payments
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Pay Your Bills<br />
          <span className="gradient-primary-text">Without the Hassle</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          A modern bill payment platform for managing electricity, water, gas, internet and phone bills. Track payments, avoid late fees, and stay in control.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="gradient-primary border-0 text-base px-8 font-semibold shadow-glow-lg h-12">
              Create Free Account <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-base px-8 font-semibold h-12">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold mb-3">Everything You Need</h2>
          <p className="text-muted-foreground text-lg">Powerful features to simplify your bill management</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="card-hover border-0 shadow-md animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <CardContent className="pt-6 pb-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.gradient} shadow-md mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="gradient-primary py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to simplify your bill payments?</h2>
          <p className="text-white/80 text-lg mb-8">Join thousands of users who manage their bills effortlessly.</p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-10 h-12 text-base shadow-lg">
              Get Started for Free <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 BillStack. Online Bill Payment System.</p>
      </footer>
    </div>
  );
};

export default Index;

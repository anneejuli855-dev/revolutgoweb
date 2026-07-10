import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NovaLogo } from "@/components/nova-logo";
import { DEMO_CREDENTIALS, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Revolut Go" },
      { name: "description", content: "Sign in to your Revolut Go account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, ready, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [ready, isAuthenticated, navigate]);

  if (ready && isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
      } else {
        navigate({ to: "/dashboard", replace: true });
      }
    }, 350);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="glass-card rounded-2xl p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <NovaLogo size="lg" />
            <p className="mt-3 text-sm text-muted-foreground">Modern banking. Built for you.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@revolutgo.com"
                className="h-11 rounded-xl border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/60"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/90">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-white/10 bg-white/5 pr-11 text-foreground focus-visible:ring-2 focus-visible:ring-primary/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.58_0.22_260/0.7)] transition hover:bg-primary/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">Demo credentials</span>
            <div className="mt-1 font-mono text-[11px]">
              {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Revolut Go. All rights reserved.
        </p>
      </div>
    </main>
  );
}
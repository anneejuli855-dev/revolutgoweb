import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Camera,
  CreditCard,
  LayoutGrid,
  LogOut,
  PiggyBank,
  Receipt,
  Settings as SettingsIcon,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NovaLogo } from "@/components/nova-logo";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NovaBank" },
      { name: "description", content: "Your NovaBank account overview." },
    ],
  }),
  component: DashboardPage,
});

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const TRANSACTIONS = [
  { name: "Netflix Subscription", date: "Jun 24, 2026", amount: -15.99, status: "Completed" },
  { name: "Wire Transfer — John Doe", date: "Jun 23, 2026", amount: -1250.0, status: "Completed" },
  { name: "Payroll — Acme Corp", date: "Jun 21, 2026", amount: 4820.0, status: "Completed" },
  { name: "Apple Store", date: "Jun 20, 2026", amount: -249.0, status: "Pending" },
  { name: "Refund — Amazon", date: "Jun 18, 2026", amount: 56.32, status: "Completed" },
  { name: "Coffee — Blue Bottle", date: "Jun 17, 2026", amount: -6.75, status: "Completed" },
];

function DashboardPage() {
  const { user, ready, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [modal, setModal] = useState<null | "deposit" | "withdraw">(null);
  const [amount, setAmount] = useState("");

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!isAuthenticated) return <Navigate to="/" replace />;

  const handleLogout = () => {
    logout();
    navigate({ to: "/", replace: true });
  };

  const confirmModal = () => {
    const label = modal === "deposit" ? "Deposit" : "Withdrawal";
    toast.success(`${label} of $${amount || "0"} submitted`, {
      description: "This is a demo — no funds were moved.",
    });
    setModal(null);
    setAmount("");
  };

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0A0F1E]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <NovaLogo />
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary ring-1 ring-primary/40">
                {user?.initials}
              </div>
              <span className="text-sm font-medium text-foreground">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-28 pt-6 sm:px-6 lg:pb-10">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="glass-card sticky top-24 rounded-2xl p-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.58_0.22_260/0.6)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 space-y-6">
          {/* Welcome */}
          <section>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Good morning, {user?.name.split(" ")[0]} <span aria-hidden>👋</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here's what's happening with your account today.
            </p>
          </section>

          {/* Hero balance card */}
          <section className="hero-gradient relative overflow-hidden rounded-2xl p-6 shadow-[0_20px_60px_-20px_oklch(0.42_0.21_280/0.8)] sm:p-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
            <div className="relative">
              <p className="text-sm font-medium uppercase tracking-wider text-white/70">
                Total USD Balance
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                $2,300,000.00
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
                <span className="font-mono tracking-wider">•••• •••• 4821</span>
                <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline-block" />
                <span>Checking Account</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => setModal("deposit")}
                  className="h-11 rounded-full bg-white px-6 font-semibold text-primary hover:bg-white/90"
                >
                  <ArrowDownLeft className="mr-1.5 h-4 w-4" />
                  Deposit
                </Button>
                <Button
                  onClick={() => setModal("withdraw")}
                  variant="outline"
                  className="h-11 rounded-full border-white/60 bg-transparent px-6 font-semibold text-white hover:bg-white/10 hover:text-white"
                >
                  <ArrowUpRight className="mr-1.5 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </div>
          </section>

          {/* Secondary balances */}
          <section className="grid gap-4 sm:grid-cols-3">
            <BalanceCard icon={PiggyBank} label="Savings Account" value="$8,200.00" />
            <BalanceCard icon={Wallet} label="USD Wallet" value="$3,450.75" />
            <BalanceCard icon={TrendingUp} label="Investments" value="$12,000.00" />
          </section>

          {/* Transactions */}
          <section className="glass-card overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Recent Transactions</h2>
              <button className="text-xs font-medium text-primary hover:underline">View all</button>
            </div>
            <ul className="divide-y divide-white/5">
              {TRANSACTIONS.map((t) => {
                const credit = t.amount > 0;
                return (
                  <li
                    key={t.name}
                    className="flex items-center justify-between gap-3 px-6 py-4 transition hover:bg-white/[0.02]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                          credit ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-muted-foreground",
                        )}
                      >
                        {credit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "hidden rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:inline-block",
                          t.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                            : "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
                        )}
                      >
                        {t.status}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-sm font-semibold tabular-nums",
                          credit ? "text-emerald-400" : "text-rose-400",
                        )}
                      >
                        {credit ? "+" : "−"}${Math.abs(t.amount).toFixed(2)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Profile */}
          <ProfileSection initials={user?.initials ?? "AC"} />
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-[#0A0F1E]/90 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_oklch(0.58_0.22_260/0.8)]")} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Deposit / Withdraw modal */}
      <Dialog open={modal !== null} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="rounded-2xl border-white/10 bg-[#111729] text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {modal === "deposit" ? "Deposit funds" : "Withdraw funds"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {modal === "deposit"
                ? "Add money to your checking account."
                : "Move money out of your checking account."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-white/5 pl-7 text-lg font-semibold tabular-nums focus-visible:ring-2 focus-visible:ring-primary/60"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setModal(null)} className="hover:bg-white/5">
              Cancel
            </Button>
            <Button
              onClick={confirmModal}
              className="rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Confirm {modal === "deposit" ? "Deposit" : "Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BalanceCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="mt-4 text-2xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function ProfileSection({ initials }: { initials: string }) {
  const [form, setForm] = useState({
    fullName: "Alex Carter",
    email: "admin@novabank.com",
    phone: "+1 (415) 555-0142",
    country: "United States",
  });

  return (
    <section className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">Update your personal information.</p>
      </div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 text-2xl font-bold text-white ring-2 ring-white/10">
              {initials}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-[#0A0F1E] transition hover:bg-primary/90"
              aria-label="Upload avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Change photo</p>
        </div>

        <form
          className="grid flex-1 gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Profile updated");
          }}
        >
          <Field label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
          <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <Field label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
          <div className="sm:col-span-2">
            <Button
              type="submit"
              className="h-11 rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-foreground/90">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border-white/10 bg-white/5 focus-visible:ring-2 focus-visible:ring-primary/60"
      />
    </div>
  );
}
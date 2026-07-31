import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bitcoin,
  Camera,
  Copy,
  CreditCard,
  LayoutGrid,
  LogOut,
  Lock,
  Mail,
  PiggyBank,
  Plus,
  Receipt,
  Search,
  Settings as SettingsIcon,
  Snowflake,
  Trash2,
  TrendingUp,
  Wallet,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      { title: "Dashboard — Revolut Go" },
      { name: "description", content: "Your Revolut Go account overview." },
    ],
  }),
  component: DashboardPage,
});

type View = "overview" | "transactions" | "cards" | "settings";

const NAV_ITEMS: { id: View; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

type Transaction = {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  status: "Completed" | "Pending";
};

const TRANSACTIONS: Transaction[] = [
  { id: "t1", name: "Netflix Subscription", category: "Entertainment", date: "Jun 24, 2026", amount: -15.99, status: "Completed" },
  { id: "t2", name: "Wire Transfer — Walter Reeves", category: "Transfer", date: "Jun 23, 2026", amount: -1250.0, status: "Completed" },
  { id: "t3", name: "Payroll — Acme Corp", category: "Income", date: "Jun 21, 2026", amount: 4820.0, status: "Completed" },
  { id: "t4", name: "Apple Store", category: "Shopping", date: "Jun 20, 2026", amount: -249.0, status: "Pending" },
  { id: "t5", name: "Refund — Amazon", category: "Refund", date: "Jun 18, 2026", amount: 56.32, status: "Completed" },
  { id: "t6", name: "Coffee — Blue Bottle", category: "Food & Drink", date: "Jun 17, 2026", amount: -6.75, status: "Completed" },
  { id: "t7", name: "Uber", category: "Transport", date: "Jun 16, 2026", amount: -22.4, status: "Completed" },
  { id: "t8", name: "Whole Foods Market", category: "Groceries", date: "Jun 15, 2026", amount: -148.22, status: "Completed" },
  { id: "t9", name: "Stripe Payout", category: "Income", date: "Jun 14, 2026", amount: 1820.5, status: "Completed" },
  { id: "t10", name: "Spotify Family", category: "Entertainment", date: "Jun 12, 2026", amount: -16.99, status: "Completed" },
  { id: "t11", name: "Delta Airlines", category: "Travel", date: "Jun 10, 2026", amount: -612.4, status: "Completed" },
  { id: "t12", name: "Airbnb — Lisbon", category: "Travel", date: "Jun 09, 2026", amount: -880.0, status: "Pending" },
  { id: "t13", name: "Venmo — Sarah", category: "Transfer", date: "Jun 07, 2026", amount: 120.0, status: "Completed" },
  { id: "t14", name: "Electric Bill — PG&E", category: "Utilities", date: "Jun 05, 2026", amount: -94.18, status: "Completed" },
  { id: "t15", name: "Dividend — VTI", category: "Investments", date: "Jun 03, 2026", amount: 215.6, status: "Completed" },
  { id: "t16", name: "Gym Membership", category: "Health", date: "Jun 01, 2026", amount: -49.0, status: "Completed" },
];

type Card = {
  id: string;
  label: string;
  holder: string;
  number: string;
  expiry: string;
  type: "Virtual" | "Physical";
  network: "Visa" | "Mastercard";
  frozen: boolean;
};

const CARDS_KEY = "revolutgo.cards.v4";
const PROFILE_KEY = "revolutgo.profile.v4";
const TX_KEY = "revolutgo.tx.v2";

// TODO: paste your BTC deposit wallet address here.
const BTC_WALLET_ADDRESS = "";

function formatTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

type TxContextValue = {
  items: Transaction[];
  add: (t: Omit<Transaction, "id">) => void;
};
const TxContext = createContext<TxContextValue | null>(null);

function TxProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Transaction[]>(TRANSACTIONS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TX_KEY);
      if (raw) setItems(JSON.parse(raw) as Transaction[]);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(TX_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const add: TxContextValue["add"] = (t) => {
    setItems((prev) => [{ ...t, id: `tx_${Date.now()}` }, ...prev]);
  };

  return <TxContext.Provider value={{ items, add }}>{children}</TxContext.Provider>;
}

function useTx() {
  const ctx = useContext(TxContext);
  if (!ctx) throw new Error("useTx must be used inside TxProvider");
  return ctx;
}

const DEFAULT_CARDS: Card[] = [
  {
    id: "c1",
    label: "Everyday",
    holder: "JULI ANNEE",
    number: "4485 8231 9217 4821",
    expiry: "08/29",
    type: "Physical",
    network: "Visa",
    frozen: false,
  },
  {
    id: "c2",
    label: "Subscriptions",
    holder: "JULI ANNEE",
    number: "5364 1129 8745 1102",
    expiry: "02/28",
    type: "Virtual",
    network: "Mastercard",
    frozen: false,
  },
];

type Profile = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  language: string;
  currency: string;
  marketingEmails: boolean;
  twoFactor: boolean;
  transactionAlerts: boolean;
};

const DEFAULT_PROFILE: Profile = {
  fullName: "Juli Annee",
  email: "Julieanneee10@mail.com",
  phone: "(415) 555-0142",
  country: "United States",
  address: "742 Market Street",
  city: "San Francisco",
  postalCode: "94102",
  language: "English",
  currency: "USD",
  marketingEmails: true,
  twoFactor: true,
  transactionAlerts: true,
};

function DashboardPage() {
  return (
    <TxProvider>
      <DashboardInner />
    </TxProvider>
  );
}

function DashboardInner() {
  const { user, ready, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { add } = useTx();
  const [active, setActive] = useState<View>("overview");
  const [modal, setModal] = useState<null | "deposit" | "withdraw">(null);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/" replace />;

  const handleLogout = () => {
    logout();
    navigate({ to: "/", replace: true });
  };

  const closeModal = () => {
    setModal(null);
    setAmount("");
    setCopied(false);
  };

  const confirmDeposit = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    add({
      name: "Bitcoin Deposit",
      category: "Deposit · BTC",
      date: formatTodayLabel(),
      amount: value,
      status: "Pending",
    });
    toast.success(`Deposit of $${value.toFixed(2)} submitted`, {
      description: "Awaiting network confirmation.",
    });
    closeModal();
    setActive("transactions");
  };

  const confirmWithdraw = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    add({
      name: "Withdrawal",
      category: "Withdrawal",
      date: formatTodayLabel(),
      amount: -value,
      status: "Completed",
    });
    toast.success(`Withdrawal of $${value.toFixed(2)} completed`);
    closeModal();
    setActive("transactions");
  };

  const copyAddress = async () => {
    if (!BTC_WALLET_ADDRESS) {
      toast.error("No wallet address configured yet");
      return;
    }
    try {
      await navigator.clipboard.writeText(BTC_WALLET_ADDRESS);
      setCopied(true);
      toast.success("Wallet address copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy address");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
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
                      ? "bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_oklch(1_0_0/0.15)]"
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
          {active === "overview" && (
            <OverviewView
              userName={user?.name ?? ""}
              onDeposit={() => setModal("deposit")}
              onWithdraw={() => setModal("withdraw")}
              onViewAll={() => setActive("transactions")}
            />
          )}
          {active === "transactions" && <TransactionsView />}
          {active === "cards" && <CardsView holderDefault={user?.name ?? "Juli Annee"} />}
          {active === "settings" && <SettingsView initials={user?.initials ?? "AC"} />}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-[#0A0A0A]/90 backdrop-blur-xl lg:hidden">
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
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive && "drop-shadow-[0_0_8px_oklch(1_0_0/0.6)]",
                  )}
                />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Deposit / Withdraw modal */}
      <Dialog open={modal !== null} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="rounded-2xl border-white/10 bg-[#111111] text-foreground sm:max-w-md">
          {modal === "deposit" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Bitcoin className="h-5 w-5" />
                  Deposit Bitcoin
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Send BTC to the wallet address below. Funds will appear once the transfer confirms on the network.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>BTC wallet address</Label>
                  <div className="flex items-stretch gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
                    <div className="flex-1 truncate px-2 py-2 font-mono text-sm text-foreground">
                      {BTC_WALLET_ADDRESS || (
                        <span className="text-muted-foreground">
                          Wallet address not set yet
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={copyAddress}
                      variant="ghost"
                      size="sm"
                      className="shrink-0 rounded-lg hover:bg-white/10"
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Only send BTC to this address. Sending other assets may result in loss of funds.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD equivalent)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 rounded-xl border-white/10 bg-white/5 pl-7 text-lg font-semibold tabular-nums focus-visible:ring-2 focus-visible:ring-primary/60"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="ghost" onClick={closeModal} className="hover:bg-white/5">
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeposit}
                  className="rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  I've sent the BTC
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Withdraw funds</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Move money out of your checking account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
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
                <Button variant="ghost" onClick={closeModal} className="hover:bg-white/5">
                  Cancel
                </Button>
                <Button
                  onClick={confirmWithdraw}
                  className="rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Confirm Withdrawal
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ----------------------------- Overview ----------------------------- */

function OverviewView({
  userName,
  onDeposit,
  onWithdraw,
  onViewAll,
}: {
  userName: string;
  onDeposit: () => void;
  onWithdraw: () => void;
  onViewAll: () => void;
}) {
  const { items } = useTx();
  const recent = items.slice(0, 6);
  return (
    <>
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Good morning, {userName.split(" ")[0]} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your account today.
        </p>
      </section>

      <section className="hero-gradient relative overflow-hidden rounded-2xl p-6 shadow-[0_20px_60px_-20px_oklch(0.42_0.21_280/0.8)] sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-medium uppercase tracking-wider text-white/70">
            Total USD Balance
          </p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            $1,300,000.00
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
            <span className="font-mono tracking-wider">•••• •••• 4821</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline-block" />
            <span>Checking Account</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={onDeposit}
              className="h-11 rounded-full bg-white px-6 font-semibold text-black hover:bg-white/90"
            >
              <ArrowDownLeft className="mr-1.5 h-4 w-4 text-black" />
              Deposit
            </Button>
            <Button
              onClick={onWithdraw}
              variant="outline"
              className="h-11 rounded-full border-white/60 bg-transparent px-6 font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <ArrowUpRight className="mr-1.5 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <BalanceCard icon={PiggyBank} label="Savings Account" value="$450,000.00" />
        <BalanceCard icon={Wallet} label="USD Wallet" value="$250,000.00" />
        <BalanceCard icon={TrendingUp} label="Investments" value="$600,000.00" />
      </section>

      <section className="glass-card overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Recent Transactions</h2>
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </button>
        </div>
        <TransactionList items={recent} />
      </section>
    </>
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

function TransactionList({ items }: { items: Transaction[] }) {
  if (items.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-muted-foreground">
        No transactions match your filters.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-white/5">
      {items.map((t) => {
        const credit = t.amount > 0;
        return (
          <li
            key={t.id}
            className="flex items-center justify-between gap-3 px-6 py-4 transition hover:bg-white/[0.02]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  credit
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-white/5 text-muted-foreground",
                )}
              >
                {credit ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.category} · {t.date}
                </p>
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
  );
}

/* ---------------------------- Transactions ---------------------------- */

function TransactionsView() {
  const { items: allItems } = useTx();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "credits" | "debits">("all");
  const [status, setStatus] = useState<"all" | "Completed" | "Pending">("all");

  const items = useMemo(() => {
    return allItems.filter((t) => {
      if (filter === "credits" && t.amount <= 0) return false;
      if (filter === "debits" && t.amount > 0) return false;
      if (status !== "all" && t.status !== status) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return (
          t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allItems, query, filter, status]);

  const totalIn = allItems.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = allItems.filter((t) => t.amount < 0).reduce(
    (s, t) => s + Math.abs(t.amount),
    0,
  );

  return (
    <>
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every movement across your Revolut Go accounts.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total in" value={`+$${totalIn.toFixed(2)}`} tone="positive" />
        <StatCard label="Total out" value={`−$${totalOut.toFixed(2)}`} tone="negative" />
        <StatCard label="Transactions" value={String(allItems.length)} />
      </section>

      <section className="glass-card overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-3 border-b border-white/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions"
              className="h-10 rounded-xl border-white/10 bg-white/5 pl-9 focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="h-10 w-[130px] rounded-xl border-white/10 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111729] text-foreground">
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="credits">Credits</SelectItem>
                <SelectItem value="debits">Debits</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="h-10 w-[130px] rounded-xl border-white/10 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111729] text-foreground">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <TransactionList items={items} />
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tabular-nums",
          tone === "positive" && "text-emerald-400",
          tone === "negative" && "text-rose-400",
          !tone && "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/* ------------------------------- Cards ------------------------------- */

function useCards() {
  const [cards, setCards] = useState<Card[]>(DEFAULT_CARDS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CARDS_KEY);
      if (raw) setCards(JSON.parse(raw) as Card[]);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  }, [cards, loaded]);

  return { cards, setCards };
}

function randomCardNumber(network: Card["network"]) {
  const prefix = network === "Visa" ? "4" : "5";
  let n = prefix;
  for (let i = 0; i < 15; i++) n += Math.floor(Math.random() * 10);
  return n.match(/.{1,4}/g)!.join(" ");
}

function randomExpiry() {
  const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const y = String((new Date().getFullYear() + 4 + Math.floor(Math.random() * 3)) % 100).padStart(
    2,
    "0",
  );
  return `${m}/${y}`;
}

function CardsView({ holderDefault }: { holderDefault: string }) {
  const { cards, setCards } = useCards();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    label: "",
    holder: holderDefault.toUpperCase(),
    type: "Virtual" as Card["type"],
    network: "Visa" as Card["network"],
  });

  const reset = () =>
    setForm({
      label: "",
      holder: holderDefault.toUpperCase(),
      type: "Virtual",
      network: "Visa",
    });

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) {
      toast.error("Please give your card a name.");
      return;
    }
    const card: Card = {
      id: `c${Date.now()}`,
      label: form.label.trim().slice(0, 24),
      holder: form.holder.trim().toUpperCase().slice(0, 26),
      number: randomCardNumber(form.network),
      expiry: randomExpiry(),
      type: form.type,
      network: form.network,
      frozen: false,
    };
    setCards((cs) => [card, ...cs]);
    toast.success(`${form.type} ${form.network} card created`, {
      description: `${card.label} · ${card.number.slice(-4)}`,
    });
    reset();
    setOpen(false);
  };

  const toggleFreeze = (id: string) => {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, frozen: !c.frozen } : c)));
  };

  const remove = (id: string) => {
    setCards((cs) => cs.filter((c) => c.id !== id));
    toast.success("Card removed");
  };

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Cards</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your virtual and physical Revolut Go cards.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Card
        </Button>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        {cards.map((card) => (
          <CardTile key={card.id} card={card} onFreeze={() => toggleFreeze(card.id)} onRemove={() => remove(card.id)} />
        ))}
        {cards.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-10 text-center sm:col-span-2">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              You don't have any cards yet. Create your first one.
            </p>
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={(o) => (setOpen(o), o || reset())}>
        <DialogContent className="rounded-2xl border-white/10 bg-[#111729] text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create a new card</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose the type and network. Card numbers are generated for demo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onCreate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cardLabel">Card name</Label>
              <Input
                id="cardLabel"
                placeholder="e.g. Travel, Subscriptions"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                maxLength={24}
                className="h-11 rounded-xl border-white/10 bg-white/5 focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardHolder">Cardholder name</Label>
              <Input
                id="cardHolder"
                value={form.holder}
                onChange={(e) => setForm({ ...form, holder: e.target.value.toUpperCase() })}
                maxLength={26}
                className="h-11 rounded-xl border-white/10 bg-white/5 font-mono uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as Card["type"] })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#111729] text-foreground">
                    <SelectItem value="Virtual">Virtual</SelectItem>
                    <SelectItem value="Physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Network</Label>
                <Select
                  value={form.network}
                  onValueChange={(v) => setForm({ ...form, network: v as Card["network"] })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#111729] text-foreground">
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="Mastercard">Mastercard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Create Card
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CardTile({
  card,
  onFreeze,
  onRemove,
}: {
  card: Card;
  onFreeze: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden rounded-2xl p-5 text-white shadow-[0_20px_60px_-20px_oklch(0.42_0.21_280/0.8)] transition",
          card.frozen ? "bg-gradient-to-br from-slate-700 to-slate-900" : "hero-gradient",
        )}
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/70">{card.type}</p>
              <p className="text-lg font-semibold">{card.label}</p>
            </div>
            <Wifi className="h-5 w-5 rotate-90 text-white/80" />
          </div>
          <div className="space-y-3">
            <p className="font-mono text-lg tracking-[0.2em]">
              {card.frozen ? "•••• •••• •••• " + card.number.slice(-4) : card.number}
            </p>
            <div className="flex items-end justify-between text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/60">Cardholder</p>
                <p className="font-mono">{card.holder}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/60">Expires</p>
                <p className="font-mono">{card.expiry}</p>
              </div>
              <p className="font-bold italic">{card.network}</p>
            </div>
          </div>
        </div>
        {card.frozen && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Frozen
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onFreeze}
          className="h-9 flex-1 rounded-xl border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10"
        >
          <Snowflake className="mr-1.5 h-4 w-4" />
          {card.frozen ? "Unfreeze" : "Freeze"}
        </Button>
        <Button
          variant="outline"
          onClick={onRemove}
          className="h-9 rounded-xl border-destructive/30 bg-destructive/10 text-sm font-medium text-destructive hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------ Settings ----------------------------- */

function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) setProfile({ ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Profile) });
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, loaded]);

  return { profile, setProfile };
}

function formatUSPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${a}`;
  if (digits.length <= 6) return `(${a}) ${b}`;
  return `(${a}) ${b}-${c}`;
}

function SettingsView({ initials }: { initials: string }) {
  const { profile, setProfile } = useProfile();

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = profile.phone.replace(/\D/g, "");
    if (!profile.fullName.trim()) return toast.error("Name is required.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.email))
      return toast.error("Enter a valid email.");
    if (phoneDigits.length !== 10) return toast.error("Enter a 10-digit US phone number.");
    toast.success("Profile saved", { description: "Your changes have been applied." });
  };

  return (
    <>
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information, preferences, and security.
        </p>
      </section>

      <form onSubmit={onSave} className="space-y-6">
        {/* Avatar + identity */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 text-2xl font-bold text-white ring-2 ring-white/10">
                  {initials}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-[#0A0A0A] transition hover:bg-primary/90"
                  aria-label="Upload avatar"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Change photo</p>
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <Field
                label="Full Name"
                value={profile.fullName}
                onChange={(v) => update("fullName", v)}
              />
              <Field
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={(v) => update("email", v)}
              />
              <PhoneField
                value={profile.phone}
                onChange={(v) => update("phone", formatUSPhone(v))}
              />
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={profile.country}
                  onValueChange={(v) => update("country", v)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#111729] text-foreground">
                    {["United States", "Canada", "United Kingdom", "Germany", "Australia"].map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-base font-semibold text-foreground">Address</h2>
          <p className="text-sm text-muted-foreground">For card delivery and statements.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label="Street Address"
              value={profile.address}
              onChange={(v) => update("address", v)}
            />
            <Field label="City" value={profile.city} onChange={(v) => update("city", v)} />
            <Field
              label="Postal Code"
              value={profile.postalCode}
              onChange={(v) => update("postalCode", v)}
            />
          </div>
        </section>

        {/* Preferences */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-base font-semibold text-foreground">Preferences</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={profile.language}
                onValueChange={(v) => update("language", v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111729] text-foreground">
                  {["English", "Español", "Français", "Deutsch"].map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Display Currency</Label>
              <Select
                value={profile.currency}
                onValueChange={(v) => update("currency", v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111729] text-foreground">
                  {["USD", "EUR", "GBP", "CAD"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <ToggleRow
              icon={Mail}
              title="Marketing emails"
              description="Get news, product tips, and offers."
              checked={profile.marketingEmails}
              onChange={(v) => update("marketingEmails", v)}
            />
            <ToggleRow
              icon={Lock}
              title="Two-factor authentication"
              description="Require a code at each sign-in."
              checked={profile.twoFactor}
              onChange={(v) => update("twoFactor", v)}
            />
            <ToggleRow
              icon={Receipt}
              title="Transaction alerts"
              description="Push notification for every transaction."
              checked={profile.transactionAlerts}
              onChange={(v) => update("transactionAlerts", v)}
            />
          </div>
        </section>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="h-11 rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
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

function PhoneField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-foreground/90">Phone Number</Label>
      <div className="flex items-stretch overflow-hidden rounded-xl border border-white/10 bg-white/5 focus-within:ring-2 focus-within:ring-primary/60">
        <span className="flex items-center border-r border-white/10 bg-white/5 px-3 text-sm font-medium text-muted-foreground">
          +1
        </span>
        <Input
          type="tel"
          inputMode="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="(555) 555-0142"
          className="h-11 rounded-none border-0 bg-transparent focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
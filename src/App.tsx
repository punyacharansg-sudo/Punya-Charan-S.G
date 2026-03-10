import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  ReceiptIndianRupee, 
  BarChart3, 
  Sparkles, 
  TrendingUp, 
  Settings, 
  LogOut,
  Menu,
  X,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Target,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface User {
  id: string;
  email: string;
}

interface Business {
  id: string;
  name: string;
  industry: string;
  location: string;
  currency: string;
  monthlyTarget: number;
}

interface Transaction {
  id: string;
  date: string;
  salesAmount: number;
  expenseAmount: number;
  expenseCategory: string;
  notes: string;
}

interface AIInsights {
  insights: string[];
  recommendations: string[];
  forecast: {
    predictedRevenue: number;
    growthProbability: number;
  };
}

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [view, setView] = useState<"dashboard" | "transactions" | "analytics" | "insights" | "settings">("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const bizRes = await fetch("/api/business", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (bizRes.ok) {
        const bizData = await bizRes.json();
        setBusiness(bizData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setBusiness(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!token) {
    return <AuthPage onLogin={(t) => setToken(t)} />;
  }

  if (!business) {
    return <OnboardingPage token={token} onComplete={(biz) => setBusiness(biz)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar activeView={view} setView={setView} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
        
        <Header businessName={business.name} />

        <div className="p-8 max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            {view === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Dashboard token={token} business={business} />
              </motion.div>
            )}
            {view === "transactions" && (
              <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Transactions token={token} business={business} />
              </motion.div>
            )}
            {view === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Analytics token={token} business={business} />
              </motion.div>
            )}
            {view === "insights" && (
              <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AIInsightsView token={token} business={business} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Sub-components ---

function AuthPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        onLogin(data.token);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-emerald-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/business/1920/1080')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="relative z-10 text-white max-w-lg">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold tracking-tighter mb-6"
          >
            SmartMSME AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-emerald-50/80 leading-relaxed"
          >
            Empowering small businesses with enterprise-grade financial intelligence. 
            Track, analyze, and grow with AI.
          </motion.p>
          
          <div className="mt-12 grid grid-cols-2 gap-6">
            {[
              { label: "Real-time Profit", icon: Wallet },
              { label: "AI Forecasting", icon: Sparkles },
              { label: "Expense Tracking", icon: ReceiptIndianRupee },
              { label: "Growth Insights", icon: TrendingUp },
            ].map((item, i) => (
              <motion.div 
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10"
              >
                <item.icon className="w-6 h-6 mb-2 text-emerald-300" />
                <p className="text-sm font-medium">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-bold mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <p className="text-gray-400 mb-8">Enter your details to access your dashboard.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                {isLogin ? "Sign In" : "Get Started"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function OnboardingPage({ token, onComplete }: { token: string, onComplete: (biz: Business) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    industry: "Retail",
    location: "",
    currency: "INR",
    monthlyTarget: "50000"
  });

  const industries = ["Retail", "Restaurant", "Manufacturing", "Service", "Freelance", "Distribution"];

  const handleSubmit = async () => {
    const res = await fetch("/api/business", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const biz = await res.json();
      onComplete(biz);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                step >= s ? "bg-emerald-500 text-black" : "bg-white/10 text-gray-500"
              )}>
                {s}
              </div>
              {s < 3 && <div className={cn("w-20 h-1 mx-2 rounded", step > s ? "bg-emerald-500" : "bg-white/10")} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Business Information</h2>
              <p className="text-gray-400">Tell us about your business to get started.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Business Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Green Valley Organics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Industry</label>
                  <select 
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Mumbai, India"
                  />
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.location}
                className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl disabled:opacity-50"
              >
                Next Step
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Business Goals</h2>
              <p className="text-gray-400">Set your targets to help us track your progress.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                  <select 
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Revenue Target</label>
                  <input 
                    type="number" 
                    value={formData.monthlyTarget}
                    onChange={(e) => setFormData({...formData, monthlyTarget: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl border border-white/10"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="flex-1 bg-emerald-500 text-black font-bold py-3 rounded-xl"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold">Ready to Grow?</h2>
              <p className="text-gray-400">Your business dashboard is ready. Let's start tracking your success.</p>
              <button 
                onClick={handleSubmit}
                className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl text-lg"
              >
                Enter Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Sidebar({ activeView, setView, onLogout }: { activeView: string, setView: (v: any) => void, onLogout: () => void }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions", icon: ReceiptIndianRupee },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "insights", label: "AI Insights", icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col p-6">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-black" />
        </div>
        <span className="text-xl font-bold tracking-tighter">SmartMSME</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeView === item.id 
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/5 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function Header({ businessName }: { businessName: string }) {
  return (
    <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#050505]/50 backdrop-blur-md sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold">{businessName}</h1>
        <p className="text-xs text-gray-500">Financial Intelligence Dashboard</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-gray-300">Live Analytics</span>
        </div>
        <div className="w-10 h-10 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center">
          <span className="text-emerald-500 font-bold">JD</span>
        </div>
      </div>
    </header>
  );
}

function Dashboard({ token, business }: { token: string, business: Business }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const res = await fetch("/api/transactions", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setTransactions(await res.json());
    }
    setLoading(false);
  };

  const stats = {
    totalSales: transactions.reduce((acc, t) => acc + t.salesAmount, 0),
    totalExpenses: transactions.reduce((acc, t) => acc + t.expenseAmount, 0),
    totalProfit: transactions.reduce((acc, t) => acc + (t.salesAmount - t.expenseAmount), 0),
    monthlyProgress: (transactions.reduce((acc, t) => acc + t.salesAmount, 0) / business.monthlyTarget) * 100
  };

  const chartData = {
    labels: transactions.slice(0, 7).reverse().map(t => format(new Date(t.date), 'MMM dd')),
    datasets: [
      {
        label: 'Sales',
        data: transactions.slice(0, 7).reverse().map(t => t.salesAmount),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: transactions.slice(0, 7).reverse().map(t => t.expenseAmount),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={stats.totalSales} icon={Wallet} trend="+12%" color="emerald" currency={business.currency} />
        <StatCard title="Total Expenses" value={stats.totalExpenses} icon={ReceiptIndianRupee} trend="+5%" color="red" currency={business.currency} />
        <StatCard title="Net Profit" value={stats.totalProfit} icon={TrendingUp} trend="+18%" color="blue" currency={business.currency} />
        <StatCard title="Target Progress" value={`${Math.min(100, stats.monthlyProgress).toFixed(1)}%`} icon={Target} trend="Monthly" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Revenue vs Expenses</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80">
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
                  x: { grid: { display: false }, ticks: { color: '#666' } }
                }
              }} 
            />
          </div>
        </div>

        {/* Quick Actions & Recent */}
        <div className="space-y-6">
          <div className="bg-emerald-500 p-6 rounded-3xl text-black">
            <h3 className="text-lg font-bold mb-2">Quick Entry</h3>
            <p className="text-sm text-black/70 mb-4">Add a new transaction to update your analytics.</p>
            <button className="w-full bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-all">
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {transactions.slice(0, 3).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      t.salesAmount > t.expenseAmount ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {t.salesAmount > t.expenseAmount ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{t.expenseCategory}</p>
                      <p className="text-xs text-gray-500">{format(new Date(t.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <p className={cn("font-bold", t.salesAmount > t.expenseAmount ? "text-emerald-500" : "text-red-500")}>
                    {t.salesAmount > t.expenseAmount ? `+${t.salesAmount}` : `-${t.expenseAmount}`}
                  </p>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-center text-gray-500 py-4">No transactions yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color, currency }: any) {
  const colors: any = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={cn("text-xs font-bold px-2 py-1 rounded-full", colors[color])}>{trend}</span>
      </div>
      <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
      <h4 className="text-2xl font-bold">
        {currency && (currency === "INR" ? "₹" : "$")}
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h4>
    </div>
  );
}

function Transactions({ token, business }: { token: string, business: Business }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    salesAmount: "",
    expenseAmount: "",
    expenseCategory: "Sales",
    notes: ""
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const res = await fetch("/api/transactions", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setTransactions(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      fetchTransactions();
      setShowForm(false);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        salesAmount: "",
        expenseAmount: "",
        expenseCategory: "Sales",
        notes: ""
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Transactions</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-emerald-500 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Entry
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-sm">
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium text-right">Sales</th>
              <th className="px-6 py-4 font-medium text-right">Expenses</th>
              <th className="px-6 py-4 font-medium text-right">Profit</th>
              <th className="px-6 py-4 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-white/5 transition-all">
                <td className="px-6 py-4 text-sm">{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                <td className="px-6 py-4">
                  <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                    {t.expenseCategory}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right text-emerald-500 font-bold">+{t.salesAmount}</td>
                <td className="px-6 py-4 text-sm text-right text-red-500 font-bold">-{t.expenseAmount}</td>
                <td className={cn(
                  "px-6 py-4 text-sm text-right font-bold",
                  (t.salesAmount - t.expenseAmount) >= 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {(t.salesAmount - t.expenseAmount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{t.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No transactions recorded yet.
          </div>
        )}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">New Transaction</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                    <select 
                      value={formData.expenseCategory}
                      onChange={(e) => setFormData({...formData, expenseCategory: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>Sales</option>
                      <option>Inventory</option>
                      <option>Rent</option>
                      <option>Salaries</option>
                      <option>Marketing</option>
                      <option>Utilities</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Sales Amount</label>
                    <input 
                      type="number" 
                      value={formData.salesAmount}
                      onChange={(e) => setFormData({...formData, salesAmount: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Expense Amount</label>
                    <input 
                      type="number" 
                      value={formData.expenseAmount}
                      onChange={(e) => setFormData({...formData, expenseAmount: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                    placeholder="Describe the transaction..."
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Save Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Analytics({ token, business }: { token: string, business: Business }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch("/api/transactions", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(setTransactions);
  }, []);

  const categoryData = transactions.reduce((acc: any, t) => {
    acc[t.expenseCategory] = (acc[t.expenseCategory] || 0) + t.expenseAmount;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: [
        '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'
      ],
      borderWidth: 0,
    }]
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h2 className="text-3xl font-bold">Advanced Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
          <h3 className="text-xl font-bold mb-6">Expense Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <Pie data={pieData} options={{ plugins: { legend: { position: 'right', labels: { color: '#999' } } } }} />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
          <h3 className="text-xl font-bold mb-6">Profit Trend</h3>
          <div className="h-80">
            <Line 
              data={{
                labels: transactions.slice(0, 10).reverse().map(t => format(new Date(t.date), 'MMM dd')),
                datasets: [{
                  label: 'Net Profit',
                  data: transactions.slice(0, 10).reverse().map(t => t.salesAmount - t.expenseAmount),
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  fill: true,
                  tension: 0.4,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
                  x: { grid: { display: false }, ticks: { color: '#666' } }
                }
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AIInsightsView({ token, business }: { token: string, business: Business }) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/insights", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      setInsights(data);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">AI Business Insights</h2>
          <p className="text-gray-400">Personalized intelligence based on your transaction history.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="bg-white/5 h-64 rounded-3xl animate-pulse border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Forecast Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-8 rounded-3xl text-white shadow-2xl shadow-emerald-500/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <h3 className="text-xl font-bold mb-2 opacity-80">Next Month Forecast</h3>
                <p className="text-5xl font-black tracking-tighter">
                  {business.currency === "INR" ? "₹" : "$"}
                  {insights?.forecast.predictedRevenue.toLocaleString()}
                </p>
              </div>
              <div className="text-center md:text-right">
                <h3 className="text-xl font-bold mb-2 opacity-80">Growth Probability</h3>
                <p className="text-5xl font-black tracking-tighter">{insights?.forecast.growthProbability}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                Key Observations
              </h3>
              <ul className="space-y-4">
                {insights?.insights.map((insight, i) => (
                  <li key={i} className="flex gap-3 text-gray-300">
                    <span className="text-emerald-500 shrink-0">→</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Recommendations
              </h3>
              <ul className="space-y-4">
                {insights?.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-gray-300">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-500">{i + 1}</span>
                    </div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

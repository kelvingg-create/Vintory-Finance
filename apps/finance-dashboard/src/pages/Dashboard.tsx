import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import KpiCard from '../components/KpiCard';
import ChartSection from '../components/ChartSection';
import TransactionTable from '../components/TransactionTable';
import { useSummary, useComparison } from '../hooks/useReports';
import { useTransactions } from '../hooks/useTransactions';

// Format mata uang dengan fitur Privasi
const formatCurrency = (amount: number, isPrivacy: boolean) => {
  if (isPrivacy) return 'Rp ••••••••';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Ambil rentang tanggal bulan berjalan
const getCurrentMonthRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { startDate, endDate };
};

// --- KOMPONEN JAM PASAR ---
const MarketClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isMarketOpen = () => {
    const day = time.getDay();
    const hour = time.getHours();
    return day >= 1 && day <= 5 && hour >= 9 && hour < 16;
  };

  const isOpen = isMarketOpen();

  return (
    <div className="flex flex-col items-end">
      <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tight">
        {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        <span className="text-sm font-bold text-gray-400 ml-1">WIB</span>
      </div>
      <div className="flex items-center gap-3 mt-1">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
          isOpen 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }`}>
          {isOpen ? 'MARKET OPEN' : 'CLOSED'}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [showFailsafe, setShowFailsafe] = useState(false);
  
  const { startDate, endDate } = getCurrentMonthRange();
  
  // Hooks Data
  const { data: comparison, isLoading: comparisonLoading } = useComparison(startDate, endDate);
  const { data: transactionsData, isLoading: transLoading } = useTransactions({ startDate, endDate, limit: 1000 });

  const transactions = transactionsData?.data || [];

  // --- PERBAIKAN: Hitung Total Secara Manual (Lebih Akurat) ---
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      const amt = parseFloat(t.amount.toString());
      if (t.type === 'income') income += amt;
      else expense += amt;
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense
    };
  }, [transactions]);

  // Statistik Win Rate
  const winningTrades = transactions.filter(t => t.type === 'income').length;
  const losingTrades = transactions.filter(t => t.type === 'expense').length;
  const totalTrades = winningTrades + losingTrades;
  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : "0.0";
  const profitFactor = stats.totalExpense > 0 ? (stats.totalIncome / stats.totalExpense).toFixed(2) : "∞";

  // Failsafe timer
  useEffect(() => {
    const timer = setTimeout(() => setShowFailsafe(true), 5000); 
    return () => clearTimeout(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const handleManualInput = () => {
    navigate('/transaction');
  };

  const isGlobalLoading = (comparisonLoading || transLoading) && !showFailsafe;

  return (
    <DashboardLayout>
      {isGlobalLoading ? (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-[0.3em]">Syncing Terminal...</p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-700 flex flex-col h-full overflow-hidden">
          {/* HEADER */}
          <div className="pt-8 px-8 pb-4 shrink-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-white/5 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                  <p className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Live Terminal</p>
                </div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                  {getGreeting()}, Kelvin.
                </h1>
                <p className="text-gray-500 dark:text-[#9eb7a8] font-medium mt-1">
                  Fokus pada proses, profit akan mengikuti.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <MarketClock />
                <button 
                  onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                  className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-white hover:scale-105 active:scale-95 transition-all shadow-sm group"
                >
                  <span className="material-symbols-outlined text-2xl group-hover:text-cyan-400">
                    {isPrivacyMode ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="max-w-7xl mx-auto flex flex-col gap-8 pt-4">
              
              {/* KPI Cards (Data from Manual Calc) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard 
                  title="Total Realized Profit" 
                  amount={formatCurrency(stats.totalIncome, isPrivacyMode)} 
                  trend="vs bulan lalu" 
                  trendType={(comparison?.changes?.incomeChange ?? 0) >= 0 ? 'up' : 'down'} 
                  trendValue={`${Math.abs(comparison?.changes?.incomeChange ?? 0).toFixed(1)}%`} 
                  icon="trending_up" 
                  type="income" 
                />
                <KpiCard 
                  title="Total Realized Loss" 
                  amount={formatCurrency(stats.totalExpense, isPrivacyMode)} 
                  trend="vs bulan lalu" 
                  trendType={(comparison?.changes?.expenseChange ?? 0) <= 0 ? 'down' : 'up'} 
                  trendValue={`${Math.abs(comparison?.changes?.expenseChange ?? 0).toFixed(1)}%`} 
                  icon="trending_down" 
                  type="expense" 
                />
                <KpiCard 
                  title="Net Portfolio PnL" 
                  amount={formatCurrency(stats.netBalance, isPrivacyMode)} 
                  trend={(stats.netBalance) >= 0 ? 'Surplus' : 'Defisit'} 
                  trendType={(comparison?.changes?.balanceChange ?? 0) >= 0 ? 'up' : 'down'} 
                  trendValue={`${Math.abs(comparison?.changes?.balanceChange ?? 0).toFixed(1)}%`} 
                  icon="account_balance_wallet" 
                  type="balance" 
                />
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                   <ChartSection isPrivacyMode={isPrivacyMode} />
                </div>
                
                {/* Win Rate Widget */}
                <div className="bg-white dark:bg-[#0F172A] rounded-[3.5rem] p-10 border border-gray-200 dark:border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-cyan-500/10 transition-all duration-700" />
                  
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tighter">Win Rate</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Performance Index</p>
                  </div>

                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative w-56 h-56 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="112" cy="112" r="95" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-gray-200 dark:text-[#1E293B]" />
                        <circle 
                          cx="112" cy="112" r="95" 
                          stroke="currentColor" 
                          strokeWidth="20" 
                          fill="transparent" 
                          strokeDasharray={597} 
                          strokeDashoffset={597 - (597 * Number(winRate)) / 100} 
                          className={`${Number(winRate) >= 50 ? 'text-cyan-400' : 'text-rose-500'} transition-all duration-1000`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">
                          {winRate}%
                        </span>
                        <span className={`text-[10px] font-black mt-2 tracking-widest ${Number(winRate) >= 50 ? 'text-cyan-400' : 'text-rose-500'}`}>
                          {Number(winRate) >= 50 ? 'PROFITABLE' : 'NEED ADJUSTMENT'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-6 rounded-[2.5rem] bg-gray-50 dark:bg-[#1E293B] border border-gray-100 dark:border-white/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">P. Factor</p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{profitFactor}</p>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-gray-50 dark:bg-[#1E293B] border border-gray-100 dark:border-white/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Total Trades</p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{totalTrades}</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleManualInput}
                    className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 text-sm tracking-widest shadow-xl shadow-blue-500/20 uppercase"
                  >
                    <span className="material-symbols-outlined font-black">add_circle</span>
                    TAMBAHKAN TRANSAKSI
                  </button>
                </div>
              </div>

              <div>
                <TransactionTable />
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
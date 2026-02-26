import clsx from 'clsx';

interface KpiCardProps {
  title: string;
  amount: string;
  trend: string;
  trendType: 'up' | 'down';
  trendValue: string;
  icon: string;
  type: 'income' | 'expense' | 'balance';
}

export default function KpiCard({ title, amount, trend, trendType, trendValue, icon, type }: KpiCardProps) {
  const isBalance = type === 'balance';
  const isIncome = type === 'income';
  const isExpense = type === 'expense';
  
  // --- KONFIGURASI WARNA (CYBER CITY THEME) ---
  // Diupdate agar background konsisten dengan Sidebar (#0F172A)
  const getThemeClasses = () => {
    if (isIncome) return {
      card: "bg-white dark:bg-[#0F172A] border-cyan-100 dark:border-white/5",
      iconBg: "bg-cyan-100 dark:bg-cyan-500/10",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      trendBg: "bg-cyan-50 dark:bg-cyan-500/10",
      trendText: "text-cyan-600 dark:text-cyan-400",
      decorIcon: "text-cyan-500"
    };
    if (isExpense) return {
      card: "bg-white dark:bg-[#0F172A] border-rose-100 dark:border-white/5",
      iconBg: "bg-rose-100 dark:bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-500",
      trendBg: "bg-rose-50 dark:bg-rose-500/10",
      trendText: "text-rose-600 dark:text-rose-500",
      decorIcon: "text-rose-500"
    };
    // Balance (Net PnL) - Lebih Menonjol
    return {
      card: "bg-[#0F172A] border-white/10 shadow-2xl shadow-indigo-500/30 ring-1 ring-indigo-500/20",
      iconBg: "bg-white/10 backdrop-blur-md",
      iconColor: "text-indigo-400",
      trendBg: "bg-indigo-500/20",
      trendText: "text-indigo-300",
      decorIcon: "text-indigo-500"
    };
  };

  const theme = getThemeClasses();

  return (
    <div className={clsx(
      "p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group flex flex-col gap-2 z-10 transition-all duration-300 hover:scale-[1.02]",
      theme.card
    )}>
      
      {/* Background Decorations */}
      {!isBalance && (
        <div className="absolute -right-6 -top-6 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 rotate-12">
           <span className={`material-symbols-outlined text-9xl ${theme.decorIcon}`}>
             {icon}
           </span>
        </div>
      )}
      
      {isBalance && (
        <>
           {/* Glow Effect untuk Balance Card */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>
        </>
      )}

      <div className="flex flex-col gap-1 relative z-10">
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`${theme.iconBg} p-2.5 rounded-2xl transition-transform group-hover:rotate-6`}>
            <span className={`material-symbols-outlined text-2xl ${theme.iconColor}`}>{icon}</span>
          </div>
          <p className={`font-bold text-sm uppercase tracking-widest ${isBalance ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {title}
          </p>
        </div>

        {/* Amount */}
        <h3 className={`text-3xl md:text-4xl font-black tracking-tight ${isBalance ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          {amount}
        </h3>

        {/* Trend Indicator */}
        <div className="flex items-center gap-3 mt-2">
          <span className={`${theme.trendBg} ${theme.trendText} text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1 uppercase tracking-wider`}>
            <span className="material-symbols-outlined text-sm font-bold">
              {trendType === 'up' ? 'trending_up' : 'trending_down'}
            </span> 
            {trendValue}
          </span>
          <span className={`text-[10px] font-medium uppercase tracking-wide ${isBalance ? 'text-gray-500' : 'text-gray-400 dark:text-gray-600'}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}
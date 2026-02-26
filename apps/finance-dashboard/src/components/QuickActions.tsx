import { useSummary } from '../hooks/useReports';

// Get current month date range
const getCurrentMonthRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { startDate, endDate };
};

// Format currency ke Rupiah
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0, // Agar tidak ada ,00 di belakang
  }).format(amount);
};

// Default monthly budget limit (can be made configurable later)
const MONTHLY_BUDGET_LIMIT = 6500;

export default function QuickActions() {
  const { startDate, endDate } = getCurrentMonthRange();
  const { data: summary, isLoading } = useSummary({ startDate, endDate });

  // Calculate expense percentage of budget
  const totalExpense = summary?.totalExpense ?? 0;
  const percentageUsed = Math.min(Math.round((totalExpense / MONTHLY_BUDGET_LIMIT) * 100), 100);

  // Determine status message based on percentage
  const getStatusMessage = (percentage: number) => {
    if (percentage < 50) return "🎉 Excellent! You're well under budget.";
    if (percentage < 75) return "👍 You are doing good! Keep it up.";
    if (percentage < 90) return "⚠️ Watch your spending, getting close to limit.";
    return "🚨 Almost at limit! Consider cutting expenses.";
  };

  // Determine progress bar color based on percentage
  const getProgressBarClass = (percentage: number) => {
    if (percentage < 50) return "bg-gradient-to-r from-primary to-emerald-400";
    if (percentage < 75) return "bg-gradient-to-r from-primary to-emerald-400";
    if (percentage < 90) return "bg-gradient-to-r from-yellow-400 to-orange-400";
    return "bg-gradient-to-r from-orange-400 to-red-500";
  };

  return (
    <div className="lg:col-span-1 flex flex-col gap-4">
        {/* Quick Action Card */}
        <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-primary text-[140px]">add_circle</span>
            </div>
            <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Add New Transaction</h4>
                <p className="text-sm text-slate-600 dark:text-gray-400">Record a new income or expense quickly.</p>
            </div>
            <button className="bg-primary hover:bg-primary/90 text-slate-900 font-bold py-3 px-6 rounded-full w-fit flex items-center gap-2 transition-colors z-10 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-lg">add</span>
                Add Record
            </button>
        </div>

        {/* Limits Card */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-100 dark:border-[#2a3f33] flex-1 flex flex-col justify-center">
            <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Monthly Limit</h4>
            
            {isLoading ? (
              <>
                <div className="flex justify-between items-end mb-2">
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 animate-pulse"></div>
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mt-3 animate-pulse" />
              </>
            ) : (
              <>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{percentageUsed}%</span>
                    <span className="text-sm text-slate-500 dark:text-gray-400">
                      {formatCurrency(totalExpense)} / {formatCurrency(MONTHLY_BUDGET_LIMIT)}
                    </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`${getProgressBarClass(percentageUsed)} h-3 rounded-full transition-all duration-500`} 
                      style={{ width: `${percentageUsed}%` }}
                    ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-3">
                  {getStatusMessage(percentageUsed)}
                </p>
              </>
            )}
        </div>
    </div>
  );
}

import { Link } from 'react-router-dom'; // Import Link agar navigasi mulus
import { useRecentTransactions } from '../hooks/useTransactions';
import type { Transaction } from '../types/api.types';

// Helper: Warna Kategori (Cyber Theme)
const getColorClasses = (color: string | null) => {
  switch (color) {
    case 'blue': return { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' };
    case 'orange': return { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' };
    case 'purple': return { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' };
    case 'red': case 'rose': return { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' };
    case 'teal': case 'cyan': return { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' };
    case 'emerald': case 'green': return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' };
    case 'yellow': return { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' };
    case 'indigo': return { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' };
    default: return { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400' };
  }
};

// Format Tanggal (Indonesia)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Format Rupiah
const formatAmount = (amount: string, type: 'income' | 'expense') => {
  const num = parseFloat(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  return type === 'income' ? `+${formatted}` : `-${formatted}`;
};

// Capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export default function TransactionTable() {
  const { data: transactions, isLoading, error } = useRecentTransactions(5);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden p-8">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Memuat data trading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden p-8 text-center">
        <p className="text-rose-500 font-bold">Gagal memuat data.</p>
      </div>
    );
  }

  const isEmpty = !transactions || transactions.length === 0;

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
      
      {/* Header Tabel */}
      <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#0F172A]">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Transaksi Terakhir</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-bold">Recent Trades</p>
        </div>
        
        {/* PERBAIKAN: Ganti <a> menjadi <Link> agar tidak flash/reload */}
        <Link 
          to="/reports" 
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors uppercase tracking-wider"
        >
          Lihat Semua
        </Link>
      </div>
      
      {isEmpty ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-600">receipt_long</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada transaksi.</p>
          
          {/* PERBAIKAN: Ganti <a> menjadi <Link> */}
          <Link 
            to="/transaction" 
            className="text-cyan-500 text-sm font-bold hover:text-cyan-400 mt-2 inline-block uppercase tracking-wider"
          >
            + Input Trade Baru
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-[#1E293B] text-[10px] uppercase text-slate-500 dark:text-slate-400 font-black tracking-[0.1em]">
              <tr>
                <th className="px-8 py-5">Tanggal</th>
                <th className="px-8 py-5">Detail Saham</th>
                <th className="px-8 py-5">Kategori</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Nilai PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm text-slate-700 dark:text-gray-300">
              {transactions.map((tx: Transaction) => {
                const colors = getColorClasses(tx.category?.color || null);
                const icon = tx.category?.icon || (tx.type === 'income' ? 'trending_up' : 'trending_down');

                return (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-medium text-xs">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white flex items-center gap-4">
                      <div className={`${colors.bg} p-2 rounded-xl ${colors.text} ring-1 ring-inset ring-white/10`}>
                        <span className="material-symbols-outlined text-lg">{icon}</span>
                      </div>
                      <span className="tracking-tight">{tx.description || 'No description'}</span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                      {tx.category?.name || 'Trading'}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border
                        ${tx.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                        ${tx.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
                        ${tx.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : ''}
                      `}>
                        {capitalize(tx.status)}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-right font-black text-base tabular-nums
                      ${tx.type === 'income' ? 'text-cyan-500 dark:text-cyan-400' : ''}
                      ${tx.type === 'expense' && tx.status !== 'rejected' ? 'text-rose-500 dark:text-rose-400' : ''}
                      ${tx.status === 'rejected' ? 'text-slate-400 line-through' : ''}
                    `}>
                      {formatAmount(tx.amount, tx.type)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
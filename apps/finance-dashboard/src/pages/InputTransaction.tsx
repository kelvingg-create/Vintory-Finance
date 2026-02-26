import { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useCreateTransaction } from '../hooks/useTransactions';
import type { TransactionType } from '../types/api.types';

const InputTransaction = () => {
  // State untuk Trading Saham
  const [stockCode, setStockCode] = useState('');
  const [lot, setLot] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  
  // State Umum
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // State pesan sukses

  const createMutation = useCreateTransaction();

  // --- LOGIKA KALKULATOR SAHAM CANGGIH (AUTO HITUNG + ROI) ---
  const calculateTrading = () => {
    const l = parseFloat(lot) || 0;
    const b = parseFloat(buyPrice) || 0;
    const s = parseFloat(sellPrice) || 0;

    if (l === 0 || b === 0 || s === 0) return { gross: 0, fee: 0, net: 0, roi: 0 };

    // Rumus Saham: Harga * Lot * 100 lembar
    const buyVal = b * l * 100;
    const sellVal = s * l * 100;
    const grossPnL = sellVal - buyVal;
    
    // Fee Broker: Beli 0.15%, Jual 0.25%
    const buyFee = buyVal * 0.0015;
    const sellFee = sellVal * 0.0025;
    const fee = buyFee + sellFee;


    const netPnL = grossPnL - fee;
    
    // Hitung ROI (Return on Investment)
    const roi = (netPnL / buyVal) * 100;

    return { gross: grossPnL, fee, net: netPnL, roi };
  };

  const tradingCalc = calculateTrading();
  const isProfit = tradingCalc.net >= 0;
  // ---------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!stockCode || !lot || !buyPrice || !sellPrice) {
        setError('Mohon lengkapi data saham (Kode, Lot, Harga Beli & Jual)');
        return;
      }
      
      const finalAmount = Math.abs(tradingCalc.net);
      const finalType: TransactionType = isProfit ? 'income' : 'expense';
      
      const finalDesc = `${stockCode.toUpperCase()} (${lot} Lot) - Buy: ${buyPrice}, Sell: ${sellPrice}`;

      await createMutation.mutateAsync({
        type: finalType,
        amount: finalAmount.toFixed(2),
        transactionDate,
        categoryId: null, 
        description: finalDesc,
        status: 'approved',
      });
      
      // PERBAIKAN: Tidak pindah halaman, tapi reset form dan beri notifikasi
      setSuccess(`Transaksi ${stockCode.toUpperCase()} berhasil disimpan!`);
      
      // Reset input agar siap untuk data baru
      setStockCode('');
      setLot('');
      setBuyPrice('');
      setSellPrice('');
      
      // Hilangkan pesan sukses setelah 3 detik
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan transaksi');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 h-full overflow-y-auto relative flex flex-col items-center bg-[#F8FAFC] dark:bg-[#020617] transition-colors">
        <div className="w-full max-w-3xl px-6 py-8 md:py-12 flex flex-col gap-8 pb-32 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
              Input Trade
            </h2>
            <p className="text-gray-500 dark:text-[#9eb7a8] text-base font-medium">
              Kalkulasi cepat & catat performa trading Anda.
            </p>
          </div>

          {/* Notifikasi Error */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-2xl text-sm text-center font-bold animate-pulse">
              {error}
            </div>
          )}

          {/* Notifikasi Sukses */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-3 rounded-2xl text-sm text-center font-bold animate-bounce">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            
            {/* Input Tanggal */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 dark:text-slate-400 font-bold text-xs ml-2 uppercase tracking-wider">Tanggal Transaksi</label>
              <input 
                type="date" 
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-sm" 
              />
            </div>

            {/* Form Input Saham (Cyber Card) */}
            <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-cyan-900/5 flex flex-col gap-6 relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-700"></div>

              <div className="grid grid-cols-2 gap-5 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-gray-500 dark:text-slate-500 font-bold text-xs ml-2 uppercase tracking-widest">Kode Saham</label>
                  <input 
                    type="text" 
                    placeholder="BBCA" 
                    value={stockCode}
                    onChange={(e) => setStockCode(e.target.value.toUpperCase())}
                    className="w-full bg-gray-50 dark:bg-[#1E293B] text-gray-900 dark:text-white font-black uppercase text-xl border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-400 dark:placeholder-slate-600" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-500 dark:text-slate-500 font-bold text-xs ml-2 uppercase tracking-widest">Lot</label>
                  <input 
                    type="number" 
                    placeholder="100" 
                    value={lot}
                    onChange={(e) => setLot(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1E293B] text-gray-900 dark:text-white font-bold text-xl border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-400 dark:placeholder-slate-600" 
                  />
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-white/5 w-full" />

              <div className="grid grid-cols-2 gap-5 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-gray-500 dark:text-slate-500 font-bold text-xs ml-2 uppercase tracking-widest">Harga Beli</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#1E293B] text-gray-900 dark:text-white font-bold text-lg border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-400 dark:placeholder-slate-600" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-500 dark:text-slate-500 font-bold text-xs ml-2 uppercase tracking-widest">Harga Jual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#1E293B] text-gray-900 dark:text-white font-bold text-lg border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-400 dark:placeholder-slate-600" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- LIVE CALCULATOR CARD (RESULT) --- */}
            <div className={`rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden transition-all duration-500 border ${
              isProfit 
                ? 'bg-gradient-to-br from-[#0F172A] to-[#0B1121] border-cyan-500/20 shadow-cyan-900/20' 
                : 'bg-gradient-to-br from-[#0F172A] to-[#0B1121] border-rose-500/20 shadow-rose-900/20'
            }`}>
              
              {/* Result Glow */}
              <div className={`absolute top-0 right-0 w-48 h-48 rounded-full -mr-12 -mt-12 blur-[80px] opacity-40 pointer-events-none ${
                isProfit ? 'bg-cyan-500' : 'bg-rose-500'
              }`}></div>

              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimasi Bersih</span>
                  
                  {/* ROI Badge */}
                  <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                    isProfit 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    ROI: {tradingCalc.roi.toFixed(2)}%
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-end gap-2">
                   <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">
                        Gross: <span className={isProfit ? 'text-green-500' : 'text-red-500'}>{new Intl.NumberFormat('id-ID').format(tradingCalc.gross)}</span>
                        {' • '}
                        Fee: <span className="text-red-400">{new Intl.NumberFormat('id-ID').format(tradingCalc.fee)}</span>
                      </p>
                      <h3 className={`text-4xl md:text-5xl font-black tracking-tighter ${
                        isProfit ? 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]'
                      }`}>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(tradingCalc.net)}
                      </h3>
                   </div>
                   
                   {/* Visual Indicator */}
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                     isProfit 
                       ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                       : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                   }`}>
                      <span className="material-symbols-outlined text-3xl">
                        {isProfit ? 'trending_up' : 'trending_down'}
                      </span>
                   </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit"
                disabled={createMutation.isPending}
                className={`w-full font-black text-lg py-5 rounded-[2rem] shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-white uppercase tracking-[0.15em] ${
                  isProfit 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/20' 
                    : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-500/20'
                }`}
              >
                {createMutation.isPending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    MENYIMPAN...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl">save</span>
                    SIMPAN {isProfit ? 'PROFIT' : 'LOSS'}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InputTransaction;
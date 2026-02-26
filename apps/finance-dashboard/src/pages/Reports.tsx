import { useState, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useTransactions } from '../hooks/useTransactions';
import { useExportCsv } from '../hooks/useReports';
import type { Transaction, TransactionFilters } from '../types/api.types';

// --- TAMBAHAN: Komponen Logo Vintory Finance ---
const VintoryLogo = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="40" fill="#0F172A"/>
    <defs>
      <linearGradient id="vf_gradient" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22C55E"/> <stop offset="1" stopColor="#3B82F6"/> 
      </linearGradient>
    </defs>
    <path d="M50 70L85 140L105 100" stroke="url(#vf_gradient)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M105 100H150" stroke="url(#vf_gradient)" strokeWidth="18" strokeLinecap="round"/>
    <path d="M95 70H140" stroke="url(#vf_gradient)" strokeWidth="18" strokeLinecap="round"/>
    <path d="M140 55L155 70L140 85" fill="url(#vf_gradient)"/>
  </svg>
);

// Format currency dengan Mode Privasi
const formatCurrency = (amount: number, isPrivacy: boolean) => {
  if (isPrivacy) return 'Rp ••••••••';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- TAMBAHAN: Format currency mutlak untuk Modal (Abaikan privasi) ---
const formatCurrencyAbsolute = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format tanggal
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Fungsi mengekstrak % profit dari deskripsi transaksi
const calculatePercentage = (description: string | undefined): string => {
  if (!description) return '0%';
  try {
    const lotPart = description.match(/\(([\d.]+)\s*Lot\)/i);
    const buyPart = description.match(/Buy:\s*([\d.]+)/i);
    const sellPart = description.match(/Sell:\s*([\d.]+)/i);
    
    if (lotPart && buyPart && sellPart) {
      const l = parseFloat(lotPart[1]);
      const b = parseFloat(buyPart[1]);
      const s = parseFloat(sellPart[1]);

      if (l > 0 && b > 0 && s > 0) {
        // Rumus sesuai dengan Kalkulator di InputTransaction
        const buyVal = b * l * 100;
        const sellVal = s * l * 100;
        const grossPnL = sellVal - buyVal;
        
        // Fee Broker: Beli 0.15%, Jual 0.25%
        const buyFee = buyVal * 0.0015;
        const sellFee = sellVal * 0.0025;
        const fee = buyFee + sellFee;

        const netPnL = grossPnL - fee;
        
        // Hitung ROI bersih
        const roi = (netPnL / buyVal) * 100;

        return `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%`;
      }
    } else if (buyPart && sellPart) {
      // Fallback: Jika format lama (tidak ada Lot), gunakan perhitungan Gross biasa
      const buy = parseFloat(buyPart[1]);
      const sell = parseFloat(sellPart[1]);
      if (buy > 0) {
        const pct = ((sell - buy) / buy) * 100;
        return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
      }
    }
  } catch (e) {
    return '-%';
  }
  return '-%';
};

// --- TAMBAHAN: Fungsi mengekstrak data untuk Modal Detail & Share ---
const extractTradeDetails = (tx: any) => {
  if (!tx) return null;
  const desc = tx.description || '';
  
  // Pisahkan Kode Saham dari Lot (Hapus tulisan Lot dari Judul)
  let stockCode = desc.split(' - ')[0] || 'UNKNOWN';
  stockCode = stockCode.replace(/\s*\([\d.]+\s*Lot\)/i, '').trim();
  
  const lotMatch = desc.match(/\(([\d.]+)\s*Lot\)/i);
  const buyMatch = desc.match(/Buy:\s*([\d.]+)/i);
  const sellMatch = desc.match(/Sell:\s*([\d.]+)/i);

  const lot = lotMatch ? parseFloat(lotMatch[1]) : 0;
  const buy = buyMatch ? parseFloat(buyMatch[1]) : 0;
  const sell = sellMatch ? parseFloat(sellMatch[1]) : 0;
  
  const pct = calculatePercentage(desc);
  const isProfit = tx.type === 'income';
  const pnl = formatCurrencyAbsolute(parseFloat(tx.amount || 0));

  // Perhitungan Modal Beli (Kotor) = Harga Beli * Lot * 100
  const modalBeli = buy > 0 && lot > 0 ? formatCurrencyAbsolute(buy * lot * 100) : '-';

  return { 
    stock: stockCode, 
    lot: lot > 0 ? lot.toString() : '-',
    buy: buy > 0 ? formatCurrencyAbsolute(buy).replace('Rp', '').trim() : '-', 
    sell: sell > 0 ? formatCurrencyAbsolute(sell).replace('Rp', '').trim() : '-', 
    modalBeli,
    pct, 
    isProfit, 
    pnl, 
    type: tx.type 
  };
};

const Reports = () => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 200, 
  });

  // --- TAMBAHAN: State untuk pop-up modal ---
  const [detailTx, setDetailTx] = useState<any>(null);
  const [shareTx, setShareTx] = useState<any>(null);

  const { data: transactionsData, isLoading: transactionsLoading, refetch } = useTransactions(filters);
  const exportMutation = useExportCsv();

  // Filter Lokal
  const filteredTransactions = useMemo(() => {
    return transactionsData?.data.filter((tx) => 
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [transactionsData, searchTerm]);

  // Statistik Lokal
  const filteredStats = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const amount = parseFloat(tx.amount.toString()); // pastikan string sebelum di parse
      if (tx.type === 'income') {
        acc.profit += amount;
      } else {
        acc.loss += amount;
      }
      return acc;
    }, { profit: 0, loss: 0 });
  }, [filteredTransactions]);

  const netPnL = filteredStats.profit - filteredStats.loss;

  const handleApplyFilters = () => {
    setFilters(prev => ({
      ...prev,
      startDate: tempStartDate || undefined,
      endDate: tempEndDate || undefined,
      page: 1
    }));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTempStartDate('');
    setTempEndDate('');
    setFilters({ page: 1, limit: 200 });
  };

  const handleExport = () => {
    exportMutation.mutate({
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan trade ini?")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/transactions/${id}`, { 
        method: 'DELETE',
        credentials: 'include', 
        headers: { 
           'Content-Type': 'application/json',
           ...(token ? { 'Authorization': `Bearer ${token}` } : {}) 
        }
      });
      
      if (response.ok) {
        await refetch();
      } else {
        alert("Gagal menghapus data. Coba login ulang.");
      }
    } catch (err) {
      alert("Gagal menghapus: Masalah koneksi.");
    }
  };

  // --- TAMBAHAN: Ekstrak data untuk modal ---
  const detailData = extractTradeDetails(detailTx);
  const shareData = extractTradeDetails(shareTx);

  // --- TAMBAHAN: Fungsi Share Text ke Clipboard ---
  const handleCopyShare = () => {
    if (!shareData) return;
    const textToShare = `🚀 VINTORY FINANCE - Trade Alert!\n\nEmiten: ${shareData.stock}\nAvg Buy: ${shareData.buy}\nAvg Sell: ${shareData.sell}\nReturn (ROI): ${shareData.pct}\n\nFokus pada proses, profit akan mengikuti!`;
    
    const textArea = document.createElement("textarea");
    textArea.value = textToShare;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Berhasil disalin! Silakan paste di WhatsApp/Telegram Anda.');
    } catch (err) {
      alert('Gagal menyalin teks.');
    }
    textArea.remove();
  };

  // --- TAMBAHAN: Fungsi Download Gambar (Injeksi html2canvas otomatis) ---
  const handleDownloadImage = (elementId: string, filename: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => {
      // @ts-ignore
      window.html2canvas(el, { 
        backgroundColor: '#0B1121', // Warna background modal agar rapi
        scale: 3, // Kualitas gambar tinggi
        useCORS: true 
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    };
    document.body.appendChild(script);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC] dark:bg-[#020617] transition-colors relative">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Laporan Jurnal</h1>
              <p className="text-gray-500 dark:text-[#9eb7a8]">Riwayat transaksi dan performa emiten Anda.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F172A] hover:scale-110 transition-all shadow-sm text-gray-700 dark:text-white hover:shadow-cyan-500/20 group"
                title={isPrivacyMode ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
              >
                <span className="material-symbols-outlined text-xl group-hover:text-cyan-400 transition-colors">
                  {isPrivacyMode ? 'visibility_off' : 'visibility'}
                </span>
              </button>

              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-[#0F172A] dark:bg-cyan-600 text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-cyan-500/20"
              >
                <span className="material-symbols-outlined text-xl">download</span>
                EXPORT CSV
              </button>
            </div>
          </div>

          {/* ADVANCED FILTER BAR */}
          <div className="bg-white dark:bg-[#0F172A] rounded-[2.5rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4 flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-2">Cari Emiten</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors">search</span>
                  <input 
                    type="text" 
                    placeholder="Contoh: BBCA, GOTO..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-[#1E293B] border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all dark:text-white dark:placeholder-slate-600"
                  />
                </div>
              </div>
              <div className="md:col-span-3 flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-2">Mulai</label>
                <input 
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-[#1E293B] border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all dark:text-white dark:[color-scheme:dark]"
                />
              </div>
              <div className="md:col-span-3 flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-2">Sampai</label>
                <input 
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-[#1E293B] border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all dark:text-white dark:[color-scheme:dark]"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button onClick={handleApplyFilters} className="flex-1 h-12 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-500/20">Apply</button>
                <button onClick={handleResetFilters} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1E293B] text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"><span className="material-symbols-outlined">restart_alt</span></button>
              </div>
            </div>
          </div>

          {/* LIVE SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col group hover:border-cyan-500/30 transition-all">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-cyan-400 transition-colors">Total Profit (Filtered)</span>
              <p className="text-3xl font-black text-green-500 dark:text-cyan-400">
                {formatCurrency(filteredStats.profit, isPrivacyMode)}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col group hover:border-rose-500/30 transition-all">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-rose-400 transition-colors">Total Loss (Filtered)</span>
              <p className="text-3xl font-black text-red-500 dark:text-rose-400">
                {formatCurrency(filteredStats.loss, isPrivacyMode)}
              </p>
            </div>
            <div className="bg-[#0F172A] p-8 rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Net Result</span>
              <p className={`text-3xl font-black relative z-10 ${netPnL >= 0 ? 'text-blue-400 dark:text-cyan-400' : 'text-red-400 dark:text-rose-400'}`}>
                {formatCurrency(netPnL, isPrivacyMode)}
              </p>
            </div>
          </div>

          {/* TABLE AREA */}
          <div className="bg-white dark:bg-[#0F172A] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1E293B] text-gray-400 dark:text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                    <th className="px-8 py-6">Tanggal</th>
                    <th className="px-8 py-6">Emiten / Detail</th>
                    <th className="px-8 py-6 text-center">Gain (%)</th>
                    <th className="px-8 py-6 text-center">Status</th>
                    <th className="px-8 py-6 text-right">Net PnL</th>
                    <th className="px-8 py-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {transactionsLoading ? (
                    <tr><td colSpan={6} className="p-20 text-center text-gray-400">Memuat riwayat...</td></tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr><td colSpan={6} className="p-20 text-center text-gray-400 dark:text-slate-500">Data tidak ditemukan.</td></tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const pct = calculatePercentage(tx.description);
                      const isPositive = !pct.startsWith('-');

                      return (
                        <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-colors group">
                          <td className="px-8 py-5 text-sm font-bold text-gray-900 dark:text-white">{formatDate(tx.transactionDate)}</td>
                          <td className="px-8 py-5">
                            <span className="block font-black text-gray-900 dark:text-white uppercase tracking-tighter">{tx.description?.split(' - ')[0] || '-'}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{tx.description?.split(' - ')[1] || 'Realized Trade'}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`text-sm font-black tabular-nums ${isPositive ? 'text-green-500 dark:text-cyan-400' : 'text-red-500 dark:text-rose-400'}`}>{pct}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              tx.type === 'income' 
                                ? 'bg-green-100 text-green-700 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20' 
                                : 'bg-red-100 text-red-700 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                            }`}>
                              {tx.type === 'income' ? 'PROFIT' : 'LOSS'}
                            </span>
                          </td>
                          <td className={`px-8 py-5 text-right font-black tabular-nums ${tx.type === 'income' ? 'text-green-600 dark:text-cyan-400' : 'text-red-600 dark:text-rose-400'}`}>
                            {tx.type === 'income' ? '+' : '-'} {formatCurrency(parseFloat(tx.amount.toString()), isPrivacyMode)}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setDetailTx(tx)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-all" title="Detail">
                                <span className="material-symbols-outlined text-lg">visibility</span>
                              </button>
                              <button onClick={() => setShareTx(tx)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all" title="Share">
                                <span className="material-symbols-outlined text-lg">share</span>
                              </button>
                              <button onClick={() => handleDelete(tx.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all" title="Delete">
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* --- MODAL DETAIL (PORTRAIT CYBER CITY THEME) --- */}
        {/* ========================================================= */}
        {detailTx && detailData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="flex flex-col gap-4">
              
              {/* AREA YANG AKAN DIDOWNLOAD */}
              <div id="detail-modal-card" className={`relative w-80 md:w-96 rounded-[2.5rem] p-8 border ${detailData.isProfit ? 'border-cyan-500/50 shadow-[0_0_50px_rgba(34,211,238,0.2)]' : 'border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.2)]'} bg-[#0B1121] overflow-hidden flex flex-col`}>
                
                <div className={`absolute -top-24 -right-24 w-56 h-56 blur-[80px] rounded-full ${detailData.isProfit ? 'bg-cyan-500' : 'bg-rose-500'} opacity-30`}></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNCkiLz48L3N2Zz4=')] opacity-50"></div>

                <div className="text-center mb-8 relative z-10 pt-2 flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${detailData.isProfit ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                     <span className="material-symbols-outlined text-3xl">{detailData.isProfit ? 'trending_up' : 'trending_down'}</span>
                  </div>
                  <h2 className="text-5xl font-black text-white tracking-tighter mb-2">{detailData.stock}</h2>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${detailData.isProfit ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]'}`}>
                    {detailData.isProfit ? 'PROFIT REALIZED' : 'LOSS REALIZED'}
                  </span>
                </div>

                <div className="flex flex-col gap-4 relative z-10 bg-[#060A14]/50 p-5 rounded-[1.5rem] border border-white/5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lot Size</span>
                    <span className="text-sm font-black text-white">{detailData.lot}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buy Price</span>
                    <span className="text-sm font-black text-white">{detailData.buy}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sell Price</span>
                    <span className="text-sm font-black text-white">{detailData.sell}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modal Beli</span>
                    <span className="text-sm font-black text-slate-300">{detailData.modalBeli}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount {detailData.isProfit ? 'Gain' : 'Loss'}</span>
                    <span className={`text-sm font-black ${detailData.isProfit ? 'text-cyan-400' : 'text-rose-400'}`}>{detailData.isProfit ? '+' : '-'}{detailData.pnl}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Percentage</span>
                    <span className={`text-2xl font-black tracking-tighter ${detailData.isProfit ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}>
                      {detailData.pct}
                    </span>
                  </div>
                </div>

                <div className="mt-8 text-center relative z-10 flex flex-col items-center justify-center gap-1">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">Powered by</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5"><VintoryLogo /></div>
                    <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest">VINTORY FINANCE</p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 w-full" data-html2canvas-ignore="true">
                 <button onClick={() => setDetailTx(null)} className="flex-1 py-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2">
                   Tutup
                 </button>
                
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* --- MODAL SHARE (LANDSCAPE CYBER CITY THEME) --- */}
        {/* ========================================================= */}
        {shareTx && shareData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-4 max-w-2xl w-full">
              
              {/* AREA YANG AKAN DIDOWNLOAD */}
              <div id="share-modal-card" className="relative w-full bg-[#0B1121] rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.15)] flex flex-col md:flex-row">
                
                {/* Bagian Kiri (Data Ringkas) */}
                <div className="flex-1 p-8 md:p-10 relative overflow-hidden">
                  <div className={`absolute -bottom-32 -left-32 w-80 h-80 blur-[100px] rounded-full ${shareData.isProfit ? 'bg-cyan-500' : 'bg-rose-500'} opacity-30`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                       <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">{shareData.stock}</h2>
                       <div className={`w-3 h-3 rounded-full animate-pulse ${shareData.isProfit ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-rose-400 shadow-[0_0_10px_#fb7185]'}`}></div>
                    </div>

                    <span className={`inline-block px-3 py-1 rounded border text-[9px] font-black tracking-widest uppercase mb-8 ${shareData.isProfit ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                      TRADE VERIFIED
                    </span>
                    
                    {/* --- PERBAIKAN: Layout Avg Buy & Sell Simetris --- */}
                    <div className="grid grid-cols-2 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm relative max-w-[350px]">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-10 bg-white/10"></div>
                      <div className="text-center px-4">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Buy</p>
                        <p className="text-xl font-black text-white tracking-tight">{shareData.buy}</p>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Sell</p>
                        <p className="text-xl font-black text-white tracking-tight">{shareData.sell}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Return on Investment</p>
                      <p className={`text-6xl md:text-7xl font-black tracking-tighter ${shareData.isProfit ? 'text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]'}`}>
                        {shareData.pct}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bagian Kanan (Branding Vintory Finance Logo SVG Baru) */}
                <div className="bg-[#060A14] md:w-56 p-8 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
                  
                  <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                      <div className="w-20 h-20 mx-auto rounded-[1rem] shadow-[0_0_30px_rgba(34,211,238,0.15)] mb-4 overflow-hidden border border-white/10 bg-[#0F172A] p-1">
                         <VintoryLogo />
                      </div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1 mt-2">Powered By</p>
                      <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-widest">
                        VINTORY FINANCE 
                      </p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 w-full" data-html2canvas-ignore="true">
               <button onClick={() => setShareTx(null)} className="py-4 px-8 rounded-[1.5rem] bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center">
                 Tutup
               </button>
              
            </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Reports;
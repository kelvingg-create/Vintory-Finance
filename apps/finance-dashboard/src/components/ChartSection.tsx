import { useMemo } from 'react';
import { useCashFlow } from '../hooks/useReports';

interface ChartSectionProps {
  isPrivacyMode?: boolean;
  transactions?: any[]; // Menerima data transaksi mentah dari Dashboard
}

// Get date range for last 6 months
const getLast6MonthsRange = () => {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];
  return { startDate, endDate };
};

const formatMonthLabel = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString('id-ID', { month: 'short', year: '2-digit' }); 
};

const formatCompactCurrency = (amount: number, isPrivacy: boolean) => {
  if (isPrivacy) return '***';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount);
};

const formatCurrency = (amount: number, isPrivacy: boolean) => {
  if (isPrivacy) return 'Rp ********';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ChartSection({ isPrivacyMode = false, transactions = [] }: ChartSectionProps) {
  const { startDate, endDate } = getLast6MonthsRange();
  
  // Jika tidak ada data transactions yang dikirim (misal dari halaman lain), gunakan hook lama
  // Tapi jika ada (dari Dashboard), kita abaikan hook ini.
  const { data: serverData, isLoading: serverLoading } = useCashFlow({ startDate, endDate });

  // --- LOGIKA MANUAL: HITUNG GRAFIK DARI TRANSAKSI ---
  const chartData = useMemo(() => {
    // Jika data transaksi dikirim, kita hitung sendiri
    if (transactions && transactions.length > 0) {
      // 1. Buat kerangka 6 bulan terakhir
      const months: Record<string, { income: number; expense: number; month: string }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // Format YYYY-MM
        months[key] = { month: key, income: 0, expense: 0 };
      }

      // 2. Isi data dari transaksi
      transactions.forEach(t => {
        const date = new Date(t.transactionDate);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (months[key]) {
           const val = parseFloat(t.amount);
           if (t.type === 'income') months[key].income += val;
           else months[key].expense += val;
        }
      });

      return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).map(d => ({
        ...d,
        net: d.income - d.expense
      }));
    }
    
    // Fallback ke data server jika transaksi kosong (atau belum dimuat)
    return serverData?.map(d => ({
      ...d,
      net: Number(d.income) - Number(d.expense)
    })) || [];
  }, [transactions, serverData]);

  // Loading state: Hanya true jika kita bergantung pada server dan server sedang loading
  const isLoading = (transactions.length === 0) && serverLoading;

  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 60, bottom: 30, left: 10 }; 
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Scale Logic
  const maxVal = Math.max(0, ...chartData.map(d => d.net));
  const minVal = Math.min(0, ...chartData.map(d => d.net));
  
  const absMax = Math.max(Math.abs(maxVal), Math.abs(minVal)) || 1000;
  const effectiveMax = absMax * 1.2;
  const effectiveMin = -absMax * 1.2;
  const range = effectiveMax - effectiveMin;

  const getX = (index: number) => {
    return padding.left + (graphWidth / (chartData.length - 1 || 1)) * index;
  };

  const getY = (value: number) => {
    const ratio = (value - effectiveMin) / range;
    return padding.top + graphHeight - (ratio * graphHeight);
  };

  const zeroY = getY(0);

  const generatePath = (data: typeof chartData) => {
    if (data.length === 0) return '';
    let d = `M ${getX(0)} ${getY(data[0].net)}`;
    for (let i = 1; i < data.length; i++) {
      const x = getX(i);
      const y = getY(data[i].net);
      const prevX = getX(i - 1);
      const prevY = getY(data[i - 1].net);
      const cpx1 = prevX + (x - prevX) / 2;
      const cpx2 = x - (x - prevX) / 2;
      d += ` C ${cpx1} ${prevY}, ${cpx2} ${y}, ${x} ${y}`;
    }
    return d;
  };

  const generateArea = (data: typeof chartData) => {
    if (data.length === 0) return '';
    const linePath = generatePath(data);
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    return `${linePath} L ${lastX} ${zeroY} L ${firstX} ${zeroY} Z`;
  };

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 h-[400px] animate-pulse" />
    );
  }

  const yTicks = [effectiveMax, effectiveMax/2, 0, effectiveMin/2, effectiveMin];

  const colors = {
    profit: '#22d3ee',
    loss: '#fb7185',
    line: '#22d3ee',
    grid: '#334155'
  };

  return (
    <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col relative overflow-hidden group">
      
      <div className="flex justify-between items-end mb-6 relative z-10">
        <div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Net PnL Trend</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-[#9eb7a8]">Grafik Performa Bersih Bulanan</p>
        </div>
      </div>
      
      <div className="w-full h-[300px] relative z-10 mb-8">
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          
          {yTicks.map((val, i) => {
            const y = getY(val);
            return (
              <g key={i}>
                <line 
                  x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} 
                  stroke={val === 0 ? "#94a3b8" : colors.grid} strokeWidth={val === 0 ? 2 : 1} strokeDasharray={val === 0 ? "" : "4 4"} opacity={val === 0 ? 0.5 : 0.2}
                />
                <text x={chartWidth} y={y + 4} textAnchor="end" className={`text-[10px] font-bold ${val === 0 ? 'fill-gray-900 dark:fill-white' : 'fill-gray-400'}`}>
                  {formatCompactCurrency(val, isPrivacyMode)}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="pnlGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={colors.profit} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={colors.profit} stopOpacity="0"/>
            </linearGradient>
          </defs>

          <path d={generateArea(chartData)} fill="url(#pnlGradient)" />
          <path d={generatePath(chartData)} fill="none" stroke={colors.line} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />

          {chartData.map((d, i) => {
            const x = getX(i);
            const y = getY(d.net);
            const isProfit = d.net >= 0;

            return (
              <g key={i} className="group">
                <line x1={x} y1={padding.top} x2={x} y2={chartHeight - padding.bottom} stroke={colors.line} strokeWidth="1" strokeDasharray="2 2" className="opacity-0 group-hover:opacity-30 transition-opacity" />
                <circle cx={x} cy={y} r="6" fill={isProfit ? colors.profit : colors.loss} stroke="white" strokeWidth="2" className="transition-all duration-300 group-hover:r-8 dark:stroke-[#0F172A]" />
                <text x={x} y={chartHeight} textAnchor="middle" className="text-[10px] font-bold fill-gray-400 dark:fill-gray-500 uppercase tracking-widest mt-2">{formatMonthLabel(d.month)}</text>
                
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <rect x={x - 60} y={y - 45} width="120" height="35" rx="8" fill="#1e293b" className="dark:fill-white" />
                  <text x={x} y={y - 23} textAnchor="middle" className="text-xs font-bold fill-white dark:fill-[#0F172A]">{formatCurrency(d.net, isPrivacyMode)}</text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="border-t border-gray-100 dark:border-white/5 pt-6">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Riwayat Bulanan</h4>
        <div className="flex flex-col gap-3">
          {chartData.slice().reverse().map((d, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#1E293B] border border-gray-100 dark:border-white/5 transition-colors hover:bg-gray-100 dark:hover:bg-[#334155]">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${d.net >= 0 ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                  <span className="material-symbols-outlined">{d.net >= 0 ? 'trending_up' : 'trending_down'}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{formatMonthLabel(d.month)}</p>
                  <p className="text-xs text-gray-500">
                    TP: <span className="text-cyan-500">{formatCompactCurrency(d.income, isPrivacyMode)}</span> • SL: <span className="text-rose-500">{formatCompactCurrency(d.expense, isPrivacyMode)}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-lg ${d.net >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {d.net >= 0 ? '+' : ''}{formatCurrency(d.net, isPrivacyMode)}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Net Result</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
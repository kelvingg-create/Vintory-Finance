import type { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden relative bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-300 font-sans selection:bg-cyan-500/30">
      
      {/* --- BACKGROUND ART (CYBER CITY AMBIENCE) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        
        {/* 1. Base Gradient (Deep Cyber Navy) */}
        {/* Gradasi halus dari Navy ke Hitam Pekat untuk kedalaman */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#020617] to-slate-950"></div>
        
        {/* 2. CYBER DOODLE PATTERN (City & Finance Tech) */}
        {/* Ikon-ikon ini disebar acak dengan warna Cyan pudar */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] select-none text-slate-400 dark:text-cyan-700/60">
           {/* Gedung / City */}
           <span className="material-symbols-outlined absolute top-[5%] left-[5%] text-8xl rotate-12">domain</span>
           <span className="material-symbols-outlined absolute bottom-[15%] right-[5%] text-[10rem] -rotate-6 opacity-50">location_city</span>
           
           {/* Tech / Network */}
           <span className="material-symbols-outlined absolute top-[20%] right-[15%] text-9xl -rotate-12">hub</span>
           <span className="material-symbols-outlined absolute bottom-[40%] left-[10%] text-7xl rotate-45">token</span>
           
           {/* Finance / Chart */}
           <span className="material-symbols-outlined absolute top-[50%] left-[50%] text-8xl -rotate-12 transform -translate-x-1/2">query_stats</span>
           <span className="material-symbols-outlined absolute bottom-[10%] left-[30%] text-8xl rotate-6">candlestick_chart</span>
           <span className="material-symbols-outlined absolute top-[10%] left-[40%] text-6xl -rotate-12">trending_up</span>
           <span className="material-symbols-outlined absolute top-[35%] right-[5%] text-7xl rotate-90">wifi_tethering</span>
        </div>

        {/* 3. Neon Glows (City Lights) */}
        {/* Pendaran cahaya Cyan & Indigo untuk kesan futuristik */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-cyan-500/10 blur-[150px] rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full opacity-50"></div>

        
      </div>

      {/* Content Wrapper */}
      <div className="flex w-full h-full relative z-10 backdrop-blur-[0px]">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSession, useSignOut } from '../hooks/useAuth';

export default function Sidebar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const { signOut } = useSignOut();

  // --- PAKSA DARK MODE PERMANEN ---
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'TR';

  return (
    <aside className="hidden md:flex flex-col w-72 h-full bg-[#0F172A] border-r border-white/5 flex-shrink-0 relative z-50">
      <div className="p-6">
      
        {/* HEADER: LOGO CYBER CITY */}
        <div className="flex items-center gap-4 mb-12 px-2">
          {/* Logo Vintory Finance SVG dengan efek Glow Neon */}
          <div className="w-12 h-12 rounded-xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:shadow-cyan-500/30 transition-all overflow-hidden flex items-center justify-center bg-[#0F172A] p-1">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <rect width="200" height="200" rx="40" fill="#0F172A"/>
              <defs>
                <linearGradient id="vf_gradient_sidebar" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22C55E"/> <stop offset="1" stopColor="#3B82F6"/> 
                </linearGradient>
              </defs>
              <path d="M50 70L85 140L105 100" stroke="url(#vf_gradient_sidebar)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M105 100H150" stroke="url(#vf_gradient_sidebar)" strokeWidth="18" strokeLinecap="round"/>
              <path d="M95 70H140" stroke="url(#vf_gradient_sidebar)" strokeWidth="18" strokeLinecap="round"/>
              <path d="M140 55L155 70L140 85" fill="url(#vf_gradient_sidebar)"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white leading-none bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              VINTORY APP
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_cyan]"></span>
              <p className="text-[9px] text-cyan-500 font-bold uppercase tracking-[0.2em]">Future Finance</p>
            </div>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-white/5 text-white font-bold shadow-sm ring-1 ring-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-500 rounded-r-full shadow-[0_0_10px_cyan]" />}
                <span className={`material-symbols-outlined transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : ''}`}>dashboard</span>
                <span className="text-sm tracking-wide">Dashboard</span>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/transaction" 
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-white/5 text-white font-bold shadow-sm ring-1 ring-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_indigo]" />}
                <span className={`material-symbols-outlined transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : ''}`}>edit_square</span>
                <span className="text-sm tracking-wide">Input Trade</span>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/reports" 
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-white/5 text-white font-bold shadow-sm ring-1 ring-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-r-full shadow-[0_0_10px_purple]" />}
                <span className={`material-symbols-outlined transition-transform group-hover:scale-110 ${isActive ? 'text-purple-400' : ''}`}>monitoring</span>
                <span className="text-sm tracking-wide">Laporan</span>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-white/5 text-white font-bold shadow-sm ring-1 ring-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_10px_emerald]" />}
                <span className={`material-symbols-outlined transition-transform group-hover:scale-110 ${isActive ? 'text-emerald-400' : ''}`}>auto_stories</span>
                <span className="text-sm tracking-wide">Jurnal Trading</span>
              </>
            )}
          </NavLink>
        </nav>
      </div>

      {/* USER PROFILE */}
      <div className="mt-auto p-6 border-t border-white/5">
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent focus:outline-none group"
          >
            {session?.user?.image ? (
              <div 
                className="w-10 h-10 rounded-full bg-cover bg-center ring-2 ring-white/10 group-hover:ring-cyan-500 transition-all" 
                style={{ backgroundImage: `url("${session.user.image}")` }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold shadow-inner border border-white/10">
                {userInitials}
              </div>
            )}
            <div className="flex flex-col items-start overflow-hidden">
              <p className="text-sm font-bold text-white truncate w-full group-hover:text-cyan-400 transition-colors">
                {session?.user?.name || 'Trader'}
              </p>
              <p className="text-[10px] text-gray-500 truncate w-full font-bold uppercase tracking-wider">
                Pro Member
              </p>
            </div>
            <span className={`material-symbols-outlined ml-auto text-gray-400 text-sm transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_less</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 w-full mb-3 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
              <div className="p-1">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

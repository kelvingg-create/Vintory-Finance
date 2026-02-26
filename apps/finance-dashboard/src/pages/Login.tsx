import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignIn } from '../hooks/useAuth';

const Login = () => {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password, rememberMe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };
// --- KOMPONEN LOGO BARU VINTORY FINANCE (SVG) ---
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
  return (
    <div className="bg-[#F8FAFC] dark:bg-[#020617] font-sans text-slate-900 dark:text-white min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 selection:bg-cyan-500/30">
      
      {/* --- BACKGROUND CYBER THEME --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#020617] to-slate-950"></div>
        
        {/* Neon Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-cyan-500/20 blur-[120px] rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full opacity-50"></div>
        
        {/* Grid Pattern Overlay (Optional Texture) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
      </div>

      <div className="layout-container flex h-full grow flex-col relative z-10 justify-center items-center p-4">
        
        {/* Login Card */}
        <div className="w-full max-w-[480px] bg-white dark:bg-[#0F172A] rounded-[2.5rem] shadow-2xl shadow-cyan-900/20 overflow-hidden border border-slate-200 dark:border-white/10 backdrop-blur-md">
          <div className="p-8 sm:p-12 flex flex-col gap-8">
            
           {/* Header / Logo */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(34,211,238,0.2)] bg-[#0F172A] p-1 border border-white/5">
                <VintoryLogo />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">VINTORY APP</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide">Enter the Future Finance Terminal</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl text-sm font-medium text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors">mail</span>
                  <input 
                    className="flex w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 h-14 pl-12 pr-5 text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all" 
                    placeholder="trader@cybercity.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider ml-1">Password</label>
                <div className="relative flex w-full items-center group">
                  <span className="material-symbols-outlined absolute left-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors">lock</span>
                  <input 
                    className="flex w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 h-14 pl-12 pr-12 text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button 
                    className="absolute right-4 text-slate-400 dark:text-slate-500 hover:text-cyan-400 transition-colors flex items-center justify-center" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    className="h-5 w-5 rounded border-slate-300 dark:border-white/10 bg-transparent text-cyan-500 checked:bg-cyan-500 focus:ring-offset-0 focus:ring-cyan-500/50 transition-colors cursor-pointer" 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium group-hover:text-cyan-400 transition-colors">Remember me</span>
                </label>
                <a className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-300 transition-colors" href="#">Forgot Password?</a>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-base font-black rounded-2xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    Accessing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">login</span>
                    LOGIN TERMINAL
                  </>
                )}
              </button>

            </form>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-slate-100 dark:border-white/5">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                New Member? 
                <Link className="text-cyan-600 dark:text-cyan-400 font-bold hover:text-cyan-300 ml-1 transition-colors uppercase tracking-wide" to="/signup">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
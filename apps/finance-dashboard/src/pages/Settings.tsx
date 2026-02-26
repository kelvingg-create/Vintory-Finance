import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

// Tipe Data Cerita
interface Story {
  id: string;
  title: string;
  chapter: string;
  content: string;
  category: 'Psikologi' | 'Strategi' | 'Evaluasi' | 'Ilmu Baru';
  createdAt: string; 
  updatedAt?: string;
}

const CATEGORIES = ['Semua', 'Psikologi', 'Strategi', 'Evaluasi', 'Ilmu Baru'];

// Helper ID yang Aman (Anti-Crash di browser lama)
const generateSafeId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Helper Format Tanggal Aman (Anti-White Screen)
const safeFormatDate = (dateString: string | undefined) => {
  try {
    if (!dateString) return new Date().toLocaleDateString('id-ID');
    const date = new Date(dateString);
    // Cek jika tanggal valid
    if (isNaN(date.getTime())) return new Date().toLocaleDateString('id-ID');
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' });
  } catch (e) {
    return '-';
  }
};

const Settings = () => {
  // --- STATE DENGAN PROTEKSI ERROR (ANTI-CRASH) ---
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem('trading_journal_stories');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Validasi apakah array, jika bukan, reset
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Data korup, mereset...", e);
      return [];
    }
  });
  
  const [viewMode, setViewMode] = useState<'reading' | 'writing' | 'editing'>('reading');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');

  const [formData, setFormData] = useState({
    title: '',
    chapter: '',
    category: 'Ilmu Baru' as Story['category'],
    content: ''
  });

  // --- EFFECT: AUTO SAVE ---
  useEffect(() => {
    try {
      localStorage.setItem('trading_journal_stories', JSON.stringify(stories));
    } catch (e) {
      console.error("Gagal menyimpan", e);
    }
  }, [stories]);

  // --- LOGIC FILTER ---
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      // Guard clause jika story undefined/null
      if (!story) return false;

      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        (story.title || '').toLowerCase().includes(term) || 
        (story.content || '').toLowerCase().includes(term) ||
        (story.chapter || '').toLowerCase().includes(term);
      
      const matchesCategory = filterCategory === 'Semua' || story.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [stories, searchTerm, filterCategory]);

  // --- HANDLERS ---
  const handleStartWriting = () => {
    setFormData({ title: '', chapter: '', category: 'Ilmu Baru', content: '' });
    setViewMode('writing');
    setActiveStory(null);
  };

  const handleStartEditing = (story: Story) => {
    setFormData({
      title: story.title,
      chapter: story.chapter,
      category: story.category,
      content: story.content
    });
    setActiveStory(story);
    setViewMode('editing');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const timestamp = new Date().toISOString();

    if (viewMode === 'writing') {
      const newStory: Story = {
        id: generateSafeId(),
        ...formData,
        createdAt: timestamp,
      };
      setStories([newStory, ...stories]); 
      setActiveStory(newStory);
    } else if (viewMode === 'editing' && activeStory) {
      const updatedStories = stories.map(s => 
        s.id === activeStory.id 
          ? { ...s, ...formData, updatedAt: timestamp }
          : s
      );
      setStories(updatedStories);
      setActiveStory({ ...activeStory, ...formData });
    }

    setViewMode('reading');
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus catatan ini?")) return;
    setStories(stories.filter(s => s.id !== id));
    if (activeStory?.id === id) {
      setActiveStory(null);
      setViewMode('reading');
    }
  };

  // Fitur Darurat: Reset Data jika masih Error
  const handleResetData = () => {
    if (confirm("PERINGATAN: Ini akan menghapus semua jurnal karena data mungkin rusak. Lanjutkan?")) {
      localStorage.removeItem('trading_journal_stories');
      setStories([]);
      window.location.reload();
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Psikologi': return 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 border border-transparent';
      case 'Strategi': return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 border border-transparent';
      case 'Evaluasi': return 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 border border-transparent';
      default: return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 border border-transparent';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#020617]">
        
        {/* SIDEBAR: NAVIGASI & PENCARIAN */}
        <div className="w-80 md:w-96 border-r border-gray-200 dark:border-white/5 flex flex-col bg-white dark:bg-[#0F172A] h-full shadow-xl shadow-cyan-900/5 z-10">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 shrink-0 bg-white dark:bg-[#0F172A] sticky top-0 z-20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Jurnal</h2>
              <button 
                onClick={handleStartWriting}
                className="w-10 h-10 rounded-full bg-[#0F172A] dark:bg-cyan-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20"
                title="Tulis Baru"
              >
                <span className="material-symbols-outlined text-xl">edit_square</span>
              </button>
            </div>

            <div className="relative mb-4 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors text-lg">search</span>
              <input 
                type="text" 
                placeholder="Cari strategi..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#1E293B] border-none rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-gray-400 dark:text-white"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                    filterCategory === cat 
                      ? 'bg-gray-900 dark:bg-cyan-500 text-white border-transparent shadow-md shadow-cyan-500/20' 
                      : 'bg-gray-100 dark:bg-[#1E293B] text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-32 scrollbar-thin">
            {filteredStories.length === 0 ? (
              <div className="text-center py-20 px-6 opacity-60">
                <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-slate-600 mb-2">library_books</span>
                <p className="text-xs text-gray-500 dark:text-slate-500">Tidak ada catatan.</p>
                <button onClick={handleResetData} className="mt-8 text-[10px] text-red-500 underline opacity-50 hover:opacity-100">
                   Reset Data (Jika Error)
                </button>
              </div>
            ) : (
              filteredStories.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => { setActiveStory(s); setViewMode('reading'); }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border group relative ${
                    activeStory?.id === s.id 
                      ? 'bg-white dark:bg-[#1E293B] border-cyan-500/50 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/20' 
                      : 'bg-white dark:bg-[#1E293B]/50 border-transparent hover:bg-gray-50 dark:hover:bg-[#1E293B]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getCategoryColor(s.category)}`}>
                      {s.category}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium">
                      {safeFormatDate(s.createdAt)}
                    </span>
                  </div>
                  <h4 className={`font-bold text-sm mb-1 line-clamp-2 ${activeStory?.id === s.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-800 dark:text-white'}`}>
                    {s.title}
                  </h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
                    {s.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-[#020617] relative h-full flex flex-col">
          
          {(viewMode === 'writing' || viewMode === 'editing') ? (
            <div className="max-w-4xl mx-auto w-full p-8 md:p-12 animate-in slide-in-from-bottom-4 duration-300 flex-1 pb-32">
              <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-white/5 pb-6">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {viewMode === 'writing' ? 'Tulis Baru' : 'Edit Catatan'}
                  </h3>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setViewMode('reading')} className="px-6 py-3 bg-white dark:bg-[#1E293B] text-gray-500 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-[#2a3848] text-sm shadow-sm transition-all">
                    Batal
                  </button>
                  <button onClick={handleSave} className="px-8 py-3 bg-[#0F172A] dark:bg-cyan-600 text-white font-bold rounded-xl hover:scale-105 transition-transform text-sm shadow-xl shadow-cyan-500/20">
                    Simpan
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                <input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Judul Utama..."
                  className="w-full bg-transparent text-4xl font-black text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-700 outline-none"
                  autoFocus
                />
                
                <div className="flex gap-4">
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input 
                    value={formData.chapter}
                    onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                    placeholder="Bab / Topik..."
                    className="bg-transparent border-b border-gray-200 dark:border-white/10 px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 outline-none focus:border-cyan-500 w-full max-w-xs transition-colors"
                  />
                </div>

                <textarea 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Mulai menulis..."
                  className="w-full h-[60vh] bg-transparent text-lg text-gray-700 dark:text-gray-300 leading-relaxed outline-none resize-none font-serif p-4"
                />
              </div>
            </div>

          ) : activeStory ? (
            <div className="max-w-4xl mx-auto w-full p-8 md:p-16 animate-in fade-in duration-500 pb-32">
              <div className="flex justify-between items-start mb-10">
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${getCategoryColor(activeStory.category)}`}>
                    {activeStory.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-[#1E293B] text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {activeStory.chapter}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => handleStartEditing(activeStory)} className="w-10 h-10 rounded-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-500 hover:text-cyan-500 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button onClick={() => handleDelete(activeStory.id)} className="w-10 h-10 rounded-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-500 hover:text-rose-500 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>

              <article className="prose dark:prose-invert lg:prose-xl max-w-none">
                <h1 className="font-black text-gray-900 dark:text-white mb-8 leading-tight">
                  {activeStory.title}
                </h1>
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-8 font-serif text-lg">
                  {activeStory.content}
                </div>
              </article>

              <div className="mt-20 pt-10 border-t border-gray-200 dark:border-white/5 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Ditulis pada {safeFormatDate(activeStory.createdAt)}
                </p>
              </div>
            </div>

          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-[#020617]">
              <div className="w-64 h-64 bg-gradient-to-tr from-gray-100 to-gray-50 dark:from-[#0F172A] dark:to-[#0B1121] rounded-full flex items-center justify-center mb-8 animate-pulse-slow shadow-2xl shadow-cyan-900/10">
                <span className="material-symbols-outlined text-8xl text-gray-300 dark:text-cyan-900/50">menu_book</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Knowledge Base</h1>
              <p className="text-gray-500 dark:text-slate-400 text-lg max-w-md leading-relaxed">
                Pilih topik di sebelah kiri untuk membaca kembali strategi lama, atau tulis insight baru hari ini.
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Settings;
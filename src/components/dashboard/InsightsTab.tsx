'use client';

import { BarChart3, TrendingUp, Users, Building2, MapPin, Target, Briefcase } from 'lucide-react';

export default function InsightsTab({ data }: { data: { ideas: any[], matches: any[], profiles: any[] } }) {
  const { ideas, matches, profiles } = data;

  // 1. HITUNG TOTAL STATISTIK
  const totalStartups = ideas.length; // <-- SEKARANG MURNI DIAMBIL DARI TOTAL KATALOG
  const totalInvestors = profiles.filter(p => p.role === 'investor').length;
  const totalMatches = matches.length;
  const successMatches = matches.filter(m => m.status === 'accepted').length;

  // 2. FUNGSI UNTUK MENGELOMPOKKAN DATA (GROUP BY)
  const getGroupedData = (arr: any[], key1: string, key2: string = '') => {
    const counts: Record<string, number> = {};
    arr.forEach(item => {
      // Ambil dari kolom mana aja yang tersedia (antisipasi beda nama kolom CSV vs Database)
      const val = item[key1] || item[key2] || 'Tidak Spesifik';
      counts[val] = (counts[val] || 0) + 1;
    });
    
    const total = arr.length || 1; // Cegah pembagian dengan 0
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // Urutkan dari terbanyak
      .slice(0, 6) // Ambil Top 6
      .map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 100) }));
  };

  // 3. OLAH DATA UNTUK GRAFIK (Membaca kolom domisili/location, category dll)
  const domisiliData = getGroupedData(ideas, 'domisili', 'location');
  const sektorData = getGroupedData(ideas, 'category', 'business_category');
  const tujuanData = getGroupedData(ideas, 'event_objective', 'event_goals');
  const statusData = getGroupedData(matches, 'status');
  
  // Khusus tahun, urutkan berdasarkan tahun (bukan jumlah terbanyak)
  const tahunData = getGroupedData(ideas, 'founded_year', 'founding_year')
    .sort((a, b) => a.name.localeCompare(b.name)); 

  // KOMPONEN UNTUK MENGGAMBAR BAR HORIZONTAL
  const ProgressBar = ({ item, colorClass }: { item: any, colorClass: string }) => (
    <div className="mb-4 group">
      <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
        <span className="truncate pr-4">{item.name}</span>
        <span className="text-slate-400 whitespace-nowrap">{item.percent}% ({item.count})</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full ${colorClass} transition-all duration-1000 ease-out group-hover:opacity-80`} 
          style={{ width: `${item.percent}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* KARTU STATISTIK UTAMA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <Building2 className="text-indigo-500 mb-3" size={24} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Startup</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalStartups}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <Users className="text-emerald-500 mb-3" size={24} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Investor</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalInvestors}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <BarChart3 className="text-amber-500 mb-3" size={24} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Matches</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalMatches}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl shadow-slate-200">
          <TrendingUp className="text-indigo-400 mb-3" size={24} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deal Success</p>
          <p className="text-3xl font-black text-white mt-1">{successMatches}</p>
        </div>
      </div>

      {/* GRAFIK BAR SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* DOMISILI */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><MapPin size={20} /></div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Sebaran Domisili</h3>
          </div>
          {domisiliData.length > 0 ? domisiliData.map((d, i) => <ProgressBar key={i} item={d} colorClass="bg-indigo-500" />) : <p className="text-xs text-slate-400 text-center py-4">Memuat data...</p>}
        </div>

        {/* SEKTOR BISNIS */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Briefcase size={20} /></div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Sektor Bisnis</h3>
          </div>
          {sektorData.length > 0 ? sektorData.map((d, i) => <ProgressBar key={i} item={d} colorClass="bg-emerald-500" />) : <p className="text-xs text-slate-400 text-center py-4">Memuat data...</p>}
        </div>

        {/* TUJUAN EVENT */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Target size={20} /></div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Tujuan Event</h3>
          </div>
          {tujuanData.length > 0 ? tujuanData.map((d, i) => <ProgressBar key={i} item={d} colorClass="bg-amber-500" />) : <p className="text-xs text-slate-400 text-center py-4">Memuat data...</p>}
        </div>

        {/* TAHUN PENDIRIAN & MATCH STATUS */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-slate-400"/> Tren Tahun Pendirian</h3>
            {tahunData.length > 0 ? tahunData.map((d, i) => <ProgressBar key={i} item={d} colorClass="bg-slate-800" />) : <p className="text-xs text-slate-400 text-center py-4">Memuat data...</p>}
          </div>
          
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-slate-400"/> Status Matching</h3>
            {statusData.length > 0 ? statusData.map((d, i) => (
              <ProgressBar key={i} item={d} colorClass={d.name === 'accepted' ? 'bg-emerald-500' : d.name === 'rejected' ? 'bg-red-400' : 'bg-slate-300'} />
            )) : <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center py-4">Belum ada data match</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
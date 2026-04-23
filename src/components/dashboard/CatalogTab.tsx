'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import StartupCard from './StartupCard';
import { KOTA_INDONESIA, BUSINESS_CATEGORIES } from '@/constants';
import { Handshake } from 'lucide-react';

// 1. TAMBAHKAN onMatchRequest ke dalam Interface Props
interface CatalogProps {
  ideas: any[];
  uInfo: any;
  onEdit: (idea: any) => void;
  onViewDetail: (idea: any) => void;
  onMatchRequest: (idea: any) => void; // <--- INI BIAR GAK MERAH LAGI
  refreshData: () => void;
}

export default function CatalogTab({ 
  ideas, 
  uInfo, 
  onEdit, 
  onViewDetail, 
  onMatchRequest, // <--- TERIMA PROPS-NYA DISINI
  refreshData 
}: CatalogProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus portofolio ini secara permanen?')) return;
    const { error } = await supabase.from('creative_ideas').delete().eq('id', id);
    if (!error) { 
      toast.success('Katalog berhasil dihapus'); 
      refreshData(); 
    }
  };

  // Filter Logic (Tetap Aman)
  const filteredIdeas = ideas.filter(i => {
    const s = searchTerm.toLowerCase();
    const mSearch = !s || i.title?.toLowerCase().includes(s) || i.startup_name?.toLowerCase().includes(s);
    const mCat = !filterCategory || i.business_category === filterCategory;
    const mLoc = !filterLocation || i.location === filterLocation;
    return mSearch && mCat && mLoc;
  });

  return (
    <>
      {/* Search & Filter Section */}
      {uInfo.role?.toLowerCase() === 'investor' && (
        <section className="flex flex-wrap gap-4 mb-12 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm items-center">
          <input 
            type="text" 
            placeholder="Cari startup atau ide..." 
            className="flex-grow bg-slate-50 rounded-2xl px-6 py-4 outline-none text-sm font-bold border-2 border-transparent focus:border-slate-100" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
          <select 
            className="bg-white border-b-2 py-2 text-[10px] font-black uppercase outline-none cursor-pointer" 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {BUSINESS_CATEGORIES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select 
            className="bg-white border-b-2 py-2 text-[10px] font-black uppercase outline-none cursor-pointer" 
            value={filterLocation} 
            onChange={e => setFilterLocation(e.target.value)}
          >
            <option value="">Lokasi</option>
            {KOTA_INDONESIA.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <button 
            onClick={() => { setSearchTerm(''); setFilterCategory(''); setFilterLocation(''); }} 
            className="text-[10px] font-black uppercase text-slate-300 hover:text-slate-900 transition-colors"
          >
            Reset
          </button>
        </section>
      )}

      {/* Grid Katalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {filteredIdeas.map(idea => (
          <div key={idea.id} className="relative group">
            <StartupCard 
              idea={idea} 
              role={uInfo.role} 
              onEdit={onEdit} 
              onDelete={handleDelete} 
              onViewDetail={onViewDetail} 
            />
            
            {/* TOMBOL REQUEST MATCH KHUSUS INVESTOR */}
            {uInfo.role?.toLowerCase() === 'investor' && (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      onMatchRequest(idea);
    }} 
    className="
      /* Posisi: sedikit lebih rapat ke sudut di mobile agar manis */
      absolute top-4 right-4 z-20 
      
      /* Style: Indigo solid dengan efek shadow halus */
      bg-indigo-600 text-white shadow-xl shadow-indigo-200/50
      
      /* Shape: Di mobile kotak membulat (modern), di desktop pill */
      p-3 md:px-5 md:py-3 rounded-2xl md:rounded-full
      
      /* Flex: Biar icon dan teks sejajar */
      flex items-center justify-center gap-2
      
      /* Visibility Logic: Muncul di mobile, hover di desktop */
      opacity-100 md:opacity-0 md:group-hover:opacity-100 
      
      /* Animasi & Interaction */
      transition-all duration-300 hover:bg-indigo-700 active:scale-90
    "
  >
    {/* Icon: Gunakan icon Handshake agar minimalis */}
    <Handshake size={16} className="shrink-0" />
    
    {/* Teks: Sembunyikan di mobile agar hanya icon yang kelihatan (Minimalist) */}
    <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">
      Match
    </span>
  </button>
)}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredIdeas.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Tidak ada data ditemukan</p>
        </div>
      )}
    </>
  );
}
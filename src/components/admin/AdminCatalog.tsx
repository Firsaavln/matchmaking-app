'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit3, Trash2, Search, Download, Briefcase, Tag, MapPin, Lightbulb } from 'lucide-react';
import { exportCSV } from '@/lib/utils';

export default function AdminCatalog({ ideas = [], refreshData, onEditIdea }: any) {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. LOGIKA FILTER (Judul Idea, Nama Startup, & Kategori)
  const filteredIdeas = ideas.filter((i: any) => 
    i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.startup_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.business_category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. LOGIKA EXPORT DETAIL 
  const handleExportDetail = () => {
    if (ideas.length === 0) return toast.error("Tidak ada data untuk di-export");

    const detailedData = ideas.map((i: any) => ({
      'Judul Idea': i.title || '-', // Tambahan Kolom Judul
      'Nama Startup': i.startup_name || '-',
      'Kategori Bisnis': i.business_category || '-',
      'Nama Founder': i.founder_name || '-',
      'Email Founder': i.founder_email || '-',
      'Lokasi': i.location || '-',
      'Tahun Berdiri': i.founding_year || '-',
      'Tujuan Event': i.event_goals || '-',
      'Deskripsi Bisnis': i.description || '-',
      'Link Pitch Deck': i.pitch_deck_url || '-',
      'Tanggal Dibuat': new Date(i.created_at).toLocaleDateString('id-ID'),
    }));

    exportCSV(detailedData, 'detail_katalog_startup_lengkap');
    toast.success("Detail katalog berhasil di-export!");
  };

  // 3. LOGIKA HAPUS (Dengan Proteksi Anti-Lag & Relasi)
  const handleDelete = async (id: number) => {
    if (!confirm('Peringatan: Hapus katalog ini secara permanen?')) return;
    
    const toastId = toast.loading("Sedang menghapus katalog...");

    try {
      const { error } = await supabase.from('creative_ideas').delete().eq('id', id);
      
      if (error) {
        if (error.code === '23503') {
          throw new Error("Startup ini memiliki Jadwal Match. Hapus/Tolak match-nya terlebih dahulu.");
        }
        throw error;
      }

      setTimeout(async () => {
        await refreshData();
        toast.success('Katalog berhasil dihapus dari sistem', { id: toastId });
      }, 800);

    } catch (err: any) {
      console.error("Delete Catalog Error:", err);
      toast.error(err.message || "Gagal menghapus katalog", { id: toastId });
    }
  };

  return (
    <div className="bg-white rounded-[45px] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER & CONTROLS */}
      <div className="p-10 border-b flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-50/30">
        <div>
          <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Catalog Master</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Manage and monitor all startup submissions</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Search Bar Update: Placeholder diubah */}
          <div className="relative flex-grow lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text"
              placeholder="Cari Judul, Startup, atau Kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <button 
            onClick={handleExportDetail}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Download size={14} /> Export Detail
          </button>

          <button 
            onClick={() => onEditIdea(null)} 
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-indigo-600 shadow-lg shadow-slate-100 transition-all active:scale-95"
          >
            <Plus size={14}/> Add Catalog
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
            <tr>
              <th className="px-10 py-6">Idea & Startup Detail</th>
              <th className="px-10 py-6">Category & Location</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredIdeas.length > 0 ? filteredIdeas.map((i: any) => (
              <tr key={i.id} className="hover:bg-slate-50/50 transition-colors group">
                
                {/* KOLOM IDEA & STARTUP BARU */}
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Lightbulb size={18} /> {/* Icon gue ganti jadi lampu bohlam (Idea) */}
                    </div>
                    <div>
                      {/* Judul Idea jadi Highlight Utama */}
                      <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1" title={i.title}>
                        {i.title || 'Untitled Idea'}
                      </p>
                      {/* Startup & Founder jadi Subtitle */}
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1">
                        <span className="text-slate-800">{i.startup_name}</span> 
                        <span className="mx-2 text-slate-300">•</span> 
                        {i.founder_name}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-10 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Tag size={12} className="text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest line-clamp-1">{i.business_category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={12} />
                      <span className="text-[10px] font-bold line-clamp-1">{i.location}</span>
                    </div>
                  </div>
                </td>
                
                <td className="px-10 py-6 flex justify-end gap-3">
                  <button 
                    onClick={() => onEditIdea(i)} 
                    className="p-3 text-slate-400 hover:text-indigo-600 border border-slate-100 rounded-2xl bg-white shadow-sm transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(i.id)} 
                    className="p-3 text-slate-400 hover:text-red-600 border border-slate-100 rounded-2xl bg-white shadow-sm transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="p-24 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <Briefcase size={48} className="text-slate-300" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Pencarian "{searchTerm}" tidak ditemukan
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
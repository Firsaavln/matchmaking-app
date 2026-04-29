'use client';

import { useState } from 'react';
import { Mail, Download, Calendar, Clock, Edit3, Trash2, Check, X, Loader2 } from 'lucide-react';
import { exportCSV } from '@/lib/utils';
import { supabase } from '@/lib/supabase'; // Wajib buat eksekusi langsung
import { toast } from 'sonner';

export default function AdminSchedules({ confirmedMatches = [], refreshData }: any) {
  
  // ==========================================
  // STATE UNTUK INLINE EDITING
  // ==========================================
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ start_time: '', table_number: '' });
  const [isSaving, setIsSaving] = useState(false);

  // --- FUNGSI EXPORT KHUSUS (DETAIL) ---
  const handleExport = () => {
    if (confirmedMatches.length === 0) return alert("Tidak ada data untuk di-export");
    const dataUntukExport = confirmedMatches.map((m: any) => {
      const schedule = m.match_schedules?.[0]; 
      return {
        'Investor (Email)': m.investor?.email || '-',
        'Nama Startup': m.creative_ideas?.startup_name || '-',
        'Nama Founder': m.creative_ideas?.founder_name || '-',
        'Tanggal Pertemuan': schedule?.meeting_date || '-',
        'Jam Pertemuan': schedule?.start_time ? `${schedule.start_time} WIB` : '-',
        'Nomor Meja': schedule?.table_number ? `#${schedule.table_number}` : 'TBA'
      };
    });
    exportCSV(dataUntukExport, 'master_schedule_startup_match');
  };

  // ==========================================
  // FUNGSI HARD DELETE (HAPUS BERSIH DATABASE)
  // ==========================================
  const handleHardDelete = async (matchId: string) => {
    if (!confirm('Hapus permanen dari database?')) return;
    
    const toastId = toast.loading('Sedang menghapus...');
    try {
      // Langsung hapus bapaknya (matches)
      // Karena kita pake ON DELETE CASCADE, anaknya (schedules) otomatis mampus juga.
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      toast.success('Data musnah dari database!', { id: toastId });
      
      // PENTING: Panggil refreshData supaya UI lu narik data terbaru
      if (refreshData) {
        await refreshData();
      } else {
        // Kalau props refreshData gak nyampe, kita paksa reload
        window.location.reload();
      }
      
    } catch (err: any) {
      toast.error('Gagal! Cek RLS Supabase lu: ' + err.message, { id: toastId });
    }
  };

  // ==========================================
  // FUNGSI INLINE EDIT (LANGSUNG DI TABEL)
  // ==========================================
  const startEdit = (m: any) => {
    const sch = m.match_schedules?.[0] || {};
    setEditingId(m.id);
    setEditForm({
      start_time: sch.start_time || '',
      table_number: sch.table_number || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ start_time: '', table_number: '' });
  };

  const saveEdit = async (matchId: string) => {
    setIsSaving(true);
    const toastId = toast.loading('Menyimpan perubahan jadwal...');
    try {
      const { error } = await supabase
        .from('match_schedules')
        .update({
          start_time: editForm.start_time,
          table_number: editForm.table_number
        })
        .eq('match_id', matchId);

      if (error) throw error;

      toast.success('Jadwal berhasil diupdate!', { id: toastId });
      setEditingId(null);
      refreshData(); // Sinkron UI seketika
    } catch (err: any) {
      toast.error('Gagal update: ' + err.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[45px] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-10 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30">
        <div>
          <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Master Schedule</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
            Confirmed Meetings & Appointments
          </p>
        </div>
        
        <button 
          onClick={handleExport} 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
        >
          <Download size={14} /> Export Detail CSV
        </button>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
            <tr>
              <th className="px-10 py-6">Investor</th>
              <th className="px-10 py-6">Startup & Founder</th>
              <th className="px-10 py-6 text-center">Jam</th>
              <th className="px-10 py-6 text-center">Meja</th>
              <th className="px-10 py-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {confirmedMatches.length > 0 ? confirmedMatches.map((m: any) => {
              const sch = m.match_schedules?.[0];
              const isEditing = editingId === m.id; // Ngecek baris ini lagi diedit atau ngga

              return (
                <tr key={m.id} className={`transition-colors group ${isEditing ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}>
                  
                  {/* Kolom Investor */}
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <Mail size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{m.investor?.email}</span>
                    </div>
                  </td>
                  
                  {/* Kolom Startup */}
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {m.creative_ideas?.startup_name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {m.creative_ideas?.founder_name}
                      </span>
                    </div>
                  </td>
                  
                  {/* Kolom Jam (Dinilai Edit/Biasa) */}
                  <td className="px-10 py-6 text-center">
                    {isEditing ? (
                      <input 
                        type="time" 
                        value={editForm.start_time}
                        onChange={(e) => setEditForm({...editForm, start_time: e.target.value})}
                        className="bg-white border border-indigo-200 text-slate-900 text-xs font-bold px-3 py-2 rounded-lg outline-none focus:ring-2 ring-indigo-500 w-24 mx-auto"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-slate-600">
                        <Clock size={12} className="text-indigo-500" />
                        <span className="text-xs font-black uppercase">
                          {sch?.start_time || '--:--'}
                        </span>
                      </div>
                    )}
                  </td>
                  
                  {/* Kolom Meja (Dinilai Edit/Biasa) */}
                  <td className="px-10 py-6 text-center">
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={editForm.table_number}
                        onChange={(e) => setEditForm({...editForm, table_number: e.target.value})}
                        className="bg-white border border-indigo-200 text-slate-900 text-xs font-bold px-3 py-2 rounded-lg outline-none focus:ring-2 ring-indigo-500 w-16 text-center mx-auto"
                      />
                    ) : (
                      <span className="bg-slate-900 text-white text-[10px] font-black px-5 py-2 rounded-xl shadow-md inline-block">
                        #{sch?.table_number || 'TBA'}
                      </span>
                    )}
                  </td>
                  
                  {/* Kolom Aksi */}
                  <td className="px-10 py-6">
                    {isEditing ? (
                      // TOMBOL SAVE & CANCEL (Saat mode edit)
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => saveEdit(m.id)}
                          disabled={isSaving}
                          className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button 
                          onClick={cancelEdit}
                          disabled={isSaving}
                          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      // TOMBOL EDIT & DELETE (Mode biasa)
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={() => startEdit(m)}
                          title="Edit Jadwal"
                          className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleHardDelete(m.id)}
                          title="Hapus Permanen"
                          className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            }) : (
              <tr><td colSpan={5} className="p-24 text-center text-[10px] font-black uppercase text-slate-300">Belum ada jadwal Deal</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
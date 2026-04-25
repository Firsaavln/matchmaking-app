'use client';

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Timer, 
  ArrowRight, 
  Coffee,
  AlertCircle
} from 'lucide-react';

export default function MatchesTab({ 
  matches, 
  uInfo, 
  onReschedule, 
  refreshData,
  onUpdateStatus // <--- TAMBAHKAN PROPS INI (Hasil sinkronisasi page.tsx)
}: { 
  matches: any[], 
  uInfo: any, 
  onReschedule: (match: any) => void, 
  refreshData: () => void,
  onUpdateStatus: (id: string, status: string, data: any) => void // <--- DEFINISIKAN DISINI
}) {
  
  // FUNGSI KONFIRMASI DEAL (Langkah Terakhir + Notifikasi Email)
  const handleFinalAccept = async (matchId: string, fullMatchData: any) => {
    try {
      // 1. Tandai jadwal sebagai terkonfirmasi di tabel match_schedules (Fitur Lama Tetap Ada)
      const { error: scheduleError } = await supabase
        .from('match_schedules')
        .update({ is_confirmed: true })
        .eq('match_id', matchId);

      if (scheduleError) throw scheduleError;

      // 2. Panggil onUpdateStatus dari page.tsx (Fitur Baru)
      // Ini akan otomatis update tabel 'matches' DAN kirim email notifikasi
      await onUpdateStatus(matchId, 'accepted', fullMatchData);

      toast.success("🤝 Deal! Jadwal resmi disepakati & Email terkirim.");
      refreshData();
    } catch (err: any) {
      toast.error("Gagal mengonfirmasi: " + err.message);
    }
  };

  // Tampilan jika data kosong (Tetap Sama)
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-24 bg-slate-50 rounded-[50px] border-2 border-dashed border-slate-100 flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <Timer className="text-slate-300" size={24} />
        </div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Belum ada pengajuan jadwal matching.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {matches.map((m: any) => {
        const schedule = m.match_schedules?.[0];
        const isMyProposal = schedule?.last_proposed_by === uInfo.id;
        const isConfirmed = m.status === 'accepted';
        const isNegotiating = m.status === 'negotiating' || m.status === 'pending';

        return (
          <div 
            key={m.id} 
            className={`group relative bg-white border-2 p-8 rounded-[45px] flex flex-col lg:flex-row justify-between items-center gap-8 transition-all hover:shadow-2xl hover:shadow-slate-100 ${
              isConfirmed ? 'border-emerald-500/20 bg-emerald-50/10' : 'border-slate-50'
            }`}
          >
            {/* BAGIAN KIRI: IDENTITAS STARTUP */}
            <div className="flex items-center gap-6 w-full lg:w-1/3">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform group-hover:scale-110 ${
                isConfirmed ? 'bg-emerald-500 rotate-3' : 'bg-slate-900 -rotate-3'
              }`}>
                {m.creative_ideas?.startup_name?.charAt(0) || 'S'}
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900">
                  {m.creative_ideas?.startup_name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {isConfirmed ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase bg-emerald-100 px-3 py-1 rounded-full">
                      <CheckCircle2 size={10} /> Pertemuan Terjadwal
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase bg-amber-100 px-3 py-1 rounded-full">
                      <Timer size={10} /> Dalam Negosiasi
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* BAGIAN TENGAH: DETAIL JADWAL & LOKASI */}
            <div className="flex-grow w-full lg:w-auto px-10 border-slate-100 lg:border-l lg:border-r">
              {schedule ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={12} className="text-slate-300" /> Tanggal
                    </p>
                    <p className="text-sm font-bold text-slate-800">{schedule.meeting_date || 'Belum diatur'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12} className="text-slate-300" /> Waktu
                    </p>
                    <p className="text-sm font-bold text-slate-800">{schedule.start_time || '--:--'} WIB</p>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Coffee size={12} className="text-indigo-400" /> Nomor Meja
                    </p>
                    <p className="text-sm font-black text-indigo-600 bg-indigo-50 px-4 py-1 rounded-xl w-fit">
                      #{schedule.table_number || 'TBA'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 italic text-sm">
                  <AlertCircle size={16} /> Menunggu pengaturan jadwal...
                </div>
              )}
            </div>

            {/* BAGIAN KANAN: TOMBOL AKSI */}
            <div className="flex items-center gap-4 w-full lg:w-fit justify-center md:justify-end">
              {isNegotiating && !isMyProposal && (
                <div className="flex gap-3">
                  <button 
                    // Kita oper 'm' (data match lengkap) agar API email punya info yang cukup
                    onClick={() => handleFinalAccept(m.id, m)} 
                    className="bg-emerald-500 text-white text-[10px] font-black uppercase px-8 py-4 rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center gap-2"
                  >
                    Konfirmasi <CheckCircle2 size={14} />
                  </button>
                  <button 
                    onClick={() => onReschedule(m)} 
                    className="bg-white border-2 border-slate-100 text-slate-900 text-[10px] font-black uppercase px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Ubah
                  </button>
                </div>
              )}

              {isNegotiating && isMyProposal && (
                <div className="flex flex-col items-center lg:items-end">
                  <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-50/50 px-6 py-4 rounded-2xl border border-amber-100 animate-pulse flex items-center gap-2">
                    <Timer size={14} /> Menunggu Jawaban {uInfo.role === 'founder' ? 'Investor' : 'Founder'}
                  </span>
                </div>
              )}

              {isConfirmed && (
                <div className="flex flex-col items-center lg:items-end group-hover:translate-x-[-10px] transition-transform">
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-8 py-4 rounded-2xl shadow-lg flex items-center gap-2">
                    ✓ Terkonfirmasi <ArrowRight size={14} />
                  </span>
                  <p className="text-[8px] font-black text-slate-300 mt-2 uppercase tracking-tighter">Silakan datang tepat waktu</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
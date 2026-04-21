import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function MatchesTab({ 
  matches, 
  uInfo, 
  onReschedule, 
  refreshData 
}: { 
  matches: any[], 
  uInfo: any, 
  onReschedule: (match: any) => void, 
  refreshData: () => void 
}) {
  
  const handleFinalAccept = async (matchId: string) => {
    try {
      const { error: matchError } = await supabase
        .from('matches')
        .update({ status: 'accepted' })
        .eq('id', matchId);
      
      if (matchError) throw matchError;

      const { error: scheduleError } = await supabase
        .from('match_schedules')
        .update({ is_confirmed: true })
        .eq('match_id', matchId);

      if (scheduleError) throw scheduleError;

      toast.success("Deal! Jadwal telah disepakati kedua belah pihak.");
      refreshData();
    } catch (err: any) {
      toast.error("Gagal mengonfirmasi: " + err.message);
    }
  };

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-24 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest text-center">Belum ada pengajuan jadwal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {matches.map((m: any) => {
        const schedule = m.match_schedules?.[0];
        // Cek apakah saya yang terakhir mengajukan jadwal ini
        const isMyProposal = schedule?.last_proposed_by === uInfo.id;
        const isConfirmed = m.status === 'accepted';
        const isNegotiating = m.status === 'negotiating' || m.status === 'pending';

        return (
          <div key={m.id} className={`bg-white border p-8 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm border-l-8 ${isConfirmed ? 'border-l-green-500' : 'border-l-slate-900'}`}>
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 text-white rounded-xl flex items-center justify-center text-[10px] font-black ${isConfirmed ? 'bg-green-500' : 'bg-slate-900'}`}>
                {isConfirmed ? 'DEAL' : 'NEG'}
              </div>
              <div>
                <h4 className="text-lg font-bold uppercase tracking-tighter">{m.creative_ideas?.startup_name}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                   {isConfirmed ? 'Pertemuan Terjadwal' : 'Dalam Negosiasi'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 text-right">
              {schedule && (
                <div className="bg-slate-50 p-4 rounded-2xl text-[10px] font-bold border border-slate-100">
                  <p className="text-slate-300 mb-1 uppercase tracking-widest">Waktu Usulan:</p>
                  <p className="text-slate-900 text-sm">{schedule.meeting_date} | {schedule.start_time}</p>
                  <p className="text-indigo-600 mt-1 uppercase">Meja #{schedule.table_number}</p>
                </div>
              )}

              <div className="flex gap-3">
                {/* JIKA BUKAN USULAN SAYA, TAMPILKAN TOMBOL AKSI */}
                {isNegotiating && !isMyProposal && (
                  <>
                    <button 
                      onClick={() => handleFinalAccept(m.id)} 
                      className="bg-green-500 text-white text-[10px] font-black uppercase px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all"
                    >
                      Konfirmasi
                    </button>
                    <button 
                      onClick={() => onReschedule(m)} 
                      className="bg-slate-900 text-white text-[10px] font-black uppercase px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all"
                    >
                      Ubah Jadwal
                    </button>
                  </>
                )}

                {/* JIKA INI USULAN SAYA, TAMPILKAN STATUS TUNGGU */}
                {isNegotiating && isMyProposal && (
                  <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-50 px-6 py-3 rounded-xl animate-pulse border border-amber-100">
                    Menunggu Jawaban {uInfo.role === 'founder' ? 'Investor' : 'Founder'}
                  </span>
                )}

                {isConfirmed && (
                  <div className="flex flex-col items-end">
                    <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase px-6 py-3 rounded-xl">✓ Terkonfirmasi</span>
                    <p className="text-[9px] font-bold text-slate-300 mt-2 uppercase">Gunakan Meja #{schedule?.table_number}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
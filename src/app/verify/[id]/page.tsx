'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
// import Image from 'next/image';
import { Loader2, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';

export default function VerifyPage() {
  const params = useParams();
  const matchId = params?.id as string;
  
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Tunggu sampai ID dari URL kebaca
    if (!matchId) return;

    const fetchMatchDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            creative_ideas(startup_name, tagline),
            match_schedules(*)
          `)
          .eq('id', matchId)
          .single();

        if (error) throw error;
        if (data) setMatch(data);
      } catch (err: any) {
        console.error("Fetch Verify Error:", err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMatchDetail();
  }, [matchId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Menyiapkan Tiket Digital...</p>
    </div>
  );

  if (errorMsg || !match) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm border border-red-100">
        <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Tiket Tidak Valid</h2>
        <p className="text-sm text-slate-500 mb-4">
          {errorMsg ? `Sistem menolak akses: ${errorMsg}` : "Link kadaluarsa atau data tidak ditemukan."}
        </p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Hint: Cek Policy RLS di Supabase lu!
        </p>
      </div>
    </div>
  );

  const schedule = match.match_schedules?.[0] || {};
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://siapjasatik.id/verify/${match.id}`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Exclusive Pass</p>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">SIAP BUSINESS FORUM</h1>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{match.creative_ideas?.startup_name || 'Startup Name'}</h2>
            <p className="text-xs font-bold text-slate-400 italic mt-1 px-4">{match.creative_ideas?.tagline || 'Startup Tagline'}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
              <Calendar className="text-indigo-600" size={20} />
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tanggal</p>
                <p className="text-sm font-bold text-slate-900">{schedule.meeting_date || 'TBA'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
              <Clock className="text-indigo-600" size={20} />
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Waktu</p>
                <p className="text-sm font-bold text-slate-900">{schedule.start_time || 'TBA'} WIB</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <MapPin size={20} />
              <div>
                <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">Lokasi Meja</p>
                <p className="text-sm font-black">Table No. #{schedule.table_number || 'TBA'}</p>
              </div>
            </div>
          </div>

          {/* QR CODE SECTION */}
          <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-[32px] bg-white">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Scan for Check-in</p>
            <div className="inline-block p-2 bg-white rounded-2xl border border-slate-100">
              <img src={qrUrl} alt="QR Pass" width={200} height={200} className="rounded-lg" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center border-t border-slate-50 bg-slate-50/50">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Tunjukkan halaman ini kepada panitia di lokasi.
          </p>
        </div>
      </div>
    </div>
  );
}
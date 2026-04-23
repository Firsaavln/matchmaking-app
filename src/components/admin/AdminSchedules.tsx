'use client';

import { Mail, Download, Calendar, Clock } from 'lucide-react';
import { exportCSV } from '@/lib/utils';

export default function AdminSchedules({ confirmedMatches = [] }: any) {
  
  // --- FUNGSI EXPORT KHUSUS (DETAIL) ---
  const handleExport = () => {
    if (confirmedMatches.length === 0) return alert("Tidak ada data untuk di-export");

    // Kita petakan (map) datanya supaya strukturnya rata (flat)
    const dataUntukExport = confirmedMatches.map((m: any) => {
      const schedule = m.match_schedules?.[0]; // Ambil jadwal pertama
      
      return {
        'Investor (Email)': m.investor?.email || '-',
        'Nama Startup': m.creative_ideas?.startup_name || '-',
        'Nama Founder': m.creative_ideas?.founder_name || '-',
        'Tanggal Pertemuan': schedule?.meeting_date || '-',
        'Jam Pertemuan': schedule?.start_time ? `${schedule.start_time} WIB` : '-',
        'Nomor Meja': schedule?.table_number ? `#${schedule.table_number}` : 'TBA'
      };
    });

    // Panggil helper exportCSV dengan data yang sudah rapi
    exportCSV(dataUntukExport, 'master_schedule_startup_match');
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
        
        {/* Tombol Export sekarang memanggil handleExport kita */}
        <button 
          onClick={handleExport} 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
        >
          <Download size={14} /> Export Detail CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
            <tr>
              <th className="px-10 py-6">Investor</th>
              <th className="px-10 py-6">Startup & Founder</th>
              <th className="px-10 py-6">Jadwal Pertemuan</th>
              <th className="px-10 py-6 text-center">Meja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {confirmedMatches.length > 0 ? confirmedMatches.map((m: any) => {
              const sch = m.match_schedules?.[0];
              return (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                        <Mail size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{m.investor?.email}</span>
                    </div>
                  </td>
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
                  <td className="px-10 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar size={12} className="text-indigo-500" />
                        <span className="text-xs font-bold">
                          {sch?.meeting_date || 'TBA'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-black uppercase">
                          {sch?.start_time || '--:--'} WIB
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-slate-900 text-white text-[10px] font-black px-5 py-2 rounded-xl shadow-md inline-block">
                      #{sch?.table_number || 'TBA'}
                    </span>
                  </td>
                </tr>
              )
            }) : (
              <tr><td colSpan={4} className="p-24 text-center text-[10px] font-black uppercase text-slate-300">Belum ada jadwal Deal</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ScheduleModal({ match, uInfo, idea, onClose, onSuccess, type = 'propose' }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    date: match?.match_schedules?.[0]?.meeting_date || '',
    time: match?.match_schedules?.[0]?.start_time || '',
    tableNumber: match?.match_schedules?.[0]?.table_number || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Jika ini request baru dari Katalog (Investor)
      if (type === 'new_request') {
        const { data: newMatch, error: mError } = await supabase.from('matches').insert([{
          investor_id: uInfo.id,
          founder_id: idea.founder_id,
          idea_id: idea.id,
          status: 'negotiating'
        }]).select().single();
        if (mError) throw mError;

        await supabase.from('match_schedules').insert([{
          match_id: newMatch.id,
          meeting_date: form.date,
          start_time: form.time,
          table_number: parseInt(form.tableNumber),
          last_proposed_by: uInfo.id,
          is_confirmed: false
        }]);
        toast.success("Request & Jadwal terkirim! Menunggu respon Founder.");
      } 
      // 2. Jika ini Reschedule (Negosiasi ulang)
      else {
        await supabase.from('matches').update({ status: 'negotiating' }).eq('id', match.id);
        
        // Cek apakah sudah ada baris di match_schedules
        const { data: existing } = await supabase.from('match_schedules').select('id').eq('match_id', match.id).single();
        
        if (existing) {
          await supabase.from('match_schedules').update({
            meeting_date: form.date,
            start_time: form.time,
            table_number: parseInt(form.tableNumber),
            last_proposed_by: uInfo.id,
            is_confirmed: false
          }).eq('match_id', match.id);
        }
        toast.info("Jadwal baru disodorkan! Menunggu kesepakatan.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative">
        <h3 className="text-xl font-black uppercase mb-2">{type === 'new_request' ? 'Request Match' : 'Reschedule'}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Sodorkan Jadwal Pertemuan</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required type="date" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <div className="flex gap-4">
            <input required type="time" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
            <select required className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" value={form.tableNumber} onChange={e => setForm({...form, tableNumber: e.target.value})}>
              <option value="">Table</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>Meja {n}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-400 py-5 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
            <button disabled={isSubmitting} className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl">
              {isSubmitting ? 'Syncing...' : 'Send Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
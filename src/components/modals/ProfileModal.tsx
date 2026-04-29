'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { X, Loader2, Target, Briefcase, TrendingUp } from 'lucide-react';
import { BUSINESS_CATEGORIES } from '@/constants';

export default function ProfileModal({ uInfo, onClose, onSuccess }: { uInfo: any, onClose: () => void, onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States untuk array preferensi
  const [sectors, setSectors] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [stage, setStage] = useState('Early');

  // Load data yang sudah ada saat modal dibuka
  useEffect(() => {
    if (uInfo.preferences) {
      setSectors(uInfo.preferences.sectors || []);
      setMarkets(uInfo.preferences.markets || []);
      setStage(uInfo.preferences.stage || 'Early');
    }
  }, [uInfo]);

  const toggleArray = (item: string, state: string[], setState: any) => {
    if (state.includes(item)) {
      setState(state.filter(i => i !== item));
    } else {
      setState([...state, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          interested_sectors: sectors,
          target_market_pref: markets,
          preferred_stage: stage
        })
        .eq('id', uInfo.id);

      if (error) throw error;

      toast.success('Preferensi algoritma berhasil disimpan!');
      onSuccess(); // Tutup modal & refresh data
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Preferensi Matchmaking</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ajari Algoritma Apa yang Anda Cari</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:text-slate-900 hover:bg-slate-200 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Sektor Bisnis */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={16} className="text-indigo-500" />
              <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Sektor Bisnis Favorit</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_CATEGORIES.map(b => (
                <button
                  key={b}
                  onClick={() => toggleArray(b, sectors, setSectors)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${sectors.includes(b) ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Target Market */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-emerald-500" />
              <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Target Market</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {['B2B', 'B2C', 'B2G', 'C2C'].map(m => (
                <button
                  key={m}
                  onClick={() => toggleArray(m, markets, setMarkets)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${markets.includes(m) ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Fase Kematangan */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-orange-500" />
              <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Fase Startup</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStage('Early')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${stage === 'Early' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
              >
                <div className={`text-sm font-black uppercase ${stage === 'Early' ? 'text-orange-600' : 'text-slate-700'}`}>Early Stage</div>
                <div className="text-[10px] font-bold text-slate-400 mt-1">Baru rilis atau berumur &le; 2 Tahun</div>
              </button>
              <button
                onClick={() => setStage('Mature')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${stage === 'Mature' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
              >
                <div className={`text-sm font-black uppercase ${stage === 'Mature' ? 'text-orange-600' : 'text-slate-700'}`}>Mature Stage</div>
                <div className="text-[10px] font-bold text-slate-400 mt-1">Sudah stabil, berumur &gt; 2 Tahun</div>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-[32px] flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <><Loader2 className="animate-spin" size={16} /> Menyimpan...</> : 'Simpan & Update Match'}
          </button>
        </div>

      </div>
    </div>
  );
}
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import StartupCard from './StartupCard';
import { KOTA_INDONESIA, BUSINESS_CATEGORIES } from '@/constants';

export default function CatalogTab({ ideas, uInfo, onEdit, onViewDetail, refreshData }: { ideas: any[], uInfo: any, onEdit: (idea: any) => void, onViewDetail: (idea: any) => void, refreshData: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus portofolio ini secara permanen?')) return;
    const { error } = await supabase.from('creative_ideas').delete().eq('id', id);
    if (!error) { toast.success('Deleted'); refreshData(); }
  };

  const handleMatchRequest = async (idea: any) => {
    try {
      const { error } = await supabase.from('matches').insert([{
        investor_id: uInfo.id, founder_id: idea.founder_id, idea_id: idea.id, status: 'pending'
      }]);
      if (error) throw error;
      toast.success("Match Requested!");
      refreshData();
    } catch (err: any) { toast.error(err.message); }
  };

  const filteredIdeas = ideas.filter(i => {
    const s = searchTerm.toLowerCase();
    const mSearch = !s || i.title?.toLowerCase().includes(s) || i.startup_name?.toLowerCase().includes(s);
    const mCat = !filterCategory || i.business_category === filterCategory;
    const mLoc = !filterLocation || i.location === filterLocation;
    return mSearch && mCat && mLoc;
  });

  return (
    <>
      {uInfo.role?.toLowerCase() === 'investor' && (
        <section className="flex gap-6 mb-12 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm items-center">
          <input type="text" placeholder="Search..." className="flex-grow bg-slate-50 rounded-2xl px-6 py-4 outline-none text-sm font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <select className="bg-white border-b-2 py-2 text-[10px] font-black uppercase outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">Category</option>
            {BUSINESS_CATEGORIES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="bg-white border-b-2 py-2 text-[10px] font-black uppercase outline-none" value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
            <option value="">Location</option>
            {KOTA_INDONESIA.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <button onClick={() => { setSearchTerm(''); setFilterCategory(''); setFilterLocation(''); }} className="text-[10px] font-black uppercase text-slate-300">Reset</button>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {filteredIdeas.map(idea => (
          <div key={idea.id} className="relative group">
  <StartupCard idea={idea} role={uInfo.role} onEdit={onEdit} onDelete={handleDelete} onViewDetail={onViewDetail} />
  {uInfo.role?.toLowerCase() === 'investor' && (
    <button 
      onClick={() => {
        // Alihkan ke fungsi buka modal di page.tsx
        onViewDetail({ ...idea, openMatchModal: true }); 
      }} 
      className="absolute top-6 right-6 z-10 bg-indigo-600 text-white text-[9px] font-black uppercase px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl"
    >
      Request Match
    </button>
  )}
</div>
        ))}
      </div>
    </>
  );
}
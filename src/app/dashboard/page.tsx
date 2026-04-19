'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import Navbar from '@/components/dashboard/Navbar';
import StartupCard from '@/components/dashboard/StartupCard';
import { KOTA_INDONESIA, COMPANY_TYPES, BUSINESS_CATEGORIES } from '@/constants';
import { title } from 'process';

export default function Dashboard() {
  const router = useRouter();
  
  // 1. SEMUA STATE YANG DIBUTUHKAN
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null); // State buat Modal Detail
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Form State Lengkap (Identity, Strategy, Metadata)
  const [formData, setFormData] = useState({
    startup_name: '',
    founder_name: '',
    tagline: '',
    title: '',
    social_link: '',
    founding_year: new Date().getFullYear().toString(),
    business_category: '',
    company_type: 'PT',
    location: '',
    phone_number: '',
    core_advantages: '',
    target_market: '',
    key_metrics: '',
    event_goals: '',
    description: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [founderFile, setFounderFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // 2. LOGIKA AUTH & FETCH
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/');
      } else {
        setUserEmail(user.email || '');
        setUserId(user.id);
        setRole(user.user_metadata?.role || 'founder');
        fetchIdeas(user.id, user.user_metadata?.role);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  async function fetchIdeas(id: string, userRole: string) {
    let query = supabase.from('creative_ideas').select('*');
    if (userRole === 'founder') query = query.eq('founder_id', id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) setIdeas(data);
  }

  // 3. FUNGSI AKSI (EDIT & DELETE)
  const handleEdit = (idea: any) => {
    setEditingId(idea.id);
    setFormData({
      ...idea,
      founding_year: idea.founding_year?.toString() || new Date().getFullYear().toString()
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus portofolio ini secara permanen?')) return;
    const { error } = await supabase.from('creative_ideas').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus data');
    } else {
      toast.success('Portofolio berhasil dihapus');
      fetchIdeas(userId, role);
    }
  };

  // 4. LOGIKA UPLOAD & SUBMIT
  const validateFile = (file: File | null) => {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file && file.size > MAX_SIZE) {
      toast.warning(`File "${file.name}" terlalu besar! Maksimal 2MB.`);
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${userId}/${fileName}`;
    const { error } = await supabase.storage.from('assets').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let logoUrl = logoFile ? await uploadFile(logoFile, 'logos') : null;
      let founderPhotoUrl = founderFile ? await uploadFile(founderFile, 'founders') : null;
      let pdfUrl = pdfFile ? await uploadFile(pdfFile, 'documents') : null;

      const payload: any = { 
        ...formData, 
        founding_year: parseInt(formData.founding_year) 
      };
      
      if (logoUrl) payload.logo_url = logoUrl;
      if (founderPhotoUrl) payload.founder_photo_url = founderPhotoUrl;
      if (pdfUrl) payload.pdf_url = pdfUrl;

      if (editingId) {
        await supabase.from('creative_ideas').update(payload).eq('id', editingId);
        toast.success('Katalog diperbarui!');
      } else {
        await supabase.from('creative_ideas').insert([{ founder_id: userId, ...payload }]);
        toast.success('Katalog berhasil diterbitkan!');
      }

      setShowForm(false);
      setEditingId(null);
      fetchIdeas(userId, role);
      // Reset form & files
      setFormData({ 
        startup_name: '', founder_name: '', title: '', tagline: '', social_link: '', 
        founding_year: new Date().getFullYear().toString(), business_category: '', 
        company_type: 'PT', location: '', phone_number: '', core_advantages: '', 
        target_market: '', key_metrics: '', event_goals: '', description: '' 
      });
      setLogoFile(null); setFounderFile(null); setPdfFile(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. FILTERING LOGIC
  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.startup_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          idea.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || idea.company_type === filterType;
    const matchesLoc = !filterLocation || idea.location === filterLocation;
    return matchesSearch && matchesType && matchesLoc;
  });

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 animate-pulse">Initializing Terminal</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Navbar email={userEmail} />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-slate-900">Ekosistem Hub</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">{role} Access</p>
          </div>
          {role === 'founder' && (
            <button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95">
              {showForm ? 'Batal' : 'Add Catalog'}
            </button>
          )}
        </header>

        {/* SEARCH & FILTER (HANYA UNTUK INVESTOR) */}
        {role === 'investor' && (
          <section className="flex flex-col md:flex-row gap-4 mb-16 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
             <input type="text" placeholder="Search startup name..." className="flex-grow border-b border-slate-100 py-2 focus:border-slate-900 outline-none text-sm font-semibold transition-all px-2" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             <select className="border-b border-slate-100 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Semua Kategori</option>
                {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
             </select>
          </section>
        )}

        {/* --- SECTION FORM --- */}
        {showForm && (
          <div className="bg-white border border-slate-200 p-10 rounded-[40px] mb-20 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
                {/* Column 1: Identity */}
                <div className="space-y-5">
                  <label className="text-[15px] font-black uppercase text-slate-900 border-b pb-2 block">Identity</label>
                  <input required placeholder="Startup Name" className="w-full border-b border-slate-100 py-2 text-sm font-bold focus:border-slate-900 outline-none" value={formData.startup_name} onChange={e => setFormData({...formData, startup_name: e.target.value})} />
                  <input required placeholder="Founder Name" className="w-full border-b border-slate-100 py-2 text-sm font-bold focus:border-slate-900 outline-none" value={formData.founder_name} onChange={e => setFormData({...formData, founder_name: e.target.value})} />
                  <input required placeholder="Title Idea" className="w-full border-b border-slate-100 py-2 text-sm font-bold focus:border-slate-900 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  <input required placeholder="Tagline" className="w-full border-b border-slate-100 py-2 text-sm font-bold focus:border-slate-900 outline-none" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} />
                  <input placeholder="Website (https://...)" className="w-full border-b border-slate-100 py-2 text-sm font-bold focus:border-slate-900 outline-none text-indigo-600" value={formData.social_link} onChange={e => setFormData({...formData, social_link: e.target.value})} />
                  <select className="w-full border-b border-slate-100 py-2 text-sm font-bold outline-none" value={formData.founding_year} onChange={e => setFormData({...formData, founding_year: e.target.value})}>
                    {Array.from({length: 20}, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* Column 2: Strategy */}
                <div className="space-y-5">
                  <label className="text-[15px] font-black uppercase text-slate-900 border-b pb-2 block">Strategic</label>
                  <select className="w-full border-b border-slate-100 py-2 text-sm font-bold outline-none" value={formData.business_category} onChange={e => setFormData({...formData, business_category: e.target.value})}>
                    <option value="">Category</option>
                    {BUSINESS_CATEGORIES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <input required placeholder="Keunggulan Utama" className="w-full border-b border-slate-100 py-2 text-sm font-bold focus:border-slate-900 outline-none" value={formData.core_advantages} onChange={e => setFormData({...formData, core_advantages: e.target.value})} />
                  <input required placeholder="Target Pasar" className="w-full border-b border-slate-100 py-2 text-sm font-bold focus:border-slate-900 outline-none" value={formData.target_market} onChange={e => setFormData({...formData, target_market: e.target.value})} />
                  <input required placeholder="Key Metrics / Pencapaian" className="w-full border-b border-slate-100 py-2 text-sm font-bold focus:border-slate-900 outline-none" value={formData.key_metrics} onChange={e => setFormData({...formData, key_metrics: e.target.value})} />
                </div>

                {/* Column 3: Metadata */}
                <div className="space-y-5">
                  <label className="text-[15px] font-black uppercase text-slate-900 border-b pb-2 block">Metadata</label>
                  <select className="w-full border-b border-slate-100 py-2 text-sm font-bold outline-none" value={formData.company_type} onChange={e => setFormData({...formData, company_type: e.target.value})}>
                    {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input required placeholder="WhatsApp Phone" className="w-full border-b border-slate-100 py-2 text-sm font-bold focus:border-slate-900 outline-none" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                  <input list="cities" placeholder="City Origin" className="w-full border-b border-slate-100 py-2 text-sm font-bold outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  <datalist id="cities">{KOTA_INDONESIA.map(c => <option key={c} value={c} />)}</datalist>
                  <input required placeholder="Tujuan Event" className="w-full border-b border-slate-100 py-2 text-sm font-bold focus:border-slate-900 outline-none" value={formData.event_goals} onChange={e => setFormData({...formData, event_goals: e.target.value})} />
                </div>

                {/* Column 4: Files */}
                <div className="space-y-5">
                  <label className="text-[15px] font-black uppercase text-slate-900 border-b pb-2 block">Media</label>
                  <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-400">Logo {logoFile && '✅'}</span>
                    <input type="file" accept="image/*" onChange={e => validateFile(e.target.files?.[0]!) && setLogoFile(e.target.files?.[0]!)} className="text-[9px] block w-full mt-1" />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-400">Founder Photo {founderFile && '✅'}</span>
                    <input type="file" accept="image/*" onChange={e => validateFile(e.target.files?.[0]!) && setFounderFile(e.target.files?.[0]!)} className="text-[9px] block w-full mt-1" />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-400">Pitch Deck PDF {pdfFile && '✅'}</span>
                    <input type="file" accept=".pdf" onChange={e => validateFile(e.target.files?.[0]!) && setPdfFile(e.target.files?.[0]!)} className="text-[9px] block w-full mt-1" />
                  </div>
                </div>

                <div className="md:col-span-4">
                  <textarea required placeholder="Full Description..." className="w-full border border-slate-100 p-6 h-32 bg-slate-50 rounded-3xl text-sm font-medium outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="md:col-span-4 flex justify-end">
                  <button disabled={isSubmitting} className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] px-16 py-5 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                    {isSubmitting ? 'Syncing...' : (editingId ? 'Save Changes' : 'Authorize Publication')}
                  </button>
                </div>
             </form>
          </div>
        )}

        {/* --- SECTION IDEA (LISTING CARD) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {filteredIdeas.map((idea) => (
            <StartupCard 
              key={idea.id} 
              idea={idea} 
              role={role} 
              onEdit={handleEdit} 
              onDelete={handleDelete} // Fungsi handleDelete sudah ada di atas
              onViewDetail={(item) => setSelectedIdea(item)} // Fungsi setSelectedIdea sudah ada di atas
            />
          ))}
        </div>
      </main>

      {/* --- MODAL DETAIL --- */}
      {selectedIdea && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedIdea(null)} />
          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[56px] shadow-2xl p-10 md:p-16 border border-slate-100">
            <button onClick={() => setSelectedIdea(null)} className="absolute top-10 right-10 text-[10px] font-black text-slate-300 hover:text-slate-900 uppercase tracking-widest transition-all">Close [Esc]</button>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Kiri: Identity Sidebar */}
              <div className="lg:col-span-4 flex flex-col items-center text-center lg:border-r border-slate-100 lg:pr-16">
                <img src={selectedIdea.logo_url} className="w-30 h-30 rounded-[40px] object-cover mb-8 shadow-2xl ring-4 ring-slate-50" />
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none text-slate-900">{selectedIdea.startup_name}</h2>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-4 leading-relaxed">{selectedIdea.tagline}</p>
                <div className="mt-12 w-full space-y-4">
                  <div className="bg-slate-50 p-6 rounded-3xl flex items-center gap-4 text-left border border-slate-100">
                    <img src={selectedIdea.founder_photo_url} className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white" />
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Founder</span>
                      <span className="text-sm font-bold text-slate-900">{selectedIdea.founder_name}</span>
                    </div>
                  </div>
                  <a href={`https://wa.me/${selectedIdea.phone_number?.replace(/\D/g, '')}`} target="_blank" className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-green-100">Contact via WhatsApp</a>
                </div>
              </div>

              {/* Kanan: Content Matrix */}
              <div className="lg:col-span-8 space-y-12">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                    <label className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-1 block">Industry</label>
                    <p className="text-sm font-bold uppercase text-slate-900">{selectedIdea.business_category}</p>
                  </div>
                  <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                    <label className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-1 block">Origin</label>
                    <p className="text-sm font-bold uppercase text-slate-900">{selectedIdea.location} • {selectedIdea.founding_year}</p>
                  </div>
                  <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                    <label className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-1 block">Entity</label>
                    <p className="text-sm font-bold uppercase text-slate-900">{selectedIdea.company_type}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-900 tracking-[0.3em] mb-4 block border-b border-slate-900 pb-1 w-fit">Executive Description</label>
                  <p className="text-[15px] leading-relaxed text-slate-600 italic font-medium">"{selectedIdea.description}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-7 rounded-[32px] border border-slate-100 hover:border-slate-900 transition-all">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block border-b pb-2">Core Advantages</label>
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed">{selectedIdea.core_advantages}</p>
                  </div>
                  <div className="bg-white p-7 rounded-[32px] border border-slate-100 hover:border-slate-900 transition-all">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block border-b pb-2">Target Market</label>
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed">{selectedIdea.target_market}</p>
                  </div>
                  <div className="bg-white p-7 rounded-[32px] border border-slate-100 hover:border-slate-900 transition-all">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block border-b pb-2">Key Metric / Keunggulan</label>
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed">{selectedIdea.key_metrics}</p>
                  </div>
                  <div className="bg-white p-7 rounded-[32px] border border-slate-100 hover:border-slate-900 transition-all">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block border-b pb-2">Target Event</label>
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed">{selectedIdea.event_goals}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
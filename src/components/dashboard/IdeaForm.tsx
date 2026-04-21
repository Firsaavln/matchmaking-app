import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { KOTA_INDONESIA, COMPANY_TYPES, BUSINESS_CATEGORIES } from '@/constants';

export default function IdeaForm({ uInfo, editingIdea, onSuccess, onCancel }: { uInfo: any, editingIdea?: any, onSuccess: () => void, onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [founderFile, setFounderFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    startup_name: '', founder_name: '', tagline: '', title: '',
    social_link: '', founding_year: new Date().getFullYear().toString(),
    business_category: '', company_type: 'PT', location: '',
    phone_number: '', core_advantages: '', target_market: '',
    key_metrics: '', event_goals: '', description: ''
  });

  useEffect(() => {
    if (editingIdea) setFormData({ ...editingIdea, founding_year: editingIdea.founding_year?.toString() });
  }, [editingIdea]);

  const uploadFile = async (file: File, folder: string) => {
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
    const filePath = `${folder}/${uInfo.id}/${fileName}`;
    const { error } = await supabase.storage.from('assets').upload(filePath, file);
    if (error) throw error;
    return supabase.storage.from('assets').getPublicUrl(filePath).data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let urls: any = {};
      if (logoFile) urls.logo_url = await uploadFile(logoFile, 'logos');
      if (founderFile) urls.founder_photo_url = await uploadFile(founderFile, 'founders');
      if (pdfFile) urls.pdf_url = await uploadFile(pdfFile, 'documents');

      const payload = { ...formData, ...urls, founding_year: parseInt(formData.founding_year) };
      if (editingIdea) {
        await supabase.from('creative_ideas').update(payload).eq('id', editingIdea.id);
      } else {
        await supabase.from('creative_ideas').insert([{ founder_id: uInfo.id, ...payload }]);
      }
      toast.success('Katalog tersimpan!');
      onSuccess();
    } catch (err: any) { toast.error(err.message); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="bg-white border p-10 rounded-[40px] mb-20 shadow-2xl animate-in zoom-in-95 duration-500 relative">
      <button onClick={onCancel} className="absolute top-8 right-10 text-[10px] font-black uppercase text-slate-400">Tutup</button>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-6">
        <div className="space-y-4">
          <label className="text-[12px] font-black uppercase border-b pb-1 block">Identity</label>
          <input required placeholder="Startup Name" className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.startup_name} onChange={e => setFormData({...formData, startup_name: e.target.value})} />
          <input required placeholder="Founder Name" className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.founder_name} onChange={e => setFormData({...formData, founder_name: e.target.value})} />
          <input required placeholder="Idea Title" className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <input required placeholder="Tagline" className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} />
        </div>
        <div className="space-y-4">
          <label className="text-[12px] font-black uppercase border-b pb-1 block">Strategy</label>
          <select className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.business_category} onChange={e => setFormData({...formData, business_category: e.target.value})}>
            <option value="">Category</option>
            {BUSINESS_CATEGORIES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input required placeholder="Target Market" className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.target_market} onChange={e => setFormData({...formData, target_market: e.target.value})} />
          <input required placeholder="Advantages" className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.core_advantages} onChange={e => setFormData({...formData, core_advantages: e.target.value})} />
          <input required placeholder="Key Metrics" className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.key_metrics} onChange={e => setFormData({...formData, key_metrics: e.target.value})} />
        </div>
        <div className="space-y-4">
          <label className="text-[12px] font-black uppercase border-b pb-1 block">Metadata</label>
          <select className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.company_type} onChange={e => setFormData({...formData, company_type: e.target.value})}>
            {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input list="cities" placeholder="City" className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          <datalist id="cities">{KOTA_INDONESIA.map(c => <option key={c} value={c} />)}</datalist>
          <input required placeholder="Phone/WA" className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          <input required placeholder="Event Goals" className="w-full border-b py-2 text-sm font-bold outline-none" value={formData.event_goals} onChange={e => setFormData({...formData, event_goals: e.target.value})} />
        </div>
        <div className="space-y-4">
          <label className="text-[12px] font-black uppercase border-b pb-1 block">Media & Deck</label>
          <div className="text-[9px] font-black uppercase text-slate-400">Logo, Photo, PDF Deck</div>
          <input type="file" className="text-[9px]" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
          <input type="file" className="text-[9px]" onChange={e => setFounderFile(e.target.files?.[0] || null)} />
          <input type="file" accept=".pdf" className="text-[9px]" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
        </div>
        <div className="md:col-span-4">
          <textarea required placeholder="Brief Description..." className="w-full border p-6 h-32 bg-slate-50 rounded-3xl text-sm font-medium outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <div className="md:col-span-4 flex justify-end">
          <button disabled={isSubmitting} className="bg-slate-900 text-white px-12 py-4 rounded-xl text-[10px] font-black uppercase disabled:opacity-50">
            {isSubmitting ? 'Syncing...' : (editingIdea ? 'Save Changes' : 'Publish')}
          </button>
        </div>
      </form>
    </div>
  );
}
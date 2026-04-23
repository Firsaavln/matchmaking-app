'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { KOTA_INDONESIA, COMPANY_TYPES, BUSINESS_CATEGORIES } from '@/constants';
import { Upload, X, FileText, Camera, Calendar, Link, Smartphone, Loader2, Lightbulb } from 'lucide-react';

export default function IdeaForm({ uInfo, editingIdea, onSuccess, onCancel }: { uInfo: any, editingIdea?: any, onSuccess: () => void, onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // File States
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [founderFile, setFounderFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    startup_name: '', 
    founder_name: '', 
    title: '', // JUDUL IDE BALIK LAGI BRE
    tagline: '', 
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

  useEffect(() => {
    if (editingIdea) {
      setFormData({ 
        ...editingIdea, 
        founding_year: editingIdea.founding_year?.toString() || new Date().getFullYear().toString() 
      });
    }
  }, [editingIdea]);

  // --- HELPER: VALIDASI FILE (MAX 2MB) ---
  const validateFile = (file: File, type: 'image' | 'pdf') => {
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error(`File ${file.name} terlalu besar! Maksimal 2MB.`);
      return false;
    }
    if (type === 'image' && !file.type.startsWith('image/')) {
      toast.error(`File ${file.name} harus format gambar (PNG/JPG)!`);
      return false;
    }
    if (type === 'pdf' && file.type !== 'application/pdf') {
      toast.error(`File ${file.name} harus format PDF!`);
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
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

      const payload = { 
        ...formData, 
        ...urls, 
        founding_year: parseInt(formData.founding_year) 
      };

      if (editingIdea) {
        const { error } = await supabase.from('creative_ideas').update(payload).eq('id', editingIdea.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('creative_ideas').insert([{ founder_id: uInfo.id, ...payload }]);
        if (error) throw error;
      }

      toast.success('Katalog startup berhasil diterbitkan!');
      onSuccess();
    } catch (err: any) { 
      toast.error(err.message); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="bg-white border-2 border-slate-100 p-8 md:p-12 rounded-[50px] mb-20 shadow-2xl animate-in zoom-in-95 duration-500 relative">
      <button 
        type="button"
        onClick={onCancel} 
        className="absolute top-10 right-10 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
      >
        <X size={20} />
      </button>

      <div className="mb-12">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
          {editingIdea ? 'Edit Katalog' : 'Publikasi Ide Baru'}
        </h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Detail yang lengkap mempermudah investor melakukan review</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* KOLOM 1: IDENTITAS UTAMA */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-slate-900 rounded-full"></div>
              <label className="text-[14px] font-black uppercase tracking-widest">Identitas</label>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Judul Ide / Proyek</p>
                <div className="relative">
                  <Lightbulb className="absolute left-4 top-4 text-slate-300" size={16} />
                  <input required placeholder="Contoh: AI untuk Petani" className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white pl-12 p-4 rounded-2xl text-sm font-bold outline-none transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Nama Startup</p>
                <input required placeholder="Contoh: TechFlow" className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white p-4 rounded-2xl text-sm font-bold outline-none transition-all" value={formData.startup_name} onChange={e => setFormData({...formData, startup_name: e.target.value})} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Nama Founder</p>
                <input required placeholder="Nama Lengkap" className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white p-4 rounded-2xl text-sm font-bold outline-none transition-all" value={formData.founder_name} onChange={e => setFormData({...formData, founder_name: e.target.value})} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Tagline</p>
                <input required placeholder="Slogan singkat..." className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white p-4 rounded-2xl text-sm font-bold outline-none transition-all" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} />
              </div>
            </div>
          </div>

          {/* KOLOM 2: DETAIL BISNIS */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
              <label className="text-[14px] font-black uppercase tracking-widest text-indigo-600">Bisnis</label>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Kategori Bisnis</p>
                <select required className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white p-4 rounded-2xl text-sm font-bold outline-none cursor-pointer" value={formData.business_category} onChange={e => setFormData({...formData, business_category: e.target.value})}>
                  <option value="">Pilih Kategori</option>
                  {BUSINESS_CATEGORIES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Tahun Berdiri</p>
                <div className="relative">
                  <Calendar className="absolute left-4 top-4 text-slate-300" size={16} />
                  <input type="number" required className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white pl-12 p-4 rounded-2xl text-sm font-bold outline-none" value={formData.founding_year} onChange={e => setFormData({...formData, founding_year: e.target.value})} />
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Target Market</p>
                <input required placeholder="Siapa target user Anda?" className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white p-4 rounded-2xl text-sm font-bold outline-none" value={formData.target_market} onChange={e => setFormData({...formData, target_market: e.target.value})} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Target Event</p>
                <input required placeholder="Tujuan mengikuti event?" className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white p-4 rounded-2xl text-sm font-bold outline-none" value={formData.event_goals} onChange={e => setFormData({...formData, event_goals: e.target.value})} />
              </div>
            </div>
          </div>

          {/* KOLOM 3: MEDIA (MAKS 2MB) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
              <label className="text-[14px] font-black uppercase tracking-widest text-emerald-600">Dokumen & Media</label>
            </div>
            <div className="space-y-3">
              {/* Logo */}
              <div className="relative">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file && validateFile(file, 'image')) setLogoFile(file);
                }} />
                <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center gap-3 transition-all ${logoFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <Camera size={18} className={logoFile ? 'text-emerald-500' : 'text-slate-400'} />
                  <span className="text-[10px] font-black uppercase truncate">{logoFile ? logoFile.name : 'Logo Startup'}</span>
                </div>
              </div>

              {/* Foto Founder */}
              <div className="relative">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file && validateFile(file, 'image')) setFounderFile(file);
                }} />
                <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center gap-3 transition-all ${founderFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <Camera size={18} className={founderFile ? 'text-emerald-500' : 'text-slate-400'} />
                  <span className="text-[10px] font-black uppercase truncate">{founderFile ? founderFile.name : 'Foto Founder'}</span>
                </div>
              </div>

              {/* Pitch Deck PDF */}
              <div className="relative">
                <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file && validateFile(file, 'pdf')) setPdfFile(file);
                }} />
                <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center gap-3 transition-all ${pdfFile ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                  <FileText size={18} className={pdfFile ? 'text-red-500' : 'text-slate-400'} />
                  <span className="text-[10px] font-black uppercase truncate">{pdfFile ? pdfFile.name : 'Pitch Deck (PDF)'}</span>
                </div>
                <p className="text-[8px] text-slate-400 mt-1 ml-2 font-bold uppercase">* Max 2MB per file</p>
              </div>
            </div>
          </div>
        </div>

        {/* INFO KONTAK & TIPE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-8 rounded-[35px]">
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Legalitas</p>
            <select className="w-full bg-white p-4 rounded-2xl text-sm font-bold outline-none" value={formData.company_type} onChange={e => setFormData({...formData, company_type: e.target.value})}>
              {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Lokasi</p>
            <input list="cities" placeholder="Kota Domisili" className="w-full bg-white p-4 rounded-2xl text-sm font-bold outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            <datalist id="cities">{KOTA_INDONESIA.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Nomor WA</p>
            <div className="relative">
              <Smartphone className="absolute left-4 top-4 text-slate-300" size={16} />
              <input required placeholder="62 (tanpa +)" className="w-full bg-white pl-12 p-4 rounded-2xl text-sm font-bold outline-none" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Website link</p>
            <div className="relative">
              <Link className="absolute left-4 top-4 text-slate-300" size={16} />
              <input placeholder="Link profil" className="w-full bg-white pl-12 p-4 rounded-2xl text-sm font-bold outline-none" value={formData.social_link} onChange={e => setFormData({...formData, social_link: e.target.value})} />
            </div>
          </div>
        </div>

        {/* DESKRIPSI & GOALS */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Keunggulan (Core Advantages)</p>
              <textarea required placeholder="Apa nilai unik ide ini?" className="w-full border-2 border-slate-100 p-6 h-32 bg-white rounded-3xl text-sm font-medium outline-none transition-all" value={formData.core_advantages} onChange={e => setFormData({...formData, core_advantages: e.target.value})} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Metrik (Key Metrics)</p>
              <textarea required placeholder="Data pertumbuhan..." className="w-full border-2 border-slate-100 p-6 h-32 bg-white rounded-3xl text-sm font-medium outline-none transition-all" value={formData.key_metrics} onChange={e => setFormData({...formData, key_metrics: e.target.value})} />
            </div>
          </div>
          
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Deskripsi Naratif</p>
            <textarea required placeholder="Ceritakan detail ide startup Anda..." className="w-full border-2 border-slate-100 p-6 h-40 bg-white rounded-3xl text-sm font-medium outline-none transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>

        {/* TOMBOL SUBMIT */}
        <div className="flex justify-end pt-6">
          <button 
            type="submit"
            disabled={isSubmitting} 
            className="bg-slate-900 text-white px-16 py-5 rounded-[25px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {isSubmitting ? <><Loader2 className="animate-spin" size={16} /> Menyimpan...</> : (editingIdea ? 'Simpan Perubahan' : 'Terbitkan Katalog')}
          </button>
        </div>
      </form>
    </div>
  );
}
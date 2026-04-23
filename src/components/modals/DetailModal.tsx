'use client';

import { Globe, FileText, MessageCircle } from 'lucide-react';

export default function DetailModal({ idea, onClose }: { idea: any, onClose: () => void }) {
  if (!idea) return null;

  // KUNCI UTAMA: Kita tembak langsung kolom 'social_link' dari database lu
  const websiteLink = idea.social_link;

  const shortDescription = idea.description && idea.description.length > 300 
    ? idea.description.substring(0, 300) + '...' 
    : idea.description;

  return (
    // Container Utama (Fixed bug scroll di mobile)
    <div className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-lg overflow-y-auto flex justify-center items-start sm:items-center p-4 md:p-6">
      
      <div className="bg-white w-full max-w-5xl rounded-[40px] md:rounded-[56px] p-6 pt-20 md:p-12 relative my-4 sm:my-10 shadow-2xl flex-shrink-0 animate-in zoom-in-95 duration-300">
        
        {/* Tombol Close Responsif (Fix: Selalu kelihatan di pojok atas) */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 md:top-10 md:right-12 bg-slate-100 md:bg-slate-50 px-5 py-2.5 md:px-6 md:py-3 rounded-full font-black uppercase text-[10px] md:text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all z-[160] shadow-sm"
        >
          Close [x]
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
          
          {/* SIDEBAR KIRI */}
          <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r pb-8 md:pb-0 md:pr-12">
            <img 
              src={idea.logo_url || 'https://via.placeholder.com/150'} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-[30px] md:rounded-[40px] mx-auto mb-6 md:mb-8 shadow-2xl ring-4 ring-slate-50 object-cover" 
              alt="Logo Startup"
            />
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">
              {idea.startup_name}
            </h2>
            <p className="text-[10px] md:text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3 md:mt-4">
              {idea.tagline || 'Innovation Startup'}
            </p>
            
            {/* Kartu Founder */}
            <div className="mt-8 md:mt-12 bg-slate-50 p-4 md:p-6 rounded-[24px] md:rounded-[32px] flex items-center gap-4 text-left border border-slate-100">
               <img 
                 src={idea.founder_photo_url || idea.founder_photo || 'https://via.placeholder.com/100'} 
                 className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-white shadow-sm" 
                 alt="Founder"
               />
               <div>
                 <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">Founder</p>
                 <p className="text-xs md:text-sm font-bold text-slate-900">{idea.founder_name}</p>
               </div>
            </div>

            {/* AREA TOMBOL AKSI */}
            <div className="flex flex-col gap-3 mt-8">

              {/* TOMBOL PITCH DECK */}
              {idea.pdf_url && (
                <a 
                  href={idea.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 md:py-5 rounded-2xl md:rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-100 hover:bg-slate-800 transition-all active:scale-95"
                >
                  <FileText size={14} /> View Pitch Deck
                </a>
              )}
              
              {/* TOMBOL WHATSAPP */}
              {idea.phone_number && (
                <a 
                  href={`https://wa.me/${idea.phone_number.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-4 md:py-5 rounded-2xl md:rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-600 transition-all active:scale-95"
                >
                  <MessageCircle size={14} /> Contact Founder
                </a>
              )}
            </div>
          </div>
          
          {/* KONTEN UTAMA KANAN */}
          <div className="md:col-span-8 space-y-8 md:space-y-10 pt-4 md:pt-0">
            {/* Badge Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
               <div className="bg-slate-50/50 p-4 md:p-6 rounded-[24px] md:rounded-[32px]"><p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 mb-1">Sector</p><p className="text-xs md:text-sm font-bold uppercase">{idea.business_category}</p></div>
               <div className="bg-slate-50/50 p-4 md:p-6 rounded-[24px] md:rounded-[32px]"><p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 mb-1">Origin</p><p className="text-xs md:text-sm font-bold uppercase">{idea.location}</p></div>
               <div className="bg-slate-50/50 p-4 md:p-6 rounded-[24px] md:rounded-[32px] col-span-2 md:col-span-1"><p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 mb-1">Entity</p><p className="text-xs md:text-sm font-bold uppercase">{idea.company_type}</p></div>
            </div>
            
            {/* Description */}
            <div>
               <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-900 tracking-[0.3em] mb-3 md:mb-4 block border-b border-slate-900 pb-1 w-fit">Brief Description</label>
               <p className="text-[14px] md:text-[16px] leading-relaxed text-slate-600 italic font-medium">"{shortDescription}"</p>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
               <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm"><label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-2 md:mb-3 block">Advantages</label><p className="text-xs font-bold text-slate-600">{idea.core_advantages}</p></div>
               <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm"><label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-2 md:mb-3 block">Target Market</label><p className="text-xs font-bold text-slate-600">{idea.target_market}</p></div>
               <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm"><label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-2 md:mb-3 block">Key Metrics</label><p className="text-xs font-bold text-slate-600">{idea.key_metrics}</p></div>
               <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm"><label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-2 md:mb-3 block">Event Goals</label><p className="text-xs font-bold text-slate-600">{idea.event_goals}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
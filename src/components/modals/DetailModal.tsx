export default function DetailModal({ idea, onClose }: { idea: any, onClose: () => void }) {
  if (!idea) return null;

  // REVISI: Batasi deskripsi di modal maksimal 300 karakter
  const shortDescription = idea.description && idea.description.length > 300 
    ? idea.description.substring(0, 300) + '...' 
    : idea.description;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-lg overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-[56px] p-12 relative my-10 shadow-2xl">
        <button onClick={onClose} className="absolute top-10 right-12 font-black uppercase text-[11px] text-slate-300 hover:text-slate-900 transition-all">Close [x]</button>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          {/* SIDEBAR KIRI */}
          <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r pb-12 md:pb-0 md:pr-12">
            <img src={idea.logo_url} className="w-32 h-32 rounded-[40px] mx-auto mb-8 shadow-2xl ring-4 ring-slate-50 object-cover" />
            <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">{idea.startup_name}</h2>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-4">{idea.tagline}</p>
            
            <div className="mt-12 bg-slate-50 p-6 rounded-[32px] flex items-center gap-4 text-left border border-slate-100">
               <img src={idea.founder_photo_url} className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" />
               <div><p className="text-[9px] font-black text-slate-300 uppercase">Founder</p><p className="text-sm font-bold text-slate-900">{idea.founder_name}</p></div>
            </div>

            <div className="flex flex-col gap-4 mt-6">
              {idea.pdf_url && (
                <a href={idea.pdf_url} target="_blank" rel="noopener noreferrer" className="block w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all">
                  View Pitch Deck
                </a>
              )}
              {idea.phone_number && (
                <a href={`https://wa.me/${idea.phone_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-green-600 transition-all">
                  Chat WhatsApp
                </a>
              )}
            </div>
          </div>
          
          {/* KONTEN UTAMA KANAN */}
          <div className="md:col-span-8 space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
               <div className="bg-slate-50/50 p-6 rounded-[32px]"><p className="text-[9px] font-black uppercase text-slate-300 mb-1">Sector</p><p className="text-sm font-bold uppercase">{idea.business_category}</p></div>
               <div className="bg-slate-50/50 p-6 rounded-[32px]"><p className="text-[9px] font-black uppercase text-slate-300 mb-1">Origin</p><p className="text-sm font-bold uppercase">{idea.location}</p></div>
               <div className="bg-slate-50/50 p-6 rounded-[32px]"><p className="text-[9px] font-black uppercase text-slate-300 mb-1">Entity</p><p className="text-sm font-bold uppercase">{idea.company_type}</p></div>
            </div>
            
            <div>
               <label className="text-[10px] font-black uppercase text-slate-900 tracking-[0.3em] mb-4 block border-b border-slate-900 pb-1 w-fit">Brief Description</label>
               <p className="text-[16px] leading-relaxed text-slate-600 italic font-medium">"{shortDescription}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm"><label className="text-[10px] font-black uppercase text-slate-300 mb-3 block">Advantages</label><p className="text-xs font-bold text-slate-600">{idea.core_advantages}</p></div>
               <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm"><label className="text-[10px] font-black uppercase text-slate-300 mb-3 block">Target Market</label><p className="text-xs font-bold text-slate-600">{idea.target_market}</p></div>
               <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm"><label className="text-[10px] font-black uppercase text-slate-300 mb-3 block">Key Metrics</label><p className="text-xs font-bold text-slate-600">{idea.key_metrics}</p></div>
               <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm"><label className="text-[10px] font-black uppercase text-slate-300 mb-3 block">Event Goals</label><p className="text-xs font-bold text-slate-600">{idea.event_goals}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
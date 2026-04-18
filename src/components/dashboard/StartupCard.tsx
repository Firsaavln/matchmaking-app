'use client';

interface StartupCardProps {
  idea: any;
  role: string;
  onEdit: (idea: any) => void;
  onDelete: (id: number) => void;
  onViewDetail: (idea: any) => void;
}

export default function StartupCard({ idea, role, onEdit, onDelete, onViewDetail }: StartupCardProps) {
  return (
    <div className="group bg-white border border-slate-200 p-8 rounded-[32px] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-100 flex flex-col gap-6 relative">
      
      {/* KONTROL ADMIN (FOUNDER ONLY) */}
      {role === 'founder' && (
        <div className="absolute top-6 right-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => onEdit(idea)} 
            className="text-[10px] font-black text-slate-300 hover:text-slate-900 uppercase tracking-widest"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(idea.id)} 
            className="text-[10px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest"
          >
            Delete
          </button>
        </div>
      )}

      <div className="flex items-start gap-6">
        {/* LOGO SECTION - GRAYSCALE TO COLOR */}
        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shrink-0 shadow-inner">
          <img 
            src={idea.logo_url || 'https://via.placeholder.com/150'} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
            alt="Logo" 
          />
        </div>

        {/* IDENTITY SECTION */}
        <div className="flex-grow">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <h3 className="text-xl font-bold tracking-tighter text-slate-900 uppercase leading-none">
              {idea.startup_name}
            </h3>
            {/* BADGE JENIS PERUSAHAAN */}
            <span className="text-[7px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
              {idea.company_type || 'PT'}
            </span>
            {/* BADGE KATEGORI BISNIS */}
            <span className="text-[7px] font-black border border-slate-200 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              {idea.business_category || 'General'}
            </span>
          </div>
          
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight mb-2">
            {idea.tagline || "No Tagline Provided"}
          </h4>

          {/* METADATA: TAHUN & LOKASI */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
               <span className="text-[9px] font-black text-slate-300 uppercase italic">Est.</span>
               <span className="text-[10px] font-bold text-slate-600">{idea.founding_year}</span>
            </div>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
              {idea.location || 'Indonesia'}
            </span>
          </div>
        </div>
      </div>

      {/* DESCRIPTION SNIPPET */}
      <p className="text-[13px] text-slate-500 leading-relaxed font-medium italic line-clamp-2">
        "{idea.description}"
      </p>

      {/* FOOTER ACTION */}
      <div className="mt-auto pt-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* FOUNDER INFO */}
        <div className="flex items-center gap-3">
          <img 
            src={idea.founder_photo_url || 'https://via.placeholder.com/150'} 
            className="w-9 h-9 rounded-full border border-slate-100 grayscale group-hover:grayscale-0 transition-all object-cover shadow-sm" 
            alt="Founder" 
          />
          <span className="text-[11px] font-bold text-slate-900">{idea.founder_name || 'Founder'}</span>
        </div>

        {/* QUICK LINKS & BUTTON DETAIL */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex gap-4 border-r border-slate-100 pr-4 mr-2">
            {idea.pdf_url && (
              <a href={idea.pdf_url} target="_blank" className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
                Pitchdeck
              </a>
            )}
            {idea.social_link && (
              <a href={idea.social_link} target="_blank" className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
                Website
              </a>
            )}
          </div>

          <button 
            onClick={() => onViewDetail(idea)}
            className="flex-grow sm:flex-none bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
          >
            View Detail
          </button>
        </div>
      </div>
    </div>
  );
}
import { Eye, Edit, Trash2, Globe } from 'lucide-react';

export default function StartupCard({ idea, role, onEdit, onDelete, onViewDetail }: any) {
  // Batasi deskripsi di card depan maksimal 150 karakter
  const shortDesc = idea.description && idea.description.length > 150 
    ? idea.description.substring(0, 150) + '...' 
    : idea.description;

  return (
    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 relative group flex flex-col h-full">
      {/* Header: Logo, Title, Category, Link */}
      <div className="flex items-start gap-6 mb-5">
        <img src={idea.logo_url || 'https://via.placeholder.com/150'} alt="Logo" className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50 flex-shrink-0" />
        <div>
          <span className="text-[11px] font-black uppercase bg-slate-50 text-slate-400 px-3 py-1 rounded-full">{idea.business_category}</span>
          <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 mt-2 leading-tight">{idea.startup_name}</h3>
          
          {/* Link Website */}
          {idea.social_link && (
            <a href={idea.social_link.startsWith('http') ? idea.social_link : `https://${idea.social_link}`} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 mt-2 uppercase tracking-widest transition-colors w-fit">
              <Globe size={14} /> Visit Web
            </a>
          )}
        </div>
      </div>
      
      {/* Metadata Badges: City, Year, Entity */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-[11px] font-black uppercase border border-slate-100 text-slate-400 px-2 py-1 rounded-md">{idea.location}</span>
        <span className="text-[11px] font-black uppercase border border-slate-100 text-slate-400 px-2 py-1 rounded-md">{idea.founding_year}</span>
        <span className="text-[11px] font-black uppercase border border-slate-100 text-slate-400 px-2 py-1 rounded-md">{idea.company_type}</span>
      </div>

      {/* Tagline & Short Description (150 chars) */}
      <div className="flex-grow mb-8 space-y-3">
        <p className="text-[14px] font-black text-slate-900 uppercase tracking-widest">{idea.tagline}</p>
        <p className="text-xs font-medium text-slate-500 leading-relaxed italic">"{shortDesc}"</p>
      </div>
      
      {/* Footer: Founder Info & Actions */}
      <div className="flex justify-between items-center mt-auto pt-6 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <img src={idea.founder_photo_url || 'https://via.placeholder.com/50'} className="w-8 h-8 rounded-full object-cover" />
          <span className="text-[10px] font-black uppercase text-slate-400">{idea.founder_name}</span>
        </div>
        
        <div className="flex gap-2 relative z-20">
          <button onClick={() => onViewDetail(idea)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            <Eye size={16} />
          </button>
          
          {role?.toLowerCase() === 'founder' && (
            <>
              <button onClick={() => onEdit(idea)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Edit size={16} />
              </button>
              <button onClick={() => onDelete(idea.id)} className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
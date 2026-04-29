'use client';

import { useState } from 'react';
import { BarChart3, Briefcase, CheckCircle, Users as UsersIcon, Zap, Clock, Target, Loader2, MapPin } from 'lucide-react';
import AdminInsights from '@/components/admin/AdminInsights';
import AdminCatalog from '@/components/admin/AdminCatalog';
import AdminSchedules from '@/components/admin/AdminSchedules';
import AdminUsers from '@/components/admin/AdminUsers';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';         

interface AdminTabProps {
  ideas: any[];
  matches: any[];
  users: any[];
  refreshData: () => void;
  onEditIdea: (idea: any) => void;
  onUpdateStatus: (matchId: string, newStatus: string, matchData: any) => void; 
  onReschedule: (match: any) => void; 
}

export default function AdminTab({ onUpdateStatus, onReschedule, ...props }: AdminTabProps | any) {
  const [subTab, setSubTab] = useState<'insights' | 'users' | 'schedules' | 'catalog' | 'automatch'>('insights');
  
  const matches = props.matches || [];
  const confirmedMatches = matches.filter((m: any) => m.status === 'accepted');

  // ==========================================
  // JURUS PAMUNGKAS: HAPUS JADWAL ANTI NYANGKUT
  // ==========================================
  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Hapus jadwal ini secara permanen?')) return;
    
    const toastId = toast.loading('Menghapus data jadwal...');

    try {
      // 1. HAPUS ANAKNYA DULU (Schedules) BIAR DATABASE GAK ERROR
      await supabase.from('match_schedules').delete().eq('match_id', matchId);
      
      // 2. BARU HAPUS BAPAKNYA (Matches)
      const { error } = await supabase.from('matches').delete().eq('id', matchId);
      if (error) throw error;

      toast.success('Jadwal bersih terhapus!', { id: toastId });
      
      // 3. HARD REFRESH BROWSER (DIJAMIN 1000% UPDATE DI LAYAR)
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err: any) {
      toast.error('Gagal menghapus: ' + err.message, { id: toastId });
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-20">
      <div className="flex flex-wrap gap-4 bg-white p-2 rounded-[25px] w-fit border border-slate-100 shadow-sm">
        <TabButton active={subTab === 'insights'} onClick={() => setSubTab('insights')} icon={<BarChart3 size={14}/>} label="Insights" />
        <TabButton active={subTab === 'catalog'} onClick={() => setSubTab('catalog')} icon={<Briefcase size={14}/>} label={`Catalogs (${props.ideas?.length || 0})`} />
        <TabButton active={subTab === 'schedules'} onClick={() => setSubTab('schedules')} icon={<CheckCircle size={14}/>} label={`Schedules (${confirmedMatches.length})`} />
        <TabButton active={subTab === 'users'} onClick={() => setSubTab('users')} icon={<UsersIcon size={14}/>} label={`Users (${props.users?.length || 0})`} />
        
        {/* Garis pemisah disembunyikan di mobile biar ga aneh */}
        <div className="hidden md:block w-[1px] bg-slate-200 mx-2 my-2"></div>
        <button 
          onClick={() => setSubTab('automatch')} 
          className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${subTab === 'automatch' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
        >
          <Zap size={14}/> Auto-Match AI
        </button>
      </div>

      {subTab === 'insights' && <AdminInsights onUpdateStatus={onUpdateStatus} {...props} />}
      {subTab === 'catalog' && <AdminCatalog onUpdateStatus={onUpdateStatus} {...props} />}
      
      {subTab === 'schedules' && (
        <AdminSchedules 
          confirmedMatches={confirmedMatches} 
          onUpdateStatus={onUpdateStatus} 
          onDeleteMatch={handleDeleteMatch}
          onReschedule={onReschedule}
          {...props} 
        />
      )}
      
      {subTab === 'users' && <AdminUsers onUpdateStatus={onUpdateStatus} {...props} />}

      {subTab === 'automatch' && (
        <AdminAutoMatch 
          ideas={props.ideas} 
          users={props.users} 
          matches={props.matches} 
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
      {icon} {label}
    </button>
  );
}

function AdminAutoMatch({ ideas, users, matches }: { ideas: any[], users: any[], matches: any[] }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const calculateMatchScore = (startup: any, prefs: any) => {
    if (!prefs) return 0;
    let score = 0;
    if (prefs.sectors?.includes(startup.business_category)) score += 45;
    if (prefs.markets?.includes(startup.target_market)) score += 35;

    const currentYear = new Date().getFullYear();
    const age = currentYear - (parseInt(startup.founding_year) || currentYear);
    if (prefs.stage === 'Early' && age <= 2) score += 20;
    else if (prefs.stage === 'Mature' && age > 2) score += 20;
    return score;
  };

  const investors = users?.filter((u: any) => u.role === 'investor') || [];
  const timeSlots = ['13:00 WIB', '13:15 WIB', '13:30 WIB'];

  const generatedList = investors.map(investor => {
    const prefs = {
      sectors: investor.interested_sectors || [],
      markets: investor.target_market_pref || [],
      stage: investor.preferred_stage || 'Early'
    };

    const matchedFounderIds = matches
      .filter((m: any) => m.investor_id === investor.id)
      .map((m: any) => m.founder_id);

    const availableIdeas = ideas.filter(idea => !matchedFounderIds.includes(idea.founder_id));

    const suggestions = availableIdeas
      .map(idea => ({ ...idea, score: calculateMatchScore(idea, prefs) }))
      .filter(idea => idea.score > 0) 
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((idea, index) => ({
        ...idea,
        suggestedTime: timeSlots[index] || '14:00 WIB',
        suggestedTable: Math.floor(Math.random() * 5) + 1 
      }));

    return { investor, suggestions };
  }).filter(res => res.suggestions.length > 0); 

  // ==========================================
  // JURUS PAMUNGKAS: BUAT JADWAL AI
  // ==========================================
  const handleConfirmMatch = async (investor: any, idea: any) => {
    setIsProcessing(idea.id);
    const toastId = toast.loading('Membuat jadwal & mengirim notifikasi...');
    
    try {
      const founder = users.find(u => u.id === idea.founder_id);
      
      const { data: newMatch, error: matchError } = await supabase.from('matches').insert({
        investor_id: investor.id,
        founder_id: idea.founder_id,
        idea_id: idea.id,
        status: 'accepted'
      }).select().single();

      if (matchError) throw matchError;

      const meetingDate = new Date().toISOString().split('T')[0];
      const { error: scheduleError } = await supabase.from('match_schedules').insert({
        match_id: newMatch.id,
        meeting_date: meetingDate,
        start_time: idea.suggestedTime.replace(' WIB', ''),
        table_number: idea.suggestedTable.toString()
      });

      if (scheduleError) throw scheduleError;

      await fetch('/api/send-match-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: newMatch.id,
          investorEmail: investor.email,
          founderEmail: founder?.email || 'TBA',
          investorPhone: investor.phone_number || 'TBA', 
          founderPhone: founder?.phone_number || 'TBA',   
          startupName: idea.startup_name,
          date: meetingDate,
          time: idea.suggestedTime,
          table: idea.suggestedTable.toString(),
        }),
      });

      toast.success(`Jadwal dibuat!`, { id: toastId });
      
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err: any) {
      toast.error('Gagal membuat jadwal: ' + err.message, { id: toastId });
      setIsProcessing(null);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[35px] p-6 md:p-12 shadow-sm animate-in zoom-in-95 duration-500">
      
      {/* HEADER RESPONSIVE */}
      <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-4 mb-8 border-b border-slate-100 pb-8">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shrink-0">
          <Zap size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">AI Matchmaker <span className="text-indigo-600">Pro</span></h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Saran Jadwal Otomatis Berdasarkan Algoritma</p>
        </div>
      </div>

      {generatedList.length === 0 ? (
        <div className="text-center py-20">
          <Target size={40} className="mx-auto text-slate-200 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Belum ada saran jadwal yang cocok.<br/>(Mungkin data preferensi investor kosong atau semua ide sudah di-match)</p>
        </div>
      ) : (
        <div className="space-y-8">
          {generatedList.map((data, index) => (
            <div key={index} className="bg-slate-50 border border-slate-200 p-5 md:p-6 rounded-[24px]">
              
              {/* INVESTOR INFO RESPONSIVE */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                <div className="w-full md:w-auto overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-1">Rekomendasi Untuk:</p>
                  <h3 className="text-lg font-black text-slate-900 truncate w-full">{data.investor.email}</h3>
                </div>
                <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md shadow-indigo-200 self-start md:self-auto shrink-0">
                  {data.suggestions.length} Match Found
                </div>
              </div>

              {/* GRID KARTU STARTUP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.suggestions.map((idea, i) => (
                  <div key={i} className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    
                    <div>
                      <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 text-[11px] font-black px-3 py-1.5 rounded-bl-[16px] uppercase tracking-widest">
                        🔥 {idea.score}%
                      </div>
                      
                      {/* JAM & MEJA RESPONSIVE */}
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3 mt-1 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-indigo-500" />
                          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-700">{idea.suggestedTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-emerald-500" />
                          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-700">Meja {idea.suggestedTable}</span>
                        </div>
                      </div>

                      <h4 className="font-black text-sm text-slate-900 leading-tight mb-1 line-clamp-2">{idea.startup_name}</h4>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mb-4">{idea.business_category} • {idea.target_market}</p>
                    </div>

                    <button 
                      onClick={() => handleConfirmMatch(data.investor, idea)}
                      disabled={isProcessing === idea.id}
                      className="w-full bg-slate-900 text-white text-[10px] font-black uppercase py-3 md:py-2.5 rounded-xl hover:bg-indigo-600 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing === idea.id ? <><Loader2 size={14} className="animate-spin" /> Memproses...</> : 'Konfirmasi Jadwal'}
                    </button>
                    
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
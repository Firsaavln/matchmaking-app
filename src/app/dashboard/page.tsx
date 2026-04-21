'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Komponen
import Navbar from '@/components/dashboard/Navbar';
import IdeaForm from '@/components/dashboard/IdeaForm';
import CatalogTab from '@/components/dashboard/CatalogTab';
import MatchesTab from '@/components/dashboard/MatchesTab';

// Modals
import DetailModal from '@/components/modals/DetailModal';
import ScheduleModal from '@/components/modals/ScheduleModal';

export default function Dashboard() {
  const router = useRouter();
  
  // 1. STATE MANAGEMENT
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'matches'>('catalog');
  const [uInfo, setUInfo] = useState({ email: '', id: '', role: '' });
  
  const [ideas, setIdeas] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  
  // UI & Form States
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<any | null>(null);
  
  // Modal & Flow States
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  
  // Untuk Negosiasi Jadwal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [matchType, setMatchType] = useState<'new_request' | 'reschedule'>('new_request');

  // 2. AUTH & FETCH
  useEffect(() => {
    const initSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return router.replace('/');
      }
      
      const role = user.user_metadata?.role || 'founder';
      const info = { email: user.email!, id: user.id, role: role };
      setUInfo(info);
      await fetchData(info.id, role);
      setLoading(false);
    };
    initSession();
  }, [router]);

  async function fetchData(uid: string, urole: string) {
    try {
      // A. Tarik Data Katalog
      let ideaQuery = supabase.from('creative_ideas').select('*');
      if (urole?.toLowerCase() === 'founder') {
        ideaQuery = ideaQuery.eq('founder_id', uid);
      }
      const { data: ideaData } = await ideaQuery.order('created_at', { ascending: false });
      if (ideaData) setIdeas(ideaData);

      // B. Tarik Data Matches beserta Jadwalnya
      let matchQuery = supabase.from('matches').select('*, creative_ideas(startup_name), match_schedules(*)');
      if (urole?.toLowerCase() === 'founder') {
        matchQuery = matchQuery.eq('founder_id', uid);
      } else {
        matchQuery = matchQuery.eq('investor_id', uid);
      }
      
      const { data: matchData } = await matchQuery.order('created_at', { ascending: false });
      if (matchData) setMatches(matchData);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center font-black animate-pulse text-slate-900 tracking-[0.5em] uppercase">Membangun Ekosistem...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Navbar email={uInfo.email} />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Ekosistem Hub</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{uInfo.role} Access Mode</p>
          </div>
          {uInfo.role?.toLowerCase() === 'founder' && (
            <button 
              onClick={() => { setShowForm(!showForm); setEditingIdea(null); }} 
              className="bg-slate-900 text-white text-[11px] font-black uppercase px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all"
            >
              {showForm ? 'Batalkan Form' : 'Add Catalog'}
            </button>
          )}
        </header>

        {/* TAB NAVIGATION */}
        <div className="flex gap-8 mb-12 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('catalog')} 
            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'catalog' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
          >
            Startup Catalog
          </button>
          <button 
            onClick={() => setActiveTab('matches')} 
            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'matches' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
          >
            Matches/Negosiasi ({matches.length})
          </button>
        </div>

        {/* AREA FORM FOUNDER */}
        {showForm && uInfo.role?.toLowerCase() === 'founder' && (
          <IdeaForm 
            uInfo={uInfo} 
            editingIdea={editingIdea} 
            onSuccess={() => { setShowForm(false); fetchData(uInfo.id, uInfo.role); }} 
            onCancel={() => setShowForm(false)} 
          />
        )}

        {/* RENDER KONTEN BERDASARKAN TAB */}
        {activeTab === 'catalog' ? (
          <CatalogTab 
             ideas={ideas} 
             uInfo={uInfo} 
             refreshData={() => fetchData(uInfo.id, uInfo.role)}
             onEdit={(idea) => { setEditingIdea(idea); setShowForm(true); }}
             onViewDetail={(idea) => {
                // Logic: Jika yg diklik dari Card adalah "Request Match", buka modal jadwal
                if(idea.openMatchModal) {
                  setSelectedIdea(idea);
                  setMatchType('new_request');
                  setShowScheduleModal(true);
                } else {
                  setSelectedIdea(idea); // Jika cuma mau liat detail biasa
                }
             }}
          />
        ) : (
          <MatchesTab 
             matches={matches} 
             uInfo={uInfo} 
             refreshData={() => fetchData(uInfo.id, uInfo.role)}
             onReschedule={(match) => {
                setSelectedMatch(match);
                setMatchType('reschedule');
                setShowScheduleModal(true);
             }}
          />
        )}
      </main>

      {/* --- RENDER MODALS --- */}
      
      {/* 1. Modal Detail Catalog */}
      <DetailModal 
        idea={selectedIdea && !showScheduleModal ? selectedIdea : null} 
        onClose={() => setSelectedIdea(null)} 
      />
      
      {/* 2. Modal Penjadwalan & Negosiasi */}
      {showScheduleModal && (
         <ScheduleModal 
            uInfo={uInfo}
            match={selectedMatch}
            idea={selectedIdea}
            type={matchType}
            onClose={() => { 
              setShowScheduleModal(false); 
              setSelectedMatch(null); 
              setSelectedIdea(null);
            }} 
            onSuccess={() => fetchData(uInfo.id, uInfo.role)} 
         />
      )}

    </div>
  );
}
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// ================= KOMPONEN UTAMA =================
import Navbar from '@/components/dashboard/Navbar';
import AdminTab from '@/components/dashboard/AdminTab'; // Tab Utama Admin
import CatalogTab from '@/components/dashboard/CatalogTab';
import MatchesTab from '@/components/dashboard/MatchesTab';
import IdeaForm from '@/components/dashboard/IdeaForm';
import DetailModal from '@/components/modals/DetailModal';
import ScheduleModal from '@/components/modals/ScheduleModal';
import Footer from '@/components/dashboard/Footer';

export default function DashboardPage() {
  const router = useRouter();
  
  // 1. STATE MANAGEMENT
  const [loading, setLoading] = useState(true);
  const [uInfo, setUInfo] = useState({ id: '', email: '', role: '' });
  const [activeTab, setActiveTab] = useState<'catalog' | 'matches' | 'admin'>('catalog');
  
  const [ideas, setIdeas] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<any | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [matchType, setMatchType] = useState<'new_request' | 'reschedule'>('new_request');

  // 2. FETCH DATA (Kunci Utama Sinkronisasi)
  const fetchData = useCallback(async (uid: string, role: string) => {
    try {
      const matchQueryString = `
        *, 
        investor:profiles!matches_investor_id_fkey(email),
        creative_ideas(startup_name, founder_name), 
        match_schedules(*)
      `;

      if (role === 'admin') {
        const [resIdeas, resMatches, resUsers] = await Promise.all([
          supabase.from('creative_ideas').select('*').order('created_at', { ascending: false }),
          supabase.from('matches').select(matchQueryString).order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').order('created_at', { ascending: false })
        ]);
        setIdeas(resIdeas.data || []);
        setMatches(resMatches.data || []);
        setUsers(resUsers.data || []);
      } else {
        let ideaQuery = supabase.from('creative_ideas').select('*');
        if (role === 'founder') ideaQuery = ideaQuery.eq('founder_id', uid);
        const { data: i } = await ideaQuery.order('created_at', { ascending: false });
        setIdeas(i || []);

        let matchQuery = supabase.from('matches').select(matchQueryString);
        if (role === 'founder') matchQuery = matchQuery.eq('founder_id', uid);
        else matchQuery = matchQuery.eq('investor_id', uid);
        const { data: m } = await matchQuery.order('created_at', { ascending: false });
        setMatches(m || []);
      }
    } catch (err) {
      console.error("Fetch Data Error:", err);
    }
  }, []);

  // 3. INITIAL SESSION & AUTH
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.replace('/');
          return;
        }

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

        if (!profile) {
          await supabase.from('profiles').insert({ id: user.id, email: user.email, role: 'founder' });
          window.location.reload();
          return;
        }

        const role = profile.role || 'founder';
        setUInfo({ id: user.id, email: user.email!, role: role });
        if (role === 'admin') setActiveTab('admin');
        await fetchData(user.id, role);
      } catch (err) {
        router.replace('/');
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, [router, fetchData]);

  // 4. HANDLERS (Jembatan ke AdminTab & CatalogTab)
  const handleEditIdea = (idea: any) => {
    setEditingIdea(idea);
    setShowForm(true);
    // Scroll ke atas biar form-nya keliatan
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMatchRequest = (idea: any) => {
    setMatchType('new_request');
    setSelectedIdea(idea);
    setShowScheduleModal(true);
  };

  const handleReschedule = (match: any) => {
    setMatchType('reschedule');
    setSelectedMatch(match);
    setShowScheduleModal(true);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-900 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Menghubungkan...</p>
      </div>
    );
  }

  return (
    // Penambahan class flex dan flex-col di sini
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <Navbar email={uInfo.email} />
      
      {/* Penambahan class w-full dan flex-grow di sini */}
      <main className="max-w-6xl mx-auto w-full px-6 py-12 flex-grow">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">Dashboard Control</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              Status Akses: <span className={`px-2 py-0.5 rounded-md ${uInfo.role === 'admin' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>{uInfo.role}</span>
            </p>
          </div>
        {/* Tombol HANYA muncul untuk role founder, Admin pakai tombol di dalam Catalog Master */}
        {uInfo.role === 'founder' && (
          <button 
            onClick={() => { setShowForm(!showForm); setEditingIdea(null); }} 
            className="bg-slate-900 text-white text-[11px] font-black uppercase px-8 py-4 rounded-2xl shadow-xl hover:bg-indigo-600 active:scale-95 transition-all"
          >
            {showForm ? 'Batal' : 'Tambah Katalog'}
          </button>
        )}
        </header>

        {/* TAB SWITCHER */}
        <div className="flex gap-10 mb-10 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {uInfo.role === 'admin' && (
            <button onClick={() => setActiveTab('admin')} className={`pb-4 text-[10px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'admin' ? 'border-b-4 border-slate-900 text-slate-900' : 'text-slate-300'}`}>Admin Center</button>
          )}
          <button onClick={() => setActiveTab('catalog')} className={`pb-4 text-[10px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'catalog' ? 'border-b-4 border-slate-900 text-slate-900' : 'text-slate-300'}`}>Startup Catalog</button>
          <button onClick={() => setActiveTab('matches')} className={`pb-4 text-[10px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'matches' ? 'border-b-4 border-slate-900 text-slate-900' : 'text-slate-300'}`}>Matches ({matches.length})</button>
        </div>

        {/* FORM INPUT STARTUP */}
        {showForm && (
          <IdeaForm 
            uInfo={uInfo} 
            editingIdea={editingIdea} 
            onSuccess={() => { setShowForm(false); fetchData(uInfo.id, uInfo.role); }} 
            onCancel={() => setShowForm(false)} 
          />
        )}
        
        {/* TAB CONTENTS RENDERING */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'admin' && uInfo.role === 'admin' && (
            <AdminTab 
              ideas={ideas} 
              matches={matches} 
              users={users} 
              refreshData={() => fetchData(uInfo.id, uInfo.role)}
              onEditIdea={handleEditIdea} // <--- INI KUNCINYA BRE!
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogTab 
              ideas={ideas} 
              uInfo={uInfo} 
              refreshData={() => fetchData(uInfo.id, uInfo.role)}
              onEdit={handleEditIdea}
              onViewDetail={(idea: any) => setSelectedIdea(idea)}
              onMatchRequest={handleMatchRequest}
            />
          )}

          {activeTab === 'matches' && (
            <MatchesTab 
              matches={matches} 
              uInfo={uInfo} 
              refreshData={() => fetchData(uInfo.id, uInfo.role)}
              onReschedule={handleReschedule}
            />
          )}
        </div>
      </main>

      {/* PANGGIL FOOTER DI SINI */}
      <Footer />

      {/* ================= MODALS ================= */}
      {selectedIdea && !showScheduleModal && (
        <DetailModal idea={selectedIdea} onClose={() => setSelectedIdea(null)} />
      )}

      {showScheduleModal && (
        <ScheduleModal 
          uInfo={uInfo} type={matchType} idea={selectedIdea} match={selectedMatch}
          onClose={() => { setShowScheduleModal(false); setSelectedIdea(null); setSelectedMatch(null); }}
          onSuccess={() => { setShowScheduleModal(false); setSelectedIdea(null); setSelectedMatch(null); fetchData(uInfo.id, uInfo.role); }}
        />
      )}
    </div>
  );
}
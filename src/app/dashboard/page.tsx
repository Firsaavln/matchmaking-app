'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, PieChart } from 'lucide-react';
import { toast } from 'sonner';

// ================= KOMPONEN UTAMA =================
import Navbar from '@/components/dashboard/Navbar';
import AdminTab from '@/components/dashboard/AdminTab'; 
import CatalogTab from '@/components/dashboard/CatalogTab';
import MatchesTab from '@/components/dashboard/MatchesTab';
import IdeaForm from '@/components/dashboard/IdeaForm';
import DetailModal from '@/components/modals/DetailModal';
import ScheduleModal from '@/components/modals/ScheduleModal';
import ProfileModal from '@/components/modals/ProfileModal'; // <-- IMPORT BARU: Profile Modal
import Footer from '@/components/dashboard/Footer';
import InsightsTab from '@/components/dashboard/InsightsTab';

export default function DashboardPage() {
  const router = useRouter();
  
  // 1. STATE MANAGEMENT (DITAMBAHKAN STATE PREFERENCES UNTUK ALGORITMA)
  const [loading, setLoading] = useState(true);
  const [uInfo, setUInfo] = useState({ 
    id: '', 
    email: '', 
    role: '',
    preferences: null as any
  });
  
  const [activeTab, setActiveTab] = useState<'catalog' | 'matches' | 'admin' | 'insights'>('insights');
  
  const [ideas, setIdeas] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // STATE UNTUK DATA GLOBAL (DIBUTUHKAN OLEH INSIGHTS TAB)
  const [globalData, setGlobalData] = useState<{ ideas: any[], matches: any[], profiles: any[] }>({ 
    ideas: [], 
    matches: [], 
    profiles: [] 
  });

  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<any | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); // <-- STATE BARU: Profile Modal
  const [matchType, setMatchType] = useState<'new_request' | 'reschedule'>('new_request');

  // 2. FETCH DATA (Kunci Utama Sinkronisasi)
  const fetchData = useCallback(async (uid: string, role: string) => {
    try {
      // 1. AMBIL DATA GLOBAL UNTUK STATISTIK / INSIGHTS (Pakai select('*') biar aman dari beda nama kolom)
      const [gIdeas, gMatches, gProfiles] = await Promise.all([
        supabase.from('creative_ideas').select('*'),
        supabase.from('matches').select('status'),
        supabase.from('profiles').select('role')
      ]);
      
      setGlobalData({ 
        ideas: gIdeas.data || [], 
        matches: gMatches.data || [], 
        profiles: gProfiles.data || [] 
      });

      // 2. AMBIL DATA SPESIFIK UNTUK TAB MATCHES & CATALOG
      const matchQueryString = `
        *, 
        investor:profiles!matches_investor_id_fkey(email, phone_number),
        founder:profiles!matches_founder_id_fkey(email, phone_number),
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
        
        setUInfo({ 
          id: user.id, 
          email: user.email!, 
          role: role,
          preferences: {
            sectors: profile.interested_sectors || [],
            markets: profile.target_market_pref || [],
            stage: profile.preferred_stage || 'Early'
          }
        });
        
        // Admin default ke admin tab, selain itu ke insights
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

  // ================= 4. HANDLERS (UPDATE STATUS & EMAIL) =================
  
  const handleStatusUpdate = async (matchId: string, newStatus: string, matchData: any) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: newStatus })
        .eq('id', matchId);

      if (error) throw error;

      if (newStatus === 'accepted') {
        const schedule = matchData.match_schedules?.[0] || {};
        
        console.log("Cek Payload ke Backend:", {
          matchId: matchId,
          investorPhone: matchData.investor?.phone_number,
          founderPhone: matchData.founder?.phone_number
        });

        fetch('/api/send-match-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchId: matchId,
            investorEmail: matchData.investor?.email,
            founderEmail: matchData.founder?.email || uInfo.email,
            investorPhone: matchData.investor?.phone_number || 'TBA', 
            founderPhone: matchData.founder?.phone_number || 'TBA',   
            startupName: matchData.creative_ideas?.startup_name || 'Startup',
            date: schedule.meeting_date || 'TBA',
            time: schedule.start_time || 'TBA',
            table: schedule.table_number || 'TBA',
          }),
        }).catch(err => console.error("Email/WA Error:", err));

        toast.success('🤝 Deal! Notifikasi email & WA terkirim ke kedua pihak.');
      } else {
        toast.success(`Status diperbarui ke: ${newStatus}`);
      }

      fetchData(uInfo.id, uInfo.role); 
    } catch (err: any) {
      toast.error('Gagal update status: ' + err.message);
    }
  };

  const handleEditIdea = (idea: any) => {
    setEditingIdea(idea);
    setShowForm(true);
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
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <Navbar email={uInfo.email} />
      
      <main className="max-w-6xl mx-auto w-full px-6 py-12 flex-grow">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">Dashboard Control</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              Status Akses: <span className={`px-2 py-0.5 rounded-md ${uInfo.role === 'admin' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>{uInfo.role}</span>
            </p>
          </div>
          
          {/* WRAPPER TOMBOL (FOUDER & INVESTOR) */}
          <div className="flex gap-3">
            {uInfo.role === 'founder' && (
              <button 
                onClick={() => { setShowForm(!showForm); setEditingIdea(null); }} 
                className="bg-slate-900 text-white text-[11px] font-black uppercase px-8 py-4 rounded-2xl shadow-xl hover:bg-indigo-600 active:scale-95 transition-all"
              >
                {showForm ? 'Batal' : 'Tambah Katalog'}
              </button>
            )}
            
            {/* <-- TOMBOL INVESTOR BARU DISINI --> */}
            {uInfo.role === 'investor' && (
              <button 
                onClick={() => setShowProfileModal(true)} 
                className="bg-indigo-600 text-white text-[11px] font-black uppercase px-8 py-4 rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
              >
                Atur Preferensi Match
              </button>
            )}
          </div>
        </header>

        {/* TAB SWITCHER */}
        <div className="flex gap-10 mb-10 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {uInfo.role === 'admin' && (
            <button onClick={() => setActiveTab('admin')} className={`pb-4 text-[10px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'admin' ? 'border-b-4 border-slate-900 text-slate-900' : 'text-slate-300'}`}>Admin Center</button>
          )}
          
          <button onClick={() => setActiveTab('insights')} className={`pb-4 text-[10px] font-black flex items-center gap-2 uppercase whitespace-nowrap transition-all ${activeTab === 'insights' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-slate-300'}`}>
            <PieChart size={14} /> Market Insights
          </button>

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
          
          {/* TAB INSIGHTS UNTUK SEMUA ROLE */}
          {activeTab === 'insights' && (
            <InsightsTab data={globalData} />
          )}

          {activeTab === 'admin' && uInfo.role === 'admin' && (
            <AdminTab 
              ideas={ideas} 
              matches={matches} 
              users={users} 
              refreshData={() => fetchData(uInfo.id, uInfo.role)}
              onEditIdea={handleEditIdea}
              onUpdateStatus={handleStatusUpdate}
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
              onUpdateStatus={handleStatusUpdate}
            />
          )}
        </div>
      </main>

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

      {/* <-- MODAL PREFERENSI INVESTOR BARU DISINI --> */}
      {showProfileModal && (
        <ProfileModal 
          uInfo={uInfo}
          onClose={() => setShowProfileModal(false)}
          onSuccess={() => {
            setShowProfileModal(false);
            window.location.reload(); 
          }}
        />
      )}
    </div>
  );
}
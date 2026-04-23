'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { 
  Download, ShieldAlert, Trash2, PieChart as PieIcon, 
  Users as UsersIcon, BarChart3, CheckCircle, Calendar, 
  Clock, Coffee, Mail, MapPin, Target, Landmark, Plus, Edit3, Briefcase, X
} from 'lucide-react';

export default function AdminTab({ ideas = [], matches = [], users = [], refreshData, onEditIdea }: any) {
  const [subTab, setSubTab] = useState<'insights' | 'users' | 'schedules' | 'catalog'>('insights');
  
  // State Modal User (Tambah & Edit)
  const [showUserModal, setShowUserModal] = useState(false);
  const [isUserEditMode, setIsUserEditMode] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({ email: '', password: 'qwerty@098', role: 'founder' });

  // --- LOGIKA EXPORT CSV ---
  const exportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return toast.error('Data kosong!');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- ACTIONS: USER CRUD ---
  const openAddUser = () => {
    setIsUserEditMode(false);
    setUserFormData({ email: '', password: 'qwerty@098', role: 'founder' });
    setShowUserModal(true);
  };

  const openEditUser = (u: any) => {
    setIsUserEditMode(true);
    setTargetUserId(u.id);
    setUserFormData({ email: u.email, password: '', role: u.role });
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isUserEditMode) {
        const { error } = await supabase.rpc('update_user_admin', {
          target_user_id: targetUserId,
          new_email: userFormData.email,
          new_role: userFormData.role
        });
        if (error) throw error;
        toast.success("Data user diperbarui!");
      } else {
        const { error } = await supabase.rpc('create_user_admin', {
          user_email: userFormData.email,
          user_password: userFormData.password,
          user_role: userFormData.role
        });
        if (error) throw error;
        toast.success("User baru berhasil dibuat!");
      }
      setShowUserModal(false);
      refreshData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async (targetId: string) => {
    if (!confirm('Hapus user dan semua data terkait?')) return;
    const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: targetId });
    if (error) toast.error("Gagal menghapus: " + error.message);
    else { toast.success("User berhasil dihapus"); refreshData(); }
  };

  // --- ACTIONS: CATALOG CRUD ---
  const handleDeleteIdea = async (id: number) => {
    if (!confirm('Hapus katalog ini secara permanen?')) return;
    const { error } = await supabase.from('creative_ideas').delete().eq('id', id);
    if (!error) { toast.success('Katalog dihapus'); refreshData(); }
  };

  // --- DATA PROCESSING ANALYTICS ---
  const sectorStats = Array.from(new Set(ideas.map((i: any) => i.business_category || 'Lainnya')))
    .map(cat => ({ name: String(cat), total: ideas.filter((i: any) => i.business_category === cat).length }))
    .sort((a, b) => b.total - a.total);

  const matchStats = [
    { name: 'Pending', value: matches.filter((m: any) => m.status === 'pending').length, color: '#94a3b8' },
    { name: 'Nego', value: matches.filter((m: any) => m.status === 'negotiating').length, color: '#6366f1' },
    { name: 'Deal', value: matches.filter((m: any) => m.status === 'accepted').length, color: '#10b981' },
  ].filter(item => item.value > 0);

  const locStats = Array.from(new Set(ideas.map((i: any) => i.location || 'Lainnya')))
    .map(loc => ({ name: String(loc), total: ideas.filter((i: any) => i.location === loc).length }))
    .sort((a, b) => b.total - a.total).slice(0, 5);

  const yearStats = Array.from(new Set(ideas.map((i: any) => i.founding_year || 'N/A')))
    .map(yr => ({
      name: String(yr),
      total: ideas.filter((i: any) => String(i.founding_year || 'N/A') === String(yr)).length
    })).sort((a, b) => {
      if (a.name === 'N/A') return 1;
      if (b.name === 'N/A') return -1;
      return parseInt(a.name) - parseInt(b.name);
    });

  const goalStats = Array.from(new Set(ideas.map((i: any) => i.event_goals || 'Lainnya')))
    .map(goal => ({ name: String(goal), total: ideas.filter((i: any) => i.event_goals === goal).length }))
    .sort((a, b) => b.total - a.total);

  const confirmedMatches = matches.filter((m: any) => m.status === 'accepted');

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-20">
      
      {/* PREMIUM SWITCHER */}
      <div className="flex flex-wrap gap-4 bg-white p-2 rounded-[25px] w-fit border border-slate-100 shadow-sm">
        <button onClick={() => setSubTab('insights')} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${subTab === 'insights' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Insights</button>
        <button onClick={() => setSubTab('catalog')} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${subTab === 'catalog' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Catalog Manager</button>
        <button onClick={() => setSubTab('schedules')} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${subTab === 'schedules' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Schedules</button>
        <button onClick={() => setSubTab('users')} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${subTab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Users</button>
      </div>

      {/* 1. INSIGHTS TAB */}
      {subTab === 'insights' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Startups', val: ideas.length, data: ideas, file: 'startups', color: 'text-slate-900' },
              { label: 'Matches', val: matches.length, data: matches, file: 'matches', color: 'text-indigo-600' },
              { label: 'Users', val: users.length, data: users, file: 'users', color: 'text-emerald-600' }
            ].map((card, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                <h3 className={`text-5xl font-black mt-2 ${card.color}`}>{card.val}</h3>
                <button onClick={() => exportCSV(card.data, `data_${card.file}`)} className="mt-4 text-[9px] font-black text-indigo-500 uppercase flex items-center gap-1">
                  <Download size={12}/> CSV
                </button>
              </div>
            ))}
          </div>

          {/* Charts Row 1: Sektor (Horizontal) & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[50px] border h-[450px] flex flex-col">
              <h4 className="text-[11px] font-black uppercase text-slate-900 mb-8 tracking-widest">Sektor Bisnis</h4>
              <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorStats} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" fontSize={10} fontWeight="900" width={100} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none'}} />
                    <Bar dataKey="total" fill="#0f172a" radius={[0, 10, 10, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-10 rounded-[50px] border h-[450px] flex flex-col">
              <h4 className="text-[11px] font-black uppercase text-slate-900 mb-8 tracking-widest text-center">Status Match</h4>
              <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={matchStats} innerRadius={70} outerRadius={110} paddingAngle={8} dataKey="value">
                      {matchStats.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Domisili (Red) & Tahun (Amber) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[50px] border h-[450px] flex flex-col">
              <h4 className="text-[11px] font-black uppercase text-slate-900 mb-8 tracking-widest">Top 5 Domisili</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locStats}>
                  <XAxis dataKey="name" fontSize={9} fontWeight="900" axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                  <Bar dataKey="total" fill="#ef4444" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-10 rounded-[50px] border h-[450px] flex flex-col">
              <h4 className="text-[11px] font-black uppercase text-slate-900 mb-8 tracking-widest">Tren Tahun Pendirian</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearStats}>
                  <XAxis dataKey="name" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                  <Bar dataKey="total" fill="#f59e0b" radius={[10, 10, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 3: Goals (Indigo) */}
          <div className="bg-white p-10 rounded-[50px] border h-[400px] flex flex-col">
            <h4 className="text-[11px] font-black uppercase text-slate-900 mb-8 tracking-widest">Analisis Tujuan Event</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalStats}>
                <XAxis dataKey="name" fontSize={9} fontWeight="900" axisLine={false} tickLine={false} />
                <YAxis fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                <Bar dataKey="total" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. CATALOG MANAGER (Full CRUD) */}
      {subTab === 'catalog' && (
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-10 border-b flex justify-between items-center bg-slate-50/30">
            <div>
              <h4 className="text-2xl font-black uppercase text-slate-900">Catalog Manager</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Admin Full CRUD Access</p>
            </div>
            <button onClick={() => onEditIdea(null)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2"><Plus size={14}/> Add Startup</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
                <tr><th className="px-10 py-6">Startup</th><th className="px-10 py-6">Category</th><th className="px-10 py-6 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ideas.map((i: any) => (
                  <tr key={i.id} className="hover:bg-slate-50/50">
                    <td className="px-10 py-6 font-bold text-slate-900">{i.startup_name}</td>
                    <td className="px-10 py-6 text-xs font-black text-slate-400 uppercase">{i.business_category}</td>
                    <td className="px-10 py-6 flex justify-end gap-3">
                      <button onClick={() => onEditIdea(i)} className="p-3 text-slate-400 hover:text-indigo-600 border rounded-2xl"><Edit3 size={16} /></button>
                      <button onClick={() => handleDeleteIdea(i.id)} className="p-3 text-slate-400 hover:text-red-600 border rounded-2xl"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MASTER SCHEDULE TAB */}
      {subTab === 'schedules' && (
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-10 border-b flex justify-between items-center bg-slate-50/30">
            <h4 className="text-2xl font-black uppercase text-slate-900">Master Schedule</h4>
            <button onClick={() => exportCSV(confirmedMatches, 'master_schedule')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2"><Download size={14} /> Export CSV</button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
                <tr><th className="px-10 py-6">Investor</th><th className="px-10 py-6">Startup</th><th className="px-10 py-6 text-center">Meja</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {confirmedMatches.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="px-10 py-6 text-xs font-bold text-slate-700">{m.investor?.email}</td>
                    <td className="px-10 py-6 text-xs font-black uppercase text-slate-900">{m.creative_ideas?.startup_name}</td>
                    <td className="px-10 py-6 text-center"><span className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl">#{m.match_schedules?.[0]?.table_number || 'TBA'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. USER MANAGEMENT (Full CRUD) */}
      {subTab === 'users' && (
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-10 border-b flex justify-between items-center bg-slate-50/30">
            <div><h4 className="text-2xl font-black uppercase text-slate-900">User Control</h4><p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Manage Access Roles</p></div>
            <button onClick={openAddUser} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-100"><Plus size={14}/> Add User</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
                <tr><th className="px-10 py-6">Email User</th><th className="px-10 py-6">Role</th><th className="px-10 py-6 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-10 py-6 text-sm font-bold text-slate-900">{u.email}</td>
                    <td className="px-10 py-6"><span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full ${u.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>{u.role}</span></td>
                    <td className="px-10 py-6 flex justify-end gap-3">
                      <button onClick={() => openEditUser(u)} className="p-3 text-slate-400 hover:text-indigo-600 border rounded-2xl" title="Edit User"><Edit3 size={18} /></button>
                      <button onClick={() => handleDeleteUser(u.id)} className="p-3 text-slate-400 hover:text-red-600 border rounded-2xl" title="Delete User"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL USER (TAMBAH & EDIT) */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl animate-in zoom-in-95 relative">
            <button onClick={() => setShowUserModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={20}/></button>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">{isUserEditMode ? 'Edit Access' : 'Create User'}</h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <input required type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Email Address" />
              {!isUserEditMode && (
                <input required type="text" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Password" />
              )}
              <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none font-bold cursor-pointer">
                <option value="founder">Founder</option>
                <option value="investor">Investor</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl mt-4">
                {isUserEditMode ? 'Update Account' : 'Confirm & Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
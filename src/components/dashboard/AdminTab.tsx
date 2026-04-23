'use client';

import { useState } from 'react';
import { BarChart3, Briefcase, CheckCircle, Users as UsersIcon } from 'lucide-react';
import AdminInsights from '@/components/admin/AdminInsights';
import AdminCatalog from '@/components/admin/AdminCatalog';
import AdminSchedules from '@/components/admin/AdminSchedules';
import AdminUsers from '@/components/admin/AdminUsers';

export default function AdminTab(props: any) {
  const [subTab, setSubTab] = useState<'insights' | 'users' | 'schedules' | 'catalog'>('insights');
  const confirmedMatches = props.matches.filter((m: any) => m.status === 'accepted');

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-20">
      {/* PREMIUM SWITCHER */}
      <div className="flex flex-wrap gap-4 bg-white p-2 rounded-[25px] w-fit border border-slate-100 shadow-sm">
        <TabButton active={subTab === 'insights'} onClick={() => setSubTab('insights')} icon={<BarChart3 size={14}/>} label="Insights" />
        <TabButton active={subTab === 'catalog'} onClick={() => setSubTab('catalog')} icon={<Briefcase size={14}/>} label={`Catalogs (${props.ideas?.length || 0})`} />
        <TabButton active={subTab === 'schedules'} onClick={() => setSubTab('schedules')} icon={<CheckCircle size={14}/>} label={`Schedules (${confirmedMatches.length})`} />
        <TabButton active={subTab === 'users'} onClick={() => setSubTab('users')} icon={<UsersIcon size={14}/>} label={`Users (${props.users.length})`} />
      </div>

      {/* RENDER COMPONENTS */}
      {subTab === 'insights' && <AdminInsights {...props} />}
      {subTab === 'catalog' && <AdminCatalog {...props} />}
      {subTab === 'schedules' && <AdminSchedules confirmedMatches={confirmedMatches} {...props} />}
      {subTab === 'users' && <AdminUsers {...props} />}
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
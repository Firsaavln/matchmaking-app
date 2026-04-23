'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { BarChart3, PieChart as PieIcon, MapPin, Landmark, Target, Loader2 } from 'lucide-react';

export default function AdminInsights({ ideas = [], matches = [], users = [] }: any) {
  
  const [isMounted, setIsMounted] = useState(false);

  // Beri delay ekstra 100ms agar animasi transisi CSS selesai dulu
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // --- DATA PROCESSING ---
  const sectorStats = Array.from(new Set(ideas.map((i: any) => i.business_category || 'Lainnya')))
    .map(cat => ({ name: String(cat), total: ideas.filter((i: any) => i.business_category === cat).length }))
    .sort((a, b) => b.total - a.total);

  const locStats = Array.from(new Set(ideas.map((i: any) => i.location || 'Lainnya')))
    .map(loc => ({ name: String(loc), total: ideas.filter((i: any) => i.location === loc).length }))
    .sort((a, b) => b.total - a.total).slice(0, 5);

  const yearStats = Array.from(new Set(ideas.map((i: any) => i.founding_year || 'N/A')))
    .map(yr => ({ name: String(yr), total: ideas.filter((i: any) => String(i.founding_year || 'N/A') === String(yr)).length }))
    .sort((a, b) => a.name === 'N/A' ? 1 : b.name === 'N/A' ? -1 : parseInt(a.name) - parseInt(b.name));

  const goalStats = Array.from(new Set(ideas.map((i: any) => i.event_goals || 'Lainnya')))
    .map(goal => ({ name: String(goal), total: ideas.filter((i: any) => i.event_goals === goal).length }))
    .sort((a, b) => b.total - a.total);

  const matchStats = [
    { name: 'Pending', value: matches.filter((m: any) => m.status === 'pending').length, color: '#94a3b8' },
    { name: 'Nego', value: matches.filter((m: any) => m.status === 'negotiating').length, color: '#6366f1' },
    { name: 'Deal', value: matches.filter((m: any) => m.status === 'accepted').length, color: '#10b981' },
  ].filter(item => item.value > 0);

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center h-96 opacity-50">
        <Loader2 className="animate-spin text-slate-400 mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Visuals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Startups" val={ideas.length} color="text-slate-900" />
        <StatCard label="Matches" val={matches.length} color="text-indigo-600" />
        <StatCard label="Users" val={users.length} color="text-emerald-600" />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer title="Sektor Bisnis" icon={<BarChart3 size={16} className="text-indigo-500" />}>
          {/* HACK: width 99% dan height fixed berupa angka 300 */}
          <ResponsiveContainer width="99%" height={300}>
            <BarChart data={sectorStats} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" fontSize={10} fontWeight="900" width={100} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none'}} />
              <Bar dataKey="total" fill="#0f172a" radius={[0, 10, 10, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <ChartContainer title="Match Status" icon={<PieIcon size={16} className="text-emerald-500" />}>
          <ResponsiveContainer width="99%" height={300}>
            <PieChart>
              <Pie data={matchStats} innerRadius={70} outerRadius={110} paddingAngle={8} dataKey="value">
                {matchStats.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer title="Top 5 Domisili" icon={<MapPin size={16} className="text-red-500" />}>
           <ResponsiveContainer width="99%" height={300}>
              <BarChart data={locStats}>
                <XAxis dataKey="name" fontSize={9} fontWeight="900" axisLine={false} tickLine={false} />
                <YAxis fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#fef2f2'}} contentStyle={{borderRadius: '20px', border: 'none'}} />
                <Bar dataKey="total" fill="#ef4444" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
           </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Tren Tahun Pendirian" icon={<Landmark size={16} className="text-amber-500" />}>
           <ResponsiveContainer width="99%" height={300}>
              <BarChart data={yearStats}>
                <XAxis dataKey="name" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                <YAxis fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#fffbeb'}} contentStyle={{borderRadius: '20px', border: 'none'}} />
                <Bar dataKey="total" fill="#f59e0b" radius={[10, 10, 0, 0]} barSize={35} />
              </BarChart>
           </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* CHARTS ROW 3 */}
      <ChartContainer title="Analisis Tujuan Event" icon={<Target size={16} className="text-indigo-500" />}>
         <ResponsiveContainer width="99%" height={300}>
            <BarChart data={goalStats}>
              <XAxis dataKey="name" fontSize={9} fontWeight="900" axisLine={false} tickLine={false} />
              <YAxis fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#eef2ff'}} contentStyle={{borderRadius: '20px', border: 'none'}} />
              <Bar dataKey="total" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={60} />
            </BarChart>
         </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

// ================== SUB COMPONENTS ==================

function StatCard({ label, val, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className={`text-5xl font-black mt-2 tracking-tighter ${color}`}>{val}</h3>
    </div>
  );
}

function ChartContainer({ title, icon, children }: any) {
  return (
    // Wrapper-nya dibikin super simple, gak pake aspect-video atau flex-1 lagi
    <div className="bg-white p-8 lg:p-10 rounded-[50px] border border-slate-100 w-full overflow-hidden">
      <h4 className="text-[11px] font-black uppercase text-slate-900 mb-8 tracking-widest flex items-center gap-2">
        {icon} {title}
      </h4>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';

const COLORS = {
  sector: '#0f172a',    
  statusDeal: '#10b981', 
  statusNego: '#6366f1', 
  statusPending: '#94a3b8', 
  location: '#ef4444',  
  year: '#f59e0b',      
  goal: '#6366f1'       
};

export default function AdminCharts({ ideas = [], matches = [] }: any) {
  
  // 1. SEKTOR (Horizontal)
  const categoryStats = Array.from(new Set(ideas.map((i: any) => i.business_category || 'Lainnya')))
    .map(cat => ({
      name: String(cat),
      total: ideas.filter((i: any) => i.business_category === cat).length
    }))
    .sort((a, b) => b.total - a.total);

  // 2. STATUS MATCH (Pie)
  const matchStats = [
    { name: 'Pending', value: matches.filter((m: any) => m.status === 'pending').length, color: COLORS.statusPending },
    { name: 'Negotiating', value: matches.filter((m: any) => m.status === 'negotiating').length, color: COLORS.statusNego },
    { name: 'Deal Success', value: matches.filter((m: any) => m.status === 'accepted').length, color: COLORS.statusDeal },
  ].filter(item => item.value > 0);

  // 3. DOMISILI (Top 5)
  const locationStats = Array.from(new Set(ideas.map((i: any) => i.location || 'Lainnya')))
    .map(loc => ({
      name: String(loc),
      total: ideas.filter((i: any) => i.location === loc).length
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // 4. TAHUN PENDIRIAN (FIXED VERSION)
  const yearStats = Array.from(new Set(ideas.map((i: any) => i.founding_year || 'N/A')))
    .map(yr => ({
      name: String(yr), 
      total: ideas.filter((i: any) => {
        if (!i.founding_year && yr === 'N/A') return true;
        return String(i.founding_year) === String(yr);
      }).length
    }))
    .sort((a, b) => {
      if (a.name === 'N/A') return 1;
      if (b.name === 'N/A') return -1;
      return parseInt(a.name) - parseInt(b.name);
    });

  // 5. TUJUAN EVENT
  const goalStats = Array.from(new Set(ideas.map((i: any) => i.event_goals || 'Lainnya')))
    .map(goal => ({
      name: String(goal),
      total: ideas.filter((i: any) => i.event_goals === goal).length
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-10 mb-12">
      {/* ROW 1: SEKTOR & STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-[450px] flex flex-col">
          <div className="mb-6">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sektor Bisnis</h4>
            <p className="text-xs font-bold text-slate-900 mt-1">Persebaran Kategori (Horizontal)</p>
          </div>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} layout="vertical" margin={{ left: 20, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" width={100} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="total" fill={COLORS.sector} radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-[450px] flex flex-col">
          <div className="mb-6">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kesehatan Ekosistem</h4>
            <p className="text-xs font-bold text-slate-900 mt-1">Rasio Deal vs Negosiasi</p>
          </div>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={matchStats} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                  {matchStats.map((entry: any, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 2: DOMISILI & TAHUN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-[450px] flex flex-col">
          <div className="mb-6">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Top Domisili</h4>
            <p className="text-xs font-bold text-slate-900 mt-1">5 Kota Startup Terbanyak</p>
          </div>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: '#fef2f2' }} />
                <Bar dataKey="total" fill={COLORS.location} radius={[10, 10, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-[450px] flex flex-col">
          <div className="mb-6">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tahun Berdiri</h4>
            <p className="text-xs font-bold text-slate-900 mt-1">Tren Kedewasaan Startup</p>
          </div>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: '#fffbeb' }} />
                <Bar dataKey="total" fill={COLORS.year} radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3: TUJUAN EVENT */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-[450px] flex flex-col">
        <div className="mb-6">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Analisis Tujuan Event</h4>
          <p className="text-xs font-bold text-slate-900 mt-1">Apa Yang Dicari Para Founder?</p>
        </div>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={goalStats} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
              <Tooltip cursor={{ fill: '#eef2ff' }} />
              <Bar dataKey="total" fill={COLORS.goal} radius={[10, 10, 0, 0]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Navbar({ email }: { email: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error('Gagal logout: ' + error.message);
    } else {
      toast.success('Berhasil keluar!');
      // INI KUNCINYA: Paksa browser pindah ke halaman login/utama
      router.replace('/'); 
    }
  };

  return (
    <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <span className="text-lg font-black tracking-tighter uppercase italic">MatchVenture.</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Account</span>
            <span className="text-[11px] font-bold text-slate-900">{email}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[10px] font-black text-white bg-red-500 hover:bg-red-600 px-5 py-2 rounded-full transition-all uppercase tracking-widest shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
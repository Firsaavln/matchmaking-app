'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(''); // <-- TAMBAHAN: State untuk nomor WA
  const [role, setRole] = useState('founder');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  // FITUR CHECKUSER (Proteksi Sesi)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (!isLogin) {
        // REGISTER LOGIC
        const { error } = await supabase.auth.signUp({
          email, 
          password,
          options: { 
            data: { 
              role,
              phone_number: phone // <-- TAMBAHAN: Simpan nomor WA ke database
            } 
          }
        });
        if (error) throw error;
        toast.success("Account created. Check your email or try signing in.");
        setIsLogin(true);
      } else {
        // LOGIN LOGIC
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Access granted. Welcome back.");
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 animate-pulse">
        Synchronizing Session
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6 selection:bg-slate-900 selection:text-white">
      <div className="max-w-[400px] w-full">
        
        {/* LOGO SECTION - DENGAN IKON BARU */}
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="mb-4 bg-white p-4 rounded-[24px] shadow-sm border border-slate-100">
            <Image 
              src="/icon.svg" // Pastikan file ini ada di folder public/
              alt="Logo SIAP Bisnis"
              width={60} 
              height={60}
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900">
            SIAP BISNIS FORUM
            <span className="text-indigo-600">.</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
            BUSINESS MATCHING & DATING
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
          
          {/* SLIDE TOGGLE LOGIN/REGISTER */}
          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-10 border border-slate-100">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-8">
            {/* ROLE SELECTOR (HANYA MUNCUL DI REGISTER) */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Identity Path</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setRole('founder')}
                    className={`py-3 px-2 rounded-xl border text-[10px] font-bold transition-all ${role === 'founder' ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-200' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                  >
                    STARTUP
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('investor')}
                    className={`py-3 px-2 rounded-xl border text-[10px] font-bold transition-all ${role === 'investor' ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-200' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                  >
                    INVESTOR
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="group">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 block group-focus-within:text-slate-900 transition-all">Email Interface</label>
                <input 
                  required
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full border-b-2 border-slate-100 py-2 focus:border-slate-900 outline-none text-sm font-semibold transition-all placeholder:text-slate-200"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              {/* <-- TAMBAHAN: INPUT WA KHUSUS SAAT REGISTER SAJA --> */}
              {!isLogin && (
                <div className="group animate-in fade-in slide-in-from-top-2 duration-500">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 block group-focus-within:text-slate-900 transition-all">WhatsApp Number</label>
                  <input 
                    required={!isLogin}
                    type="tel" 
                    placeholder="628123456xxxx"
                    className="w-full border-b-2 border-slate-100 py-2 focus:border-slate-900 outline-none text-sm font-semibold transition-all placeholder:text-slate-200"
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                  <p className="text-[9px] text-slate-400 mt-2 font-medium">Gunakan format 62 atau 08 (cth: 62812...)</p>
                </div>
              )}

              <div className="group">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 block group-focus-within:text-slate-900 transition-all">Secure Password</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full border-b-2 border-slate-100 py-2 focus:border-slate-900 outline-none text-sm font-semibold transition-all placeholder:text-slate-200"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button 
              disabled={authLoading}
              className="w-full bg-slate-900 text-white py-5 rounded-[20px] text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-10"
            >
              {authLoading && (
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              )}
              {isLogin ? 'Initialize Access' : 'Create Identity'}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
          Security Protocol Enabled <br/>
          <span className="text-slate-300 font-medium">
            © 2026 Powered by EKRAF & PT. PANCA CENTRAL ABADI
          </span>
        </p>
      </div>
    </div>
  );
}
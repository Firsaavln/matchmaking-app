'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { X, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';

export default function UserModal({ user, onClose, onSuccess }: any) {
  const isEdit = !!user;
  const [formData, setFormData] = useState({
    email: '',
    password: '', // Set default password biar admin gak repot
    role: 'founder'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '', 
        role: user.role
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Gunakan loading toast supaya admin tahu proses sedang berjalan
    const toastId = toast.loading(isEdit ? "Memperbarui data user..." : "Mendaftarkan user baru...");

    try {
      if (isEdit) {
        const { error } = await supabase.rpc('update_user_admin', {
          target_user_id: user.id,
          new_email: formData.email,
          new_role: formData.role
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('create_user_admin', {
          user_email: formData.email,
          user_password: formData.password,
          user_role: formData.role
        });
        if (error) throw error;
      }

      // KUNCI: Kasih delay 800ms sebelum panggil onSuccess
      // supaya refreshData di parent narik data yang SUDAH commit di DB
      setTimeout(() => {
        toast.success(isEdit ? "User updated!" : "User created!", { id: toastId });
        onSuccess(); // Ini bakal tutup modal & refreshData
      }, 800);

    } catch (err: any) {
      toast.error("Gagal: " + err.message, { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl animate-in zoom-in-95 relative border border-slate-100">
        
        {/* Tombol Close */}
        <button 
          onClick={onClose} 
          disabled={loading}
          className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors disabled:opacity-30"
        >
          <X size={24}/>
        </button>

        <div className="mb-8">
          <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
            {isEdit ? 'Edit Access' : 'Create User'}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {isEdit ? 'Perbarui identitas akun platform' : 'Daftarkan akses baru ke database'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              required 
              disabled={loading}
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="w-full bg-slate-50 rounded-2xl pl-14 pr-6 py-4 outline-none font-bold border-2 border-transparent focus:border-indigo-500/20 focus:bg-white transition-all disabled:opacity-50"
              placeholder="Email Address" 
            />
          </div>

          {/* PASSWORD - Hanya muncul kalau nambah user baru */}
          {!isEdit && (
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                required 
                disabled={loading}
                type="text" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                className="w-full bg-slate-50 rounded-2xl pl-14 pr-6 py-4 outline-none font-bold border-2 border-transparent focus:border-indigo-500/20 focus:bg-white transition-all disabled:opacity-50"
                placeholder="Set Password" 
              />
            </div>
          )}

          {/* ROLE */}
          <div className="relative">
            <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select 
              disabled={loading}
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})} 
              className="w-full bg-slate-50 rounded-2xl pl-14 pr-6 py-4 outline-none font-bold cursor-pointer appearance-none border-2 border-transparent focus:border-indigo-500/20 focus:bg-white transition-all disabled:opacity-50"
            >
              <option value="founder">Founder (Startup)</option>
              <option value="investor">Investor (Buyer)</option>
              <option value="admin">Admin (Staff)</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                isEdit ? 'Update Identity' : 'Confirm & Create'
              )}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black uppercase text-[10px] text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
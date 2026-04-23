'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Plus, Edit3, Trash2, Mail, Search, UserMinus 
} from 'lucide-react';
import UserModal from '@/components/modals/UserModals';

export default function AdminUsers({ users = [], refreshData }: any) {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- LOGIKA FILTER SEARCH ---
  const filteredUsers = users.filter((u: any) => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HANDLER MODAL ---
  const handleAdd = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // --- LOGIKA HAPUS (ANTI LAG) ---
  const handleDelete = async (id: string) => {
    if (!confirm('PERINGATAN: Hapus user ini secara permanen? Seluruh data terkait akan hilang.')) return;
    
    // Gunakan loading toast biar kerasa responsif
    const toastId = toast.loading("Sedang menghapus user dari sistem...");

    try {
      const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: id });
      if (error) throw error;

      // KUNCI: Kasih delay 800ms sebelum refresh agar DB selesai cascading delete
      setTimeout(async () => {
        await refreshData();
        toast.success("User berhasil dihapus!", { id: toastId });
      }, 800);

    } catch (err: any) {
      toast.error("Gagal menghapus: " + err.message, { id: toastId });
    }
  };

  return (
    <div className="bg-white rounded-[45px] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER & SEARCH */}
      <div className="p-10 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30">
        <div className="space-y-1">
          <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900">User Control Center</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Manage {users.length} registered access accounts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text"
              placeholder="Search email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>

          <button 
            onClick={handleAdd}
            className="bg-emerald-500 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            <Plus size={14}/> Add New User
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
            <tr>
              <th className="px-10 py-6">Identity / Email</th>
              <th className="px-10 py-6">Role Access</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                        <Mail size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full ${
                      u.role === 'admin' ? 'bg-red-50 text-red-600' : 
                      u.role === 'investor' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="p-3 text-slate-400 hover:text-indigo-600 border border-slate-100 rounded-2xl shadow-sm transition-all bg-white hover:shadow-md"
                        title="Edit User"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-3 text-slate-400 hover:text-red-600 border border-slate-100 rounded-2xl shadow-sm transition-all bg-white hover:shadow-md"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-32 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <UserMinus size={48} className="text-slate-100" />
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
                      No users found matching "{searchTerm}"
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RENDER MODAL */}
      {showModal && (
        <UserModal 
          user={selectedUser} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            // Tambahkan delay sedikit juga setelah save/edit
            setTimeout(() => refreshData(), 500);
          }}
        />
      )}
    </div>
  );
}
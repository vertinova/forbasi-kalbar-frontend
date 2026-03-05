import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiPhone, HiLocationMarker, HiShieldCheck, HiPencil, HiLockClosed, HiEye, HiEyeOff, HiLogout } from 'react-icons/hi';

export default function PenyelenggaraProfilPage() {
  const { user, refreshUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [show, setShow] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  useEffect(() => { const t = setTimeout(() => setShow(true), 50); return () => clearTimeout(t); }, []);

  const handleSaveProfile = async () => {
    if (!form.name.trim()) return toast.error('Nama tidak boleh kosong');
    setSaving(true);
    try {
      await api.put('/auth/profile', { name: form.name.trim(), phone: form.phone.trim() || null });
      await refreshUser();
      toast.success('Profil berhasil diupdate');
      setEditing(false);
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal update profil'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword) return toast.error('Masukkan password lama');
    if (!pwForm.newPassword) return toast.error('Masukkan password baru');
    if (pwForm.newPassword.length < 6) return toast.error('Password baru minimal 6 karakter');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Konfirmasi password tidak cocok');
    setSaving(true);
    try {
      await api.put('/auth/profile', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password berhasil diubah');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangingPassword(false);
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal ubah password'); }
    finally { setSaving(false); }
  };

  const inputCls = 'w-full px-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all duration-200';

  const profileItems = [
    { icon: HiUser, label: 'Nama Lengkap', value: user?.name },
    { icon: HiMail, label: 'Email', value: user?.email },
    { icon: HiPhone, label: 'No. Telepon', value: user?.phone },
    { icon: HiLocationMarker, label: 'Pengcab Terkait', value: user?.pengcab ? (typeof user.pengcab === 'object' ? `${user.pengcab.nama} - ${user.pengcab.kota}` : user.pengcab) : null },
    { icon: HiShieldCheck, label: 'Role', value: 'Penyelenggara Event' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className={`transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Profil Saya</h1>
        <p className="text-xs text-gray-400 mt-0.5">Kelola informasi akun Anda</p>
      </div>

      {/* Avatar card */}
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 transition-all duration-500 delay-100 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200/30 overflow-hidden flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-black">{user?.name?.charAt(0)?.toUpperCase() || 'P'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-extrabold text-gray-900 truncate">{user?.name || '-'}</h3>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            <span className="inline-flex items-center mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-200">
              PENYELENGGARA
            </span>
          </div>
        </div>
      </div>

      {/* Profile info / edit */}
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 transition-all duration-500 delay-200 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {editing ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Edit Profil</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Nama Lengkap</label>
              <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className={inputCls} placeholder="Nama lengkap" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">No. Telepon</label>
              <input type="text" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className={inputCls} placeholder="No. telepon" />
            </div>
            <div className="flex gap-2.5 pt-1">
              <button onClick={handleSaveProfile} disabled={saving}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-200/30 disabled:opacity-50 active:scale-[0.98]">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button onClick={() => { setEditing(false); setForm({ name: user?.name || '', phone: user?.phone || '' }); }}
                className="px-5 py-2.5 bg-white text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all border border-gray-200 active:scale-[0.98]">
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {profileItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors group">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                    <Icon className="text-amber-500 text-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{item.value || '-'}</p>
                  </div>
                </div>
              );
            })}
            <div className="pt-3">
              <button onClick={() => setEditing(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-600 text-sm font-bold rounded-xl hover:bg-amber-100 transition-all ring-1 ring-amber-200 active:scale-[0.98]">
                <HiPencil size={15} /> Edit Profil
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password */}
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 transition-all duration-500 delay-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
            <HiLockClosed className="text-gray-400 text-sm" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Keamanan Akun</h3>
        </div>
        {changingPassword ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Password Lama</label>
              <div className="relative">
                <input type={showCurrentPw ? 'text' : 'password'} value={pwForm.currentPassword}
                  onChange={e => { const v = e.target.value; setPwForm(prev => ({ ...prev, currentPassword: v })); }}
                  className={`${inputCls} pr-10`} placeholder="Masukkan password lama" />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrentPw ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Password Baru</label>
              <div className="relative">
                <input type={showNewPw ? 'text' : 'password'} value={pwForm.newPassword}
                  onChange={e => { const v = e.target.value; setPwForm(prev => ({ ...prev, newPassword: v })); }}
                  className={`${inputCls} pr-10`} placeholder="Minimal 6 karakter" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPw ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Konfirmasi Password</label>
              <div className="relative">
                <input type={showConfirmPw ? 'text' : 'password'} value={pwForm.confirmPassword}
                  onChange={e => { const v = e.target.value; setPwForm(prev => ({ ...prev, confirmPassword: v })); }}
                  className={`${inputCls} pr-10`} placeholder="Ulangi password baru" />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPw ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button onClick={handleChangePassword} disabled={saving}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-200/30 disabled:opacity-50 active:scale-[0.98]">
                {saving ? 'Menyimpan...' : 'Ubah Password'}
              </button>
              <button onClick={() => { setChangingPassword(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="px-5 py-2.5 bg-white text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all border border-gray-200 active:scale-[0.98]">
                Batal
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setChangingPassword(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-100 transition-all ring-1 ring-gray-200 active:scale-[0.98]">
            <HiLockClosed size={15} /> Ubah Password
          </button>
        )}
      </div>

      {/* Logout */}
      <div className={`transition-all duration-500 delay-[400ms] ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <button onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white text-rose-500 text-sm font-bold rounded-2xl hover:bg-rose-50 transition-all border border-gray-100 shadow-sm active:scale-[0.98]">
          <HiLogout size={16} /> Keluar dari Akun
        </button>
      </div>
    </div>
  );
}

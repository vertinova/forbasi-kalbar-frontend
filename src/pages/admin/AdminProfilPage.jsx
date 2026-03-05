import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiPhone, HiShieldCheck, HiPencil, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-400 outline-none bg-white transition-all';

export default function AdminProfilPage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!form.name.trim()) return toast.error('Nama tidak boleh kosong');
    setSaving(true);
    try {
      await api.put('/auth/profile', { name: form.name.trim(), phone: form.phone.trim() || null });
      await refreshUser();
      toast.success('Profil berhasil diupdate');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal update profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword) return toast.error('Masukkan password lama');
    if (!pwForm.newPassword) return toast.error('Masukkan password baru');
    if (pwForm.newPassword.length < 6) return toast.error('Password baru minimal 6 karakter');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Konfirmasi password tidak cocok');

    setSaving(true);
    try {
      await api.put('/auth/profile', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password berhasil diubah');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangingPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal ubah password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Profil Saya</h1>
        <p className="text-sm text-gray-400 mt-1">Kelola informasi akun administrator</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm shadow-gray-100/50">
        {/* Avatar Section */}
        <div className="px-6 pt-8 pb-5 flex flex-col items-center bg-gradient-to-b from-gray-50/50 to-white">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25 mb-4 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-3xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{user?.name || '-'}</h3>
          <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-lg bg-green-500/10 text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Administrator Pengda
          </span>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Profile Info/Edit */}
        <div className="p-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className={inputClass} placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">No. Telepon</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className={inputClass} placeholder="No. telepon" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveProfile} disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all active:scale-[0.97] disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button onClick={() => { setEditing(false); setForm({ name: user?.name || '', phone: user?.phone || '' }); }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { icon: HiUser, label: 'Nama Lengkap', value: user?.name || '-' },
                { icon: HiMail, label: 'Email', value: user?.email || '-' },
                { icon: HiPhone, label: 'No. Telepon', value: user?.phone || '-' },
                { icon: HiShieldCheck, label: 'Role', value: 'Administrator Pengda' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/60 border border-gray-100/60">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center shrink-0">
                    <item.icon className="text-green-600" size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400 font-medium">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.value}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => setEditing(true)}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 text-green-600 text-sm font-bold rounded-xl hover:bg-green-500/15 transition-colors active:scale-[0.97]">
                <HiPencil size={15} /> Edit Profil
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm shadow-gray-100/50">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center">
            <HiLockClosed className="text-amber-600" size={14} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Ubah Password</h3>
        </div>

        <div className="p-6">
          {changingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password Lama</label>
                <div className="relative">
                  <input type={showCurrentPw ? 'text' : 'password'} value={pwForm.currentPassword}
                    onChange={e => { const v = e.target.value; setPwForm(prev => ({ ...prev, currentPassword: v })); }}
                    className={`${inputClass} pr-10`} placeholder="Masukkan password lama" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showCurrentPw ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password Baru</label>
                <div className="relative">
                  <input type={showNewPw ? 'text' : 'password'} value={pwForm.newPassword}
                    onChange={e => { const v = e.target.value; setPwForm(prev => ({ ...prev, newPassword: v })); }}
                    className={`${inputClass} pr-10`} placeholder="Minimal 6 karakter" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showNewPw ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Konfirmasi Password</label>
                <div className="relative">
                  <input type={showConfirmPw ? 'text' : 'password'} value={pwForm.confirmPassword}
                    onChange={e => { const v = e.target.value; setPwForm(prev => ({ ...prev, confirmPassword: v })); }}
                    className={`${inputClass} pr-10`} placeholder="Ulangi password baru" />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showConfirmPw ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleChangePassword} disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all active:scale-[0.97] disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Ubah Password'}
                </button>
                <button onClick={() => { setChangingPassword(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setChangingPassword(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500/10 text-amber-600 text-sm font-bold rounded-xl hover:bg-amber-500/15 transition-colors active:scale-[0.97]">
              <HiLockClosed size={15} /> Ubah Password
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

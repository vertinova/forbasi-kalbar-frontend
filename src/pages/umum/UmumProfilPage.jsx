import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiPhone, HiShieldCheck, HiPencil, HiLockClosed, HiEye, HiEyeOff, HiGlobe } from 'react-icons/hi';

export default function UmumProfilPage() {
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
    <div className="max-w-xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Profil Saya</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-3xl">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800">{user?.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <HiGlobe className="text-blue-500" size={14} />
            <span className="text-sm text-blue-600 font-medium">Pengguna Umum</span>
          </div>
        </div>

        <div className="h-px bg-gray-100 my-5" />

        {/* Profile Info Section */}
        {!editing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <HiUser className="text-blue-600" size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Nama Lengkap</p>
                <p className="text-gray-800 font-semibold">{user?.name || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <HiMail className="text-green-600" size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Email</p>
                <p className="text-gray-800 font-semibold">{user?.email || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <HiPhone className="text-violet-600" size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">No. Telepon</p>
                <p className="text-gray-800 font-semibold">{user?.phone || '-'}</p>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <HiPencil size={18} />
              Edit Profil
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => { setEditing(false); setForm({ name: user?.name || '', phone: user?.phone || '' }); }}
                className="px-5 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <HiLockClosed className="text-amber-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Keamanan</h3>
            <p className="text-xs text-gray-400">Ubah password akun Anda</p>
          </div>
        </div>

        {!changingPassword ? (
          <button
            onClick={() => setChangingPassword(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            <HiShieldCheck size={18} />
            Ubah Password
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password Lama</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none"
                />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrentPw ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password Baru</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none"
                  placeholder="Minimal 6 karakter"
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPw ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none"
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPw ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="flex-1 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Ubah Password'}
              </button>
              <button
                onClick={() => { setChangingPassword(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="px-5 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

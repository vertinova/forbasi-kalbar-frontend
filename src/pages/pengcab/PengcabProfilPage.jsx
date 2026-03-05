import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiPhone, HiLocationMarker, HiShieldCheck, HiPencil, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

export default function PengcabProfilPage() {
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
      <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-4 sm:mb-6">Profil Saya</h2>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg mb-3 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-3xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'P'}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-800">{user?.name || '-'}</h3>
          <span className="inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
            Pengurus Cabang
          </span>
        </div>

        {/* Profile Info / Edit Form */}
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">No. Telepon</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="No. telepon"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => { setEditing(false); setForm({ name: user?.name || '', phone: user?.phone || '' }); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <HiUser className="text-green-600" size={20} />
              <div>
                <p className="text-xs text-gray-400 font-medium">Nama Lengkap</p>
                <p className="text-sm font-semibold text-gray-700">{user?.name || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <HiMail className="text-green-600" size={20} />
              <div>
                <p className="text-xs text-gray-400 font-medium">Email</p>
                <p className="text-sm font-semibold text-gray-700">{user?.email || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <HiPhone className="text-green-600" size={20} />
              <div>
                <p className="text-xs text-gray-400 font-medium">No. Telepon</p>
                <p className="text-sm font-semibold text-gray-700">{user?.phone || '-'}</p>
              </div>
            </div>

            {user?.pengcab && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <HiLocationMarker className="text-green-600" size={20} />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Pengurus Cabang</p>
                  <p className="text-sm font-semibold text-gray-700">{user.pengcab}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <HiShieldCheck className="text-green-600" size={20} />
              <div>
                <p className="text-xs text-gray-400 font-medium">Role</p>
                <p className="text-sm font-semibold text-gray-700">Pengurus Cabang</p>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 text-sm font-bold rounded-xl hover:bg-green-100 transition border border-green-200"
            >
              <HiPencil size={16} />
              Edit Profil
            </button>
          </div>
        )}
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <HiLockClosed className="text-green-600" size={20} />
          <h3 className="text-base font-bold text-gray-800">Ubah Password</h3>
        </div>

        {changingPassword ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Password Lama</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Masukkan password lama"
                />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrentPw ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Password Baru</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Minimal 6 karakter"
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPw ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ulangi password baru"
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPw ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="flex-1 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Ubah Password'}
              </button>
              <button
                onClick={() => { setChangingPassword(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setChangingPassword(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-100 transition border border-amber-200"
          >
            <HiLockClosed size={16} />
            Ubah Password
          </button>
        )}
      </div>
    </div>
  );
}

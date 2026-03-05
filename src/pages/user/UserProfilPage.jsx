import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiPhone, HiLocationMarker, HiShieldCheck, HiPencil, HiLockClosed, HiEye, HiEyeOff, HiIdentification, HiDownload, HiExternalLink, HiLogout } from 'react-icons/hi';

export default function UserProfilPage() {
  const { user, refreshUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [ktaData, setKtaData] = useState(null);
  const [ktaLoading, setKtaLoading] = useState(true);

  const [form, setForm] = useState({ name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  useEffect(() => {
    api.get('/auth/kta').then(res => setKtaData(res.data)).catch(() => {}).finally(() => setKtaLoading(false));
  }, []);

  const roleLabel = {
    ADMIN: 'Administrator Pengda',
    PENGCAB: 'Pengurus Cabang',
    USER: 'Anggota',
  };

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
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-800">{user?.name || '-'}</h3>
          <span className="inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
            {roleLabel[user?.role] || user?.role}
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
                onChange={e => { const v = e.target.value; setForm(prev => ({ ...prev, name: v })); }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">No. Telepon</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => { const v = e.target.value; setForm(prev => ({ ...prev, phone: v })); }}
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

            {(user?.phone || true) && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <HiPhone className="text-green-600" size={20} />
                <div>
                  <p className="text-xs text-gray-400 font-medium">No. Telepon</p>
                  <p className="text-sm font-semibold text-gray-700">{user?.phone || '-'}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <HiLocationMarker className="text-green-600" size={20} />
              <div>
                <p className="text-xs text-gray-400 font-medium">Pengurus Cabang</p>
                <p className="text-sm font-semibold text-gray-700">
                  {user?.pengcab
                    ? (typeof user.pengcab === 'object' ? `${user.pengcab.nama} - ${user.pengcab.kota}` : user.pengcab)
                    : 'Belum terdaftar'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <HiShieldCheck className="text-green-600" size={20} />
              <div>
                <p className="text-xs text-gray-400 font-medium">Role</p>
                <p className="text-sm font-semibold text-gray-700">{roleLabel[user?.role] || user?.role}</p>
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

      {/* KTA Section */}
      {!ktaLoading && ktaData && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <HiIdentification className="text-green-600" size={20} />
            <h3 className="text-base font-bold text-gray-800">Kartu Tanda Anggota (KTA)</h3>
          </div>

          {ktaData.total_kta > 0 ? (
            <div className="space-y-4">
              {ktaData.kta.map((kta, idx) => (
                <div key={kta.kta_id || idx} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      kta.status === 'kta_issued' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{kta.status_label}</span>
                    {kta.logo_url && (
                      <img src={kta.logo_url} alt="Logo Club" className="w-10 h-10 rounded-lg object-cover border border-green-200" />
                    )}
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Club</span>
                      <span className="font-semibold text-gray-700">{kta.club_name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ketua</span>
                      <span className="font-semibold text-gray-700">{kta.leader_name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pelatih</span>
                      <span className="font-semibold text-gray-700">{kta.coach_name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Manajer</span>
                      <span className="font-semibold text-gray-700">{kta.manager_name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Alamat</span>
                      <span className="font-semibold text-gray-700 text-right max-w-[60%]">{kta.club_address || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wilayah</span>
                      <span className="font-semibold text-gray-700">{kta.regency}{kta.province ? `, ${kta.province}` : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Diterbitkan</span>
                      <span className="font-semibold text-gray-700">{kta.kta_issued_at ? new Date(kta.kta_issued_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                    </div>
                    {kta.barcode_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Barcode</span>
                        <span className="font-mono text-xs text-gray-600 truncate max-w-[60%]">{kta.barcode_id}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {kta.kta_pdf_url && (
                      <a href={kta.kta_pdf_url} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition">
                        <HiDownload size={14} /> Download PDF
                      </a>
                    )}
                    {kta.kta_detail_url && (
                      <a href={kta.kta_detail_url} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white text-green-700 text-xs font-bold rounded-xl hover:bg-green-50 transition border border-green-200">
                        <HiExternalLink size={14} /> Detail / Verifikasi
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <HiIdentification className="text-3xl text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Belum memiliki KTA</p>
              <p className="text-xs text-gray-300 mt-1">Hubungi pengurus cabang untuk informasi KTA</p>
            </div>
          )}
        </div>
      )}

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
                  onChange={e => { const v = e.target.value; setPwForm(prev => ({ ...prev, currentPassword: v })); }}
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
                  onChange={e => { const v = e.target.value; setPwForm(prev => ({ ...prev, newPassword: v })); }}
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
                  onChange={e => { const v = e.target.value; setPwForm(prev => ({ ...prev, confirmPassword: v })); }}
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

      {/* Logout */}
      <div className="mt-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl hover:bg-rose-100 transition border border-rose-200"
        >
          <HiLogout size={18} />
          Keluar dari Akun
        </button>
      </div>
    </div>
  );
}

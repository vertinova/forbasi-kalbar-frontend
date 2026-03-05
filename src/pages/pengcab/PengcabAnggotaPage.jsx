import { useEffect, useState } from 'react';
import { HiSearch, HiUser, HiMail, HiPhone, HiPencil, HiX, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function PengcabAnggotaPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pengcab-panel/anggota');
      setMembers(data);
    } catch { setMembers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = members.filter(m =>
    m.namaLengkap?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (m) => {
    setEditUser(m);
    setEditForm({ name: m.namaLengkap || '', phone: m.noHp || '', newPassword: '' });
    setShowPw(false);
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) return toast.error('Nama tidak boleh kosong');
    setSaving(true);
    try {
      const payload = { name: editForm.name.trim(), phone: editForm.phone.trim() || null };
      if (editForm.newPassword) payload.newPassword = editForm.newPassword;
      await api.put(`/pengcab-panel/anggota/${editUser.id}`, payload);
      toast.success('Data anggota berhasil diupdate');
      setEditUser(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal update anggota');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-2">Anggota Pengcab</h2>
      <p className="text-sm text-gray-500 mb-6">Daftar anggota yang terdaftar di pengurus cabang Anda</p>

      {/* Search */}
      <div className="relative mb-6">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Belum ada anggota terdaftar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => (
            <div key={m.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <HiUser className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{m.namaLengkap}</h4>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      m.role === 'PENGCAB' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{m.role}</span>
                  </div>
                </div>
                <button onClick={() => openEdit(m)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Edit anggota">
                  <HiPencil size={16} />
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <HiMail size={16} className="text-gray-400" />
                  <span className="truncate">{m.email}</span>
                </div>
                {m.noHp && (
                  <div className="flex items-center gap-2">
                    <HiPhone size={16} className="text-gray-400" />
                    <span>{m.noHp}</span>
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  Bergabung: {new Date(m.createdAt).toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-400 text-center">
        Total: {filtered.length} anggota
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Edit Anggota</h3>
              <button onClick={() => setEditUser(null)} className="p-1 hover:bg-gray-100 rounded-lg"><HiX size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center mb-2">
                <p className="text-sm text-gray-500">{editUser.email}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Lengkap</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">No. Telepon</label>
                <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  <span className="flex items-center gap-1"><HiLockClosed size={12} /> Reset Password <span className="text-gray-400">(kosongkan jika tidak diubah)</span></span>
                </label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={editForm.newPassword}
                    onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500"
                    placeholder="Password baru min 6 karakter" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button onClick={() => setEditUser(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

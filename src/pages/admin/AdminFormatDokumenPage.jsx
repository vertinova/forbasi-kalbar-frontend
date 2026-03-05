import { useState, useEffect } from 'react';
import {
  HiPlus, HiPencil, HiTrash, HiDocumentText, HiDownload, HiSearch,
  HiEye, HiEyeOff, HiUpload, HiX
} from 'react-icons/hi';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import Select from '../../components/Select';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5023';

const kategoriOptions = [
  { value: 'umum', label: 'Umum' },
  { value: 'administratif', label: 'Administratif' },
  { value: 'perangkat', label: 'Perangkat Perlombaan' },
  { value: 'prasarana', label: 'Prasarana & Sarana' },
  { value: 'peserta', label: 'Peserta' },
  { value: 'penghargaan', label: 'Penghargaan' },
];

const kategoriLabels = Object.fromEntries(kategoriOptions.map(k => [k.value, k.label]));

export default function AdminFormatDokumenPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ nama: '', deskripsi: '', kategori: 'umum', urutan: 0 });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/format-dokumen/admin');
      setData(data);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ nama: '', deskripsi: '', kategori: 'umum', urutan: 0 });
    setFile(null);
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (item) => {
    setForm({ nama: item.nama, deskripsi: item.deskripsi || '', kategori: item.kategori, urutan: item.urutan });
    setFile(null);
    setEditing(item);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama) return toast.error('Nama wajib diisi');
    if (!editing && !file) return toast.error('File wajib diupload');

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('nama', form.nama);
      fd.append('deskripsi', form.deskripsi);
      fd.append('kategori', form.kategori);
      fd.append('urutan', form.urutan);
      if (file) fd.append('file', file);

      if (editing) {
        await api.put(`/format-dokumen/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Format dokumen berhasil diupdate');
      } else {
        await api.post('/format-dokumen', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Format dokumen berhasil ditambahkan');
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleToggleAktif = async (item) => {
    try {
      await api.put(`/format-dokumen/${item.id}`, { aktif: !item.aktif });
      toast.success(item.aktif ? 'Dinonaktifkan' : 'Diaktifkan');
      fetchData();
    } catch { toast.error('Gagal update status'); }
  };

  const handleDelete = (item) => {
    setConfirmModal({
      title: 'Hapus Format Dokumen',
      message: `Yakin ingin menghapus "${item.nama}"?`,
      variant: 'danger',
      confirmText: 'Ya, Hapus',
      onConfirm: async () => {
        try {
          await api.delete(`/format-dokumen/${item.id}`);
          toast.success('Berhasil dihapus');
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Gagal menghapus');
        } finally { setConfirmModal(null); }
      }
    });
  };

  const filtered = data.filter(f =>
    f.nama.toLowerCase().includes(search.toLowerCase()) ||
    (f.deskripsi || '').toLowerCase().includes(search.toLowerCase())
  );

  const getFileExt = (path) => path.split('.').pop().toLowerCase();
  const extColors = {
    docx: 'bg-blue-100 text-blue-700',
    doc: 'bg-blue-100 text-blue-700',
    pdf: 'bg-red-100 text-red-700',
    xlsx: 'bg-green-100 text-green-700',
    xls: 'bg-green-100 text-green-700',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Format Dokumen</h1>
          <p className="text-xs text-gray-500">Kelola contoh format dokumen yang dapat didownload penyelenggara</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-300/30 active:scale-[0.98]">
          <HiPlus /> Tambah Format
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari format dokumen..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">{editing ? 'Edit Format Dokumen' : 'Tambah Format Dokumen'}</h2>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <HiX className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
                <input type="text" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                  placeholder="Contoh: Pakta Integritas" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                <input type="text" value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                  placeholder="Deskripsi singkat (opsional)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                  <Select accent="amber" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                    {kategoriOptions.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Urutan</label>
                  <input type="number" value={form.urutan} onChange={e => setForm({ ...form, urutan: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  File {!editing && <span className="text-red-500">*</span>}
                </label>
                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-all">
                  <HiUpload className="text-gray-400" />
                  <span className="text-sm text-gray-500 truncate">
                    {file ? file.name : editing ? `File saat ini: ${editing.filePath.split('/').pop()}` : 'Pilih file (PDF, DOC, DOCX, XLS, XLSX)...'}
                  </span>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files[0])} />
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-all">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50">
                  {saving ? 'Menyimpan...' : (editing ? 'Update' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-md border border-gray-100">
          <HiDocumentText className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Belum ada format dokumen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const ext = getFileExt(item.filePath);
            const extColor = extColors[ext] || 'bg-gray-100 text-gray-600';

            return (
              <div key={item.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 ${!item.aktif ? 'opacity-50' : ''}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${extColor}`}>
                  <span className="text-xs font-bold uppercase">{ext}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{item.nama}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                      {kategoriLabels[item.kategori] || item.kategori}
                    </span>
                    {!item.aktif && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Nonaktif</span>
                    )}
                  </div>
                  {item.deskripsi && <p className="text-xs text-gray-500 truncate mt-0.5">{item.deskripsi}</p>}
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.filePath.split('/').pop()}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a href={`${API_BASE}${item.filePath}`} download target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors" title="Download">
                    <HiDownload className="text-sm" />
                  </a>
                  <button onClick={() => handleToggleAktif(item)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.aktif ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`} title={item.aktif ? 'Nonaktifkan' : 'Aktifkan'}>
                    {item.aktif ? <HiEye className="text-sm" /> : <HiEyeOff className="text-sm" />}
                  </button>
                  <button onClick={() => openEdit(item)}
                    className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors" title="Edit">
                    <HiPencil className="text-sm" />
                  </button>
                  <button onClick={() => handleDelete(item)}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="Hapus">
                    <HiTrash className="text-sm" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        variant={confirmModal?.variant}
        confirmText={confirmModal?.confirmText}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}

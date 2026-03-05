import { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiOfficeBuilding, HiRefresh } from 'react-icons/hi';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import Select from '../../components/Select';

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/30 focus:border-green-400 outline-none text-sm text-gray-700 bg-white transition-all';

export default function AdminPengcabPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [syncing, setSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nama: '', kota: '', ketua: '', sekretaris: '', bendahara: '',
    alamat: '', phone: '', email: '', status: 'AKTIF'
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try { const { data } = await api.get('/pengcab'); setData(data); }
    catch { setData([]); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ nama: '', kota: '', ketua: '', sekretaris: '', bendahara: '', alamat: '', phone: '', email: '', status: 'AKTIF' });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({
      nama: item.nama, kota: item.kota, ketua: item.ketua,
      sekretaris: item.sekretaris || '', bendahara: item.bendahara || '',
      alamat: item.alamat || '', phone: item.phone || '', email: item.email || '',
      status: item.status
    });
    setEditing(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v); });
      if (form.logoFile) formData.append('logo', form.logoFile);

      if (editing) {
        await api.put(`/pengcab/${editing}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Pengcab berhasil diupdate');
      } else {
        await api.post('/pengcab', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Pengcab berhasil ditambahkan');
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan data');
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      title: 'Hapus Pengcab',
      message: 'Yakin ingin menghapus pengcab ini? Data yang dihapus tidak dapat dikembalikan.',
      variant: 'danger',
      confirmText: 'Ya, Hapus',
      onConfirm: async () => {
        try {
          await api.delete(`/pengcab/${id}`);
          toast.success('Pengcab berhasil dihapus');
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Gagal menghapus');
        } finally { setConfirmModal(null); }
      },
    });
  };

  const handleSyncForbasi = () => {
    setConfirmModal({
      title: 'Sync FORBASI',
      message: 'Sync data pengcab dari FORBASI (forbasi.or.id)?\nData akan diperbarui dari API pusat.',
      variant: 'info',
      confirmText: 'Ya, Sync',
      onConfirm: async () => {
        setConfirmModal(null);
        setSyncing(true);
        try {
          const { data: result } = await api.post('/pengcab/sync-forbasi');
          toast.success(`${result.message} (Total API: ${result.totalFromApi})`);
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Gagal sync dari FORBASI');
        } finally {
          setSyncing(false);
        }
      },
    });
  };

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Pengurus Cabang</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola data pengurus cabang Pengda Kalbar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSyncForbasi} disabled={syncing}
            className="flex items-center bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-sky-300 disabled:to-sky-400 text-white px-4 py-2.5 rounded-xl font-bold transition-all active:scale-[0.97] shadow-lg shadow-sky-500/20 text-sm">
            <HiRefresh className={`mr-1.5 ${syncing ? 'animate-spin' : ''}`} size={16} /> {syncing ? 'Syncing...' : 'Sync FORBASI'}
          </button>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-[0.97] shadow-lg shadow-green-500/20 text-sm">
            <HiPlus className="mr-1" size={16} /> Tambah
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm shadow-gray-100/50">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">{editing ? 'Edit Pengcab' : 'Tambah Pengcab Baru'}</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'nama', label: 'Nama Pengcab', required: true },
                { name: 'kota', label: 'Kota/Kabupaten', required: true },
                { name: 'ketua', label: 'Ketua', required: true },
                { name: 'sekretaris', label: 'Sekretaris' },
                { name: 'bendahara', label: 'Bendahara' },
                { name: 'phone', label: 'Telepon' },
                { name: 'email', label: 'Email', type: 'email' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{f.label} {f.required && <span className="text-rose-400">*</span>}</label>
                  <input type={f.type || 'text'} name={f.name} value={form[f.name]} onChange={handleChange} required={f.required}
                    className={inputClass} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                <Select name="status" value={form.status} onChange={handleChange}>
                  <option value="AKTIF">Aktif</option>
                  <option value="NONAKTIF">Non-Aktif</option>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Alamat</label>
              <textarea name="alamat" value={form.alamat} onChange={handleChange} rows={2} className={inputClass} />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Logo</label>
              <input type="file" accept="image/*" onChange={e => setForm({ ...form, logoFile: e.target.files[0] })}
                className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-semibold file:cursor-pointer" />
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button type="submit" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97] shadow-lg shadow-green-500/20">
                {editing ? 'Update' : 'Simpan'}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                Batal
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Data */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm shadow-gray-100/50">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm table-modern">
              <thead>
                <tr className="bg-gray-50/60">
                  {['#', 'Nama', 'Kota/Kab', 'Username', 'Email', 'Telepon', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {paginatedData.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3.5 text-gray-400 text-xs font-mono">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900">{item.nama}</div>
                      {item.forbasiId && <span className="text-[10px] text-gray-400 font-mono">ID #{item.forbasiId}</span>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{item.kota}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs font-mono">{item.username || '-'}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{item.email || '-'}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{item.phone || '-'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${item.status === 'AKTIF' ? 'bg-green-500/10 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'AKTIF' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:bg-sky-50 hover:text-sky-600 transition-colors"><HiPencil size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"><HiTrash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-gray-100/60 mobile-card-list">
            {paginatedData.map((item) => (
              <div key={item.id} className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.nama}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{item.kota}</p>
                    {item.forbasiId && <span className="text-[10px] text-gray-400 font-mono">ID #{item.forbasiId}</span>}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ml-2 shrink-0 ${item.status === 'AKTIF' ? 'bg-green-500/10 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'AKTIF' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500 mb-3">
                  {item.username && <p><span className="font-medium text-gray-600">User:</span> {item.username}</p>}
                  {item.email && <p><span className="font-medium text-gray-600">Email:</span> {item.email}</p>}
                  {item.phone && <p><span className="font-medium text-gray-600">Telp:</span> {item.phone}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)}
                    className="flex items-center gap-1.5 text-xs bg-sky-500/10 text-sky-700 px-3.5 py-2 rounded-xl font-semibold hover:bg-sky-500/15 transition-colors">
                    <HiPencil size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1.5 text-xs bg-rose-500/10 text-rose-600 px-3.5 py-2 rounded-xl font-semibold hover:bg-rose-500/15 transition-colors">
                    <HiTrash size={13} /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <HiOfficeBuilding className="text-3xl text-gray-300" />
              </div>
              <p className="font-semibold text-gray-500 text-sm">Belum ada data pengcab</p>
              <p className="text-xs text-gray-400 mt-1">Tambah atau sync data dari FORBASI</p>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={data.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
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

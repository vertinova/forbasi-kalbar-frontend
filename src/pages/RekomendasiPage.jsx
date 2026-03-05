import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiDocumentText, HiPlus, HiTrash, HiEye } from 'react-icons/hi';
import api from '../lib/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import Select from '../components/Select';

const statusColor = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  DISETUJUI: 'bg-green-100 text-green-700',
  DITOLAK: 'bg-red-100 text-red-700',
};

export default function RekomendasiPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);
  const [pengcabList, setPengcabList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({
    namaEvent: '', jenisEvent: '', tanggalMulai: '', tanggalSelesai: '',
    lokasi: '', deskripsi: '', penyelenggara: '', kontakPerson: '', pengcabId: ''
  });

  useEffect(() => {
    fetchData();
    api.get('/pengcab').then(res => setPengcabList(res.data)).catch(() => {});
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/rekomendasi');
      setData(data);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { 
        if (v && k !== 'dokumenSurat' && k !== 'poster') formData.append(k, v); 
      });
      if (form.dokumenSurat) formData.append('dokumenSurat', form.dokumenSurat);
      if (form.poster) formData.append('poster', form.poster);

      await api.post('/rekomendasi', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Permohonan rekomendasi berhasil diajukan');
      setShowForm(false);
      setForm({ namaEvent: '', jenisEvent: '', tanggalMulai: '', tanggalSelesai: '', lokasi: '', deskripsi: '', penyelenggara: '', kontakPerson: '', pengcabId: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengajukan rekomendasi');
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      title: 'Hapus Permohonan',
      message: 'Yakin ingin menghapus permohonan ini? Data yang dihapus tidak dapat dikembalikan.',
      variant: 'danger',
      confirmText: 'Ya, Hapus',
      onConfirm: async () => {
        try {
          await api.delete(`/rekomendasi/${id}`);
          toast.success('Data berhasil dihapus');
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Gagal menghapus');
        } finally { setConfirmModal(null); }
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">Izin Rekomendasi Event</h1>
          <p className="text-gray-500">Kelola permohonan izin rekomendasi event baris-berbaris</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 sm:mt-0 flex items-center bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
        >
          <HiPlus className="mr-2" /> Ajukan Permohonan
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100">
          <h3 className="font-bold text-gray-800 text-xl mb-6">Form Permohonan Rekomendasi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Event *</label>
              <input type="text" name="namaEvent" value={form.namaEvent} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Event *</label>
              <Select name="jenisEvent" value={form.jenisEvent} onChange={handleChange} required>
                <option value="">Pilih Jenis</option>
                <option value="Lomba">Lomba</option>
                <option value="Festival">Festival</option>
                <option value="Pelatihan">Pelatihan</option>
                <option value="Seminar">Seminar</option>
                <option value="Lainnya">Lainnya</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Mulai *</label>
              <input type="date" name="tanggalMulai" value={form.tanggalMulai} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Selesai *</label>
              <input type="date" name="tanggalSelesai" value={form.tanggalSelesai} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi *</label>
              <input type="text" name="lokasi" value={form.lokasi} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Penyelenggara *</label>
              <input type="text" name="penyelenggara" value={form.penyelenggara} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kontak Person</label>
              <input type="text" name="kontakPerson" value={form.kontakPerson} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pengcab Terkait</label>
              <Select name="pengcabId" value={form.pengcabId} onChange={handleChange}>
                <option value="">Pilih Pengcab (opsional)</option>
                {pengcabList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
            <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-700" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Dokumen Surat (PDF/Gambar)</label>
            <input type="file" onChange={e => setForm({ ...form, dokumenSurat: e.target.files[0] })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Poster/Pamflet Event (Gambar)</label>
            <p className="text-xs text-gray-500 mb-2">Poster akan ditampilkan di halaman utama jika pengajuan disetujui</p>
            <input type="file" accept="image/*" onChange={e => setForm({ ...form, poster: e.target.files[0] })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium" />
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg">
              Kirim Permohonan
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium">
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">{detail.namaEvent}</h3>
            <div className="space-y-3 text-sm">
              <div><span className="font-semibold text-gray-500">Jenis:</span> <span className="text-gray-700">{detail.jenisEvent}</span></div>
              <div><span className="font-semibold text-gray-500">Tanggal:</span> <span className="text-gray-700">{new Date(detail.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(detail.tanggalSelesai).toLocaleDateString('id-ID')}</span></div>
              <div><span className="font-semibold text-gray-500">Lokasi:</span> <span className="text-gray-700">{detail.lokasi}</span></div>
              <div><span className="font-semibold text-gray-500">Penyelenggara:</span> <span className="text-gray-700">{detail.penyelenggara}</span></div>
              <div><span className="font-semibold text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor[detail.status]}`}>{detail.status}</span></div>
              {detail.catatanAdmin && <div><span className="font-semibold text-gray-500">Catatan Admin:</span> <span className="text-gray-700">{detail.catatanAdmin}</span></div>}
              {detail.deskripsi && <div><span className="font-semibold text-gray-500">Deskripsi:</span> <p className="text-gray-700 mt-1">{detail.deskripsi}</p></div>}
            </div>
            <button onClick={() => setDetail(null)} className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-all">Tutup</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HiDocumentText className="text-6xl mx-auto mb-4" />
          <p className="text-lg">Belum ada permohonan rekomendasi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{item.namaEvent}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {item.jenisEvent} &middot; {item.lokasi} &middot; {new Date(item.tanggalMulai).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Penyelenggara: {item.penyelenggara}</p>
                </div>
                <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusColor[item.status]}`}>
                    {item.status}
                  </span>
                  <button onClick={() => setDetail(item)} className="text-blue-600 hover:text-blue-700 p-2"><HiEye size={20} /></button>
                  {item.status === 'PENDING' && (
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 p-2"><HiTrash size={20} /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
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

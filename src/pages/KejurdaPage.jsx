import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiFlag, HiCalendar, HiLocationMarker, HiUserGroup, HiGlobe } from 'react-icons/hi';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { CATEGORIES, jenisLabel as staticJenisLabel, colorMap } from '../lib/categories';
import Select from '../components/Select';

export default function KejurdaPage() {
  const { user } = useAuth();
  const [kejurda, setKejurda] = useState([]);
  const categories = CATEGORIES;
  const [pengcabList, setPengcabList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(null);
  const [form, setForm] = useState({ namaAtlet: '', kategori: '', kelasTanding: '', pengcabId: '' });

  useEffect(() => {
    api.get('/kejurda/open').then(res => setKejurda(res.data)).catch(() => {}).finally(() => setLoading(false));
    api.get('/pengcab').then(res => setPengcabList(res.data)).catch(() => {});
  }, []);

  // Static label/gradient maps
  const jenisLabel = staticJenisLabel;
  const jenisGradient = Object.fromEntries(categories.map(c => [c.kode, (colorMap[c.warna] || colorMap.green).gradient]));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Silakan login terlebih dahulu');
    try {
      const formData = new FormData();
      formData.append('kejurdaId', showForm);
      formData.append('namaAtlet', form.namaAtlet);
      formData.append('kategori', form.kategori);
      formData.append('kelasTanding', form.kelasTanding);
      if (form.pengcabId) formData.append('pengcabId', form.pengcabId);
      if (form.dokumen) formData.append('dokumen', form.dokumen);

      await api.post('/pendaftaran', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Pendaftaran berhasil diajukan!');
      setShowForm(null);
      setForm({ namaAtlet: '', kategori: '', kelasTanding: '', pengcabId: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Event & Kegiatan
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4">Event FORBASI Kalimantan Barat</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Daftar event dan kegiatan yang sedang membuka pendaftaran
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
        </div>
      ) : kejurda.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HiFlag className="text-6xl mx-auto mb-4" />
          <p className="text-lg">Belum ada event yang terbuka saat ini</p>
        </div>
      ) : (
        <div className="space-y-8">
          {kejurda.map((k) => (
            <div key={k.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className={`bg-gradient-to-r ${jenisGradient[k.jenisEvent] || jenisGradient.KEJURDA} p-6 sm:p-8`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block text-white/80 text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                        {jenisLabel[k.jenisEvent] || 'Event'}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        k.targetPeserta === 'UMUM' 
                          ? 'bg-blue-500/30 text-white' 
                          : 'bg-green-500/30 text-white'
                      }`}>
                        {k.targetPeserta === 'UMUM' ? (
                          <><HiGlobe className="w-3 h-3" /> Umum</>
                        ) : (
                          <><HiUserGroup className="w-3 h-3" /> Club</>
                        )}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{k.namaKejurda}</h2>
                    <div className="flex flex-wrap gap-4 text-green-100 text-sm">
                      <span className="flex items-center"><HiCalendar className="mr-1" />
                        {new Date(k.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' - '}
                        {new Date(k.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="flex items-center"><HiLocationMarker className="mr-1" /> {k.lokasi}</span>
                    </div>
                  </div>
                  <span className="mt-4 sm:mt-0 inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    Pendaftaran Dibuka
                  </span>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-gray-600 mb-6 leading-relaxed">{k.deskripsi}</p>
                
                {showForm === k.id ? (
                  <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">Form Pendaftaran</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Atlet / Tim</label>
                        <input type="text" name="namaAtlet" value={form.namaAtlet} onChange={handleChange} required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                        <Select name="kategori" value={form.kategori} onChange={handleChange} required>
                          <option value="">Pilih Kategori</option>
                          <option value="Baris Berbaris">Baris Berbaris</option>
                          <option value="Paskibra">Paskibra</option>
                          <option value="Drumband">Drumband</option>
                          <option value="Color Guard">Color Guard</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Kelas Tanding</label>
                        <input type="text" name="kelasTanding" value={form.kelasTanding} onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-700"
                          placeholder="Pleton / Perorangan" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Pengcab Asal</label>
                        <Select name="pengcabId" value={form.pengcabId} onChange={handleChange}>
                          <option value="">Pilih Pengcab</option>
                          {pengcabList.map(p => <option key={p.id} value={p.id}>{p.nama} - {p.kota}</option>)}
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Dokumen Pendukung (PDF/Gambar)</label>
                      <input type="file" onChange={e => setForm({ ...form, dokumen: e.target.files[0] })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium" />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg text-white ${
                        k.targetPeserta === 'UMUM' 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}>
                        Kirim Pendaftaran
                      </button>
                      <button type="button" onClick={() => setShowForm(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all">
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {/* Target Peserta Info */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
                      k.targetPeserta === 'UMUM' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {k.targetPeserta === 'UMUM' ? (
                        <><HiGlobe className="w-4 h-4" /> Dapat diikuti oleh siapa saja</>
                      ) : (
                        <><HiUserGroup className="w-4 h-4" /> Khusus anggota club FORBASI</>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          if (k.targetPeserta === 'CLUB' && !user) {
                            toast.error('Event ini khusus untuk anggota club. Silakan login terlebih dahulu.');
                          } else {
                            setShowForm(k.id);
                          }
                        }}
                        className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg text-white ${
                          k.targetPeserta === 'UMUM'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-300/30'
                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-green-300/30'
                        }`}
                      >
                        Daftar Sekarang
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

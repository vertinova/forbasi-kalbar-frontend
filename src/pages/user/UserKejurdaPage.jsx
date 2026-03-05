import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  HiFlag, HiCalendar, HiLocationMarker,
  HiCheckCircle, HiViewGrid
} from 'react-icons/hi';
import api, { getUploadUrl } from '../../lib/api';
import toast from 'react-hot-toast';
import { CATEGORIES, colorMap } from '../../lib/categories';

export default function UserKejurdaPage() {
  const { user } = useAuth();
  const [eventList, setEventList] = useState([]);
  const categories = CATEGORIES;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [showForm, setShowForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ namaAtlet: '', kategori: '', kelasTanding: '' });

  useEffect(() => {
    api.get('/kejurda/open').then(res => setEventList(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Static config from categories
  const jenisConfig = Object.fromEntries(
    categories.map(c => [c.kode, { label: c.nama, badge: (colorMap[c.warna] || colorMap.green).badge }])
  );
  jenisConfig.ALL = { label: 'Semua', badge: 'bg-gray-100 text-gray-700' };

  const filtered = activeTab === 'ALL'
    ? eventList
    : eventList.filter(e => (e.jenisEvent || 'KEJURDA') === activeTab);

  const handleSubmit = async (kejurdaId) => {
    if (!form.namaAtlet.trim()) return toast.error('Nama atlet harus diisi');
    if (!form.kategori.trim()) return toast.error('Kategori harus diisi');
    setSubmitting(true);
    try {
      const profile = (await api.get('/auth/profile')).data;
      await api.post('/pendaftaran', {
        kejurdaId,
        namaAtlet: form.namaAtlet.trim(),
        kategori: form.kategori.trim(),
        kelasTanding: form.kelasTanding.trim() || null,
        pengcabId: profile.pengcabId || null,
      });
      toast.success('Pendaftaran berhasil!');
      setShowForm(null);
      setForm({ namaAtlet: '', kategori: '', kelasTanding: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { key: 'ALL', label: 'Semua', count: eventList.length },
    ...categories.map(cat => ({
      key: cat.kode,
      label: cat.nama,
      count: eventList.filter(e => (e.jenisEvent || 'KEJURDA') === cat.kode).length,
    })),
  ].filter(t => t.key === 'ALL' || t.count > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-[3px] border-gray-200" />
          <div className="w-12 h-12 rounded-full border-[3px] border-green-600 border-t-transparent animate-spin absolute inset-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Event & Kegiatan</h1>
        <p className="text-xs text-gray-500 mt-1">Temukan dan daftar kompetisi, latihan, workshop & kegiatan lainnya</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold ${
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Event List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiViewGrid className="text-3xl text-gray-300" />
          </div>
          <p className="text-gray-500 font-semibold text-sm">
            {activeTab === 'ALL' ? 'Belum ada kompetisi yang dibuka' : `Belum ada ${jenisConfig[activeTab]?.label || 'event'} yang dibuka`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Cek kembali nanti untuk event terbaru</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(kj => {
            const jenis = kj.jenisEvent || 'KEJURDA';
            const cfg = jenisConfig[jenis] || { label: jenis, badge: 'bg-gray-100 text-gray-700' };
            return (
              <div key={kj.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Poster */}
                {kj.poster && (
                  <div className="h-40 sm:h-48 bg-gray-100 overflow-hidden">
                    <img src={getUploadUrl(kj.poster)} alt={kj.namaKejurda}
                      className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                  </div>
                )}

                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg">{kj.namaKejurda}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><HiCalendar className="text-gray-400" />{new Date(kj.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(kj.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="text-gray-300">&middot;</span>
                        <span className="flex items-center gap-0.5"><HiLocationMarker className="text-gray-400" />{kj.lokasi}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-600 ring-1 ring-green-200 flex-shrink-0 ml-2">
                      <HiCheckCircle className="text-xs" /> Buka
                    </span>
                  </div>

                  {kj.deskripsi && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{kj.deskripsi}</p>
                  )}

                  {showForm === kj.id ? (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                      <h4 className="text-sm font-bold text-gray-800">Form Pendaftaran</h4>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Atlet *</label>
                        <input type="text" value={form.namaAtlet} onChange={e => setForm({ ...form, namaAtlet: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                          placeholder="Nama lengkap atlet" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori *</label>
                        <input type="text" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                          placeholder="Contoh: Baris Kreasi, Baris Wajib, dll" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Kelas Tanding</label>
                        <input type="text" value={form.kelasTanding} onChange={e => setForm({ ...form, kelasTanding: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                          placeholder="Opsional" />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleSubmit(kj.id)} disabled={submitting}
                          className="flex-1 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 shadow-lg shadow-green-200/30">
                          {submitting ? 'Mendaftar...' : 'Kirim Pendaftaran'}
                        </button>
                        <button onClick={() => { setShowForm(null); setForm({ namaAtlet: '', kategori: '', kelasTanding: '' }); }}
                          className="px-4 py-2.5 bg-white text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition border border-gray-200">
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowForm(kj.id)}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-sm rounded-xl hover:from-green-500 hover:to-green-600 transition-all shadow-lg shadow-green-200/30 active:scale-[0.98]">
                      Daftar Sekarang
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

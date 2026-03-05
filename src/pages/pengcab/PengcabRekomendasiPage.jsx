import { useEffect, useState } from 'react';
import { HiCheck, HiX, HiEye, HiSearch } from 'react-icons/hi';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import PersyaratanDetail from '../../components/PersyaratanDetail';
import MataLombaDetail from '../../components/MataLombaDetail';
import Select from '../../components/Select';

export default function PengcabRekomendasiPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [detail, setDetail] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pengcab-panel/rekomendasi');
      setItems(data);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/pengcab-panel/rekomendasi/${id}/approve`);
      toast.success('Rekomendasi disetujui');
      fetchData();
      setDetail(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyetujui');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/pengcab-panel/rekomendasi/${id}/reject`);
      toast.success('Rekomendasi ditolak');
      fetchData();
      setDetail(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menolak');
    }
  };

  const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED_PENGCAB: 'bg-green-100 text-green-700',
    DISETUJUI: 'bg-green-100 text-green-700',
    DITOLAK: 'bg-red-100 text-red-700',
  };
  const statusLabel = {
    PENDING: 'Menunggu',
    APPROVED_PENGCAB: 'Disetujui Pengcab',
    DISETUJUI: 'Disetujui Pengda',
    DITOLAK: 'Ditolak',
  };

  const filtered = items.filter(i => {
    const matchSearch = i.namaEvent.toLowerCase().includes(search.toLowerCase()) ||
      i.penyelenggara.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Rekomendasi Event</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama event atau penyelenggara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <Select full={false}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Semua Status</option>
          <option value="PENDING">Menunggu</option>
          <option value="APPROVED_PENGCAB">Disetujui Pengcab</option>
          <option value="DISETUJUI">Disetujui Pengda</option>
          <option value="DITOLAK">Ditolak</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Belum ada rekomendasi event</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-800">{item.namaEvent}</h4>
                  <p className="text-sm text-gray-500">{item.penyelenggara}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor[item.status]}`}>
                  {statusLabel[item.status]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                <p>📅 {new Date(item.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(item.tanggalSelesai).toLocaleDateString('id-ID')}</p>
                <p>📍 {item.tempatEvent}</p>
                <p>👤 {item.user?.namaLengkap || '-'}</p>
                <p>🏢 {item.pengcab?.nama || '-'}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setDetail(item)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                  <HiEye size={16} /> Detail
                </button>
                {item.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleApprove(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                      <HiCheck size={16} /> Setujui
                    </button>
                    <button onClick={() => handleReject(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                      <HiX size={16} /> Tolak
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Detail Rekomendasi</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div><span className="font-semibold text-gray-700">Nama Event:</span> {detail.namaEvent}</div>
              <div><span className="font-semibold text-gray-700">Penyelenggara:</span> {detail.penyelenggara}</div>
              <div><span className="font-semibold text-gray-700">Tempat:</span> {detail.tempatEvent}</div>
              <div><span className="font-semibold text-gray-700">Tanggal:</span> {new Date(detail.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(detail.tanggalSelesai).toLocaleDateString('id-ID')}</div>
              <div><span className="font-semibold text-gray-700">Jenis Event:</span> {detail.jenisEvent}</div>
              <div><span className="font-semibold text-gray-700">Diajukan oleh:</span> {detail.user?.namaLengkap || '-'}</div>
              <div><span className="font-semibold text-gray-700">Pengcab:</span> {detail.pengcab?.nama || '-'}</div>
              {detail.keterangan && (
                <div><span className="font-semibold text-gray-700">Keterangan:</span> {detail.keterangan}</div>
              )}
              {detail.dokumen && (
                <div>
                  <span className="font-semibold text-gray-700">Dokumen:</span>{' '}
                  <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${detail.dokumen}`}
                    target="_blank" rel="noopener noreferrer" className="text-green-600 underline">
                    Lihat Dokumen
                  </a>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">Status:</span>{' '}
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[detail.status]}`}>
                  {statusLabel[detail.status]}
                </span>
              </div>
            </div>

            {/* Proposal Kegiatan */}
            {detail.proposal && (
              <div className="mt-5 pt-4 border-t border-gray-200">
                <h4 className="font-bold text-gray-800 text-sm mb-2">Proposal Kegiatan</h4>
                <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${detail.proposal}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 text-xs font-bold rounded-lg hover:bg-sky-100 transition border border-sky-200">
                  Lihat Proposal
                </a>
              </div>
            )}

            {/* Mata Lomba Section */}
            {detail.mataLomba && Object.keys(detail.mataLomba).length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-200">
                <h4 className="font-bold text-gray-800 text-sm mb-3">Mata Lomba</h4>
                <MataLombaDetail mataLomba={detail.mataLomba} />
              </div>
            )}

            {/* Persyaratan Section */}
            {detail.persyaratan && Object.keys(detail.persyaratan).length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-200">
                <h4 className="font-bold text-gray-800 text-sm mb-3">Persyaratan Event</h4>
                <PersyaratanDetail persyaratan={detail.persyaratan} />
              </div>
            )}

            <div className="flex gap-2 mt-6">
              {detail.status === 'PENDING' && (
                <>
                  <button onClick={() => handleApprove(detail.id)}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
                    Setujui
                  </button>
                  <button onClick={() => handleReject(detail.id)}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">
                    Tolak
                  </button>
                </>
              )}
              <button onClick={() => setDetail(null)}
                className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

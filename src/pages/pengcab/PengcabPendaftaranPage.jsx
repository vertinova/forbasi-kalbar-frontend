import { useEffect, useState } from 'react';
import { HiSearch, HiEye } from 'react-icons/hi';
import api from '../../lib/api';

export default function PengcabPendaftaranPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/pengcab-panel/pendaftaran');
        setItems(data);
      } catch { setItems([]); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

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

  const filtered = items.filter(i =>
    i.namaAtlet?.toLowerCase().includes(search.toLowerCase()) ||
    i.kejurda?.namaKejurda?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Pendaftaran Kejurda</h2>

      {/* Search */}
      <div className="relative mb-6">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama atlet atau kejurda..."
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
          <p className="text-lg">Belum ada pendaftaran kejurda</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm table-modern">
              <thead className="bg-green-50">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-green-700">Nama Atlet</th>
                  <th className="text-left px-5 py-3 font-semibold text-green-700">Kejurda</th>
                  <th className="text-left px-5 py-3 font-semibold text-green-700">Kategori</th>
                  <th className="text-left px-5 py-3 font-semibold text-green-700">Status</th>
                  <th className="text-center px-5 py-3 font-semibold text-green-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-700">{item.namaAtlet}</td>
                    <td className="px-5 py-3 text-gray-600">{item.kejurda?.namaKejurda || '-'}</td>
                    <td className="px-5 py-3 text-gray-600">{item.kategori || '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[item.status]}`}>
                        {statusLabel[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => setDetail(item)}
                        className="text-green-600 hover:text-green-800">
                        <HiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.map(item => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm">{item.namaAtlet}</h4>
                    <p className="text-xs text-gray-500">{item.kejurda?.namaKejurda || '-'}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ml-2 shrink-0 ${statusColor[item.status]}`}>
                    {statusLabel[item.status] || item.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500"><span className="font-medium">Kategori:</span> {item.kategori || '-'}</p>
                  <button onClick={() => setDetail(item)}
                    className="flex items-center text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium">
                    <HiEye size={14} className="mr-1" /> Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Detail Pendaftaran</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div><span className="font-semibold text-gray-700">Nama Atlet:</span> {detail.namaAtlet}</div>
              <div><span className="font-semibold text-gray-700">Kejurda:</span> {detail.kejurda?.namaKejurda || '-'}</div>
              <div><span className="font-semibold text-gray-700">Kategori:</span> {detail.kategori || '-'}</div>
              <div><span className="font-semibold text-gray-700">Kelas:</span> {detail.kelas || '-'}</div>
              <div><span className="font-semibold text-gray-700">Pengcab:</span> {detail.pengcab?.nama || '-'}</div>
              {detail.dokumen && (
                <div>
                  <span className="font-semibold text-gray-700">Dokumen:</span>{' '}
                  <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${detail.dokumen}`}
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
            <button onClick={() => setDetail(null)}
              className="w-full mt-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

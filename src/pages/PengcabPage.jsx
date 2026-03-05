import { useEffect, useState } from 'react';
import { HiOfficeBuilding, HiPhone, HiMail, HiLocationMarker, HiSearch } from 'react-icons/hi';
import api, { getUploadUrl } from '../lib/api';

export default function PengcabPage() {
  const [pengcab, setPengcab] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPengcab();
  }, []);

  const fetchPengcab = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/pengcab', { params: { search: q } });
      setPengcab(data);
    } catch { setPengcab([]); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPengcab(search);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Pengurus Cabang
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4">
          Pengcab FORBASI Kalimantan Barat
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
          Daftar pengurus cabang Forum Baris Indonesia di seluruh kota/kabupaten se-Kalimantan Barat.
          Data dari <span className="font-semibold text-green-700">forbasi.or.id</span>
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-10">
        <div className="relative">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari pengcab berdasarkan nama atau kota..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-sm text-gray-700"
          />
        </div>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
        </div>
      ) : pengcab.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HiOfficeBuilding className="text-6xl mx-auto mb-4" />
          <p className="text-lg">Belum ada data pengcab</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pengcab.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden group">
              <div className="bg-gradient-to-r from-green-700 to-green-800 p-5">
                <div className="flex items-center space-x-3">
                  {p.logo ? (
                    <img src={getUploadUrl(p.logo)} alt="" className="w-12 h-12 rounded-full bg-white object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <HiOfficeBuilding className="text-white text-xl" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold text-lg">{p.nama}</h3>
                    <p className="text-green-200 text-sm">{p.kota}</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {p.username && (
                  <div className="flex items-start space-x-2 text-sm">
                    <span className="text-gray-500 font-medium min-w-[80px]">Username:</span>
                    <span className="text-gray-700 font-mono text-xs bg-gray-50 px-2 py-0.5 rounded">{p.username}</span>
                  </div>
                )}
                {p.ketua && p.ketua !== 'Belum ditentukan' && (
                  <div className="flex items-start space-x-2 text-sm">
                    <span className="text-gray-500 font-medium min-w-[80px]">Ketua:</span>
                    <span className="text-gray-700 font-semibold">{p.ketua}</span>
                  </div>
                )}
                {p.alamat && (
                  <div className="flex items-start space-x-2 text-sm">
                    <HiLocationMarker className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{p.alamat}</span>
                  </div>
                )}
                <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
                  {p.phone && (
                    <span className="flex items-center text-sm text-gray-500">
                      <HiPhone className="mr-1" /> {p.phone}
                    </span>
                  )}
                  {p.email && (
                    <span className="flex items-center text-sm text-gray-500">
                      <HiMail className="mr-1" /> {p.email}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${p.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.status === 'AKTIF' ? 'Aktif' : 'Non-Aktif'}
                  </span>
                  {p.forbasiId && (
                    <span className="text-[10px] text-gray-400 font-mono">FORBASI #{p.forbasiId}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { HiX, HiDownload, HiDocumentText, HiSearch } from 'react-icons/hi';
import api, { getUploadUrl } from '../lib/api';

const kategoriLabels = {
  umum: 'Umum',
  administratif: 'Administratif',
  perangkat: 'Perangkat Perlombaan',
  prasarana: 'Prasarana & Sarana',
  peserta: 'Peserta',
  penghargaan: 'Penghargaan',
};

export default function FormatDokumenModal({ open, onClose }) {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      setLoading(true);
      api.get('/format-dokumen')
        .then(res => setFormats(res.data))
        .catch(() => setFormats([]))
        .finally(() => setLoading(false));
    }
  }, [open]);

  if (!open) return null;

  const filtered = formats.filter(f =>
    f.nama.toLowerCase().includes(search.toLowerCase()) ||
    (f.deskripsi || '').toLowerCase().includes(search.toLowerCase())
  );

  // Group by kategori
  const grouped = {};
  filtered.forEach(f => {
    if (!grouped[f.kategori]) grouped[f.kategori] = [];
    grouped[f.kategori].push(f);
  });

  const getFileExt = (path) => {
    const ext = path.split('.').pop().toLowerCase();
    return ext;
  };

  const extColors = {
    docx: 'bg-blue-100 text-blue-700',
    doc: 'bg-blue-100 text-blue-700',
    pdf: 'bg-red-100 text-red-700',
    xlsx: 'bg-green-100 text-green-700',
    xls: 'bg-green-100 text-green-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-800 text-base">Format Dokumen</h2>
            <p className="text-xs text-gray-500">Download contoh format dokumen yang diperlukan</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <HiX className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-50 flex-shrink-0">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari format dokumen..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700" />
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-10">
              <HiDocumentText className="text-4xl text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                {search ? 'Tidak ada format dokumen yang cocok' : 'Belum ada format dokumen tersedia'}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([kategori, items]) => (
                <div key={kategori}>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {kategoriLabels[kategori] || kategori}
                  </h3>
                  <div className="space-y-2">
                    {items.map(item => {
                      const ext = getFileExt(item.filePath);
                      const extColor = extColors[ext] || 'bg-gray-100 text-gray-600';

                      return (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all group">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${extColor}`}>
                            <span className="text-[10px] font-bold uppercase">{ext}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{item.nama}</p>
                            {item.deskripsi && (
                              <p className="text-xs text-gray-500 truncate">{item.deskripsi}</p>
                            )}
                          </div>
                          <a
                            href={getUploadUrl(item.filePath)}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center hover:bg-amber-200 transition-colors group-hover:scale-105 active:scale-95"
                          >
                            <HiDownload className="text-lg" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

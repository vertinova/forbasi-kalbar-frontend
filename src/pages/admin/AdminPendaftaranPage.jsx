import { useEffect, useState, useMemo, useCallback } from 'react';
import { HiUsers, HiCheck, HiX, HiSearch, HiClipboardList, HiEye, HiPhone, HiLocationMarker, HiCurrencyDollar, HiPhotograph, HiExternalLink, HiCash, HiShieldCheck, HiExclamationCircle, HiFilter, HiChevronDown, HiDownload, HiTrash } from 'react-icons/hi';
import api, { getUploadUrl } from '../../lib/api';
import toast from 'react-hot-toast';
import Pagination from '../../components/Pagination';
import * as XLSX from 'xlsx';

import { CATEGORIES, colorMap } from '../../lib/categories';

const statusConfig = {
  PENDING: { label: 'Menunggu', bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500' },
  DISETUJUI: { label: 'Disetujui', bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' },
  DITOLAK: { label: 'Ditolak', bg: 'bg-rose-500/10', text: 'text-rose-600', dot: 'bg-rose-500' },
};

const jenisLabel = Object.fromEntries(CATEGORIES.map(c => [c.kode, c.nama]));
const jenisBadge = Object.fromEntries(CATEGORIES.map(c => {
  const cm = colorMap[c.warna] || colorMap.green;
  return [c.kode, cm.badge];
}));

// Category tab configs with gradient colors
const categoryTabs = [
  { key: '', label: 'Semua', icon: HiClipboardList, gradient: 'from-gray-700 to-gray-900', lightBg: 'bg-gray-100', lightText: 'text-gray-700' },
  ...CATEGORIES.map(c => {
    const cm = colorMap[c.warna] || colorMap.green;
    return { key: c.kode, label: c.nama, icon: c.Icon, gradient: cm.gradient, lightBg: cm.lightBg || 'bg-gray-100', lightText: cm.lightText || 'text-gray-700' };
  }),
];

export default function AdminPendaftaranPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [catatanModal, setCatatanModal] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [filterStatus, filterCategory, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pendaftaran');
      setData(data);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  // Filtered data based on category, status, and search
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchCategory = !filterCategory || item.kejurda?.jenisEvent === filterCategory;
      const matchStatus = !filterStatus || item.status === filterStatus;
      const matchSearch = !searchQuery ||
        (item.namaAtlet || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.kejurda?.namaKejurda || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchStatus && matchSearch;
    });
  }, [data, filterCategory, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/pendaftaran/${id}/status`, { status, catatanAdmin: catatan });
      toast.success(`Status diubah menjadi ${status}`);
      setCatatanModal(null);
      setCatatan('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/pendaftaran/${id}`);
      toast.success('Data pendaftaran berhasil dihapus');
      setDeleteModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus data');
    }
  };

  // Stats — computed from filtered data
  const stats = useMemo(() => {
    const d = filterCategory ? data.filter(i => i.kejurda?.jenisEvent === filterCategory) : data;
    const totalNominal = d.reduce((sum, item) => {
      const dp = item.dataPersyaratan || {};
      return sum + (parseInt(dp.nominalBayar || dp.nominalDP || dp.nominalPembayaran || 0) || 0);
    }, 0);
    return {
      total: d.length,
      nominal: totalNominal,
      pending: d.filter(i => i.status === 'PENDING').length,
      disetujui: d.filter(i => i.status === 'DISETUJUI').length,
    };
  }, [data, filterCategory]);

  const formatCurrency = (val) => `Rp ${parseInt(val).toLocaleString('id-ID')}`;

  // Count per category
  const getCatCount = (key) => {
    if (!key) return data.length;
    return data.filter(i => i.kejurda?.jenisEvent === key).length;
  };

  const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  const PaymentBadge = ({ dp }) => {
    if (!dp?.isBookingDP) return null;
    const st = dp.statusPembayaran || 'DP';
    const cfgs = {
      DP: { label: 'DP', bg: 'bg-orange-100', text: 'text-orange-700' },
      MENUNGGU_VERIFIKASI: { label: 'Perlu Verifikasi', bg: 'bg-blue-100', text: 'text-blue-700' },
      LUNAS: { label: 'Lunas', bg: 'bg-green-100', text: 'text-green-700' },
      DITOLAK_PELUNASAN: { label: 'Pelunasan Ditolak', bg: 'bg-red-100', text: 'text-red-700' },
    };
    const cfg = cfgs[st] || cfgs.DP;
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}>
        {st === 'MENUNGGU_VERIFIKASI' && <HiExclamationCircle size={12} />}
        {st === 'LUNAS' && <HiShieldCheck size={12} />}
        {st === 'DITOLAK_PELUNASAN' && <HiX size={12} />}
        {cfg.label}
      </span>
    );
  };

  // Active category tab config
  const activeTabCfg = categoryTabs.find(t => t.key === filterCategory) || categoryTabs[0];

  // Export to Excel
  const exportToExcel = useCallback((rows, categoryLabel, status) => {
    if (!rows.length) return;
    const statusLabel = statusConfig[status]?.label || 'Semua';
    const now = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

    const excelData = rows.map((item, i) => {
      const dp = item.dataPersyaratan || {};
      const row = {
        'No': i + 1,
        'Nama': item.namaAtlet || '-',
        'Event': item.kejurda?.namaKejurda || '-',
        'Jenis Event': jenisLabel[item.kejurda?.jenisEvent] || item.kejurda?.jenisEvent || '-',
        'Kategori/Peran': item.kategori || dp.sebagai || '-',
        'Pendaftar (Akun)': item.user?.name || '-',
        'Email': item.user?.email || '-',
        'Status': statusConfig[item.status]?.label || item.status,
      };

      // TOT-specific columns
      if (!filterCategory || filterCategory === 'TOT') {
        row['No WhatsApp'] = dp.noWhatsapp || '-';
        row['Domisili'] = dp.domisili || '-';
        row['Tipe Biaya'] = dp.labelBiaya || dp.tipeBiaya || '-';
        row['Nominal Harga'] = dp.nominalPembayaran || 0;
        row['Nominal Dibayar'] = dp.nominalBayar || dp.nominalDP || dp.nominalPembayaran || 0;
        row['Metode Bayar'] = dp.isBookingDP ? 'DP' : 'Lunas';
        row['Status Pembayaran'] = dp.statusPembayaran || (dp.nominalBayar ? 'LUNAS' : '-');
      }

      row['Tanggal Daftar'] = item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(excelData);

    // Auto column widths
    const colWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...excelData.map(r => String(r[key] || '').length)) + 2
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    const sheetName = `${categoryLabel}`.substring(0, 31); // Max 31 chars for sheet name
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `Pendaftaran_${categoryLabel}_${statusLabel}_${now}.xlsx`);
    toast.success(`Data ${categoryLabel} berhasil diexport`);
  }, [filterCategory]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Kelola Pendaftaran</h1>
        <p className="text-sm text-gray-400 mt-1">Verifikasi dan kelola data pendaftaran peserta</p>
      </div>

      {/* Category Tabs — scrollable horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {categoryTabs.map(tab => {
          const isActive = filterCategory === tab.key;
          const count = getCatCount(tab.key);
          const TabIcon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setFilterCategory(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
              <TabIcon size={14} className={isActive ? 'text-white/80' : 'text-gray-400'} />
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: HiUsers, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', value: stats.total, label: 'Total Pendaftar', isNum: true },
          { icon: HiCash, iconBg: 'bg-green-100', iconColor: 'text-green-600', value: formatCurrency(stats.nominal), label: 'Total Nominal', isNum: false },
          { icon: HiClipboardList, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', value: stats.pending, label: 'Menunggu', isNum: true },
          { icon: HiCheck, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', value: stats.disetujui, label: 'Disetujui', isNum: true },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}>
                <s.icon className={s.iconColor} size={20} />
              </div>
              <div className="min-w-0">
                <p className={`font-bold text-gray-800 truncate ${s.isNum ? 'text-2xl' : 'text-base'}`}>{s.value}</p>
                <p className="text-[11px] text-gray-400">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar — status + search + export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {['', 'PENDING', 'DISETUJUI', 'DITOLAK'].map(s => {
            const isActive = filterStatus === s;
            const cfg = statusConfig[s];
            return (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                {cfg?.label || 'Semua'}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 sm:w-56">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama, event..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none text-sm bg-white"
            />
          </div>
          <button onClick={() => exportToExcel(filteredData, activeTabCfg.label, filterStatus)}
            disabled={filteredData.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
            <HiDownload size={14} /> Export Excel
          </button>
        </div>
      </div>

      {/* Catatan Modal */}
      {catatanModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setCatatanModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {catatanModal.action === 'DISETUJUI' ? 'Setujui' : 'Tolak'} Pendaftaran
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">Peserta: <span className="font-semibold text-gray-600">{catatanModal.namaAtlet}</span></p>
            </div>
            <div className="p-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Catatan (opsional)</label>
              <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3} placeholder="Tambahkan catatan..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/30 focus:border-green-400 outline-none text-sm text-gray-700 transition-all resize-none" />
              <div className="flex gap-3 mt-5">
                <button onClick={() => handleUpdateStatus(catatanModal.id, catatanModal.action)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] shadow-lg ${
                    catatanModal.action === 'DISETUJUI'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/25'
                      : 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/25'
                  }`}>
                  {catatanModal.action === 'DISETUJUI' ? 'Setujui' : 'Tolak'}
                </button>
                <button onClick={() => setCatatanModal(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm transition-colors">Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setDeleteModal(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <HiTrash className="text-red-500" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Hapus Pendaftaran?</h3>
              <p className="text-sm text-gray-500 mt-2">
                Data pendaftaran <span className="font-semibold text-gray-700">{deleteModal.namaAtlet}</span> akan dihapus permanen dan tidak bisa dikembalikan.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm transition-colors">
                  Batal
                </button>
                <button onClick={() => handleDelete(deleteModal.id)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700 transition-all active:scale-[0.97]">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <HiClipboardList className="text-3xl text-gray-300" />
          </div>
          <p className="font-semibold text-gray-500 text-sm">
            {searchQuery ? `Tidak ditemukan "${searchQuery}"` : 'Tidak ada data pendaftaran'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {filterCategory ? `Belum ada pendaftaran untuk kategori ${activeTabCfg.label}` : 'Data pendaftaran akan muncul di sini'}
          </p>
        </div>
      ) : (
        <>
          {/* Active category indicator */}
          {filterCategory && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeTabCfg.gradient}`} />
              <span className="text-sm font-semibold text-gray-700">{activeTabCfg.label}</span>
              <span className="text-xs text-gray-400">— {filteredData.length} pendaftaran</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {['#', 'Nama', 'Event', 'Status', 'Pembayaran', 'Bukti', 'Aksi'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedData.map((item, i) => {
                    const dp = item.dataPersyaratan || {};
                    return (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-5 py-4 text-gray-300 text-xs font-mono">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.namaAtlet}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{item.kategori || item.user?.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-gray-700 text-xs font-medium max-w-[180px] truncate">{item.kejurda?.namaKejurda}</p>
                            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${jenisBadge[item.kejurda?.jenisEvent] || 'bg-gray-100 text-gray-600'}`}>
                              {jenisLabel[item.kejurda?.jenisEvent] || item.kejurda?.jenisEvent || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            {dp.nominalBayar || dp.nominalPembayaran ? (
                              <span className="text-xs font-semibold text-gray-700">{formatCurrency(dp.nominalBayar || dp.nominalPembayaran)}</span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                            <PaymentBadge dp={dp} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {(() => {
                            const buktiSrc = dp.buktiPembayaran || dp.buktiDP;
                            if (!buktiSrc) return <span className="text-xs text-gray-300">—</span>;
                            const url = getUploadUrl(buktiSrc);
                            return (
                              <a href={url} target="_blank" rel="noopener noreferrer" className="group/img inline-block">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:ring-2 hover:ring-blue-400/40 transition-all">
                                  <img src={url} alt="Bukti" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<div class="flex items-center justify-center h-full"><svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="text-gray-300"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg></div>'; }} />
                                </div>
                              </a>
                            );
                          })()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setDetailModal(item)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors" title="Detail"><HiEye size={16} /></button>
                            {item.status === 'PENDING' && (
                              <>
                                <button onClick={() => setCatatanModal({ id: item.id, action: 'DISETUJUI', namaAtlet: item.namaAtlet })}
                                  className="p-2 rounded-lg text-green-600 hover:bg-green-100 transition-colors" title="Setujui"><HiCheck size={16} /></button>
                                <button onClick={() => setCatatanModal({ id: item.id, action: 'DITOLAK', namaAtlet: item.namaAtlet })}
                                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors" title="Tolak"><HiX size={16} /></button>
                              </>
                            )}
                            <button onClick={() => setDeleteModal({ id: item.id, namaAtlet: item.namaAtlet })}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-100 transition-colors" title="Hapus"><HiTrash size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-100">
              {paginatedData.map((item) => {
                const dp = item.dataPersyaratan || {};
                return (
                  <div key={item.id} className="p-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{item.namaAtlet}</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.kejurda?.namaKejurda}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={item.status} />
                        <PaymentBadge dp={dp} />
                      </div>
                    </div>

                    {/* Info chips */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${jenisBadge[item.kejurda?.jenisEvent] || 'bg-gray-100 text-gray-600'}`}>
                        {jenisLabel[item.kejurda?.jenisEvent] || '-'}
                      </span>
                      {item.kategori && <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">{item.kategori}</span>}
                      {(dp.nominalBayar || dp.nominalPembayaran) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">{formatCurrency(dp.nominalBayar || dp.nominalPembayaran)}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => setDetailModal(item)}
                        className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3.5 py-2 rounded-xl font-semibold hover:bg-blue-100 transition-colors">
                        <HiEye size={14} /> Detail
                      </button>
                      {item.status === 'PENDING' && (
                        <>
                          <button onClick={() => setCatatanModal({ id: item.id, action: 'DISETUJUI', namaAtlet: item.namaAtlet })}
                            className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3.5 py-2 rounded-xl font-semibold hover:bg-green-100 transition-colors">
                            <HiCheck size={14} /> Setujui
                          </button>
                          <button onClick={() => setCatatanModal({ id: item.id, action: 'DITOLAK', namaAtlet: item.namaAtlet })}
                            className="flex items-center gap-1.5 text-xs bg-rose-50 text-rose-600 px-3.5 py-2 rounded-xl font-semibold hover:bg-rose-100 transition-colors">
                            <HiX size={14} /> Tolak
                          </button>
                        </>
                      )}
                      <button onClick={() => setDeleteModal({ id: item.id, namaAtlet: item.namaAtlet })}
                        className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 px-3.5 py-2 rounded-xl font-semibold hover:bg-red-100 transition-colors">
                        <HiTrash size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredData.length} itemsPerPage={ITEMS_PER_PAGE} />
        </>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <DetailPendaftaranModal
          item={detailModal}
          onClose={() => setDetailModal(null)}
          jenisLabel={jenisLabel}
          StatusBadge={StatusBadge}
          PaymentBadge={PaymentBadge}
          onVerifyPelunasan={async (id) => {
            try {
              await api.patch(`/pendaftaran/${id}/verify-pelunasan`);
              toast.success('Pelunasan berhasil diverifikasi!');
              setDetailModal(null);
              fetchData();
            } catch (err) {
              toast.error(err.response?.data?.error || 'Gagal verifikasi pelunasan');
            }
          }}
          onRejectPelunasan={async (id, catatan) => {
            try {
              await api.patch(`/pendaftaran/${id}/reject-pelunasan`, { catatan });
              toast.success('Pelunasan ditolak. User dapat upload ulang.');
              setDetailModal(null);
              fetchData();
            } catch (err) {
              toast.error(err.response?.data?.error || 'Gagal menolak pelunasan');
            }
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Detail Pendaftaran Modal
// ═══════════════════════════════════════
function DetailPendaftaranModal({ item, onClose, jenisLabel, StatusBadge, PaymentBadge, onVerifyPelunasan, onRejectPelunasan }) {
  const dp = item.dataPersyaratan || {};
  const isTOT = item.kejurda?.jenisEvent === 'TOT';
  const formatCurrency = (val) => val ? `Rp ${parseInt(val).toLocaleString('id-ID')}` : '-';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectCatatan, setRejectCatatan] = useState('');

  const ImagePreview = ({ src, label }) => {
    if (!src) return null;
    const url = getUploadUrl(src);
    return (
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
          <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <img src={url} alt={label} className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<p class="flex items-center justify-center h-full text-sm text-gray-400">Gagal memuat gambar</p>'; }} />
          </a>
          <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-white transition-colors" title="Buka">
              <HiExternalLink size={14} />
            </a>
            <a href={url} download
              className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:bg-white transition-colors" title="Download">
              <HiDownload size={14} />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`p-6 text-white relative ${isTOT ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <HiX size={18} />
          </button>
          <p className="text-xs text-white/70 font-medium mb-1">Detail Pendaftaran</p>
          <h2 className="text-xl font-bold pr-8">{item.namaAtlet}</h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20">
              {jenisLabel[item.kejurda?.jenisEvent] || item.kejurda?.jenisEvent}
            </span>
            <span className="text-sm text-white/80">{item.kejurda?.namaKejurda}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)] space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <StatusBadge status={item.status} />
          </div>

          {/* Info Umum */}
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Pendaftar (Akun)" value={item.user?.name || '-'} />
            <InfoField label="Email" value={item.user?.email || '-'} />
            <InfoField label="Kategori" value={item.kategori || '-'} />
            {item.pengcab?.nama && <InfoField label="Pengcab" value={item.pengcab.nama} />}
            <InfoField label="Didaftarkan" value={formatDate(item.createdAt)} />
          </div>

          {/* TOT Specific Data */}
          {isTOT && Object.keys(dp).length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Data Pendaftaran TOT</h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="No WhatsApp" value={dp.noWhatsapp} icon={<HiPhone size={12} className="text-gray-400" />} />
                <InfoField label="Domisili" value={dp.domisili} icon={<HiLocationMarker size={12} className="text-gray-400" />} />
                <InfoField label="Sebagai" value={dp.sebagai} />
                <InfoField label="Tipe Biaya" value={dp.labelBiaya || dp.tipeBiaya} />
                <InfoField label="Nominal Harga" value={formatCurrency(dp.nominalPembayaran)} icon={<HiCurrencyDollar size={12} className="text-gray-400" />} />
                <InfoField label="Nominal Dibayar" value={formatCurrency(dp.nominalBayar || dp.nominalDP || dp.nominalPembayaran)} icon={<HiCurrencyDollar size={12} className="text-green-500" />} highlight />
                {dp.isBookingDP && (
                  <>
                    <InfoField label="Metode" value="Booking DP" highlight />
                    <InfoField label="Nominal DP" value={formatCurrency(dp.nominalDP)} />
                    <InfoField label="Sisa Bayar" value={formatCurrency((dp.nominalPembayaran || 0) - (dp.nominalDP || 0))} />
                  </>
                )}
              </div>

              {/* Bukti Pembayaran */}
              <div className="mt-4 space-y-3">
                {dp.buktiPembayaran && <ImagePreview src={dp.buktiPembayaran} label="Bukti Pembayaran" />}
                {dp.buktiDP && <ImagePreview src={dp.buktiDP} label="Bukti Pembayaran DP" />}
              </div>

              {/* Payment Status & Pelunasan Section */}
              {dp.isBookingDP && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <HiCurrencyDollar size={16} className="text-amber-500" /> Status Pembayaran
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <PaymentBadge dp={dp} />
                    <span className="text-xs text-gray-400">
                      {dp.statusPembayaran === 'LUNAS' ? 'Pembayaran telah lunas' :
                       dp.statusPembayaran === 'MENUNGGU_VERIFIKASI' ? 'Peserta sudah upload bukti pelunasan' :
                       dp.statusPembayaran === 'DITOLAK_PELUNASAN' ? 'Pelunasan ditolak, menunggu upload ulang' :
                       'Peserta belum melunasi'}
                    </span>
                  </div>

                  {dp.nominalPelunasan && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <InfoField label="Nominal Pelunasan" value={formatCurrency(dp.nominalPelunasan)} icon={<HiCurrencyDollar size={12} className="text-blue-500" />} highlight />
                        <InfoField label="Tanggal Upload" value={dp.tanggalPelunasan ? formatDate(dp.tanggalPelunasan) : '-'} />
                        <InfoField label="Total Dibayar" value={formatCurrency(dp.totalDibayar)} icon={<HiCurrencyDollar size={12} className="text-green-500" />} highlight />
                        <InfoField label="Sisa" value={formatCurrency(Math.max(0, (dp.nominalPembayaran || 0) - (dp.totalDibayar || 0)))} />
                      </div>
                      {dp.buktiPelunasan && (
                        <div className="mt-2">
                          <ImagePreview src={dp.buktiPelunasan} label="Bukti Pelunasan" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verify / Reject Pelunasan Buttons */}
                  {dp.statusPembayaran === 'MENUNGGU_VERIFIKASI' && !rejectMode && (
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => onVerifyPelunasan(item.id)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 text-sm">
                        <HiShieldCheck size={18} /> Verifikasi
                      </button>
                      <button onClick={() => setRejectMode(true)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold rounded-xl hover:from-rose-600 hover:to-red-700 transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 text-sm">
                        <HiX size={18} /> Tolak
                      </button>
                    </div>
                  )}

                  {/* Reject Pelunasan Form */}
                  {dp.statusPembayaran === 'MENUNGGU_VERIFIKASI' && rejectMode && (
                    <div className="mt-3 space-y-3 bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm font-bold text-red-700">Tolak Pelunasan</p>
                      <textarea
                        value={rejectCatatan}
                        onChange={e => setRejectCatatan(e.target.value)}
                        rows={2}
                        placeholder="Alasan penolakan pelunasan (mis: bukti transfer tidak jelas, nominal tidak sesuai)..."
                        className="w-full px-3 py-2 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-400 outline-none text-sm resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => onRejectPelunasan(item.id, rejectCatatan)}
                          disabled={!rejectCatatan.trim()}
                          className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-40">
                          Tolak Pelunasan
                        </button>
                        <button onClick={() => { setRejectMode(false); setRejectCatatan(''); }}
                          className="flex-1 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg text-sm hover:bg-gray-300 transition-colors">
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show rejection note if pelunasan was already rejected */}
                  {dp.statusPembayaran === 'DITOLAK_PELUNASAN' && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-xs font-bold text-red-700 mb-1">Pelunasan Ditolak</p>
                      <p className="text-sm text-red-600">{dp.catatanPelunasan || '-'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Non-TOT dataPersyaratan (generic display) */}
          {!isTOT && Object.keys(dp).length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Data Persyaratan</h3>
              <div className="space-y-2">
                {Object.entries(dp).map(([key, val]) => (
                  <InfoField key={key} label={key} value={typeof val === 'object' ? JSON.stringify(val) : String(val)} />
                ))}
              </div>
            </div>
          )}

          {/* Catatan */}
          {item.catatanAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Catatan Admin</p>
              <p className="text-sm text-amber-800">{item.catatanAdmin}</p>
            </div>
          )}
          {item.catatanPeserta && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Catatan Peserta</p>
              <p className="text-sm text-blue-800">{item.catatanPeserta}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, icon, highlight }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">{icon}{label}</p>
      <p className={`text-sm font-medium mt-0.5 ${highlight ? 'text-amber-600' : 'text-gray-800'}`}>{value || '-'}</p>
    </div>
  );
}

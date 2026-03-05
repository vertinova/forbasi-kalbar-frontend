import { useEffect, useState } from 'react';
import { HiDocumentText, HiCheck, HiX, HiEye, HiCalendar, HiLocationMarker, HiDownload, HiExclamationCircle, HiTrash, HiOfficeBuilding, HiUsers } from 'react-icons/hi';
import api, { getUploadUrl } from '../../lib/api';
import toast from 'react-hot-toast';
import PersyaratanDetail from '../../components/PersyaratanDetail';
import MataLombaDetail from '../../components/MataLombaDetail';
import Pagination from '../../components/Pagination';

const statusConfig = {
  PENDING: { label: 'Menunggu', bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500' },
  APPROVED_PENGCAB: { label: 'OK Pengcab', bg: 'bg-sky-500/10', text: 'text-sky-600', dot: 'bg-sky-500' },
  DISETUJUI: { label: 'Disetujui', bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' },
  DITOLAK: { label: 'Ditolak', bg: 'bg-rose-500/10', text: 'text-rose-600', dot: 'bg-rose-500' },
};

export default function AdminRekomendasiPage() {
  const [activeTab, setActiveTab] = useState('rekomendasi'); // 'rekomendasi' | 'kejurcab'

  // Rekomendasi State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [catatanModal, setCatatanModal] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null); // { id, action, namaEvent }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, namaEvent }
  const ITEMS_PER_PAGE = 10;

  // Kejurcab State
  const [kejurcabData, setKejurcabData] = useState([]);
  const [kejurcabLoading, setKejurcabLoading] = useState(true);
  const [kejurcabFilterStatus, setKejurcabFilterStatus] = useState('');
  const [kejurcabDetailModal, setKejurcabDetailModal] = useState(null);
  const [kejurcabCurrentPage, setKejurcabCurrentPage] = useState(1);
  const [kejurcabConfirmAction, setKejurcabConfirmAction] = useState(null);
  const [kejurcabCatatan, setKejurcabCatatan] = useState('');
  const [kejurcabCatatanModal, setKejurcabCatatanModal] = useState(null);
  const [kejurcabDeleteConfirm, setKejurcabDeleteConfirm] = useState(null);

  useEffect(() => { fetchData(); setCurrentPage(1); }, [filterStatus]);
  useEffect(() => { fetchKejurcabData(); setKejurcabCurrentPage(1); }, [kejurcabFilterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/rekomendasi', { params: { status: filterStatus || undefined } });
      setData(data);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  const fetchKejurcabData = async () => {
    setKejurcabLoading(true);
    try {
      const { data } = await api.get('/kejurda');
      // Filter only KEJURCAB events submitted by Pengcab (has pengcabPengaju relation)
      let filtered = data.filter(k => k.jenisEvent === 'KEJURCAB' && k.pengcabPengaju);
      if (kejurcabFilterStatus) {
        filtered = filtered.filter(k => k.statusApproval === kejurcabFilterStatus);
      }
      setKejurcabData(filtered);
    } catch { setKejurcabData([]); }
    finally { setKejurcabLoading(false); }
  };

  // Validate tanda tangan & stempel config before final approval (DISETUJUI)
  const validateSuratConfig = async () => {
    try {
      const res = await api.get('/site-config/surat-config');
      const cfg = res.data || {};
      const missing = [];
      if (!cfg.tanda_tangan_ketua?.signaturePath) missing.push('Tanda Tangan Ketua');
      if (!cfg.tanda_tangan_ketua?.signerName) missing.push('Nama Ketua');
      if (!cfg.tanda_tangan_sekretaris?.signaturePath) missing.push('Tanda Tangan Sekretaris');
      if (!cfg.tanda_tangan_sekretaris?.signerName) missing.push('Nama Sekretaris');
      if (!cfg.stempel?.stampPath) missing.push('Stempel');
      return missing;
    } catch {
      return ['Gagal memuat konfigurasi surat'];
    }
  };

  // Open catatan modal or confirmation popup
  const openCatatanModal = async (modalData) => {
    setCatatan('');
    if (modalData.action === 'DISETUJUI') {
      // Validate surat config before final approval
      const missing = await validateSuratConfig();
      if (missing.length > 0) {
        toast.error(
          `Tidak bisa menyetujui. Lengkapi konfigurasi surat terlebih dahulu:\n• ${missing.join('\n• ')}`,
          { duration: 6000, style: { whiteSpace: 'pre-line' } }
        );
        return;
      }
    }
    if (modalData.action === 'DITOLAK') {
      // Reject needs reason — show catatan modal first
      setCatatanModal(modalData);
    } else {
      // Approve actions — go directly to confirmation popup (no catatan needed)
      setConfirmAction(modalData);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/rekomendasi/${id}/status`, { status, catatanAdmin: catatan });
      toast.success(`Status diubah menjadi ${status}`);
      setCatatanModal(null);
      setConfirmAction(null);
      setCatatan('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/rekomendasi/${id}`);
      toast.success('Rekomendasi berhasil dihapus');
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus data');
    }
  };

  const fetchDetail = async (id) => {
    try {
      const { data } = await api.get(`/rekomendasi/${id}`);
      setDetailModal(data);
    } catch {
      toast.error('Gagal memuat detail');
    }
  };

  // ========= Kejurcab Handlers =========
  const fetchKejurcabDetail = async (id) => {
    try {
      const { data } = await api.get(`/kejurda/${id}`);
      setKejurcabDetailModal(data);
    } catch {
      toast.error('Gagal memuat detail');
    }
  };

  const openKejurcabCatatanModal = (modalData) => {
    setKejurcabCatatan('');
    if (modalData.action === 'DITOLAK') {
      setKejurcabCatatanModal(modalData);
    } else {
      setKejurcabConfirmAction(modalData);
    }
  };

  const handleKejurcabApprove = async (id) => {
    try {
      await api.patch(`/kejurda/${id}/approve`, { catatan: kejurcabCatatan || null });
      toast.success('Pengajuan Kejurcab disetujui');
      setKejurcabConfirmAction(null);
      setKejurcabCatatan('');
      fetchKejurcabData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyetujui');
    }
  };

  const handleKejurcabReject = async (id) => {
    try {
      await api.patch(`/kejurda/${id}/reject`, { catatan: kejurcabCatatan || 'Ditolak oleh Pengda' });
      toast.success('Pengajuan Kejurcab ditolak');
      setKejurcabCatatanModal(null);
      setKejurcabConfirmAction(null);
      setKejurcabCatatan('');
      fetchKejurcabData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menolak');
    }
  };

  const handleGenerateSuratKejurcab = async (id) => {
    try {
      const { data } = await api.post(`/kejurda/${id}/generate-surat`);
      toast.success('Surat rekomendasi berhasil digenerate');
      fetchKejurcabData();
      // Update modal detail if open
      if (kejurcabDetailModal?.id === id) {
        setKejurcabDetailModal(data.kejurcab);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal generate surat');
    }
  };

  const handleKejurcabDelete = async (id) => {
    try {
      await api.delete(`/kejurda/${id}`);
      toast.success('Event berhasil dihapus');
      setKejurcabDeleteConfirm(null);
      fetchKejurcabData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus event');
    }
  };

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const kejurcabTotalPages = Math.ceil(kejurcabData.length / ITEMS_PER_PAGE);
  const kejurcabPaginatedData = kejurcabData.slice((kejurcabCurrentPage - 1) * ITEMS_PER_PAGE, kejurcabCurrentPage * ITEMS_PER_PAGE);

  const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('rekomendasi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'rekomendasi'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <HiDocumentText size={16} />
          <span>Pengajuan Event Reguler</span>
          {data.filter(d => d.status === 'PENDING' || d.status === 'APPROVED_PENGCAB').length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
              {data.filter(d => d.status === 'PENDING' || d.status === 'APPROVED_PENGCAB').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('kejurcab')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'kejurcab'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <HiUsers size={16} />
          <span>Pengajuan Kejurcab</span>
          {kejurcabData.filter(k => k.statusApproval === 'PENDING').length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
              {kejurcabData.filter(k => k.statusApproval === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {/* Rekomendasi Event Tab */}
      {activeTab === 'rekomendasi' && (
        <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Pengajuan Event Reguler</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola pengajuan rekomendasi event dari Pengcab/Club</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['', 'PENDING', 'APPROVED_PENGCAB', 'DISETUJUI', 'DITOLAK'].map(s => {
            const isActive = filterStatus === s;
            const cfg = statusConfig[s];
            return (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                    : 'bg-white text-gray-500 border border-gray-200/80 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                {cfg?.label || 'Semua'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catatan Modal */}
      {catatanModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setCatatanModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl shadow-black/10" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {catatanModal.action === 'APPROVED_PENGCAB' ? 'Setujui (Pengcab)' : catatanModal.action === 'DISETUJUI' ? 'Setujui (Pengda)' : 'Tolak'} Rekomendasi
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">Event: <span className="font-semibold text-gray-600">{catatanModal.namaEvent}</span></p>
            </div>
            <div className="p-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {catatanModal.action === 'DITOLAK' ? 'Alasan Penolakan' : 'Catatan Admin'}
                {catatanModal.action === 'DITOLAK' ? <span className="text-red-500 ml-1">*</span> : ' (opsional)'}
              </label>
              <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3}
                placeholder={catatanModal.action === 'DITOLAK' ? 'Jelaskan alasan penolakan agar pemohon dapat memperbaiki...' : 'Tambahkan catatan...'}
                className={`w-full px-4 py-3 rounded-xl border outline-none text-sm text-gray-700 transition-all ${catatanModal.action === 'DITOLAK' ? 'border-red-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-400' : 'border-gray-200 focus:ring-2 focus:ring-green-500/30 focus:border-green-400'}`} />
              {catatanModal.action === 'DITOLAK' && (
                <p className="text-[11px] text-gray-400 mt-1.5">Catatan ini akan dikirim ke penyelenggara/club yang mengajukan</p>
              )}
              <div className="flex gap-3 mt-5">
                <button onClick={() => {
                  if (catatanModal.action === 'DITOLAK' && !catatan.trim()) { toast.error('Alasan penolakan wajib diisi'); return; }
                  setConfirmAction({ id: catatanModal.id, action: catatanModal.action, namaEvent: catatanModal.namaEvent });
                }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] shadow-lg ${
                    catatanModal.action === 'DITOLAK'
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/25'
                      : 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/25'
                  }`}>
                  {catatanModal.action === 'APPROVED_PENGCAB' ? 'Setujui Pengcab' : catatanModal.action === 'DISETUJUI' ? 'Setujui Pengda' : 'Tolak'}
                </button>
                <button onClick={() => setCatatanModal(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm transition-colors">Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setConfirmAction(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${
                confirmAction.action === 'DITOLAK' ? 'bg-rose-100' : 'bg-green-100'
              }`}>
                <HiExclamationCircle size={28} className={confirmAction.action === 'DITOLAK' ? 'text-rose-500' : 'text-green-600'} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {confirmAction.action === 'DITOLAK' ? 'Tolak Rekomendasi?' : 'Setujui Rekomendasi?'}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                {confirmAction.action === 'DITOLAK'
                  ? 'Anda yakin ingin menolak rekomendasi event ini?'
                  : confirmAction.action === 'DISETUJUI'
                    ? 'Anda yakin ingin menyetujui? Surat rekomendasi akan otomatis digenerate.'
                    : 'Anda yakin ingin menyetujui di level Pengcab?'}
              </p>
              <p className="text-xs font-semibold text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mt-2 mb-5">"{confirmAction.namaEvent}"</p>
              <div className="flex gap-3">
                <button onClick={() => handleUpdateStatus(confirmAction.id, confirmAction.action)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] shadow-lg ${
                    confirmAction.action === 'DITOLAK'
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/25'
                      : 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/25'
                  }`}>
                  {confirmAction.action === 'DITOLAK' ? 'Ya, Tolak' : 'Ya, Setujui'}
                </button>
                <button onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm transition-colors">
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-rose-100">
                <HiTrash size={28} className="text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Rekomendasi?</h3>
              <p className="text-sm text-gray-500 mb-1">Data yang dihapus tidak dapat dikembalikan.</p>
              <p className="text-xs font-semibold text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mt-2 mb-5">"{deleteConfirm.namaEvent}"</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteConfirm.id)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-500 to-rose-600 shadow-lg shadow-rose-500/25 transition-all active:scale-[0.97]">
                  Ya, Hapus
                </button>
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm transition-colors">
                  Batal
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
      ) : (
        <>
        <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm shadow-gray-100/50">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm table-modern">
              <thead>
                <tr className="bg-gray-50/60">
                  {['#', 'Event', 'Jenis', 'Pemohon', 'Tanggal', 'Lokasi', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {paginatedData.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3.5 text-gray-400 text-xs font-mono">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">{item.namaEvent}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{item.jenisEvent}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{item.user?.name}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{new Date(item.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs max-w-[140px] truncate">{item.lokasi}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => fetchDetail(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Detail"><HiEye size={16} /></button>
                        {item.status === 'PENDING' && (
                          <>
                            <button onClick={() => openCatatanModal({ id: item.id, action: 'APPROVED_PENGCAB', namaEvent: item.namaEvent })}
                              className="px-2 py-1 rounded-lg text-sky-600 bg-sky-500/10 hover:bg-sky-500/15 text-[10px] font-bold transition-colors">Pengcab</button>
                            <button onClick={() => openCatatanModal({ id: item.id, action: 'DITOLAK', namaEvent: item.namaEvent })}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors" title="Tolak"><HiX size={16} /></button>
                          </>
                        )}
                        {item.status === 'APPROVED_PENGCAB' && (
                          <>
                            <button onClick={() => openCatatanModal({ id: item.id, action: 'DISETUJUI', namaEvent: item.namaEvent })}
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Setujui Pengda"><HiCheck size={16} /></button>
                            <button onClick={() => openCatatanModal({ id: item.id, action: 'DITOLAK', namaEvent: item.namaEvent })}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors" title="Tolak"><HiX size={16} /></button>
                          </>
                        )}
                        {item.status === 'DISETUJUI' && item.suratRekomendasi && (
                          <a href={getUploadUrl(item.suratRekomendasi)} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Download Surat">
                            <HiDownload size={16} />
                          </a>
                        )}
                        <button onClick={() => setDeleteConfirm({ id: item.id, namaEvent: item.namaEvent })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="Hapus"><HiTrash size={16} /></button>
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
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.namaEvent}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{item.jenisEvent} &middot; {item.user?.name}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><HiCalendar size={12} className="text-gray-300" />{new Date(item.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><HiLocationMarker size={12} className="text-gray-300" />{item.lokasi}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => fetchDetail(item.id)}
                    className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-3.5 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                    <HiEye size={13} /> Detail
                  </button>
                  {item.status === 'PENDING' && (
                    <button onClick={() => openCatatanModal({ id: item.id, action: 'APPROVED_PENGCAB', namaEvent: item.namaEvent })}
                      className="flex items-center gap-1.5 text-xs bg-sky-500/10 text-sky-700 px-3.5 py-2 rounded-xl font-semibold hover:bg-sky-500/15 transition-colors">
                      <HiCheck size={13} /> Pengcab
                    </button>
                  )}
                  {item.status === 'APPROVED_PENGCAB' && (
                    <button onClick={() => openCatatanModal({ id: item.id, action: 'DISETUJUI', namaEvent: item.namaEvent })}
                      className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-700 px-3.5 py-2 rounded-xl font-semibold hover:bg-green-500/15 transition-colors">
                      <HiCheck size={13} /> Setujui
                    </button>
                  )}
                  {(item.status === 'PENDING' || item.status === 'APPROVED_PENGCAB') && (
                    <button onClick={() => openCatatanModal({ id: item.id, action: 'DITOLAK', namaEvent: item.namaEvent })}
                      className="flex items-center gap-1.5 text-xs bg-rose-500/10 text-rose-600 px-3.5 py-2 rounded-xl font-semibold hover:bg-rose-500/15 transition-colors">
                      <HiX size={13} /> Tolak
                    </button>
                  )}
                  {item.status === 'DISETUJUI' && item.suratRekomendasi && (
                    <a href={getUploadUrl(item.suratRekomendasi)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-700 px-3.5 py-2 rounded-xl font-semibold hover:bg-green-500/15 transition-colors">
                      <HiDownload size={13} /> Surat
                    </a>
                  )}
                  <button onClick={() => setDeleteConfirm({ id: item.id, namaEvent: item.namaEvent })}
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
                <HiDocumentText className="text-3xl text-gray-300" />
              </div>
              <p className="font-semibold text-gray-500 text-sm">Tidak ada data rekomendasi</p>
              <p className="text-xs text-gray-400 mt-1">Data rekomendasi akan muncul di sini</p>
            </div>
          )}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={data.length} itemsPerPage={ITEMS_PER_PAGE} />
        </>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl shadow-black/10" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Detail Rekomendasi</h3>
                <p className="text-xs text-gray-400 mt-0.5">Informasi lengkap pengajuan event</p>
              </div>
              <button onClick={() => setDetailModal(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <HiX size={18} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="p-6 space-y-1">
                {[
                  { label: 'Nama Event', value: detailModal.namaEvent, bold: true },
                  { label: 'Jenis Event', value: detailModal.jenisEvent },
                  { label: 'Penyelenggara', value: detailModal.penyelenggara },
                  { label: 'Lokasi', value: detailModal.lokasi },
                  { label: 'Tanggal', value: `${detailModal.tanggalMulai ? new Date(detailModal.tanggalMulai).toLocaleDateString('id-ID') : '-'} - ${detailModal.tanggalSelesai ? new Date(detailModal.tanggalSelesai).toLocaleDateString('id-ID') : '-'}` },
                  { label: 'Pemohon', value: detailModal.user?.name || '-' },
                  { label: 'Pengcab', value: detailModal.pengcab?.nama || '-' },
                  detailModal.kontakPerson && { label: 'Kontak', value: detailModal.kontakPerson },
                  detailModal.noBilingSimpaskor && { label: 'No. Billing Simpaskor', value: detailModal.noBilingSimpaskor },
                  detailModal.deskripsi && { label: 'Deskripsi', value: detailModal.deskripsi },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5 font-medium">{item.label}</span>
                    <span className={`text-sm ${item.bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{item.value}</span>
                  </div>
                ))}
                {detailModal.dokumenSurat && (
                  <div className="flex items-start gap-3 py-2.5">
                    <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5 font-medium">Dokumen</span>
                    <a href={getUploadUrl(detailModal.dokumenSurat)}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-700 font-semibold underline underline-offset-2">
                      Lihat Dokumen
                    </a>
                  </div>
                )}
                <div className="flex items-start gap-3 py-2.5">
                  <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5 font-medium">Status</span>
                  <StatusBadge status={detailModal.status} />
                </div>
                {detailModal.catatanPengcab && (
                  <div className="flex items-start gap-3 py-2.5">
                    <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5 font-medium">Catatan Pengcab</span>
                    <span className="text-sm text-gray-700">{detailModal.catatanPengcab}</span>
                  </div>
                )}
                {detailModal.catatanAdmin && (
                  <div className="flex items-start gap-3 py-2.5">
                    <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5 font-medium">Catatan Admin</span>
                    <span className="text-sm text-gray-700">{detailModal.catatanAdmin}</span>
                  </div>
                )}
                {detailModal.status === 'DISETUJUI' && detailModal.suratRekomendasi && (
                  <div className="flex items-start gap-3 py-2.5">
                    <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5 font-medium">Surat</span>
                    <a href={getUploadUrl(detailModal.suratRekomendasi)}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition border border-green-200">
                      <HiDownload size={14} /> Download Surat Rekomendasi
                    </a>
                  </div>
                )}
              </div>

              {detailModal.proposal && (
                <div className="px-6 pb-3 pt-2 border-t border-gray-100">
                  <div className="flex items-start gap-3 py-2.5">
                    <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5 font-medium">Proposal</span>
                    <a href={getUploadUrl(detailModal.proposal)}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 text-xs font-bold rounded-lg hover:bg-sky-100 transition border border-sky-200">
                      <HiDownload size={14} /> Lihat Proposal Kegiatan
                    </a>
                  </div>
                </div>
              )}

              {detailModal.mataLomba && Object.keys(detailModal.mataLomba).length > 0 && (
                <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                  <h4 className="font-bold text-gray-800 text-sm mb-3 mt-3">Mata Lomba</h4>
                  <MataLombaDetail mataLomba={detailModal.mataLomba} />
                </div>
              )}

              {detailModal.persyaratan && (
                <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                  <h4 className="font-bold text-gray-800 text-sm mb-3 mt-3">Persyaratan Event</h4>
                  <PersyaratanDetail persyaratan={typeof detailModal.persyaratan === 'string' ? JSON.parse(detailModal.persyaratan) : detailModal.persyaratan} />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              {detailModal.status === 'PENDING' && (
                <button onClick={() => { setDetailModal(null); openCatatanModal({ id: detailModal.id, action: 'APPROVED_PENGCAB', namaEvent: detailModal.namaEvent }); }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all active:scale-[0.97]">
                  Setujui Pengcab
                </button>
              )}
              {detailModal.status === 'APPROVED_PENGCAB' && (
                <button onClick={() => { setDetailModal(null); openCatatanModal({ id: detailModal.id, action: 'DISETUJUI', namaEvent: detailModal.namaEvent }); }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all active:scale-[0.97]">
                  Setujui Pengda
                </button>
              )}
              {(detailModal.status === 'PENDING' || detailModal.status === 'APPROVED_PENGCAB') && (
                <button onClick={() => { setDetailModal(null); openCatatanModal({ id: detailModal.id, action: 'DITOLAK', namaEvent: detailModal.namaEvent }); }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all active:scale-[0.97]">
                  Tolak
                </button>
              )}
              <button onClick={() => setDetailModal(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Kejurcab Tab */}
      {activeTab === 'kejurcab' && (
        <>
          {/* Kejurcab Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Pengajuan Kejurcab</h1>
              <p className="text-sm text-gray-400 mt-1">Verifikasi pengajuan Kejurcab dari Pengcab</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['', 'PENDING', 'DISETUJUI', 'DITOLAK'].map(s => {
                const isActive = kejurcabFilterStatus === s;
                const cfg = statusConfig[s];
                return (
                  <button key={s} onClick={() => setKejurcabFilterStatus(s)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                        : 'bg-white text-gray-500 border border-gray-200/80 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                    {cfg?.label || 'Semua'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kejurcab Catatan Modal */}
          {kejurcabCatatanModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setKejurcabCatatanModal(null)}>
              <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl shadow-black/10" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Tolak Pengajuan Kejurcab</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Event: <span className="font-semibold text-gray-600">{kejurcabCatatanModal.namaEvent}</span></p>
                </div>
                <div className="p-6">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Alasan Penolakan <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea value={kejurcabCatatan} onChange={e => setKejurcabCatatan(e.target.value)} rows={3}
                    placeholder="Jelaskan alasan penolakan..."
                    className="w-full px-4 py-3 rounded-xl border outline-none text-sm text-gray-700 transition-all border-red-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-400" />
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => {
                      if (!kejurcabCatatan.trim()) { toast.error('Alasan penolakan wajib diisi'); return; }
                      setKejurcabConfirmAction({ ...kejurcabCatatanModal, action: 'DITOLAK' });
                    }}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] shadow-lg bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/25">
                      Tolak
                    </button>
                    <button onClick={() => setKejurcabCatatanModal(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm transition-colors">Batal</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Kejurcab Confirmation Popup */}
          {kejurcabConfirmAction && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setKejurcabConfirmAction(null)}>
              <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    kejurcabConfirmAction.action === 'DITOLAK' ? 'bg-rose-100' : 'bg-green-100'
                  }`}>
                    <HiExclamationCircle size={28} className={kejurcabConfirmAction.action === 'DITOLAK' ? 'text-rose-500' : 'text-green-600'} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {kejurcabConfirmAction.action === 'DITOLAK' ? 'Tolak Pengajuan?' : 'Setujui Pengajuan?'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    {kejurcabConfirmAction.action === 'DITOLAK'
                      ? 'Pengajuan Kejurcab ini akan ditolak.'
                      : 'Pengajuan Kejurcab ini akan disetujui dan pendaftaran akan dibuka.'}
                  </p>
                  <p className="text-xs font-semibold text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mt-2 mb-5">"{kejurcabConfirmAction.namaEvent}"</p>
                  <div className="flex gap-3">
                    <button onClick={() => kejurcabConfirmAction.action === 'DITOLAK' ? handleKejurcabReject(kejurcabConfirmAction.id) : handleKejurcabApprove(kejurcabConfirmAction.id)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] shadow-lg ${
                        kejurcabConfirmAction.action === 'DITOLAK'
                          ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/25'
                          : 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/25'
                      }`}>
                      {kejurcabConfirmAction.action === 'DITOLAK' ? 'Ya, Tolak' : 'Ya, Setujui'}
                    </button>
                    <button onClick={() => setKejurcabConfirmAction(null)}
                      className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm transition-colors">
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Kejurcab Data */}
          {kejurcabLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
                <div className="absolute inset-0 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm shadow-gray-100/50">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm table-modern">
                    <thead>
                      <tr className="bg-gray-50/60">
                        {['#', 'Nama Event', 'Pengcab', 'Tanggal', 'Lokasi', 'Status', 'Aksi'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/60">
                      {kejurcabPaginatedData.map((item, i) => (
                        <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="px-4 py-3.5 text-gray-400 text-xs font-mono">{(kejurcabCurrentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                          <td className="px-4 py-3.5 font-semibold text-gray-900">{item.namaKejurda}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">
                            <span className="flex items-center gap-1.5">
                              <HiOfficeBuilding size={13} className="text-gray-400" />
                              {item.pengcabPengaju?.nama || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{new Date(item.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs max-w-[140px] truncate">{item.lokasi}</td>
                          <td className="px-4 py-3.5"><StatusBadge status={item.statusApproval} /></td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                              <button onClick={() => fetchKejurcabDetail(item.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Detail"><HiEye size={16} /></button>
                              {item.statusApproval === 'PENDING' && (
                                <>
                                  <button onClick={() => openKejurcabCatatanModal({ id: item.id, action: 'DISETUJUI', namaEvent: item.namaKejurda })}
                                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Setujui"><HiCheck size={16} /></button>
                                  <button onClick={() => openKejurcabCatatanModal({ id: item.id, action: 'DITOLAK', namaEvent: item.namaKejurda })}
                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors" title="Tolak"><HiX size={16} /></button>
                                </>
                              )}
                              {item.statusApproval === 'DISETUJUI' && item.suratRekomendasi && (
                                <a href={getUploadUrl(item.suratRekomendasi)} target="_blank" rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Download Surat">
                                  <HiDownload size={16} />
                                </a>
                              )}
                              {item.statusApproval === 'DISETUJUI' && !item.suratRekomendasi && (
                                <button onClick={() => handleGenerateSuratKejurcab(item.id)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors font-medium" title="Generate Surat">
                                  <HiDocumentText size={14} /> Generate
                                </button>
                              )}
                              <button onClick={() => setKejurcabDeleteConfirm({ id: item.id, namaEvent: item.namaKejurda })}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Hapus"><HiTrash size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-100/60 mobile-card-list">
                  {kejurcabPaginatedData.map((item) => (
                    <div key={item.id} className="p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.namaKejurda}</h4>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <HiOfficeBuilding size={11} /> {item.pengcabPengaju?.nama || '-'}
                          </p>
                        </div>
                        <StatusBadge status={item.statusApproval} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><HiCalendar size={12} className="text-gray-300" />{new Date(item.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><HiLocationMarker size={12} className="text-gray-300" />{item.lokasi}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => fetchKejurcabDetail(item.id)}
                          className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-3.5 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                          <HiEye size={13} /> Detail
                        </button>
                        {item.statusApproval === 'PENDING' && (
                          <>
                            <button onClick={() => openKejurcabCatatanModal({ id: item.id, action: 'DISETUJUI', namaEvent: item.namaKejurda })}
                              className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-700 px-3.5 py-2 rounded-xl font-semibold hover:bg-green-500/15 transition-colors">
                              <HiCheck size={13} /> Setujui
                            </button>
                            <button onClick={() => openKejurcabCatatanModal({ id: item.id, action: 'DITOLAK', namaEvent: item.namaKejurda })}
                              className="flex items-center gap-1.5 text-xs bg-rose-500/10 text-rose-600 px-3.5 py-2 rounded-xl font-semibold hover:bg-rose-500/15 transition-colors">
                              <HiX size={13} /> Tolak
                            </button>
                          </>
                        )}
                        {item.statusApproval === 'DISETUJUI' && item.suratRekomendasi && (
                          <a href={getUploadUrl(item.suratRekomendasi)} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-700 px-3.5 py-2 rounded-xl font-semibold hover:bg-green-500/15 transition-colors">
                            <HiDownload size={13} /> Surat
                          </a>
                        )}
                        {item.statusApproval === 'DISETUJUI' && !item.suratRekomendasi && (
                          <button onClick={() => handleGenerateSuratKejurcab(item.id)}
                            className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-700 px-3.5 py-2 rounded-xl font-semibold hover:bg-amber-500/15 transition-colors">
                            <HiDocumentText size={13} /> Generate Surat
                          </button>
                        )}
                        <button onClick={() => setKejurcabDeleteConfirm({ id: item.id, namaEvent: item.namaKejurda })}
                          className="flex items-center gap-1.5 text-xs bg-rose-50 text-rose-600 px-3.5 py-2 rounded-xl font-semibold hover:bg-rose-100 transition-colors">
                          <HiTrash size={13} /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {kejurcabData.length === 0 && (
                  <div className="text-center py-20 text-gray-400">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                      <HiUsers className="text-3xl text-gray-300" />
                    </div>
                    <p className="font-semibold text-gray-500 text-sm">Tidak ada pengajuan Kejurcab</p>
                    <p className="text-xs text-gray-400 mt-1">Pengajuan Kejurcab dari Pengcab akan muncul di sini</p>
                  </div>
                )}
              </div>

              <Pagination currentPage={kejurcabCurrentPage} totalPages={kejurcabTotalPages} onPageChange={setKejurcabCurrentPage} totalItems={kejurcabData.length} itemsPerPage={ITEMS_PER_PAGE} />
            </>
          )}

          {/* Kejurcab Detail Modal */}
          {kejurcabDetailModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setKejurcabDetailModal(null)}>
              <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="relative bg-emerald-800 px-6 py-6">
                  <button onClick={() => setKejurcabDetailModal(null)} 
                    className="absolute top-4 right-4 p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all">
                    <HiX size={18} />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-white/15 text-emerald-100 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                      Kejurcab
                    </span>
                    <StatusBadge status={kejurcabDetailModal.statusApproval} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{kejurcabDetailModal.namaKejurda}</h2>
                  <p className="text-emerald-200/80 text-sm mt-1.5 flex items-center gap-1.5">
                    <HiOfficeBuilding size={14} />
                    {kejurcabDetailModal.pengcabPengaju?.nama || 'Pengcab tidak diketahui'}
                  </p>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                  {/* Quick Info Cards */}
                  <div className="p-5 grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50">
                      <div className="flex items-center gap-2 text-emerald-700 mb-1">
                        <HiCalendar size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Tanggal</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {kejurcabDetailModal.tanggalMulai ? new Date(kejurcabDetailModal.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </p>
                      <p className="text-xs text-gray-500">
                        s/d {kejurcabDetailModal.tanggalSelesai ? new Date(kejurcabDetailModal.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50">
                      <div className="flex items-center gap-2 text-emerald-700 mb-1">
                        <HiLocationMarker size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Lokasi</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">{kejurcabDetailModal.lokasi || '-'}</p>
                    </div>
                  </div>

                  {/* Detail Section */}
                  <div className="px-5 pb-4">
                    <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
                      {kejurcabDetailModal.noBilingSimpaskor && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <span className="text-xs text-gray-500 font-medium">No. Billing Simpaskor</span>
                          <span className="text-sm font-bold text-gray-800 bg-amber-100 px-2.5 py-1 rounded-lg">{kejurcabDetailModal.noBilingSimpaskor}</span>
                        </div>
                      )}
                      {kejurcabDetailModal.deskripsi && (
                        <div className="py-2">
                          <span className="text-xs text-gray-500 font-medium block mb-1.5">Deskripsi</span>
                          <p className="text-sm text-gray-700 leading-relaxed">{kejurcabDetailModal.deskripsi}</p>
                        </div>
                      )}
                      {kejurcabDetailModal.catatanAdmin && (
                        <div className="py-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500 font-medium block mb-1.5">Catatan Admin</span>
                          <p className="text-sm text-gray-700 bg-white rounded-xl p-3 border border-gray-200">{kejurcabDetailModal.catatanAdmin}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proposal */}
                  {kejurcabDetailModal.proposal && (
                    <div className="px-5 pb-4">
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                              <HiDocumentText size={20} className="text-emerald-700" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">Proposal Kegiatan</p>
                              <p className="text-xs text-gray-500">Dokumen pengajuan event</p>
                            </div>
                          </div>
                          <a href={getUploadUrl(kejurcabDetailModal.proposal)}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                            <HiDownload size={14} /> Unduh
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Surat Rekomendasi - only when approved */}
                  {kejurcabDetailModal.statusApproval === 'DISETUJUI' && kejurcabDetailModal.suratRekomendasi && (
                    <div className="px-5 pb-4">
                      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                              <HiDocumentText size={20} className="text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-emerald-800">Surat Rekomendasi</p>
                              <p className="text-xs text-emerald-600">No: {kejurcabDetailModal.nomorSurat || '-'}</p>
                            </div>
                          </div>
                          <a href={getUploadUrl(kejurcabDetailModal.suratRekomendasi)}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                            <HiDownload size={14} /> Download
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mata Lomba */}
                  {kejurcabDetailModal.mataLomba && Object.keys(kejurcabDetailModal.mataLomba).length > 0 && (
                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-5 bg-emerald-600 rounded-full" />
                        <h4 className="font-bold text-gray-800 text-sm">Mata Lomba</h4>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <MataLombaDetail mataLomba={kejurcabDetailModal.mataLomba} />
                      </div>
                    </div>
                  )}

                  {/* Persyaratan */}
                  {kejurcabDetailModal.persyaratan && (
                    <div className="px-5 pb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-5 bg-emerald-600 rounded-full" />
                        <h4 className="font-bold text-gray-800 text-sm">Persyaratan Event</h4>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <PersyaratanDetail persyaratan={typeof kejurcabDetailModal.persyaratan === 'string' ? JSON.parse(kejurcabDetailModal.persyaratan) : kejurcabDetailModal.persyaratan} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex gap-2">
                  {kejurcabDetailModal.statusApproval === 'PENDING' && (
                    <>
                      <button onClick={() => { setKejurcabDetailModal(null); openKejurcabCatatanModal({ id: kejurcabDetailModal.id, action: 'DISETUJUI', namaEvent: kejurcabDetailModal.namaKejurda }); }}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
                        <HiCheck size={16} /> Setujui
                      </button>
                      <button onClick={() => { setKejurcabDetailModal(null); openKejurcabCatatanModal({ id: kejurcabDetailModal.id, action: 'DITOLAK', namaEvent: kejurcabDetailModal.namaKejurda }); }}
                        className="flex-1 py-2.5 bg-white text-rose-600 rounded-xl font-semibold text-sm hover:bg-rose-50 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 border border-rose-200">
                        <HiX size={16} /> Tolak
                      </button>
                    </>
                  )}
                  {kejurcabDetailModal.statusApproval !== 'PENDING' && (
                    <button onClick={() => setKejurcabDetailModal(null)}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">
                      Tutup
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Kejurcab Delete Confirmation */}
          {kejurcabDeleteConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setKejurcabDeleteConfirm(null)}>
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <HiTrash className="text-2xl text-rose-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Hapus Event?</h3>
                <p className="text-sm text-gray-500 mb-1">Event ini akan dihapus permanen:</p>
                <p className="text-xs font-semibold text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mt-2 mb-5">"{kejurcabDeleteConfirm.namaEvent}"</p>
                <div className="flex gap-3">
                  <button onClick={() => handleKejurcabDelete(kejurcabDeleteConfirm.id)}
                    className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm transition-colors">
                    Ya, Hapus
                  </button>
                  <button onClick={() => setKejurcabDeleteConfirm(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors">
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

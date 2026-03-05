import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowLeft, HiDocumentText, HiClock, HiCheckCircle, HiXCircle,
  HiClipboardCheck, HiLocationMarker, HiCalendar, HiEye, HiTrash,
  HiChevronDown, HiChevronUp, HiUser, HiArrowRight
} from 'react-icons/hi';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const statusConfig = {
  PENDING: { label: 'Menunggu Pengcab', color: 'bg-yellow-100 text-yellow-700', icon: HiClock, step: 1 },
  APPROVED_PENGCAB: { label: 'Disetujui Pengcab', color: 'bg-blue-100 text-blue-700', icon: HiClipboardCheck, step: 2 },
  DISETUJUI: { label: 'Disetujui Pengda', color: 'bg-green-100 text-green-700', icon: HiCheckCircle, step: 3 },
  DITOLAK: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: HiXCircle, step: 0 },
};

export default function UserRiwayatPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => { fetchData(); }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/rekomendasi', { params: { status: filter || undefined } });
      setData(data);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      title: 'Batalkan Permohonan',
      message: 'Yakin ingin membatalkan permohonan ini?',
      variant: 'warning',
      confirmText: 'Ya, Batalkan',
      onConfirm: async () => {
        try {
          await api.delete(`/rekomendasi/${id}`);
          toast.success('Permohonan dibatalkan');
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Gagal membatalkan');
        } finally { setConfirmModal(null); }
      },
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Link to="/dashboard" className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all">
          <HiArrowLeft className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Riwayat Pengajuan</h1>
          <p className="text-xs text-gray-500">Lacak status perizinan event Anda</p>
        </div>
      </div>

      {/* Filter tabs - scrollable mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {[
          { value: '', label: 'Semua' },
          { value: 'PENDING', label: 'Menunggu' },
          { value: 'APPROVED_PENGCAB', label: 'Pengcab OK' },
          { value: 'DISETUJUI', label: 'Disetujui' },
          { value: 'DITOLAK', label: 'Ditolak' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === f.value
                ? 'bg-green-700 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-md border border-gray-100">
          <HiDocumentText className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Belum ada pengajuan</p>
          <Link to="/dashboard/ajukan" className="inline-block mt-3 text-green-700 font-semibold text-sm hover:underline">
            + Ajukan Permohonan Baru
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => {
            const cfg = statusConfig[item.status];
            const Icon = cfg.icon;
            const isExpanded = expanded === item.id;

            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                {/* Main card - tap to expand */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                  className="w-full text-left p-4 sm:p-5 active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate pr-2">{item.namaEvent}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center"><HiCalendar className="mr-0.5" />{new Date(item.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>&middot;</span>
                        <span>{item.jenisEvent}</span>
                        {item.pengcab && (
                          <>
                            <span>&middot;</span>
                            <span className="flex items-center"><HiLocationMarker className="mr-0.5" />{item.pengcab.kota}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1.5 ml-2">
                      <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {isExpanded ? <HiChevronUp className="text-gray-400" /> : <HiChevronDown className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Stepper progress */}
                  {item.status !== 'DITOLAK' && (
                    <div className="mt-3 flex items-center gap-1">
                      {[1, 2, 3].map(step => (
                        <div key={step} className={`h-1.5 flex-1 rounded-full ${step <= cfg.step ? 'bg-green-500' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  )}
                  {item.status === 'DITOLAK' && (
                    <div className="mt-3 h-1.5 bg-red-400 rounded-full" />
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100 pt-4 space-y-4">
                    {/* Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tracking Status</h4>
                      
                      {/* Step 1: User submitted */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <HiUser className="text-green-600 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Pengajuan Dikirim</p>
                          <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>

                      {/* Step 2: Pengcab */}
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          cfg.step >= 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <HiClipboardCheck className={`text-sm ${cfg.step >= 2 ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${cfg.step >= 2 ? 'text-gray-700' : 'text-gray-400'}`}>
                            Verifikasi Pengcab
                          </p>
                          {item.approvedPengcabAt ? (
                            <p className="text-xs text-gray-400">{new Date(item.approvedPengcabAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          ) : item.status === 'DITOLAK' ? (
                            <p className="text-xs text-red-500">Ditolak</p>
                          ) : (
                            <p className="text-xs text-yellow-600">Menunggu verifikasi...</p>
                          )}
                          {item.catatanPengcab && (
                            <div className="mt-1 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
                              <strong>Catatan:</strong> {item.catatanPengcab}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step 3: Pengda */}
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          cfg.step >= 3 ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <HiCheckCircle className={`text-sm ${cfg.step >= 3 ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${cfg.step >= 3 ? 'text-gray-700' : 'text-gray-400'}`}>
                            Persetujuan Pengda
                          </p>
                          {item.approvedPengdaAt ? (
                            <p className="text-xs text-gray-400">{new Date(item.approvedPengdaAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          ) : item.status === 'DITOLAK' && cfg.step < 2 ? (
                            <p className="text-xs text-gray-400">-</p>
                          ) : item.status === 'DITOLAK' ? (
                            <p className="text-xs text-red-500">Ditolak</p>
                          ) : (
                            <p className="text-xs text-gray-400">Menunggu...</p>
                          )}
                          {item.catatanAdmin && (
                            <div className="mt-1 bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700">
                              <strong>Catatan Pengda:</strong> {item.catatanAdmin}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detail info */}
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detail Event</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-400">Penyelenggara:</span><br/><span className="font-medium text-gray-700">{item.penyelenggara}</span></div>
                        <div><span className="text-gray-400">Lokasi:</span><br/><span className="font-medium text-gray-700">{item.lokasi}</span></div>
                        <div><span className="text-gray-400">Tanggal:</span><br/><span className="font-medium text-gray-700">{new Date(item.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(item.tanggalSelesai).toLocaleDateString('id-ID')}</span></div>
                        {item.kontakPerson && <div><span className="text-gray-400">Kontak:</span><br/><span className="font-medium text-gray-700">{item.kontakPerson}</span></div>}
                      </div>
                      {item.deskripsi && <p className="text-xs text-gray-600 pt-2 border-t border-gray-200 mt-2">{item.deskripsi}</p>}
                    </div>

                    {/* Actions */}
                    {item.status === 'PENDING' && (
                      <button onClick={() => handleDelete(item.id)}
                        className="flex items-center text-red-500 text-xs font-semibold hover:text-red-600 active:scale-95 transition-all">
                        <HiTrash className="mr-1" /> Batalkan Permohonan
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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

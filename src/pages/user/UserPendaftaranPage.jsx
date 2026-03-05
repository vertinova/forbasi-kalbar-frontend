import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowLeft, HiClipboardList, HiClock, HiCheckCircle, HiXCircle,
  HiClipboardCheck, HiLocationMarker, HiCalendar, HiTrash,
  HiChevronDown, HiChevronUp
} from 'react-icons/hi';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const statusConfig = {
  PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: HiClock },
  APPROVED_PENGCAB: { label: 'Diproses', color: 'bg-blue-100 text-blue-700', icon: HiClipboardCheck },
  DISETUJUI: { label: 'Diterima', color: 'bg-green-100 text-green-700', icon: HiCheckCircle },
  DITOLAK: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: HiXCircle },
};

export default function UserPendaftaranPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => { fetchData(); }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pendaftaran', { params: { status: filter || undefined } });
      setData(data);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      title: 'Batalkan Pendaftaran',
      message: 'Yakin ingin membatalkan pendaftaran ini?',
      variant: 'warning',
      confirmText: 'Ya, Batalkan',
      onConfirm: async () => {
        try {
          await api.delete(`/pendaftaran/${id}`);
          toast.success('Pendaftaran dibatalkan');
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
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Riwayat Kompetisi</h1>
          <p className="text-xs text-gray-500">Riwayat pendaftaran kejurda Anda</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {[
          { value: '', label: 'Semua' },
          { value: 'PENDING', label: 'Menunggu' },
          { value: 'DISETUJUI', label: 'Diterima' },
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
          <HiClipboardList className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Belum ada pendaftaran</p>
          <Link to="/dashboard/kejurda" className="inline-block mt-3 text-green-700 font-semibold text-sm hover:underline">
            Cari event kejurda
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => {
            const cfg = statusConfig[item.status] || statusConfig.PENDING;
            const Icon = cfg.icon;
            const isExpanded = expanded === item.id;

            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                  className="w-full text-left p-4 sm:p-5 active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate pr-2">{item.kejurda?.namaKejurda || 'Kejurda'}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center">Atlet: <strong className="ml-1 text-gray-600">{item.namaAtlet}</strong></span>
                        <span>&middot;</span>
                        <span>{item.kategori}</span>
                        {item.kelasTanding && <><span>&middot;</span><span>{item.kelasTanding}</span></>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1.5 ml-2">
                      <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {isExpanded ? <HiChevronUp className="text-gray-400" /> : <HiChevronDown className="text-gray-400" />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100 pt-4 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detail Pendaftaran</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-400">Nama Atlet:</span><br/><span className="font-medium text-gray-700">{item.namaAtlet}</span></div>
                        <div><span className="text-gray-400">Kategori:</span><br/><span className="font-medium text-gray-700">{item.kategori}</span></div>
                        {item.kelasTanding && <div><span className="text-gray-400">Kelas Tanding:</span><br/><span className="font-medium text-gray-700">{item.kelasTanding}</span></div>}
                        {item.pengcab && <div><span className="text-gray-400">Pengcab:</span><br/><span className="font-medium text-gray-700">{item.pengcab.nama} - {item.pengcab.kota}</span></div>}
                        <div><span className="text-gray-400">Tanggal Daftar:</span><br/><span className="font-medium text-gray-700">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                      </div>
                      {item.catatanAdmin && (
                        <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
                          <strong>Catatan:</strong> {item.catatanAdmin}
                        </div>
                      )}
                    </div>

                    {item.status === 'PENDING' && (
                      <button onClick={() => handleDelete(item.id)}
                        className="flex items-center text-red-500 text-xs font-semibold hover:text-red-600 active:scale-95 transition-all">
                        <HiTrash className="mr-1" /> Batalkan Pendaftaran
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

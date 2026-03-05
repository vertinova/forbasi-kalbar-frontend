import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiDocumentText, HiClock, HiCheckCircle, HiXCircle,
  HiClipboardCheck, HiLocationMarker, HiCalendar, HiTrash, HiPencil,
  HiChevronDown, HiUser, HiDocumentDuplicate, HiDownload, HiPlus
} from 'react-icons/hi';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const statusConfig = {
  DRAFT: { label: 'Draft', bg: 'bg-gray-50', text: 'text-gray-500', ring: 'ring-gray-200', icon: HiDocumentDuplicate, step: 0, barColor: 'bg-gray-300' },
  PENDING: { label: 'Menunggu', bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200', icon: HiClock, step: 1, barColor: 'bg-amber-400' },
  APPROVED_PENGCAB: { label: 'Disetujui Pengcab', bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-200', icon: HiClipboardCheck, step: 2, barColor: 'bg-sky-400' },
  DISETUJUI: { label: 'Disetujui', bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200', icon: HiCheckCircle, step: 3, barColor: 'bg-emerald-500' },
  DITOLAK: { label: 'Ditolak', bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-200', icon: HiXCircle, step: 0, barColor: 'bg-rose-400' },
};

const filterTabs = [
  { value: '', label: 'Semua', count: null },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'APPROVED_PENGCAB', label: 'Pengcab OK' },
  { value: 'DISETUJUI', label: 'Disetujui' },
  { value: 'DITOLAK', label: 'Ditolak' },
];

export default function PenyelenggaraRiwayatPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => { fetchData(); }, [filter]);
  useEffect(() => { if (!loading) { const t = setTimeout(() => setShow(true), 50); return () => clearTimeout(t); } }, [loading]);

  const fetchData = async () => {
    setLoading(true);
    setShow(false);
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

  const formatDate = (d, opts) => d ? new Date(d).toLocaleDateString('id-ID', opts) : '-';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`flex items-center justify-between transition-all duration-500 ${show || loading ? 'opacity-100' : 'opacity-0'}`}>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Riwayat Pengajuan</h1>
          <p className="text-xs text-gray-400 mt-0.5">Lacak status perizinan event Anda</p>
        </div>
        <Link to="/penyelenggara/ajukan"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-200/40 hover:shadow-lg hover:shadow-amber-300/40 transition-all active:scale-95">
          <HiPlus className="text-sm" /> Ajukan
        </Link>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              filter === f.value
                ? 'bg-gray-900 text-white shadow-md shadow-gray-900/15'
                : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200 hover:text-gray-700'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-[3px] border-gray-200" />
            <div className="w-10 h-10 rounded-full border-[3px] border-amber-500 border-t-transparent animate-spin absolute inset-0" />
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className={`bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiDocumentText className="text-3xl text-gray-300" />
          </div>
          <p className="text-gray-600 font-bold text-sm">Belum ada pengajuan</p>
          <p className="text-gray-400 text-xs mt-1 mb-5">Mulai dengan mengajukan perizinan event</p>
          <Link to="/penyelenggara/ajukan"
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-amber-200/40 transition-all active:scale-95">
            <HiPlus className="text-base" /> Ajukan Event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, idx) => {
            const cfg = statusConfig[item.status] || statusConfig.DRAFT;
            const Icon = cfg.icon;
            const isExpanded = expanded === item.id;

            return (
              <div key={item.id}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-200 animate-[fadeSlideUp_0.4s_ease-out_both]`}>
                {/* Header row */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                  className="w-full text-left p-4 sm:p-5 transition-colors hover:bg-gray-50/30"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`text-base ${cfg.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-[15px] truncate leading-tight">{item.namaEvent}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ring-1 whitespace-nowrap flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <HiCalendar className="text-gray-300" />
                          {formatDate(item.tanggalMulai, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-gray-200">|</span>
                        <span>{item.jenisEvent}</span>
                        {item.pengcab && (
                          <>
                            <span className="text-gray-200">|</span>
                            <span className="flex items-center gap-0.5"><HiLocationMarker className="text-gray-300" />{item.pengcab.kota}</span>
                          </>
                        )}
                      </div>

                      {/* Progress bar */}
                      {!['DITOLAK', 'DRAFT'].includes(item.status) && (
                        <div className="mt-3 flex items-center gap-1">
                          {[1, 2, 3].map(step => (
                            <div key={step} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step <= cfg.step ? cfg.barColor : 'bg-gray-100'}`} />
                          ))}
                        </div>
                      )}
                      {item.status === 'DITOLAK' && <div className="mt-3 h-1 bg-rose-300 rounded-full" />}
                      {item.status === 'DRAFT' && <div className="mt-3 h-1 bg-gray-200 rounded-full" />}
                    </div>
                    <HiChevronDown className={`text-gray-300 text-lg flex-shrink-0 mt-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expandable detail */}
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-gray-50">

                      {/* Tracking timeline */}
                      <div className="pt-3">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tracking Status</h4>
                        <div className="space-y-0 relative">
                          {/* Vertical line */}
                          <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gray-100 rounded-full" />

                          {/* Step 1: Submitted */}
                          <div className="flex items-start gap-3 relative">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white">
                              <HiUser className="text-amber-600 text-xs" />
                            </div>
                            <div className="pb-4">
                              <p className="text-[13px] font-bold text-gray-800">
                                {item.status === 'DRAFT' ? 'Draft Disimpan' : 'Pengajuan Dikirim'}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {formatDate(item.createdAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {item.status === 'DRAFT' && (
                                <p className="text-[11px] text-gray-400 mt-1 italic">Belum diajukan — silakan edit lalu ajukan</p>
                              )}
                            </div>
                          </div>

                          {/* Step 2: Pengcab */}
                          <div className="flex items-start gap-3 relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white ${cfg.step >= 2 ? 'bg-sky-100' : 'bg-gray-100'}`}>
                              <HiClipboardCheck className={`text-xs ${cfg.step >= 2 ? 'text-sky-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="pb-4">
                              <p className={`text-[13px] font-bold ${cfg.step >= 2 ? 'text-gray-800' : 'text-gray-400'}`}>Verifikasi Pengcab</p>
                              {item.approvedPengcabAt ? (
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  {formatDate(item.approvedPengcabAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              ) : item.status === 'DITOLAK' ? (
                                <p className="text-[11px] text-rose-500 mt-0.5 font-medium">Ditolak</p>
                              ) : (
                                <p className="text-[11px] text-amber-500 mt-0.5 font-medium">Menunggu verifikasi...</p>
                              )}
                              {item.catatanPengcab && (
                                <div className="mt-2 bg-sky-50 rounded-xl px-3 py-2 text-[11px] text-sky-700 border border-sky-100">
                                  <span className="font-bold">Catatan:</span> {item.catatanPengcab}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Step 3: Pengda */}
                          <div className="flex items-start gap-3 relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white ${cfg.step >= 3 ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                              <HiCheckCircle className={`text-xs ${cfg.step >= 3 ? 'text-emerald-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <p className={`text-[13px] font-bold ${cfg.step >= 3 ? 'text-gray-800' : 'text-gray-400'}`}>Persetujuan Pengda</p>
                              {item.approvedPengdaAt ? (
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  {formatDate(item.approvedPengdaAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              ) : item.status === 'DITOLAK' && cfg.step < 2 ? (
                                <p className="text-[11px] text-gray-300 mt-0.5">—</p>
                              ) : item.status === 'DITOLAK' ? (
                                <p className="text-[11px] text-rose-500 mt-0.5 font-medium">Ditolak</p>
                              ) : (
                                <p className="text-[11px] text-gray-400 mt-0.5">Menunggu...</p>
                              )}
                              {item.catatanAdmin && (
                                <div className="mt-2 bg-emerald-50 rounded-xl px-3 py-2 text-[11px] text-emerald-700 border border-emerald-100">
                                  <span className="font-bold">Catatan Pengda:</span> {item.catatanAdmin}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detail Event */}
                      <div className="bg-gray-50/80 rounded-xl p-4 space-y-2">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Detail Event</h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400 text-[10px]">Penyelenggara</span>
                            <p className="font-semibold text-gray-700 mt-0.5">{item.penyelenggara || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-[10px]">Lokasi</span>
                            <p className="font-semibold text-gray-700 mt-0.5">{item.lokasi || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-[10px]">Tanggal</span>
                            <p className="font-semibold text-gray-700 mt-0.5">
                              {item.tanggalMulai ? `${formatDate(item.tanggalMulai, { day: 'numeric', month: 'short' })} - ${formatDate(item.tanggalSelesai, { day: 'numeric', month: 'short', year: 'numeric' })}` : '-'}
                            </p>
                          </div>
                          {item.kontakPerson && (
                            <div>
                              <span className="text-gray-400 text-[10px]">Kontak</span>
                              <p className="font-semibold text-gray-700 mt-0.5">{item.kontakPerson}</p>
                            </div>
                          )}
                          {item.noBilingSimpaskor && (
                            <div className="col-span-2">
                              <span className="text-gray-400 text-[10px]">No. Billing Simpaskor</span>
                              <p className="font-semibold text-gray-700 mt-0.5">{item.noBilingSimpaskor}</p>
                            </div>
                          )}
                        </div>
                        {item.deskripsi && (
                          <div className="pt-2 border-t border-gray-200/80 mt-2">
                            <span className="text-gray-400 text-[10px]">Deskripsi</span>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.deskripsi}</p>
                          </div>
                        )}
                      </div>

                      {/* Download Surat */}
                      {item.status === 'DISETUJUI' && item.suratRekomendasi && (
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200/60">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <HiDocumentText className="text-emerald-600 text-lg" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-emerald-800">Surat Rekomendasi</p>
                                <p className="text-[11px] text-emerald-600 truncate">Resmi dari Pengda FORBASI Kalbar</p>
                              </div>
                            </div>
                            <a
                              href={(import.meta.env.VITE_API_URL || '') + item.suratRekomendasi}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95 whitespace-nowrap"
                            >
                              <HiDownload size={14} /> Download
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {['DRAFT', 'DITOLAK'].includes(item.status) && (
                        <div className="flex items-center gap-2 pt-1">
                          <Link to={`/penyelenggara/edit/${item.id}`}
                            className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100 transition-all active:scale-95 ring-1 ring-amber-200">
                            <HiPencil className="text-xs" /> Edit & Ajukan Ulang
                          </Link>
                          <button onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition-all active:scale-95 ring-1 ring-rose-200">
                            <HiTrash className="text-xs" /> Hapus
                          </button>
                        </div>
                      )}

                      {item.status === 'PENDING' && (
                        <button onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition-all active:scale-95 ring-1 ring-rose-200">
                          <HiTrash className="text-xs" /> Batalkan Permohonan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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

      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import {
  HiClipboardList, HiCalendar, HiCheckCircle, HiClock, HiXCircle,
  HiSearch, HiLocationMarker, HiEye, HiX, HiUpload, HiPhotograph,
  HiTrash, HiCurrencyDollar, HiExclamationCircle, HiQrcode, HiDownload
} from 'react-icons/hi';
import { QRCodeSVG } from 'qrcode.react';
import api, { getUploadUrl } from '../../lib/api';
import toast from 'react-hot-toast';

export default function UmumRiwayatPage() {
  const [pendaftaran, setPendaftaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchPendaftaran();
  }, []);

  const fetchPendaftaran = async () => {
    try {
      const res = await api.get('/pendaftaran');
      setPendaftaran(res.data || []);
    } catch (err) {
      console.error('Error fetching pendaftaran:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status, dp) => {
    // DP-specific status overrides
    if (dp?.isBookingDP) {
      if (dp.statusPembayaran === 'DITOLAK_PELUNASAN') {
        return {
          label: 'Pelunasan Ditolak',
          icon: HiXCircle,
          bg: 'bg-red-100',
          text: 'text-red-700',
          iconColor: 'text-red-600',
        };
      }
      if (dp.statusPembayaran === 'DP') {
        return {
          label: 'Menunggu Pelunasan',
          icon: HiExclamationCircle,
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          iconColor: 'text-orange-600',
        };
      }
      if (dp.statusPembayaran === 'MENUNGGU_VERIFIKASI') {
        return {
          label: 'Verifikasi Pelunasan',
          icon: HiClock,
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          iconColor: 'text-blue-600',
        };
      }
    }
    const configs = {
      PENDING: {
        label: 'Menunggu',
        icon: HiClock,
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        iconColor: 'text-amber-600',
      },
      DISETUJUI: {
        label: 'Terdaftar',
        icon: HiCheckCircle,
        bg: 'bg-green-100',
        text: 'text-green-700',
        iconColor: 'text-green-600',
      },
      DITOLAK: {
        label: 'Ditolak',
        icon: HiXCircle,
        bg: 'bg-red-100',
        text: 'text-red-700',
        iconColor: 'text-red-600',
      },
    };
    return configs[status] || configs.PENDING;
  };

  const filteredData = pendaftaran.filter(p => {
    const matchSearch = 
      p.kejurda?.namaKejurda?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.namaAtlet?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: pendaftaran.length,
    pending: pendaftaran.filter(p => p.status === 'PENDING').length,
    disetujui: pendaftaran.filter(p => p.status === 'DISETUJUI').length,
    ditolak: pendaftaran.filter(p => p.status === 'DITOLAK').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Riwayat Pendaftaran</h1>
        <p className="text-sm text-gray-500 mt-1">Lihat status pendaftaran event Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          <p className="text-xs text-amber-600">Menunggu</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-2xl font-bold text-green-700">{stats.disetujui}</p>
          <p className="text-xs text-green-600">Disetujui</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-2xl font-bold text-red-700">{stats.ditolak}</p>
          <p className="text-xs text-red-600">Ditolak</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pendaftaran..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'DISETUJUI', 'DITOLAK'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {status === 'ALL' ? 'Semua' : getStatusConfig(status).label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filteredData.length > 0 ? (
        <div className="space-y-3">
          {filteredData.map((item) => {
            const dp = item.dataPersyaratan || {};
            const statusCfg = getStatusConfig(item.status, dp);
            const StatusIcon = statusCfg.icon;
            const needsPelunasan = dp.isBookingDP && (dp.statusPembayaran === 'DP' || dp.statusPembayaran === 'DITOLAK_PELUNASAN');
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-11 h-11 rounded-xl ${statusCfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={statusCfg.iconColor} size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-800 truncate">{item.kejurda?.namaKejurda || 'Event'}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{item.namaAtlet}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <HiCalendar size={12} />
                          {formatDate(item.createdAt)}
                        </span>
                        {item.kategori && (
                          <>
                            <span>•</span>
                            <span>{item.kategori}</span>
                          </>
                        )}
                        {dp.isBookingDP && (
                          <>
                            <span>•</span>
                            <span className={`font-semibold ${
                              dp.statusPembayaran === 'LUNAS' ? 'text-green-600' :
                              dp.statusPembayaran === 'DITOLAK_PELUNASAN' ? 'text-red-600' :
                              'text-orange-600'
                            }`}>
                              {dp.statusPembayaran === 'LUNAS' ? 'Lunas' : dp.statusPembayaran === 'MENUNGGU_VERIFIKASI' ? 'Verifikasi' : dp.statusPembayaran === 'DITOLAK_PELUNASAN' ? 'Ditolak' : 'DP'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <HiEye className="text-gray-500" size={18} />
                    </button>
                  </div>
                </div>

                {/* Catatan Admin / Rejection Note */}
                {item.status === 'DITOLAK' && item.catatanAdmin && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-xs font-bold text-red-700 flex items-center gap-1 mb-1"><HiXCircle size={14} /> Alasan Penolakan:</p>
                      <p className="text-sm text-red-600">{item.catatanAdmin}</p>
                    </div>
                  </div>
                )}

                {/* Pelunasan Ditolak Note */}
                {dp.statusPembayaran === 'DITOLAK_PELUNASAN' && dp.catatanPelunasan && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-xs font-bold text-red-700 flex items-center gap-1 mb-1"><HiXCircle size={14} /> Pelunasan Ditolak:</p>
                      <p className="text-sm text-red-600">{dp.catatanPelunasan}</p>
                    </div>
                  </div>
                )}

                {/* Pelunasan CTA */}
                {needsPelunasan && (
                  <div className={`mt-3 pt-3 border-t border-gray-100 ${dp.statusPembayaran === 'DITOLAK_PELUNASAN' && dp.catatanPelunasan ? 'mt-0 pt-2 border-t-0' : ''}`}>
                    <button
                      onClick={() => setSelectedItem({ ...item, showPelunasan: true })}
                      className={`w-full py-2.5 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98] ${
                        dp.statusPembayaran === 'DITOLAK_PELUNASAN'
                          ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/20'
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20'
                      }`}
                    >
                      <HiUpload size={16} /> {dp.statusPembayaran === 'DITOLAK_PELUNASAN' ? 'Upload Ulang Pelunasan' : 'Upload Bukti Pelunasan'}
                    </button>
                  </div>
                )}

                {/* QR Ticket CTA */}
                {item.status === 'DISETUJUI' && item.qrToken && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedItem({ ...item, showQrTicket: true })}
                      className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <HiQrcode size={16} /> Lihat Tiket QR
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <HiClipboardList className="text-gray-400" size={36} />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">Belum Ada Pendaftaran</h3>
          <p className="text-gray-500 text-sm">
            {searchQuery || filterStatus !== 'ALL' 
              ? 'Tidak ada pendaftaran yang cocok dengan filter' 
              : 'Daftar event publik untuk melihat riwayat di sini'}
          </p>
        </div>
      )}

      {/* Detail / Pelunasan Modal */}
      {selectedItem && (
        <DetailPelunasanModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPelunasanSuccess={() => {
            setSelectedItem(null);
            fetchPendaftaran();
            toast.success('Bukti pelunasan berhasil diupload! Menunggu verifikasi admin.');
          }}
          getStatusConfig={getStatusConfig}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Detail & Pelunasan Modal
// ═══════════════════════════════════════
function DetailPelunasanModal({ item, onClose, onPelunasanSuccess, getStatusConfig, formatDate }) {
  const dp = item.dataPersyaratan || {};
  const showPelunasanForm = item.showPelunasan && dp.isBookingDP && (dp.statusPembayaran === 'DP' || dp.statusPembayaran === 'DITOLAK_PELUNASAN');
  const showQrTicket = item.showQrTicket || (item.status === 'DISETUJUI' && item.qrToken && !showPelunasanForm);
  const [buktiPelunasan, setBuktiPelunasan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);
  const qrRef = useRef(null);

  const sisaBayar = (dp.nominalPembayaran || 0) - (dp.nominalDP || dp.nominalBayar || 0);
  const formatCurrency = (val) => val ? `Rp ${parseInt(val).toLocaleString('id-ID')}` : '-';

  const handleSubmitPelunasan = async () => {
    if (!buktiPelunasan) {
      toast.error('Upload bukti pembayaran pelunasan');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('nominalPelunasan', sisaBayar.toString());
      formData.append('buktiPelunasan', buktiPelunasan);
      await api.patch(`/pendaftaran/${item.id}/pelunasan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onPelunasanSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal upload pelunasan');
    } finally {
      setSubmitting(false);
    }
  };

  const statusCfg = getStatusConfig(item.status, dp);
  const StatusIcon = statusCfg.icon;

  const downloadQrTicket = () => {
    const svgEl = qrRef.current?.querySelector('svg');
    if (!svgEl) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const padding = 40;
    canvas.width = 300 + padding * 2;
    canvas.height = 420 + padding * 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TIKET MASUK EVENT', canvas.width / 2, padding + 20);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#4b5563';
    ctx.fillText(item.kejurda?.namaKejurda || 'Event', canvas.width / 2, padding + 42);
    ctx.fillText(item.namaAtlet, canvas.width / 2, padding + 60);
    // Draw QR
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, (canvas.width - 200) / 2, padding + 80, 200, 200);
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px sans-serif';
      ctx.fillText('Tunjukkan QR ini di pintu masuk venue', canvas.width / 2, padding + 310);
      const link = document.createElement('a');
      link.download = `tiket-${item.namaAtlet.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">{showQrTicket ? 'Tiket Masuk' : showPelunasanForm ? 'Upload Pelunasan' : 'Detail Pendaftaran'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <HiX size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-8rem)] space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
              <StatusIcon size={18} />
              <span className="font-bold text-sm">{statusCfg.label}</span>
            </div>
          </div>

          {/* Event Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-800">{item.kejurda?.namaKejurda || 'Event'}</h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <HiLocationMarker size={14} />
              <span>{item.kejurda?.lokasi || '-'}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <HiCalendar size={14} />
              <span>{item.kejurda?.tanggalMulai ? formatDate(item.kejurda.tanggalMulai) : '-'}</span>
            </div>
          </div>

          {/* Payment Info for DP */}
          {dp.isBookingDP && (
            <div className={`rounded-xl p-4 border ${dp.statusPembayaran === 'LUNAS' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <h4 className={`text-sm font-bold mb-2 ${dp.statusPembayaran === 'LUNAS' ? 'text-green-800' : 'text-orange-800'}`}>
                <HiCurrencyDollar className="inline mr-1" size={16} />
                Informasi Pembayaran
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Tipe Biaya</p>
                  <p className="font-semibold text-gray-700">{dp.labelBiaya || dp.tipeBiaya}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Harga</p>
                  <p className="font-semibold text-gray-700">{formatCurrency(dp.nominalPembayaran)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">DP Dibayar</p>
                  <p className="font-semibold text-amber-700">{formatCurrency(dp.nominalDP || dp.nominalBayar)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Sisa Bayar</p>
                  <p className={`font-bold ${dp.statusPembayaran === 'LUNAS' ? 'text-green-600' : 'text-red-600'}`}>
                    {dp.statusPembayaran === 'LUNAS' ? 'Rp 0' : formatCurrency(sisaBayar)}
                  </p>
                </div>
              </div>
              {dp.nominalPelunasan && (
                <div className="mt-2 pt-2 border-t border-orange-200/50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Pelunasan Dibayar</p>
                      <p className="font-semibold text-green-700">{formatCurrency(dp.nominalPelunasan)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Status</p>
                      <p className={`font-bold text-sm ${dp.statusPembayaran === 'LUNAS' ? 'text-green-600' : 'text-blue-600'}`}>
                        {dp.statusPembayaran === 'LUNAS' ? 'Lunas ✓' : 'Menunggu Verifikasi'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QR Ticket Section */}
          {showQrTicket && item.qrToken && (
            <div className="space-y-4">
              {/* Event Info */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <h3 className="font-bold text-green-800 text-center">{item.kejurda?.namaKejurda || 'Event'}</h3>
                <div className="flex items-center justify-center gap-2 mt-1 text-sm text-green-600">
                  <HiLocationMarker size={14} />
                  <span>{item.kejurda?.lokasi || '-'}</span>
                </div>
                {item.kejurda?.tanggalMulai && (
                  <div className="flex items-center justify-center gap-2 mt-1 text-sm text-green-600">
                    <HiCalendar size={14} />
                    <span>{formatDate(item.kejurda.tanggalMulai)}</span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center" ref={qrRef}>
                <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-green-200">
                  <QRCodeSVG
                    value={item.qrToken}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#1f2937"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">Tunjukkan QR code ini di pintu masuk venue</p>
              </div>

              {/* Peserta Info Card */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Nama Peserta</span>
                  <span className="font-semibold text-gray-800">{item.namaAtlet}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Kategori</span>
                  <span className="font-semibold text-gray-800">{item.kategori || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">ID Pendaftaran</span>
                  <span className="font-mono font-semibold text-gray-800">#{item.id}</span>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={downloadQrTicket}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <HiDownload size={18} /> Download Tiket
              </button>
            </div>
          )}

          {/* Peserta Info */}
          {!showPelunasanForm && !showQrTicket && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase">Nama Peserta</label>
                <p className="text-gray-800 font-medium">{item.namaAtlet}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase">Kategori</label>
                <p className="text-gray-800">{item.kategori || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase">Tanggal Daftar</label>
                <p className="text-gray-800">{formatDate(item.createdAt)}</p>
              </div>
              {item.catatanAdmin && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <label className="text-xs font-medium text-blue-600 uppercase">Catatan dari Admin</label>
                  <p className="text-blue-800 text-sm mt-1">{item.catatanAdmin}</p>
                </div>
              )}
            </div>
          )}

          {/* Pelunasan Upload Form */}
          {showPelunasanForm && (
            <div className="space-y-4">
              {/* Rejection Note (if re-upload after rejection) */}
              {dp.statusPembayaran === 'DITOLAK_PELUNASAN' && dp.catatanPelunasan && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-red-700 flex items-center gap-1 mb-1"><HiXCircle size={14} /> Alasan Penolakan Pelunasan:</p>
                  <p className="text-sm text-red-600">{dp.catatanPelunasan}</p>
                </div>
              )}

              {/* Nominal Pelunasan (fixed / read-only) */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Nominal Pelunasan yang Harus Dibayar</p>
                <p className="text-2xl font-bold text-amber-800">{formatCurrency(sisaBayar)}</p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <HiExclamationCircle size={14} />
                  Transfer tepat sesuai nominal di atas
                </p>
              </div>

              {/* Upload Bukti */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Upload Bukti Pelunasan <span className="text-red-500">*</span>
                </label>
                <input type="file" ref={fileRef} accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f && f.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
                    setBuktiPelunasan(f || null);
                  }} className="hidden" />
                {!buktiPelunasan ? (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/50 transition-all">
                    <HiUpload size={18} /> Upload Bukti Transfer Pelunasan
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-xl">
                    <HiPhotograph className="text-orange-600 shrink-0" size={20} />
                    <span className="text-sm text-orange-700 flex-1 truncate">{buktiPelunasan.name}</span>
                    <button type="button" onClick={() => { setBuktiPelunasan(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="text-red-400 hover:text-red-600 shrink-0"><HiTrash size={16} /></button>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button onClick={handleSubmitPelunasan} disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Mengupload...</span></>
                ) : (
                  <><HiCheckCircle size={20} /><span>{dp.statusPembayaran === 'DITOLAK_PELUNASAN' ? 'Kirim Ulang Bukti Pelunasan' : 'Kirim Bukti Pelunasan'}</span></>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

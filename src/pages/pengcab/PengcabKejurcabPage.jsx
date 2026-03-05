import { useEffect, useState } from 'react';
import {
  HiPlus, HiClock, HiCheckCircle, HiXCircle, HiCalendar, HiLocationMarker,
  HiUsers, HiShieldCheck, HiExclamationCircle, HiChevronRight,
  HiArrowLeft, HiPencilAlt, HiClipboardList, HiCheck, HiChevronDown,
  HiDocumentText, HiDownload, HiMail, HiPhone, HiTag, HiCollection, HiX
} from 'react-icons/hi';
import api, { getUploadUrl } from '../../lib/api';
import toast from 'react-hot-toast';
import BillingVerifyModal from '../../components/BillingVerifyModal';
import AlertModal from '../../components/AlertModal';
import MataLombaForm from '../../components/MataLombaForm';
import ProposalKegiatanForm from '../../components/ProposalKegiatanForm';
import PersyaratanForm from '../../components/PersyaratanForm';
import FormatDokumenModal from '../../components/FormatDokumenModal';

const approvalConfig = {
  PENDING: { label: 'Menunggu Persetujuan', bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200', icon: HiClock, barColor: 'bg-amber-400' },
  DISETUJUI: { label: 'Disetujui Pengda', bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200', icon: HiCheckCircle, barColor: 'bg-emerald-500' },
  DITOLAK: { label: 'Ditolak', bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-200', icon: HiXCircle, barColor: 'bg-rose-400' },
};

const formSteps = [
  { num: 1, label: 'Detail & Billing', short: 'Detail' },
  { num: 2, label: 'Mata Lomba', short: 'Lomba' },
  { num: 3, label: 'Persyaratan', short: 'Syarat' },
];

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white/80 transition-all placeholder:text-gray-300';

export default function PengcabKejurcabPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [show, setShow] = useState(false);

  // Form state
  const [form, setForm] = useState({
    namaKejurda: '', tanggalMulai: '', tanggalSelesai: '', lokasi: '', deskripsi: '', noBilingSimpaskor: ''
  });
  const [mataLombaData, setMataLombaData] = useState({});
  const [proposalFile, setProposalFile] = useState(null);
  const [proposalFileName, setProposalFileName] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterFileName, setPosterFileName] = useState(null);
  const [persyaratanData, setPersyaratanData] = useState({});
  const [persyaratanFiles, setPersyaratanFiles] = useState({});

  // Billing state
  const [billingStatus, setBillingStatus] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', variant: 'error' });
  const [showFormatModal, setShowFormatModal] = useState(false);

  // Pendaftaran management state
  const [pendaftaranModal, setPendaftaranModal] = useState({ open: false, kejurcabId: null, kejurcabNama: '' });
  const [pendaftaranList, setPendaftaranList] = useState([]);
  const [pendaftaranLoading, setPendaftaranLoading] = useState(false);
  const [togglingRegistration, setTogglingRegistration] = useState(null);
  const [processingPendaftaran, setProcessingPendaftaran] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, pendaftaranId: null, catatan: '' });

  const showAlert = (title, message, variant = 'warning') => setAlertModal({ open: true, title, message, variant });
  const closeAlert = () => setAlertModal(prev => ({ ...prev, open: false }));

  const fetchData = async () => {
    setLoading(true);
    setShow(false);
    try {
      const { data } = await api.get('/pengcab-panel/kejurcab');
      setItems(data);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (!loading) { const t = setTimeout(() => setShow(true), 50); return () => clearTimeout(t); } }, [loading]);

  // Pendaftaran management functions
  const fetchPendaftaran = async (kejurcabId) => {
    setPendaftaranLoading(true);
    try {
      const { data } = await api.get(`/pengcab-panel/kejurcab/${kejurcabId}/pendaftaran`);
      setPendaftaranList(data);
    } catch (err) {
      showAlert('Gagal', 'Gagal memuat data pendaftaran.', 'error');
      setPendaftaranList([]);
    } finally {
      setPendaftaranLoading(false);
    }
  };

  const openPendaftaranModal = (item) => {
    setPendaftaranModal({ open: true, kejurcabId: item.id, kejurcabNama: item.namaKejurda });
    fetchPendaftaran(item.id);
  };

  const closePendaftaranModal = () => {
    setPendaftaranModal({ open: false, kejurcabId: null, kejurcabNama: '' });
    setPendaftaranList([]);
  };

  const handleToggleRegistration = async (item) => {
    setTogglingRegistration(item.id);
    try {
      await api.patch(`/pengcab-panel/kejurcab/${item.id}/toggle-registration`);
      await fetchData();
      showAlert('Berhasil', `Pendaftaran ${item.statusBuka ? 'ditutup' : 'dibuka'}`, 'success');
    } catch (err) {
      showAlert('Gagal', err.response?.data?.message || 'Gagal mengubah status pendaftaran.', 'error');
    } finally {
      setTogglingRegistration(null);
    }
  };

  const handleApprovePendaftaran = async (pendaftaranId) => {
    setProcessingPendaftaran(pendaftaranId);
    try {
      await api.patch(`/pengcab-panel/pendaftaran/${pendaftaranId}/approve`);
      await fetchPendaftaran(pendaftaranModal.kejurcabId);
      showAlert('Berhasil', 'Pendaftaran disetujui.', 'success');
    } catch (err) {
      showAlert('Gagal', err.response?.data?.message || 'Gagal menyetujui pendaftaran.', 'error');
    } finally {
      setProcessingPendaftaran(null);
    }
  };

  const handleRejectPendaftaran = async () => {
    if (!rejectModal.pendaftaranId) return;
    setProcessingPendaftaran(rejectModal.pendaftaranId);
    try {
      await api.patch(`/pengcab-panel/pendaftaran/${rejectModal.pendaftaranId}/reject`, { catatan: rejectModal.catatan });
      setRejectModal({ open: false, pendaftaranId: null, catatan: '' });
      await fetchPendaftaran(pendaftaranModal.kejurcabId);
      showAlert('Berhasil', 'Pendaftaran ditolak.', 'success');
    } catch (err) {
      showAlert('Gagal', err.response?.data?.message || 'Gagal menolak pendaftaran.', 'error');
    } finally {
      setProcessingPendaftaran(null);
    }
  };

  const resetForm = () => {
    setForm({ namaKejurda: '', tanggalMulai: '', tanggalSelesai: '', lokasi: '', deskripsi: '', noBilingSimpaskor: '' });
    setMataLombaData({});
    setProposalFile(null);
    setProposalFileName(null);
    setPosterFile(null);
    setPosterFileName(null);
    setPersyaratanData({});
    setPersyaratanFiles({});
    setBillingStatus(null);
    setStep(1);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'noBilingSimpaskor') setBillingStatus(null);
  };

  const handleFileChange = (key, file) => setPersyaratanFiles(prev => ({ ...prev, [key]: file }));

  const handleVerifyBilling = async () => {
    const code = form.noBilingSimpaskor?.trim();
    if (!code) { showAlert('Kode Billing Kosong', 'Masukkan kode billing Simpaskor terlebih dahulu.', 'warning'); return; }
    setBillingStatus('loading');
    try {
      const { data } = await api.get(`/simpaskor/verify?billing_id=${encodeURIComponent(code)}`);
      if (data.success && data.data) {
        const paymentStatus = data.data.payment?.status;
        if (paymentStatus && paymentStatus.toLowerCase() === 'lunas') {
          setBillingStatus({ valid: true, data: data.data });
        } else {
          setBillingStatus({ valid: false, data: data.data, message: `Billing ditemukan tetapi status pembayaran belum Lunas (${paymentStatus || 'Tidak diketahui'}). Silakan lunasi pembayaran billing Simpaskor Anda terlebih dahulu.` });
        }
        setShowBillingModal(true);
      } else {
        setBillingStatus({ valid: false, message: 'Kode billing tidak ditemukan. Pastikan nomor billing Anda sudah benar dan terdaftar di Simpaskor.' });
        setShowBillingModal(true);
      }
    } catch (err) {
      const msg = err.response?.status === 504
        ? 'Server Simpaskor sedang tidak merespon. Silakan coba beberapa saat lagi.'
        : 'Gagal menghubungi server Simpaskor. Periksa koneksi internet Anda dan coba lagi.';
      setBillingStatus({ valid: false, message: msg });
      setShowBillingModal(true);
    }
  };

  const validateStep1 = () => {
    if (!form.namaKejurda) { showAlert('Data Belum Lengkap', 'Nama Kejurcab wajib diisi.', 'warning'); return false; }
    if (!form.tanggalMulai || !form.tanggalSelesai) { showAlert('Data Belum Lengkap', 'Tanggal mulai dan selesai wajib diisi.', 'warning'); return false; }
    if (!form.lokasi) { showAlert('Data Belum Lengkap', 'Lokasi wajib diisi.', 'warning'); return false; }
    // Billing wajib
    if (!form.noBilingSimpaskor?.trim()) { showAlert('Billing Simpaskor Wajib', 'Nomor billing Simpaskor wajib diisi untuk mengajukan Kejurcab.', 'warning'); return false; }
    if (!billingStatus || billingStatus === 'loading') { showAlert('Verifikasi Billing', 'Silakan klik tombol Verifikasi untuk memvalidasi kode billing Simpaskor Anda.', 'warning'); return false; }
    if (!billingStatus.valid) {
      const paymentInfo = billingStatus.data?.payment?.status;
      if (billingStatus.data && paymentInfo && paymentInfo.toLowerCase() !== 'lunas') {
        showAlert('Pembayaran Belum Lunas', `Status pembayaran billing: "${paymentInfo}". Lunasi terlebih dahulu.`, 'error');
      } else {
        showAlert('Verifikasi Billing Gagal', billingStatus.message || 'Kode billing tidak valid.', 'warning');
      }
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2) setStep(3);
  };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });

      // Persyaratan
      const persyaratanMeta = {};
      Object.entries(persyaratanData).forEach(([key, val]) => {
        persyaratanMeta[key] = { ada: val.ada || false };
        if (val.text) persyaratanMeta[key].text = val.text;
        if (val.fileName) persyaratanMeta[key].fileName = val.fileName;
        if (val.juriList) persyaratanMeta[key].juriList = val.juriList;
      });
      formData.append('persyaratan', JSON.stringify(persyaratanMeta));

      // Persyaratan files
      Object.entries(persyaratanFiles).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      // Juri foto files
      if (persyaratanData.namaJuri?.juriList) {
        persyaratanData.namaJuri.juriList.forEach((juri, idx) => {
          if (juri.fotoFile) formData.append(`juriFoto_${idx}`, juri.fotoFile);
        });
      }

      // Mata Lomba
      formData.append('mataLomba', JSON.stringify(mataLombaData));

      // Proposal
      if (proposalFile) formData.append('proposalKegiatan', proposalFile);

      // Poster
      if (posterFile) formData.append('poster', posterFile);

      await api.post('/pengcab-panel/kejurcab', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Pengajuan Kejurcab berhasil dikirim!');
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengajukan kejurcab');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d, opts) => d ? new Date(d).toLocaleDateString('id-ID', opts) : '-';

  // ======================== FORM MODE ========================
  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto pb-6">
        {/* Header — glassmorphism */}
        <div className="relative flex items-center justify-between mb-6 bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg shadow-green-100/20 animate-[slideDown_0.5s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-50/40 via-transparent to-emerald-50/40 pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <button onClick={() => step > 1 ? handleBack() : resetForm()}
              className="w-10 h-10 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 hover:shadow-md active:scale-95 transition-all duration-200">
              <HiArrowLeft className="text-gray-500 text-base" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">Ajukan Kejurcab</h1>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Langkah {step} dari 3 — {formSteps[step - 1].label}</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowFormatModal(true)}
            className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 hover:from-green-100 hover:to-emerald-100 active:scale-95 transition-all text-xs font-bold ring-1 ring-green-200/60 shadow-sm">
            <HiDocumentText className="text-sm" />
            <span className="hidden sm:inline">Format Surat</span>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-6 bg-gray-50/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-100 animate-[slideDown_0.5s_0.1s_cubic-bezier(0.16,1,0.3,1)_both]">
          {formSteps.map((s, i) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            const StepIcon = s.num === 1 ? HiPencilAlt : s.num === 2 ? HiClipboardList : HiCheck;
            return (
              <div key={s.num} className="flex items-center flex-1 gap-1.5">
                <button type="button" onClick={() => { if (isDone) setStep(s.num); }}
                  className={`flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-green-700 shadow-md shadow-green-200/30 ring-1 ring-green-100'
                      : isDone
                        ? 'bg-white/60 text-emerald-600 hover:bg-white/80 cursor-pointer'
                        : 'text-gray-400'
                  }`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm shadow-green-300/40'
                      : isDone
                        ? 'bg-emerald-100 text-emerald-500'
                        : 'bg-gray-100 text-gray-300'
                  }`}>
                    {isDone ? <HiCheck className="text-[11px]" /> : <StepIcon className="text-[11px]" />}
                  </div>
                  <span className="hidden sm:block truncate">{s.short}</span>
                </button>
                {i < 2 && (
                  <div className="flex-shrink-0">
                    <HiChevronRight className={`text-xs transition-colors duration-300 ${isDone ? 'text-emerald-300' : 'text-gray-200'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <FormatDokumenModal open={showFormatModal} onClose={() => setShowFormatModal(false)} />

        <form onSubmit={handleSubmit}>
          {/* ==================== Step 1: Detail + Billing ==================== */}
          {step === 1 && (
            <div className="space-y-4 animate-[formStepIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
              {/* Info alur */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50/80 to-green-50/60 border border-green-100/60 p-4 shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-200/20 to-transparent rounded-bl-full" />
                <div className="relative flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-300/30">
                    <HiDocumentText className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-green-800 mb-1">Alur Persetujuan</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-medium">
                      <span className="px-2 py-0.5 bg-white/60 rounded-md">Pengajuan</span>
                      <HiChevronRight className="text-green-300 text-[10px]" />
                      <span className="px-2 py-0.5 bg-white/60 rounded-md font-bold">Pengda</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Kejurcab */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-green-400 via-emerald-400 to-green-300" />
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                      <HiDocumentText className="text-green-500 text-sm" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-gray-900 text-sm tracking-tight">Informasi Kejurcab</h2>
                      <p className="text-[10px] text-gray-400 font-medium">Detail lengkap kejuaraan cabang</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Nama Kejurcab <span className="text-rose-400">*</span></label>
                    <input type="text" name="namaKejurda" value={form.namaKejurda} onChange={handleChange}
                      className={inputCls} placeholder="Kejurcab FORBASI Kota Bandung 2026" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                        <HiCalendar className="inline mr-1 text-green-400 text-xs -mt-0.5" />Mulai <span className="text-rose-400">*</span>
                      </label>
                      <input type="date" name="tanggalMulai" value={form.tanggalMulai} onChange={handleChange} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                        <HiCalendar className="inline mr-1 text-green-400 text-xs -mt-0.5" />Selesai <span className="text-rose-400">*</span>
                      </label>
                      <input type="date" name="tanggalSelesai" value={form.tanggalSelesai} onChange={handleChange} className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      <HiLocationMarker className="inline mr-1 text-green-400 text-xs -mt-0.5" />Lokasi <span className="text-rose-400">*</span>
                    </label>
                    <input type="text" name="lokasi" value={form.lokasi} onChange={handleChange} className={inputCls} placeholder="GOR / Lapangan / Stadion..." />
                  </div>
                </div>
              </div>

              {/* Billing Simpaskor — WAJIB */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden animate-[formStepIn_0.5s_0.08s_cubic-bezier(0.16,1,0.3,1)_both]">
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                      <HiShieldCheck className="text-violet-500 text-sm" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-gray-900 text-sm tracking-tight">Billing Simpaskor <span className="text-red-500">*</span></h2>
                      <p className="text-[10px] text-gray-400 font-medium">Wajib — verifikasi kode billing untuk mengajukan Kejurcab</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">No. Billing <span className="text-rose-400">*</span></label>
                    <div className="flex gap-2">
                      <input type="text" name="noBilingSimpaskor" value={form.noBilingSimpaskor} onChange={handleChange}
                        className={`${inputCls} flex-1 ${billingStatus?.valid ? '!border-emerald-200 !bg-emerald-50/30 !ring-emerald-100' : ''}`} placeholder="Masukkan nomor billing" />
                      <button type="button" onClick={handleVerifyBilling} disabled={billingStatus === 'loading' || !form.noBilingSimpaskor?.trim()}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.97] flex-shrink-0 disabled:opacity-50 ${
                          billingStatus?.valid
                            ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 shadow-sm'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-200/30'
                        }`}>
                        {billingStatus === 'loading' ? (
                          <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Cek...</>
                        ) : billingStatus?.valid ? (
                          <><HiShieldCheck className="text-sm" /> Verified</>
                        ) : (
                          <><HiShieldCheck className="text-sm" /> Verifikasi</>
                        )}
                      </button>
                    </div>

                    {/* Verified badge */}
                    {billingStatus && billingStatus !== 'loading' && billingStatus.valid && (
                      <div className="mt-2.5 flex items-center gap-2 animate-fadeIn">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                          <HiShieldCheck className="text-emerald-500 text-sm" />
                          <span className="text-[11px] text-emerald-700 font-bold">Terverifikasi</span>
                          {billingStatus.data?.billing_id && (
                            <span className="text-[10px] text-emerald-500 font-mono font-semibold">({billingStatus.data.billing_id})</span>
                          )}
                        </div>
                        <button type="button" onClick={() => setShowBillingModal(true)} className="text-[10px] text-sky-500 hover:text-sky-600 font-semibold transition-colors underline underline-offset-2">
                          Lihat Detail
                        </button>
                      </div>
                    )}

                    {/* Error badge */}
                    {billingStatus && billingStatus !== 'loading' && !billingStatus.valid && (
                      <div className="mt-2.5 flex items-center gap-2 animate-fadeIn">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-100">
                          <HiExclamationCircle className="text-rose-500 text-sm" />
                          <span className="text-[11px] text-rose-700 font-bold">Gagal Verifikasi</span>
                        </div>
                        <button type="button" onClick={() => setShowBillingModal(true)} className="text-[10px] text-rose-400 hover:text-rose-500 font-semibold transition-colors underline underline-offset-2">
                          Lihat Detail
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Simpaskor pricing cards */}
                  <div className="space-y-4 pt-2">
                    <div className="text-center">
                      <p className="text-sm font-extrabold text-gray-800 tracking-tight">Pilih <span className="text-red-600">Paket Anda</span></p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Paket yang dapat disesuaikan dengan kebutuhan event Anda</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Bronze */}
                      <div className="group relative bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-amber-700 hover:-translate-y-1">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white px-3 py-0.5 rounded-full text-[9px] font-bold shadow-md">BRONZE</div>
                        </div>
                        <div className="text-center pt-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full mx-auto mb-3 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                            <span className="text-lg">🥉</span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 mb-1">Paket Bronze</h4>
                          <p className="text-xl font-black text-amber-700 mb-3">Rp 500.000</p>
                          <ul className="text-left space-y-1.5 mb-4">
                            {['Akses Sistem Penilaian', 'Technical Meeting Aplikasi', 'Laporan Digital', 'Tim Pendamping (Online)'].map(f => (
                              <li key={f} className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                <span className="text-[10px] text-gray-600">{f}</span>
                              </li>
                            ))}
                            {['Device Tablet', 'Tim Rekap', 'Penyusunan Materi Penilaian'].map(f => (
                              <li key={f} className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                <span className="text-[10px] text-gray-400">{f}</span>
                              </li>
                            ))}
                          </ul>
                          <a href="https://simpaskor.id" target="_blank" rel="noopener noreferrer"
                            className="block w-full bg-gradient-to-r from-amber-600 to-amber-800 text-white py-2 rounded-lg font-bold text-[11px] hover:from-amber-700 hover:to-amber-900 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-center">
                            Pesan Sekarang
                          </a>
                        </div>
                      </div>
                      {/* Silver */}
                      <div className="group relative bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-400 hover:-translate-y-1 sm:scale-[1.03] z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-3 py-0.5 rounded-full text-[9px] font-bold shadow-md">SILVER</div>
                        </div>
                        <div className="text-center pt-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                            <span className="text-lg">🥈</span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 mb-1">Paket Silver</h4>
                          <p className="text-xl font-black text-gray-700 mb-3">Rp 1.000.000</p>
                          <ul className="text-left space-y-1.5 mb-4">
                            {['Akses Sistem Penilaian', 'Technical Meeting Aplikasi', 'Laporan Digital', 'Tim Pendamping (Offline)', 'Device Tablet (max. 3 unit)'].map(f => (
                              <li key={f} className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                <span className="text-[10px] text-gray-600">{f}</span>
                              </li>
                            ))}
                            {['Tim Rekap', 'Penyusunan Materi Penilaian'].map(f => (
                              <li key={f} className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                <span className="text-[10px] text-gray-400">{f}</span>
                              </li>
                            ))}
                          </ul>
                          <a href="https://simpaskor.id" target="_blank" rel="noopener noreferrer"
                            className="block w-full bg-gradient-to-r from-gray-500 to-gray-700 text-white py-2 rounded-lg font-bold text-[11px] hover:from-gray-600 hover:to-gray-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-center">
                            Pesan Sekarang
                          </a>
                        </div>
                      </div>
                      {/* Gold */}
                      <div className="group relative bg-gradient-to-b from-yellow-50 to-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-yellow-200 hover:border-yellow-400 hover:-translate-y-1">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-0.5 rounded-full text-[9px] font-bold shadow-md">GOLD</div>
                        </div>
                        <div className="text-center pt-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-3 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                            <span className="text-lg">🥇</span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 mb-1">Paket Gold</h4>
                          <p className="text-xl font-black text-yellow-600 mb-3">Rp 1.500.000</p>
                          <ul className="text-left space-y-1.5 mb-4">
                            {['Akses Sistem Penilaian', 'Technical Meeting Aplikasi', 'Laporan Digital', 'Tim Pendamping', 'Device Tablet', 'Tim Rekap', 'Penyusunan Materi Penilaian'].map(f => (
                              <li key={f} className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                <span className="text-[10px] text-gray-600">{f}</span>
                              </li>
                            ))}
                          </ul>
                          <a href="https://simpaskor.id" target="_blank" rel="noopener noreferrer"
                            className="block w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-2 rounded-lg font-bold text-[11px] hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-center">
                            Pesan Sekarang
                          </a>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-[10px] text-gray-400">Hubungi kami untuk paket custom sesuai kebutuhan event Anda</p>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden animate-[formStepIn_0.5s_0.16s_cubic-bezier(0.16,1,0.3,1)_both]">
                <div className="p-5 sm:p-6">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Deskripsi Kejurcab</label>
                  <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={3}
                    className={inputCls} placeholder="Jelaskan detail kompetisi kejurcab..." />
                </div>
              </div>

              {/* Poster/Pamflet */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden animate-[formStepIn_0.5s_0.2s_cubic-bezier(0.16,1,0.3,1)_both]">
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                      <HiDocumentText className="text-rose-500 text-sm" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-gray-900 text-sm tracking-tight">Poster Event</h2>
                      <p className="text-[10px] text-gray-400 font-medium">Akan ditampilkan di halaman utama jika disetujui</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Upload Poster/Pamflet</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setPosterFile(file);
                          setPosterFileName(file.name);
                        }
                      }}
                      className={`${inputCls} file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-semibold file:text-xs`}
                    />
                    {posterFileName && (
                      <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                        <HiCheckCircle className="text-sm" /> {posterFileName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-1 animate-[formStepIn_0.5s_0.24s_cubic-bezier(0.16,1,0.3,1)_both]">
                <button type="button" onClick={resetForm}
                  className="px-4 py-3.5 bg-white hover:bg-gray-50 text-gray-500 rounded-xl font-semibold text-xs transition-all active:scale-[0.98] border border-gray-200 shadow-sm">
                  Batal
                </button>
                <button type="button" onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-green-200/30 hover:shadow-xl hover:shadow-green-300/40 active:scale-[0.98] flex items-center justify-center gap-2">
                  Lanjut ke Mata Lomba
                  <HiChevronRight className="text-base" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== Step 2: Mata Lomba ==================== */}
          {step === 2 && (
            <div className="space-y-4 animate-[formStepIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
              {/* Proposal */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-sky-400 via-blue-400 to-sky-300" />
                <div className="p-5 sm:p-6">
                  <ProposalKegiatanForm
                    existingFile={null}
                    fileName={proposalFileName}
                    onFileChange={(file) => { setProposalFile(file); setProposalFileName(file.name); }}
                    themeColor="green"
                  />
                </div>
              </div>

              {/* Mata Lomba */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-green-400 via-emerald-400 to-green-300" />
                <div className="p-5 sm:p-6 space-y-4">
                  <MataLombaForm data={mataLombaData} onChange={setMataLombaData} themeColor="green" />
                </div>
              </div>

              <div className="flex gap-2.5 animate-[formStepIn_0.5s_0.1s_cubic-bezier(0.16,1,0.3,1)_both]">
                <button type="button" onClick={handleBack}
                  className="flex items-center gap-1.5 px-5 py-3.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl font-semibold text-xs transition-all active:scale-[0.98] border border-gray-200 shadow-sm">
                  <HiArrowLeft className="text-xs" /> Kembali
                </button>
                <button type="button" onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-green-200/30 hover:shadow-xl hover:shadow-green-300/40 active:scale-[0.98] flex items-center justify-center gap-2">
                  Lanjut ke Persyaratan
                  <HiChevronRight className="text-base" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== Step 3: Persyaratan ==================== */}
          {step === 3 && (
            <div className="space-y-4 animate-[formStepIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-green-400 via-emerald-400 to-green-300" />
                <div className="p-5 sm:p-6 space-y-4">
                  <PersyaratanForm
                    data={persyaratanData} files={persyaratanFiles}
                    onChange={setPersyaratanData} onFileChange={handleFileChange}
                    themeColor="green"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 animate-[formStepIn_0.5s_0.1s_cubic-bezier(0.16,1,0.3,1)_both]">
                <button type="button" onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-3.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl font-semibold text-xs transition-all active:scale-[0.98] border border-gray-200 shadow-sm">
                  <HiArrowLeft className="text-xs" /> Kembali
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-green-200/30 hover:shadow-xl hover:shadow-green-300/40 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2">
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengirim...</>
                  ) : (
                    <>Ajukan Kejurcab <HiCheck className="text-base" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Modals */}
        <BillingVerifyModal open={showBillingModal} onClose={() => setShowBillingModal(false)} billingStatus={billingStatus} />
        <AlertModal open={alertModal.open} onClose={closeAlert} title={alertModal.title} message={alertModal.message} variant={alertModal.variant} />
      </div>
    );
  }

  // ======================== LIST MODE ========================
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`flex items-center justify-between transition-all duration-500 ${show || loading ? 'opacity-100' : 'opacity-0'}`}>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Pengajuan Kejurcab</h1>
          <p className="text-xs text-gray-400 mt-0.5">Ajukan & lacak perizinan Kejuaraan Cabang</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-green-200/40 hover:shadow-lg hover:shadow-green-300/40 transition-all active:scale-95">
          <HiPlus className="text-sm" /> Ajukan Kejurcab
        </button>
      </div>

      {/* Info box */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50/80 to-green-50/60 border border-green-100/60 p-4 shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-200/20 to-transparent rounded-bl-full" />
        <div className="relative flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-300/30">
            <HiCheckCircle className="text-white text-sm" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-green-800 mb-0.5">Mekanisme Pengajuan Kejurcab</p>
            <p className="text-[11px] text-green-600 leading-relaxed">
              Setiap Pengcab dapat mengajukan 1 Kejurcab per tahun. Pengajuan <strong>wajib menggunakan Simpaskor</strong> dan
              harus disetujui oleh Pengda sebelum kompetisi dapat dibuka untuk pendaftaran peserta.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-[3px] border-gray-200" />
            <div className="w-10 h-10 rounded-full border-[3px] border-green-500 border-t-transparent animate-spin absolute inset-0" />
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className={`bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiCalendar className="text-3xl text-gray-300" />
          </div>
          <p className="text-gray-600 font-bold text-sm">Belum ada pengajuan Kejurcab</p>
          <p className="text-gray-400 text-xs mt-1 mb-5">Mulai dengan mengajukan perizinan Kejurcab</p>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-green-200/40 transition-all active:scale-95">
            <HiPlus className="text-base" /> Ajukan Kejurcab
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => {
            const cfg = approvalConfig[item.statusApproval] || approvalConfig.PENDING;
            const Icon = cfg.icon;
            const isExpanded = expanded === item.id;

            return (
              <div key={item.id}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-200/80 animate-[fadeSlideUp_0.4s_ease-out_both]">
                
                {/* Status bar top */}
                <div className={`h-1 ${cfg.barColor}`} />
                
                {/* Header row */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                  className="w-full text-left p-4 sm:p-5 transition-colors hover:bg-gray-50/50"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0 ring-4 ring-white shadow-sm`}>
                      <Icon className={`text-xl ${cfg.text}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                        <h3 className="font-bold text-gray-900 text-base sm:text-[17px] truncate">{item.namaKejurda}</h3>
                        <span className={`self-start sm:self-auto text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                      
                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <HiCalendar className="text-gray-400" size={14} />
                          {formatDate(item.tanggalMulai, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {item.lokasi && (
                          <span className="flex items-center gap-1.5">
                            <HiLocationMarker className="text-gray-400" size={14} />
                            <span className="truncate max-w-[120px]">{item.lokasi}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <HiUsers className="text-gray-400" size={14} />
                          {item._count?.pendaftaran || 0} pendaftar
                        </span>
                      </div>
                    </div>
                    
                    {/* Chevron */}
                    <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-gray-100' : ''}`}>
                      <HiChevronDown className="text-gray-400 text-lg" />
                    </div>
                  </div>
                </button>

                {/* Expandable detail */}
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-4 sm:px-6 pb-6 pt-2 space-y-5 border-t border-gray-100">

                      {/* Two column layout on desktop */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
                        
                        {/* Left: Tracking Timeline */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-100">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Tracking Status
                          </h4>
                          <div className="space-y-4 relative">
                            {/* Connecting line */}
                            <div className="absolute left-4 top-6 bottom-2 w-0.5 bg-gradient-to-b from-green-200 via-gray-200 to-transparent" />

                            {/* Step 1 */}
                            <div className="flex items-start gap-4 relative">
                              <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-200">
                                <HiDocumentText className="text-white text-sm" />
                              </div>
                              <div className="pt-0.5">
                                <p className="text-sm font-bold text-gray-800">Pengajuan Dikirim</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {formatDate(item.createdAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start gap-4 relative">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                                item.statusApproval === 'DISETUJUI' ? 'bg-emerald-500 shadow-emerald-200' : 
                                item.statusApproval === 'DITOLAK' ? 'bg-rose-500 shadow-rose-200' : 
                                'bg-gray-200'
                              }`}>
                                <HiCheckCircle className={`text-sm ${item.statusApproval !== 'PENDING' ? 'text-white' : 'text-gray-400'}`} />
                              </div>
                              <div className="pt-0.5">
                                <p className={`text-sm font-bold ${item.statusApproval !== 'PENDING' ? 'text-gray-800' : 'text-gray-400'}`}>Persetujuan Pengda</p>
                                {item.statusApproval === 'DISETUJUI' ? (
                                  <p className="text-xs text-emerald-600 mt-0.5 font-semibold">✓ Disetujui</p>
                                ) : item.statusApproval === 'DITOLAK' ? (
                                  <p className="text-xs text-rose-600 mt-0.5 font-semibold">✗ Ditolak</p>
                                ) : (
                                  <p className="text-xs text-amber-600 mt-0.5 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    Menunggu persetujuan...
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Detail Info */}
                        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-gray-100">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Detail Kejurcab
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                              <HiLocationMarker className="text-gray-400 mb-1" size={16} />
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Lokasi</p>
                              <p className="font-semibold text-gray-800 text-sm mt-0.5">{item.lokasi || '-'}</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                              <HiCalendar className="text-gray-400 mb-1" size={16} />
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Tanggal</p>
                              <p className="font-semibold text-gray-800 text-sm mt-0.5">
                                {item.tanggalMulai ? `${formatDate(item.tanggalMulai, { day: 'numeric', month: 'short' })} - ${formatDate(item.tanggalSelesai, { day: 'numeric', month: 'short' })}` : '-'}
                              </p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                              <HiUsers className="text-gray-400 mb-1" size={16} />
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Pendaftar</p>
                              <p className="font-semibold text-gray-800 text-sm mt-0.5">{item._count?.pendaftaran || 0} peserta</p>
                            </div>
                            {item.noBilingSimpaskor && (
                              <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <HiShieldCheck className="text-gray-400 mb-1" size={16} />
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Billing</p>
                                <p className="font-semibold text-gray-800 text-sm mt-0.5 font-mono">{item.noBilingSimpaskor}</p>
                              </div>
                            )}
                          </div>
                          {item.deskripsi && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Deskripsi</p>
                              <p className="text-sm text-gray-600 leading-relaxed">{item.deskripsi}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Surat Rekomendasi - Full width card */}
                      {item.statusApproval === 'DISETUJUI' && item.suratRekomendasi && (
                        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-5 text-white">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <h4 className="text-sm font-bold flex items-center gap-2">
                                <HiDocumentText size={18} />
                                Surat Rekomendasi
                              </h4>
                              {item.nomorSurat && (
                                <p className="text-emerald-100 text-xs mt-1">No. Surat: <span className="font-bold text-white">{item.nomorSurat}</span></p>
                              )}
                            </div>
                            <a
                              href={getUploadUrl(item.suratRekomendasi)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-white text-emerald-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-all shadow-lg shadow-emerald-700/20"
                            >
                              <HiDownload size={16} />
                              Download PDF
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Action buttons - Full width */}
                      {item.statusApproval === 'DISETUJUI' && (
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <span className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 ${
                            item.statusBuka 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${item.statusBuka ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            Pendaftaran {item.statusBuka ? 'Dibuka' : 'Ditutup'}
                          </span>
                          <button
                            onClick={() => handleToggleRegistration(item)}
                            disabled={togglingRegistration === item.id}
                            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                              item.statusBuka 
                                ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
                                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                            } disabled:opacity-50`}
                          >
                            {togglingRegistration === item.id ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : item.statusBuka ? (
                              <HiXCircle size={14} />
                            ) : (
                              <HiCheckCircle size={14} />
                            )}
                            {item.statusBuka ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'}
                          </button>
                          <button
                            onClick={() => openPendaftaranModal(item)}
                            className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all flex items-center gap-2"
                          >
                            <HiUsers size={14} />
                            Kelola Pendaftaran ({item._count?.pendaftaran || 0})
                          </button>
                        </div>
                      )}

                      {/* Catatan ditolak */}
                      {item.statusApproval === 'DITOLAK' && item.catatanAdmin && (
                        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                            <HiExclamationCircle className="text-rose-500" size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-rose-700 mb-1">Catatan Pengda</p>
                            <p className="text-sm text-rose-600">{item.catatanAdmin}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pendaftaran Management Modal */}
      {pendaftaranModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-[scaleIn_0.3s_ease-out]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-green-600 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <HiUsers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Kelola Pendaftaran</h3>
                  <p className="text-emerald-100 text-sm mt-0.5">{pendaftaranModal.kejurcabNama}</p>
                </div>
              </div>
              <button onClick={closePendaftaranModal} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Stats bar */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-gray-600">Menunggu: <strong className="text-gray-800">{pendaftaranList.filter(p => p.status === 'PENDING').length}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-600">Disetujui: <strong className="text-gray-800">{pendaftaranList.filter(p => p.status === 'DITERIMA').length}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-gray-600">Ditolak: <strong className="text-gray-800">{pendaftaranList.filter(p => p.status === 'DITOLAK').length}</strong></span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {pendaftaranLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-500 text-sm">Memuat data pendaftaran...</p>
                </div>
              ) : pendaftaranList.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <HiUsers className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Belum ada pendaftaran</p>
                  <p className="text-gray-400 text-sm mt-1">Pendaftar akan muncul di sini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendaftaranList.map((p, idx) => (
                    <div 
                      key={p.id} 
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all animate-[fadeSlideUp_0.4s_ease-out_both]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-sm">
                          {p.namaLengkap?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="font-bold text-gray-800 truncate">{p.namaLengkap}</p>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                              p.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-700' :
                              p.status === 'DITOLAK' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                p.status === 'DITERIMA' ? 'bg-emerald-500' :
                                p.status === 'DITOLAK' ? 'bg-rose-500' :
                                'bg-amber-500 animate-pulse'
                              }`} />
                              {p.status === 'DITERIMA' ? 'Disetujui' : p.status === 'DITOLAK' ? 'Ditolak' : 'Menunggu'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <HiMail className="text-gray-400" size={14} />
                              {p.email || '-'}
                            </p>
                            <p className="flex items-center gap-2">
                              <HiPhone className="text-gray-400" size={14} />
                              {p.nomorHp || '-'}
                            </p>
                            {p.kategoriLomba && (
                              <p className="flex items-center gap-2">
                                <HiTag className="text-gray-400" size={14} />
                                {p.kategoriLomba}
                              </p>
                            )}
                            {p.kelas && (
                              <p className="flex items-center gap-2">
                                <HiCollection className="text-gray-400" size={14} />
                                {p.kelas}
                              </p>
                            )}
                          </div>
                          
                          {p.catatanAdmin && (
                            <div className="mt-3 bg-rose-50 rounded-xl px-3 py-2 border border-rose-100">
                              <p className="text-xs text-rose-600">
                                <span className="font-bold">Catatan:</span> {p.catatanAdmin}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        {p.status === 'PENDING' && (
                          <div className="flex gap-2 flex-shrink-0 sm:flex-col">
                            <button
                              onClick={() => handleApprovePendaftaran(p.id)}
                              disabled={processingPendaftaran === p.id}
                              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                              <HiCheck size={14} />
                              Setujui
                            </button>
                            <button
                              onClick={() => setRejectModal({ open: true, pendaftaranId: p.id, catatan: '' })}
                              disabled={processingPendaftaran === p.id}
                              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                              <HiX size={14} />
                              Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-between items-center">
              <p className="text-xs text-gray-400">Total: {pendaftaranList.length} pendaftar</p>
              <button onClick={closePendaftaranModal} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.3s_ease-out]">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-rose-500 to-red-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <HiExclamationCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Tolak Pendaftaran</h3>
                  <p className="text-rose-100 text-xs">Berikan alasan penolakan</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Catatan (opsional)</label>
              <textarea
                value={rejectModal.catatan}
                onChange={(e) => setRejectModal(prev => ({ ...prev, catatan: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all resize-none"
                placeholder="Tuliskan alasan penolakan di sini..."
              />
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setRejectModal({ open: false, pendaftaranId: null, catatan: '' })}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleRejectPendaftaran}
                disabled={processingPendaftaran}
                className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:from-rose-600 hover:to-red-700 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {processingPendaftaran ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <HiX size={16} />
                    Tolak Pendaftaran
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

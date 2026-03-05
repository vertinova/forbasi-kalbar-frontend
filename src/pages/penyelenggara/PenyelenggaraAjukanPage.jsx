import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft, HiDocumentAdd, HiLocationMarker, HiSave, HiDownload, HiCheck, HiShieldCheck, HiExclamationCircle, HiCreditCard, HiCalendar, HiUserGroup, HiClipboardList, HiChevronRight, HiPencilAlt } from 'react-icons/hi';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import PersyaratanForm from '../../components/PersyaratanForm';
import MataLombaForm from '../../components/MataLombaForm';
import ProposalKegiatanForm from '../../components/ProposalKegiatanForm';
import FormatDokumenModal from '../../components/FormatDokumenModal';
import Select from '../../components/Select';
import BillingVerifyModal from '../../components/BillingVerifyModal';
import AlertModal from '../../components/AlertModal';
import orangBingungImg from '../../assets/orang-bingung.webp';

const steps = [
  { num: 1, label: 'Detail Event', short: 'Detail' },
  { num: 2, label: 'Mata Lomba', short: 'Lomba' },
  { num: 3, label: 'Persyaratan', short: 'Syarat' },
];

export default function PenyelenggaraAjukanPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [pengcabList, setPengcabList] = useState([]);
  const [userPengcab, setUserPengcab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    namaEvent: '', jenisEvent: '', tanggalMulai: '', tanggalSelesai: '',
    lokasi: '', deskripsi: '', penyelenggara: '', kontakPerson: '', noBilingSimpaskor: '', pengcabId: ''
  });
  const [persyaratanData, setPersyaratanData] = useState({});
  const [persyaratanFiles, setPersyaratanFiles] = useState({});
  const [mataLombaData, setMataLombaData] = useState({});
  const [proposalFile, setProposalFile] = useState(null);
  const [proposalFileName, setProposalFileName] = useState(null);
  const [existingProposal, setExistingProposal] = useState(null);
  const [existingStatus, setExistingStatus] = useState(null);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [billingStatus, setBillingStatus] = useState(null); // null | 'loading' | { valid, data }
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', variant: 'error' });

  const showAlert = (title, message, variant = 'warning') => setAlertModal({ open: true, title, message, variant });
  const closeAlert = () => setAlertModal(prev => ({ ...prev, open: false }));

  useEffect(() => {
    api.get('/auth/profile').then(res => {
      if (res.data.pengcabId) {
        setUserPengcab(res.data.pengcab);
        if (!isEdit) setForm(prev => ({ ...prev, pengcabId: String(res.data.pengcabId) }));
      }
    }).catch(() => {});
    api.get('/pengcab').then(res => setPengcabList(res.data.filter(p => p.status === 'AKTIF'))).catch(() => {});

    if (isEdit) {
      setLoadingData(true);
      api.get(`/rekomendasi/${id}`).then(res => {
        const d = res.data;
        setForm({
          namaEvent: d.namaEvent || '', jenisEvent: d.jenisEvent || '',
          tanggalMulai: d.tanggalMulai ? d.tanggalMulai.slice(0, 10) : '',
          tanggalSelesai: d.tanggalSelesai ? d.tanggalSelesai.slice(0, 10) : '',
          lokasi: d.lokasi || '', deskripsi: d.deskripsi || '',
          penyelenggara: d.penyelenggara || '', kontakPerson: d.kontakPerson || '',
          noBilingSimpaskor: d.noBilingSimpaskor || '', pengcabId: d.pengcabId ? String(d.pengcabId) : ''
        });
        if (d.persyaratan) setPersyaratanData(typeof d.persyaratan === 'string' ? JSON.parse(d.persyaratan) : d.persyaratan);
        if (d.mataLomba) setMataLombaData(typeof d.mataLomba === 'string' ? JSON.parse(d.mataLomba) : d.mataLomba);
        if (d.proposal) setExistingProposal(d.proposal);
        if (d.pengcab) setUserPengcab(d.pengcab);
        setExistingStatus(d.status);
      }).catch(() => { toast.error('Gagal memuat data'); navigate('/penyelenggara/riwayat'); })
        .finally(() => setLoadingData(false));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Reset billing verification when billing code changes
    if (e.target.name === 'noBilingSimpaskor') setBillingStatus(null);
  };
  const handleFileChange = (key, file) => setPersyaratanFiles(prev => ({ ...prev, [key]: file }));

  const validateStep1 = () => {
    if (!form.namaEvent) { showAlert('Data Belum Lengkap', 'Nama event wajib diisi sebelum melanjutkan ke tahap berikutnya.', 'warning'); return false; }
    // Billing Simpaskor opsional — jika diisi, harus diverifikasi
    if (form.noBilingSimpaskor?.trim()) {
      if (!billingStatus || billingStatus === 'loading') { showAlert('Verifikasi Billing', 'Silakan klik tombol Verifikasi untuk memvalidasi kode billing Simpaskor Anda sebelum melanjutkan.', 'warning'); return false; }
      if (!billingStatus.valid) {
        const paymentInfo = billingStatus.data?.payment?.status;
        if (billingStatus.data && paymentInfo && paymentInfo.toLowerCase() !== 'lunas') {
          showAlert('Pembayaran Belum Lunas', `Status pembayaran billing Anda: "${paymentInfo}". Silakan lunasi pembayaran billing Simpaskor terlebih dahulu sebelum melanjutkan ke tahap Mata Lomba.`, 'error');
        } else {
          showAlert('Verifikasi Billing Gagal', billingStatus.message || 'Kode billing tidak valid. Silakan periksa kembali dan verifikasi ulang.', 'warning');
        }
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async (e, submitAction = 'submit') => {
    e.preventDefault();
    if (submitAction === 'submit') {
      if (!form.namaEvent) { showAlert('Data Belum Lengkap', 'Nama event wajib diisi sebelum mengirim permohonan.', 'warning'); return; }
      // Billing Simpaskor opsional — jika diisi, harus terverifikasi
      if (form.noBilingSimpaskor?.trim()) {
        if (!billingStatus || !billingStatus.valid) {
          const paymentInfo = billingStatus?.data?.payment?.status;
          if (billingStatus?.data && paymentInfo && paymentInfo.toLowerCase() !== 'lunas') {
            showAlert('Pembayaran Belum Lunas', `Status pembayaran billing: "${paymentInfo}". Lunasi terlebih dahulu sebelum mengajukan.`, 'error');
          } else {
            showAlert('Verifikasi Billing', 'Verifikasi kode billing Simpaskor Anda terlebih dahulu.', 'warning');
          }
          return;
        }
      }
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      formData.append('submitAction', submitAction);

      const persyaratanMeta = {};
      Object.entries(persyaratanData).forEach(([key, val]) => {
        persyaratanMeta[key] = { ada: val.ada || false };
        if (val.text) persyaratanMeta[key].text = val.text;
        if (val.fileName) persyaratanMeta[key].fileName = val.fileName;
        if (val.juriList) persyaratanMeta[key].juriList = val.juriList;
      });
      formData.append('persyaratan', JSON.stringify(persyaratanMeta));
      formData.append('mataLomba', JSON.stringify(mataLombaData));

      Object.entries(persyaratanFiles).forEach(([key, file]) => { if (file) formData.append(key, file); });
      if (proposalFile) formData.append('proposalKegiatan', proposalFile);

      if (isEdit) {
        await api.put(`/rekomendasi/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/rekomendasi', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(submitAction === 'draft' ? 'Draft berhasil disimpan!' : (isEdit ? 'Permohonan berhasil diajukan ulang!' : 'Permohonan berhasil diajukan!'));
      navigate('/penyelenggara/riwayat');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan data');
    } finally { setLoading(false); }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-[3px] border-gray-200" />
          <div className="w-10 h-10 rounded-full border-[3px] border-amber-500 border-t-transparent animate-spin absolute inset-0" />
        </div>
      </div>
    );
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none text-sm text-gray-700 transition-all duration-200 placeholder:text-gray-400';

  const handleVerifyBilling = async () => {
    const code = form.noBilingSimpaskor?.trim();
    if (!code) { showAlert('Kode Billing Kosong', 'Masukkan kode billing Simpaskor terlebih dahulu pada kolom di atas.', 'warning'); return; }
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
        const msg = 'Kode billing tidak ditemukan. Pastikan nomor billing yang Anda masukkan sudah benar dan terdaftar di Simpaskor.';
        setBillingStatus({ valid: false, message: msg });
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

  return (
    <div className="max-w-2xl mx-auto pb-6">
      {/* Header — glassmorphism */}
      <div className="relative flex items-center justify-between mb-6 bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg shadow-amber-100/20 animate-[slideDown_0.5s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-50/40 via-transparent to-orange-50/40 pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <button onClick={() => step > 1 ? handleBack() : navigate('/penyelenggara')}
            className="w-10 h-10 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 hover:shadow-md active:scale-95 transition-all duration-200">
            <HiArrowLeft className="text-gray-500 text-base" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              {isEdit ? 'Edit Perizinan' : 'Ajukan Event'}
            </h1>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Langkah {step} dari 3 — {steps[step - 1].label}</p>
          </div>
        </div>
        <button type="button" onClick={() => setShowFormatModal(true)}
          className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 hover:from-amber-100 hover:to-orange-100 active:scale-95 transition-all text-xs font-bold ring-1 ring-amber-200/60 shadow-sm">
          <HiDownload className="text-sm" />
          <span className="hidden sm:inline">Format Surat</span>
        </button>
      </div>

      {/* Step indicator — modern pill style */}
      <div className="flex items-center gap-1.5 mb-6 bg-gray-50/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-100 animate-[slideDown_0.5s_0.1s_cubic-bezier(0.16,1,0.3,1)_both]">
        {steps.map((s, i) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          const StepIcon = s.num === 1 ? HiPencilAlt : s.num === 2 ? HiClipboardList : HiCheck;
          return (
            <div key={s.num} className="flex items-center flex-1 gap-1.5">
              <button
                type="button"
                onClick={() => { if (isDone) setStep(s.num); }}
                className={`flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-amber-700 shadow-md shadow-amber-200/30 ring-1 ring-amber-100'
                    : isDone
                      ? 'bg-white/60 text-emerald-600 hover:bg-white/80 cursor-pointer'
                      : 'text-gray-400'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-300/40'
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

      {/* Pengcab badge */}
      {userPengcab && (
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-3.5 mb-5 border border-gray-100/80 shadow-sm animate-[slideDown_0.5s_0.15s_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-200/30">
            <HiLocationMarker className="text-amber-500 text-base" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Pengcab Terdaftar</p>
            <p className="text-sm font-bold text-gray-800 truncate">{userPengcab.nama} — {userPengcab.kota}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Detail Event */}
        {step === 1 && (
          <div className="space-y-4 animate-[formStepIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
            {/* Info alur — modern timeline card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-50/60 border border-amber-100/60 p-4 shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-bl-full" />
              <div className="relative flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-300/30">
                  <HiDocumentAdd className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-amber-800 mb-1">Alur Persetujuan</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium">
                    <span className="px-2 py-0.5 bg-white/60 rounded-md">Pengajuan</span>
                    <HiChevronRight className="text-amber-300 text-[10px]" />
                    <span className="px-2 py-0.5 bg-white/60 rounded-md font-bold">Pengcab</span>
                    <HiChevronRight className="text-amber-300 text-[10px]" />
                    <span className="px-2 py-0.5 bg-white/60 rounded-md font-bold">Pengda</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main form card — Section 1: Informasi Event */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300" />
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <HiDocumentAdd className="text-amber-500 text-sm" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-gray-900 text-sm tracking-tight">Informasi Event</h2>
                    <p className="text-[10px] text-gray-400 font-medium">Detail lengkap event yang akan diselenggarakan</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Nama Event <span className="text-rose-400">*</span></label>
                  <input type="text" name="namaEvent" value={form.namaEvent} onChange={handleChange}
                    className={inputCls} placeholder="Contoh: Lomba Paskibraka Tingkat Kota" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Jenis Event</label>
                  <Select accent="amber" name="jenisEvent" value={form.jenisEvent} onChange={handleChange}>
                    <option value="">Pilih Jenis Event</option>
                    <option value="Kejurcab">Kejurcab (Kejuaraan Cabang)</option>
                    <option value="Event Umum">Event Umum</option>
                    <option value="Lomba">Lomba</option>
                    <option value="Festival">Festival</option>
                    <option value="Pelatihan">Pelatihan</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Lainnya">Lainnya</option>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      <HiCalendar className="inline mr-1 text-amber-400 text-xs -mt-0.5" />Mulai
                    </label>
                    <input type="date" name="tanggalMulai" value={form.tanggalMulai} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      <HiCalendar className="inline mr-1 text-amber-400 text-xs -mt-0.5" />Selesai
                    </label>
                    <input type="date" name="tanggalSelesai" value={form.tanggalSelesai} onChange={handleChange} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                    <HiLocationMarker className="inline mr-1 text-amber-400 text-xs -mt-0.5" />Lokasi
                  </label>
                  <input type="text" name="lokasi" value={form.lokasi} onChange={handleChange} className={inputCls} placeholder="Alamat lengkap venue" />
                </div>
              </div>
            </div>

            {/* Section 2: Penyelenggara & Kontak */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden animate-[formStepIn_0.5s_0.08s_cubic-bezier(0.16,1,0.3,1)_both]">
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center">
                    <HiUserGroup className="text-blue-500 text-sm" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-gray-900 text-sm tracking-tight">Penyelenggara & Kontak</h2>
                    <p className="text-[10px] text-gray-400 font-medium">Informasi organisasi penyelenggara event</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Penyelenggara</label>
                  <input type="text" name="penyelenggara" value={form.penyelenggara} onChange={handleChange} className={inputCls} placeholder="Nama organisasi penyelenggara" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kontak Person</label>
                  <input type="text" name="kontakPerson" value={form.kontakPerson} onChange={handleChange} className={inputCls} placeholder="Nama & no HP PIC" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                    <HiLocationMarker className="inline mr-1 text-amber-400 text-xs -mt-0.5" />Pengcab Terkait
                  </label>
                  <Select accent="amber" name="pengcabId" value={form.pengcabId} onChange={handleChange}>
                    <option value="">Pilih Pengcab</option>
                    {pengcabList.map(p => <option key={p.id} value={p.id}>{p.nama} - {p.kota}</option>)}
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 3: Billing Simpaskor */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden animate-[formStepIn_0.5s_0.16s_cubic-bezier(0.16,1,0.3,1)_both]">
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                    <HiCreditCard className="text-violet-500 text-sm" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-gray-900 text-sm tracking-tight">Billing Simpaskor</h2>
                    <p className="text-[10px] text-gray-400 font-medium">Opsional — verifikasi kode billing jika Anda memilikinya</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">No. Billing <span className="text-gray-300 text-[9px] font-medium normal-case">(opsional)</span></label>
                  <div className="flex gap-2">
                    <input type="text" name="noBilingSimpaskor" value={form.noBilingSimpaskor} onChange={handleChange}
                      className={`${inputCls} flex-1 ${billingStatus?.valid ? '!border-emerald-200 !bg-emerald-50/30 !ring-emerald-100' : ''}`} placeholder="Masukkan nomor billing" />
                    <button type="button" onClick={handleVerifyBilling} disabled={billingStatus === 'loading' || !form.noBilingSimpaskor?.trim()}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.97] flex-shrink-0 disabled:opacity-50 ${
                        billingStatus?.valid
                          ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 shadow-sm'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200/30'
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

                  {/* Compact verified badge */}
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

                  {/* Compact error badge */}
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

                  {/* Simpaskor pricing cards */}
                  <div className="mt-5 space-y-4">
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
            </div>

            {/* Section 4: Deskripsi */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden animate-[formStepIn_0.5s_0.24s_cubic-bezier(0.16,1,0.3,1)_both]">
              <div className="p-5 sm:p-6">
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Deskripsi Event</label>
                <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={3}
                  className={inputCls} placeholder="Jelaskan detail event yang akan diselenggarakan..." />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 pt-1 animate-[formStepIn_0.5s_0.32s_cubic-bezier(0.16,1,0.3,1)_both]">
              <button type="button" disabled={loading} onClick={(e) => handleSubmit(e, 'draft')}
                className="flex items-center gap-1.5 px-4 py-3 bg-white hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50 border border-gray-200 shadow-sm">
                <HiSave className="text-sm" /> {loading ? '...' : 'Draft'}
                </button>
                <button type="button" onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-amber-200/30 hover:shadow-xl hover:shadow-amber-300/40 active:scale-[0.98] flex items-center justify-center gap-2">
                  Lanjut ke Mata Lomba
                  <HiChevronRight className="text-base" />
                </button>
                <button type="button" onClick={() => navigate('/penyelenggara')}
                  className="px-4 py-3.5 bg-white hover:bg-gray-50 text-gray-500 rounded-xl font-semibold text-xs transition-all active:scale-[0.98] border border-gray-200 shadow-sm">
                  Batal
                </button>
              </div>
          </div>
        )}

        {/* Step 2: Mata Lomba */}
        {step === 2 && (
          <div className="space-y-4 animate-[formStepIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
            {/* Upload Proposal Kegiatan */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-sky-400 via-blue-400 to-sky-300" />
              <div className="p-5 sm:p-6">
                <ProposalKegiatanForm
                  existingFile={existingProposal}
                  fileName={proposalFileName}
                  onFileChange={(file) => { setProposalFile(file); setProposalFileName(file.name); }}
                  themeColor="amber"
                />
              </div>
            </div>

            {/* Mata Lomba */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300" />
              <div className="p-5 sm:p-6 space-y-4">
                <MataLombaForm data={mataLombaData} onChange={setMataLombaData} themeColor="amber" />
              </div>
            </div>

            <div className="flex gap-2.5 animate-[formStepIn_0.5s_0.1s_cubic-bezier(0.16,1,0.3,1)_both]">
              <button type="button" onClick={handleBack}
                className="flex items-center gap-1.5 px-5 py-3.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl font-semibold text-xs transition-all active:scale-[0.98] border border-gray-200 shadow-sm">
                <HiArrowLeft className="text-xs" /> Kembali
              </button>
              <button type="button" onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-amber-200/30 hover:shadow-xl hover:shadow-amber-300/40 active:scale-[0.98] flex items-center justify-center gap-2">
                Lanjut ke Persyaratan
                <HiChevronRight className="text-base" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Persyaratan */}
        {step === 3 && (
          <div className="space-y-4 animate-[formStepIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/20 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300" />
              <div className="p-5 sm:p-6 space-y-4">
                <PersyaratanForm
                  data={persyaratanData} files={persyaratanFiles}
                  onChange={setPersyaratanData} onFileChange={handleFileChange}
                  themeColor="amber"
                />
              </div>
            </div>

            <div className="flex gap-2.5 animate-[formStepIn_0.5s_0.1s_cubic-bezier(0.16,1,0.3,1)_both]">
              <button type="button" onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-3.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl font-semibold text-xs transition-all active:scale-[0.98] border border-gray-200 shadow-sm">
                <HiArrowLeft className="text-xs" /> Kembali
              </button>
              <button type="button" disabled={loading} onClick={(e) => handleSubmit(e, 'draft')}
                className="flex items-center gap-1.5 px-4 py-3.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50 border border-gray-200 shadow-sm">
                <HiSave className="text-sm" /> {loading ? '...' : 'Draft'}
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-amber-200/30 hover:shadow-xl hover:shadow-amber-300/40 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengirim...</>
                ) : (
                  <>{isEdit ? 'Ajukan Ulang' : 'Ajukan Permohonan'} <HiCheck className="text-base" /></>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      <BillingVerifyModal
        open={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        billingStatus={billingStatus}
      />

      <AlertModal
        open={alertModal.open}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiDocumentAdd, HiLocationMarker } from 'react-icons/hi';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import PersyaratanForm from '../../components/PersyaratanForm';
import MataLombaForm from '../../components/MataLombaForm';
import ProposalKegiatanForm from '../../components/ProposalKegiatanForm';
import Select from '../../components/Select';

export default function UserAjukanPage() {
  const navigate = useNavigate();
  const [pengcabList, setPengcabList] = useState([]);
  const [userPengcab, setUserPengcab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = detail event, 2 = mata lomba, 3 = persyaratan
  const [form, setForm] = useState({
    namaEvent: '', jenisEvent: '', tanggalMulai: '', tanggalSelesai: '',
    lokasi: '', deskripsi: '', penyelenggara: '', kontakPerson: '', pengcabId: ''
  });
  const [mataLombaData, setMataLombaData] = useState({});
  const [proposalFile, setProposalFile] = useState(null);
  const [proposalFileName, setProposalFileName] = useState(null);
  const [persyaratanData, setPersyaratanData] = useState({});
  const [persyaratanFiles, setPersyaratanFiles] = useState({});

  useEffect(() => {
    api.get('/auth/profile').then(res => {
      if (res.data.pengcabId) {
        setUserPengcab(res.data.pengcab);
        setForm(prev => ({ ...prev, pengcabId: String(res.data.pengcabId) }));
      }
    }).catch(() => {});
    api.get('/pengcab').then(res => setPengcabList(res.data.filter(p => p.status === 'AKTIF'))).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (key, file) => {
    setPersyaratanFiles(prev => ({ ...prev, [key]: file }));
  };

  const validateStep1 = () => {
    if (!form.namaEvent || !form.jenisEvent || !form.tanggalMulai || !form.tanggalSelesai || !form.lokasi || !form.penyelenggara) {
      toast.error('Lengkapi semua field yang wajib (*)');
      return false;
    }
    if (!form.pengcabId) {
      toast.error('Pilih pengcab terkait');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const selected = Object.entries(mataLombaData).filter(([, v]) => v?.selected);
    if (selected.length === 0) {
      toast.error('Pilih minimal 1 mata lomba');
      return false;
    }
    // Check each selected has at least 1 jadwal with date
    for (const [key, val] of selected) {
      if (!val.jadwal || val.jadwal.length === 0 || !val.jadwal.some(j => j.tanggal)) {
        toast.error(`Isi minimal 1 jadwal untuk ${key.toUpperCase()}`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v && k !== 'dokumenSurat') formData.append(k, v); });
      if (form.dokumenSurat) formData.append('dokumenSurat', form.dokumenSurat);

      // Append persyaratan JSON (metadata only, no file blobs)
      const persyaratanMeta = {};
      Object.entries(persyaratanData).forEach(([key, val]) => {
        persyaratanMeta[key] = { ada: val.ada || false };
        if (val.text) persyaratanMeta[key].text = val.text;
        if (val.fileName) persyaratanMeta[key].fileName = val.fileName;
        if (val.juriList) persyaratanMeta[key].juriList = val.juriList;
      });
      formData.append('persyaratan', JSON.stringify(persyaratanMeta));

      // Append mata lomba data
      formData.append('mataLomba', JSON.stringify(mataLombaData));

      // Append persyaratan files
      Object.entries(persyaratanFiles).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      // Append proposal kegiatan file
      if (proposalFile) formData.append('proposalKegiatan', proposalFile);

      await api.post('/rekomendasi', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Permohonan berhasil diajukan!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengajukan permohonan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={handleBack} className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all">
          <HiArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Ajukan Perizinan Event</h1>
          <p className="text-xs text-gray-500">
            {step === 1 ? 'Step 1: Detail Event' : step === 2 ? 'Step 2: Mata Lomba & Jadwal' : 'Step 3: Persyaratan Event'}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex-1 h-2 rounded-full transition-all ${step >= 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-2 rounded-full transition-all ${step >= 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-2 rounded-full transition-all ${step >= 3 ? 'bg-green-500' : 'bg-gray-200'}`} />
      </div>

      {/* Info Alur */}
      <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
        <p className="text-sm text-green-800 font-medium">Alur Persetujuan:</p>
        <p className="text-xs text-green-600 mt-1">
          Pengajuan Anda akan diteruskan ke <strong>Pengcab</strong> untuk diverifikasi, kemudian ke <strong>Pengda Kalbar</strong> untuk persetujuan akhir.
        </p>
      </div>

      {/* User's Pengcab Info */}
      {userPengcab && (
        <div className="bg-white rounded-xl p-4 mb-6 shadow-md border border-gray-100 flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <HiLocationMarker className="text-green-700" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Pengcab Anda</p>
            <p className="text-sm font-bold text-gray-800">{userPengcab.nama} - {userPengcab.kota}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Detail Event */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100 space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <HiDocumentAdd className="text-green-700 text-xl" />
              <h2 className="font-bold text-gray-800">Detail Event</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Event *</label>
              <input type="text" name="namaEvent" value={form.namaEvent} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm text-gray-700"
                placeholder="Contoh: Lomba Paskibraka Tingkat Kota" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Event *</label>
              <Select name="jenisEvent" value={form.jenisEvent} onChange={handleChange}>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Mulai *</label>
                <input type="date" name="tanggalMulai" value={form.tanggalMulai} onChange={handleChange}
                  className="w-full px-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Selesai *</label>
                <input type="date" name="tanggalSelesai" value={form.tanggalSelesai} onChange={handleChange}
                  className="w-full px-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm text-gray-700" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lokasi *</label>
              <input type="text" name="lokasi" value={form.lokasi} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm text-gray-700"
                placeholder="Alamat lengkap venue" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Penyelenggara *</label>
              <input type="text" name="penyelenggara" value={form.penyelenggara} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm text-gray-700"
                placeholder="Nama organisasi penyelenggara" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kontak Person</label>
              <input type="text" name="kontakPerson" value={form.kontakPerson} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm text-gray-700"
                placeholder="Nama & no HP PIC" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <HiLocationMarker className="inline mr-1 text-green-600" />
                Pengcab Terkait *
              </label>
              <Select name="pengcabId" value={form.pengcabId} onChange={handleChange}>
                <option value="">Pilih Pengcab</option>
                {pengcabList.map(p => <option key={p.id} value={p.id}>{p.nama} - {p.kota}</option>)}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm text-gray-700"
                placeholder="Jelaskan detail event yang akan diselenggarakan..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dokumen Surat (PDF/Gambar)</label>
              <input type="file" onChange={e => setForm({ ...form, dokumenSurat: e.target.files[0] })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium file:text-sm" />
            </div>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-300/30 active:scale-[0.98]">
                Lanjut ke Mata Lomba →
              </button>
              <button type="button" onClick={() => navigate('/dashboard')}
                className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-all active:scale-[0.98]">
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Mata Lomba */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Upload Proposal Kegiatan */}
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100">
              <ProposalKegiatanForm
                existingFile={null}
                fileName={proposalFileName}
                onFileChange={(file) => { setProposalFile(file); setProposalFileName(file.name); }}
                themeColor="green"
              />
            </div>

            {/* Mata Lomba */}
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100 space-y-4">
              <MataLombaForm
                data={mataLombaData}
                onChange={setMataLombaData}
                themeColor="green"
              />

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={handleBack}
                  className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-all active:scale-[0.98]">
                  ← Kembali
                </button>
                <button type="button" onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-300/30 active:scale-[0.98]">
                  Lanjut ke Persyaratan →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Persyaratan */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100 space-y-4">
            <PersyaratanForm
              data={persyaratanData}
              files={persyaratanFiles}
              onChange={setPersyaratanData}
              onFileChange={handleFileChange}
              themeColor="green"
            />

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={handleBack}
                className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-all active:scale-[0.98]">
                ← Kembali
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-300/30 disabled:opacity-50 active:scale-[0.98]">
                {loading ? 'Mengirim...' : 'Ajukan Permohonan'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

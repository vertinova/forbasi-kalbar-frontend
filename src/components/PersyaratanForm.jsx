import { useState } from 'react';
import { HiDocumentText, HiPhotograph, HiCheckCircle, HiClipboardCheck, HiUsers, HiCurrencyDollar, HiChevronDown, HiChevronUp, HiUpload, HiCheck, HiDownload, HiPlus, HiTrash, HiUserCircle } from 'react-icons/hi';
import FormatDokumenModal from './FormatDokumenModal';

// Definisi semua persyaratan berdasarkan regulasi FORBASI
const PERSYARATAN_CONFIG = {
  administratif: {
    title: 'Persyaratan Administratif',
    icon: HiDocumentText,
    color: 'blue',
    items: [
      { key: 'suratIzinSekolah', label: 'Surat pernyataan izin penyelenggaraan dari Sekolah/Instansi tempat lomba', type: 'file', accept: '.pdf,.jpg,.jpeg,.png', hint: 'Dokumen pdf/jpg/png' },
      { key: 'suratIzinKepolisian', label: 'Surat izin keramaian dari Kepolisian setempat/Surat Pengajuan Panitia ke Polsek', type: 'file', accept: '.pdf,.jpg,.jpeg,.png', hint: 'Dokumen pdf/jpg/png' },
      { key: 'suratRekomendasiDinas', label: 'Surat rekomendasi dari Dinas Pendidikan/KCD/Surat Pengajuan Panitia Ke Disdik', type: 'file', accept: '.pdf,.jpg,.jpeg,.png', hint: 'Dokumen pdf/jpg/png' },
      { key: 'suratIzinVenue', label: 'Surat pernyataan izin penggunaan lokasi/venue (khusus venue diluar sekolah)', type: 'file', accept: '.pdf,.jpg,.jpeg,.png', hint: 'Dokumen pdf/jpg/png' },
      { key: 'suratRekomendasiPPI', label: 'Surat rekomendasi PPI setempat', type: 'file', accept: '.pdf,.jpg,.jpeg,.png', hint: 'Dokumen pdf/jpg/png' },
    ]
  },
  prasarana: {
    title: 'Persyaratan Prasarana & Sarana',
    icon: HiPhotograph,
    color: 'green',
    items: [
      { key: 'fotoLapangan', label: 'Ukuran Lapangan Minimal 12x18M', type: 'file', accept: '.jpg,.jpeg,.png', hint: 'Upload Foto' },
      { key: 'fotoTempatIbadah', label: 'Tersedia tempat Ibadah', type: 'file', accept: '.jpg,.jpeg,.png', hint: 'Upload Foto' },
      { key: 'fotoBarak', label: 'Tersedia barak peserta yang memadai untuk istirahat dll', type: 'file', accept: '.jpg,.jpeg,.png', hint: 'Upload Foto' },
      { key: 'fotoAreaParkir', label: 'Tersedia area parkir yang cukup', type: 'file', accept: '.jpg,.jpeg,.png', hint: 'Upload Foto' },
      { key: 'fotoRuangKesehatan', label: 'Tersedia ruang kesehatan & tenaga kesehatan', type: 'file', accept: '.jpg,.jpeg,.png', hint: 'Upload Foto' },
      { key: 'fotoMCK', label: 'Tersedia MCK yang memadai (WC & Air cukup)', type: 'file', accept: '.jpg,.jpeg,.png', hint: 'Upload Foto' },
      { key: 'fotoTempatSampah', label: 'Tersedia tempat sampah dimasing-masing barak dan lapangan', type: 'file', accept: '.jpg,.jpeg,.png', hint: 'Upload Foto' },
      { key: 'fotoRuangKomisi', label: 'Tersedia ruang Komisi Perlombaan, Juri & Ruang Rekap', type: 'file', accept: '.jpg,.jpeg,.png', hint: 'Upload Foto' },
    ]
  },
  perangkat: {
    title: 'Persyaratan Perangkat Perlombaan',
    icon: HiClipboardCheck,
    color: 'purple',
    items: [
      { key: 'faktaIntegritasKomisi', label: 'Perlombaan dipimpin oleh Komisi Perlombaan (yang ditugaskan)', type: 'file', accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx', hint: 'Upload Fakta Integritas' },
      { key: 'namaJuri', label: 'Juri PBB & Varfor', type: 'juri-list', hint: 'Input juri satu per satu' },
      { key: 'namaTimRekap', label: 'Tim Rekap yang profesional (berbadan hukum dan berpengalaman)', type: 'textarea', placeholder: 'Tulis nama tim rekap', hint: 'Tulis nama tim rekap' },
      { key: 'namaPanitia', label: 'Kelengkapan perangkat perlombaan lain (pendamping juri, MC dll)', type: 'textarea', placeholder: 'Nama Panitia/satuan-club panitia', hint: 'Nama Panitia/satuan-club' },
      { key: 'faktaIntegritasHonor', label: 'Memberikan honor dan transport yang layak untuk Komper, Juri dan Tim Rekap', type: 'file', accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx', hint: 'Upload Fakta Integritas' },
      { key: 'faktaIntegritasPanitia', label: 'Fakta Integritas Panitia Penyelenggara', type: 'file', accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx', hint: 'Upload Fakta Integritas (lihat Format Dokumen)' },
    ]
  },
  peserta: {
    title: 'Persyaratan Peserta',
    icon: HiUsers,
    color: 'orange',
    items: [
      { key: 'jumlahPeserta', label: 'Jumlah peserta minimal 30 (tiga puluh) & Maksimal 50 (lima puluh) tiap harinya', type: 'checkbox', hint: 'Fakta Integritas' },
      { key: 'anggotaForbasi', label: 'Peserta wajib anggota FORBASI', type: 'checkbox', hint: 'Fakta Integritas' },
      { key: 'kategoriKokab', label: 'Kategori tingkat perlombaan - Kokab', type: 'text', placeholder: 'Jumlah tim/peserta untuk tingkat Kota/Kab', hint: 'tim/peserta' },
      { key: 'kategoriProvinsi', label: 'Kategori tingkat perlombaan - Provinsi', type: 'text', placeholder: 'Jumlah tim/peserta untuk tingkat Provinsi', hint: 'tim/peserta' },
    ]
  },
  penghargaan: {
    title: 'Persyaratan Penghargaan',
    icon: HiCurrencyDollar,
    color: 'amber',
    items: [
      { key: 'rincianHadiah', label: 'Jumlah minimal uang pembinaan Rp. 6.000.000,- (enam juta rupiah) tiap', type: 'textarea', placeholder: 'Rincian Hadiah Uang Pembinaan', hint: 'Rincian Hadiah' },
      { key: 'desainSertifikat', label: 'Penghargaan yang diakui FORBASI: Utama, PBB, Varfor & Danton (Juara 1,2,3)', type: 'file', accept: '.jpg,.jpeg,.png,.pdf', hint: 'Upload gambar rencana desain sertifikat' },
    ]
  }
};

const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100', ring: 'focus:ring-blue-500', checkBg: 'bg-blue-600', lightBg: 'bg-blue-50', lightText: 'text-blue-600' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', iconBg: 'bg-green-100', ring: 'focus:ring-green-500', checkBg: 'bg-green-600', lightBg: 'bg-green-50', lightText: 'text-green-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-100', ring: 'focus:ring-purple-500', checkBg: 'bg-purple-600', lightBg: 'bg-purple-50', lightText: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconBg: 'bg-orange-100', ring: 'focus:ring-orange-500', checkBg: 'bg-orange-600', lightBg: 'bg-orange-50', lightText: 'text-orange-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-100', ring: 'focus:ring-amber-500', checkBg: 'bg-amber-600', lightBg: 'bg-amber-50', lightText: 'text-amber-600' },
};

export { PERSYARATAN_CONFIG };

export default function PersyaratanForm({ data, files, onChange, onFileChange, themeColor = 'green' }) {
  const [expandedSections, setExpandedSections] = useState({
    administratif: true,
    prasarana: false,
    perangkat: false,
    peserta: false,
    penghargaan: false,
  });
  const [showFormatModal, setShowFormatModal] = useState(false);

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckChange = (key) => {
    onChange({ ...data, [key]: { ...data[key], ada: !data[key]?.ada } });
  };

  const handleTextChange = (key, value) => {
    onChange({ ...data, [key]: { ...data[key], text: value, ada: true } });
  };

  const handleFileSelected = (key, file) => {
    onFileChange(key, file);
    onChange({ ...data, [key]: { ...data[key], ada: true, fileName: file?.name } });
  };

  // --- Juri list handlers ---
  const handleAddJuri = (key) => {
    const current = data[key]?.juriList || [];
    const updated = [...current, { nama: '', posisi: '', fotoName: '' }];
    onChange({ ...data, [key]: { ...data[key], ada: true, juriList: updated } });
  };

  const handleRemoveJuri = (key, index) => {
    const current = data[key]?.juriList || [];
    const updated = current.filter((_, i) => i !== index);
    // Remove the file from persyaratan files
    onFileChange(`juriFoto_${index}`, null);
    // Re-index remaining foto files
    onChange({ ...data, [key]: { ...data[key], ada: updated.length > 0, juriList: updated } });
  };

  const handleJuriFieldChange = (key, index, field, value) => {
    const current = data[key]?.juriList || [];
    const updated = current.map((j, i) => i === index ? { ...j, [field]: value } : j);
    onChange({ ...data, [key]: { ...data[key], ada: true, juriList: updated } });
  };

  const handleJuriFotoChange = (key, index, file) => {
    onFileChange(`juriFoto_${index}`, file);
    const current = data[key]?.juriList || [];
    const updated = current.map((j, i) => i === index ? { ...j, fotoName: file?.name || '' } : j);
    onChange({ ...data, [key]: { ...data[key], ada: true, juriList: updated } });
  };

  const completedCount = (sectionKey) => {
    const section = PERSYARATAN_CONFIG[sectionKey];
    return section.items.filter(item => {
      const val = data[item.key];
      if (!val) return false;
      if (item.type === 'file') return val.ada && (val.fileName || files[item.key]);
      if (item.type === 'checkbox') return val.ada;
      if (item.type === 'text' || item.type === 'textarea') return val.ada && val.text;
      if (item.type === 'juri-list') return val.ada && val.juriList && val.juriList.length > 0 && val.juriList.some(j => j.nama);
      return false;
    }).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <HiClipboardCheck className={`text-${themeColor}-700 text-xl`} />
          <h2 className="font-bold text-gray-800">Persyaratan Event</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowFormatModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-all border border-amber-200 active:scale-95"
        >
          <HiDownload className="text-sm" />
          Format Dokumen
        </button>
      </div>
      <p className="text-xs text-gray-500 -mt-2">Centang dan lengkapi semua persyaratan yang tersedia untuk event Anda</p>

      <FormatDokumenModal open={showFormatModal} onClose={() => setShowFormatModal(false)} />

      {Object.entries(PERSYARATAN_CONFIG).map(([sectionKey, section]) => {
        const colors = colorMap[section.color];
        const Icon = section.icon;
        const isOpen = expandedSections[sectionKey];
        const completed = completedCount(sectionKey);
        const total = section.items.length;

        return (
          <div key={sectionKey} className={`rounded-xl border ${colors.border} overflow-hidden`}>
            {/* Section Header */}
            <button
              type="button"
              onClick={() => toggleSection(sectionKey)}
              className={`w-full flex items-center justify-between p-4 ${colors.bg} hover:opacity-90 transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${colors.text} text-lg`} />
                </div>
                <div className="text-left">
                  <h3 className={`font-bold text-sm ${colors.text}`}>{section.title}</h3>
                  <p className="text-xs text-gray-500">{completed}/{total} terpenuhi</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {completed === total && total > 0 && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Lengkap</span>
                )}
                {isOpen ? <HiChevronUp className="text-gray-400" /> : <HiChevronDown className="text-gray-400" />}
              </div>
            </button>

            {/* Section Content */}
            {isOpen && (
              <div className="p-4 space-y-3 bg-white">
                {section.items.map((item, idx) => {
                  const itemData = data[item.key] || {};
                  const isChecked = itemData.ada || false;

                  return (
                    <div key={item.key} className={`rounded-lg border p-3 transition-all ${isChecked ? `${colors.border} ${colors.bg}/30` : 'border-gray-200'}`}>
                      {/* Row header with checkbox */}
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-gray-400 mt-0.5 w-5 text-right flex-shrink-0">{idx + 1}.</span>
                        <button
                          type="button"
                          onClick={() => handleCheckChange(item.key)}
                          className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${
                            isChecked
                              ? `${colors.checkBg} border-transparent`
                              : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        >
                          {isChecked && <HiCheck className="text-white text-xs" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isChecked ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{item.label}</p>
                          <p className={`text-xs mt-0.5 ${colors.lightText}`}>{item.hint}</p>

                          {/* Input based on type */}
                          {isChecked && item.type === 'file' && (
                            <div className="mt-2">
                              <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed ${colors.border} cursor-pointer hover:${colors.bg} transition-all`}>
                                <HiUpload className={`${colors.lightText} text-sm`} />
                                <span className="text-xs text-gray-500 truncate">
                                  {itemData.fileName || files[item.key]?.name || 'Pilih file...'}
                                </span>
                                <input
                                  type="file"
                                  accept={item.accept}
                                  className="hidden"
                                  onChange={e => handleFileSelected(item.key, e.target.files[0])}
                                />
                              </label>
                            </div>
                          )}

                          {isChecked && item.type === 'textarea' && (
                            <textarea
                              value={itemData.text || ''}
                              onChange={e => handleTextChange(item.key, e.target.value)}
                              placeholder={item.placeholder}
                              rows={2}
                              className={`mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 ${colors.ring} focus:border-transparent outline-none text-xs text-gray-700 resize-none`}
                            />
                          )}

                          {isChecked && item.type === 'juri-list' && (
                            <div className="mt-3 space-y-3">
                              {(itemData.juriList || []).map((juri, jIdx) => (
                                <div key={jIdx} className={`rounded-lg border ${colors.border} p-3 ${colors.bg}/30 space-y-2`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold ${colors.text}`}>Juri #{jIdx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveJuri(item.key, jIdx)}
                                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                                    >
                                      <HiTrash className="text-sm" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={juri.nama || ''}
                                    onChange={e => handleJuriFieldChange(item.key, jIdx, 'nama', e.target.value)}
                                    placeholder="Nama juri"
                                    className={`w-full px-3 py-2 rounded-lg border border-gray-200 ${colors.ring} focus:border-transparent outline-none text-xs text-gray-700`}
                                  />
                                  <input
                                    type="text"
                                    value={juri.posisi || ''}
                                    onChange={e => handleJuriFieldChange(item.key, jIdx, 'posisi', e.target.value)}
                                    placeholder="Sebagai juri apa (contoh: Juri PBB, Juri Varfor)"
                                    className={`w-full px-3 py-2 rounded-lg border border-gray-200 ${colors.ring} focus:border-transparent outline-none text-xs text-gray-700`}
                                  />
                                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed ${colors.border} cursor-pointer hover:${colors.bg} transition-all`}>
                                    {juri.fotoName || files[`juriFoto_${jIdx}`]?.name ? (
                                      <>
                                        <HiUserCircle className={`${colors.lightText} text-sm`} />
                                        <span className="text-xs text-gray-600 truncate flex-1">
                                          {files[`juriFoto_${jIdx}`]?.name || juri.fotoName}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <HiUpload className={`${colors.lightText} text-sm`} />
                                        <span className="text-xs text-gray-400">Upload foto juri...</span>
                                      </>
                                    )}
                                    <input
                                      type="file"
                                      accept=".jpg,.jpeg,.png"
                                      className="hidden"
                                      onChange={e => handleJuriFotoChange(item.key, jIdx, e.target.files[0])}
                                    />
                                  </label>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleAddJuri(item.key)}
                                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed ${colors.border} ${colors.lightText} hover:${colors.bg} transition-all text-xs font-semibold`}
                              >
                                <HiPlus className="text-sm" />
                                Tambah Juri
                              </button>
                            </div>
                          )}

                          {isChecked && item.type === 'text' && (
                            <input
                              type="text"
                              value={itemData.text || ''}
                              onChange={e => handleTextChange(item.key, e.target.value)}
                              placeholder={item.placeholder}
                              className={`mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 ${colors.ring} focus:border-transparent outline-none text-xs text-gray-700`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

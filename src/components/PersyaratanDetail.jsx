import { HiDocumentText, HiPhotograph, HiCheckCircle, HiClipboardCheck, HiUsers, HiCurrencyDollar, HiCheck, HiX, HiExternalLink, HiExclamationCircle, HiUserCircle } from 'react-icons/hi';

const PERSYARATAN_LABELS = {
  // Administratif
  suratIzinSekolah: 'Surat izin penyelenggaraan dari Sekolah/Instansi',
  suratIzinKepolisian: 'Surat izin keramaian dari Kepolisian setempat',
  suratRekomendasiDinas: 'Surat rekomendasi dari Dinas Pendidikan/KCD',
  suratIzinVenue: 'Surat izin penggunaan lokasi/venue',
  suratRekomendasiPPI: 'Surat rekomendasi PPI setempat',
  // Prasarana
  fotoLapangan: 'Ukuran Lapangan Minimal 12x18M',
  fotoTempatIbadah: 'Tersedia tempat Ibadah',
  fotoBarak: 'Tersedia barak peserta',
  fotoAreaParkir: 'Tersedia area parkir',
  fotoRuangKesehatan: 'Ruang kesehatan & tenaga kesehatan',
  fotoMCK: 'MCK yang memadai',
  fotoTempatSampah: 'Tempat sampah di barak dan lapangan',
  fotoRuangKomisi: 'Ruang Komisi, Juri & Ruang Rekap',
  // Perangkat
  faktaIntegritasKomisi: 'Komisi Perlombaan (Fakta Integritas)',
  namaJuri: 'Juri PBB & Varfor',
  namaTimRekap: 'Tim Rekap profesional',
  namaPanitia: 'Perangkat perlombaan lain',
  faktaIntegritasHonor: 'Honor & transport Komper/Juri/Tim Rekap',
  faktaIntegritasPanitia: 'Fakta Integritas Panitia Penyelenggara',
  // Peserta
  jumlahPeserta: 'Jumlah peserta 30-50/hari',
  anggotaForbasi: 'Peserta anggota FORBASI',
  kategoriKokab: 'Kategori Kokab',
  kategoriProvinsi: 'Kategori Provinsi',
  // Penghargaan
  rincianHadiah: 'Uang pembinaan min Rp 6.000.000',
  desainSertifikat: 'Desain sertifikat penghargaan',
};

const SECTIONS = [
  {
    title: 'Persyaratan Administratif',
    icon: HiDocumentText,
    color: 'blue',
    keys: ['suratIzinSekolah', 'suratIzinKepolisian', 'suratRekomendasiDinas', 'suratIzinVenue', 'suratRekomendasiPPI'],
  },
  {
    title: 'Prasarana & Sarana',
    icon: HiPhotograph,
    color: 'green',
    keys: ['fotoLapangan', 'fotoTempatIbadah', 'fotoBarak', 'fotoAreaParkir', 'fotoRuangKesehatan', 'fotoMCK', 'fotoTempatSampah', 'fotoRuangKomisi'],
  },
  {
    title: 'Perangkat Perlombaan',
    icon: HiClipboardCheck,
    color: 'purple',
    keys: ['faktaIntegritasKomisi', 'namaJuri', 'namaTimRekap', 'namaPanitia', 'faktaIntegritasHonor', 'faktaIntegritasPanitia'],
  },
  {
    title: 'Persyaratan Peserta',
    icon: HiUsers,
    color: 'orange',
    keys: ['jumlahPeserta', 'anggotaForbasi', 'kategoriKokab', 'kategoriProvinsi'],
  },
  {
    title: 'Persyaratan Penghargaan',
    icon: HiCurrencyDollar,
    color: 'amber',
    keys: ['rincianHadiah', 'desainSertifikat'],
  },
];

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100', border: 'border-blue-200' },
  green: { bg: 'bg-green-50', text: 'text-green-700', iconBg: 'bg-green-100', border: 'border-green-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100', border: 'border-purple-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', iconBg: 'bg-orange-100', border: 'border-orange-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100', border: 'border-amber-200' },
};

import { getUploadUrl } from '../lib/api';

export default function PersyaratanDetail({ persyaratan }) {
  const data = persyaratan || {};

  // Calculate overall stats
  const allKeys = SECTIONS.flatMap(s => s.keys);
  const filledCount = allKeys.filter(key => {
    const item = data[key];
    return item && (item.ada || item.text || item.file || item.fileName || (item.juriList && item.juriList.length > 0));
  }).length;
  const totalCount = allKeys.length;
  const missingCount = totalCount - filledCount;
  const percentage = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className={`rounded-xl p-3.5 ${missingCount > 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {missingCount > 0 ? (
              <HiExclamationCircle className="text-amber-500 text-base" />
            ) : (
              <HiCheckCircle className="text-green-500 text-base" />
            )}
            <span className={`text-xs font-bold ${missingCount > 0 ? 'text-amber-700' : 'text-green-700'}`}>
              {missingCount > 0
                ? `${missingCount} persyaratan belum dilengkapi`
                : 'Semua persyaratan sudah dilengkapi'}
            </span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${missingCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            {filledCount}/{totalCount}
          </span>
        </div>
        <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${percentage === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : percentage >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-rose-400 to-red-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map(section => {
        const colors = colorMap[section.color];
        const Icon = section.icon;
        const filledInSection = section.keys.filter(key => {
          const item = data[key];
          return item && (item.ada || item.text || item.file || item.fileName || (item.juriList && item.juriList.length > 0));
        }).length;
        const missingInSection = section.keys.length - filledInSection;

        return (
          <div key={section.title} className={`rounded-xl border ${colors.border} overflow-hidden`}>
            <div className={`flex items-center gap-2 px-4 py-2.5 ${colors.bg}`}>
              <div className={`w-7 h-7 ${colors.iconBg} rounded-md flex items-center justify-center`}>
                <Icon className={`${colors.text} text-sm`} />
              </div>
              <h4 className={`font-bold text-xs ${colors.text} flex-1`}>{section.title}</h4>
              <div className="flex items-center gap-1.5">
                {missingInSection > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600">{missingInSection} belum</span>
                )}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${filledInSection === section.keys.length ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {filledInSection}/{section.keys.length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {section.keys.map(key => {
                const item = data[key];
                const isFilled = item && (item.ada || item.text || item.file || item.fileName || (item.juriList && item.juriList.length > 0));

                return (
                  <div key={key} className={`flex items-start gap-3 px-4 py-2.5 ${isFilled ? 'bg-white' : 'bg-red-50/40'}`}>
                    <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center ${isFilled ? 'bg-green-500' : 'bg-red-400/80'}`}>
                      {isFilled ? <HiCheck className="text-white text-xs" /> : <HiX className="text-white text-xs" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${isFilled ? 'text-gray-700' : 'text-red-600/80'}`}>
                        {PERSYARATAN_LABELS[key] || key}
                      </p>
                      {!isFilled && (
                        <p className="text-[10px] text-red-400 mt-0.5 italic">Belum dilengkapi</p>
                      )}
                      {item?.text && (
                        <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{item.text}</p>
                      )}
                      {item?.juriList && Array.isArray(item.juriList) && item.juriList.length > 0 && (
                        <div className="mt-1.5 space-y-2">
                          {item.juriList.map((juri, jIdx) => (
                            <div key={jIdx} className="flex items-center gap-3 bg-purple-50/50 rounded-lg p-2 border border-purple-100">
                              {juri.foto ? (
                                <a href={getUploadUrl(juri.foto)} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                  <img src={getUploadUrl(juri.foto)} alt={juri.nama} className="w-9 h-9 rounded-full object-cover border-2 border-purple-200" />
                                </a>
                              ) : (
                                <HiUserCircle className="w-9 h-9 text-gray-300 flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-gray-800 truncate">{juri.nama || '-'}</p>
                                <p className="text-[10px] text-purple-600">{juri.posisi || '-'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {item?.file && (
                        <a
                          href={getUploadUrl(item.file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-xs ${colors.text} hover:underline mt-0.5`}
                        >
                          <HiExternalLink className="text-xs" /> Lihat Dokumen
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

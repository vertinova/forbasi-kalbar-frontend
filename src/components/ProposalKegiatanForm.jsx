import { HiUpload, HiDocumentText, HiCheck, HiX, HiExternalLink } from 'react-icons/hi';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * ProposalKegiatanForm — upload file proposal + keterangan isi proposal
 * Props:
 *   existingFile: string|null — file path dari server (saat edit)
 *   fileName: string|null — nama file yang baru dipilih
 *   onFileChange: (file: File) => void
 *   themeColor: 'amber' | 'green'
 */
export default function ProposalKegiatanForm({ existingFile, fileName, onFileChange, themeColor = 'amber' }) {
  const isAmber = themeColor === 'amber';
  const accentText = isAmber ? 'text-amber-600' : 'text-green-600';
  const uploadBtnCls = isAmber
    ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 hover:from-amber-100 hover:to-orange-100 ring-1 ring-amber-200/60'
    : 'bg-green-50 text-green-600 hover:bg-green-100 ring-1 ring-green-200';

  const hasFile = fileName || existingFile;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${isAmber ? 'from-amber-100 to-orange-100' : 'from-green-100 to-emerald-100'} flex items-center justify-center`}>
          <HiDocumentText className={`${isAmber ? 'text-amber-500' : 'text-green-500'} text-sm`} />
        </div>
        <div>
          <h2 className="font-extrabold text-gray-900 text-sm tracking-tight">Upload Proposal Kegiatan</h2>
          <p className="text-[10px] text-gray-400 font-medium">Upload dokumen proposal teknis event Anda</p>
        </div>
      </div>

      {/* Keterangan isi proposal */}
      <div className={`rounded-xl ${isAmber ? 'bg-amber-50/60 border border-amber-100/60' : 'bg-green-50/60 border border-green-100/60'} p-4`}>
        <p className={`text-[11px] ${isAmber ? 'text-amber-700' : 'text-green-700'} font-bold mb-2`}>
          Proposal yang diupload harus memuat:
        </p>
        <ul className="space-y-1.5">
          <li className={`flex items-start gap-2 text-[11px] ${isAmber ? 'text-amber-600' : 'text-green-600'}`}>
            <span className={`mt-0.5 w-4 h-4 rounded-md ${isAmber ? 'bg-amber-100' : 'bg-green-100'} flex items-center justify-center flex-shrink-0`}>
              <HiCheck className={`${isAmber ? 'text-amber-500' : 'text-green-500'} text-[9px]`} />
            </span>
            <span><strong>Panduan Lomba/Ajang:</strong> Detail kompetisi, cabang lomba, dan jenjang pendidikan (SD-SMA/SMK)</span>
          </li>
          <li className={`flex items-start gap-2 text-[11px] ${isAmber ? 'text-amber-600' : 'text-green-600'}`}>
            <span className={`mt-0.5 w-4 h-4 rounded-md ${isAmber ? 'bg-amber-100' : 'bg-green-100'} flex items-center justify-center flex-shrink-0`}>
              <HiCheck className={`${isAmber ? 'text-amber-500' : 'text-green-500'} text-[9px]`} />
            </span>
            <span><strong>Jadwal Pelaksanaan:</strong> Linimasa yang jelas dari pendaftaran hingga pengumuman</span>
          </li>
          <li className={`flex items-start gap-2 text-[11px] ${isAmber ? 'text-amber-600' : 'text-green-600'}`}>
            <span className={`mt-0.5 w-4 h-4 rounded-md ${isAmber ? 'bg-amber-100' : 'bg-green-100'} flex items-center justify-center flex-shrink-0`}>
              <HiCheck className={`${isAmber ? 'text-amber-500' : 'text-green-500'} text-[9px]`} />
            </span>
            <span><strong>Kompetensi Tim:</strong> Susunan panitia dan juri yang kompeten (memiliki keahlian di bidang lomba)</span>
          </li>
          <li className={`flex items-start gap-2 text-[11px] ${isAmber ? 'text-amber-600' : 'text-green-600'}`}>
            <span className={`mt-0.5 w-4 h-4 rounded-md ${isAmber ? 'bg-amber-100' : 'bg-green-100'} flex items-center justify-center flex-shrink-0`}>
              <HiCheck className={`${isAmber ? 'text-amber-500' : 'text-green-500'} text-[9px]`} />
            </span>
            <span><strong>Asas dan Prinsip:</strong> Menjabarkan penerapan asas sportivitas, kejujuran, dan kesesuaian dengan tujuan pendidikan</span>
          </li>
        </ul>
      </div>

      {/* Upload area */}
      <div className="space-y-2">
        {/* Existing file badge */}
        {existingFile && !fileName && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
            <HiDocumentText className="text-emerald-500 text-sm flex-shrink-0" />
            <span className="text-[11px] text-emerald-700 font-semibold truncate flex-1">Proposal sudah diupload</span>
            <a href={`${API_URL}${existingFile}`} target="_blank" rel="noopener noreferrer"
              className="text-[10px] text-sky-500 hover:text-sky-600 font-semibold underline underline-offset-2 flex items-center gap-0.5">
              Lihat <HiExternalLink className="text-[10px]" />
            </a>
          </div>
        )}

        {/* New file selected badge */}
        {fileName && (
          <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 rounded-lg border border-sky-100">
            <HiDocumentText className="text-sky-500 text-sm flex-shrink-0" />
            <span className="text-[11px] text-sky-700 font-semibold truncate flex-1">{fileName}</span>
            <HiCheck className="text-emerald-500 text-sm flex-shrink-0" />
          </div>
        )}

        {/* Upload button */}
        <label className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl cursor-pointer transition-all active:scale-[0.98] font-bold text-xs shadow-sm ${uploadBtnCls}`}>
          <HiUpload className="text-sm" />
          {hasFile ? 'Ganti File Proposal' : 'Upload Proposal Kegiatan'}
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) onFileChange(file);
            }}
          />
        </label>
        <p className="text-[10px] text-gray-400 text-center">Format: PDF (maks. 5MB)</p>
      </div>
    </div>
  );
}
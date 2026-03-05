import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HiPencilAlt, HiUpload, HiTrash, HiCheck, HiRefresh, HiDocumentText } from 'react-icons/hi';

// Extracted OUTSIDE to prevent remounting on every parent re-render
function SignatureCard({ role, label, name, setName, canvasRef, handlers, configData, apiUrl, onClear, onSave, saving }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <HiPencilAlt className="text-green-600" size={20} />
        <h3 className="text-base font-bold text-gray-800">Tanda Tangan {label}</h3>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1">Nama {label}</label>
        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder={`Nama lengkap ${label.toLowerCase()}`}
        />
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500">Gambar Tanda Tangan</label>
          <button onClick={onClear} className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium">
            <HiTrash size={14} /> Hapus
          </button>
        </div>
        <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-white hover:border-green-300 transition-colors">
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair touch-none"
            style={{ height: '180px' }}
            onMouseDown={handlers.onStart} onMouseMove={handlers.onMove}
            onMouseUp={handlers.onStop} onMouseLeave={handlers.onStop}
            onTouchStart={handlers.onStart} onTouchMove={handlers.onMove} onTouchEnd={handlers.onStop}
          />
        </div>
      </div>
      {configData?.signaturePath && (
        <div className="bg-green-50 rounded-xl p-3 mb-3 border border-green-100">
          <p className="text-xs font-semibold text-green-700 mb-2">Tanda tangan saat ini:</p>
          <div className="flex items-center gap-3">
            <img src={apiUrl + configData.signaturePath} alt="TTD" className="h-14 bg-white rounded-lg border border-green-200 p-1" />
            <p className="text-xs font-semibold text-gray-600">{configData.signerName}</p>
          </div>
        </div>
      )}
      <button
        onClick={onSave} disabled={saving}
        className="w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
          : <><HiCheck size={16} /> Simpan TTD {label}</>}
      </button>
    </div>
  );
}

export default function AdminSuratConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({});

  // Ketua state
  const [ketuaName, setKetuaName] = useState('');
  const ketuaCanvasRef = useRef(null);
  const ketuaDrawing = useRef(false);
  const ketuaLast = useRef(null);

  // Sekretaris state
  const [sekretarisName, setSekretarisName] = useState('');
  const sekretarisCanvasRef = useRef(null);
  const sekretarisDrawing = useRef(false);
  const sekretarisLast = useRef(null);

  // Stamp
  const [stampPreview, setStampPreview] = useState(null);
  const [stampFile, setStampFile] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/site-config/surat-config');
      setConfig(res.data);
      if (res.data.tanda_tangan_ketua) setKetuaName(res.data.tanda_tangan_ketua.signerName || '');
      if (res.data.tanda_tangan_sekretaris) setSekretarisName(res.data.tanda_tangan_sekretaris.signerName || '');
      if (res.data.stempel?.stampPath) setStampPreview(API_URL + res.data.stempel.stampPath);
    } catch (err) {
      console.error('Gagal memuat konfigurasi:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── CANVAS HELPERS ──
  const initCanvas = useCallback((canvasRef, signaturePath) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    if (signaturePath) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = API_URL + signaturePath;
    }
  }, [API_URL]);

  useEffect(() => {
    initCanvas(ketuaCanvasRef, config.tanda_tangan_ketua?.signaturePath);
    initCanvas(sekretarisCanvasRef, config.tanda_tangan_sekretaris?.signaturePath);
  }, [config, initCanvas]);

  const getPos = (e, canvasRef) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const makeDrawHandlers = (canvasRef, drawingRef, lastRef) => ({
    onStart: (e) => { e.preventDefault(); drawingRef.current = true; lastRef.current = getPos(e, canvasRef); },
    onMove: (e) => {
      e.preventDefault();
      if (!drawingRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      const p = getPos(e, canvasRef);
      ctx.beginPath();
      ctx.moveTo(lastRef.current.x, lastRef.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastRef.current = p;
    },
    onStop: () => { drawingRef.current = false; lastRef.current = null; },
  });

  const ketuaHandlers = makeDrawHandlers(ketuaCanvasRef, ketuaDrawing, ketuaLast);
  const sekretarisHandlers = makeDrawHandlers(sekretarisCanvasRef, sekretarisDrawing, sekretarisLast);

  const clearCanvas = (canvasRef) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
  };

  const getSignatureData = (canvasRef) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const pixels = ctx.getImageData(0, 0, rect.width * 2, rect.height * 2).data;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 0) return canvas.toDataURL('image/png');
    }
    return null;
  };

  // ── SAVE SIGNATURE (role: ketua / sekretaris) ──
  const handleSaveSignature = async (role) => {
    const isKetua = role === 'ketua';
    const canvasRef = isKetua ? ketuaCanvasRef : sekretarisCanvasRef;
    const name = isKetua ? ketuaName : sekretarisName;
    const signatureData = getSignatureData(canvasRef);
    if (!signatureData) return toast.error('Silakan gambar tanda tangan terlebih dahulu');
    if (!name.trim()) return toast.error('Nama penandatangan wajib diisi');
    setSaving(true);
    try {
      await api.post('/site-config/signature', { signatureData, signerName: name.trim(), role });
      toast.success(`Tanda tangan ${isKetua ? 'Ketua' : 'Sekretaris'} berhasil disimpan`);
      fetchConfig();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan tanda tangan');
    } finally {
      setSaving(false);
    }
  };

  // ── SAVE STAMP ──
  const handleSaveStamp = async () => {
    if (!stampFile) return toast.error('Pilih file stempel terlebih dahulu');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('stamp', stampFile);
      await api.post('/site-config/stamp', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Stempel berhasil disimpan');
      setStampFile(null);
      fetchConfig();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan stempel');
    } finally {
      setSaving(false);
    }
  };

  const handleStampFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
      return toast.error('Hanya file gambar (PNG, JPG, WEBP) yang diizinkan');
    setStampFile(file);
    setStampPreview(URL.createObjectURL(file));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-[3px] border-green-200 border-t-green-600 rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <HiDocumentText className="text-green-600" size={22} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Konfigurasi Surat</h2>
          <p className="text-xs text-gray-400">Tanda tangan Ketua & Sekretaris + stempel untuk surat rekomendasi</p>
        </div>
      </div>

      {/* Signatures – Ketua & Sekretaris */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SignatureCard
          role="ketua" label="Ketua" name={ketuaName} setName={setKetuaName}
          canvasRef={ketuaCanvasRef} handlers={ketuaHandlers}
          configData={config.tanda_tangan_ketua} apiUrl={API_URL}
          onClear={() => clearCanvas(ketuaCanvasRef)}
          onSave={() => handleSaveSignature('ketua')} saving={saving}
        />
        <SignatureCard
          role="sekretaris" label="Sekretaris" name={sekretarisName} setName={setSekretarisName}
          canvasRef={sekretarisCanvasRef} handlers={sekretarisHandlers}
          configData={config.tanda_tangan_sekretaris} apiUrl={API_URL}
          onClear={() => clearCanvas(sekretarisCanvasRef)}
          onSave={() => handleSaveSignature('sekretaris')} saving={saving}
        />
      </div>

      {/* Stamp */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <HiUpload className="text-green-600" size={20} />
          <h3 className="text-base font-bold text-gray-800">Stempel Organisasi</h3>
        </div>
        <div className="mb-4">
          {stampPreview ? (
            <div className="text-center">
              <div className="inline-block p-4 bg-gray-50 rounded-xl border border-gray-200 mb-3">
                <img src={stampPreview} alt="Stempel" className="max-h-40 max-w-full object-contain" />
              </div>
              {stampFile && <p className="text-xs text-amber-600 font-medium">File baru dipilih - klik Simpan untuk menyimpan</p>}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
              <HiUpload className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-400">Belum ada stempel</p>
              <p className="text-xs text-gray-300 mt-1">Upload gambar stempel (PNG transparan disarankan)</p>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Upload Stempel</label>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleStampFileChange}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" />
          <p className="text-[10px] text-gray-400 mt-1">Format: PNG (transparan), JPG, WEBP. Maks 5MB.</p>
        </div>
        <button onClick={handleSaveStamp} disabled={saving || !stampFile}
          className="w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
            : <><HiCheck size={16} /> Simpan Stempel</>}
        </button>
      </div>

      {/* Info */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 sm:p-5">
        <div className="flex gap-3">
          <HiRefresh className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-bold text-amber-800 mb-1">Informasi Penting</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Tanda tangan Ketua & Sekretaris akan otomatis ditampilkan pada surat rekomendasi saat status diubah ke DISETUJUI</li>
              <li>• Stempel akan muncul di antara kedua tanda tangan</li>
              <li>• Surat rekomendasi PDF di-generate otomatis dan dapat didownload oleh penyelenggara</li>
              <li>• Gunakan latar belakang transparan (PNG) untuk stempel agar hasilnya optimal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

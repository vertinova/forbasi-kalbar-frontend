import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  HiQrcode, HiCheckCircle, HiXCircle, HiRefresh, HiUser,
  HiCalendar, HiLocationMarker, HiTag, HiVideoCamera, HiStop
} from 'react-icons/hi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const READER_ID = 'qr-reader';

export default function AdminScanPage() {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const verifyToken = useCallback(async (token) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/pendaftaran/verify-qr/${token}`);
      setResult(res.data);
    } catch (err) {
      const data = err.response?.data;
      setResult({
        valid: false,
        error: data?.error || 'QR Code tidak valid',
        pendaftaran: data?.pendaftaran || null,
      });
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  }, []);

  const cleanupScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
      } catch (e) { /* ignore */ }
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  }, []);

  const stopCamera = useCallback(async () => {
    await cleanupScanner();
    setCameraOpen(false);
  }, [cleanupScanner]);

  const openCamera = useCallback(async () => {
    setResult(null);
    isProcessingRef.current = false;
    setCameraOpen(true);
  }, []);

  // Start the actual scanner when cameraOpen becomes true
  useEffect(() => {
    if (!cameraOpen) return;

    let mounted = true;
    const el = document.getElementById(READER_ID);
    if (!el) return;

    const initCamera = async () => {
      // Wait for DOM render
      await new Promise(r => setTimeout(r, 200));
      if (!mounted) return;

      try {
        const scanner = new Html5Qrcode(READER_ID, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = scanner;

        // Calculate responsive qrbox based on container
        const containerWidth = el.clientWidth || 300;
        const qrboxSize = Math.min(Math.floor(containerWidth * 0.7), 250);

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: qrboxSize, height: qrboxSize },
            disableFlip: false,
          },
          async (decodedText) => {
            if (isProcessingRef.current) return;
            // Stop scanner immediately on decode
            try {
              await scanner.stop();
            } catch (e) { /* ignore */ }
            if (mounted) {
              setCameraOpen(false);
              verifyToken(decodedText);
            }
          },
          () => {} // ignore scan failures (partial reads)
        );
      } catch (err) {
        console.error('Camera init error:', err);
        if (mounted) {
          setCameraOpen(false);
          // Distinguish permission denied vs other errors
          const msg = String(err).toLowerCase();
          if (msg.includes('permission') || msg.includes('not allowed')) {
            toast.error('Izin kamera ditolak. Aktifkan di pengaturan browser.');
          } else if (msg.includes('not found') || msg.includes('no camera')) {
            toast.error('Kamera tidak ditemukan di perangkat ini.');
          } else {
            toast.error('Gagal membuka kamera. Coba tutup aplikasi kamera lain.');
          }
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        try {
          const s = scannerRef.current.getState();
          if (s === 2 || s === 3) scannerRef.current.stop();
        } catch (e) { /* ignore */ }
      }
    };
  }, [cameraOpen, verifyToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { cleanupScanner(); };
  }, [cleanupScanner]);

  const handleManualVerify = () => {
    if (!manualToken.trim()) {
      toast.error('Masukkan token QR');
      return;
    }
    verifyToken(manualToken.trim());
  };

  const resetScanner = () => {
    setResult(null);
    setManualToken('');
    isProcessingRef.current = false;
    openCamera();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
          <HiQrcode className="text-white" size={32} />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Scanner QR Tiket</h1>
        <p className="text-sm text-gray-500 mt-1">Scan QR code peserta untuk verifikasi masuk venue</p>
      </div>

      {/* Scanner Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4">
          {/* Camera viewport */}
          <div
            id={READER_ID}
            className="rounded-xl overflow-hidden bg-gray-900"
            style={{ display: cameraOpen ? 'block' : 'none', minHeight: cameraOpen ? 280 : 0 }}
          />

          {!cameraOpen && !result && (
            <div className="flex flex-col items-center py-12">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <HiVideoCamera className="text-gray-400" size={40} />
              </div>
              <p className="text-gray-500 text-sm mb-4">Mulai scan QR code peserta</p>
              <button
                onClick={openCamera}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-[0.98]"
              >
                <HiVideoCamera size={20} /> Buka Kamera
              </button>
            </div>
          )}

          {cameraOpen && (
            <button
              onClick={stopCamera}
              className="w-full mt-3 py-2.5 bg-red-100 text-red-600 font-bold text-sm rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
            >
              <HiStop size={16} /> Tutup Kamera
            </button>
          )}
        </div>

        {/* Manual Input */}
        <div className="px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualVerify()}
              placeholder="Atau masukkan token QR manual..."
              className="w-full pl-4 pr-24 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm"
            />
            <button
              onClick={handleManualVerify}
              disabled={loading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Verifikasi
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className={`rounded-2xl border-2 overflow-hidden animate-scale-in ${
          result.valid 
            ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
            : 'border-red-300 bg-gradient-to-br from-red-50 to-rose-50'
        }`}>
          {/* Result Header */}
          <div className={`p-5 text-center ${result.valid ? 'bg-green-100/50' : 'bg-red-100/50'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
              result.valid ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {result.valid 
                ? <HiCheckCircle className="text-white" size={36} />
                : <HiXCircle className="text-white" size={36} />
              }
            </div>
            <h3 className={`text-lg font-bold ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
              {result.valid ? 'VALID - Peserta Terdaftar' : 'TIDAK VALID'}
            </h3>
            <p className={`text-sm mt-1 ${result.valid ? 'text-green-600' : 'text-red-600'}`}>
              {result.message || result.error}
            </p>
          </div>

          {/* Participant Details */}
          {result.pendaftaran && (
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3 bg-white/80 rounded-xl p-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <HiUser className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Nama Peserta</p>
                  <p className="font-bold text-gray-800">{result.pendaftaran.namaAtlet}</p>
                </div>
              </div>
              
              {result.pendaftaran.event && (
                <div className="flex items-center gap-3 bg-white/80 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <HiCalendar className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Event</p>
                    <p className="font-bold text-gray-800">{result.pendaftaran.event}</p>
                  </div>
                </div>
              )}

              {result.pendaftaran.kategori && (
                <div className="flex items-center gap-3 bg-white/80 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <HiTag className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Kategori</p>
                    <p className="font-bold text-gray-800">{result.pendaftaran.kategori}</p>
                  </div>
                </div>
              )}

              {result.pendaftaran.lokasi && (
                <div className="flex items-center gap-3 bg-white/80 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <HiLocationMarker className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Lokasi</p>
                    <p className="font-bold text-gray-800">{result.pendaftaran.lokasi}</p>
                  </div>
                </div>
              )}

              {result.pendaftaran.tanggalMulai && (
                <div className="text-center text-xs text-gray-400 pt-1">
                  Mulai: {formatDate(result.pendaftaran.tanggalMulai)}
                </div>
              )}

              {/* Payment info if DP */}
              {result.pendaftaran.dataPersyaratan?.isBookingDP && (
                <div className={`rounded-xl p-3 border ${
                  result.pendaftaran.dataPersyaratan.statusPembayaran === 'LUNAS'
                    ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                }`}>
                  <p className={`text-sm font-bold ${
                    result.pendaftaran.dataPersyaratan.statusPembayaran === 'LUNAS'
                      ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    Pembayaran: {result.pendaftaran.dataPersyaratan.statusPembayaran === 'LUNAS' ? 'Lunas ✓' : result.pendaftaran.dataPersyaratan.statusPembayaran}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Scan Again */}
          <div className="p-4 border-t border-gray-200/50">
            <button
              onClick={resetScanner}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <HiRefresh size={18} /> Scan Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

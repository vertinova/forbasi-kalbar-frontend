import { useEffect, useRef } from 'react';
import { HiShieldCheck, HiExclamationCircle, HiX } from 'react-icons/hi';

export default function BillingVerifyModal({ open, onClose, billingStatus }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !billingStatus || billingStatus === 'loading') return null;

  const isValid = billingStatus.valid;
  const d = billingStatus.data;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-[billingModalIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Glow ring behind modal */}
        <div className={`absolute -inset-1 rounded-[22px] blur-xl opacity-40 ${
          isValid
            ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400'
            : 'bg-gradient-to-r from-rose-400 via-red-400 to-orange-400'
        }`} />

        <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/15">
          {/* Top decorative gradient bar */}
          <div className={`h-1.5 ${
            isValid
              ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400'
              : 'bg-gradient-to-r from-rose-400 via-red-400 to-orange-400'
          }`} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-all z-10"
          >
            <HiX size={16} />
          </button>

          <div className="px-6 pt-7 pb-6">
            {/* Animated icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                {/* Pulse rings */}
                <div className={`absolute inset-0 rounded-full animate-[billingPulse_2s_ease-out_infinite] ${
                  isValid ? 'bg-emerald-400/20' : 'bg-rose-400/20'
                }`} />
                <div className={`absolute inset-0 rounded-full animate-[billingPulse_2s_ease-out_0.5s_infinite] ${
                  isValid ? 'bg-emerald-400/10' : 'bg-rose-400/10'
                }`} />

                {/* Icon circle */}
                <div className={`relative w-18 h-18 rounded-full flex items-center justify-center animate-[billingIconPop_0.5s_cubic-bezier(0.34,1.56,0.64,1)] ${
                  isValid
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-300/40'
                    : 'bg-gradient-to-br from-rose-400 to-red-500 shadow-lg shadow-rose-300/40'
                }`}>
                  {isValid ? (
                    <HiShieldCheck className="text-white text-3xl drop-shadow-sm" />
                  ) : (
                    <HiExclamationCircle className="text-white text-3xl drop-shadow-sm" />
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className={`text-center text-lg font-extrabold mb-1 tracking-tight animate-[billingTextUp_0.4s_0.15s_ease-out_both] ${
              isValid ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {isValid ? 'Billing Terverifikasi!' : 'Verifikasi Gagal'}
            </h3>

            <p className={`text-center text-xs mb-5 animate-[billingTextUp_0.4s_0.25s_ease-out_both] ${
              isValid ? 'text-emerald-500' : 'text-rose-400'
            }`}>
              {isValid
                ? 'Kode billing sudah valid dan terdaftar di Simpaskor'
                : (billingStatus.message || 'Kode billing tidak valid')
              }
            </p>

            {/* Details card (show when data is available) */}
            {d && (
              <div className={`rounded-xl border p-4 mb-5 animate-[billingTextUp_0.4s_0.3s_ease-out_both] ${isValid ? 'bg-gradient-to-br from-emerald-50/80 to-green-50/50 border-emerald-100/60' : 'bg-gradient-to-br from-rose-50/80 to-orange-50/50 border-rose-100/60'}`}>
                <div className="space-y-2.5">
                  {d.billing_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-medium">Kode Billing</span>
                      <span className="text-sm font-bold font-mono text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-lg">{d.billing_id}</span>
                    </div>
                  )}
                  {d.customer?.full_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-medium">Nama</span>
                      <span className="text-xs font-semibold text-gray-700">{d.customer.full_name}</span>
                    </div>
                  )}
                  {d.customer?.organization_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-medium">Organisasi</span>
                      <span className="text-xs font-semibold text-gray-700">{d.customer.organization_name}</span>
                    </div>
                  )}
                  {(d.event_details?.event_name || d.event_details?.location) && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-medium">Event</span>
                      <span className="text-xs font-semibold text-gray-700 text-right max-w-[60%]">{d.event_details.event_name || d.event_details.location}</span>
                    </div>
                  )}
                  {d.event_details?.event_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-medium">Tanggal</span>
                      <span className="text-xs font-semibold text-gray-700">{d.event_details.event_date}</span>
                    </div>
                  )}
                  {d.payment?.status && (
                    <div className={`flex items-center justify-between border-t pt-2.5 ${isValid ? 'border-emerald-100/60' : 'border-rose-100/60'}`}>
                      <span className="text-[11px] text-gray-400 font-medium">Pembayaran</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        d.payment.status === 'Lunas'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>{d.payment.status}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action button */}
            <div className="animate-[billingTextUp_0.4s_0.35s_ease-out_both]">
              {isValid ? (
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-300/30 hover:shadow-emerald-400/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <HiShieldCheck className="text-base" />
                  Lanjutkan Pengisian
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-300/30 hover:shadow-rose-400/40 active:scale-[0.98] transition-all duration-200"
                >
                  Tutup & Coba Lagi
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { HiExclamation, HiTrash, HiRefresh, HiX, HiCheck } from 'react-icons/hi';

const variants = {
  danger: {
    icon: HiTrash,
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
    confirmBtn: 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/25 hover:shadow-rose-500/40',
  },
  warning: {
    icon: HiExclamation,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    confirmBtn: 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/25 hover:shadow-amber-500/40',
  },
  info: {
    icon: HiRefresh,
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-500',
    confirmBtn: 'bg-gradient-to-r from-sky-500 to-sky-600 shadow-sky-500/25 hover:shadow-sky-500/40',
  },
  success: {
    icon: HiCheck,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    confirmBtn: 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/25 hover:shadow-green-500/40',
  },
};

export default function ConfirmModal({
  open,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  const overlayRef = useRef(null);
  const v = variants[variant] || variants.danger;
  const Icon = v.icon;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current && !loading) onCancel?.(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl shadow-black/10 animate-[scaleIn_0.2s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Close */}
        <button
          onClick={() => !loading && onCancel?.()}
          className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors z-10"
        >
          <HiX size={16} />
        </button>

        <div className="px-6 pt-7 pb-6 text-center">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl ${v.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={v.iconColor} size={26} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-1.5">{title}</h3>

          {/* Message */}
          <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={() => !loading && onCancel?.()}
            disabled={loading}
            className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={() => onConfirm?.()}
            disabled={loading}
            className={`flex-1 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-[0.97] disabled:opacity-50 ${v.confirmBtn}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Memproses...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

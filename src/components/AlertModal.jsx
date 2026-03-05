import { useEffect, useRef } from 'react';
import { HiExclamationCircle, HiShieldExclamation, HiX, HiInformationCircle, HiCheckCircle } from 'react-icons/hi';

const variants = {
  error: {
    gradient: 'from-rose-500 to-red-500',
    glow: 'bg-rose-400/20',
    iconBg: 'bg-gradient-to-br from-rose-400 to-red-500',
    iconShadow: 'shadow-rose-300/40',
    barColor: 'from-rose-400 via-red-400 to-orange-400',
    btnGradient: 'from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600',
    btnShadow: 'shadow-rose-300/30 hover:shadow-rose-400/40',
    Icon: HiExclamationCircle,
  },
  warning: {
    gradient: 'from-amber-500 to-orange-500',
    glow: 'bg-amber-400/20',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    iconShadow: 'shadow-amber-300/40',
    barColor: 'from-amber-400 via-orange-400 to-yellow-400',
    btnGradient: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    btnShadow: 'shadow-amber-300/30 hover:shadow-amber-400/40',
    Icon: HiShieldExclamation,
  },
  info: {
    gradient: 'from-sky-500 to-blue-500',
    glow: 'bg-sky-400/20',
    iconBg: 'bg-gradient-to-br from-sky-400 to-blue-500',
    iconShadow: 'shadow-sky-300/40',
    barColor: 'from-sky-400 via-blue-400 to-indigo-400',
    btnGradient: 'from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600',
    btnShadow: 'shadow-sky-300/30 hover:shadow-sky-400/40',
    Icon: HiInformationCircle,
  },
  success: {
    gradient: 'from-emerald-500 to-green-500',
    glow: 'bg-emerald-400/20',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500',
    iconShadow: 'shadow-emerald-300/40',
    barColor: 'from-emerald-400 via-green-400 to-teal-400',
    btnGradient: 'from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600',
    btnShadow: 'shadow-emerald-300/30 hover:shadow-emerald-400/40',
    Icon: HiCheckCircle,
  },
};

export default function AlertModal({ open, onClose, title, message, variant = 'error', buttonText = 'Mengerti' }) {
  const overlayRef = useRef(null);
  const v = variants[variant] || variants.error;
  const Icon = v.Icon;

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

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]" />

      {/* Modal */}
      <div className="relative w-full max-w-sm animate-[alertModalIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Subtle glow */}
        <div className={`absolute -inset-2 rounded-[24px] blur-2xl opacity-30 ${v.glow}`} />

        <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/12">
          {/* Top gradient bar */}
          <div className={`h-1 bg-gradient-to-r ${v.barColor}`} />

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-all z-10">
            <HiX size={14} />
          </button>

          <div className="px-6 pt-8 pb-6 text-center">
            {/* Animated icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                {/* Pulse ring */}
                <div className={`absolute inset-0 rounded-full ${v.glow} animate-[alertPulseRing_1.5s_ease-out_infinite]`} />

                {/* Icon */}
                <div className={`relative w-16 h-16 rounded-2xl ${v.iconBg} shadow-lg ${v.iconShadow} flex items-center justify-center animate-[alertIconBounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)]`}>
                  <Icon className="text-white text-3xl drop-shadow-sm" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight animate-[alertSlideUp_0.4s_0.1s_ease-out_both]">
              {title || 'Perhatian'}
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-500 leading-relaxed animate-[alertSlideUp_0.4s_0.2s_ease-out_both]">
              {message}
            </p>

            {/* Button */}
            <div className="mt-6 animate-[alertSlideUp_0.4s_0.3s_ease-out_both]">
              <button
                onClick={onClose}
                className={`w-full py-3 bg-gradient-to-r ${v.btnGradient} text-white rounded-xl font-bold text-sm shadow-lg ${v.btnShadow} active:scale-[0.97] transition-all duration-200`}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

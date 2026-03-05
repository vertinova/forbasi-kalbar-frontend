import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiDocumentText, HiPlus, HiClock, HiCheckCircle, HiXCircle,
  HiChevronRight, HiUser,
  HiClipboardCheck, HiArrowRight
} from 'react-icons/hi';
import api from '../../lib/api';

const statusConfig = {
  PENDING: { label: 'Menunggu', bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100', icon: HiClock, dot: 'bg-amber-400', gradient: 'from-amber-400 to-orange-400' },
  APPROVED_PENGCAB: { label: 'Disetujui Pengcab', bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-100', icon: HiClipboardCheck, dot: 'bg-sky-400', gradient: 'from-sky-400 to-blue-500' },
  DISETUJUI: { label: 'Disetujui', bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', icon: HiCheckCircle, dot: 'bg-emerald-500', gradient: 'from-emerald-400 to-green-500' },
  DITOLAK: { label: 'Ditolak', bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', icon: HiXCircle, dot: 'bg-rose-400', gradient: 'from-rose-400 to-red-500' },
};

/* Animated counter */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const end = value;
    const duration = 600;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * end));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <>{display}</>;
}

export default function PenyelenggaraDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    api.get('/auth/user-dashboard').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setShow(true), 50);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-[3px] border-gray-200" />
          <div className="w-12 h-12 rounded-full border-[3px] border-amber-500 border-t-transparent animate-spin absolute inset-0" />
        </div>
      </div>
    );
  }

  const profile = data?.userProfile;
  const stats = data?.rekomendasiByStatus || [];
  const getCount = (status) => stats.find(s => s.status === status)?._count || 0;
  const totalRekomendasi = data?.totalRekomendasi || 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Greeting */}
      <div className={`transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <p className="text-gray-400 text-xs font-medium">Selamat datang kembali,</p>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-0.5">
          {profile?.name || user?.name} <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite] origin-[70%_70%]">👋</span>
        </h1>
      </div>

      {/* Stats Row */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 transition-all duration-500 delay-100 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = getCount(key);
          return (
            <div key={key} className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`text-sm ${cfg.text}`} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter leading-none">
                <AnimatedNumber value={count} />
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className={`grid sm:grid-cols-2 gap-3 transition-all duration-500 delay-200 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <Link to="/penyelenggara/ajukan"
          className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 active:scale-[0.98]">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-lg" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-90 transition-transform duration-500">
              <HiPlus className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm">Ajukan Event Baru</h3>
              <p className="text-amber-100 text-xs mt-0.5">Buat permohonan rekomendasi</p>
            </div>
            <HiArrowRight className="text-white/60 text-lg group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </Link>

        <Link to="/penyelenggara/riwayat"
          className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-50 transition-colors duration-300">
              <HiClipboardCheck className="text-xl text-gray-400 group-hover:text-amber-500 transition-colors duration-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">Riwayat Pengajuan</h3>
              <p className="text-xs text-gray-400 mt-0.5">Total {totalRekomendasi} pengajuan</p>
            </div>
            <HiArrowRight className="text-gray-300 text-lg group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </Link>
      </div>

      {/* Alur Perizinan */}
      <div className={`bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm transition-all duration-500 delay-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <h3 className="text-sm font-bold text-gray-900 mb-5">Alur Perizinan Event</h3>
        <div className="flex items-start justify-between gap-2">
          {[
            { step: '1', label: 'Ajukan', sub: 'Isi formulir', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
            { step: '2', label: 'Review Pengcab', sub: 'Verifikasi data', color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50' },
            { step: '3', label: 'Review Pengda', sub: 'Approval akhir', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50' },
          ].map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center text-center flex-1">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg text-white font-bold text-sm`}>
                  {s.step}
                </div>
                <p className="text-xs font-bold text-gray-800 mt-2.5 leading-tight">{s.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">{s.sub}</p>
              </div>
              {i < 2 && (
                <div className="w-6 sm:w-10 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-full h-[2px] bg-gradient-to-r from-gray-200 to-gray-100 rounded-full relative">
                    <div className="absolute -right-0.5 -top-[5px] text-gray-300">
                      <HiChevronRight className="text-xs" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Submissions */}
      <div className={`transition-all duration-500 delay-[400ms] ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">Pengajuan Terakhir</h2>
          {data?.recentRekomendasi?.length > 0 && (
            <Link to="/penyelenggara/riwayat" className="text-xs text-amber-600 font-semibold hover:text-amber-700 flex items-center gap-0.5 group">
              Semua <HiChevronRight className="text-sm group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
        {(!data?.recentRekomendasi || data.recentRekomendasi.length === 0) ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiDocumentText className="text-3xl text-gray-300" />
            </div>
            <p className="text-gray-600 font-bold text-sm">Belum ada pengajuan</p>
            <p className="text-gray-400 text-xs mt-1">Mulai dengan mengajukan perizinan event pertama Anda</p>
            <Link to="/penyelenggara/ajukan" className="inline-flex items-center gap-1.5 mt-5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-amber-200/40 transition-all active:scale-95">
              <HiPlus className="text-base" /> Ajukan Event
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentRekomendasi.map((item, idx) => {
              const cfg = statusConfig[item.status] || statusConfig.PENDING;
              return (
                <Link key={item.id} to="/penyelenggara/riwayat"
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group animate-[fadeInUp_0.4s_ease-out_both]">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <cfg.icon className={`text-base ${cfg.text}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-sm truncate">{item.namaEvent}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ring-1 whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
                    {cfg.label}
                  </span>
                  <HiChevronRight className="text-gray-300 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes wave { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(20deg); } 75% { transform: rotate(-10deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

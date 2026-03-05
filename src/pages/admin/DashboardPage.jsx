import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOfficeBuilding, HiDocumentText, HiFlag, HiUsers, HiUserGroup, HiArrowRight, HiTrendingUp, HiCalendar, HiChevronRight, HiSparkles, HiLightningBolt } from 'react-icons/hi';
import api from '../../lib/api';

const statusConfig = {
  PENDING: { label: 'Menunggu', color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500', ring: 'ring-amber-500/20' },
  APPROVED_PENGCAB: { label: 'OK Pengcab', color: '#0ea5e9', bg: 'bg-sky-500/10', text: 'text-sky-600', dot: 'bg-sky-500', ring: 'ring-sky-500/20' },
  DISETUJUI: { label: 'Disetujui', color: '#22c55e', bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500', ring: 'ring-green-500/20' },
  DITOLAK: { label: 'Ditolak', color: '#f43f5e', bg: 'bg-rose-500/10', text: 'text-rose-600', dot: 'bg-rose-500', ring: 'ring-rose-500/20' },
};

/* Animated counter hook */
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    let start = 0;
    const step = (ts) => {
      if (!ref.current) ref.current = ts;
      const progress = Math.min((ts - ref.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    ref.current = null;
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

function AnimatedNumber({ value }) {
  const count = useCountUp(value || 0);
  return <span>{count}</span>;
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-[3px] border-gray-100" />
        <div className="absolute inset-0 rounded-full border-[3px] border-green-500 border-t-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-[2px] border-green-300 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
    </div>
  );

  const stats = data?.stats || {};
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const statCards = [
    { label: 'Pengcab', value: stats.totalPengcab, icon: HiOfficeBuilding, gradient: 'from-blue-500 to-cyan-400', shadowColor: 'shadow-blue-500/20', glowColor: 'group-hover:shadow-blue-500/30', bgGlow: 'bg-blue-500/5', link: '/admin/pengcab' },
    { label: 'Rekomendasi', value: stats.totalRekomendasi, icon: HiDocumentText, gradient: 'from-amber-500 to-orange-400', shadowColor: 'shadow-amber-500/20', glowColor: 'group-hover:shadow-amber-500/30', bgGlow: 'bg-amber-500/5', link: '/admin/rekomendasi' },
    { label: 'Event', value: stats.totalKejurda, icon: HiFlag, gradient: 'from-emerald-500 to-green-400', shadowColor: 'shadow-green-500/20', glowColor: 'group-hover:shadow-green-500/30', bgGlow: 'bg-green-500/5', link: '/admin/kompetisi' },
    { label: 'Pendaftaran', value: stats.totalPendaftaran, icon: HiUsers, gradient: 'from-violet-500 to-purple-400', shadowColor: 'shadow-violet-500/20', glowColor: 'group-hover:shadow-violet-500/30', bgGlow: 'bg-violet-500/5', link: '/admin/pendaftaran' },
    { label: 'Users', value: stats.totalUsers, icon: HiUserGroup, gradient: 'from-rose-500 to-pink-400', shadowColor: 'shadow-rose-500/20', glowColor: 'group-hover:shadow-rose-500/30', bgGlow: 'bg-rose-500/5', link: '/admin/users' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header - Glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 sm:p-8"
        style={{ animation: 'dashHeaderIn 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" style={{ animation: 'dashBlobFloat 6s ease-in-out infinite' }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" style={{ animation: 'dashBlobFloat 8s ease-in-out infinite reverse' }} />
        <div className="absolute top-4 right-8 w-20 h-20 bg-white/5 rounded-full blur-xl" style={{ animation: 'dashBlobFloat 5s ease-in-out infinite 1s' }} />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm">
                <HiSparkles className="text-yellow-300" size={13} />
                <span className="text-white/90 text-[11px] font-semibold">Admin Panel</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-sans)' }}>
              Dashboard Overview
            </h1>
            <p className="text-sm text-white/60 mt-1.5 flex items-center gap-2">
              <HiCalendar className="text-white/50" size={15} />
              <span>{today}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <HiLightningBolt className="text-yellow-300" size={16} />
            <span className="text-white/90 text-xs font-semibold">Realtime Data</span>
          </div>
        </div>
      </div>

      {/* Stat Cards - Staggered entrance */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((s, i) => (
          <Link key={i} to={s.link}
            className={`group relative bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-gray-100/80 hover:border-gray-200/80 transition-all duration-500 hover:shadow-2xl ${s.glowColor} hover:-translate-y-1.5 active:scale-[0.97] overflow-hidden`}
            style={{ animation: `dashCardIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both` }}>
            {/* Hover glow */}
            <div className={`absolute inset-0 ${s.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
            
            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} mb-3.5 shadow-lg ${s.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <s.icon className="text-white text-lg" />
              </div>
              <div className="text-2xl sm:text-[30px] font-extrabold text-gray-900 tracking-tight leading-none">
                <AnimatedNumber value={s.value} />
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-gray-400 text-xs font-semibold">{s.label}</span>
                <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400">
                  <HiArrowRight className="text-gray-400 text-xs" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Status Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {[
          { title: 'Status Rekomendasi', icon: HiDocumentText, iconBg: 'from-amber-400 to-orange-500', data: data?.rekomendasiByStatus, link: '/admin/rekomendasi' },
          { title: 'Status Pendaftaran', icon: HiUsers, iconBg: 'from-violet-400 to-purple-500', data: data?.pendaftaranByStatus, link: '/admin/pendaftaran' },
        ].map((section, idx) => {
          const total = (section.data || []).reduce((a, b) => a + b._count, 0);
          return (
            <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100/80 overflow-hidden"
              style={{ animation: `dashCardIn 0.5s cubic-bezier(0.16,1,0.3,1) ${0.4 + idx * 0.1}s both` }}>
              {/* Gradient top line */}
              <div className={`h-[3px] bg-gradient-to-r ${section.iconBg}`} />
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/60">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.iconBg} flex items-center justify-center shadow-sm`}>
                    <section.icon className="text-white" size={17} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{section.title}</h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">Total: {total}</p>
                  </div>
                </div>
                <Link to={section.link} className="text-xs text-gray-400 hover:text-green-600 font-semibold transition-all duration-300 flex items-center gap-0.5 hover:gap-1.5">
                  Semua <HiChevronRight size={12} />
                </Link>
              </div>
              <div className="p-5 space-y-4">
                {(section.data || []).length === 0 ? (
                  <p className="text-gray-300 text-sm text-center py-6">Belum ada data</p>
                ) : (
                  (section.data || []).map((item, i) => {
                    const cfg = statusConfig[item.status] || { label: item.status, color: '#9ca3af', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', ring: 'ring-gray-500/20' };
                    const pct = total > 0 ? (item._count / total) * 100 : 0;
                    return (
                      <div key={i} style={{ animation: `dashBarIn 0.4s ease-out ${0.6 + i * 0.08}s both` }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ring-4 ${cfg.ring}`} />
                            <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-[11px] font-medium">{pct.toFixed(0)}%</span>
                            <span className="text-gray-900 font-extrabold text-sm tabular-nums min-w-[28px] text-right">{item._count}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: cfg.color,
                              animation: `dashBarGrow 1s cubic-bezier(0.16,1,0.3,1) ${0.8 + i * 0.1}s both`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {[
          { title: 'Rekomendasi Terbaru', icon: HiTrendingUp, iconBg: 'from-green-400 to-green-600', data: data?.recentRekomendasi, link: '/admin/rekomendasi', nameKey: 'namaEvent', subKey: (item) => item.user?.name },
          { title: 'Pendaftaran Terbaru', icon: HiUsers, iconBg: 'from-sky-400 to-blue-500', data: data?.recentPendaftaran, link: '/admin/pendaftaran', nameKey: 'namaAtlet', subKey: (item) => item.kejurda?.namaKejurda },
        ].map((section, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100/80 overflow-hidden"
            style={{ animation: `dashCardIn 0.5s cubic-bezier(0.16,1,0.3,1) ${0.6 + idx * 0.1}s both` }}>
            <div className={`h-[3px] bg-gradient-to-r ${section.iconBg}`} />
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/60">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.iconBg} flex items-center justify-center shadow-sm`}>
                  <section.icon className="text-white" size={17} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{section.title}</h3>
              </div>
              <Link to={section.link} className="text-xs text-gray-400 hover:text-green-600 font-semibold transition-all duration-300 flex items-center gap-0.5 hover:gap-1.5">
                Semua <HiChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50/80">
              {(section.data || []).length === 0 ? (
                <p className="text-gray-300 text-sm text-center py-8">Belum ada data</p>
              ) : (
                (section.data || []).map((item, rowIdx) => {
                  const cfg = statusConfig[item.status] || { label: item.status, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
                  return (
                    <div key={item.id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/80 transition-all duration-300 group/row"
                      style={{ animation: `dashRowIn 0.35s ease-out ${0.7 + rowIdx * 0.06}s both` }}>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-xs font-bold shrink-0 group-hover/row:bg-green-50 group-hover/row:text-green-600 transition-colors duration-300">
                          {rowIdx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{item[section.nameKey]}</p>
                          <p className="text-gray-400 text-xs mt-0.5 truncate">{section.subKey(item)}</p>
                        </div>
                      </div>
                      <div className={`ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg} shrink-0 transition-all duration-300 group-hover/row:scale-105`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className={`text-[11px] font-semibold ${cfg.text} whitespace-nowrap`}>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

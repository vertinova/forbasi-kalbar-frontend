import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiDocumentText, HiUsers, HiCheckCircle, HiClock, HiXCircle, HiClipboardCheck, HiArrowRight, HiOfficeBuilding, HiLocationMarker, HiFlag } from 'react-icons/hi';
import api from '../../lib/api';

const statusColor = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  APPROVED_PENGCAB: 'bg-green-50 text-green-700 ring-green-200',
  DISETUJUI: 'bg-green-50 text-green-700 ring-green-200',
  DITOLAK: 'bg-rose-50 text-rose-700 ring-rose-200',
};
const statusLabel = {
  PENDING: 'Menunggu',
  APPROVED_PENGCAB: 'Disetujui Pengcab',
  DISETUJUI: 'Disetujui Pengda',
  DITOLAK: 'Ditolak',
};
const statusDot = {
  PENDING: 'bg-amber-400',
  APPROVED_PENGCAB: 'bg-green-400',
  DISETUJUI: 'bg-green-500',
  DITOLAK: 'bg-rose-400',
};

export default function PengcabDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pengcab-panel/dashboard').then(res => setData(res.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-[3px] border-gray-200" />
        <div className="w-12 h-12 rounded-full border-[3px] border-green-600 border-t-transparent animate-spin absolute inset-0" />
      </div>
    </div>
  );

  const stats = [
    { label: 'Total Rekomendasi', value: data?.totalRekomendasi || 0, icon: HiDocumentText, gradient: 'from-green-500 to-green-600', shadowColor: 'shadow-green-200/50' },
    { label: 'Menunggu', value: data?.pendingRekomendasi || 0, icon: HiClock, gradient: 'from-amber-500 to-amber-600', shadowColor: 'shadow-amber-200/50' },
    { label: 'Disetujui', value: data?.approvedRekomendasi || 0, icon: HiCheckCircle, gradient: 'from-green-500 to-green-600', shadowColor: 'shadow-green-200/50' },
    { label: 'Pendaftaran', value: data?.totalPendaftaran || 0, icon: HiUsers, gradient: 'from-green-600 to-green-700', shadowColor: 'shadow-green-200/50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20 overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <HiOfficeBuilding className="text-2xl sm:text-3xl text-white/90" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-green-200 text-xs sm:text-sm font-medium mb-0.5">Dashboard Pengcab</p>
              <h1 className="text-xl sm:text-2xl font-bold truncate tracking-tight">{user?.pengcab || user?.name}</h1>
              <div className="flex items-center text-green-200/80 text-xs mt-1 gap-1">
                <HiLocationMarker className="flex-shrink-0" />
                <span className="truncate">{user?.pengcab ? user?.name : 'Pengurus Cabang'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} text-white mb-3 shadow-lg ${s.shadowColor}`}>
                <Icon className="text-lg" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/pengcab-panel/rekomendasi"
          className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all active:scale-[0.98]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:bg-green-100 transition-colors" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200/40 flex-shrink-0">
              <HiDocumentText className="text-xl text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">Kelola Rekomendasi</h3>
              <p className="text-xs text-gray-400 mt-0.5">Review & setujui perizinan event</p>
            </div>
            <HiArrowRight className="text-gray-300 text-lg group-hover:text-green-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </Link>
        <Link to="/pengcab-panel/pendaftaran"
          className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all active:scale-[0.98]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:bg-green-100 transition-colors" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-200/40 flex-shrink-0">
              <HiUsers className="text-xl text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">Pendaftaran Kejurda</h3>
              <p className="text-xs text-gray-400 mt-0.5">Kelola pendaftaran anggota</p>
            </div>
            <HiArrowRight className="text-gray-300 text-lg group-hover:text-green-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </Link>
      </div>

      {/* Recent Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Rekomendasi */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 text-sm">Rekomendasi Event Terbaru</h3>
            <Link to="/pengcab-panel/rekomendasi" className="text-xs text-green-600 font-semibold hover:text-green-700">Semua</Link>
          </div>
          {(data?.recentRekomendasi || []).length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <HiDocumentText className="text-xl text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">Belum ada rekomendasi</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(data?.recentRekomendasi || []).map(item => (
                <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[item.status] || 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.namaEvent}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.penyelenggara} · {new Date(item.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ring-1 whitespace-nowrap ${statusColor[item.status]}`}>
                    {statusLabel[item.status] || item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Pendaftaran */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 text-sm">Pendaftaran Terbaru</h3>
            <Link to="/pengcab-panel/pendaftaran" className="text-xs text-green-600 font-semibold hover:text-green-700">Semua</Link>
          </div>
          {(data?.recentPendaftaran || []).length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <HiUsers className="text-xl text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">Belum ada pendaftaran</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(data?.recentPendaftaran || []).map(item => (
                <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[item.status] || 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.namaAtlet}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.kejurda?.namaKejurda}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ring-1 whitespace-nowrap ${statusColor[item.status]}`}>
                    {statusLabel[item.status] || item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

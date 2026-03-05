import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiFlag, HiClock, HiCheckCircle, HiXCircle,
  HiChevronRight, HiLocationMarker, HiUser, HiMail, HiPhone,
  HiClipboardCheck, HiCalendar, HiIdentification, HiDownload, HiExternalLink,
  HiArrowRight, HiSparkles, HiShieldCheck
} from 'react-icons/hi';
import api from '../../lib/api';

const statusConfig = {
  PENDING: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 ring-amber-200', icon: HiClock, dot: 'bg-amber-400' },
  APPROVED_PENGCAB: { label: 'Disetujui Pengcab', color: 'bg-sky-50 text-sky-700 ring-sky-200', icon: HiClipboardCheck, dot: 'bg-sky-400' },
  DISETUJUI: { label: 'Diterima', color: 'bg-green-50 text-green-700 ring-green-200', icon: HiCheckCircle, dot: 'bg-green-500' },
  DITOLAK: { label: 'Ditolak', color: 'bg-rose-50 text-rose-700 ring-rose-200', icon: HiXCircle, dot: 'bg-rose-400' },
};

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ktaData, setKtaData] = useState(null);
  const [ktaLoading, setKtaLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/user-dashboard').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
    api.get('/auth/kta').then(res => setKtaData(res.data)).catch(() => {}).finally(() => setKtaLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-[3px] border-gray-200" />
          <div className="w-12 h-12 rounded-full border-[3px] border-green-600 border-t-transparent animate-spin absolute inset-0" />
        </div>
      </div>
    );
  }

  const profile = data?.userProfile;
  const pendaftaranStats = data?.pendaftaranByStatus || [];
  const getCount = (status) => pendaftaranStats.find(s => s.status === status)?._count || 0;
  const totalPendaftaran = data?.totalPendaftaran || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg shadow-black/10 flex items-center justify-center ring-2 ring-white/30 overflow-hidden flex-shrink-0">
              {(user?.avatar || ktaData?.kta?.[0]?.logo_url) ? (
                <img src={user?.avatar || ktaData?.kta?.[0]?.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <HiUser className="text-3xl sm:text-4xl text-green-600" />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-green-200 text-xs sm:text-sm font-medium mb-0.5">Selamat datang kembali,</p>
              <h1 className="text-xl sm:text-2xl font-bold truncate tracking-tight">{profile?.name || user?.name}</h1>
              <div className="flex items-center text-green-200/80 text-xs sm:text-sm mt-1.5 gap-1">
                <HiLocationMarker className="flex-shrink-0" />
                <span className="truncate">{profile?.pengcab ? `${profile.pengcab.nama} — ${profile.pengcab.kota}` : 'Anggota FORBASI'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-5 pt-4 border-t border-white/15 text-xs text-green-100/80">
            <span className="flex items-center gap-1.5"><HiMail className="opacity-60" /> {profile?.email}</span>
            {profile?.phone && <span className="flex items-center gap-1.5"><HiPhone className="opacity-60" /> {profile.phone}</span>}
          </div>
        </div>
      </div>

      {/* KTA Section */}
      {!ktaLoading && ktaData && ktaData.total_kta > 0 ? (
        <div className="space-y-4">
          {ktaData.kta.map((kta, idx) => (
            <div key={kta.kta_id || idx} className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-teal-500 to-green-600" />
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200/50">
                    <HiIdentification className="text-xl text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">Kartu Tanda Anggota</h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 ${
                        kta.status === 'kta_issued' ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-amber-50 text-amber-700 ring-amber-200'
                      }`}>
                        <HiShieldCheck className="text-xs" /> {kta.status_label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{kta.club_name}</p>
                  </div>
                  {kta.logo_url && (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-gray-100 bg-white shadow-md flex-shrink-0">
                      <img src={kta.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Ketua', value: kta.leader_name },
                    { label: 'Pelatih', value: kta.coach_name },
                    { label: 'Wilayah', value: kta.regency },
                    { label: 'Diterbitkan', value: kta.kta_issued_at ? new Date(kta.kta_issued_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : null },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50/80 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.label}</p>
                      <p className="font-semibold text-gray-700 text-xs mt-0.5 truncate">{item.value || '-'}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  {kta.kta_pdf_url && (
                    <a href={kta.kta_pdf_url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-green-200/50 transition-all active:scale-[0.98]">
                      <HiDownload size={14} /> Download KTA
                    </a>
                  )}
                  {kta.kta_detail_url && (
                    <a href={kta.kta_detail_url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all ring-1 ring-gray-200 active:scale-[0.98]">
                      <HiExternalLink size={14} /> Lihat Detail
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !ktaLoading && ktaData && ktaData.total_kta === 0 && ktaData.kta !== undefined ? (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <HiIdentification className="text-lg text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Belum memiliki KTA</p>
            <p className="text-xs text-gray-400 mt-0.5">Hubungi pengurus cabang untuk informasi pendaftaran KTA</p>
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/dashboard/kejurda"
          className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all active:scale-[0.98]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:bg-green-100 transition-colors" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200/40 flex-shrink-0">
              <HiFlag className="text-xl text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">Kompetisi</h3>
              <p className="text-xs text-gray-400 mt-0.5">Temukan & daftar kompetisi terbuka</p>
            </div>
            <HiArrowRight className="text-gray-300 text-lg group-hover:text-green-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </Link>
        <Link to="/dashboard/pendaftaran"
          className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all active:scale-[0.98]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:bg-sky-100 transition-colors" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200/40 flex-shrink-0">
              <HiClipboardCheck className="text-xl text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">Riwayat Kompetisi</h3>
              <p className="text-xs text-gray-400 mt-0.5">Lacak status pendaftaran event</p>
            </div>
            <HiArrowRight className="text-gray-300 text-lg group-hover:text-sky-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Status Pendaftaran</h2>
          <span className="text-xs text-gray-400 font-medium">Total: {totalPendaftaran}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { status: 'PENDING', label: 'Menunggu' },
            { status: 'APPROVED_PENGCAB', label: 'Diproses' },
            { status: 'DISETUJUI', label: 'Diterima' },
            { status: 'DITOLAK', label: 'Ditolak' },
          ].map(({ status, label }) => {
            const cfg = statusConfig[status];
            const Icon = cfg.icon;
            const count = getCount(status);
            return (
              <div key={status} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.color.split(' ')[0]}`}>
                    <Icon className={`text-base ${cfg.color.split(' ')[1]}`} />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{count}</p>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5">{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Open Events */}
      {data?.openKejurda?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Kompetisi Tersedia</h2>
            <Link to="/dashboard/kejurda" className="text-xs text-green-600 font-semibold hover:text-green-700 flex items-center gap-0.5">
              Lihat Semua <HiChevronRight className="text-sm" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.openKejurda.map(kj => (
              <Link key={kj.id} to="/dashboard/kejurda"
                className="group flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all active:scale-[0.99]">
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                  <HiFlag className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{kj.namaKejurda}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><HiCalendar className="text-gray-300" />{new Date(kj.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><HiLocationMarker className="text-gray-300" />{kj.lokasi}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-600 ring-1 ring-green-200 flex-shrink-0">
                  <HiSparkles className="text-xs" /> Buka
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Pendaftaran */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Pendaftaran Terakhir</h2>
          {(data?.recentPendaftaran || []).length > 0 && (
            <Link to="/dashboard/pendaftaran" className="text-xs text-green-600 font-semibold hover:text-green-700 flex items-center gap-0.5">
              Semua <HiChevronRight className="text-sm" />
            </Link>
          )}
        </div>
        {(data?.recentPendaftaran || []).length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiClipboardCheck className="text-3xl text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">Belum ada pendaftaran</p>
            <p className="text-gray-400 text-xs mt-1">Mulai dengan mendaftar di event kejurda yang tersedia</p>
            <Link to="/dashboard/kejurda" className="inline-flex items-center gap-1.5 mt-4 text-green-600 font-semibold text-sm hover:text-green-700">
              <HiFlag className="text-base" /> Cari Event <HiArrowRight className="text-sm" />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {data.recentPendaftaran.map((item) => {
              const cfg = statusConfig[item.status] || statusConfig.PENDING;
              return (
                <Link key={item.id} to="/dashboard/pendaftaran"
                  className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{item.kejurda?.namaKejurda || 'Kejurda'}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.kejurda?.lokasi && <>{item.kejurda.lokasi} · </>}
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ring-1 whitespace-nowrap ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

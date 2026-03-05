import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiCalendar, HiClipboardList, HiArrowRight, HiGlobe, HiLocationMarker, HiClock, HiCheckCircle, HiExclamationCircle, HiUserGroup } from 'react-icons/hi';
import api from '../../lib/api';

export default function UmumDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalEventUmum: 0, totalPendaftaran: 0, pendingPendaftaran: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentPendaftaran, setRecentPendaftaran] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch public events (UMUM)
        const eventsRes = await api.get('/kejurda/open');
        const umumEvents = eventsRes.data.filter(e =>
          e.targetPeserta === 'UMUM' && new Date(e.tanggalMulai) >= new Date()
        );
        setUpcomingEvents(umumEvents.slice(0, 3));
        setStats(prev => ({ ...prev, totalEventUmum: umumEvents.length }));

        // Fetch user's pendaftaran
        const pendaftaranRes = await api.get('/pendaftaran');
        const myPendaftaran = pendaftaranRes.data || [];
        setRecentPendaftaran(myPendaftaran.slice(0, 5));
        setStats(prev => ({
          ...prev,
          totalPendaftaran: myPendaftaran.length,
          pendingPendaftaran: myPendaftaran.filter(p => p.status === 'PENDING').length
        }));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700',
      DISETUJUI: 'bg-green-100 text-green-700',
      DITOLAK: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
              👋 Selamat Datang
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Halo, {user?.name || 'Pengguna'}!</h1>
          <p className="text-blue-100 text-sm lg:text-base">
            Selamat datang di FORBASI Kalimantan Barat. Temukan dan ikuti berbagai event baris berbaris yang terbuka untuk umum.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <HiCalendar className="text-blue-600" size={22} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.totalEventUmum}</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Event Tersedia</p>
          <p className="text-xs text-gray-400 mt-1">Event terbuka untuk umum</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
              <HiClipboardList className="text-green-600" size={22} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.totalPendaftaran}</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Pendaftaran</p>
          <p className="text-xs text-gray-400 mt-1">Event yang Anda ikuti</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
              <HiClock className="text-amber-600" size={22} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.pendingPendaftaran}</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Menunggu Konfirmasi</p>
          <p className="text-xs text-gray-400 mt-1">Pendaftaran dalam proses</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiGlobe className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Event Publik Terbaru</h2>
                <p className="text-xs text-gray-400">Event yang bisa Anda ikuti</p>
              </div>
            </div>
            <Link to="/umum/event" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              Lihat Semua <HiArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <HiCalendar className="text-white" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{event.namaKejurda}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <HiLocationMarker className="text-gray-400" size={12} />
                        <span className="truncate">{event.lokasi || 'Lokasi belum ditentukan'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <HiClock className="text-gray-400" size={12} />
                        <span>{formatDate(event.tanggalMulai)}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">
                      UMUM
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <HiCalendar className="text-gray-400" size={28} />
                </div>
                <p className="text-gray-500 text-sm">Belum ada event publik tersedia</p>
                <p className="text-gray-400 text-xs mt-1">Event baru akan segera hadir</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Pendaftaran */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiClipboardList className="text-green-600" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Pendaftaran Terakhir</h2>
                <p className="text-xs text-gray-400">Status pendaftaran Anda</p>
              </div>
            </div>
            <Link to="/umum/riwayat" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              Lihat Semua <HiArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentPendaftaran.length > 0 ? (
              recentPendaftaran.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.status === 'DISETUJUI' ? 'bg-green-100' : item.status === 'DITOLAK' ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                        {item.status === 'DISETUJUI' ? (
                          <HiCheckCircle className="text-green-600" size={20} />
                        ) : item.status === 'DITOLAK' ? (
                          <HiExclamationCircle className="text-red-600" size={20} />
                        ) : (
                          <HiClock className="text-amber-600" size={20} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{item.kejurda?.namaKejurda || 'Event'}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <HiClipboardList className="text-gray-400" size={28} />
                </div>
                <p className="text-gray-500 text-sm">Belum ada pendaftaran</p>
                <Link to="/umum/event" className="text-blue-600 hover:underline text-xs mt-1 inline-block">
                  Lihat event yang tersedia →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/umum/event" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <HiGlobe className="text-blue-600 group-hover:text-white transition-colors" size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Cari Event</p>
              <p className="text-xs text-slate-400">Temukan event publik</p>
            </div>
          </Link>

          <Link to="/umum/riwayat" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors">
              <HiClipboardList className="text-green-600 group-hover:text-white transition-colors" size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Riwayat</p>
              <p className="text-xs text-slate-400">Lihat pendaftaran</p>
            </div>
          </Link>

          <Link to="/umum/profil" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
              <HiUserGroup className="text-violet-600 group-hover:text-white transition-colors" size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Profil Saya</p>
              <p className="text-xs text-slate-400">Kelola akun</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

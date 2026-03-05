import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';
import PengcabLayout from './components/PengcabLayout';
import PenyelenggaraLayout from './components/PenyelenggaraLayout';
import UmumLayout from './components/UmumLayout';
import VersionChecker from './components/VersionChecker';

// Lazy-loaded pages — only downloaded when navigated to
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PengcabPage = lazy(() => import('./pages/PengcabPage'));
const KejurdaPage = lazy(() => import('./pages/KejurdaPage'));
const RekomendasiPage = lazy(() => import('./pages/RekomendasiPage'));

const UserDashboardPage = lazy(() => import('./pages/user/UserDashboardPage'));
const UserKejurdaPage = lazy(() => import('./pages/user/UserKejurdaPage'));
const UserPendaftaranPage = lazy(() => import('./pages/user/UserPendaftaranPage'));
const UserProfilPage = lazy(() => import('./pages/user/UserProfilPage'));

const UmumDashboardPage = lazy(() => import('./pages/umum/UmumDashboardPage'));
const UmumEventPage = lazy(() => import('./pages/umum/UmumEventPage'));
const UmumRiwayatPage = lazy(() => import('./pages/umum/UmumRiwayatPage'));
const UmumProfilPage = lazy(() => import('./pages/umum/UmumProfilPage'));

const PenyelenggaraDashboardPage = lazy(() => import('./pages/penyelenggara/PenyelenggaraDashboardPage'));
const PenyelenggaraAjukanPage = lazy(() => import('./pages/penyelenggara/PenyelenggaraAjukanPage'));
const PenyelenggaraRiwayatPage = lazy(() => import('./pages/penyelenggara/PenyelenggaraRiwayatPage'));
const PenyelenggaraProfilPage = lazy(() => import('./pages/penyelenggara/PenyelenggaraProfilPage'));

const PengcabDashboardPage = lazy(() => import('./pages/pengcab/PengcabDashboardPage'));
const PengcabRekomendasiPage = lazy(() => import('./pages/pengcab/PengcabRekomendasiPage'));
const PengcabPendaftaranPage = lazy(() => import('./pages/pengcab/PengcabPendaftaranPage'));
const PengcabAnggotaPage = lazy(() => import('./pages/pengcab/PengcabAnggotaPage'));
const PengcabKejurcabPage = lazy(() => import('./pages/pengcab/PengcabKejurcabPage'));
const PengcabProfilPage = lazy(() => import('./pages/pengcab/PengcabProfilPage'));

const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminPengcabPage = lazy(() => import('./pages/admin/AdminPengcabPage'));
const AdminRekomendasiPage = lazy(() => import('./pages/admin/AdminRekomendasiPage'));
const AdminKejurdaPage = lazy(() => import('./pages/admin/AdminKejurdaPage'));
const AdminPendaftaranPage = lazy(() => import('./pages/admin/AdminPendaftaranPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminProfilPage = lazy(() => import('./pages/admin/AdminProfilPage'));
const AdminLandingPage = lazy(() => import('./pages/admin/AdminLandingPage'));
const AdminScanPage = lazy(() => import('./pages/admin/AdminScanPage'));
const AdminFormatDokumenPage = lazy(() => import('./pages/admin/AdminFormatDokumenPage'));
const AdminSuratConfigPage = lazy(() => import('./pages/admin/AdminSuratConfigPage'));

// Minimal loading spinner for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="relative">
      <div className="w-10 h-10 rounded-full border-[3px] border-gray-200" />
      <div className="w-10 h-10 rounded-full border-[3px] border-amber-500 border-t-transparent animate-spin absolute inset-0" />
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <VersionChecker />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pengcab" element={<PengcabPage />} />
            <Route path="/kejurda" element={<KejurdaPage />} />
            <Route path="/rekomendasi" element={
              <PrivateRoute><RekomendasiPage /></PrivateRoute>
            } />
          </Route>

          {/* User Dashboard routes (Anggota FORBASI - mengikuti event) */}
          <Route path="/dashboard" element={
            <PrivateRoute userOnly><UserLayout /></PrivateRoute>
          }>
            <Route index element={<UserDashboardPage />} />
            <Route path="kejurda" element={<UserKejurdaPage />} />
            <Route path="pendaftaran" element={<UserPendaftaranPage />} />
            <Route path="profil" element={<UserProfilPage />} />
          </Route>

          {/* Umum Dashboard routes (Pengguna Umum - event publik) */}
          <Route path="/umum" element={
            <PrivateRoute umumOnly><UmumLayout /></PrivateRoute>
          }>
            <Route index element={<UmumDashboardPage />} />
            <Route path="event" element={<UmumEventPage />} />
            <Route path="riwayat" element={<UmumRiwayatPage />} />
            <Route path="profil" element={<UmumProfilPage />} />
          </Route>

          {/* Penyelenggara routes (mengajukan perizinan event) */}
          <Route path="/penyelenggara" element={
            <PrivateRoute penyelenggaraOnly><PenyelenggaraLayout /></PrivateRoute>
          }>
            <Route index element={<PenyelenggaraDashboardPage />} />
            <Route path="ajukan" element={<PenyelenggaraAjukanPage />} />
            <Route path="edit/:id" element={<PenyelenggaraAjukanPage />} />
            <Route path="riwayat" element={<PenyelenggaraRiwayatPage />} />
            <Route path="profil" element={<PenyelenggaraProfilPage />} />
          </Route>

          {/* Pengcab Panel routes with PengcabLayout */}
          <Route path="/pengcab-panel" element={
            <PrivateRoute pengcabOnly><PengcabLayout /></PrivateRoute>
          }>
            <Route index element={<PengcabDashboardPage />} />
            <Route path="rekomendasi" element={<PengcabRekomendasiPage />} />
            <Route path="kejurcab" element={<PengcabKejurcabPage />} />
            <Route path="pendaftaran" element={<PengcabPendaftaranPage />} />
            <Route path="anggota" element={<PengcabAnggotaPage />} />
            <Route path="profil" element={<PengcabProfilPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly><AdminLayout /></PrivateRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="pengcab" element={<AdminPengcabPage />} />
            <Route path="rekomendasi" element={<AdminRekomendasiPage />} />
            <Route path="kejurda" element={<AdminKejurdaPage />} />
            <Route path="kompetisi" element={<AdminKejurdaPage />} />
            <Route path="pendaftaran" element={<AdminPendaftaranPage />} />
            <Route path="scan" element={<AdminScanPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="landing" element={<AdminLandingPage />} />
            <Route path="format-dokumen" element={<AdminFormatDokumenPage />} />
            <Route path="surat-config" element={<AdminSuratConfigPage />} />
            <Route path="profil" element={<AdminProfilPage />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

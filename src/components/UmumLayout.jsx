import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiHome, HiCalendar, HiClipboardList, HiLogout, HiUser, HiMenu, HiX, HiChevronRight } from 'react-icons/hi';

const menuItems = [
  { path: '/umum', label: 'Dashboard', icon: HiHome },
  { path: '/umum/event', label: 'Event Publik', icon: HiCalendar },
  { path: '/umum/riwayat', label: 'Riwayat Pendaftaran', icon: HiClipboardList },
  { path: '/umum/profil', label: 'Profil', icon: HiUser },
];

export default function UmumLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 lg:p-6">
        <Link to="/umum" className="flex items-center gap-3" onClick={() => mobile && setSidebarOpen(false)}>
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20 flex-shrink-0">
            <img src="/LOGO-FORBASI.png" alt="FORBASI" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-gray-900 font-bold text-sm tracking-tight">FORBASI Kalbar</h1>
            <p className="text-gray-400 text-[10px] font-medium">Dashboard Umum</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="px-3 mb-2">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-3 mb-2">Menu</p>
      </div>
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`text-lg flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && <HiChevronRight className="text-white/60 text-sm flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* User info & Logout */}
      <div className="p-4 mt-auto">
        {/* User Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-800 font-semibold text-xs truncate">{user?.name || 'User'}</p>
              <p className="text-blue-600 text-[10px] font-medium">Pengguna Umum</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-3" />
        <button onClick={logout}
          className="w-full flex items-center gap-3 text-gray-400 hover:text-rose-600 text-[13px] font-medium px-3 py-2.5 rounded-xl hover:bg-rose-50 transition-all duration-200">
          <HiLogout className="text-lg flex-shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-[260px] bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        <button onClick={() => setSidebarOpen(false)} className="absolute top-5 right-4 text-gray-400 hover:text-gray-600 lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <HiX size={20} />
        </button>
        <SidebarContent mobile />
      </aside>

      {/* Main content */}
      <div className="lg:ml-[260px] min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 lg:hidden">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-900 p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <HiMenu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">F</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">FORBASI Kalbar</span>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-700 font-bold text-xs">{user?.name?.charAt(0) || 'U'}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

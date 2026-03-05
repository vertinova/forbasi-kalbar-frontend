import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiHome, HiFlag, HiClipboardList, HiUser } from 'react-icons/hi';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiHome },
  { path: '/dashboard/kejurda', label: 'Event', icon: HiFlag },
  { path: '/dashboard/pendaftaran', label: 'Riwayat', icon: HiClipboardList },
  { path: '/dashboard/profil', label: 'Profil', icon: HiUser },
];

export default function UserLayout() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Desktop top navigation */}
      <div className="hidden md:block sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-green-600/10 flex-shrink-0">
              <img src="/LOGO-FORBASI.png" alt="FORBASI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-sm tracking-tight">FORBASI Kalbar</h1>
              <p className="text-gray-400 text-[10px] font-medium">Dashboard Anggota</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <Icon className={`text-base ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <Link to="/dashboard/profil" className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center overflow-hidden shadow-md shadow-green-600/20">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xs">{user?.name?.charAt(0)?.toUpperCase()}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">F</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">FORBASI Kalbar</span>
          </Link>
          <Link to="/dashboard/profil" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-600 text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 md:hidden safe-area-bottom">
        <div className="flex justify-around items-center py-1.5 max-w-lg mx-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-green-600' : 'text-gray-400'
                }`}>
                <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-green-50' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] mt-0.5 font-semibold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

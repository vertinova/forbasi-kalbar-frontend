import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiHome, HiDocumentAdd, HiClipboardList, HiUser } from 'react-icons/hi';

const menuItems = [
  { path: '/penyelenggara', label: 'Dashboard', icon: HiHome },
  { path: '/penyelenggara/ajukan', label: 'Ajukan', icon: HiDocumentAdd },
  { path: '/penyelenggara/riwayat', label: 'Riwayat', icon: HiClipboardList },
  { path: '/penyelenggara/profil', label: 'Profil', icon: HiUser },
];

export default function PenyelenggaraLayout() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Desktop top navigation */}
      <div className="hidden md:block sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/penyelenggara" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-amber-600/10 flex-shrink-0">
              <img src="/LOGO-FORBASI.png" alt="FORBASI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-sm tracking-tight">FORBASI Kalbar</h1>
              <p className="text-gray-400 text-[10px] font-medium">Panel Penyelenggara</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}>
                  <Icon className={`text-base ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-200/40 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/penyelenggara" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
              <img src="/LOGO-FORBASI.png" alt="FORBASI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-[13px] leading-tight">Penyelenggara</h1>
              <p className="text-gray-400 text-[9px] font-medium">FORBASI Kalbar</p>
            </div>
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[10px] font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-16 px-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[60px] ${
                  isActive
                    ? 'text-amber-600'
                    : 'text-gray-400 active:text-gray-600'
                }`}>
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-amber-50 shadow-sm shadow-amber-100' : ''}`}>
                  <Icon className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? 'text-amber-700' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
        {/* Safe area for notch phones */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}

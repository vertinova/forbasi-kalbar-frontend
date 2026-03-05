import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  HiMenu, HiX, HiLogout, HiChevronDown, HiChevronLeft, HiChevronRight
} from 'react-icons/hi';
import {
  LuLayoutDashboard, LuBuilding2, LuFileCheck2, LuTrophy,
  LuClipboardList, LuUsers, LuUserCog, LuGlobe, LuScanLine, LuFileDown, LuStamp
} from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: LuLayoutDashboard, exact: true },
  {
    label: 'Manajemen', type: 'group', items: [
      { path: '/admin/pengcab', label: 'Pengurus Cabang', icon: LuBuilding2 },
      { path: '/admin/rekomendasi', label: 'Rekomendasi', icon: LuFileCheck2 },
      { path: '/admin/kompetisi', label: 'Event & Kegiatan', icon: LuTrophy },
      { path: '/admin/pendaftaran', label: 'Pendaftaran', icon: LuClipboardList },
      { path: '/admin/scan', label: 'Scanner QR', icon: LuScanLine },
    ]
  },
  {
    label: 'Pengaturan', type: 'group', items: [
      { path: '/admin/users', label: 'Users', icon: LuUsers },
      { path: '/admin/landing', label: 'Landing Page', icon: LuGlobe },
      { path: '/admin/format-dokumen', label: 'Format Dokumen', icon: LuFileDown },
      { path: '/admin/surat-config', label: 'Config Surat', icon: LuStamp },
      { path: '/admin/profil', label: 'Profil', icon: LuUserCog },
    ]
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop
  const [collapsed, setCollapsed] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const checkActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);
  const toggleGroup = (label) => setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  const NavLink = ({ item, mobile, isCollapsed, index = 0 }) => {
    const Icon = item.icon;
    const active = checkActive(item.path, item.exact);
    return (
      <Link to={item.path} onClick={() => mobile && setSidebarOpen(false)}
        title={isCollapsed ? item.label : ''}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-green-50 to-emerald-50/50 text-green-700'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80'
        } ${isCollapsed ? 'justify-center' : ''}`}
        style={mounted ? { animation: `sidebarItemIn 0.3s ease-out ${index * 0.03}s both` } : {}}>
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-green-500 to-emerald-500 rounded-r-full shadow-sm shadow-green-500/30" />
        )}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ${
          active
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/25'
            : 'bg-gray-100/80 text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-200/70 group-hover:scale-105'
        }`}>
          <Icon size={16} />
        </div>
        {!isCollapsed && (
          <span className="flex-1 truncate">{item.label}</span>
        )}
        {!isCollapsed && active && (
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        )}
      </Link>
    );
  };

  const SidebarContent = ({ mobile = false, isCollapsed = false }) => {
    let itemIndex = 0;
    return (
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className={`pt-7 pb-5 transition-all duration-300 ${isCollapsed ? 'px-3' : 'px-5'}`}>
          <Link to="/admin" className="flex items-center gap-3 group" onClick={() => mobile && setSidebarOpen(false)}>
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 flex-shrink-0 flex items-center justify-center ring-1 ring-green-200/50 shadow-sm transition-all group-hover:shadow-md group-hover:shadow-green-500/10 group-hover:scale-105">
              <img src="/LOGO-FORBASI.png" alt="FORBASI" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-gray-900 font-bold text-[15px] tracking-tight leading-tight">FORBASI</h1>
                <p className="text-gray-400 text-[11px] font-medium">Pengda Kalimantan Barat</p>
              </div>
            )}
          </Link>
        </div>

        <div className={`mb-4 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent ${isCollapsed ? 'mx-3' : 'mx-5'}`} />

        {/* Navigation */}
        <nav className={`flex-1 space-y-1 overflow-y-auto scrollbar-thin ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {menuItems.map((item, idx) => {
            if (item.type === 'group') {
              const isGroupCollapsed = collapsed[item.label];
              const hasActive = item.items.some(sub => checkActive(sub.path));
              return (
                <div key={idx} className="mt-5 first:mt-0">
                  {!isCollapsed && (
                    <button onClick={() => toggleGroup(item.label)}
                      className="w-full flex items-center justify-between px-3 py-1.5 mb-1.5 group/grp">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
                        hasActive ? 'text-green-600' : 'text-gray-400 group-hover/grp:text-gray-500'
                      }`}>{item.label}</span>
                      <HiChevronDown className={`text-gray-300 text-xs transition-transform duration-300 ${isGroupCollapsed ? '-rotate-90' : ''}`} />
                    </button>
                  )}
                  {isCollapsed && <div className="my-2 mx-2 h-px bg-gray-100" />}
                  <div className={`space-y-0.5 transition-all duration-300 ${!isCollapsed && isGroupCollapsed ? 'hidden' : ''}`}>
                    {item.items.map(sub => {
                      const ci = itemIndex++;
                      return <NavLink key={sub.path} item={sub} mobile={mobile} isCollapsed={isCollapsed} index={ci} />;
                    })}
                  </div>
                </div>
              );
            }
            const ci = itemIndex++;
            return <NavLink key={item.path} item={item} mobile={mobile} isCollapsed={isCollapsed} index={ci} />;
          })}
        </nav>

        {/* User card + Logout */}
        <div className={`p-4 mt-auto ${isCollapsed ? 'px-2' : ''}`}>
          {!isCollapsed && <div className="mx-1 mb-3 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />}
          
          {/* User info */}
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-gray-50/80">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center overflow-hidden shadow-sm shadow-green-500/20 shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-xs">{user?.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-gray-800 text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-gray-400 text-[10px] font-medium truncate">{user?.role}</p>
              </div>
            </div>
          )}
          
          <button onClick={logout} title={isCollapsed ? 'Keluar' : ''}
            className={`w-full flex items-center gap-3 text-gray-400 hover:text-rose-500 text-[13px] font-medium px-3 py-2.5 rounded-xl hover:bg-rose-50/80 transition-all duration-300 group ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-rose-100 group-hover:text-rose-500 transition-all duration-300 group-hover:rotate-12 shrink-0">
              <HiLogout size={15} />
            </div>
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </div>
    );
  };

  const sidebarWidth = sidebarCollapsed ? 'w-[72px]' : 'w-[264px]';
  const mainMargin = sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[264px]';

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} 
          style={{ animation: 'fadeIn 0.2s ease-out' }} />
      )}

      {/* Desktop Sidebar */}
      <aside className={`fixed top-0 left-0 h-full ${sidebarWidth} bg-white/85 backdrop-blur-2xl border-r border-gray-200/50 z-50 transform transition-all duration-300 ease-out hidden lg:block shadow-[2px_0_30px_-4px_rgba(0,0,0,0.07)]`}>
        {/* Collapse toggle button */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3.5 top-20 w-7 h-7 rounded-full bg-white border border-gray-200/80 text-gray-400 flex items-center justify-center hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all duration-300 shadow-md z-20 hover:scale-110"
        >
          {sidebarCollapsed ? <HiChevronRight size={14} /> : <HiChevronLeft size={14} />}
        </button>
        
        <SidebarContent isCollapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-[280px] bg-white/95 backdrop-blur-2xl border-r border-gray-200/50 z-50 transform transition-transform duration-300 ease-out shadow-2xl lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button onClick={() => setSidebarOpen(false)} className="absolute top-5 right-3 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:rotate-90 z-10">
          <HiX size={18} />
        </button>
        <SidebarContent mobile />
      </aside>

      <div className={`${mainMargin} min-h-screen flex flex-col transition-all duration-300`}>
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 lg:hidden">
          <div className="flex items-center justify-between px-4 h-[60px]">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-700 hover:text-gray-900 p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95">
              <HiMenu size={22} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src="/LOGO-FORBASI.png" alt="FORBASI" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-gray-900 text-sm tracking-tight">FORBASI</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center overflow-hidden shadow-md shadow-green-500/20">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">{user?.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

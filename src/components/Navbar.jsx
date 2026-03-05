import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HiMenu, HiX, HiLogout, HiLogin, HiUserAdd,
  HiHome, HiCalendar, HiGlobe, HiOfficeBuilding,
  HiNewspaper, HiChatAlt2, HiViewGrid, HiFlag,
  HiDocumentText, HiChevronRight, HiUserGroup,
} from 'react-icons/hi';

/* ── Landing page section nav ── */
const landingSections = [
  { id: 'hero', label: 'Beranda', icon: HiHome },
  { id: 'events', label: 'Event', icon: HiCalendar },
  { id: 'map', label: 'Peta', icon: HiGlobe },
  { id: 'anggota', label: 'Anggota', icon: HiUserGroup },
  { id: 'struktur', label: 'Organisasi', icon: HiOfficeBuilding },
  { id: 'berita', label: 'Berita', icon: HiNewspaper },
  { id: 'feedback', label: 'Kontak', icon: HiChatAlt2 },
];

export default function Navbar() {
  const { user, logout, isAdmin, isPengcab } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const location = useLocation();
  const isLanding = location.pathname === '/';

  /* close mobile on route change */
  useEffect(() => { setOpen(false); }, [location.pathname]);

  /* lock body when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* track scroll position */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* track active section on landing via IntersectionObserver */
  useEffect(() => {
    if (!isLanding) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { threshold: 0.15, rootMargin: '-70px 0px -35% 0px' }
    );
    const timer = setTimeout(() => {
      landingSections.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
      });
    }, 400);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [isLanding]);

  /* smooth scroll to section */
  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setOpen(false);
    }
  }, []);

  /* page nav items (non-landing) */
  const pageNavItems = [
    { to: '/', label: 'Beranda', icon: HiHome },
    { to: '/pengcab', label: 'Pengcab', icon: HiOfficeBuilding },
    { to: '/kejurda', label: 'Event', icon: HiFlag },
    ...(user && !isAdmin && !isPengcab ? [{ to: '/dashboard', label: 'Dashboard', icon: HiViewGrid }] : []),
    ...(isPengcab ? [{ to: '/pengcab-panel', label: 'Panel Pengcab', icon: HiOfficeBuilding }] : []),
    ...(user ? [{ to: '/rekomendasi', label: 'Rekomendasi', icon: HiDocumentText }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Panel', icon: HiViewGrid }] : []),
  ];

  const isActive = (path) => location.pathname === path;
  const transparent = isLanding && !scrolled;

  return (
    <>
      {/* ─── Main Navbar ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          transparent
            ? 'bg-transparent'
            : 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_24px_rgba(0,0,0,0.06)] border-b border-gray-200/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2.5 group relative z-10">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex-shrink-0 ring-1 transition-all ${
                transparent ? 'ring-white/20 shadow-lg shadow-white/5' : 'ring-gray-200/60 shadow-lg shadow-green-600/10'
              }`}>
                <img src="/LOGO-FORBASI.png" alt="FORBASI" className="w-full h-full object-contain bg-white/95" />
              </div>
              <div className="hidden sm:block">
                <span className={`font-bold text-[17px] tracking-tight transition-colors duration-300 ${
                  transparent ? 'text-white' : 'text-gray-900'
                }`}>FORBASI</span>
                <span className={`text-[10px] block -mt-0.5 font-medium transition-colors duration-300 ${
                  transparent ? 'text-white/50' : 'text-gray-400'
                }`}>Pengda Kalimantan Barat</span>
              </div>
            </Link>

            {/* ── Desktop Navigation ── */}
            <div className="hidden lg:flex items-center gap-0.5">
              {isLanding ? (
                /* section-based scroll nav */
                landingSections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`relative px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 cursor-pointer ${
                      activeSection === s.id
                        ? transparent
                          ? 'text-white bg-white/[0.12] backdrop-blur-sm'
                          : 'text-green-700 bg-green-50/80'
                        : transparent
                          ? 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                    {activeSection === s.id && (
                      <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full transition-colors ${
                        transparent ? 'bg-white/80' : 'bg-green-500'
                      }`} />
                    )}
                  </button>
                ))
              ) : (
                /* page-based nav */
                pageNavItems.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                      isActive(item.to)
                        ? 'text-green-700 bg-green-50/80'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                    {isActive(item.to) && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-green-500 rounded-full" />
                    )}
                  </Link>
                ))
              )}

              {/* divider */}
              <div className={`w-px h-5 mx-2.5 transition-colors ${transparent ? 'bg-white/15' : 'bg-gray-200'}`} />

              {/* auth area */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
                    transparent ? 'bg-white/[0.08] backdrop-blur-sm border border-white/10' : 'bg-gray-50 border border-gray-100'
                  }`}>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-[11px]">{user.name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <span className={`text-[13px] font-semibold max-w-[100px] truncate transition-colors ${
                      transparent ? 'text-white/90' : 'text-gray-700'
                    }`}>{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className={`p-2 rounded-lg transition-all ${
                      transparent ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                    title="Logout"
                  >
                    <HiLogout size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                    transparent ? 'text-white/70 hover:text-white hover:bg-white/[0.08]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                    Masuk
                  </Link>
                  <Link to="/register" className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                    transparent
                      ? 'bg-white/[0.12] backdrop-blur-sm hover:bg-white/[0.2] text-white border border-white/15'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/15'
                  }`}>
                    Daftar
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                transparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setOpen(!open)}
            >
              {open ? <HiX size={22} /> : <HiMenu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Overlay ─── */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* ─── Mobile Slide-out Panel ─── */}
      <div className={`fixed top-0 right-0 h-full w-[300px] sm:w-[340px] bg-white z-50 transform transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden shadow-2xl ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                <img src="/LOGO-FORBASI.png" alt="FORBASI" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-gray-900 font-bold text-sm">FORBASI Kalbar</span>
                <span className="text-gray-400 text-[10px] block -mt-0.5 font-medium">Pengda Kalimantan Barat</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <HiX size={18} />
            </button>
          </div>

          {/* user card */}
          {user && (
            <div className="mx-4 mt-4 p-3.5 rounded-xl bg-gradient-to-br from-green-50 to-green-50 border border-green-100/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md shadow-green-600/15">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">{user.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-gray-900 font-bold text-sm truncate">{user.name}</p>
                  <p className="text-gray-500 text-[11px] truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* nav items */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-3 mb-2">
              {isLanding ? 'Navigasi' : 'Menu'}
            </p>

            {isLanding ? (
              landingSections.map((section, idx) => {
                const Icon = section.icon;
                const active = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    className={`animate-slideUp w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      active
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/20 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <Icon size={16} className={active ? 'text-white' : 'text-gray-400'} />
                    </div>
                    <span className="flex-1 text-left">{section.label}</span>
                    <HiChevronRight size={14} className={active ? 'text-white/60' : 'text-gray-300'} />
                  </button>
                );
              })
            ) : (
              pageNavItems.map((item, idx) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    className={`animate-slideUp flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      active
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/20 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <Icon size={16} className={active ? 'text-white' : 'text-gray-400'} />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    <HiChevronRight size={14} className={active ? 'text-white/60' : 'text-gray-300'} />
                  </Link>
                );
              })
            )}
          </nav>

          {/* bottom actions */}
          <div className="px-4 py-4 border-t border-gray-100">
            {user ? (
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 py-3 rounded-xl text-sm font-semibold transition-all border border-gray-100 hover:border-red-100"
              >
                <HiLogout size={16} />
                <span>Keluar</span>
              </button>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-600/15">
                  <HiLogin size={16} /> <span>Masuk</span>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-all border border-gray-100">
                  <HiUserAdd size={16} /> <span>Daftar Akun</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

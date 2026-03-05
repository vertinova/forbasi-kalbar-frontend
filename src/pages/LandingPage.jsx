import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, useRef } from 'react';
import {
  HiOfficeBuilding, HiUserGroup, HiChevronRight, HiChevronLeft,
  HiShieldCheck, HiGlobe, HiCalendar, HiLocationMarker,
  HiMail, HiPhone, HiChatAlt2, HiPaperAirplane,
  HiX, HiUser, HiChevronDown, HiArrowRight, HiNewspaper,
  HiAcademicCap, HiSearch, HiPlay, HiCheckCircle,
  HiShoppingBag, HiExternalLink,
} from 'react-icons/hi';
import api, { getUploadUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ── Kalimantan Barat City Coordinates ──
const KALBAR_COORDS = {
  'Kota Pontianak': [-0.0263, 109.3425],
  'Pontianak': [-0.0263, 109.3425],
  'Kota Singkawang': [0.9048, 108.9872],
  'Singkawang': [0.9048, 108.9872],
  'Kabupaten Bengkayang': [0.8333, 109.5833],
  'Bengkayang': [0.8333, 109.5833],
  'Kabupaten Kapuas Hulu': [0.9167, 112.9333],
  'Kapuas Hulu': [0.9167, 112.9333],
  'Kabupaten Kayong Utara': [-1.5167, 109.9500],
  'Kayong Utara': [-1.5167, 109.9500],
  'Kabupaten Ketapang': [-1.8333, 109.9833],
  'Ketapang': [-1.8333, 109.9833],
  'Kabupaten Kubu Raya': [-0.1833, 109.4167],
  'Kubu Raya': [-0.1833, 109.4167],
  'Kabupaten Landak': [0.3000, 109.7500],
  'Landak': [0.3000, 109.7500],
  'Kabupaten Melawi': [-0.2833, 111.4500],
  'Melawi': [-0.2833, 111.4500],
  'Kabupaten Mempawah': [0.3500, 109.0833],
  'Mempawah': [0.3500, 109.0833],
  'Kabupaten Sambas': [1.3500, 109.3000],
  'Sambas': [1.3500, 109.3000],
  'Kabupaten Sanggau': [0.1333, 110.6000],
  'Sanggau': [0.1333, 110.6000],
  'Kabupaten Sekadau': [0.0333, 110.8500],
  'Sekadau': [0.0333, 110.8500],
  'Kabupaten Sintang': [0.0667, 111.5000],
  'Sintang': [0.0667, 111.5000],
};

const PENGDA_CENTER = [-0.0263, 109.3425]; // Pontianak

// Kalimantan Barat geographical bounds (SW and NE corners)
const KALBAR_BOUNDS = [
  [-3.10, 108.40],  // Southwest corner
  [2.10, 114.00]    // Northeast corner
];

function getCoords(kota) {
  if (!kota) return null;
  const k = kota.trim();
  if (KALBAR_COORDS[k]) return KALBAR_COORDS[k];
  for (const [key, val] of Object.entries(KALBAR_COORDS)) {
    if (key.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return null;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateLong(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

const eventTypeConfig = {
  KEJURDA: { label: 'Kejurda', bg: 'bg-green-800/10', text: 'text-green-800', dot: 'bg-green-800' },
  KEJURCAB: { label: 'Kejurcab', bg: 'bg-sky-500/10', text: 'text-sky-700', dot: 'bg-sky-500' },
  EVENT_REGULER: { label: 'Event', bg: 'bg-violet-500/10', text: 'text-violet-700', dot: 'bg-violet-500' },
};

// Helper: Get dashboard URL based on user role
function getDashboardUrl(role, eventId, eventType) {
  const base = role === 'ADMIN' ? '/admin' 
    : role === 'PENGCAB' ? '/pengcab-panel' 
    : role === 'PENYELENGGARA' ? '/penyelenggara' 
    : '/dashboard';
  // For kejurda events, navigate to kejurda page
  if (eventType === 'KEJURDA' || eventType === 'KEJURCAB') {
    return `${base}?event=${eventId}&type=kejurda`;
  }
  return `${base}?event=${eventId}&type=rekomendasi`;
}

// ══════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════
export default function LandingPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackForm, setFeedbackForm] = useState({ nama: '', email: '', pesan: '' });
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [selectedPengcab, setSelectedPengcab] = useState(null);

  /* ── Scroll-triggered fade IN + fade OUT via IntersectionObserver ── */
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = e.target.style.animationDelay;
          if (delay && delay !== '0s') e.target.style.transitionDelay = delay;
          requestAnimationFrame(() => e.target.classList.add('is-visible'));
        } else {
          // Fade out when leaving viewport
          e.target.style.transitionDelay = '0s';
          e.target.classList.remove('is-visible');
        }
      }),
      { threshold: 0.05, rootMargin: '40px 0px -60px 0px' }
    );
    requestAnimationFrame(() => {
      document.querySelectorAll('.landing-fadeUp, .landing-fadeDown, .landing-fadeLeft, .landing-fadeRight, .landing-scaleUp')
        .forEach(el => observer.observe(el));
    });
    return () => observer.disconnect();
  }, [loading]);

  /* ── Fullpage-style section-by-section scrolling ── */
  useEffect(() => {
    if (loading) return;

    const container = document.querySelector('.landing-snap-container');
    if (!container) return;

    let isAnimating = false;
    let lastScrollTime = 0;
    let touchStartY = 0;
    const COOLDOWN = 900;
    const WHEEL_THRESHOLD = 40;
    const TOUCH_THRESHOLD = 50;

    const getSections = () => Array.from(container.querySelectorAll(':scope > section'));

    const findCurrentIndex = () => {
      const sections = getSections();
      const scrollPos = window.scrollY + window.innerHeight * 0.35;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= scrollPos) return i;
      }
      return 0;
    };

    const scrollToSection = (idx) => {
      const sections = getSections();
      if (idx < 0 || idx >= sections.length) return false;
      isAnimating = true;
      lastScrollTime = Date.now();
      sections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { isAnimating = false; }, COOLDOWN);
      return true;
    };

    // Check if target is inside a scrollable child (e.g. map sidebar)
    const isInsideScrollable = (el) => {
      while (el && el !== container && el !== document.body) {
        const style = getComputedStyle(el);
        if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    // Check if section has more content to scroll (taller than viewport)
    const canScrollWithin = (section, direction) => {
      const rect = section.getBoundingClientRect();
      const navbarHeight = 68;
      const viewportHeight = window.innerHeight - navbarHeight;
      const sectionHeight = section.scrollHeight;
      
      // If section fits in viewport, no internal scrolling needed
      if (sectionHeight <= viewportHeight + 10) return false;
      
      // Check if we're at the boundaries of this section
      if (direction > 0) {
        // Scrolling down: can we see more content below?
        const bottomVisible = rect.bottom;
        return bottomVisible > window.innerHeight + 5;
      } else {
        // Scrolling up: is there content above the visible area?
        const topVisible = rect.top;
        return topVisible < navbarHeight - 5;
      }
    };

    const onWheel = (e) => {
      // Let internal scrollable areas (like map sidebar) scroll naturally
      if (isInsideScrollable(e.target)) return;
      if (isAnimating || Date.now() - lastScrollTime < COOLDOWN) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) {
        e.preventDefault();
        return;
      }

      const current = findCurrentIndex();
      const sections = getSections();
      const currentSection = sections[current];

      // Check if current section is taller than viewport and has more to scroll
      if (currentSection && canScrollWithin(currentSection, e.deltaY)) {
        // Allow natural scroll within this tall section
        return;
      }

      // At the very last section scrolling down, allow natural scroll (for footer)
      if (e.deltaY > 0 && current >= sections.length - 1) return;
      // At top scrolling up, allow natural
      if (e.deltaY < 0 && current <= 0) return;

      e.preventDefault();
      if (e.deltaY > 0) scrollToSection(current + 1);
      else scrollToSection(current - 1);
    };

    const onTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      if (isAnimating) return;
      const diff = touchStartY - e.changedTouches[0].clientY;
      const current = findCurrentIndex();
      const sections = getSections();
      const currentSection = sections[current];
      if (Math.abs(diff) < TOUCH_THRESHOLD) return;
      
      // Check if current section has more content to scroll
      if (currentSection && canScrollWithin(currentSection, diff)) return;
      
      if (diff > 0 && current < sections.length - 1) scrollToSection(current + 1);
      else if (diff < 0 && current > 0) scrollToSection(current - 1);
    };

    const onKeyDown = (e) => {
      if (isAnimating) return;
      const current = findCurrentIndex();
      const sections = getSections();
      if ((e.key === 'ArrowDown' || e.key === 'PageDown') && current < sections.length - 1) {
        e.preventDefault();
        scrollToSection(current + 1);
      } else if ((e.key === 'ArrowUp' || e.key === 'PageUp') && current > 0) {
        e.preventDefault();
        scrollToSection(current - 1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [loading]);

  useEffect(() => {
    api.get('/dashboard/landing')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allEvents = useMemo(() => {
    if (!data) return [];
    const events = [];
    (data.kejurdaEvents || []).forEach(e => events.push({
      id: `k-${e.id}`, name: e.namaKejurda, type: e.jenisEvent,
      targetPeserta: e.targetPeserta || 'CLUB',
      start: e.tanggalMulai, end: e.tanggalSelesai,
      location: e.lokasi, desc: e.deskripsi, poster: e.poster,
      org: e.pengcab?.nama || 'Pengda Kalbar',
    }));
    (data.rekomendasiEvents || []).forEach(e => events.push({
      id: `r-${e.id}`, name: e.namaEvent, type: e.jenisEvent || 'EVENT_REGULER',
      start: e.tanggalMulai, end: e.tanggalSelesai,
      location: e.lokasi, desc: e.deskripsi, poster: e.poster,
      org: e.penyelenggara || e.pengcab?.nama || '-',
    }));
    events.sort((a, b) => new Date(b.start) - new Date(a.start));
    return events;
  }, [data]);

  const cfg = data?.config || {};
  const heroSlides = data?.heroSlides || [];
  const beritaList = data?.beritaList || [];

  const handleFeedback = async e => {
    e.preventDefault();
    setFeedbackSending(true);
    try {
      await api.post('/landing/feedback', feedbackForm);
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 4000);
      setFeedbackForm({ nama: '', email: '', pesan: '' });
    } catch { /* */ }
    setFeedbackSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-2 border-green-800 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const pengcabList = data?.pengcabList || [];
  const strukturList = data?.strukturList || [];
  const show = key => cfg[key] !== false;

  return (
    <div className="bg-white landing-snap-container">
      <HeroSection stats={stats} config={cfg} slides={heroSlides} />
      {show('section_events') && <EventsSection events={allEvents} user={user} />}
      {show('section_map') && <MapSection pengcabList={pengcabList} selectedPengcab={selectedPengcab} setSelectedPengcab={setSelectedPengcab} />}
      {show('section_anggota') && <AnggotaSection />}
      {show('section_struktur') && <StrukturSection pengcabList={pengcabList} config={cfg} strukturList={strukturList} />}
      {show('section_berita') && <BeritaSection beritaList={beritaList} />}
      {show('section_merchandise') && <MerchandiseSection config={cfg} />}
      {show('section_feedback') && <FeedbackSection form={feedbackForm} setForm={setFeedbackForm} sent={feedbackSent} sending={feedbackSending} onSubmit={handleFeedback} config={cfg} />}
      {show('section_cta') && <CTASection config={cfg} />}
    </div>
  );
}

// ══════════════════════════════════════════
// 1. HERO — Background Image Slideshow
// ══════════════════════════════════════════
function HeroSection({ stats, config, slides }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef(null);

  // Default fallback images if no slides from admin
  const defaultSlides = [
    { gambar: '/hero/hero-1.jpeg' }, { gambar: '/hero/hero-2.jpeg' },
    { gambar: '/hero/hero-3.jpeg' }, { gambar: '/hero/hero-4.jpeg' },
    { gambar: '/hero/hero-5.jpeg' },
  ];
  const heroImages = slides.length > 0
    ? slides.map(s => {
      if (!s.gambar) return '/hero/hero-1.jpeg';
      if (s.gambar.startsWith('http')) return s.gambar;
      if (s.gambar.startsWith('/uploads')) return getUploadUrl(s.gambar);
      return s.gambar;
    })
    : defaultSlides.map(s => s.gambar);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    timerRef.current = setInterval(() => setCurrentSlide(p => (p + 1) % heroImages.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [heroImages.length]);

  const badge = config.hero_badge || 'Pengurus Daerah Kalimantan Barat';
  const line1 = config.hero_title_line1 || 'FORBASI';
  const line2 = config.hero_title_line2 || 'Kalimantan Barat';
  const subtitle = config.hero_subtitle || 'Platform digital terpadu untuk pengelolaan event, kejuaraan daerah, dan rekomendasi perizinan FORBASI Provinsi Kalimantan Barat';
  const ctaPrimary = config.hero_cta_primary || 'Masuk';
  const ctaSecondary = config.hero_cta_secondary || 'Lihat Event';

  return (
    <section id="hero" className="relative overflow-hidden flex items-center snap-section min-h-screen">
      {/* Background Image Slideshow */}
      {heroImages.map((src, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === currentSlide ? 1 : 0 }}>
          <img src={src} alt="" className="w-full h-full object-cover"
            onError={e => { e.target.onerror = null; e.target.src = '/hero/hero-1.jpeg'; }}
            style={{ animation: i === currentSlide ? 'heroKenBurns 8s ease-out forwards' : 'none' }} />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-24 sm:py-32 w-full">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 mb-8 landing-fadeUp">
            <span className="w-2 h-2 rounded-full bg-green-700 animate-pulse" />
            <span className="text-white/80 text-xs font-medium tracking-wide">{badge}</span>
          </div>

          {/* Title */}
          <div className="landing-fadeUp" style={{ animationDelay: '0.1s' }}>
            <h1 className="mb-6">
              <span className="block font-playfair italic text-white/70 text-2xl sm:text-3xl lg:text-4xl font-light mb-1">{line1}</span>
              <span className="block font-playfair font-black text-5xl sm:text-7xl lg:text-8xl leading-[0.95]">
                <span className="text-white">{line2.split(' ')[0]} </span>
                <span className="text-green-800">{line2.split(' ').slice(1).join(' ') || ''}</span>
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-white/50 max-w-xl mb-10 leading-relaxed landing-fadeUp" style={{ animationDelay: '0.2s' }}>
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 landing-fadeUp" style={{ animationDelay: '0.3s' }}>
            <Link to="/login" className="group bg-green-800 hover:bg-green-900 text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-lg shadow-green-800/30 flex items-center gap-2">
              {ctaPrimary} <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-10 mt-14 landing-fadeUp" style={{ animationDelay: '0.4s' }}>
            {[
              { value: stats.totalClub || 0, label: 'Club Terdaftar' },
              { value: stats.totalEvents || 0, label: 'Event' },
              { value: stats.kotaKabupaten || 27, label: 'Kota/Kabupaten' },
            ].map((s, i) => (
              <div key={i} className="text-left">
                <div className="text-3xl sm:text-4xl font-black text-white">{s.value}</div>
                <div className="text-xs text-white/40 font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => { setCurrentSlide(i); clearInterval(timerRef.current); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-8 bg-green-800' : 'w-3 bg-white/30 hover:bg-white/50'
              }`} />
          ))}
        </div>
      )}

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
          <path fill="#ffffff" d="M0,64L60,58.7C120,53,240,43,360,42.7C480,43,600,53,720,56C840,59,960,53,1080,48C1200,43,1320,37,1380,34.7L1440,32L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z" />
        </svg>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════
// 2. EVENTS — 3D Coverflow Carousel
// ══════════════════════════════════════════
function EventsSection({ events, user }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const containerRef = useRef(null);

  const totalItems = events.length;

  // Wrap index for infinite loop
  const wrapIndex = (idx) => {
    if (totalItems === 0) return 0;
    return ((idx % totalItems) + totalItems) % totalItems;
  };

  const goTo = (idx) => setActiveIndex(wrapIndex(idx));
  const goNext = () => setActiveIndex(prev => wrapIndex(prev + 1));
  const goPrev = () => setActiveIndex(prev => wrapIndex(prev - 1));

  // Mouse/touch drag handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.type === 'touchstart' ? e.touches[0].clientX : e.clientX);
  };
  const handleDragEnd = (e) => {
    if (!isDragging) return;
    const endX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setIsDragging(false);
  };

  // Calculate card position styles with infinite loop support
  const getCardStyle = (index) => {
    // Calculate shortest distance considering wrap-around
    let diff = index - activeIndex;
    
    // Handle wrap-around: find the shortest path
    if (diff > totalItems / 2) diff -= totalItems;
    if (diff < -totalItems / 2) diff += totalItems;
    
    const absDiff = Math.abs(diff);
    
    // Hide cards too far from center
    if (absDiff > 2) {
      return { display: 'none' };
    }

    const baseTranslateX = 260;
    const baseTranslateZ = -140;
    const baseRotateY = 38;
    const baseScale = 0.85;
    const baseOpacity = 0.75;

    let translateX = diff * baseTranslateX;
    let translateZ = absDiff === 0 ? 0 : baseTranslateZ * Math.min(absDiff, 2);
    let rotateY = diff === 0 ? 0 : diff > 0 ? -baseRotateY : baseRotateY;
    let scale = absDiff === 0 ? 1 : Math.pow(baseScale, absDiff);
    let opacity = absDiff === 0 ? 1 : Math.pow(baseOpacity, absDiff);
    let zIndex = 20 - absDiff;

    // Adjust for items beyond first neighbors
    if (absDiff === 2) {
      translateX = diff > 0 ? 480 : -480;
      translateZ = -220;
      rotateY = diff > 0 ? -45 : 45;
      scale = 0.65;
      opacity = 0.35;
    }

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex,
      transition: 'transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.6s ease-out',
      pointerEvents: absDiff === 0 ? 'auto' : 'auto',
      display: 'block',
      width: '320px',
      height: '440px',
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden',
    };
  };

  const cfg3D = {
    KEJURDA: { gradient: 'from-green-800 to-green-900', label: 'Kejurda' },
    KEJURCAB: { gradient: 'from-sky-500 to-blue-600', label: 'Kejurcab' },
    EVENT_REGULER: { gradient: 'from-violet-500 to-purple-600', label: 'Event' },
  };

  if (events.length === 0) {
    return (
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 snap-section" id="events">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-700 animate-pulse" />
              <span className="text-green-600 text-xs font-semibold">Kegiatan & Event</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">Informasi Event Terkini</h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">Kejuaraan daerah, kejuaraan cabang, dan event yang telah disetujui Pengda Kalimantan Barat</p>
          </div>
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <HiCalendar className="text-slate-500" size={36} />
            </div>
            <p className="text-slate-400 font-medium">Belum ada event yang tersedia saat ini</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-white snap-section overflow-hidden" id="events">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 landing-fadeUp">
          <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-1.5 mb-4 border border-green-700/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-800 animate-pulse" />
            <span className="text-green-800 text-xs font-semibold tracking-wide">Kegiatan & Event</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Informasi Event Terkini</h2>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">Kejuaraan daerah, kejuaraan cabang, dan event yang telah disetujui Pengda Kalimantan Barat</p>
        </div>

        {/* 3D Carousel */}
        <div 
          ref={containerRef}
          className="relative h-[520px] flex items-center justify-center select-none landing-fadeUp"
          style={{ perspective: '1500px', perspectiveOrigin: 'center center' }}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => isDragging && setIsDragging(false)}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          {/* Navigation Arrows */}
          <button 
            onClick={goPrev}
            className="absolute left-2 sm:left-8 z-30 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center transition-all hover:bg-slate-50 hover:scale-110 active:scale-95"
          >
            <HiChevronLeft className="text-slate-700" size={24} />
          </button>
          <button 
            onClick={goNext}
            className="absolute right-2 sm:right-8 z-30 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center transition-all hover:bg-slate-50 hover:scale-110 active:scale-95"
          >
            <HiChevronRight className="text-slate-700" size={24} />
          </button>

          {/* Cards Container */}
          <div className="relative h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d', width: 'fit-content', margin: '0 auto' }}>
            {events.map((ev, idx) => {
              const style = getCardStyle(idx);
              if (style.display === 'none') return null;
              
              const evCfg = cfg3D[ev.type] || cfg3D.EVENT_REGULER;
              const isCenter = idx === activeIndex;
              const posterUrl = getUploadUrl(ev.poster);

              return (
                <div 
                  key={ev.id}
                  className="absolute cursor-pointer"
                  style={style}
                  onClick={() => !isCenter && goTo(idx)}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl group">
                    {/* Image */}
                    {posterUrl ? (
                      <img 
                        src={posterUrl} 
                        alt={ev.name} 
                        className="w-full h-full object-cover pointer-events-none" 
                        draggable="false"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${evCfg.gradient} opacity-80`} />
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      {/* Type Badge */}
                      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold bg-gradient-to-r ${evCfg.gradient} shadow-lg backdrop-blur-sm border border-white/20`}>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          {evCfg.label}
                        </span>
                        {/* Target Peserta Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg backdrop-blur-sm border border-white/20 ${
                          ev.targetPeserta === 'UMUM' 
                            ? 'bg-blue-600/90 text-white' 
                            : 'bg-green-600/90 text-white'
                        }`}>
                          {ev.targetPeserta === 'UMUM' ? (
                            <><HiGlobe className="w-3 h-3" /> Umum</>
                          ) : (
                            <><HiUserGroup className="w-3 h-3" /> Club</>
                          )}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className={`font-bold text-white mb-2 line-clamp-2 transition-all duration-300 ${isCenter ? 'text-xl' : 'text-lg'}`}>
                        {ev.name}
                      </h3>

                      {/* Date */}
                      <div className="flex items-center gap-3 text-white/90 text-xs mb-3">
                        <div className="flex items-center gap-1.5">
                          <HiCalendar className="w-3.5 h-3.5" />
                          <span>{fmtDate(ev.start)} — {fmtDate(ev.end)}</span>
                        </div>
                      </div>

                      {/* Description - only on center card */}
                      {isCenter && ev.desc && (
                        <p className="text-white/80 text-sm leading-relaxed mb-3 line-clamp-2">
                          {ev.desc}
                        </p>
                      )}

                      {/* Location */}
                      {isCenter && (
                        <div className="flex items-center gap-2 text-white/70 text-xs mb-4">
                          <HiLocationMarker className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      )}

                      {/* CTA Button - only center card */}
                      {isCenter ? (
                        <button 
                          onClick={() => setSelectedEvent(ev)}
                          className={`flex items-center justify-center gap-2 w-full py-2.5 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group text-sm ${
                            ev.targetPeserta === 'UMUM'
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                              : 'bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900'
                          }`}
                        >
                          <span>Lihat Detail</span>
                          <HiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <div className="text-center py-2 text-white/60 text-xs font-medium">
                          Klik untuk melihat
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicators & Help text */}
        <div className="mt-6 landing-fadeUp" style={{ animationDelay: '0.2s' }}>
          {/* Dot indicators */}
          {totalItems > 1 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {events.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex 
                      ? 'w-8 bg-green-800' 
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Helper text */}
          <p className="text-center text-slate-400 text-xs">
            👆 Klik tahan dan geser untuk berpindah • Klik pada &quot;Lihat Detail&quot; untuk info lengkap
          </p>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          user={user}
          navigate={navigate}
        />
      )}
    </section>
  );
}

// ══════════════════════════════════════════
// 2b. EVENT DETAIL MODAL
// ══════════════════════════════════════════
function EventDetailModal({ event, onClose, user, navigate }) {
  const evCfg = eventTypeConfig[event.type] || eventTypeConfig.EVENT_REGULER;
  const posterUrl = getUploadUrl(event.poster);

  // Handle click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Handle "Ikuti Event" button for CLUB events
  const handleIkutiEvent = () => {
    const eventId = event.id.replace(/^[kr]-/, ''); // Remove prefix k- or r-
    if (!user) {
      // Not logged in - redirect based on target peserta
      const returnUrl = getDashboardUrl('USER', eventId, event.type);
      if (event.targetPeserta === 'UMUM') {
        // UMUM events → register page (daftar akun umum dulu)
        navigate(`/register?redirect=${encodeURIComponent(returnUrl)}`);
      } else {
        // CLUB events → login page (sudah punya akun club)
        navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      }
    } else {
      // Logged in - go to dashboard with event
      const dashboardUrl = getDashboardUrl(user.role, eventId, event.type);
      navigate(dashboardUrl);
    }
    onClose();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all"
        >
          <HiX size={20} />
        </button>

        {/* Poster / Header */}
        <div className="relative h-56 sm:h-72 overflow-hidden">
          {posterUrl ? (
            <img 
              src={posterUrl} 
              alt={event.name} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${
              event.type === 'KEJURDA' ? 'from-green-700 to-green-900' :
              event.type === 'KEJURCAB' ? 'from-sky-500 to-blue-600' :
              'from-violet-500 to-purple-600'
            }`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Type Badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${evCfg.bg} ${evCfg.text} border border-current/20`}>
              <span className={`w-2 h-2 rounded-full ${evCfg.dot} animate-pulse`} />
              {evCfg.label}
            </span>
          </div>

          {/* Title on poster */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {event.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-18rem)]">
          {/* Date & Location cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <HiCalendar className="text-green-700" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Tanggal Pelaksanaan</p>
                <p className="text-sm font-semibold text-slate-800">
                  {fmtDateLong(event.start)}
                </p>
                <p className="text-xs text-slate-500">
                  s/d {fmtDateLong(event.end)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <HiLocationMarker className="text-blue-700" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Lokasi</p>
                <p className="text-sm font-semibold text-slate-800">
                  {event.location || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Organizer */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <HiOfficeBuilding className="text-violet-700" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Penyelenggara</p>
              <p className="text-sm font-semibold text-slate-800">{event.org}</p>
            </div>
          </div>

          {/* Description */}
          {event.desc && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Deskripsi Event</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {event.desc}
              </p>
            </div>
          )}

          {/* Target Peserta Info */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl ${event.targetPeserta === 'UMUM' ? 'bg-blue-50' : 'bg-green-50'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${event.targetPeserta === 'UMUM' ? 'bg-blue-100' : 'bg-green-100'}`}>
              {event.targetPeserta === 'UMUM' ? (
                <HiGlobe className="text-blue-700" size={20} />
              ) : (
                <HiUserGroup className="text-green-700" size={20} />
              )}
            </div>
            <div>
              <p className={`text-xs font-medium mb-0.5 ${event.targetPeserta === 'UMUM' ? 'text-blue-600' : 'text-green-600'}`}>Target Peserta</p>
              <p className={`text-sm font-semibold ${event.targetPeserta === 'UMUM' ? 'text-blue-800' : 'text-green-800'}`}>
                {event.targetPeserta === 'UMUM' ? 'Umum (Perorangan)' : 'Club FORBASI'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {event.targetPeserta === 'UMUM' 
                  ? 'Dapat diikuti oleh siapa saja tanpa harus tergabung dalam club'
                  : 'Khusus anggota club yang terdaftar di pengcab FORBASI'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleIkutiEvent}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl group ${
                event.targetPeserta === 'UMUM'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  : 'bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900'
              }`}
            >
              {user ? (
                <>
                  <HiCheckCircle size={20} />
                  <span>Ikuti Event</span>
                </>
              ) : (
                <>
                  <HiUserGroup size={20} />
                  <span>{event.targetPeserta === 'UMUM' ? 'Masuk untuk Mendaftar' : 'Masuk via Akun Club'}</span>
                </>
              )}
              <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={onClose}
              className="sm:w-auto px-6 py-3.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all"
            >
              Tutup
            </button>
          </div>

          {/* Login hint - when not logged in */}
          {!user && (
            <p className="text-center text-xs text-slate-400">
              {event.targetPeserta === 'UMUM'
                ? <>Belum punya akun? <Link to="/register" className="text-blue-600 hover:underline font-medium">Daftar akun umum</Link></>
                : <>Belum punya akun club? <Link to="/register" className="text-green-700 hover:underline font-medium">Daftar sekarang</Link></>
              }
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════
// 3. MAP SECTION
// ══════════════════════════════════════════
function MapSection({ pengcabList, selectedPengcab, setSelectedPengcab }) {
  const [mapReady, setMapReady] = useState(false);
  const [MC, setMC] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([rl, L]) => {
      if (cancelled) return;
      // Fix default icon paths for Leaflet
      delete L.default.Icon.Default.prototype._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      setMC({ MapContainer: rl.MapContainer, TileLayer: rl.TileLayer, CircleMarker: rl.CircleMarker, Tooltip: rl.Tooltip, useMap: rl.useMap, L: L.default });
      setMapReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const markers = useMemo(() => {
    const items = [{
      id: 'pengda', type: 'pengda', name: 'Pengda FORBASI Kalimantan Barat',
      kota: 'Kota Pontianak', coords: PENGDA_CENTER,
      data: { ketua: 'Pengurus Daerah', alamat: 'Jl. Veteran No. 1, Pontianak', phone: '-', email: '-' }
    }];
    pengcabList.forEach(p => {
      const coords = getCoords(p.kota);
      if (coords) items.push({ id: p.id, type: 'pengcab', name: p.nama, kota: p.kota, coords, data: p });
    });
    return items;
  }, [pengcabList]);

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-slate-50 snap-section" id="map">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeader badge="Peta Wilayah" title="Sebaran Pengcab Kalimantan Barat" subtitle="Lokasi pengurus cabang FORBASI di seluruh kota & kabupaten di Kalimantan Barat" />
        
        {/* Stats bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-10 landing-fadeUp">
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-md border border-gray-100">
            <div className="w-4 h-4 rounded-full bg-green-800 shadow-lg shadow-green-800/30" />
            <div>
              <div className="text-xs text-gray-400 font-medium">Pengda</div>
              <div className="text-sm font-bold text-gray-900">Pusat Kalimantan Barat</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-md border border-gray-100">
            <div className="w-4 h-4 rounded-full bg-sky-500 shadow-lg shadow-sky-500/30" />
            <div>
              <div className="text-xs text-gray-400 font-medium">Pengcab Aktif</div>
              <div className="text-sm font-bold text-gray-900">{pengcabList.length} Kota/Kabupaten</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Map container - takes 3 columns */}
          <div className="lg:col-span-3 relative landing-fadeLeft" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg h-[300px] sm:h-[500px] lg:h-[600px] relative">
              {mapReady && MC ? (
                <LeafletMap MC={MC} markers={markers} selectedPengcab={selectedPengcab} setSelectedPengcab={setSelectedPengcab} />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-sky-50">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border-[3px] border-gray-200" />
                      <div className="absolute inset-0 rounded-full border-[3px] border-green-800 border-t-transparent animate-spin" />
                      <HiGlobe className="absolute inset-0 m-auto text-green-800/30" size={28} />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Memuat peta wilayah...</p>
                  </div>
                </div>
              )}

              {/* Map legend - bottom left inside map */}
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 shadow-lg border border-gray-200 text-[10px] sm:text-xs">
                <div className="font-semibold text-gray-700 mb-1.5 sm:mb-2">Legenda</div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-green-800 border-2 border-green-900" />
                    <span className="text-gray-600">Pengda (Pusat)</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-sky-500 border-2 border-sky-600" />
                    <span className="text-gray-600">Pengcab</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - takes 2 columns, height matches map */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col max-h-[350px] sm:max-h-[500px] lg:max-h-[600px] landing-fadeRight" style={{ animationDelay: '0.2s' }}>
            {/* Header */}
            <div className="px-5 py-4 bg-slate-800 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Daftar Pengcab</h3>
                  <p className="text-slate-300 text-xs mt-0.5">Klik untuk melihat detail</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <HiOfficeBuilding className="text-white" size={20} />
                </div>
              </div>
            </div>

            {/* Info bar */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <HiLocationMarker size={14} className="text-green-800" />
                <span>{pengcabList.length} pengurus cabang tersebar di Kalimantan Barat</span>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100% - 100px)' }}>
              {pengcabList.map((p, idx) => (
                <button key={p.id} onClick={() => setSelectedPengcab(selectedPengcab?.id === p.id ? null : p)}
                  className={`w-full text-left px-4 py-3.5 transition-all duration-200 border-b border-gray-100 last:border-0 ${
                    selectedPengcab?.id === p.id 
                      ? 'bg-green-50 border-l-4 border-l-green-800' 
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      selectedPengcab?.id === p.id 
                        ? 'bg-green-800 text-white' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-sm truncate">{p.nama}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <HiLocationMarker size={11} className="shrink-0 text-green-800" />
                        <span className="truncate">{p.kota}</span>
                      </div>
                    </div>
                    <HiChevronRight className={`text-gray-300 shrink-0 transition-transform ${selectedPengcab?.id === p.id ? 'rotate-90 text-green-800' : ''}`} size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        {selectedPengcab && (
          <div className="mt-6 sm:mt-8 landing-fadeUp">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20">
              {/* Header */}
              <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-green-800 flex items-center justify-center text-white font-bold text-base sm:text-xl shadow-lg shadow-green-800/30 shrink-0">
                      {selectedPengcab.nama?.charAt(0) || 'P'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-xl font-bold text-white truncate">{selectedPengcab.nama}</h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                        <HiLocationMarker className="text-green-700 shrink-0" size={14} />
                        <p className="text-xs sm:text-sm text-slate-300 truncate">{selectedPengcab.kota}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPengcab(null)} 
                    className="p-2.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                    <HiX size={20} />
                  </button>
                </div>
              </div>
              
              {/* Content grid */}
              <div className="p-4 sm:p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-green-800/20 flex items-center justify-center">
                        <HiUser className="text-green-700" size={16} />
                      </div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Ketua</span>
                    </div>
                    <div className="text-white font-semibold">{selectedPengcab.ketua || 'Belum ditentukan'}</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                        <HiUser className="text-sky-400" size={16} />
                      </div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Sekretaris</span>
                    </div>
                    <div className="text-white font-semibold">{selectedPengcab.sekretaris || '-'}</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <HiUser className="text-amber-400" size={16} />
                      </div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Bendahara</span>
                    </div>
                    <div className="text-white font-semibold">{selectedPengcab.bendahara || '-'}</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <HiPhone className="text-violet-400" size={16} />
                      </div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Telepon</span>
                    </div>
                    <div className="text-white font-semibold">{selectedPengcab.phone || '-'}</div>
                  </div>
                  {selectedPengcab.email && (
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 sm:col-span-2">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                          <HiMail className="text-rose-400" size={16} />
                        </div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Email</span>
                      </div>
                      <div className="text-white font-semibold">{selectedPengcab.email}</div>
                    </div>
                  )}
                  {selectedPengcab.alamat && (
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 sm:col-span-2">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                          <HiLocationMarker className="text-cyan-400" size={16} />
                        </div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Alamat</span>
                      </div>
                      <div className="text-white font-semibold">{selectedPengcab.alamat}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function LeafletMap({ MC, markers, selectedPengcab, setSelectedPengcab }) {
  const { MapContainer, TileLayer, CircleMarker, Tooltip, L } = MC;
  const mapRef = useRef(null);

  // Set bounds restriction after map is ready
  useEffect(() => {
    if (mapRef.current && L) {
      const map = mapRef.current;
      const bounds = L.latLngBounds(KALBAR_BOUNDS);
      map.setMaxBounds(bounds);
      map.on('drag', () => map.panInsideBounds(bounds, { animate: true }));
    }
  }, [L]);

  // Pan to selected pengcab when clicked from sidebar
  useEffect(() => {
    if (mapRef.current && selectedPengcab) {
      const coords = getCoords(selectedPengcab.kota);
      if (coords) {
        mapRef.current.flyTo(coords, 11, { duration: 0.8 });
      }
    }
  }, [selectedPengcab]);

  return (
    <MapContainer
      ref={mapRef}
      center={PENGDA_CENTER}
      zoom={7}
      minZoom={6}
      maxZoom={12}
      className="w-full h-full"
      scrollWheelZoom={true}
      style={{ background: '#f8fafc' }}
      maxBoundsViscosity={1.0}
      zoomControl={true}
    >
      {/* Clean OpenStreetMap style */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {/* Pengda marker - larger and prominent */}
      {markers.filter(m => m.type === 'pengda').map(m => (
        <CircleMarker
          key={m.id}
          center={m.coords}
          radius={16}
          pathOptions={{
            color: '#15803d',
            fillColor: '#22c55e',
            fillOpacity: 0.9,
            weight: 3,
          }}
        >
          <Tooltip direction="top" offset={[0, -14]} permanent className="pengda-tooltip">
            <div className="text-center px-1">
              <div className="font-bold text-xs text-green-800">🏛️ PENGDA</div>
              <div className="text-[10px] text-gray-600">{m.kota}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Pengcab markers - highlight selected one */}
      {markers.filter(m => m.type === 'pengcab').map(m => {
        const isSelected = selectedPengcab?.id === m.id;
        return (
          <CircleMarker
            key={m.id}
            center={m.coords}
            radius={isSelected ? 14 : 9}
            pathOptions={{
              color: isSelected ? '#15803d' : '#0369a1',
              fillColor: isSelected ? '#22c55e' : '#0ea5e9',
              fillOpacity: isSelected ? 1 : 0.8,
              weight: isSelected ? 3 : 2,
            }}
            eventHandlers={{
              click: () => setSelectedPengcab(m.data),
              mouseover: (e) => {
                if (!isSelected) {
                  e.target.setRadius(12);
                  e.target.setStyle({ fillOpacity: 1, weight: 3 });
                }
              },
              mouseout: (e) => {
                if (!isSelected) {
                  e.target.setRadius(9);
                  e.target.setStyle({ fillOpacity: 0.8, weight: 2 });
                }
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} permanent={isSelected}>
              <div className="text-center">
                <div className={`font-bold text-xs ${isSelected ? 'text-green-800' : ''}`}>{m.name}</div>
                <div className="text-[10px] text-gray-500">{m.kota}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

// ══════════════════════════════════════════
// 4. ANGGOTA FORBASI
// ══════════════════════════════════════════
function AnggotaSection() {
  const [anggota, setAnggota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchAnggota = async () => {
      try {
        const { data } = await api.get('/dashboard/anggota');
        setAnggota(data.data || []);
      } catch (err) {
        console.error('Failed to fetch anggota:', err);
        setAnggota([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnggota();
  }, []);

  // Local IntersectionObserver for dynamically loaded elements
  useEffect(() => {
    if (loading || !sectionRef.current) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = e.target.style.animationDelay;
          if (delay && delay !== '0s') e.target.style.transitionDelay = delay;
          requestAnimationFrame(() => e.target.classList.add('is-visible'));
        } else {
          e.target.style.transitionDelay = '0s';
          e.target.classList.remove('is-visible');
        }
      }),
      { threshold: 0.05, rootMargin: '40px 0px -60px 0px' }
    );
    requestAnimationFrame(() => {
      sectionRef.current.querySelectorAll('.landing-fadeUp, .landing-scaleUp')
        .forEach(el => observer.observe(el));
    });
    return () => observer.disconnect();
  }, [loading, showAll]);

  const filteredList = useMemo(() => {
    if (!filter) return anggota;
    const q = filter.toLowerCase();
    return anggota.filter(m =>
      (m.club_name || '').toLowerCase().includes(q) ||
      (m.city_name || m.region || '').toLowerCase().includes(q) ||
      (m.school_name || '').toLowerCase().includes(q) ||
      (m.coach_name || '').toLowerCase().includes(q)
    );
  }, [anggota, filter]);

  const displayedList = showAll ? filteredList : filteredList.slice(0, 12);

  if (loading) {
    return (
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 to-white snap-section" id="anggota">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 text-slate-500">
              <div className="w-5 h-5 border-2 border-green-800 border-t-transparent rounded-full animate-spin" />
              <span>Memuat data anggota...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 snap-section" id="anggota">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14 landing-fadeUp">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-green-800/10 via-green-700/10 to-green-800/10 rounded-full px-5 py-2 mb-5 border border-green-700/30 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center shadow-md shadow-green-800/30">
              <HiShieldCheck className="text-white" size={12} />
            </div>
            <span className="text-green-800 text-xs font-bold tracking-widest uppercase">Anggota Resmi Terverifikasi</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 mb-4 tracking-tight">
            Club <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-green-800 to-green-900">FORBASI</span>
          </h2>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Club paskibra & baris-berbaris dengan <span className="font-semibold text-green-800">KTA terbit resmi</span> di FORBASI wilayah Provinsi Kalimantan Barat
          </p>
        </div>

        {/* Search + Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-12 landing-fadeUp" style={{ animationDelay: '0.1s' }}>
          <div className="relative w-full sm:max-w-md group/search">
            <input
              type="text"
              placeholder="Cari club, sekolah, pelatih..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-5 py-4 pl-12 bg-white border-2 border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-green-800/10 focus:border-green-700 transition-all shadow-lg shadow-slate-200/50 group-hover/search:shadow-xl group-hover/search:shadow-slate-200/70"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center shadow-sm">
              <HiSearch className="text-white" size={12} />
            </div>
            {filter && (
              <button onClick={() => setFilter('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                <HiX size={12} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-100 to-green-50 rounded-2xl px-5 py-3 border border-green-700/30 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center shadow-md shadow-green-800/30">
                <HiUserGroup className="text-white" size={20} />
              </div>
              <div>
                <div className="font-black text-2xl text-slate-800 leading-none">{anggota.length}</div>
                <div className="text-[10px] text-green-800 font-bold uppercase tracking-wider">Club Terdaftar</div>
              </div>
            </div>
            {filter && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl px-5 py-3 border border-blue-200/50 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                  <HiSearch className="text-white" size={18} />
                </div>
                <div>
                  <div className="font-black text-2xl text-slate-800 leading-none">{filteredList.length}</div>
                  <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Ditemukan</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {displayedList.map((m, i) => {
            const clubName = (m.club_name || m.username || 'Club').trim();
            const initial = clubName.charAt(0).toUpperCase();

            return (
              <div
                key={m.id || i}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-green-900/30 hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 ease-out landing-fadeUp"
                style={{ animationDelay: `${Math.min(i * 0.05, 0.6)}s` }}
              >
                {/* Background Gradient Overlay (visible on hover) */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-green-950 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" />
                
                {/* Animated Top Gradient Bar */}
                <div className="relative h-24 sm:h-28 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-900 to-green-950" />
                  {/* Animated pattern overlay */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 40%)' }} />
                  </div>
                  {/* Floating decoration */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700 delay-100" />
                  
                  {/* KTA Badge */}
                  {m.kta_status && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/30">
                      <HiShieldCheck className="text-white" size={12} />
                      <span className="text-white text-[10px] font-bold tracking-wide">VERIFIED</span>
                    </div>
                  )}
                </div>

                {/* Logo - Centered and floating above the gradient */}
                <div className="relative -mt-12 sm:-mt-14 z-10 flex justify-center">
                  <div className="relative">
                    {m.logo_url ? (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-500 bg-white">
                        <img
                          src={m.logo_url}
                          alt={clubName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-br from-green-800 to-green-950 items-center justify-center text-white font-bold text-3xl hidden">
                          {initial}
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center text-white font-black text-3xl sm:text-4xl border-4 border-white shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-500">
                        {initial}
                      </div>
                    )}
                    {/* Online indicator dot */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-700 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 pt-4 text-center">
                  {/* Club Name */}
                  <h4 className="font-black text-slate-800 text-base sm:text-lg leading-tight mb-1 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-800 group-hover:to-green-900 transition-all duration-300">
                    {clubName}
                  </h4>

                  {/* City with icon */}
                  {(m.city_name || m.region) && (
                    <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs sm:text-sm mb-4">
                      <HiLocationMarker size={14} className="text-rose-400" />
                      <span className="truncate">{m.city_name || m.region}</span>
                    </div>
                  )}

                  {/* Info Cards */}
                  <div className="space-y-2.5 text-left">
                    {m.school_name && (
                      <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors duration-300">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                          <HiAcademicCap className="text-white" size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Sekolah</div>
                          <div className="text-xs sm:text-sm font-semibold text-slate-700 truncate" title={m.school_name}>{m.school_name}</div>
                        </div>
                      </div>
                    )}
                    {m.coach_name && (
                      <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl group-hover:from-amber-100 group-hover:to-orange-100 transition-colors duration-300">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/30">
                          <HiUser className="text-white" size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">Pelatih</div>
                          <div className="text-xs sm:text-sm font-semibold text-slate-700 truncate" title={m.coach_name}>{m.coach_name}</div>
                        </div>
                      </div>
                    )}
                    {!m.school_name && !m.coach_name && (
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                          <HiShieldCheck className="text-slate-400" size={16} />
                        </div>
                        <div className="text-xs text-slate-400">Data KTA belum tersedia</div>
                      </div>
                    )}
                  </div>

                  {/* Bottom accent line */}
                  <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-green-800 to-green-950 opacity-20 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More / Less */}
        {filteredList.length > 12 && (
          <div className="text-center mt-12 landing-fadeUp">
            <button
              onClick={() => setShowAll(!showAll)}
              className="group/btn relative inline-flex items-center gap-3 bg-gradient-to-r from-green-700 to-green-900 hover:from-green-800 hover:to-green-950 text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-green-800/30 hover:shadow-xl hover:shadow-green-900/40 hover:-translate-y-1 overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              <span className="relative">{showAll ? 'Tampilkan Sedikit' : `Lihat Semua ${filteredList.length} Club`}</span>
              <HiChevronDown className={`relative transition-transform duration-300 ${showAll ? 'rotate-180' : 'group-hover/btn:translate-y-0.5'}`} size={18} />
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredList.length === 0 && (
          <div className="text-center py-16 landing-fadeUp">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <HiUserGroup className="text-slate-300" size={36} />
            </div>
            <p className="text-slate-500 font-medium mb-2">Tidak ada club yang ditemukan</p>
            <p className="text-slate-400 text-sm">Coba kata kunci lain atau hapus filter</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════
// 5. STRUKTUR ORGANISASI
// ══════════════════════════════════════════
function StrukturSection({ pengcabList, config, strukturList }) {

  // Group struktur by category (Ketua, Sekretaris, etc. come first)
  const mainRoles = ['Ketua Umum', 'Wakil Ketua', 'Sekretaris', 'Wakil Sekretaris', 'Bendahara', 'Wakil Bendahara'];
  const mainStruktur = strukturList.filter(s => mainRoles.some(r => s.jabatan?.toLowerCase().includes(r.toLowerCase())));
  const otherStruktur = strukturList.filter(s => !mainRoles.some(r => s.jabatan?.toLowerCase().includes(r.toLowerCase())));

  return (
    <section className="py-20 sm:py-28 bg-white snap-section" id="struktur">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeader badge="Organisasi" title="Struktur Pengda FORBASI Kalbar" subtitle="Susunan pengurus daerah dan jaringan pengurus cabang di seluruh Kalimantan Barat" />
        
        {/* Pengurus Daerah Section */}
        <div className="mb-16 landing-scaleUp">
          <div className="bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 rounded-3xl p-8 sm:p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-800/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/10 rounded-full blur-[60px]" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-green-800/20 flex items-center justify-center">
                  <HiShieldCheck className="text-green-700" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Pengurus Daerah Kalimantan Barat</h3>
                  <p className="text-xs text-green-700/60">FORBASI Pengda Kalbar</p>
                </div>
              </div>
              
              {/* Main Pengurus with Photos */}
              {strukturList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {mainStruktur.map((s, i) => (
                    <div key={s.id} className="bg-white/[0.06] backdrop-blur-sm rounded-2xl overflow-hidden border border-white/[0.08] group hover:bg-white/[0.1] transition-all landing-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="aspect-square bg-gradient-to-br from-green-800/50 to-green-950/50 flex items-center justify-center overflow-hidden">
                        {s.foto ? (
                          <img src={getUploadUrl(s.foto)} alt={s.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-white text-2xl font-bold">
                            {s.nama?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="p-4 text-center">
                        <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-1">{s.jabatan}</div>
                        <div className="text-white font-semibold text-sm">{s.nama}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback to config values if no struktur data */
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { role: 'Ketua Umum', name: config.org_ketua || 'Pengda FORBASI Kalbar' },
                    { role: 'Sekretaris', name: config.org_sekretaris || '-' },
                    { role: 'Bendahara', name: config.org_bendahara || '-' },
                    { role: 'Alamat', name: config.contact_address || 'Jl. Veteran No. 1, Pontianak' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.06]">
                      <div className="text-[11px] text-green-700/60 font-medium uppercase tracking-wider mb-1">{item.role}</div>
                      <div className="text-white font-semibold text-sm">{item.name}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Other Seksi */}
              {otherStruktur.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-green-200/40 font-medium uppercase tracking-wider mb-4">Seksi & Bidang</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {otherStruktur.map((s, i) => (
                      <div key={s.id} className="bg-white/[0.04] backdrop-blur-sm rounded-xl p-3 border border-white/[0.06] flex items-center gap-3 landing-fadeUp" style={{ animationDelay: `${i * 0.03}s` }}>
                        {s.foto ? (
                          <img src={getUploadUrl(s.foto)} alt={s.nama} className="w-10 h-10 rounded-lg object-cover" 
                            onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {s.nama?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-[9px] text-emerald-400/70 font-medium uppercase tracking-wide truncate">{s.jabatan}</div>
                          <div className="text-white text-xs font-medium truncate">{s.nama}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Pengurus Cabang Section */}
        <div className="landing-fadeUp" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HiOfficeBuilding className="text-green-800" /> Pengurus Cabang ({pengcabList.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {pengcabList.map((p, i) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all landing-fadeUp" style={{ animationDelay: `${Math.min(i, 12) * 0.05}s` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-green-800/20">
                    {p.nama?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{p.nama}</h4>
                    <p className="text-[11px] text-gray-400 truncate">{p.kota}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════
// 5. BERITA
// ══════════════════════════════════════════
function BeritaSection({ beritaList }) {
  if (!beritaList || beritaList.length === 0) {
    return (
      <section className="py-20 sm:py-28 bg-slate-50 snap-section" id="berita">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader badge="Berita" title="Berita & Informasi" subtitle="Update terbaru seputar kegiatan FORBASI Kalimantan Barat" />
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <HiNewspaper className="text-gray-300" size={36} />
            </div>
            <p className="text-gray-400 font-medium">Belum ada berita tersedia</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-28 bg-slate-50 snap-section" id="berita">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeader badge="Berita" title="Berita & Informasi" subtitle="Update terbaru seputar kegiatan FORBASI Kalimantan Barat" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beritaList.map((news, i) => (
            <div key={news.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 landing-fadeUp" style={{ animationDelay: `${i * 0.1}s` }}>
              {news.gambar ? (
                <div className="h-48 overflow-hidden">
                  <img src={getUploadUrl(news.gambar)} alt={news.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-2 bg-gradient-to-r from-green-800 to-green-900" />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {news.penulis && <span className="text-[11px] font-bold text-green-800 bg-green-800/10 px-2.5 py-1 rounded-lg">{news.penulis}</span>}
                  <span className="text-[11px] text-gray-400">{fmtDateLong(news.createdAt)}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-green-800 transition-colors line-clamp-2">{news.judul}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">{news.ringkasan || ''}</p>
                <span className="text-green-800 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Selengkapnya <HiChevronRight />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════
// MERCHANDISE
// ══════════════════════════════════════════
// ══════════════════════════════════════════
// MERCHANDISE SECTION
// ══════════════════════════════════════════
function MerchandiseSection({ config }) {
  const merchItems = (() => {
    let data = config?.merchandise_items || [];
    if (typeof data === 'string') try { data = JSON.parse(data); } catch { data = []; }
    if (!Array.isArray(data)) data = [];
    return data.filter(m => m.aktif !== false);
  })();

  if (merchItems.length === 0) return null;

  const formatHarga = (h) => {
    if (!h) return null;
    const num = parseInt(String(h).replace(/\D/g, ''));
    if (isNaN(num)) return h;
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden snap-section" id="merchandise">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-green-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 landing-fadeUp">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-5 border border-white/10">
            <HiShoppingBag className="text-green-400" size={14} />
            <span className="text-green-300 text-xs font-bold tracking-wide uppercase">Merchandise</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">Official Merchandise</h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">Koleksi merchandise resmi FORBASI Kalimantan Barat — tampil keren dengan identitas kebanggaan</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 landing-fadeUp" style={{ animationDelay: '0.2s' }}>
          {merchItems.map((item, idx) => (
            <div key={idx} className="group relative">
              {/* Card */}
              <div className="relative bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:bg-white/[0.1] hover:border-white/20 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-60 overflow-hidden">
                  {item.gambar ? (
                    <img
                      src={getUploadUrl(item.gambar)}
                      alt={item.nama}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-700 to-gray-800">
                      <HiShoppingBag className="text-gray-600" size={64} />
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

                  {/* Price badge */}
                  {formatHarga(item.harga) && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-400 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg shadow-green-500/30">
                      {formatHarga(item.harga)}
                    </div>
                  )}

                  {/* Product name overlay at bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-white text-lg leading-tight drop-shadow-lg">{item.nama}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {item.deskripsi && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">{item.deskripsi}</p>
                  )}
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <HiShoppingBag size={16} className="transition-transform duration-300 group-hover/btn:-rotate-12" />
                      Beli Sekarang
                      <HiExternalLink size={13} className="opacity-60" />
                    </a>
                  ) : (
                    <a
                      href={`https://wa.me/6285119511898?text=${encodeURIComponent(`Halo Admin, saya tertarik dengan merchandise "${item.nama}". Apakah masih tersedia?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <HiShoppingBag size={16} className="transition-transform duration-300 group-hover/btn:-rotate-12" />
                      Pesan Sekarang
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════
// 6. KRITIK & SARAN
// ══════════════════════════════════════════
function FeedbackSection({ form, setForm, sent, sending, onSubmit, config }) {
  return (
    <section className="py-20 sm:py-28 bg-white snap-section" id="feedback">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="landing-fadeUp">
              <div className="inline-flex items-center gap-2 bg-green-800/10 rounded-full px-4 py-1.5 mb-6">
                <HiChatAlt2 className="text-green-800" size={14} />
                <span className="text-green-800 text-xs font-semibold">Kritik & Saran</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Sampaikan Aspirasi Anda</h2>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Masukan Anda sangat berharga untuk pengembangan FORBASI Kalimantan Barat. Sampaikan kritik, saran, atau pertanyaan Anda melalui formulir ini.
              </p>
            </div>
            <div className="landing-fadeUp" style={{ animationDelay: '0.15s' }}>
              <div className="space-y-4">
                {[
                  { icon: HiMail, text: config.contact_email || 'pengda.kalbar@forbasi.or.id' },
                  { icon: HiPhone, text: config.contact_phone || '+62 812-xxxx-xxxx' },
                  { icon: HiLocationMarker, text: config.contact_address || 'Jl. Veteran No. 1, Pontianak' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-500">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0"><item.icon className="text-gray-400" size={18} /></div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="landing-fadeUp" style={{ animationDelay: '0.15s' }}>
            <form onSubmit={onSubmit} className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
              {sent && (
                <div className="mb-4 bg-green-800/10 border border-green-700/30 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 animate-fadeIn">
                  <HiShieldCheck size={18} /> Terima kasih! Pesan Anda telah dikirim.
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nama</label>
                  <input type="text" required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-800/30 focus:border-green-700 outline-none transition-all" placeholder="Nama lengkap Anda" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-800/30 focus:border-green-700 outline-none transition-all" placeholder="email@contoh.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Pesan</label>
                  <textarea required rows={5} value={form.pesan} onChange={e => setForm({ ...form, pesan: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-800/30 focus:border-green-700 outline-none transition-all resize-none" placeholder="Tulis kritik, saran, atau pertanyaan Anda..." />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-700 to-green-900 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-green-800/25 hover:shadow-green-800/40 transition-all active:scale-[0.98] disabled:opacity-60">
                  {sending ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <HiPaperAirplane className="rotate-90" size={16} />}
                  Kirim Pesan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════
// CTA
// ══════════════════════════════════════════
function CTASection({ config }) {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 relative overflow-hidden snap-section" id="cta">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-green-800/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-sky-500/8 rounded-full blur-[80px]" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 text-center landing-fadeUp">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">Bergabung dengan FORBASI Kalbar</h2>
        <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Daftarkan diri Anda atau organisasi Anda untuk mengakses layanan pengelolaan event dan kejuaraan daerah
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="group bg-gradient-to-r from-green-700 to-green-900 text-white px-8 py-4 rounded-2xl text-base font-bold transition-all shadow-2xl shadow-green-800/20 hover:shadow-green-800/40 flex items-center gap-2">
            Daftar Sekarang <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/pengcab" className="bg-white/[0.06] backdrop-blur-md hover:bg-white/[0.1] text-white px-8 py-4 rounded-2xl text-base font-medium transition-all border border-white/10 hover:border-white/20">
            Lihat Pengcab
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Shared ──
function SectionHeader({ badge, title, subtitle }) {
  return (
    <div className="text-center mb-14 landing-fadeUp">
      <div className="inline-flex items-center gap-2 bg-green-800/10 rounded-full px-4 py-1.5 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-green-800" />
        <span className="text-green-800 text-xs font-semibold">{badge}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">{title}</h2>
      <p className="text-gray-400 text-base max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon, className = '' }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-green-800/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="text-green-800" size={14} />
      </div>
      <div>
        <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

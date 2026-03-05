import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  HiCalendar, HiLocationMarker, HiCheckCircle, HiGlobe, HiSearch,
  HiArrowRight, HiClock, HiX, HiPhotograph,
  HiUpload, HiTrash, HiExclamationCircle, HiCurrencyDollar,
  HiPhone, HiUser, HiDocumentText, HiClipboardCopy, HiCreditCard
} from 'react-icons/hi';
import api, { getUploadUrl } from '../../lib/api';
import toast from 'react-hot-toast';
import Select from '../../components/Select';
import SearchableSelect from '../../components/SearchableSelect';
import KOTA_KABUPATEN from '../../lib/kotaKabupaten';

export default function UmumEventPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeTab, setActiveTab] = useState('SEMUA');

  const tabs = [
    { key: 'SEMUA', label: 'Semua Event', color: 'blue' },
    { key: 'TOT', label: 'TOT', color: 'amber' },
    { key: 'LATGAB', label: 'Latihan Gabungan', color: 'teal' },
    { key: 'EVENT_REGULER', label: 'Event Penyelenggara', color: 'purple' },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/kejurda/open');
      // Show all events that target UMUM (exclude KEJURDA & KEJURCAB which are for Club)
      const allEvents = (res.data || []).filter(e =>
        e.targetPeserta === 'UMUM'
      );
      setEvents(allEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      toast.error('Gagal memuat data event');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isUpcoming = (event) => new Date(event.tanggalMulai) >= new Date();

  const filteredEvents = events.filter(e => {
    const matchesSearch = (e.namaKejurda || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.lokasi || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'SEMUA' || e.jenisEvent === activeTab;
    return matchesSearch && matchesTab;
  });

  const upcomingEvents = filteredEvents.filter(e => isUpcoming(e));
  const pastEvents = filteredEvents.filter(e => !isUpcoming(e));

  const getTabCount = (key) => {
    if (key === 'SEMUA') return events.length;
    return events.filter(e => e.jenisEvent === key).length;
  };

  const openRegisterModal = (event) => {
    setSelectedEvent(event);
    setShowRegisterModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Event Publik</h1>
          <p className="text-sm text-gray-500 mt-1">Temukan dan ikuti event baris berbaris yang terbuka untuk umum</p>
        </div>
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari event..."
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => {
          const count = getTabCount(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setCurrentPage && setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <HiCalendar className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{upcomingEvents.length}</p>
              <p className="text-xs text-gray-500">Event Mendatang</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <HiClock className="text-gray-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pastEvents.length}</p>
              <p className="text-xs text-gray-500">Event Selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <HiGlobe className="text-blue-600" />
            Event Mendatang
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={() => openRegisterModal(event)}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
            <HiClock className="text-gray-400" />
            Event Selesai
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pastEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isPast
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <HiGlobe className="text-gray-400" size={36} />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">Belum Ada Event</h3>
          <p className="text-gray-500 text-sm">
            {searchQuery ? `Tidak ada event yang cocok dengan "${searchQuery}"` : 'Event publik akan segera tersedia'}
          </p>
        </div>
      )}

      {/* Registration Modal */}
      {showRegisterModal && selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          user={user}
          onClose={() => { setShowRegisterModal(false); setSelectedEvent(null); }}
          onSuccess={(isDP) => {
            setShowRegisterModal(false);
            setSelectedEvent(null);
            if (isDP) {
              toast.success('Pendaftaran DP berhasil! Status: Menunggu Pelunasan. Upload bukti pelunasan di Riwayat Pendaftaran.');
            } else {
              toast.success('Pendaftaran berhasil! Silakan tunggu konfirmasi.');
            }
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Poster Lightbox
// ═══════════════════════════════════════
function PosterLightbox({ src, alt, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
        <HiX size={22} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain animate-scale-in"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// ═══════════════════════════════════════
// Event Card — Modern Glass Design
// ═══════════════════════════════════════
function EventCard({ event, onRegister, isPast = false, formatDate }) {
  const posterUrl = getUploadUrl(event.poster);
  const biaya = event.biayaPendaftaran ? parseFloat(event.biayaPendaftaran) : 0;
  const [showPoster, setShowPoster] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const jenisConfig = {
    TOT: { gradient: 'from-amber-500 to-orange-500', label: 'TOT', ring: 'ring-amber-400/30' },
    KEJURCAB: { gradient: 'from-purple-500 to-fuchsia-500', label: 'KEJURCAB', ring: 'ring-purple-400/30' },
    LATGAB: { gradient: 'from-teal-500 to-cyan-500', label: 'LATGAB', ring: 'ring-teal-400/30' },
    KEJURDA: { gradient: 'from-blue-500 to-indigo-500', label: 'KEJURDA', ring: 'ring-blue-400/30' },
    EVENT_REGULER: { gradient: 'from-violet-500 to-purple-500', label: 'EVENT', ring: 'ring-violet-400/30' },
  };
  const jenis = jenisConfig[event.jenisEvent] || { gradient: 'from-indigo-500 to-blue-500', label: event.jenisEvent?.replace('_', ' '), ring: 'ring-indigo-400/30' };

  // Days until event
  const daysUntil = Math.ceil((new Date(event.tanggalMulai) - new Date()) / (1000 * 60 * 60 * 24));
  const isEarlyBird = event.earlyBirdAktif;

  return (
    <>
      <div className={`group relative rounded-2xl overflow-hidden transition-all duration-500 max-w-sm mx-auto w-full ${isPast ? 'opacity-50 grayscale-[30%]' : 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10'}`}>
        {/* Animated border glow on hover */}
        <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-br ${jenis.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]`} />

        <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200/60">
          {/* Poster Area */}
          {posterUrl ? (
            <div className="relative cursor-pointer overflow-hidden" onClick={() => setShowPoster(true)}>
              {/* Shimmer placeholder */}
              {!imgLoaded && (
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
              )}
              <div className={`aspect-[3/4] overflow-hidden ${!imgLoaded ? 'hidden' : ''}`}>
                <img
                  src={posterUrl}
                  alt={event.namaKejurda}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onLoad={() => setImgLoaded(true)}
                  onError={e => { e.target.parentElement.parentElement.style.display = 'none'; }}
                />
              </div>

              {/* Top overlay gradient */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />

              {/* Badges — top left */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                <span className={`text-[10px] font-black tracking-wider px-2.5 py-1 rounded-lg bg-gradient-to-r ${jenis.gradient} text-white shadow-lg ring-1 ${jenis.ring}`}>
                  {jenis.label}
                </span>
                {isEarlyBird && !isPast && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg animate-pulse ring-1 ring-yellow-400/30">
                    EARLY BIRD
                  </span>
                )}
              </div>

              {/* Status badge — top right */}
              {!isPast && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500 text-white shadow-lg ring-1 ring-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    OPEN
                  </span>
                </div>
              )}

              {/* Bottom info overlay — glassmorphism */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                <h3 className="font-bold text-white text-base leading-snug line-clamp-2 drop-shadow-lg">
                  {event.namaKejurda}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-[11px] text-white/80">
                    <HiCalendar size={12} className="text-blue-300" />
                    <span>{formatDate(event.tanggalMulai)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-white/80">
                    <HiLocationMarker size={12} className="text-rose-300" />
                    <span className="truncate max-w-[120px]">{event.lokasi || 'TBA'}</span>
                  </div>
                </div>
              </div>

              {/* Hover zoom overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 flex items-center gap-2 shadow-xl pointer-events-auto">
                  <HiSearch size={14} className="text-gray-500" />
                  Lihat Poster
                </div>
              </div>
            </div>
          ) : (
            /* No poster fallback */
            <div className={`relative h-32 bg-gradient-to-br ${jenis.gradient} flex items-center justify-center`}>
              <HiPhotograph className="text-white/30" size={48} />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white shadow-sm">{jenis.label}</span>
              </div>
              {!isPast && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> OPEN
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title only if no poster (poster shows it in overlay) */}
            {!posterUrl && (
              <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{event.namaKejurda}</h3>
            )}

            {/* Meta row */}
            <div className="flex items-center justify-between">
              {biaya > 0 ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <HiCurrencyDollar size={14} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Rp {biaya.toLocaleString('id-ID')}</span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">GRATIS</span>
              )}
              {daysUntil > 0 && daysUntil <= 30 && !isPast && (
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                  {daysUntil} hari lagi
                </span>
              )}
            </div>

            {/* No-poster: show date & location */}
            {!posterUrl && (
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <HiCalendar className="text-blue-400 shrink-0" size={13} />
                  <span>{formatDate(event.tanggalMulai)} — {formatDate(event.tanggalSelesai)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiLocationMarker className="text-rose-400 shrink-0" size={13} />
                  <span className="truncate">{event.lokasi || 'Lokasi TBA'}</span>
                </div>
              </div>
            )}

            {event.deskripsi && (
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{event.deskripsi}</p>
            )}

            {/* CTA */}
            {!isPast && onRegister && (
              <button
                onClick={onRegister}
                className={`w-full py-3 bg-gradient-to-r ${jenis.gradient} text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.97] flex items-center justify-center gap-2 ring-1 ring-inset ring-white/20`}
              >
                Daftar Sekarang
                <HiArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {isPast && (
              <div className="py-2.5 bg-gray-50 border border-gray-100 text-gray-400 font-medium text-sm rounded-xl text-center">
                Event Telah Selesai
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Poster Lightbox */}
      {showPoster && posterUrl && (
        <PosterLightbox src={posterUrl} alt={event.namaKejurda} onClose={() => setShowPoster(false)} />
      )}
    </>
  );
}

// ═══════════════════════════════════════
// Registration Modal - routes to category-specific forms
// ═══════════════════════════════════════
function RegistrationModal({ event, user, onClose, onSuccess }) {
  // TOT event → static TOT form
  if (event.jenisEvent === 'TOT') {
    return <TOTRegistrationModal event={event} user={user} onClose={onClose} onSuccess={onSuccess} />;
  }
  // Default fallback for other event types
  return <GenericRegistrationModal event={event} user={user} onClose={onClose} onSuccess={onSuccess} />;
}

// ═══════════════════════════════════════
// TOT Registration Modal (Static Form)
// ═══════════════════════════════════════
const TOT_PRICING = {
  EARLY_BIRD: { label: 'Early Bird', harga: 500000 },
  REGULER: { label: 'Reguler', harga: 650000 },
};

const BANK_INFO = {
  bank: 'Bank Mandiri',
  noRekening: '1320030973052',
  atasNama: 'Forum Baris Berbaris Indonesia Kalimantan Barat',
};

function TOTRegistrationModal({ event, user, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    namaLengkap: user?.name || '',
    noWhatsapp: user?.phone || '',
    domisili: '',
    sebagai: '',
    tipeBiaya: '',
    isBookingDP: false,
    nominalDP: '',
  });
  const [buktiPembayaran, setBuktiPembayaran] = useState(null);
  const [buktiDP, setBuktiDP] = useState(null);
  const [copied, setCopied] = useState(false);
  const buktiPembayaranRef = useRef(null);
  const buktiDPRef = useRef(null);

  // Filter pricing based on earlyBirdAktif
  const availablePricing = event.earlyBirdAktif === false
    ? { REGULER: TOT_PRICING.REGULER }
    : TOT_PRICING;
  const selectedPrice = TOT_PRICING[form.tipeBiaya];
  const nominalPembayaran = selectedPrice?.harga || 0;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatCurrency = (val) => `Rp ${val.toLocaleString('id-ID')}`;

  const copyRekening = () => {
    navigator.clipboard.writeText(BANK_INFO.noRekening);
    setCopied(true);
    toast.success('Nomor rekening disalin');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (setter, file) => {
    if (!file) { setter(null); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File terlalu besar (max 5MB)'); return; }
    setter(file);
  };

  const validate = () => {
    if (!form.namaLengkap.trim()) { toast.error('Nama lengkap harus diisi'); return false; }
    if (!form.noWhatsapp.trim()) { toast.error('No WhatsApp harus diisi'); return false; }
    if (!form.domisili.trim()) { toast.error('Domisili harus diisi'); return false; }
    if (!form.sebagai) { toast.error('Pilih peran Anda (Pelatih/Peserta Didik/Umum)'); return false; }
    if (!form.tipeBiaya) { toast.error('Pilih tipe biaya pendaftaran'); return false; }
    if (!form.isBookingDP && !buktiPembayaran) { toast.error('Upload bukti pembayaran'); return false; }
    if (form.isBookingDP) {
      if (!form.nominalDP || parseInt(form.nominalDP) <= 0) { toast.error('Masukkan nominal DP'); return false; }
      if (!buktiDP) { toast.error('Upload bukti pembayaran DP'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('kejurdaId', event.id);
      formData.append('namaAtlet', form.namaLengkap.trim());
      formData.append('kategori', form.sebagai);

      const dataPersyaratan = {
        noWhatsapp: form.noWhatsapp.trim(),
        domisili: form.domisili.trim(),
        sebagai: form.sebagai,
        tipeBiaya: form.tipeBiaya,
        labelBiaya: selectedPrice?.label,
        nominalPembayaran,
        nominalBayar: form.isBookingDP ? parseInt(form.nominalDP) : nominalPembayaran,
        isBookingDP: form.isBookingDP,
        nominalDP: form.isBookingDP ? parseInt(form.nominalDP) : null,
        statusPembayaran: form.isBookingDP ? 'DP' : 'LUNAS',
        sisaPembayaran: form.isBookingDP ? Math.max(0, nominalPembayaran - parseInt(form.nominalDP || 0)) : 0,
      };
      formData.append('dataPersyaratan', JSON.stringify(dataPersyaratan));

      if (buktiPembayaran) formData.append('buktiPembayaran', buktiPembayaran);
      if (buktiDP) formData.append('buktiDP', buktiDP);

      await api.post('/pendaftaran', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess(form.isBookingDP);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <HiX size={18} />
          </button>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 mb-2">TOT — Training of Trainer</span>
          <h2 className="text-xl font-bold pr-8">{event.namaKejurda}</h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-amber-100">
            <span className="flex items-center gap-1"><HiCalendar size={14} /> {formatDate(event.tanggalMulai)} — {formatDate(event.tanggalSelesai)}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm text-amber-100">
            <HiLocationMarker size={14} /> {event.lokasi || '-'}
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-14rem)] space-y-4">
          {/* 1. Nama Lengkap */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><HiUser className="text-gray-400" size={14} /> Nama Lengkap <span className="text-red-500">*</span></span>
            </label>
            <input type="text" value={form.namaLengkap} onChange={e => setForm({ ...form, namaLengkap: e.target.value })}
              placeholder="Masukkan nama lengkap" className={inputClass} />
          </div>

          {/* 2. No WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><HiPhone className="text-gray-400" size={14} /> No WhatsApp <span className="text-red-500">*</span></span>
            </label>
            <input type="tel" value={form.noWhatsapp} onChange={e => setForm({ ...form, noWhatsapp: e.target.value })}
              placeholder="08xxxxxxxxxx" className={inputClass} />
          </div>

          {/* 3. Domisili */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><HiLocationMarker className="text-gray-400" size={14} /> Domisili <span className="text-red-500">*</span></span>
            </label>
            <SearchableSelect
              options={KOTA_KABUPATEN}
              value={form.domisili}
              onChange={(val) => setForm({ ...form, domisili: val })}
              placeholder="Cari kota/kabupaten..."
              accent="blue"
            />
          </div>

          {/* 4. Sebagai */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mendaftar Sebagai <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Pelatih', 'Peserta Didik', 'Umum'].map(role => (
                <button key={role} type="button"
                  onClick={() => setForm({ ...form, sebagai: role })}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                    form.sebagai === role
                      ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Tipe Biaya */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-1.5"><HiCurrencyDollar className="text-gray-400" size={14} /> Biaya Pendaftaran <span className="text-red-500">*</span></span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(availablePricing).map(([key, { label, harga }]) => (
                <button key={key} type="button"
                  onClick={() => setForm({ ...form, tipeBiaya: key })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.tipeBiaya === key
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  <p className={`text-sm font-bold ${form.tipeBiaya === key ? 'text-amber-700' : 'text-gray-800'}`}>{label}</p>
                  <p className={`text-lg font-bold mt-1 ${form.tipeBiaya === key ? 'text-amber-600' : 'text-gray-700'}`}>
                    {formatCurrency(harga)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Bank Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <HiCreditCard className="text-blue-600" size={16} />
              <h4 className="text-sm font-bold text-blue-900">Rekening Pendaftaran</h4>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-blue-800 font-medium">{BANK_INFO.bank}</p>
              <div className="flex items-center gap-2">
                <p className="text-blue-900 font-bold text-lg tracking-wider">{BANK_INFO.noRekening}</p>
                <button type="button" onClick={copyRekening}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    copied ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}>
                  <HiClipboardCopy size={14} className="inline mr-0.5" />
                  {copied ? 'Disalin!' : 'Salin'}
                </button>
              </div>
              <p className="text-blue-700 text-xs">a.n. {BANK_INFO.atasNama}</p>
            </div>
          </div>

          {/* 6. Upload Bukti Pembayaran (full) */}
          {!form.isBookingDP && form.tipeBiaya && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-1">
              <p className="text-sm text-green-800 font-medium flex items-center gap-1.5">
                <HiCheckCircle size={16} className="text-green-600" />
                Total pembayaran: <span className="font-bold">{formatCurrency(nominalPembayaran)}</span>
              </p>
            </div>
          )}
          {!form.isBookingDP && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Upload Bukti Pembayaran {nominalPembayaran > 0 && <span className="font-normal text-gray-500">({formatCurrency(nominalPembayaran)})</span>} <span className="text-red-500">*</span>
              </label>
              <input type="file" ref={buktiPembayaranRef} accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={e => handleFileChange(setBuktiPembayaran, e.target.files?.[0])} className="hidden" />
              {!buktiPembayaran ? (
                <button type="button" onClick={() => buktiPembayaranRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50 transition-all">
                  <HiUpload size={18} /> Upload Bukti Transfer
                </button>
              ) : (
                <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <HiPhotograph className="text-amber-600 shrink-0" size={20} />
                  <span className="text-sm text-amber-700 flex-1 truncate">{buktiPembayaran.name}</span>
                  <button type="button" onClick={() => { setBuktiPembayaran(null); if (buktiPembayaranRef.current) buktiPembayaranRef.current.value = ''; }}
                    className="text-red-400 hover:text-red-600 shrink-0"><HiTrash size={16} /></button>
                </div>
              )}
            </div>
          )}

          {/* 8. Booking DP Option */}
          <div className="border border-gray-200 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isBookingDP}
                onChange={e => { setForm({ ...form, isBookingDP: e.target.checked, nominalDP: '' }); setBuktiDP(null); setBuktiPembayaran(null); }}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Booking / Bayar DP Terlebih Dahulu</p>
                <p className="text-xs text-gray-400">Bayar sebagian dulu, status akan pending sampai pelunasan</p>
              </div>
            </label>

            {form.isBookingDP && (
              <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal DP <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
                    <input type="number" value={form.nominalDP} onChange={e => setForm({ ...form, nominalDP: e.target.value })}
                      placeholder="Masukkan nominal DP" className={`${inputClass} pl-10`} />
                  </div>
                  {nominalPembayaran > 0 && form.nominalDP && (
                    <p className="text-xs text-gray-400 mt-1">
                      Sisa pembayaran: {formatCurrency(Math.max(0, nominalPembayaran - parseInt(form.nominalDP || 0)))}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Bukti Pembayaran DP <span className="text-red-500">*</span></label>
                  <input type="file" ref={buktiDPRef} accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={e => handleFileChange(setBuktiDP, e.target.files?.[0])} className="hidden" />
                  {!buktiDP ? (
                    <button type="button" onClick={() => buktiDPRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50 transition-all">
                      <HiUpload size={18} /> Upload Bukti DP
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                      <HiPhotograph className="text-amber-600 shrink-0" size={20} />
                      <span className="text-sm text-amber-700 flex-1 truncate">{buktiDP.name}</span>
                      <button type="button" onClick={() => { setBuktiDP(null); if (buktiDPRef.current) buktiDPRef.current.value = ''; }}
                        className="text-red-400 hover:text-red-600 shrink-0"><HiTrash size={16} /></button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Mendaftar...</span></>
            ) : (
              <><HiCheckCircle size={20} /><span>Kirim Pendaftaran TOT</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Generic Registration Modal (fallback for other event types)
// ═══════════════════════════════════════
function GenericRegistrationModal({ event, user, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    namaAtlet: user?.name || '',
    kategori: '',
    catatanPeserta: '',
  });
  const [persyaratanData, setPersyaratanData] = useState({});
  const [fileUploads, setFileUploads] = useState({});
  const fileInputRefs = useRef({});

  const persyaratanFields = event.persyaratanFields || [];
  const biaya = event.biayaPendaftaran ? parseFloat(event.biayaPendaftaran) : 0;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleFieldChange = (fieldId, value) => {
    setPersyaratanData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (fieldId, file) => {
    if (!file) {
      setFileUploads(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
      setPersyaratanData(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File terlalu besar (max 5MB)');
      return;
    }
    setFileUploads(prev => ({ ...prev, [fieldId]: file }));
    setPersyaratanData(prev => ({ ...prev, [fieldId]: file.name }));
  };

  const validate = () => {
    if (!form.namaAtlet.trim()) {
      toast.error('Nama lengkap harus diisi');
      return false;
    }
    for (const field of persyaratanFields) {
      if (!field.required) continue;
      const isFileField = ['FILE_IMAGE', 'FILE_PDF', 'FILE_ANY'].includes(field.tipe);
      if (isFileField) {
        if (!fileUploads[field.id]) {
          toast.error(`"${field.label}" wajib diisi`);
          return false;
        }
      } else if (field.tipe !== 'CHECKBOX') {
        const val = persyaratanData[field.id];
        if (!val || (typeof val === 'string' && !val.trim())) {
          toast.error(`"${field.label}" wajib diisi`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('kejurdaId', event.id);
      formData.append('namaAtlet', form.namaAtlet.trim());
      formData.append('kategori', form.kategori.trim() || 'Umum');
      if (form.catatanPeserta.trim()) formData.append('catatanPeserta', form.catatanPeserta.trim());

      // Non-file persyaratan data
      const nonFileData = {};
      Object.entries(persyaratanData).forEach(([key, val]) => {
        if (!fileUploads[key]) nonFileData[key] = val;
      });
      formData.append('dataPersyaratan', JSON.stringify(nonFileData));

      // File uploads
      Object.values(fileUploads).forEach(file => {
        formData.append('files', file);
      });

      await api.post('/pendaftaran', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mendaftar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <HiX size={18} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <HiCalendar size={16} />
            <span className="text-sm text-white/80">{formatDate(event.tanggalMulai)} — {formatDate(event.tanggalSelesai)}</span>
          </div>
          <h2 className="text-xl font-bold pr-8">{event.namaKejurda}</h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-blue-100">
            <span className="flex items-center gap-1"><HiLocationMarker size={14} /> {event.lokasi || '-'}</span>
            {biaya > 0 && <span className="flex items-center gap-1"><HiCurrencyDollar size={14} /> Rp {biaya.toLocaleString('id-ID')}</span>}
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-14rem)] space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><HiUser className="text-gray-400" size={14} /> Nama Lengkap <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              value={form.namaAtlet}
              onChange={e => setForm({ ...form, namaAtlet: e.target.value })}
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori Pendaftaran</label>
            <Select accent="blue"
              value={form.kategori}
              onChange={e => setForm({ ...form, kategori: e.target.value })}
            >
              <option value="">— Pilih Kategori —</option>
              <option value="Peserta">Peserta</option>
              <option value="Pelatih">Pelatih</option>
              <option value="Official">Official</option>
              <option value="Lainnya">Lainnya</option>
            </Select>
          </div>

          {/* Dynamic Persyaratan Fields */}
          {persyaratanFields.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <HiDocumentText className="text-blue-600" size={16} />
                Persyaratan Event
              </h3>
              <div className="space-y-4">
                {persyaratanFields.map(field => (
                  <DynamicField
                    key={field.id}
                    field={field}
                    value={persyaratanData[field.id] || ''}
                    file={fileUploads[field.id]}
                    onChange={(val) => handleFieldChange(field.id, val)}
                    onFileChange={(file) => handleFileChange(field.id, file)}
                    fileInputRef={el => { fileInputRefs.current[field.id] = el; }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Catatan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
            <textarea
              value={form.catatanPeserta}
              onChange={e => setForm({ ...form, catatanPeserta: e.target.value })}
              placeholder="Informasi tambahan untuk panitia..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Mendaftar...</span>
              </>
            ) : (
              <>
                <HiCheckCircle size={20} />
                <span>Kirim Pendaftaran</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Dynamic Form Field Renderer
// ═══════════════════════════════════════
function DynamicField({ field, value, file, onChange, onFileChange, fileInputRef }) {
  const isFileField = ['FILE_IMAGE', 'FILE_PDF', 'FILE_ANY'].includes(field.tipe);

  const acceptMap = {
    FILE_IMAGE: 'image/jpeg,image/png,image/webp',
    FILE_PDF: 'application/pdf',
    FILE_ANY: 'image/jpeg,image/png,image/webp,application/pdf',
  };

  const fieldLabel = (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {field.label} {field.required && <span className="text-red-500">*</span>}
      {field.keterangan && <span className="block text-xs text-gray-400 font-normal mt-0.5">{field.keterangan}</span>}
    </label>
  );

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm";

  if (field.tipe === 'TEXT') {
    return <div>{fieldLabel}<input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={field.label} className={inputClass} /></div>;
  }

  if (field.tipe === 'TEXTAREA') {
    return <div>{fieldLabel}<textarea value={value} onChange={e => onChange(e.target.value)} placeholder={field.label} rows={3} className={`${inputClass} resize-none`} /></div>;
  }

  if (field.tipe === 'NUMBER') {
    return <div>{fieldLabel}<input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={field.label} className={inputClass} /></div>;
  }

  if (field.tipe === 'DATE') {
    return <div>{fieldLabel}<input type="date" value={value} onChange={e => onChange(e.target.value)} className={inputClass} /></div>;
  }

  if (field.tipe === 'SELECT') {
    const options = Array.isArray(field.options) ? field.options : [];
    return (
      <div>
        {fieldLabel}
        <Select accent="blue" value={value} onChange={e => onChange(e.target.value)}>
          <option value="">— Pilih —</option>
          {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </Select>
      </div>
    );
  }

  if (field.tipe === 'RADIO') {
    const options = Array.isArray(field.options) ? field.options : [];
    return (
      <div>
        {fieldLabel}
        <div className="space-y-2">
          {options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name={`field_${field.id}`} value={opt} checked={value === opt} onChange={() => onChange(opt)} className="text-blue-600 focus:ring-blue-500" />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.tipe === 'CHECKBOX') {
    return (
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
          <span className="font-medium text-gray-700">{field.label}</span>
          {field.required && <span className="text-red-500">*</span>}
        </label>
        {field.keterangan && <p className="text-xs text-gray-400 mt-1 ml-6">{field.keterangan}</p>}
      </div>
    );
  }

  if (isFileField) {
    return (
      <div>
        {fieldLabel}
        <input type="file" ref={fileInputRef} accept={acceptMap[field.tipe]} onChange={e => onFileChange(e.target.files?.[0] || null)} className="hidden" />
        {!file ? (
          <button
            type="button"
            onClick={() => fileInputRef?.current?.click?.()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
          >
            <HiUpload size={18} />
            <span>Upload {field.tipe === 'FILE_IMAGE' ? 'Gambar' : field.tipe === 'FILE_PDF' ? 'PDF' : 'File'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
            {field.tipe === 'FILE_IMAGE' ? <HiPhotograph className="text-blue-600 shrink-0" size={20} /> : <HiDocumentText className="text-blue-600 shrink-0" size={20} />}
            <span className="text-sm text-blue-700 flex-1 truncate">{file.name}</span>
            <button type="button" onClick={() => { onFileChange(null); if (fileInputRef?.current) fileInputRef.current.value = ''; }} className="text-red-400 hover:text-red-600 shrink-0">
              <HiTrash size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Fallback
  return <div>{fieldLabel}<input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={field.label} className={inputClass} /></div>;
}

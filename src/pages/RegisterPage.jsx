import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiLocationMarker, HiUserGroup, HiOfficeBuilding, HiGlobe, HiArrowRight, HiArrowLeft, HiCheckCircle, HiExternalLink, HiSearch, HiChevronDown, HiX } from 'react-icons/hi';
import api from '../lib/api';
import toast from 'react-hot-toast';

// Role options for registration
const ROLE_OPTIONS = [
  {
    id: 'UMUM',
    title: 'Umum',
    subtitle: 'Masyarakat Umum',
    description: 'Daftar untuk mengikuti event-event yang terbuka untuk umum',
    icon: HiGlobe,
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
  },
  {
    id: 'PENYELENGGARA',
    title: 'Penyelenggara',
    subtitle: 'Event Organizer',
    description: 'Daftar sebagai penyelenggara event di FORBASI Kalimantan Barat',
    icon: HiOfficeBuilding,
    color: 'green',
    bgGradient: 'from-green-600 to-green-700',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-600',
  },
  {
    id: 'CALON_ANGGOTA',
    title: 'Calon Anggota',
    subtitle: 'Anggota FORBASI',
    description: 'Daftar sebagai anggota club FORBASI melalui website pusat',
    icon: HiUserGroup,
    color: 'violet',
    bgGradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    borderColor: 'border-violet-500',
    textColor: 'text-violet-600',
    externalLink: 'https://forbasi.or.id/forbasi/php/login',
  },
];

// Custom searchable pengcab dropdown
function PengcabDropdown({ pengcabList, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = pengcabList.find(p => String(p.id) === String(value));
  const filtered = pengcabList.filter(p =>
    !search || p.nama.toLowerCase().includes(search.toLowerCase()) || p.kota.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        <HiLocationMarker className="inline mr-1 text-green-600" />
        Wilayah Pengcab (Kota/Kabupaten) *
      </label>
      <div ref={containerRef} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
            open ? 'border-green-500 ring-2 ring-green-500/20' : 'border-slate-200 hover:border-slate-300'
          } bg-white`}
        >
          {selected ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {selected.nama?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{selected.nama}</p>
                <p className="text-[11px] text-slate-400 truncate">{selected.kota}</p>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 text-sm">Pilih pengcab...</span>
          )}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {selected && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); onChange(''); setSearch(''); }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <HiX size={14} />
              </span>
            )}
            <HiChevronDown className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} size={18} />
          </div>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-1">
            {/* Search */}
            <div className="p-2.5 border-b border-slate-100">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari kota/kabupaten..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-56 overflow-y-auto overscroll-contain">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400 text-sm">
                  <HiLocationMarker className="mx-auto mb-2 text-slate-300" size={24} />
                  Tidak ditemukan
                </div>
              ) : (
                filtered.map(p => {
                  const isSelected = String(p.id) === String(value);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { onChange(String(p.id)); setOpen(false); setSearch(''); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        isSelected ? 'bg-green-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-br from-green-600 to-green-700 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.nama?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-green-700' : 'text-slate-700'}`}>{p.nama}</p>
                        <p className="text-[11px] text-slate-400 truncate">{p.kota}</p>
                      </div>
                      {isSelected && <HiCheckCircle className="text-green-600 shrink-0" size={18} />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Hidden required input for form validation */}
        <input type="text" required value={value} onChange={() => {}} className="sr-only" tabIndex={-1} />
      </div>
      <p className="text-xs text-slate-400 mt-1.5">Pilih pengurus cabang sesuai kota/kabupaten Anda</p>
    </div>
  );
}

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', pengcabId: '' });
  const [pengcabList, setPengcabList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, register } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      const dest = user.role === 'ADMIN' ? '/admin' 
        : user.role === 'PENGCAB' ? '/pengcab-panel' 
        : user.role === 'PENYELENGGARA' ? '/penyelenggara' 
        : user.role === 'UMUM' ? '/umum'
        : '/dashboard';
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    api.get('/pengcab').then(res => setPengcabList(res.data.filter(p => p.status === 'AKTIF'))).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoleSelect = (role) => {
    if (role.externalLink) {
      // Redirect to external link for CALON_ANGGOTA
      window.open(role.externalLink, '_blank');
      return;
    }
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setForm({ name: '', email: '', password: '', confirmPassword: '', phone: '', pengcabId: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Password tidak sama');
    }
    if (selectedRole.id === 'PENYELENGGARA' && !form.pengcabId) {
      return toast.error('Pilih wilayah Pengcab terlebih dahulu');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone, form.pengcabId || null, selectedRole.id);
      toast.success('Registrasi berhasil!');
      const dest = selectedRole.id === 'PENYELENGGARA' ? '/penyelenggara' : '/umum';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal registrasi');
    } finally {
      setLoading(false);
    }
  };

  // Role Selection Screen
  if (!selectedRole) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 shadow-xl shadow-green-200/50 overflow-hidden bg-white">
              <img src="/LOGO-FORBASI.png" alt="FORBASI" className="w-14 h-14 object-contain" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-3">Daftar Akun</h2>
            <p className="text-slate-500 text-lg">Pilih jenis akun yang ingin Anda daftarkan</p>
          </div>

          <div className="grid gap-4 sm:gap-5">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`group relative flex items-start gap-5 p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl text-left ${role.bgLight} border-transparent hover:${role.borderColor} hover:scale-[1.02]`}
              >
                {/* Icon */}
                <div className={`shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${role.bgGradient} flex items-center justify-center shadow-lg`}>
                  <role.icon className="text-white" size={28} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-slate-800">{role.title}</h3>
                    {role.externalLink && (
                      <HiExternalLink className="text-slate-400" size={18} />
                    )}
                  </div>
                  <p className={`text-sm font-medium ${role.textColor} mb-1`}>{role.subtitle}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{role.description}</p>
                </div>

                {/* Arrow */}
                <div className={`shrink-0 w-10 h-10 rounded-full ${role.bgLight} flex items-center justify-center group-hover:bg-gradient-to-br group-hover:${role.bgGradient} transition-all`}>
                  <HiArrowRight className={`${role.textColor} group-hover:text-white transition-colors`} size={20} />
                </div>
              </button>
            ))}
          </div>

          <p className="text-center mt-8 text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-green-700 font-semibold hover:underline">Masuk disini</Link>
          </p>
        </div>
      </div>
    );
  }

  // Registration Form Screen
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <HiArrowLeft size={20} />
          <span className="font-medium">Kembali pilih jenis akun</span>
        </button>

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl bg-gradient-to-br ${selectedRole.bgGradient}`}>
            <selectedRole.icon className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">Daftar {selectedRole.title}</h2>
          <p className="text-slate-500 mt-2">{selectedRole.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-5 border border-slate-100">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-slate-700"
              placeholder="Nama lengkap" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-slate-700"
              placeholder="nama@email.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">No. Telepon / WhatsApp</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-slate-700"
              placeholder="08xxxxxxxxxx" />
          </div>

          {/* Pengcab Selection - Only for PENYELENGGARA */}
          {selectedRole.id === 'PENYELENGGARA' && (
            <PengcabDropdown
              pengcabList={pengcabList}
              value={form.pengcabId}
              onChange={(val) => setForm({ ...form, pengcabId: val })}
            />
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-slate-700"
              placeholder="Minimal 6 karakter" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Password *</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-slate-700"
              placeholder="Ulangi password" />
          </div>

          <button type="submit" disabled={loading}
            className={`w-full bg-gradient-to-r ${selectedRole.bgGradient} hover:opacity-90 text-white py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <HiCheckCircle size={22} />
                <span>Daftar Sekarang</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-green-700 font-semibold hover:underline">Masuk disini</Link>
        </p>
      </div>
    </div>
  );
}

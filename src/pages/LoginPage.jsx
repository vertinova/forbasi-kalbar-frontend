import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiExclamationCircle } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function getDestination(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'PENGCAB') return '/pengcab-panel';
  if (role === 'PENYELENGGARA') return '/penyelenggara';
  if (role === 'UMUM') return '/umum';
  return '/dashboard';
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      const dest = redirectUrl || getDestination(user.role);
      navigate(dest, { replace: true });
    }
  }, [user, navigate, redirectUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(identifier, password);
      toast.success(`Selamat datang, ${data.user.name}!`);
      // Use redirect URL if provided, otherwise go to role-based dashboard
      const dest = redirectUrl || getDestination(data.user.role);
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Gagal login. Silakan coba lagi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl shadow-green-200 overflow-hidden">
            <img src="/LOGO-FORBASI.png" alt="FORBASI" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Masuk</h2>
          <p className="text-gray-500 mt-2">Masuk ke akun FORBASI Kalbar Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100">
          {/* Inline error banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
              <HiExclamationCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">{error}</p>
                <p className="text-xs text-red-500 mt-1">Periksa kembali username/email dan password Anda, lalu coba lagi.</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username / Email</label>
            <input
              type="text"
              value={identifier}
              onChange={e => { setIdentifier(e.target.value); setError(''); }}
              required
              className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-700`}
              placeholder="Username FORBASI atau email"
            />
            <p className="text-xs text-gray-400 mt-1.5">Contoh: admin_pengcab_kota_bandung atau nama@email.com</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              required
              className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-700`}
              placeholder="Masukkan password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-300/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500">
          Belum punya akun?{' '}
          <Link to="/register" className="text-green-700 font-semibold hover:underline">Daftar</Link>
        </p>
      </div>
    </div>
  );
}

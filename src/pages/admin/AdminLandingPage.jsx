import { useState, useEffect, useCallback } from 'react';
import {
  HiPhotograph, HiNewspaper, HiChatAlt2, HiCog,
  HiPlus, HiPencil, HiTrash, HiEye, HiEyeOff,
  HiUpload, HiX, HiCheck, HiChevronUp, HiChevronDown,
  HiMail, HiCalendar, HiRefresh, HiSave, HiUserGroup,
  HiExclamationCircle, HiTemplate, HiStar, HiShoppingBag,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api, { getUploadUrl } from '../../lib/api';
import ConfirmModal from '../../components/ConfirmModal';
const tabs = [
  { id: 'hero', label: 'Hero Slides', icon: HiPhotograph },
  { id: 'struktur', label: 'Struktur Org', icon: HiUserGroup },
  { id: 'berita', label: 'Berita', icon: HiNewspaper },
  { id: 'feedback', label: 'Feedback', icon: HiChatAlt2 },
  { id: 'footer', label: 'Footer', icon: HiTemplate },
  { id: 'sponsor', label: 'Sponsor', icon: HiStar },
  { id: 'merchandise', label: 'Merchandise', icon: HiShoppingBag },
  { id: 'config', label: 'Konfigurasi', icon: HiCog },
];

// ══════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════
export default function AdminLandingPage() {
  const [activeTab, setActiveTab] = useState('hero');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Landing Page</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola tampilan dan konten halaman utama website</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'hero' && <HeroTab />}
      {activeTab === 'struktur' && <StrukturTab />}
      {activeTab === 'berita' && <BeritaTab />}
      {activeTab === 'feedback' && <FeedbackTab />}
      {activeTab === 'footer' && <FooterTab />}
      {activeTab === 'sponsor' && <SponsorTab />}
      {activeTab === 'merchandise' && <MerchandiseTab />}
      {activeTab === 'config' && <ConfigTab />}
    </div>
  );
}

// ══════════════════════════════════════════
// HERO SLIDES TAB
// ══════════════════════════════════════════
function HeroTab() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ caption: '', urutan: 0, aktif: true });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [uploadHealth, setUploadHealth] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/landing/hero-slides');
      setSlides(res.data || []);
    } catch (err) {
      console.error('Failed to load hero slides:', err);
      toast.error('Gagal memuat data hero slides');
      setSlides([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const checkHealth = async () => {
    try {
      const res = await api.get('/landing/upload-health');
      setUploadHealth(res.data);
    } catch (err) {
      toast.error('Gagal cek health: ' + (err.response?.data?.error || err.message));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ caption: '', urutan: 0, aktif: true });
    setFile(null);
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      toast.error('Hanya JPG, PNG, WEBP yang diizinkan');
      return;
    }
    // Validate file size (max 5MB)
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }
    setFile(f);
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!editing && !file) return toast.error('Gambar wajib diupload');
    setSaving(true);
    try {
      const fd = new FormData();
      if (file) fd.append('gambar', file);
      fd.append('caption', form.caption || '');
      fd.append('urutan', String(form.urutan));
      fd.append('aktif', String(form.aktif));

      let response;
      if (editing) {
        response = await api.put(`/landing/hero-slides/${editing.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
      } else {
        response = await api.post('/landing/hero-slides', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
      }

      // Verify the response has valid data
      const saved = response.data;
      if (saved && saved.gambar) {
        toast.success(editing ? 'Slide diperbarui' : 'Slide ditambahkan');
        console.log('Slide saved:', saved.id, saved.gambar);
      } else {
        toast.error('Response tidak valid dari server');
        console.error('Invalid response:', saved);
      }

      resetForm();
      // Small delay to ensure file is committed to disk
      setTimeout(() => load(), 300);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Gagal menyimpan';
      toast.error(msg);
      console.error('Upload error:', err.response?.status, err.response?.data);
    }
    setSaving(false);
  };

  const handleDelete = id => {
    setConfirm({
      open: true,
      title: 'Hapus Slide',
      message: 'Slide hero ini akan dihapus permanen beserta file gambarnya.',
      onConfirm: async () => {
        try {
          await api.delete(`/landing/hero-slides/${id}`);
          toast.success('Slide dihapus');
          load();
        } catch { toast.error('Gagal menghapus'); }
        setConfirm(null);
      }
    });
  };

  const startEdit = s => {
    setEditing(s);
    setForm({ caption: s.caption || '', urutan: s.urutan, aktif: s.aktif });
    setPreview(s.gambar ? getUploadUrl(s.gambar) : null);
    setFile(null);
    setShowForm(true);
  };

  if (loading) return <LoadingBox />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{slides.length} slide hero terdaftar</p>
          <button onClick={checkHealth} className="text-xs text-gray-400 hover:text-blue-500 underline">cek health</button>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <HiPlus size={16} /> Tambah Slide
        </button>
      </div>

      {/* Upload Health Info */}
      {uploadHealth && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs space-y-1">
          <p><strong>Upload Dir:</strong> {uploadHealth.uploadDir}</p>
          <p><strong>Writable:</strong> {uploadHealth.writable ? '✅ Ya' : '❌ Tidak'}</p>
          <p><strong>Files on disk:</strong> {uploadHealth.fileCount}</p>
          <p><strong>DB records:</strong> {uploadHealth.heroSlidesInDB}</p>
          {uploadHealth.orphanSlides?.length > 0 && (
            <div className="text-red-600">
              <strong>⚠️ Orphan (file hilang):</strong>
              {uploadHealth.orphanSlides.map(s => <span key={s.id} className="block ml-3">ID #{s.id}: {s.gambar}</span>)}
            </div>
          )}
          <button onClick={() => setUploadHealth(null)} className="text-blue-500 underline mt-1">tutup</button>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">{editing ? 'Edit Slide' : 'Tambah Slide Baru'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><HiX size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Gambar Background *</label>
              <div className="relative">
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100">
                    <img src={preview} alt="" className="w-full h-full object-cover"
                      onError={() => setPreview(null)} />
                    <button type="button" onClick={() => { setFile(null); setPreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-lg p-1.5 hover:bg-black/70">
                      <HiX size={14} />
                    </button>
                    {file && <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg">{file.name} ({(file.size / 1024).toFixed(0)}KB)</div>}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:bg-green-50/30 transition-colors">
                    <HiUpload className="text-gray-400 mb-2" size={28} />
                    <span className="text-sm text-gray-500">Klik untuk upload</span>
                    <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP (max 5MB)</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
                  </label>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Caption (opsional)</label>
                <input value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" placeholder="Deskripsi singkat..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Urutan</label>
                <input type="number" value={form.urutan} onChange={e => setForm(p => ({ ...p, urutan: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.aktif} onChange={e => setForm(p => ({ ...p, aktif: e.target.checked }))} className="sr-only peer" />
                <div className="w-9 h-5 rounded-full bg-gray-200 peer-checked:bg-green-500 relative transition-colors after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
                <span className="text-sm text-gray-600">Aktif</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <HiCheck size={16} />}
                {editing ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map(s => {
          const imgUrl = getUploadUrl(s.gambar);
          return (
            <div key={s.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="relative h-40 bg-gray-100">
                <img src={imgUrl} alt={s.caption || ''} className="w-full h-full object-cover"
                  onError={e => { e.target.onerror = null; e.target.src = ''; e.target.className = 'hidden'; e.target.parentElement.classList.add('flex', 'items-center', 'justify-center'); e.target.insertAdjacentHTML('afterend', '<div class="text-center"><svg class="w-8 h-8 text-red-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg><p class="text-xs text-red-400 mt-1">Gambar tidak ditemukan</p></div>'); }} />
                {!s.aktif && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">Nonaktif</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-lg font-medium">#{s.urutan}</div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 truncate">{s.caption || '(Tanpa caption)'}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate" title={s.gambar}>{s.gambar}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => startEdit(s)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-green-600 bg-gray-50 hover:bg-green-50 py-2 rounded-lg transition-colors">
                    <HiPencil size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 py-2 px-3 rounded-lg transition-colors">
                    <HiTrash size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {slides.length === 0 && !showForm && <EmptyState text="Belum ada hero slide" action="Tambah Slide" onClick={() => setShowForm(true)} />}
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════
// BERITA TAB
// ══════════════════════════════════════════
function BeritaTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ judul: '', ringkasan: '', konten: '', penulis: '', aktif: true });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/landing/berita');
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to load berita:', err);
      toast.error('Gagal memuat berita');
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ judul: '', ringkasan: '', konten: '', penulis: '', aktif: true });
    setFile(null);
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      toast.error('Hanya JPG, PNG, WEBP yang diizinkan');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }
    setFile(f);
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.judul.trim()) return toast.error('Judul wajib diisi');
    setSaving(true);
    try {
      const fd = new FormData();
      if (file) fd.append('gambar', file);
      fd.append('judul', form.judul);
      fd.append('ringkasan', form.ringkasan || '');
      fd.append('konten', form.konten || '');
      fd.append('penulis', form.penulis || '');
      fd.append('aktif', String(form.aktif));

      let response;
      if (editing) {
        response = await api.put(`/landing/berita/${editing.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
      } else {
        response = await api.post('/landing/berita', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
      }

      const saved = response.data;
      if (saved && saved.id) {
        toast.success(editing ? 'Berita diperbarui' : 'Berita ditambahkan');
        console.log('Berita saved:', saved.id, saved.gambar);
      } else {
        toast.error('Response tidak valid dari server');
        console.error('Invalid response:', saved);
      }

      resetForm();
      setTimeout(() => load(), 300);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Gagal menyimpan';
      toast.error(msg);
      console.error('Berita upload error:', err.response?.status, err.response?.data);
    }
    setSaving(false);
  };

  const handleDelete = id => {
    setConfirm({
      open: true,
      title: 'Hapus Berita',
      message: 'Berita ini akan dihapus permanen beserta file gambarnya.',
      onConfirm: async () => {
        try {
          await api.delete(`/landing/berita/${id}`);
          toast.success('Berita dihapus');
          load();
        } catch { toast.error('Gagal menghapus'); }
        setConfirm(null);
      }
    });
  };

  const startEdit = b => {
    setEditing(b);
    setForm({ judul: b.judul, ringkasan: b.ringkasan || '', konten: b.konten || '', penulis: b.penulis || '', aktif: b.aktif });
    setPreview(b.gambar ? getUploadUrl(b.gambar) : null);
    setFile(null);
    setShowForm(true);
  };

  if (loading) return <LoadingBox />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} berita</p>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <HiPlus size={16} /> Tambah Berita
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">{editing ? 'Edit Berita' : 'Tambah Berita Baru'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><HiX size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Gambar Sampul</label>
              {preview ? (
                <div className="relative rounded-xl overflow-hidden h-44 bg-gray-100">
                  <img src={preview} alt="" className="w-full h-full object-cover"
                    onError={() => setPreview(null)} />
                  <button type="button" onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-lg p-1.5 hover:bg-black/70"><HiX size={14} /></button>
                  {file && <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg">{file.name} ({(file.size / 1024).toFixed(0)}KB)</div>}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:bg-green-50/30 transition-colors">
                  <HiUpload className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-500">Upload gambar sampul</span>
                  <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP (max 5MB)</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
                </label>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Judul *</label>
                <input value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" placeholder="Judul berita..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Penulis</label>
                <input value={form.penulis} onChange={e => setForm(p => ({ ...p, penulis: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" placeholder="Nama penulis..." />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Ringkasan</label>
              <textarea value={form.ringkasan} onChange={e => setForm(p => ({ ...p, ringkasan: e.target.value }))} rows={2}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none resize-none" placeholder="Ringkasan singkat..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Konten</label>
              <textarea value={form.konten} onChange={e => setForm(p => ({ ...p, konten: e.target.value }))} rows={5}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none resize-none" placeholder="Isi berita..." />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.aktif} onChange={e => setForm(p => ({ ...p, aktif: e.target.checked }))} className="sr-only peer" />
                <div className="w-9 h-5 rounded-full bg-gray-200 peer-checked:bg-green-500 relative transition-colors after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
                <span className="text-sm text-gray-600">Publikasi</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <HiCheck size={16} />}
                {editing ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {items.map(b => (
          <div key={b.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group">
            <div className="w-20 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
              {b.gambar ? <img src={getUploadUrl(b.gambar)} alt="" className="w-full h-full object-cover"
                onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                : <div className="w-full h-full flex items-center justify-center"><HiNewspaper className="text-gray-300" size={24} /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{b.judul}</h4>
                {!b.aktif && <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Draft</span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{b.ringkasan || 'Tanpa ringkasan'}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                {b.penulis && <span>{b.penulis}</span>}
                <span>{new Date(b.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(b)} className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"><HiPencil size={15} /></button>
              <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><HiTrash size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !showForm && <EmptyState text="Belum ada berita" action="Tambah Berita" onClick={() => { resetForm(); setShowForm(true); }} />}
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════
// STRUKTUR ORGANISASI TAB
// ══════════════════════════════════════════
function StrukturTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ jabatan: '', nama: '', urutan: 0, aktif: true });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/landing/struktur');
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to load struktur:', err);
      toast.error('Gagal memuat data struktur');
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ jabatan: '', nama: '', urutan: 0, aktif: true });
    setFile(null);
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      toast.error('Hanya JPG, PNG, WEBP yang diizinkan');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }
    setFile(f);
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.jabatan.trim() || !form.nama.trim()) return toast.error('Jabatan dan nama wajib diisi');
    setSaving(true);
    try {
      const fd = new FormData();
      if (file) fd.append('foto', file);
      fd.append('jabatan', form.jabatan);
      fd.append('nama', form.nama);
      fd.append('urutan', String(form.urutan));
      fd.append('aktif', String(form.aktif));

      let response;
      if (editing) {
        response = await api.put(`/landing/struktur/${editing.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
      } else {
        response = await api.post('/landing/struktur', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
      }

      const saved = response.data;
      if (saved && saved.id) {
        toast.success(editing ? 'Struktur diperbarui' : 'Struktur ditambahkan');
        console.log('Struktur saved:', saved.id, saved.foto);
      } else {
        toast.error('Response tidak valid dari server');
      }

      resetForm();
      setTimeout(() => load(), 300);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Gagal menyimpan';
      toast.error(msg);
      console.error('Struktur upload error:', err.response?.status, err.response?.data);
    }
    setSaving(false);
  };

  const handleDelete = id => {
    setConfirm({
      open: true,
      title: 'Hapus Struktur',
      message: 'Data struktur organisasi ini akan dihapus permanen beserta file fotonya.',
      onConfirm: async () => {
        try {
          await api.delete(`/landing/struktur/${id}`);
          toast.success('Dihapus');
          load();
        } catch { toast.error('Gagal menghapus'); }
        setConfirm(null);
      }
    });
  };

  const startEdit = s => {
    setEditing(s);
    setForm({ jabatan: s.jabatan, nama: s.nama, urutan: s.urutan, aktif: s.aktif });
    setPreview(s.foto ? getUploadUrl(s.foto) : null);
    setFile(null);
    setShowForm(true);
  };

  if (loading) return <LoadingBox />;

  const jabatanSuggestions = ['Ketua Umum', 'Wakil Ketua', 'Sekretaris', 'Wakil Sekretaris', 'Bendahara', 'Wakil Bendahara', 'Seksi Humas', 'Seksi Kepelatihan', 'Seksi Organisasi', 'Seksi Perlengkapan'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{items.length} pengurus terdaftar</p>
          <p className="text-xs text-gray-400 mt-0.5">Kelola struktur organisasi Pengda FORBASI Kalbar</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <HiPlus size={16} /> Tambah Pengurus
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">{editing ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><HiX size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Foto Pengurus</label>
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden w-32 h-32 bg-gray-100">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setFile(null); setPreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-lg p-1.5 hover:bg-black/70"><HiX size={14} /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:bg-green-50/30 transition-colors">
                    <HiUpload className="text-gray-400 mb-1" size={24} />
                    <span className="text-xs text-gray-500">Upload</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
                  </label>
                )}
              </div>
              <div className="sm:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Jabatan *</label>
                  <input 
                    value={form.jabatan} 
                    onChange={e => setForm(p => ({ ...p, jabatan: e.target.value }))}
                    list="jabatan-suggestions"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" 
                    placeholder="Contoh: Ketua Umum, Sekretaris..." 
                  />
                  <datalist id="jabatan-suggestions">
                    {jabatanSuggestions.map(j => <option key={j} value={j} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Lengkap *</label>
                  <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" placeholder="Nama lengkap pengurus..." />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Urutan Tampil</label>
                <input type="number" value={form.urutan} onChange={e => setForm(p => ({ ...p, urutan: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.aktif} onChange={e => setForm(p => ({ ...p, aktif: e.target.checked }))} className="sr-only peer" />
                  <div className="w-9 h-5 rounded-full bg-gray-200 peer-checked:bg-green-500 relative transition-colors after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
                  <span className="text-sm text-gray-600">Tampilkan</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <HiCheck size={16} />}
                {editing ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(s => (
          <div key={s.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="relative h-48 bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
              {s.foto ? (
                <img src={getUploadUrl(s.foto)} alt={s.nama} className="w-full h-full object-cover"
                  onError={e => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<div class="absolute inset-0 flex items-center justify-center"><div class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs">Foto Error</div></div>'; }} />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-white text-3xl font-bold">
                  {s.nama?.charAt(0)?.toUpperCase()}
                </div>
              )}
              {!s.aktif && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">Nonaktif</span>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                #{s.urutan}
              </div>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">{s.jabatan}</p>
              <h4 className="text-sm font-bold text-gray-900">{s.nama}</h4>
              <div className="flex items-center justify-center gap-2 mt-3">
                <button onClick={() => startEdit(s)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-green-600 bg-gray-50 hover:bg-green-50 py-2 rounded-lg transition-colors">
                  <HiPencil size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(s.id)} className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 py-2 px-3 rounded-lg transition-colors">
                  <HiTrash size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !showForm && <EmptyState text="Belum ada struktur organisasi" action="Tambah Pengurus" onClick={() => setShowForm(true)} />}
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════
// FEEDBACK TAB
// ══════════════════════════════════════════
function FeedbackTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/landing/feedback');
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to load feedback:', err);
      toast.error('Gagal memuat feedback');
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async id => {
    try {
      await api.put(`/landing/feedback/${id}/read`);
      load();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleDelete = id => {
    setConfirm({
      open: true,
      title: 'Hapus Feedback',
      message: 'Feedback ini akan dihapus permanen.',
      onConfirm: async () => {
        try {
          await api.delete(`/landing/feedback/${id}`);
          toast.success('Dihapus');
          load();
        } catch { toast.error('Gagal menghapus'); }
        setConfirm(null);
      }
    });
  };

  if (loading) return <LoadingBox />;

  const unread = items.filter(f => !f.dibaca).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500">{items.length} feedback</p>
        {unread > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unread} baru</span>}
      </div>

      <div className="space-y-3">
        {items.map(f => (
          <div key={f.id}
            className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
              f.dibaca ? 'border-gray-200' : 'border-green-200 ring-1 ring-green-100'
            }`}>
            <div className="flex items-start gap-4 p-4 cursor-pointer" onClick={() => { setExpanded(expanded === f.id ? null : f.id); if (!f.dibaca) markRead(f.id); }}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                f.dibaca ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'
              }`}>
                <HiChatAlt2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-900">{f.nama}</h4>
                  {!f.dibaca && <span className="w-2 h-2 rounded-full bg-green-500" />}
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <HiMail size={11} /> {f.email}
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{f.pesan}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] text-gray-400">
                  {new Date(f.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
                <button onClick={e => { e.stopPropagation(); handleDelete(f.id); }}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                  <HiTrash size={14} />
                </button>
              </div>
            </div>
            {expanded === f.id && (
              <div className="px-4 pb-4 pt-0 ml-14 animate-fadeIn">
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{f.pesan}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && <EmptyState text="Belum ada feedback masuk" />}
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════
// FOOTER TAB
// ══════════════════════════════════════════
function FooterTab() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkForm, setLinkForm] = useState({ label: '', url: '' });

  const defaults = {
    footer_description: 'Forum Baris Indonesia - Pengurus Daerah Kalimantan Barat. Wadah pembinaan dan pengembangan baris-berbaris di wilayah Kalimantan Barat.',
    footer_address: 'Jl. Asia Afrika No. 65',
    footer_city: 'Kota Bandung, Kalimantan Barat 40111',
    footer_email: 'info@forbasikalbar.id',
    footer_phone: '(022) 420-1234',
    footer_copyright: `© ${new Date().getFullYear()} Pengda Kalimantan Barat - Forum Baris Indonesia (FORBASI). All rights reserved.`,
    footer_links: [],
    footer_socials: [],
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/landing/config');
        const merged = { ...defaults };
        Object.entries(res.data).forEach(([k, v]) => {
          if (k.startsWith('footer_')) merged[k] = v;
        });
        // Parse JSON arrays
        if (typeof merged.footer_links === 'string') try { merged.footer_links = JSON.parse(merged.footer_links); } catch { merged.footer_links = []; }
        if (typeof merged.footer_socials === 'string') try { merged.footer_socials = JSON.parse(merged.footer_socials); } catch { merged.footer_socials = []; }
        if (!Array.isArray(merged.footer_links)) merged.footer_links = [];
        if (!Array.isArray(merged.footer_socials)) merged.footer_socials = [];
        setConfig(merged);
      } catch {
        setConfig(defaults);
      }
      setLoading(false);
    })();
  }, []);

  const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const addLink = () => {
    if (!linkForm.label.trim() || !linkForm.url.trim()) return;
    set('footer_links', [...(config.footer_links || []), { label: linkForm.label.trim(), url: linkForm.url.trim() }]);
    setLinkForm({ label: '', url: '' });
  };

  const removeLink = (idx) => {
    set('footer_links', (config.footer_links || []).filter((_, i) => i !== idx));
  };

  const addSocial = () => {
    set('footer_socials', [...(config.footer_socials || []), { platform: '', url: '' }]);
  };

  const updateSocial = (idx, field, value) => {
    const arr = [...(config.footer_socials || [])];
    arr[idx] = { ...arr[idx], [field]: value };
    set('footer_socials', arr);
  };

  const removeSocial = (idx) => {
    set('footer_socials', (config.footer_socials || []).filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...config };
      // Serialize arrays to JSON strings for the SiteConfig store
      payload.footer_links = JSON.stringify(config.footer_links || []);
      payload.footer_socials = JSON.stringify(config.footer_socials || []);
      await api.put('/landing/config', payload);
      toast.success('Footer berhasil disimpan');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan footer');
    }
    setSaving(false);
  };

  if (loading) return <LoadingBox />;

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none';

  return (
    <div className="space-y-6">
      {/* Brand & Description */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HiTemplate className="text-green-500" size={18} /> Deskripsi Footer
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Deskripsi Organisasi</label>
            <textarea value={config.footer_description || ''} onChange={e => set('footer_description', e.target.value)} rows={3}
              className={inputCls + ' resize-none'} placeholder="Deskripsi singkat organisasi yang tampil di footer" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Teks Copyright</label>
            <input value={config.footer_copyright || ''} onChange={e => set('footer_copyright', e.target.value)}
              className={inputCls} placeholder="© 2026 FORBASI Kalimantan Barat. All rights reserved." />
            <p className="text-[11px] text-gray-400 mt-1">Tampil di bagian paling bawah footer</p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HiMail className="text-green-500" size={18} /> Informasi Kontak
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Alamat</label>
            <input value={config.footer_address || ''} onChange={e => set('footer_address', e.target.value)}
              className={inputCls} placeholder="Jl. Asia Afrika No. 65" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Kota & Kode Pos</label>
            <input value={config.footer_city || ''} onChange={e => set('footer_city', e.target.value)}
              className={inputCls} placeholder="Kota Bandung, Kalimantan Barat 40111" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
            <input type="email" value={config.footer_email || ''} onChange={e => set('footer_email', e.target.value)}
              className={inputCls} placeholder="info@forbasikalbar.id" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Telepon</label>
            <input value={config.footer_phone || ''} onChange={e => set('footer_phone', e.target.value)}
              className={inputCls} placeholder="(022) 420-1234" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HiEye className="text-green-500" size={18} /> Tautan Cepat
        </h3>
        <p className="text-xs text-gray-400 mb-4">Kelola link navigasi yang tampil di kolom "Tautan Cepat" footer</p>

        {(config.footer_links || []).length > 0 && (
          <div className="space-y-2 mb-4">
            {(config.footer_links || []).map((link, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-800">{link.label}</span>
                  <span className="text-xs text-gray-400 ml-2">{link.url}</span>
                </div>
                <button onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600 p-1 transition-colors">
                  <HiTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
            <input value={linkForm.label} onChange={e => setLinkForm(p => ({ ...p, label: e.target.value }))}
              className={inputCls} placeholder="Pengurus Cabang" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">URL / Path</label>
            <input value={linkForm.url} onChange={e => setLinkForm(p => ({ ...p, url: e.target.value }))}
              className={inputCls} placeholder="/pengcab" onKeyDown={e => e.key === 'Enter' && addLink()} />
          </div>
          <button onClick={addLink} disabled={!linkForm.label.trim() || !linkForm.url.trim()}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
            <HiPlus size={14} /> Tambah
          </button>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HiCog className="text-green-500" size={18} /> Media Sosial
        </h3>
        <p className="text-xs text-gray-400 mb-4">Tambahkan link media sosial organisasi</p>

        {(config.footer_socials || []).length > 0 && (
          <div className="space-y-2 mb-4">
            {(config.footer_socials || []).map((social, i) => (
              <div key={i} className="flex items-center gap-3">
                <select value={social.platform} onChange={e => updateSocial(i, 'platform', e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none w-36">
                  <option value="">Pilih...</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <input value={social.url} onChange={e => updateSocial(i, 'url', e.target.value)}
                  className={inputCls + ' flex-1'} placeholder="https://instagram.com/forbasikalbar" />
                <button onClick={() => removeSocial(i)} className="text-red-400 hover:text-red-600 p-1 transition-colors">
                  <HiTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={addSocial}
          className="flex items-center gap-1.5 text-green-600 hover:text-green-700 text-sm font-medium transition-colors">
          <HiPlus size={14} /> Tambah Media Sosial
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HiEye className="text-green-500" size={18} /> Preview Footer
        </h3>
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300 rounded-xl p-6 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white shrink-0">
                  <img src="/LOGO-FORBASI.png" alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">FORBASI</p>
                  <p className="text-green-300 text-[10px] font-medium">Pengda Kalimantan Barat</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-gray-400">{config.footer_description || 'Deskripsi organisasi...'}</p>
            </div>
            <div>
              <p className="text-white font-semibold text-xs mb-2">Tautan Cepat</p>
              <ul className="space-y-1">
                {(config.footer_links || []).length > 0
                  ? (config.footer_links || []).map((l, i) => (
                    <li key={i} className="text-xs text-gray-400">{l.label}</li>
                  ))
                  : <li className="text-xs text-gray-500 italic">Belum ada tautan</li>
                }
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-xs mb-2">Kontak</p>
              <ul className="space-y-1 text-xs text-gray-400">
                {config.footer_address && <li>{config.footer_address}</li>}
                {config.footer_city && <li>{config.footer_city}</li>}
                {config.footer_email && <li>Email: {config.footer_email}</li>}
                {config.footer_phone && <li>Telp: {config.footer_phone}</li>}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-4 pt-3 text-center text-[10px] text-gray-500">
            {config.footer_copyright || '© 2026 FORBASI Kalimantan Barat'}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-green-500/15">
          {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <HiSave size={16} />}
          Simpan Footer
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// SPONSOR TAB
// ══════════════════════════════════════════
function SponsorTab() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nama: '', url: '', tier: 'sponsor' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/landing/config');
      let data = res.data?.footer_sponsors || [];
      if (typeof data === 'string') try { data = JSON.parse(data); } catch { data = []; }
      if (!Array.isArray(data)) data = [];
      setSponsors(data);
    } catch {
      setSponsors([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ nama: '', url: '', tier: 'sponsor' });
    setFile(null);
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(f.type)) {
      toast.error('Hanya JPG, PNG, WEBP, SVG yang diizinkan');
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }
    setFile(f);
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const uploadLogo = async (file) => {
    const fd = new FormData();
    fd.append('gambar', file);
    fd.append('caption', 'sponsor-logo');
    fd.append('urutan', '0');
    fd.append('aktif', 'false'); // Hidden hero slide, just for storing the file
    const res = await api.post('/landing/hero-slides', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return res.data.gambar; // Returns the path like /uploads/filename.jpg
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nama.trim()) return toast.error('Nama sponsor wajib diisi');
    setSaving(true);
    try {
      let logoPath = editing !== null ? sponsors[editing]?.logo : '';

      // Upload logo if new file provided
      if (file) {
        logoPath = await uploadLogo(file);
      }

      const item = {
        nama: form.nama.trim(),
        url: form.url.trim(),
        logo: logoPath || '',
        tier: form.tier,
      };

      const updated = [...sponsors];
      if (editing !== null) {
        updated[editing] = item;
      } else {
        updated.push(item);
      }

      await api.put('/landing/config', {
        footer_sponsors: JSON.stringify(updated),
      });

      setSponsors(updated);
      toast.success(editing !== null ? 'Sponsor diperbarui' : 'Sponsor ditambahkan');
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan sponsor');
    }
    setSaving(false);
  };

  const handleDelete = idx => {
    setConfirm({
      open: true,
      title: 'Hapus Sponsor',
      message: `Sponsor "${sponsors[idx]?.nama}" akan dihapus.`,
      onConfirm: async () => {
        try {
          const updated = sponsors.filter((_, i) => i !== idx);
          await api.put('/landing/config', {
            footer_sponsors: JSON.stringify(updated),
          });
          setSponsors(updated);
          toast.success('Sponsor dihapus');
        } catch { toast.error('Gagal menghapus'); }
        setConfirm(null);
      },
    });
  };

  const startEdit = idx => {
    const s = sponsors[idx];
    setEditing(idx);
    setForm({ nama: s.nama || '', url: s.url || '', tier: s.tier || 'sponsor' });
    setPreview(s.logo ? getUploadUrl(s.logo) : null);
    setFile(null);
    setShowForm(true);
  };

  const tierLabels = {
    utama: { label: 'Sponsor Utama', color: 'bg-yellow-100 text-yellow-700' },
    sponsor: { label: 'Sponsor', color: 'bg-blue-100 text-blue-700' },
    media_partner: { label: 'Media Partner', color: 'bg-purple-100 text-purple-700' },
    pendukung: { label: 'Pendukung', color: 'bg-gray-100 text-gray-700' },
  };

  if (loading) return <LoadingBox />;

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{sponsors.length} sponsor terdaftar</p>
          <p className="text-xs text-gray-400 mt-0.5">Logo sponsor akan tampil di footer landing page</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <HiPlus size={16} /> Tambah Sponsor
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">{editing !== null ? 'Edit Sponsor' : 'Tambah Sponsor Baru'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><HiX size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Sponsor *</label>
                <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
                  className={inputCls} placeholder="Nama perusahaan/brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Kategori</label>
                <select value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}
                  className={inputCls}>
                  <option value="utama">Sponsor Utama</option>
                  <option value="sponsor">Sponsor</option>
                  <option value="media_partner">Media Partner</option>
                  <option value="pendukung">Pendukung</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Website URL (opsional)</label>
              <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                className={inputCls} placeholder="https://example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Logo Sponsor</label>
              <div className="relative">
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden h-32 bg-gray-50 flex items-center justify-center border border-gray-200">
                    <img src={preview} alt="" className="max-h-full max-w-full object-contain p-4" onError={() => setPreview(null)} />
                    <button type="button" onClick={() => { setFile(null); setPreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-lg p-1.5 hover:bg-black/70">
                      <HiX size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:bg-green-50/30 transition-colors">
                    <HiUpload className="text-gray-400 mb-2" size={24} />
                    <span className="text-sm text-gray-500">Upload logo</span>
                    <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP, SVG (max 2MB)</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleFile} className="hidden" />
                  </label>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <HiCheck size={16} />}
                {editing !== null ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sponsor list by tier */}
      {Object.entries(tierLabels).map(([tier, { label, color }]) => {
        const items = sponsors.filter(s => s.tier === tier).map((s, _, arr) => ({ ...s, idx: sponsors.indexOf(s) }));
        if (items.length === 0) return null;
        return (
          <div key={tier} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{label}</span>
              <span className="text-xs text-gray-400">({items.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(s => (
                <div key={s.idx} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {s.logo ? (
                      <img src={getUploadUrl(s.logo)} alt={s.nama} className="max-w-full max-h-full object-contain p-1"
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <HiStar className="text-gray-300" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.nama}</p>
                    {s.url && <p className="text-xs text-gray-400 truncate">{s.url}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(s.idx)} className="text-gray-400 hover:text-green-600 p-1.5 rounded-lg hover:bg-green-50 transition-colors">
                      <HiPencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(s.idx)} className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                      <HiTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {sponsors.length === 0 && !showForm && <EmptyState text="Belum ada sponsor" action="Tambah Sponsor" onClick={() => setShowForm(true)} />}
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════
// MERCHANDISE TAB
// ══════════════════════════════════════════
function MerchandiseTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nama: '', deskripsi: '', harga: '', link: '', aktif: true });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/landing/config');
      let data = res.data?.merchandise_items || [];
      if (typeof data === 'string') try { data = JSON.parse(data); } catch { data = []; }
      if (!Array.isArray(data)) data = [];
      setItems(data);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ nama: '', deskripsi: '', harga: '', link: '', aktif: true });
    setFile(null);
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      toast.error('Hanya JPG, PNG, WEBP yang diizinkan');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }
    setFile(f);
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('gambar', file);
    fd.append('caption', 'merch-image');
    fd.append('urutan', '0');
    fd.append('aktif', 'false');
    const res = await api.post('/landing/hero-slides', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return res.data.gambar;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nama.trim()) return toast.error('Nama produk wajib diisi');
    setSaving(true);
    try {
      let gambar = editing !== null ? items[editing]?.gambar : '';

      if (file) {
        gambar = await uploadImage(file);
      }

      const item = {
        nama: form.nama.trim(),
        deskripsi: form.deskripsi.trim(),
        harga: form.harga.trim(),
        link: form.link.trim(),
        gambar: gambar || '',
        aktif: form.aktif,
      };

      const updated = [...items];
      if (editing !== null) {
        updated[editing] = item;
      } else {
        updated.push(item);
      }

      await api.put('/landing/config', {
        merchandise_items: JSON.stringify(updated),
      });

      setItems(updated);
      toast.success(editing !== null ? 'Merchandise diperbarui' : 'Merchandise ditambahkan');
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan merchandise');
    }
    setSaving(false);
  };

  const handleDelete = idx => {
    setConfirm({
      open: true,
      title: 'Hapus Merchandise',
      message: `"${items[idx]?.nama}" akan dihapus.`,
      onConfirm: async () => {
        try {
          const updated = items.filter((_, i) => i !== idx);
          await api.put('/landing/config', {
            merchandise_items: JSON.stringify(updated),
          });
          setItems(updated);
          toast.success('Merchandise dihapus');
        } catch { toast.error('Gagal menghapus'); }
        setConfirm(null);
      },
    });
  };

  const startEdit = idx => {
    const s = items[idx];
    setEditing(idx);
    setForm({ nama: s.nama || '', deskripsi: s.deskripsi || '', harga: s.harga || '', link: s.link || '', aktif: s.aktif !== false });
    setPreview(s.gambar ? getUploadUrl(s.gambar) : null);
    setFile(null);
    setShowForm(true);
  };

  const toggleAktif = async (idx) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], aktif: !updated[idx].aktif };
    try {
      await api.put('/landing/config', { merchandise_items: JSON.stringify(updated) });
      setItems(updated);
      toast.success(updated[idx].aktif ? 'Merchandise diaktifkan' : 'Merchandise dinonaktifkan');
    } catch { toast.error('Gagal mengubah status'); }
  };

  if (loading) return <LoadingBox />;

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none';

  const formatHarga = (h) => {
    if (!h) return '';
    const num = parseInt(h.replace(/\D/g, ''));
    if (isNaN(num)) return h;
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{items.length} produk merchandise</p>
          <p className="text-xs text-gray-400 mt-0.5">Kelola merchandise yang ditampilkan di landing page</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <HiPlus size={16} /> Tambah Produk
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">{editing !== null ? 'Edit Merchandise' : 'Tambah Merchandise Baru'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><HiX size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Produk *</label>
                <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
                  className={inputCls} placeholder="Kaos FORBASI Kalbar" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga</label>
                <input value={form.harga} onChange={e => setForm(p => ({ ...p, harga: e.target.value }))}
                  className={inputCls} placeholder="150000" />
                {form.harga && <p className="text-[11px] text-gray-400 mt-1">{formatHarga(form.harga)}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Deskripsi</label>
              <textarea value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))} rows={2}
                className={inputCls + ' resize-none'} placeholder="Deskripsi singkat produk..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Link Pembelian (opsional)</label>
              <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                className={inputCls} placeholder="https://tokopedia.com/forbasi-kalbar/..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Foto Produk</label>
              <div className="relative">
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden h-48 bg-gray-50 flex items-center justify-center border border-gray-200">
                    <img src={preview} alt="" className="max-h-full max-w-full object-contain p-4" onError={() => setPreview(null)} />
                    <button type="button" onClick={() => { setFile(null); setPreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-lg p-1.5 hover:bg-black/70">
                      <HiX size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:bg-green-50/30 transition-colors">
                    <HiUpload className="text-gray-400 mb-2" size={28} />
                    <span className="text-sm text-gray-500">Upload foto produk</span>
                    <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP (max 5MB)</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
                  </label>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.aktif} onChange={e => setForm(p => ({ ...p, aktif: e.target.checked }))} className="sr-only peer" />
                <div className="w-9 h-5 rounded-full bg-gray-200 peer-checked:bg-green-500 relative transition-colors after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
                <span className="text-sm text-gray-600">Aktif</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <HiCheck size={16} />}
                {editing !== null ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="relative h-48 bg-gray-50 flex items-center justify-center">
              {item.gambar ? (
                <img src={getUploadUrl(item.gambar)} alt={item.nama} className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <HiShoppingBag className="text-gray-200" size={48} />
              )}
              {!item.aktif && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">Nonaktif</span>
                </div>
              )}
              {item.harga && (
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  {formatHarga(item.harga)}
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-gray-900">{item.nama}</p>
              {item.deskripsi && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.deskripsi}</p>}
              {item.link && <p className="text-[10px] text-blue-500 mt-1 truncate">{item.link}</p>}
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => toggleAktif(idx)} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 py-2 px-3 rounded-lg transition-colors">
                  {item.aktif ? <HiEyeOff size={13} /> : <HiEye size={13} />}
                  {item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button onClick={() => startEdit(idx)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-green-600 bg-gray-50 hover:bg-green-50 py-2 rounded-lg transition-colors">
                  <HiPencil size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(idx)} className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 py-2 px-3 rounded-lg transition-colors">
                  <HiTrash size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !showForm && <EmptyState text="Belum ada merchandise" action="Tambah Produk" onClick={() => setShowForm(true)} />}
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════
// CONFIG TAB
// ══════════════════════════════════════════
function ConfigTab() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaults = {
    hero_badge: 'Pengurus Daerah Kalimantan Barat',
    hero_title_line1: 'FORBASI',
    hero_title_line2: 'Kalimantan Barat',
    hero_subtitle: 'Platform digital terpadu untuk pengelolaan event, kejuaraan daerah, dan rekomendasi perizinan FORBASI Provinsi Kalimantan Barat',
    hero_cta_primary: 'Masuk ke Sistem',
    hero_cta_secondary: 'Lihat Event',
    section_events: true,
    section_map: true,
    section_struktur: true,
    section_berita: true,
    section_feedback: true,
    section_cta: true,
    org_ketua: '',
    org_sekretaris: '',
    org_bendahara: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/landing/config');
        setConfig({ ...defaults, ...res.data });
      } catch (err) {
        console.error('Failed to load config:', err);
        setConfig(defaults);
      }
      setLoading(false);
    })();
  }, []);

  const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/landing/config', config);
      toast.success('Konfigurasi disimpan');
    } catch (err) {
      const msg = err.response?.data?.error || 'Gagal menyimpan konfigurasi';
      toast.error(msg);
      console.error('Config save error:', err);
    }
    setSaving(false);
  };

  if (loading) return <LoadingBox />;

  return (
    <div className="space-y-6">
      {/* Hero Text */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><HiPhotograph className="text-green-500" size={18} /> Teks Hero Section</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Badge</label>
            <input value={config.hero_badge || ''} onChange={e => set('hero_badge', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Judul Baris 1 (italic)</label>
              <input value={config.hero_title_line1 || ''} onChange={e => set('hero_title_line1', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Judul Baris 2 (bold accent)</label>
              <input value={config.hero_title_line2 || ''} onChange={e => set('hero_title_line2', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Subtitle</label>
            <textarea value={config.hero_subtitle || ''} onChange={e => set('hero_subtitle', e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tombol CTA Utama</label>
              <input value={config.hero_cta_primary || ''} onChange={e => set('hero_cta_primary', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tombol CTA Sekunder</label>
              <input value={config.hero_cta_secondary || ''} onChange={e => set('hero_cta_secondary', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Organisasi */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><HiCog className="text-green-500" size={18} /> Info Organisasi Pengda</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Ketua Umum</label>
            <input value={config.org_ketua || ''} onChange={e => set('org_ketua', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Sekretaris</label>
            <input value={config.org_sekretaris || ''} onChange={e => set('org_sekretaris', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Bendahara</label>
            <input value={config.org_bendahara || ''} onChange={e => set('org_bendahara', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Telepon</label>
            <input value={config.contact_phone || ''} onChange={e => set('contact_phone', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
            <input value={config.contact_email || ''} onChange={e => set('contact_email', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Alamat</label>
            <input value={config.contact_address || ''} onChange={e => set('contact_address', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none" />
          </div>
        </div>
      </div>

      {/* Section Visibility */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><HiEye className="text-green-500" size={18} /> Visibilitas Section</h3>
        <p className="text-xs text-gray-400 mb-4">Pilih section mana yang ditampilkan di landing page</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { key: 'section_events', label: 'Event & Kegiatan' },
            { key: 'section_map', label: 'Peta Interaktif' },
            { key: 'section_struktur', label: 'Struktur Organisasi' },
            { key: 'section_berita', label: 'Berita' },
            { key: 'section_feedback', label: 'Kritik & Saran' },
            { key: 'section_merchandise', label: 'Merchandise' },
            { key: 'section_cta', label: 'Call to Action' },
          ].map(s => (
            <label key={s.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input type="checkbox" checked={config[s.key] !== false} onChange={e => set(s.key, e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 rounded-full bg-gray-200 peer-checked:bg-green-500 relative transition-colors after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
              <span className="text-sm text-gray-700">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-green-500/15">
          {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <HiSave size={16} />}
          Simpan Konfigurasi
        </button>
      </div>
    </div>
  );
}

// ── Shared Components ──
function LoadingBox() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ text, action, onClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <HiNewspaper className="text-gray-300" size={28} />
      </div>
      <p className="text-sm text-gray-500 mb-4">{text}</p>
      {action && onClick && (
        <button onClick={onClick} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
          <HiPlus size={16} /> {action}
        </button>
      )}
    </div>
  );
}

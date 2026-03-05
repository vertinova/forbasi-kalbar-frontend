import { useEffect, useState } from 'react';
import {
  HiPlus, HiPencil, HiTrash, HiCheck, HiX, HiSearch,
  HiCalendar, HiLocationMarker, HiPhotograph, HiUserGroup,
  HiUsers, HiFlag, HiAcademicCap, HiLightningBolt
} from 'react-icons/hi';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { CATEGORIES, KOMPETISI_ADMIN, KEGIATAN, categoryByKode, colorMap } from '../../lib/categories';

// Combined categories for admin (excludes KEJURCAB which is in Rekomendasi)
const ADMIN_CATEGORIES = [...KOMPETISI_ADMIN, ...KEGIATAN];

export default function AdminKejurdaPage() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(ADMIN_CATEGORIES[0].kode);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    namaKejurda: '', jenisEvent: '', targetPeserta: 'CLUB',
    tanggalMulai: '', tanggalSelesai: '', lokasi: '', deskripsi: '', statusBuka: true, earlyBirdAktif: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [confirmModal, setConfirmModal] = useState(null);


  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [activeTab, search]);

  const fetchData = async () => {
    setLoading(true);
    try { const { data } = await api.get('/kejurda'); setAllData(data); }
    catch { setAllData([]); }
    finally { setLoading(false); }
  };

  /* ── derived ── */
  const currentCat = categoryByKode[activeTab];
  const c = colorMap[currentCat?.warna] || colorMap.green;
  const pendingCount = allData.filter(d => d.statusApproval === 'PENDING' && d.jenisEvent !== 'KEJURCAB').length;

  const tabCounts = {};
  ADMIN_CATEGORIES.forEach(cat => { tabCounts[cat.kode] = allData.filter(d => (d.jenisEvent || 'KEJURDA') === cat.kode).length; });

  const data = allData.filter(d => {
    const matchTab = (d.jenisEvent || 'KEJURDA') === activeTab;
    const matchSearch = !search || d.namaKejurda?.toLowerCase().includes(search.toLowerCase()) || d.lokasi?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ── form handlers ── */
  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const resetForm = () => {
    setForm({ namaKejurda: '', jenisEvent: activeTab, targetPeserta: 'CLUB', tanggalMulai: '', tanggalSelesai: '', lokasi: '', deskripsi: '', statusBuka: true, earlyBirdAktif: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({
      namaKejurda: item.namaKejurda,
      jenisEvent: item.jenisEvent || 'KEJURDA',
      targetPeserta: item.targetPeserta || 'CLUB',
      tanggalMulai: item.tanggalMulai?.split('T')[0] || '',
      tanggalSelesai: item.tanggalSelesai?.split('T')[0] || '',
      lokasi: item.lokasi,
      deskripsi: item.deskripsi || '',
      statusBuka: item.statusBuka,
      earlyBirdAktif: item.earlyBirdAktif !== false,
    });
    setEditing(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null && k !== 'posterFile') formData.append(k, v); });
      formData.set('jenisEvent', activeTab);
      if (form.posterFile) formData.append('poster', form.posterFile);
      if (editing) {
        await api.put(`/kejurda/${editing}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Event berhasil diupdate');
      } else {
        await api.post('/kejurda', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Event berhasil dibuat');
      }
      resetForm();
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menyimpan'); }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      title: 'Hapus Event', message: 'Yakin ingin menghapus event ini? Data yang dihapus tidak dapat dikembalikan.',
      variant: 'danger', confirmText: 'Ya, Hapus',
      onConfirm: async () => {
        try { await api.delete(`/kejurda/${id}`); toast.success('Event berhasil dihapus'); fetchData(); }
        catch (err) { toast.error(err.response?.data?.error || 'Gagal menghapus'); }
        finally { setConfirmModal(null); }
      },
    });
  };

  const handleApprove = async (id) => {
    try { await api.patch(`/kejurda/${id}/approve`); toast.success('Pengajuan disetujui'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Gagal menyetujui'); }
  };

  const handleReject = async (id) => {
    const catatan = prompt('Catatan penolakan (opsional):');
    try { await api.patch(`/kejurda/${id}/reject`, { catatan }); toast.success('Pengajuan ditolak'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Gagal menolak'); }
  };

  const handleToggleEarlyBird = async (id) => {
    try {
      const { data } = await api.patch(`/kejurda/${id}/toggle-early-bird`);
      toast.success(data.message);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal toggle early bird'); }
  };

  const handleToggleRegistration = async (id) => {
    try {
      const { data } = await api.patch(`/kejurda/${id}/toggle-registration`);
      toast.success(data.message);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal toggle pendaftaran'); }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtDateShort = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  /* ── Tab button component ── */
  const TabBtn = ({ cat }) => {
    const active = activeTab === cat.kode;
    const tc = colorMap[cat.warna] || colorMap.green;
    const cnt = tabCounts[cat.kode] || 0;
    return (
      <button
        onClick={() => { setActiveTab(cat.kode); setShowForm(false); setSearch(''); }}
        className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
          ${active
            ? `bg-gradient-to-r ${tc.gradient} text-white shadow-md ${tc.shadow}`
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
      >
        <cat.Icon size={16} className={`transition-transform duration-300 ${active ? 'animate-bounce-subtle' : 'group-hover:scale-110'}`} />
        <span>{cat.nama}</span>
        <span className={`text-[10px] font-bold min-w-[20px] text-center px-1.5 py-0.5 rounded-md
          ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
          {cnt}
        </span>
      </button>
    );
  };

  /* ── Approval badge ── */
  const ApprovalBadge = ({ status }) => {
    const cfg = { PENDING: ['Menunggu', 'bg-amber-50 text-amber-700', 'bg-amber-500'], DITOLAK: ['Ditolak', 'bg-rose-50 text-rose-700', 'bg-rose-500'], DISETUJUI: ['Disetujui', 'bg-green-50 text-green-700', 'bg-green-500'] };
    const [label, cls, dotCls] = cfg[status] || cfg.DISETUJUI;
    return <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${cls}`}><span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />{label}</span>;
  };

  /* ── Status badge ── */
  const StatusBadge = ({ open }) => (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${open ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-green-500' : 'bg-gray-400'}`} />
      {open ? 'Dibuka' : 'Ditutup'}
    </span>
  );

  /* ── Input class ── */
  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none text-sm text-gray-700 bg-white transition-all placeholder:text-gray-300';

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event & Kegiatan</h1>
          <p className="text-sm text-gray-400 mt-0.5">Kelola kejuaraan, latihan gabungan, TOT & event penyelenggara</p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3.5 py-2 rounded-xl border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {pendingCount} pengajuan menunggu
          </span>
        )}
      </div>

      {/* ── Category Tabs ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        {KOMPETISI_ADMIN.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <HiFlag size={10} className="text-gray-300" /> Kompetisi
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {KOMPETISI_ADMIN.map(cat => <TabBtn key={cat.kode} cat={cat} />)}
            </div>
          </div>
        )}
        {KEGIATAN.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <HiAcademicCap size={10} className="text-gray-300" /> Kegiatan & Event
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {KEGIATAN.map(cat => <TabBtn key={cat.kode} cat={cat} />)}
            </div>
          </div>
        )}
      </div>

      {/* ── Search + Add ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Cari ${currentCat?.nama || 'event'}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none text-sm text-gray-700 bg-white transition-all placeholder:text-gray-300" />
        </div>
        <button onClick={() => { resetForm(); setForm(f => ({ ...f, jenisEvent: activeTab })); setShowForm(!showForm); }}
          className={`flex items-center justify-center gap-2 ${c.btn} text-white px-5 py-2.5 rounded-xl font-semibold transition-all text-sm whitespace-nowrap active:scale-[0.98] shadow-sm hover:shadow-md`}>
          <HiPlus size={16} /> Buat {currentCat?.nama}
        </button>
      </div>

      {/* ── Create/Edit Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className={`px-6 py-4 bg-gradient-to-r ${c.gradient} flex items-center gap-3`}>
            {currentCat?.Icon && <currentCat.Icon size={22} className="text-white/90 animate-pulse-slow" />}
            <div>
              <h3 className="font-semibold text-white text-sm">{editing ? 'Edit' : 'Buat'} {currentCat?.nama}</h3>
              <p className="text-white/70 text-xs">Isi detail informasi event</p>
            </div>
          </div>
          <div className="p-6">
            <input type="hidden" name="jenisEvent" value={activeTab} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Event <span className="text-rose-400">*</span></label>
                <input type="text" name="namaKejurda" value={form.namaKejurda} onChange={handleChange} required placeholder="Contoh: Kejurda Kalimantan Barat 2026" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1"><HiCalendar size={11} className="text-gray-400" /> Tanggal Mulai <span className="text-rose-400">*</span></label>
                <input type="date" name="tanggalMulai" value={form.tanggalMulai} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1"><HiCalendar size={11} className="text-gray-400" /> Tanggal Selesai <span className="text-rose-400">*</span></label>
                <input type="date" name="tanggalSelesai" value={form.tanggalSelesai} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1"><HiLocationMarker size={11} className="text-gray-400" /> Lokasi <span className="text-rose-400">*</span></label>
                <input type="text" name="lokasi" value={form.lokasi} onChange={handleChange} required placeholder="Kota / Venue" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1"><HiUserGroup size={11} className="text-gray-400" /> Target Peserta</label>
                <div className="flex gap-3">
                  {[['CLUB', HiUserGroup, 'Club'], ['UMUM', HiUsers, 'Umum']].map(([val, Icon, lbl]) => (
                    <label key={val} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium
                      ${form.targetPeserta === val ? (val === 'CLUB' ? 'border-green-500 bg-green-50 text-green-700' : 'border-blue-500 bg-blue-50 text-blue-700') : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                      <input type="radio" name="targetPeserta" value={val} checked={form.targetPeserta === val} onChange={handleChange} className="sr-only" />
                      <Icon size={15} /><span>{lbl}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-end pb-0.5">
                <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" name="statusBuka" checked={form.statusBuka} onChange={handleChange}
                    className="w-5 h-5 text-green-600 rounded-lg border-gray-300 focus:ring-green-500 transition" />
                  <span className="text-sm font-medium text-gray-700">Pendaftaran Dibuka</span>
                </label>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Deskripsi</label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={3} placeholder="Deskripsi singkat event..." className={inputCls} />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1"><HiPhotograph size={11} className="text-gray-400" /> Poster</label>
              <input type="file" accept="image/*" onChange={e => setForm({ ...form, posterFile: e.target.files[0] })}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gray-100 file:text-gray-700 file:font-medium file:text-xs hover:file:bg-gray-200 file:transition-colors cursor-pointer" />
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button type="submit" className={`${c.btn} text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] shadow-sm hover:shadow-md`}>
                {editing ? 'Update' : 'Simpan'}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors">Batal</button>
            </div>
          </div>
        </form>
      )}

      {/* ── Data Table / Cards ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
          {currentCat?.Icon && <currentCat.Icon size={40} className="mx-auto mb-3 text-gray-300 animate-float" />}
          <p className="font-semibold text-gray-600 text-sm">Belum ada {currentCat?.nama}</p>
          <p className="text-xs text-gray-400 mt-1">Buat event baru dengan tombol di atas</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['#', 'Nama Event', 'Tanggal', 'Lokasi', 'Approval', 'Pendaftar', ...(activeTab === 'TOT' ? ['Status', 'Early Bird'] : []), 'Aksi'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider first:pl-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedData.map((item, i) => (
                    <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${item.statusApproval === 'PENDING' ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-5 py-4 text-gray-400 text-xs font-medium pl-6">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 leading-tight">{item.namaKejurda}</p>
                        {item.pengcabPengaju && <p className="text-[11px] text-gray-400 mt-0.5">oleh {item.pengcabPengaju.nama}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-600">{fmtDate(item.tanggalMulai)}</p>
                        <p className="text-[10px] text-gray-400">s/d {fmtDateShort(item.tanggalSelesai)}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">{item.lokasi}</td>
                      <td className="px-5 py-4"><ApprovalBadge status={item.statusApproval} /></td>
                      <td className="px-5 py-4">
                        <span className="text-gray-900 font-bold text-base tabular-nums">{item._count?.pendaftaran || 0}</span>
                      </td>
                      {activeTab === 'TOT' && (
                        <>
                          <td className="px-5 py-4">
                            <button onClick={() => handleToggleRegistration(item.id)} className="cursor-pointer" title={item.statusBuka ? 'Klik untuk tutup' : 'Klik untuk buka'}>
                              <StatusBadge open={item.statusBuka} />
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <button onClick={() => handleToggleEarlyBird(item.id)}
                              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                                item.earlyBirdAktif
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                              title={item.earlyBirdAktif ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}>
                              <HiLightningBolt size={12} />
                              {item.earlyBirdAktif ? 'Aktif' : 'Nonaktif'}
                            </button>
                          </td>
                        </>
                      )}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-0.5">
                          {item.statusApproval === 'PENDING' && (
                            <>
                              <button onClick={() => handleApprove(item.id)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Setujui"><HiCheck size={16} /></button>
                              <button onClick={() => handleReject(item.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors" title="Tolak"><HiX size={16} /></button>
                            </>
                          )}
                          <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors" title="Edit"><HiPencil size={16} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors" title="Hapus"><HiTrash size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-gray-50">
              {paginatedData.map((item) => (
                <div key={item.id} className={`p-4 sm:p-5 ${item.statusApproval === 'PENDING' ? 'bg-amber-50/30' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">{item.namaKejurda}</h4>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <ApprovalBadge status={item.statusApproval} />
                        {activeTab === 'TOT' && (
                          <>
                            <button onClick={() => handleToggleRegistration(item.id)} className="cursor-pointer">
                              <StatusBadge open={item.statusBuka} />
                            </button>
                            <button onClick={() => handleToggleEarlyBird(item.id)}
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                                item.earlyBirdAktif
                                  ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}>
                              <HiLightningBolt size={10} />
                              EB {item.earlyBirdAktif ? 'On' : 'Off'}
                            </button>
                          </>
                        )}
                      </div>
                      {item.pengcabPengaju && <p className="text-[10px] text-gray-400 mt-1">oleh {item.pengcabPengaju.nama}</p>}
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <div className="text-xl font-bold text-gray-900 tabular-nums">{item._count?.pendaftaran || 0}</div>
                      <div className="text-[10px] text-gray-400">pendaftar</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><HiCalendar size={12} className="text-gray-300" />{fmtDateShort(item.tanggalMulai)} - {fmtDate(item.tanggalSelesai)}</span>
                    <span className="flex items-center gap-1"><HiLocationMarker size={12} className="text-gray-300" />{item.lokasi}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {item.statusApproval === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(item.id)} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition-colors">
                          <HiCheck size={13} /> Setujui
                        </button>
                        <button onClick={() => handleReject(item.id)} className="flex items-center gap-1 text-xs bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg font-medium hover:bg-rose-100 transition-colors">
                          <HiX size={13} /> Tolak
                        </button>
                      </>
                    )}
                    <button onClick={() => handleEdit(item)} className="flex items-center gap-1 text-xs bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg font-medium hover:bg-sky-100 transition-colors">
                      <HiPencil size={13} /> Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 text-xs bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg font-medium hover:bg-rose-100 transition-colors">
                      <HiTrash size={13} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={data.length} itemsPerPage={ITEMS_PER_PAGE} />
        </>
      )}

      <ConfirmModal open={!!confirmModal} title={confirmModal?.title} message={confirmModal?.message} variant={confirmModal?.variant} confirmText={confirmModal?.confirmText} onConfirm={confirmModal?.onConfirm} onCancel={() => setConfirmModal(null)} />
    </div>
  );
}

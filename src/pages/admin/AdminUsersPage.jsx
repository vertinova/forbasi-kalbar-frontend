import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HiSearch, HiUser, HiMail, HiPhone, HiPencil, HiX, HiFilter, HiEye, HiEyeOff, HiLockClosed, HiUsers, HiGlobe, HiRefresh, HiShieldCheck, HiKey, HiOfficeBuilding, HiDownload, HiIdentification } from 'react-icons/hi';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import Select from '../../components/Select';
import * as XLSX from 'xlsx';

const roleConfig = {
  ADMIN: { label: 'Admin', bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' },
  PENGCAB: { label: 'Pengcab', bg: 'bg-sky-500/10', text: 'text-sky-600', dot: 'bg-sky-500' },
  USER: { label: 'User', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
  PENYELENGGARA: { label: 'Penyelenggara', bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500' },
  pengcab: { label: 'Pengcab', bg: 'bg-sky-500/10', text: 'text-sky-600', dot: 'bg-sky-500' },
  user: { label: 'Anggota', bg: 'bg-violet-500/10', text: 'text-violet-600', dot: 'bg-violet-500' },
  admin: { label: 'Admin', bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' },
  admin_pengda: { label: 'Pengda', bg: 'bg-rose-500/10', text: 'text-rose-600', dot: 'bg-rose-500' },
};

const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-400 outline-none transition-all';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('local');
  // ── Local Users State ──
  const [users, setUsers] = useState([]);
  const [pengcabList, setPengcabList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPengcab, setFilterPengcab] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: '', pengcabId: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ── FORBASI Members State ──
  const [forbasiMembers, setForbasiMembers] = useState([]);
  const [forbasiLoading, setForbasiLoading] = useState(false);
  const [forbasiSearch, setForbasiSearch] = useState('');
  const [forbasiRole, setForbasiRole] = useState('');
  const [forbasiPage, setForbasiPage] = useState(1);

  // ── Anggota KTA State ──
  const [anggotaKta, setAnggotaKta] = useState([]);
  const [anggotaKtaLoading, setAnggotaKtaLoading] = useState(false);
  const [anggotaKtaSearch, setAnggotaKtaSearch] = useState('');
  const [anggotaKtaStatus, setAnggotaKtaStatus] = useState('AKTIF');
  const [anggotaKtaPage, setAnggotaKtaPage] = useState(1);
  const [selectedAnggota, setSelectedAnggota] = useState(null);
  const [anggotaKtaCacheAge, setAnggotaKtaCacheAge] = useState(0);

  // ── Stats State ──
  const [stats, setStats] = useState(null);

  // ── Password Reset Modal ──
  const [resetModal, setResetModal] = useState(null); // { id, name, type: 'local' | 'forbasi' }
  const [resetPw, setResetPw] = useState('');
  const [resetShowPw, setResetShowPw] = useState(false);
  const [resetting, setResetting] = useState(false);

  // ── Confirm Modal ──
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchPengcab();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filterPengcab, filterRole]);

  useEffect(() => {
    if (activeTab === 'forbasi' && forbasiMembers.length === 0) {
      fetchForbasiMembers();
    }
    if (activeTab === 'anggotaKta' && anggotaKta.length === 0) {
      fetchAnggotaKta();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterPengcab) params.pengcabId = filterPengcab;
      if (filterRole) params.role = filterRole;
      const { data } = await api.get('/admin-users', { params });
      setUsers(data);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  const fetchPengcab = async () => {
    try {
      const { data } = await api.get('/pengcab');
      setPengcabList(data);
    } catch { setPengcabList([]); }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin-users/stats');
      setStats(data);
    } catch { /* ignore */ }
  };

  const fetchForbasiMembers = async () => {
    setForbasiLoading(true);
    try {
      const params = {};
      if (forbasiRole) params.role = forbasiRole;
      if (forbasiSearch) params.search = forbasiSearch;
      params.per_page = 200;
      const { data } = await api.get('/admin-users/forbasi-accounts', { params });
      setForbasiMembers(data.data || []);
    } catch { setForbasiMembers([]); }
    finally { setForbasiLoading(false); }
  };

  const fetchAnggotaKta = async (forceRefresh = false) => {
    setAnggotaKtaLoading(true);
    try {
      const params = { ktaStatus: anggotaKtaStatus };
      if (anggotaKtaSearch) params.search = anggotaKtaSearch;
      if (forceRefresh) params.refresh = 'true';
      const { data } = await api.get('/admin-users/anggota-kta', { params });
      setAnggotaKta(data.data || []);
      setAnggotaKtaCacheAge(data.cacheAge || 0);
      if (forceRefresh) toast.success('Data anggota berhasil diperbarui dari FORBASI');
    } catch { setAnggotaKta([]); }
    finally { setAnggotaKtaLoading(false); }
  };

  // Export Anggota KTA to Excel
  const exportAnggotaKtaToExcel = useCallback(() => {
    if (!anggotaKta.length) return;
    const now = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const year = new Date().getFullYear();
    const statusLabel = anggotaKtaStatus === 'AKTIF' ? `KTA_Aktif_${year}` : 'Semua';

    const excelData = anggotaKta.map((m, i) => ({
      'No': i + 1,
      'Nama Club': m.club_name || '-',
      'Username': m.username || '-',
      'Kota/Kabupaten': m.city_name || '-',
      'Sekolah/Instansi': m.school_name || '-',
      'Pelatih': m.coach_name || '-',
      'Ketua': m.leader_name || '-',
      'Alamat Club': m.club_address || '-',
      'Email': m.email || '-',
      'Telepon': m.phone || '-',
      'Status KTA': m.kta_status || '-',
      'KTA ID': m.kta_number || '-',
      'Tanggal Terbit KTA': m.kta_issued_at ? m.kta_issued_at.split(' ')[0] : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const colWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...excelData.map(r => String(r[key] || '').length)) + 2
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Anggota KTA');
    XLSX.writeFile(wb, `Anggota_FORBASI_Kalbar_${statusLabel}_${now}.xlsx`);
    toast.success(`Data ${anggotaKta.length} anggota berhasil diexport`);
  }, [anggotaKta, anggotaKtaStatus]);

  // ── Local user filtering + pagination ──
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── FORBASI filtering + pagination ──
  const filteredForbasi = forbasiMembers.filter(m =>
    (m.club_name || m.name || m.username || '').toLowerCase().includes(forbasiSearch.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(forbasiSearch.toLowerCase()) ||
    (m.username || '').toLowerCase().includes(forbasiSearch.toLowerCase())
  );
  const forbasiTotalPages = Math.ceil(filteredForbasi.length / ITEMS_PER_PAGE);
  const paginatedForbasi = filteredForbasi.slice((forbasiPage - 1) * ITEMS_PER_PAGE, forbasiPage * ITEMS_PER_PAGE);

  // ── Anggota KTA filtering + pagination ──
  const filteredAnggotaKta = anggotaKta.filter(m =>
    (m.club_name || '').toLowerCase().includes(anggotaKtaSearch.toLowerCase()) ||
    (m.city_name || '').toLowerCase().includes(anggotaKtaSearch.toLowerCase()) ||
    (m.school_name || '').toLowerCase().includes(anggotaKtaSearch.toLowerCase()) ||
    (m.username || '').toLowerCase().includes(anggotaKtaSearch.toLowerCase())
  );
  const anggotaKtaTotalPages = Math.ceil(filteredAnggotaKta.length / ITEMS_PER_PAGE);
  const paginatedAnggotaKta = filteredAnggotaKta.slice((anggotaKtaPage - 1) * ITEMS_PER_PAGE, anggotaKtaPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, filterPengcab, filterRole]);
  useEffect(() => { setForbasiPage(1); }, [forbasiSearch, forbasiRole]);
  useEffect(() => { setAnggotaKtaPage(1); }, [anggotaKtaSearch]);

  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({
      name: u.name || '',
      phone: u.phone || '',
      role: u.role || 'USER',
      pengcabId: u.pengcabId || '',
      newPassword: '',
    });
    setShowPw(false);
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) return toast.error('Nama tidak boleh kosong');
    setSaving(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || null,
        role: editForm.role,
        pengcabId: editForm.pengcabId ? parseInt(editForm.pengcabId) : null,
      };
      if (editForm.newPassword) payload.newPassword = editForm.newPassword;

      await api.put(`/admin-users/${editUser.id}`, payload);
      toast.success('Data user berhasil diupdate');
      setEditUser(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal update user');
    } finally {
      setSaving(false);
    }
  };

  // ── Password Reset Handlers ──
  const openResetPassword = (account, type) => {
    setResetModal({
      id: type === 'forbasi' ? account.id : account.id,
      forbasiId: type === 'forbasi' ? account.id : account.forbasiId,
      name: type === 'forbasi' ? (account.club_name || account.name || account.username) : account.name,
      type,
    });
    setResetPw('');
    setResetShowPw(false);
  };

  const handleResetPassword = async () => {
    if (!resetPw || resetPw.length < 6) return toast.error('Password baru minimal 6 karakter');
    setResetting(true);
    try {
      if (resetModal.type === 'local') {
        await api.put(`/admin-users/${resetModal.id}`, { newPassword: resetPw });
        toast.success(`Password lokal ${resetModal.name} berhasil direset`);
      } else {
        await api.post('/admin-users/forbasi-reset-password', {
          forbasiId: resetModal.forbasiId || resetModal.id,
          newPassword: resetPw,
        });
        toast.success(`Password FORBASI ${resetModal.name} berhasil direset`);
      }
      setResetModal(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal reset password');
    } finally {
      setResetting(false);
    }
  };

  const RoleBadge = ({ role }) => {
    const cfg = roleConfig[role] || roleConfig.USER;
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  const tabs = [
    { key: 'local', label: 'Users Lokal', icon: HiUsers, count: users.length },
    { key: 'forbasi', label: 'Anggota FORBASI', icon: HiGlobe, count: forbasiMembers.length },
    { key: 'anggotaKta', label: 'Lihat Anggota', icon: HiIdentification, count: anggotaKta.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Kelola Users</h1>
        <p className="text-sm text-gray-400 mt-1">Manajemen akun lokal & anggota FORBASI seluruh wilayah Pengda Kalbar</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeIn">
          <StatCard icon={HiUsers} label="Total Users" value={stats.totalUsers} color="green" />
          <StatCard icon={HiShieldCheck} label="Admin" value={stats.roleStats?.ADMIN || 0} color="green" />
          <StatCard icon={HiOfficeBuilding} label="Pengcab" value={stats.roleStats?.PENGCAB || 0} color="sky" />
          <StatCard icon={HiUser} label="User / Penyelenggara" value={(stats.roleStats?.USER || 0) + (stats.roleStats?.PENYELENGGARA || 0)} color="violet" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100/80 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm shadow-gray-200/50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                activeTab === tab.key ? 'bg-green-500/10 text-green-600' : 'bg-gray-200/80 text-gray-400'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════ LOCAL USERS TAB ═══════════════ */}
      {activeTab === 'local' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input type="text" placeholder="Cari nama, email, atau telepon..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-400 outline-none bg-white transition-all" />
            </div>
            <Select full={false} value={filterPengcab} onChange={e => setFilterPengcab(e.target.value)}>
              <option value="">Semua Pengcab</option>
              {pengcabList.map(p => <option key={p.id} value={p.id}>{p.nama} — {p.kota}</option>)}
            </Select>
            <Select full={false} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">Semua Role</option>
              <option value="ADMIN">Admin</option>
              <option value="PENGCAB">Pengcab</option>
              <option value="USER">User</option>
              <option value="PENYELENGGARA">Penyelenggara</option>
            </Select>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState icon={HiUser} title="Tidak ada user ditemukan" subtitle="Coba ubah filter atau kata kunci pencarian" />
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm shadow-gray-100/50">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm table-modern">
                    <thead>
                      <tr className="bg-gray-50/60">
                        {['Nama', 'Email', 'Telepon', 'Pengcab', 'Role', 'KTA', 'Aksi'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/60">
                      {paginatedData.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="px-4 py-3.5 font-semibold text-gray-900">{u.name}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{u.email}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{u.phone || '-'}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{u.pengcab?.nama || '-'}</td>
                          <td className="px-4 py-3.5"><RoleBadge role={u.role} /></td>
                          <td className="px-4 py-3.5">
                            {u.forbasiId ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-green-500/10 text-green-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />FORBASI
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => openEdit(u)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1.5 rounded-lg hover:bg-green-500/15 transition-colors">
                                <HiPencil size={13} /> Edit
                              </button>
                              <button onClick={() => openResetPassword(u, 'local')}
                                className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-1.5 rounded-lg hover:bg-amber-500/15 transition-colors"
                                title="Reset Password">
                                <HiKey size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100/60 mobile-card-list">
                  {paginatedData.map(u => (
                    <div key={u.id} className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md shadow-green-500/20">
                            <HiUser className="text-white" size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{u.name}</h4>
                            <RoleBadge role={u.role} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(u)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors">
                            <HiPencil size={16} />
                          </button>
                          <button onClick={() => openResetPassword(u, 'local')} className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors">
                            <HiKey size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-2"><HiMail size={13} className="text-gray-300" /><span className="truncate">{u.email}</span></div>
                        {u.phone && <div className="flex items-center gap-2"><HiPhone size={13} className="text-gray-300" /><span>{u.phone}</span></div>}
                        {u.pengcab && <div className="flex items-center gap-2"><HiFilter size={13} className="text-gray-300" /><span>{u.pengcab.nama}</span></div>}
                        {u.forbasiId && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-green-500/10 text-green-600">
                            <HiGlobe size={10} /> FORBASI
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />
            </>
          )}
        </div>
      )}

      {/* ═══════════════ FORBASI MEMBERS TAB ═══════════════ */}
      {activeTab === 'forbasi' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input type="text" placeholder="Cari nama, email, atau username..." value={forbasiSearch} onChange={e => setForbasiSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-400 outline-none bg-white transition-all" />
            </div>
            <Select full={false} value={forbasiRole} onChange={e => { setForbasiRole(e.target.value); }}>
              <option value="">Semua Role</option>
              <option value="pengcab">Pengcab</option>
              <option value="user">Anggota</option>
              <option value="admin_pengda">Admin Pengda</option>
            </Select>
            <button onClick={fetchForbasiMembers}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all active:scale-[0.97]">
              <HiRefresh size={16} className={forbasiLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh API</span>
            </button>
          </div>

          {/* FORBASI Stats Summary */}
          {forbasiMembers.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MiniStat label="Total Akun FORBASI" value={forbasiMembers.length} />
              <MiniStat label="Pengcab" value={forbasiMembers.filter(m => m.role === 'pengcab').length} />
              <MiniStat label="Anggota" value={forbasiMembers.filter(m => m.role === 'user').length} />
            </div>
          )}

          {forbasiLoading ? (
            <LoadingSpinner />
          ) : filteredForbasi.length === 0 ? (
            <EmptyState icon={HiGlobe} title="Tidak ada data anggota FORBASI"
              subtitle={forbasiMembers.length === 0 ? 'Klik "Refresh API" untuk mengambil data dari FORBASI' : 'Coba ubah filter atau kata kunci pencarian'} />
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm shadow-gray-100/50">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm table-modern">
                    <thead>
                      <tr className="bg-gray-50/60">
                        {['#', 'Nama / Club', 'Username', 'Email', 'Kota', 'Role', 'Aksi'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/60">
                      {paginatedForbasi.map((m, idx) => (
                        <tr key={m.id || idx} className="hover:bg-gray-50/40 transition-colors">
                          <td className="px-4 py-3.5 text-gray-300 text-xs font-mono">{(forbasiPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-gray-900 text-sm">{m.club_name || m.name || '-'}</div>
                            {m.phone && <div className="text-[11px] text-gray-400 mt-0.5">{m.phone}</div>}
                          </td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs font-mono">{m.username || '-'}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{m.email || '-'}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{m.city_name || m.region || '-'}</td>
                          <td className="px-4 py-3.5"><RoleBadge role={m.role || 'user'} /></td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => openResetPassword(m, 'forbasi')}
                              className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-1.5 rounded-lg hover:bg-amber-500/15 transition-colors"
                              title="Reset Password FORBASI">
                              <HiKey size={13} /> Reset PW
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100/60 mobile-card-list">
                  {paginatedForbasi.map((m, idx) => (
                    <div key={m.id || idx} className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
                            <HiGlobe className="text-white" size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{m.club_name || m.name || m.username}</h4>
                            <RoleBadge role={m.role || 'user'} />
                          </div>
                        </div>
                        <button onClick={() => openResetPassword(m, 'forbasi')} className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors">
                          <HiKey size={16} />
                        </button>
                      </div>
                      <div className="space-y-1.5 text-xs text-gray-500">
                        {m.username && <div className="flex items-center gap-2"><HiUser size={13} className="text-gray-300" /><span className="font-mono">{m.username}</span></div>}
                        {m.email && <div className="flex items-center gap-2"><HiMail size={13} className="text-gray-300" /><span className="truncate">{m.email}</span></div>}
                        {m.phone && <div className="flex items-center gap-2"><HiPhone size={13} className="text-gray-300" /><span>{m.phone}</span></div>}
                        {(m.city_name || m.region) && <div className="flex items-center gap-2"><HiFilter size={13} className="text-gray-300" /><span>{m.city_name || m.region}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Pagination currentPage={forbasiPage} totalPages={forbasiTotalPages} onPageChange={setForbasiPage} totalItems={filteredForbasi.length} itemsPerPage={ITEMS_PER_PAGE} />
            </>
          )}
        </div>
      )}

      {/* ═══════════════ ANGGOTA KTA TAB ═══════════════ */}
      {activeTab === 'anggotaKta' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input type="text" placeholder="Cari nama club, kota, sekolah..." value={anggotaKtaSearch} onChange={e => setAnggotaKtaSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-400 outline-none bg-white transition-all" />
            </div>
            <Select full={false} value={anggotaKtaStatus} onChange={e => { setAnggotaKtaStatus(e.target.value); setAnggotaKta([]); }}>
              <option value="AKTIF">KTA Aktif (Terbit 2026)</option>
              <option value="">Semua Anggota</option>
            </Select>
            <button onClick={() => fetchAnggotaKta(false)} disabled={anggotaKtaLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all active:scale-[0.97] disabled:opacity-50">
              <HiRefresh size={16} className={anggotaKtaLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{anggotaKtaLoading ? 'Loading...' : 'Muat Data'}</span>
            </button>
            <button onClick={() => fetchAnggotaKta(true)} disabled={anggotaKtaLoading}
              className="flex items-center gap-2 px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-[0.97] disabled:opacity-50"
              title="Paksa refresh data dari FORBASI (lambat)">
              <HiRefresh size={16} />
            </button>
            <button onClick={exportAnggotaKtaToExcel} disabled={!anggotaKta.length}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
              <HiDownload size={16} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>

          {/* Cache Info */}
          {anggotaKta.length > 0 && anggotaKtaCacheAge > 0 && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <span>Data dari cache ({Math.floor(anggotaKtaCacheAge / 60)}m {anggotaKtaCacheAge % 60}s lalu)</span>
              <span className="text-gray-300">•</span>
              <button onClick={() => fetchAnggotaKta(true)} className="text-amber-500 hover:text-amber-600 font-medium">
                Refresh dari FORBASI
              </button>
            </div>
          )}

          {/* Stats Summary */}
          {anggotaKta.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MiniStat label="Total Anggota" value={anggotaKta.length} />
              <MiniStat label="KTA Aktif" value={anggotaKta.filter(m => m.is_active).length} />
              <MiniStat label="Hasil Filter" value={filteredAnggotaKta.length} />
            </div>
          )}

          {anggotaKtaLoading ? (
            <LoadingSpinner />
          ) : filteredAnggotaKta.length === 0 ? (
            <EmptyState icon={HiIdentification} title="Tidak ada data anggota"
              subtitle={anggotaKta.length === 0 ? 'Klik "Refresh" untuk mengambil data anggota dengan KTA' : 'Coba ubah filter atau kata kunci pencarian'} />
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm shadow-gray-100/50">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm table-modern">
                    <thead>
                      <tr className="bg-gray-50/60">
                        {['#', 'Nama Club', 'Kota/Kab', 'Sekolah', 'Pelatih', 'Status KTA', 'KTA ID', 'Terbit', 'Aksi'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/60">
                      {paginatedAnggotaKta.map((m, idx) => (
                        <tr key={m.id || idx} className="hover:bg-gray-50/40 transition-colors">
                          <td className="px-4 py-3.5 text-gray-300 text-xs font-mono">{(anggotaKtaPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-gray-900 text-sm">{m.club_name || '-'}</div>
                            {m.username && <div className="text-[11px] text-gray-400 mt-0.5 font-mono">{m.username}</div>}
                          </td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{m.city_name || '-'}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{m.school_name || '-'}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{m.coach_name || '-'}</td>
                          <td className="px-4 py-3.5">
                            {m.is_active ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-green-500/10 text-green-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Aktif 2026
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500">
                                {m.kta_status || 'Tidak Aktif'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs font-mono">{m.kta_number || '-'}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{m.kta_issued_at ? m.kta_issued_at.split(' ')[0] : '-'}</td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => setSelectedAnggota(m)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/15 transition-colors">
                              <HiEye size={13} /> Cek KTA
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100/60 mobile-card-list">
                  {paginatedAnggotaKta.map((m, idx) => (
                    <div key={m.id || idx} className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50/40 transition-colors" onClick={() => setSelectedAnggota(m)}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                            <HiIdentification className="text-white" size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{m.club_name || '-'}</h4>
                            <span className="text-xs text-gray-400">{m.city_name}</span>
                          </div>
                        </div>
                        {m.is_active && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg bg-green-500/10 text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Aktif 2026
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs text-gray-500">
                        {m.school_name && m.school_name !== '-' && <div className="flex items-center gap-2"><HiOfficeBuilding size={13} className="text-gray-300" /><span>{m.school_name}</span></div>}
                        {m.coach_name && m.coach_name !== '-' && <div className="flex items-center gap-2"><HiUser size={13} className="text-gray-300" /><span>Pelatih: {m.coach_name}</span></div>}
                        {m.kta_number && m.kta_number !== '-' && <div className="flex items-center gap-2"><HiIdentification size={13} className="text-gray-300" /><span className="font-mono">{m.kta_number}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Pagination currentPage={anggotaKtaPage} totalPages={anggotaKtaTotalPages} onPageChange={setAnggotaKtaPage} totalItems={filteredAnggotaKta.length} itemsPerPage={ITEMS_PER_PAGE} />
            </>
          )}
        </div>
      )}

      {/* ═══════════════ CEK KTA MODAL ═══════════════ */}
      {selectedAnggota && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedAnggota(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/10 animate-scaleIn" onClick={e => e.stopPropagation()}>
            {/* Header with status indicator */}
            <div className={`px-6 pt-6 pb-4 ${selectedAnggota.is_active ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <HiIdentification className="text-white" size={28} />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold">Cek Status KTA</h3>
                    <p className="text-white/80 text-sm">Verifikasi keanggotaan FORBASI</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAnggota(null)} className="p-2 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors">
                  <HiX size={20} />
                </button>
              </div>
            </div>

            {/* Status Badge */}
            <div className="px-6 -mt-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg ${
                selectedAnggota.is_active 
                  ? 'bg-white text-green-600 shadow-green-200' 
                  : 'bg-white text-gray-500 shadow-gray-200'
              }`}>
                <span className={`w-3 h-3 rounded-full ${selectedAnggota.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {selectedAnggota.is_active ? 'ANGGOTA AKTIF 2026' : 'KTA TIDAK AKTIF'}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* KTA Info */}
              {selectedAnggota.is_active ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                      <HiShieldCheck className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-green-800 font-semibold text-sm">Anggota ini AKTIF dengan KTA terbit tahun 2026</p>
                      <p className="text-green-700 text-xs mt-1">
                        KTA ID: <span className="font-mono font-bold">{selectedAnggota.kta_number || '-'}</span>
                      </p>
                      {selectedAnggota.kta_issued_at && selectedAnggota.kta_issued_at !== '-' && (
                        <p className="text-green-600 text-xs mt-0.5">
                          Terbit: {selectedAnggota.kta_issued_at.split(' ')[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-400 flex items-center justify-center shrink-0">
                      <HiX className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-gray-700 font-semibold text-sm">KTA Tidak Aktif</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Status: {selectedAnggota.kta_status || 'Tidak ada KTA'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detail Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detail Anggota</h4>
                <div className="grid grid-cols-1 gap-2">
                  <DetailRow label="Nama Club" value={selectedAnggota.club_name} />
                  <DetailRow label="Username" value={selectedAnggota.username} mono />
                  <DetailRow label="Kota/Kabupaten" value={selectedAnggota.city_name} />
                  <DetailRow label="Sekolah/Instansi" value={selectedAnggota.school_name} />
                  <DetailRow label="Pelatih" value={selectedAnggota.coach_name} />
                  <DetailRow label="Ketua" value={selectedAnggota.leader_name} />
                  <DetailRow label="Email" value={selectedAnggota.email} />
                  <DetailRow label="Telepon" value={selectedAnggota.phone} />
                  <DetailRow label="Alamat" value={selectedAnggota.club_address} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button onClick={() => setSelectedAnggota(null)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ EDIT USER MODAL ═══════════════ */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setEditUser(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl shadow-black/10 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
                <p className="text-xs text-gray-400 mt-0.5">{editUser.email}</p>
              </div>
              <button onClick={() => setEditUser(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"><HiX size={18} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">No. Telepon</label>
                <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                <Select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                  <option value="USER">User</option>
                  <option value="PENGCAB">Pengcab</option>
                  <option value="ADMIN">Admin</option>
                  <option value="PENYELENGGARA">Penyelenggara</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Pengurus Cabang</label>
                <Select value={editForm.pengcabId} onChange={e => setEditForm({ ...editForm, pengcabId: e.target.value })}>
                  <option value="">— Tidak ada —</option>
                  {pengcabList.map(p => <option key={p.id} value={p.id}>{p.nama} — {p.kota}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <span className="flex items-center gap-1"><HiLockClosed size={10} /> Reset Password <span className="font-normal normal-case text-gray-300">(kosongkan jika tidak diubah)</span></span>
                </label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={editForm.newPassword}
                    onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })}
                    className={`${inputClass} pr-10`}
                    placeholder="Password baru min 6 karakter" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showPw ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all active:scale-[0.97] disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button onClick={() => setEditUser(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ RESET PASSWORD MODAL ═══════════════ */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setResetModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl shadow-black/10 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                <HiKey className="text-amber-500" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Reset Password</h3>
              <p className="text-xs text-gray-400 text-center mt-1">
                {resetModal.type === 'forbasi' ? 'Akun FORBASI' : 'Akun Lokal'}: <strong className="text-gray-600">{resetModal.name}</strong>
              </p>
            </div>
            <div className="px-6 pb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password Baru</label>
              <div className="relative">
                <input type={resetShowPw ? 'text' : 'password'} value={resetPw} onChange={e => setResetPw(e.target.value)}
                  className={`${inputClass} pr-10`} placeholder="Minimal 6 karakter" autoFocus />
                <button type="button" onClick={() => setResetShowPw(!resetShowPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                  {resetShowPw ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                </button>
              </div>
              {resetModal.type === 'forbasi' && (
                <p className="text-[11px] text-amber-500 mt-2 flex items-center gap-1">
                  <HiGlobe size={12} /> Password akan direset di server FORBASI & sinkron lokal
                </p>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handleResetPassword} disabled={resetting || resetPw.length < 6}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all active:scale-[0.97] disabled:opacity-50">
                {resetting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Mereset...
                  </span>
                ) : 'Reset Password'}
              </button>
              <button onClick={() => setResetModal(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmText={confirmModal?.confirmText}
        variant={confirmModal?.variant || 'danger'}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}

// ── Sub-components ──
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    green: 'from-green-500 to-green-600 shadow-green-500/20',
    sky: 'from-sky-500 to-sky-600 shadow-sky-500/20',
    violet: 'from-violet-500 to-violet-600 shadow-violet-500/20',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 p-4 shadow-sm shadow-gray-100/50">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-md`}>
          <Icon className="text-white" size={18} />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-gray-900">{value}</p>
          <p className="text-[11px] text-gray-400 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100/80 px-4 py-3 shadow-sm shadow-gray-100/50 flex items-center justify-between">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-lg font-extrabold text-gray-900">{value}</span>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 text-center py-20 shadow-sm shadow-gray-100/50">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
        <Icon className="text-3xl text-gray-300" />
      </div>
      <p className="font-semibold text-gray-500 text-sm">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  if (!value || value === '-') return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm text-gray-700 font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

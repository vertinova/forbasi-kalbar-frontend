import { useState, useEffect, useRef } from 'react';
import { HiPlus, HiPencil, HiTrash, HiChevronUp, HiChevronDown, HiDocumentText, HiPhotograph, HiDocument, HiCheck, HiX, HiSelector, HiHashtag, HiCalendar, HiChevronDoubleDown, HiSwitchHorizontal, HiCheckCircle, HiCloudUpload, HiPaperClip } from 'react-icons/hi';
import { TbTextSize, TbAlignLeft } from 'react-icons/tb';
import api from '../lib/api';
import toast from 'react-hot-toast';

const FIELD_TYPES = [
  { value: 'TEXT', label: 'Teks Singkat', Icon: TbTextSize, color: 'blue', bg: 'bg-blue-500', lightBg: 'bg-blue-50', lightText: 'text-blue-600' },
  { value: 'TEXTAREA', label: 'Teks Panjang', Icon: TbAlignLeft, color: 'indigo', bg: 'bg-indigo-500', lightBg: 'bg-indigo-50', lightText: 'text-indigo-600' },
  { value: 'NUMBER', label: 'Angka', Icon: HiHashtag, color: 'emerald', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', lightText: 'text-emerald-600' },
  { value: 'DATE', label: 'Tanggal', Icon: HiCalendar, color: 'orange', bg: 'bg-orange-500', lightBg: 'bg-orange-50', lightText: 'text-orange-600' },
  { value: 'SELECT', label: 'Pilihan (Dropdown)', Icon: HiChevronDoubleDown, color: 'purple', bg: 'bg-purple-500', lightBg: 'bg-purple-50', lightText: 'text-purple-600' },
  { value: 'RADIO', label: 'Pilihan (Radio)', Icon: HiSwitchHorizontal, color: 'pink', bg: 'bg-pink-500', lightBg: 'bg-pink-50', lightText: 'text-pink-600' },
  { value: 'CHECKBOX', label: 'Centang (Ya/Tidak)', Icon: HiCheckCircle, color: 'green', bg: 'bg-green-500', lightBg: 'bg-green-50', lightText: 'text-green-600' },
  { value: 'FILE_IMAGE', label: 'Upload Foto', Icon: HiPhotograph, color: 'cyan', bg: 'bg-cyan-500', lightBg: 'bg-cyan-50', lightText: 'text-cyan-600' },
  { value: 'FILE_PDF', label: 'Upload PDF', Icon: HiDocument, color: 'red', bg: 'bg-red-500', lightBg: 'bg-red-50', lightText: 'text-red-600' },
  { value: 'FILE_ANY', label: 'Upload File Apapun', Icon: HiPaperClip, color: 'gray', bg: 'bg-gray-500', lightBg: 'bg-gray-100', lightText: 'text-gray-600' },
];

const getTypeInfo = (tipe) => FIELD_TYPES.find(t => t.value === tipe) || FIELD_TYPES[0];

export default function PersyaratanFieldBuilder({ kejurdaId, onClose }) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [form, setForm] = useState({
    label: '',
    tipe: 'TEXT',
    required: true,
    options: '',
    keterangan: ''
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchFields();
  }, [kejurdaId]);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/kejurda/${kejurdaId}/persyaratan`);
      setFields(data);
    } catch (err) {
      toast.error('Gagal mengambil data persyaratan');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ label: '', tipe: 'TEXT', required: true, options: '', keterangan: '' });
    setEditing(null);
    setShowForm(false);
    setTypeDropdownOpen(false);
  };

  const handleEdit = (field) => {
    setForm({
      label: field.label,
      tipe: field.tipe,
      required: field.required,
      options: Array.isArray(field.options) ? field.options.join('\n') : '',
      keterangan: field.keterangan || ''
    });
    setEditing(field.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) return toast.error('Label field wajib diisi');

    // Parse options for SELECT/RADIO
    let options = null;
    if (['SELECT', 'RADIO'].includes(form.tipe) && form.options.trim()) {
      options = form.options.split('\n').map(o => o.trim()).filter(Boolean);
      if (options.length < 2) {
        return toast.error('Pilihan harus minimal 2 opsi');
      }
    }

    try {
      if (editing) {
        await api.put(`/kejurda/persyaratan/${editing}`, {
          ...form,
          options
        });
        toast.success('Field berhasil diupdate');
      } else {
        await api.post(`/kejurda/${kejurdaId}/persyaratan`, {
          ...form,
          options
        });
        toast.success('Field berhasil ditambahkan');
      }
      resetForm();
      fetchFields();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus field ini?')) return;
    try {
      await api.delete(`/kejurda/persyaratan/${id}`);
      toast.success('Field berhasil dihapus');
      fetchFields();
    } catch (err) {
      toast.error('Gagal menghapus field');
    }
  };

  const handleToggleAktif = async (field) => {
    try {
      await api.put(`/kejurda/persyaratan/${field.id}`, { aktif: !field.aktif });
      toast.success(field.aktif ? 'Field dinonaktifkan' : 'Field diaktifkan');
      fetchFields();
    } catch (err) {
      toast.error('Gagal update status');
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    const fieldOrders = newFields.map((f, i) => ({ id: f.id, urutan: i }));
    try {
      await api.patch(`/kejurda/${kejurdaId}/persyaratan/reorder`, { fieldOrders });
      setFields(newFields);
    } catch { toast.error('Gagal mengubah urutan'); }
  };

  const handleMoveDown = async (index) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    const fieldOrders = newFields.map((f, i) => ({ id: f.id, urutan: i }));
    try {
      await api.patch(`/kejurda/${kejurdaId}/persyaratan/reorder`, { fieldOrders });
      setFields(newFields);
    } catch { toast.error('Gagal mengubah urutan'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Form Persyaratan Pendaftaran</h2>
            <p className="text-xs text-gray-400 mt-0.5">Konfigurasi field yang harus diisi peserta saat mendaftar</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <HiX size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Add Field Button */}
          {!showForm && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50/50 transition-all"
            >
              <HiPlus size={18} />
              <span className="font-semibold text-sm">Tambah Field Baru</span>
            </button>
          )}

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Label Field <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={e => setForm({ ...form, label: e.target.value })}
                    placeholder="Contoh: Foto KTP, Surat Keterangan Sehat"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/30 focus:border-green-400 outline-none text-sm"
                  />
                </div>

                <div className="relative" ref={dropdownRef}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Tipe Field
                  </label>
                  {/* Custom Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${
                      typeDropdownOpen 
                        ? 'border-green-400 ring-2 ring-green-500/30 bg-white' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {(() => {
                      const selected = getTypeInfo(form.tipe);
                      const SelectedIcon = selected.Icon;
                      return (
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${selected.lightBg} flex items-center justify-center`}>
                            <SelectedIcon size={16} className={selected.lightText} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{selected.label}</span>
                        </div>
                      );
                    })()}
                    <HiSelector size={18} className="text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {typeDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-[320px] overflow-y-auto p-2">
                        {FIELD_TYPES.map((t) => {
                          const TypeIcon = t.Icon;
                          const isSelected = form.tipe === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, tipe: t.value });
                                setTypeDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                                isSelected 
                                  ? 'bg-green-50 ring-1 ring-green-200' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-xl ${isSelected ? t.bg : t.lightBg} flex items-center justify-center transition-colors`}>
                                <TypeIcon size={17} className={isSelected ? 'text-white' : t.lightText} />
                              </div>
                              <div className="flex-1">
                                <span className={`text-sm font-semibold ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>{t.label}</span>
                              </div>
                              {isSelected && (
                                <HiCheck size={18} className="text-green-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-end pb-1">
                  <label className="inline-flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.required}
                      onChange={e => setForm({ ...form, required: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded-lg border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Wajib Diisi</span>
                  </label>
                </div>

                {['SELECT', 'RADIO'].includes(form.tipe) && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Opsi Pilihan <span className="text-rose-400">*</span>
                      <span className="font-normal normal-case text-gray-400 ml-1">(satu opsi per baris)</span>
                    </label>
                    <textarea
                      value={form.options}
                      onChange={e => setForm({ ...form, options: e.target.value })}
                      placeholder={"Opsi 1\nOpsi 2\nOpsi 3"}
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/30 focus:border-green-400 outline-none text-sm font-mono"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Keterangan / Petunjuk
                  </label>
                  <input
                    type="text"
                    value={form.keterangan}
                    onChange={e => setForm({ ...form, keterangan: e.target.value })}
                    placeholder="Contoh: Format JPG/PNG, maksimal 2MB"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/30 focus:border-green-400 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/25 hover:shadow-xl">
                  {editing ? 'Update Field' : 'Tambah Field'}
                </button>
                <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* Field List */}
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <HiDocumentText className="text-gray-300" size={28} />
              </div>
              <p className="text-gray-400 text-sm">Belum ada field persyaratan</p>
              <p className="text-gray-300 text-xs mt-1">Klik tombol di atas untuk menambah field</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Daftar Field ({fields.length})
              </p>
              {fields.map((field, index) => {
                const typeInfo = getTypeInfo(field.tipe);
                return (
                  <div
                    key={field.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      field.aktif ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100 opacity-60'
                    }`}
                  >
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <HiChevronUp size={14} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === fields.length - 1}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <HiChevronDown size={14} className="text-gray-400" />
                      </button>
                    </div>

                    {/* Type Icon */}
                    {(() => {
                      const TypeIcon = typeInfo.Icon;
                      return (
                        <div className={`w-9 h-9 rounded-lg ${typeInfo.lightBg} flex items-center justify-center shrink-0`}>
                          <TypeIcon size={17} className={typeInfo.lightText} />
                        </div>
                      );
                    })()}

                    {/* Field Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 text-sm truncate">{field.label}</span>
                        {field.required && (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">WAJIB</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{typeInfo.label}</span>
                        {field.keterangan && (
                          <span className="text-xs text-gray-300">• {field.keterangan}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleAktif(field)}
                        className={`p-2 rounded-lg transition-colors ${
                          field.aktif ? 'hover:bg-amber-50 text-amber-500' : 'hover:bg-green-50 text-green-500'
                        }`}
                        title={field.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {field.aktif ? <HiX size={16} /> : <HiCheck size={16} />}
                      </button>
                      <button
                        onClick={() => handleEdit(field)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"
                      >
                        <HiPencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(field.id)}
                        className="p-2 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors"
                      >
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

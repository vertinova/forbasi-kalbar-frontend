import { HiCheck, HiCalendar, HiPlus, HiX } from 'react-icons/hi';

const MATA_LOMBA_OPTIONS = [
  {
    key: 'lobb',
    label: 'LOBB',
    fullName: 'Lomba Olahraga Baris Berbaris',
    color: 'blue',
    emoji: '🏅',
  },
  {
    key: 'vafor',
    label: 'Vafor Musik',
    fullName: 'Variasi Formasi Musik',
    color: 'purple',
    emoji: '🎵',
  },
  {
    key: 'ltub',
    label: 'LTUB',
    fullName: 'Lomba Tata Upacara Bendera',
    color: 'green',
    emoji: '🏳️',
  },
  {
    key: 'rukibra',
    label: 'Rukibra',
    fullName: 'Regu Kibar Bendera',
    color: 'orange',
    emoji: '🇮🇩',
  },
];

const colorMap = {
  blue: {
    bg: 'bg-blue-50', border: 'border-blue-300', activeBorder: 'border-blue-500',
    text: 'text-blue-700', iconBg: 'bg-blue-100', checkBg: 'bg-blue-600',
    ring: 'focus:ring-blue-500', badge: 'bg-blue-100 text-blue-700',
  },
  purple: {
    bg: 'bg-purple-50', border: 'border-purple-300', activeBorder: 'border-purple-500',
    text: 'text-purple-700', iconBg: 'bg-purple-100', checkBg: 'bg-purple-600',
    ring: 'focus:ring-purple-500', badge: 'bg-purple-100 text-purple-700',
  },
  green: {
    bg: 'bg-green-50', border: 'border-green-300', activeBorder: 'border-green-500',
    text: 'text-green-700', iconBg: 'bg-green-100', checkBg: 'bg-green-600',
    ring: 'focus:ring-green-500', badge: 'bg-green-100 text-green-700',
  },
  orange: {
    bg: 'bg-orange-50', border: 'border-orange-300', activeBorder: 'border-orange-500',
    text: 'text-orange-700', iconBg: 'bg-orange-100', checkBg: 'bg-orange-600',
    ring: 'focus:ring-orange-500', badge: 'bg-orange-100 text-orange-700',
  },
};

export { MATA_LOMBA_OPTIONS };

export default function MataLombaForm({ data, onChange, themeColor = 'green' }) {
  // data shape: { lobb: { selected: true, jadwal: [{ tanggal: '2026-03-01', keterangan: '' }] }, ... }

  const toggleMataLomba = (key) => {
    const current = data[key];
    if (current?.selected) {
      // Unselect
      onChange({ ...data, [key]: { selected: false, jadwal: [] } });
    } else {
      // Select with 1 default schedule day
      onChange({ ...data, [key]: { selected: true, jadwal: [{ tanggal: '', keterangan: '' }] } });
    }
  };

  const addJadwal = (key) => {
    const current = data[key];
    if (!current) return;
    onChange({
      ...data,
      [key]: {
        ...current,
        jadwal: [...(current.jadwal || []), { tanggal: '', keterangan: '' }],
      },
    });
  };

  const removeJadwal = (key, idx) => {
    const current = data[key];
    if (!current || current.jadwal.length <= 1) return;
    const newJadwal = current.jadwal.filter((_, i) => i !== idx);
    onChange({ ...data, [key]: { ...current, jadwal: newJadwal } });
  };

  const updateJadwal = (key, idx, field, value) => {
    const current = data[key];
    if (!current) return;
    const newJadwal = current.jadwal.map((j, i) => i === idx ? { ...j, [field]: value } : j);
    onChange({ ...data, [key]: { ...current, jadwal: newJadwal } });
  };

  const selectedCount = MATA_LOMBA_OPTIONS.filter(o => data[o.key]?.selected).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <HiCalendar className={`text-${themeColor}-700 text-xl`} />
          Mata Lomba & Jadwal
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Pilih mata lomba yang akan dipertandingkan. Setiap mata lomba bisa dilaksanakan di hari yang sama atau berbeda.
        </p>
        {selectedCount > 0 && (
          <p className="text-xs font-bold text-green-600 mt-1">{selectedCount}/4 mata lomba dipilih</p>
        )}
      </div>

      <div className="space-y-3">
        {MATA_LOMBA_OPTIONS.map((option) => {
          const colors = colorMap[option.color];
          const isSelected = data[option.key]?.selected || false;
          const jadwal = data[option.key]?.jadwal || [];

          return (
            <div
              key={option.key}
              className={`rounded-xl border-2 overflow-hidden transition-all ${
                isSelected ? `${colors.activeBorder} ${colors.bg}` : 'border-gray-200 bg-white'
              }`}
            >
              {/* Toggle Header */}
              <button
                type="button"
                onClick={() => toggleMataLomba(option.key)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-all"
              >
                <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                  isSelected ? `${colors.checkBg} border-transparent` : 'border-gray-300 bg-white'
                }`}>
                  {isSelected && <HiCheck className="text-white text-sm" />}
                </div>
                <span className="text-lg flex-shrink-0">{option.emoji}</span>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isSelected ? colors.text : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${isSelected ? colors.badge : 'bg-gray-100 text-gray-500'}`}>
                      {option.key.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{option.fullName}</p>
                </div>
                {isSelected && jadwal.length > 0 && (
                  <span className="text-[10px] font-bold bg-white/80 px-2 py-0.5 rounded-full text-gray-600 flex-shrink-0">
                    {jadwal.length} hari
                  </span>
                )}
              </button>

              {/* Schedule Section (shown when selected) */}
              {isSelected && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-600">Jadwal Pelaksanaan</p>
                    <button
                      type="button"
                      onClick={() => addJadwal(option.key)}
                      className={`flex items-center gap-1 text-[11px] font-bold ${colors.text} hover:underline`}
                    >
                      <HiPlus className="text-xs" /> Tambah Hari
                    </button>
                  </div>

                  {jadwal.map((j, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 w-8 text-right flex-shrink-0">
                        H-{idx + 1}
                      </span>
                      <input
                        type="date"
                        value={j.tanggal}
                        onChange={e => updateJadwal(option.key, idx, 'tanggal', e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg border border-gray-200 ${colors.ring} focus:border-transparent outline-none text-xs text-gray-700`}
                      />
                      <input
                        type="text"
                        value={j.keterangan}
                        onChange={e => updateJadwal(option.key, idx, 'keterangan', e.target.value)}
                        placeholder="Keterangan (opsional)"
                        className={`flex-1 px-3 py-2 rounded-lg border border-gray-200 ${colors.ring} focus:border-transparent outline-none text-xs text-gray-700`}
                      />
                      {jadwal.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeJadwal(option.key, idx)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                        >
                          <HiX className="text-sm" />
                        </button>
                      )}
                    </div>
                  ))}

                  {jadwal.length === 0 && (
                    <p className="text-xs text-gray-400 italic pl-10">Belum ada jadwal. Tambahkan minimal 1 hari.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedCount === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700 font-medium">Pilih minimal 1 mata lomba untuk event Anda.</p>
        </div>
      )}
    </div>
  );
}

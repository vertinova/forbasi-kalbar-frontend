import { HiCalendar, HiCheck } from 'react-icons/hi';

const MATA_LOMBA_MAP = {
  lobb: { label: 'LOBB', fullName: 'Lomba Olahraga Baris Berbaris', emoji: '🏅', color: 'blue' },
  vafor: { label: 'Vafor Musik', fullName: 'Variasi Formasi Musik', emoji: '🎵', color: 'purple' },
  ltub: { label: 'LTUB', fullName: 'Lomba Tata Upacara Bendera', emoji: '🏳️', color: 'green' },
  rukibra: { label: 'Rukibra', fullName: 'Regu Kibar Bendera', emoji: '🇮🇩', color: 'orange' },
};

const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
};

export default function MataLombaDetail({ mataLomba }) {
  if (!mataLomba || Object.keys(mataLomba).length === 0) {
    return (
      <div className="text-center py-3 text-gray-400 text-sm">
        Tidak ada data mata lomba
      </div>
    );
  }

  const selectedItems = Object.entries(mataLomba)
    .filter(([, val]) => val?.selected)
    .map(([key, val]) => ({ key, ...MATA_LOMBA_MAP[key], ...val }))
    .filter(item => item.label); // only known mata lomba

  if (selectedItems.length === 0) {
    return (
      <div className="text-center py-3 text-gray-400 text-sm">
        Tidak ada mata lomba yang dipilih
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <HiCalendar className="text-gray-500" />
        <h4 className="font-bold text-sm text-gray-700">Mata Lomba ({selectedItems.length}/4)</h4>
      </div>

      {selectedItems.map(item => {
        const colors = colorMap[item.color];
        const jadwal = item.jadwal || [];

        return (
          <div key={item.key} className={`rounded-lg border ${colors.border} overflow-hidden`}>
            <div className={`flex items-center gap-2 px-3 py-2 ${colors.bg}`}>
              <span className="text-base">{item.emoji}</span>
              <div className="flex-1">
                <span className={`text-xs font-bold ${colors.text}`}>{item.label}</span>
                <span className="text-[10px] text-gray-500 ml-1.5">{item.fullName}</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colors.badge}`}>
                {jadwal.length} hari
              </span>
            </div>
            {jadwal.length > 0 && (
              <div className="bg-white divide-y divide-gray-50">
                {jadwal.map((j, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600">
                    <span className="font-bold text-gray-400 w-6">H-{idx + 1}</span>
                    <HiCalendar className="text-gray-400 text-xs flex-shrink-0" />
                    <span className="font-medium">
                      {j.tanggal ? new Date(j.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </span>
                    {j.keterangan && <span className="text-gray-400 ml-1">• {j.keterangan}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

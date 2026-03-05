/**
 * Static event categories — these never change at runtime.
 * Import this wherever you need category metadata instead of fetching from API.
 */

import { HiAcademicCap } from 'react-icons/hi';
import {
  LuTrophy, LuMedal, LuTarget, LuCalendarRange,
} from 'react-icons/lu';

export const CATEGORIES = [
  { kode: 'KEJURDA',       nama: 'Kejurda',            grup: 'kompetisi', warna: 'green',  Icon: LuTrophy,        urutan: 1 },
  { kode: 'KEJURCAB',      nama: 'Kejurcab',           grup: 'kompetisi', warna: 'blue',   Icon: LuMedal,         urutan: 2, isPengcabOnly: true },
  { kode: 'LATGAB',        nama: 'Latihan Gabungan',   grup: 'kegiatan',  warna: 'purple', Icon: LuTarget,        urutan: 3 },
  { kode: 'TOT',           nama: 'TOT',                grup: 'kegiatan',  warna: 'amber',  Icon: HiAcademicCap,   urutan: 4 },
  { kode: 'EVENT_REGULER', nama: 'Event Penyelenggara', grup: 'kegiatan', warna: 'teal',   Icon: LuCalendarRange, urutan: 5 },
];

export const KOMPETISI = CATEGORIES.filter(c => c.grup === 'kompetisi');
export const KOMPETISI_ADMIN = CATEGORIES.filter(c => c.grup === 'kompetisi' && !c.isPengcabOnly); // Exclude KEJURCAB for admin event page
export const KEGIATAN  = CATEGORIES.filter(c => c.grup === 'kegiatan');

/** kode → category object */
export const categoryByKode = Object.fromEntries(CATEGORIES.map(c => [c.kode, c]));

/** kode → display name */
export const jenisLabel = Object.fromEntries(CATEGORIES.map(c => [c.kode, c.nama]));

/** Color palette per warna key */
export const colorMap = {
  green:  { gradient: 'from-green-500 to-emerald-600',  bg: 'bg-green-500',  badge: 'bg-green-50 text-green-700',  ring: 'ring-green-500/20',  dot: 'bg-green-500', lightBg: 'bg-green-50',  lightText: 'text-green-700', btn: 'bg-green-600 hover:bg-green-700',  shadow: 'shadow-green-500/20' },
  blue:   { gradient: 'from-blue-500 to-blue-600',      bg: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700',    ring: 'ring-blue-500/20',   dot: 'bg-blue-500',  lightBg: 'bg-blue-50',   lightText: 'text-blue-700',  btn: 'bg-blue-600 hover:bg-blue-700',   shadow: 'shadow-blue-500/20' },
  purple: { gradient: 'from-purple-500 to-purple-600',  bg: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700', ring: 'ring-purple-500/20', dot: 'bg-purple-500', lightBg: 'bg-purple-50', lightText: 'text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700', shadow: 'shadow-purple-500/20' },
  amber:  { gradient: 'from-amber-500 to-orange-600',   bg: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700',  ring: 'ring-amber-500/20',  dot: 'bg-amber-500', lightBg: 'bg-amber-50',  lightText: 'text-amber-700', btn: 'bg-amber-600 hover:bg-amber-700',  shadow: 'shadow-amber-500/20' },
  teal:   { gradient: 'from-teal-500 to-teal-600',      bg: 'bg-teal-500',   badge: 'bg-teal-50 text-teal-700',    ring: 'ring-teal-500/20',   dot: 'bg-teal-500',  lightBg: 'bg-teal-50',   lightText: 'text-teal-700',  btn: 'bg-teal-600 hover:bg-teal-700',   shadow: 'shadow-teal-500/20' },
  indigo: { gradient: 'from-indigo-500 to-indigo-600',  bg: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700', ring: 'ring-indigo-500/20', dot: 'bg-indigo-500', lightBg: 'bg-indigo-50', lightText: 'text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', shadow: 'shadow-indigo-500/20' },
  rose:   { gradient: 'from-rose-500 to-rose-600',      bg: 'bg-rose-500',   badge: 'bg-rose-50 text-rose-700',    ring: 'ring-rose-500/20',   dot: 'bg-rose-500',  lightBg: 'bg-rose-50',   lightText: 'text-rose-700',  btn: 'bg-rose-600 hover:bg-rose-700',   shadow: 'shadow-rose-500/20' },
  cyan:   { gradient: 'from-cyan-500 to-cyan-600',      bg: 'bg-cyan-500',   badge: 'bg-cyan-50 text-cyan-700',    ring: 'ring-cyan-500/20',   dot: 'bg-cyan-500',  lightBg: 'bg-cyan-50',   lightText: 'text-cyan-700',  btn: 'bg-cyan-600 hover:bg-cyan-700',   shadow: 'shadow-cyan-500/20' },
};

/** Helper: get color palette for a category kode */
export function getColor(kode) {
  const cat = categoryByKode[kode];
  return colorMap[cat?.warna] || colorMap.green;
}

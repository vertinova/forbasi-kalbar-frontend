import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { HiChevronDown, HiCheck, HiSearch, HiX } from 'react-icons/hi';

/**
 * SearchableSelect — A modern combobox / searchable dropdown component.
 *
 * Props:
 *  - options: string[] — flat list of option labels (value = label)
 *  - value: string — currently selected value
 *  - onChange: (value: string) => void
 *  - placeholder: string
 *  - accent: 'blue' | 'green' | 'amber' (default: 'blue')
 *  - className: string — extra classes on root
 *  - disabled: boolean
 *  - maxHeight: number — dropdown max-height in px (default: 260)
 */

const themes = {
  blue:  { ring: 'ring-blue-500/20 border-blue-400',  bg: 'bg-blue-50',  text: 'text-blue-700',  check: 'text-blue-500',  search: 'focus:ring-blue-400' },
  green: { ring: 'ring-green-500/20 border-green-400', bg: 'bg-green-50', text: 'text-green-700', check: 'text-green-500', search: 'focus:ring-green-400' },
  amber: { ring: 'ring-amber-500/20 border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', check: 'text-amber-500', search: 'focus:ring-amber-400' },
};

export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Pilih...',
  accent = 'blue',
  className = '',
  disabled = false,
  maxHeight = 260,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const t = themes[accent] || themes.blue;

  // Filter options
  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(o => o.toLowerCase().includes(q));
  }, [options, search]);

  // Reset highlight when filtered list changes
  useEffect(() => { setHighlightIdx(0); }, [filtered]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current || highlightIdx < 0) return;
    const items = listRef.current.querySelectorAll('[data-option]');
    if (items[highlightIdx]) items[highlightIdx].scrollIntoView({ block: 'nearest' });
  }, [highlightIdx, open]);

  const handleSelect = useCallback((val) => {
    onChange?.(val);
    setOpen(false);
    setSearch('');
  }, [onChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && filtered[highlightIdx]) handleSelect(filtered[highlightIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setSearch('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen(!open); }}
        className={`w-full flex items-center px-4 py-2.5 rounded-xl border bg-white text-sm outline-none transition-all duration-200 cursor-pointer text-left
          ${open ? `ring-2 ${t.ring}` : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
        `}
      >
        <span className={`truncate flex-1 ${value ? 'text-gray-700' : 'text-gray-400'}`}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {value && !disabled && (
            <span onClick={handleClear}
              className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <HiX className="w-3 h-3 text-gray-400" />
            </span>
          )}
          <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/60 overflow-hidden animate-scaleIn">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cari kota/kabupaten..."
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:border-transparent transition-all ${t.search} bg-gray-50/50 placeholder:text-gray-300`}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <HiX className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div ref={listRef} className="overflow-y-auto py-1 scrollbar-thin" style={{ maxHeight }}>
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                <p className="font-medium">Tidak ditemukan</p>
                <p className="text-xs mt-0.5">Coba kata kunci lain</p>
              </div>
            ) : (
              filtered.map((opt, i) => {
                const isActive = opt === value;
                const isHighlighted = i === highlightIdx;
                return (
                  <div
                    key={opt}
                    data-option
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightIdx(i)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-75 flex items-center justify-between gap-2
                      ${isActive ? `${t.bg} ${t.text} font-semibold` : isHighlighted ? 'bg-gray-50 text-gray-700' : 'text-gray-600 hover:bg-gray-50'}
                    `}
                  >
                    <span className="truncate">{opt}</span>
                    {isActive && <HiCheck className={`w-4 h-4 flex-shrink-0 ${t.check}`} />}
                  </div>
                );
              })
            )}
          </div>

          {/* Count badge */}
          {filtered.length > 0 && (
            <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 font-medium text-right">
              {search ? `${filtered.length} dari ${options.length} hasil` : `${options.length} pilihan`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

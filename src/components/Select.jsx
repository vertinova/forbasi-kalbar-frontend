import { useState, useRef, useEffect, Children } from 'react';
import { HiChevronDown, HiCheck } from 'react-icons/hi';

const themes = {
  green: { ring: 'ring-green-500/20 border-green-400', bg: 'bg-green-50', text: 'text-green-700', check: 'text-green-500' },
  amber: { ring: 'ring-amber-500/20 border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', check: 'text-amber-500' },
  blue:  { ring: 'ring-blue-500/20 border-blue-400',  bg: 'bg-blue-50',  text: 'text-blue-700',  check: 'text-blue-500' },
};

export default function Select({ accent = 'green', full = true, className = '', children, value, onChange, name, required, disabled, ...props }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Parse <option> children
  const options = [];
  Children.forEach(children, (child) => {
    if (child && child.type === 'option') {
      options.push({ value: child.props.value ?? '', label: child.props.children, disabled: child.props.disabled });
    }
  });

  const selected = options.find(o => String(o.value) === String(value ?? ''));
  const isPlaceholder = !value && value !== 0;
  const displayLabel = selected?.label || '';
  const t = themes[accent] || themes.green;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (open && listRef.current) {
      const active = listRef.current.querySelector('[data-active="true"]');
      if (active) active.scrollIntoView({ block: 'nearest' });
    }
  }, [open]);

  const handleSelect = (optValue) => {
    setOpen(false);
    if (onChange) onChange({ target: { value: optValue, name: name || '' } });
  };

  return (
    <div ref={containerRef} className={`relative ${full ? 'w-full' : 'inline-block'}`}>
      {/* Hidden native select for form required validation */}
      {required && (
        <select name={name} value={value} required tabIndex={-1} onChange={() => {}}
          className="absolute inset-0 opacity-0 pointer-events-none" aria-hidden>
          {children}
        </select>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        className={`${full ? 'w-full' : ''} flex items-center pl-4 pr-10 py-2.5 rounded-xl border bg-white text-sm outline-none transition-all duration-200 cursor-pointer text-left
          ${open ? `ring-2 ${t.ring}` : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
          ${className}`}
        {...props}
      >
        <span className={`truncate ${isPlaceholder ? 'text-gray-400' : 'text-gray-700'}`}>
          {displayLabel || '\u00A0'}
        </span>
      </button>

      {/* Chevron */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/60 overflow-hidden animate-scaleIn">
          <div ref={listRef} className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
            {options.map((opt, i) => {
              const isActive = String(opt.value) === String(value ?? '');
              return (
                <div
                  key={`${opt.value}-${i}`}
                  data-active={isActive}
                  onClick={() => !opt.disabled && handleSelect(opt.value)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100 flex items-center justify-between gap-2
                    ${isActive ? `${t.bg} ${t.text} font-semibold` : 'text-gray-600 hover:bg-gray-50'}
                    ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}
                  `}
                >
                  <span className="truncate">{opt.label}</span>
                  {isActive && <HiCheck className={`w-4 h-4 flex-shrink-0 ${t.check}`} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

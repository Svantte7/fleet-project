// src/components/UI.jsx
import { C } from '../utils/theme.js';

export function Btn({ children, onClick, variant = 'primary', disabled = false, full = false, sm = false, style = {} }) {
  const bg = { primary: C.steel, orange: C.orange, danger: C.danger, success: C.success, ghost: 'transparent' }[variant];
  const color = variant === 'ghost' ? C.steel : '#fff';
  const border = variant === 'ghost' ? `2px solid ${C.steel}` : 'none';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: bg, color, border, borderRadius: 12,
        padding: sm ? '8px 16px' : '13px 20px',
        fontSize: sm ? 13 : 15, fontWeight: 700,
        width: full ? '100%' : 'auto', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, transition: 'opacity 0.15s',
        fontFamily: 'inherit', ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Card({ children, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.surface, borderRadius: 14, padding: '16px',
        boxShadow: '0 2px 12px rgba(27,43,59,0.08)', marginBottom: 12,
        cursor: onClick ? 'pointer' : 'default', ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Field({ label, value, onChange, placeholder, type = 'text', mono = false, style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && (
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 11,
          border: `1.5px solid ${C.border}`, fontSize: 15, fontWeight: 600,
          color: C.text, background: C.surface, outline: 'none',
          fontFamily: mono ? 'monospace' : 'inherit',
          letterSpacing: mono ? '0.1em' : 'normal',
          textAlign: mono ? 'center' : 'left',
        }}
      />
    </div>
  );
}

export function Toggle({ label, sub, value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 0' }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        width: 46, height: 26, borderRadius: 13, position: 'relative', flexShrink: 0, marginLeft: 14,
        background: value ? C.steel : C.border, transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: value ? 23 : 3,
          width: 20, height: 20, borderRadius: 10, background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s',
        }} />
      </div>
    </div>
  );
}

export function Badge({ children, color, bg }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 18, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, marginTop: 4 }}>
      {children}
    </div>
  );
}

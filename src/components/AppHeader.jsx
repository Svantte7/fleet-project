// src/components/AppHeader.jsx
import { C } from '../utils/theme.js';

export default function AppHeader({ title, subtitle, onBack, onHome, rightLabel, onRight }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.navy}, #243B55)`,
      padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
    }}>
      {/* Left: back + home */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 44 }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: 'none', border: 'none', color: '#fff', fontSize: 26,
            cursor: 'pointer', padding: 0, lineHeight: 1, fontWeight: 300,
          }}>‹</button>
        )}
        {onHome && (
          <button onClick={onHome} title="Hallintapaneeli" style={{
            background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
            fontSize: 15, cursor: 'pointer', padding: '5px 8px', borderRadius: 8,
            lineHeight: 1,
          }}>🏠</button>
        )}
      </div>

      {/* Center: title */}
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{title}</div>
        {subtitle && <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 1 }}>{subtitle}</div>}
      </div>

      {/* Right */}
      <div style={{ minWidth: 44, textAlign: 'right' }}>
        {onRight && (
          <button onClick={onRight} style={{
            background: 'none', border: 'none', color: C.orange,
            fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 0,
          }}>{rightLabel}</button>
        )}
      </div>
    </div>
  );
}

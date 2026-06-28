// src/components/AppHeader.jsx
import { C } from '../utils/theme.js';
import { SpectoMark } from './SprectoLogo.jsx';

export default function AppHeader({ title, subtitle, onBack, onHome, rightLabel, onRight }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
      padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 16px rgba(75,0,0,0.3)',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 44 }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: 'none', border: 'none', color: '#fff', fontSize: 26,
            cursor: 'pointer', padding: 0, lineHeight: 1, fontWeight: 300,
          }}>‹</button>
        )}
        {onHome && (
          <button onClick={onHome} title="Etusivu" style={{
            background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
            fontSize: 15, cursor: 'pointer', padding: '5px 8px', borderRadius: 8,
          }}>🏠</button>
        )}
      </div>

      {/* Center */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <SpectoMark size={28} />
        <div style={{ textAlign: 'left' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1 }}>{title}</div>
          {subtitle && <div style={{ color: '#FCA5A5', fontSize: 11, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>

      {/* Right */}
      <div style={{ minWidth: 44, textAlign: 'right' }}>
        {onRight && (
          <button onClick={onRight} style={{
            background: 'none', border: 'none', color: C.accent,
            fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 0,
          }}>{rightLabel}</button>
        )}
      </div>
    </div>
  );
}

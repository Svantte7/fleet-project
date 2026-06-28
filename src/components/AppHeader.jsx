// src/components/AppHeader.jsx
import { C } from '../utils/theme.js';
import { SpectoMark } from './SprectoLogo.jsx';

export default function AppHeader({ title, subtitle, onBack, onHome, rightLabel, onRight, device }) {
  const isPhone = device?.isPhone;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
      padding: `${isPhone ? 10 : 14}px ${isPhone ? 12 : 16}px`,
      paddingTop: `calc(${isPhone ? 10 : 14}px + env(safe-area-inset-top))`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 16px rgba(0,0,0,0.35)',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: isPhone ? 74 : 88, minWidth: 44 }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: 'none', border: 'none', color: '#fff', fontSize: 26,
            cursor: 'pointer', padding: 0, lineHeight: 1, fontWeight: 300, minWidth: 36, minHeight: 36,
          }}>‹</button>
        )}
        {onHome && (
          <button onClick={onHome} title="Etusivu" style={{
            background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
            fontSize: 15, cursor: 'pointer', padding: '5px 8px', borderRadius: 8, minHeight: 34,
          }}>🏠</button>
        )}
      </div>

      {/* Center */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isPhone ? 8 : 10 }}>
        <SpectoMark size={isPhone ? 24 : 28} />
        <div style={{ textAlign: 'left', minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: isPhone ? 14 : 15, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isPhone ? 150 : 280 }}>{title}</div>
          {subtitle && <div style={{ color: '#FCA5A5', fontSize: 11, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>

      {/* Right */}
      <div style={{ width: isPhone ? 74 : 88, minWidth: 44, textAlign: 'right' }}>
        {onRight && (
          <button onClick={onRight} style={{
            background: 'none', border: 'none', color: C.accent,
            fontSize: isPhone ? 13 : 14, fontWeight: 700, cursor: 'pointer', padding: 0, minHeight: 36,
          }}>{rightLabel}</button>
        )}
      </div>
    </div>
  );
}

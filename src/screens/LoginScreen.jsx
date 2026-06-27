// src/screens/LoginScreen.jsx
import { useState } from 'react';
import { DB } from '../data/store.js';
import { C } from '../utils/theme.js';

export default function LoginScreen({ navigate }) {
  const [name, setName] = useState('');
  const [pin,  setPin]  = useState('');
  const [err,  setErr]  = useState('');

  const login = () => {
    const u = DB.findUser(name, pin);
    if (!u) { setErr('Virheellinen nimi tai PIN-koodi.'); return; }
    setErr('');
    if (u.mustChangePIN) { navigate('changePin', { userId: u.id, forced: true }); return; }
    navigate(u.role === 'admin' ? 'adminHome' : 'driverHome', { userId: u.id });
  };

  const inp = (extra = {}) => ({
    width: '100%', padding: '13px 14px', borderRadius: 11,
    border: '2px solid rgba(255,255,255,0.15)', fontSize: 15, fontWeight: 600,
    color: '#fff', background: 'rgba(255,255,255,0.09)', outline: 'none',
    marginBottom: 14, fontFamily: 'inherit', ...extra,
  });

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${C.navy} 0%, #243B55 60%, #1a3a5c 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      {/* Logo */}
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <div style={{ width: 82, height: 82, borderRadius: 24, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: `2px solid rgba(232,123,53,0.4)`, fontSize: 40 }}>🚛</div>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: 22, letterSpacing: '0.06em', textTransform: 'uppercase' }}>KalustoHallinta</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>Kaluston tarkastus & dokumentointi</div>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 360, background: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: '26px 22px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 }}>Kirjautuminen</div>

        <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>NIMI</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Etunimi Sukunimi"
          onKeyDown={e => e.key === 'Enter' && login()} style={inp()} />

        <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>PIN-KOODI</label>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="••••"
          onKeyDown={e => e.key === 'Enter' && login()}
          style={inp({ fontSize: 24, letterSpacing: '0.35em', textAlign: 'center' })} />

        <div style={{ textAlign: 'right', marginBottom: 14 }}>
          <button onClick={() => navigate('forgotPin')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
            PIN unohtunut?
          </button>
        </div>

        {err && <div style={{ background: 'rgba(217,79,79,0.22)', borderRadius: 9, padding: '9px 12px', color: '#ffa0a0', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{err}</div>}

        <button onClick={login} style={{ width: '100%', background: C.orange, color: '#fff', border: 'none', borderRadius: 13, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          🔓  Kirjaudu sisään
        </button>

        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center', marginTop: 18 }}>
          Demo: Mikko / 1234 · Sari / 2222 · Pääkäyttäjä / 0000
        </div>
      </div>
    </div>
  );
}

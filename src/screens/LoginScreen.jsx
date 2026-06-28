// src/screens/LoginScreen.jsx
import { useState } from 'react';
import { loginWithEmail, nameToEmail } from '../firebase/auth.js';
import { fetchUserProfileREST } from '../firebase/config.js';
import { C } from '../utils/theme.js';
import { SpectoWordmark } from '../components/SprectoLogo.jsx';

export default function LoginScreen({ navigate }) {
  const [name, setName] = useState('');
  const [pin,  setPin]  = useState('');
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const login = async () => {
    if (!name.trim() || !pin.trim()) { setErr('Syota nimi ja PIN.'); return; }
    setBusy(true); setErr('');
    try {
      const email = nameToEmail(name);
      const cred  = await loginWithEmail(email, pin);
      const uid   = cred.user.uid;
      const token = await cred.user.getIdToken();
      const profile = await fetchUserProfileREST(uid, token);
      if (profile && profile.active) {
        if (profile.mustChangePIN) {
          navigate('changePin', { userId: uid, forced: true });
        } else {
          navigate(profile.role === 'admin' ? 'adminHome' : 'driverHome', { userId: uid, userName: profile.name });
        }
      } else {
        setErr('Kayttajatili ei ole aktiivinen.');
        setBusy(false);
      }
    } catch (e) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        setErr('Virheellinen nimi tai PIN-koodi.');
      } else {
        setErr('Kirjautuminen epaonnistui: ' + e.message);
      }
      setBusy(false);
    }
  };

  const inp = (extra = {}) => ({
    width: '100%', padding: '13px 14px', borderRadius: 11,
    border: '2px solid rgba(255,255,255,0.15)', fontSize: 15, fontWeight: 600,
    color: '#fff', background: 'rgba(255,255,255,0.09)', outline: 'none',
    marginBottom: 14, fontFamily: 'inherit', ...extra,
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyLight} 55%, #9B1010 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 22,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <SpectoWordmark dark={false} size={42} />
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 360,
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        borderRadius: 22, padding: '26px 22px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 }}>
          Kirjautuminen
        </div>

        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>NIMI</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Etunimi Sukunimi"
          onKeyDown={e => e.key === 'Enter' && login()} style={inp()} disabled={busy} />

        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>PIN-KOODI</label>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="••••"
          onKeyDown={e => e.key === 'Enter' && login()}
          style={inp({ fontSize: 24, letterSpacing: '0.35em', textAlign: 'center' })} disabled={busy} />

        <div style={{ textAlign: 'right', marginBottom: 14 }}>
          <button onClick={() => navigate('forgotPin')} style={{ background: 'none', border: 'none', color: '#FCA5A5', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
            PIN unohtunut?
          </button>
        </div>

        {err && (
          <div style={{ background: 'rgba(217,79,79,0.22)', borderRadius: 9, padding: '9px 12px', color: '#ffa0a0', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
            {err}
          </div>
        )}

        <button onClick={login} disabled={busy} style={{
          width: '100%', background: busy ? 'rgba(255,255,255,0.2)' : C.steel,
          color: '#fff', border: 'none', borderRadius: 13, padding: '14px',
          fontSize: 15, fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          boxShadow: busy ? 'none' : '0 4px 20px rgba(196,28,28,0.4)',
          transition: 'all 0.2s',
        }}>
          {busy ? '⏳  Kirjaudutaan...' : '🔓  Kirjaudu sisään'}
        </button>
      </div>

      {/* Footer */}
      <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, marginTop: 32, textAlign: 'center', letterSpacing: '0.05em' }}>
        Specto · Fleet Inspection
      </div>
    </div>
  );
}

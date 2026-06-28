// src/screens/LoginScreen.jsx
import { useState } from 'react';
import { loginWithEmail, normalizeLoginEmail } from '../firebase/auth.js';
import { fetchUserProfileREST } from '../firebase/config.js';
import { C } from '../utils/theme.js';
import { SpectoWordmark } from '../components/SprectoLogo.jsx';

export default function LoginScreen({ navigate, device }) {
  const isPhone = device?.isPhone;
  const [name, setName] = useState('');
  const [pin,  setPin]  = useState('');
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const login = async () => {
    if (!name.trim() || !pin.trim()) { setErr('Syötä sähköposti ja salasana.'); return; }
    setBusy(true); setErr('');
    try {
      const email = normalizeLoginEmail(name);
      const cred  = await loginWithEmail(email, pin);
      const uid   = cred.user.uid;
      const token = await cred.user.getIdToken();
      const profile = await fetchUserProfileREST(uid, token);
      if (!profile) {
        navigate('setup', { uid, email: cred.user.email });
      } else if (!profile.active) {
        setErr('Käyttäjätili ei ole aktiivinen. Ota yhteyttä ylläpitäjään.');
        setBusy(false);
      } else if (profile.mustChangePIN && profile.role !== 'admin') {
        navigate('changePin', { userId: uid, forced: true, userName: profile.name });
      } else {
        navigate(profile.role === 'admin' || profile.role === 'moderator' ? 'adminHome' : 'driverHome', { userId: uid, userName: profile.name, role: profile.role });
      }
    } catch (e) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        setErr('Virheellinen sähköposti tai salasana.');
      } else {
        setErr('Kirjautuminen epäonnistui: ' + e.message);
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
      minHeight: '100dvh',
      background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyLight} 55%, #9B1010 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isPhone ? 'flex-start' : 'center',
      padding: isPhone ? 'calc(30px + env(safe-area-inset-top)) 16px calc(18px + env(safe-area-inset-bottom))' : 22,
      overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: isPhone ? 28 : 40, textAlign: 'center', marginTop: isPhone ? 10 : 0 }}>
        <SpectoWordmark dark={false} size={isPhone ? 34 : 42} />
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: isPhone ? 420 : 360,
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        borderRadius: isPhone ? 18 : 22, padding: isPhone ? '22px 16px' : '26px 22px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 }}>
          Kirjautuminen
        </div>

        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>SÄHKÖPOSTI</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="nimi@yritys.fi"
          autoComplete="username" inputMode="email"
          onKeyDown={e => e.key === 'Enter' && login()} style={inp()} disabled={busy} />

        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>SALASANA</label>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="••••"
          onKeyDown={e => e.key === 'Enter' && login()}
          style={inp({ fontSize: 24, letterSpacing: '0.35em', textAlign: 'center' })} disabled={busy} />

        <div style={{ textAlign: 'right', marginBottom: 14 }}>
          <button onClick={() => navigate('forgotPin')} style={{ background: 'none', border: 'none', color: '#FCA5A5', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
            Salasana unohtunut?
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
      <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, marginTop: isPhone ? 22 : 32, textAlign: 'center', letterSpacing: '0.05em' }}>
        Specto · Fleet Inspection
      </div>
    </div>
  );
}

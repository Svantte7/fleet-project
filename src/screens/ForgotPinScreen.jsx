// src/screens/ForgotPinScreen.jsx
import { useState } from 'react';
import { nameToEmail } from '../firebase/auth.js';
import { auth } from '../firebase/config.js';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getUserProfile } from '../firebase/firestore.js';
import { changePIN } from '../firebase/auth.js';
import { updateUserProfile } from '../firebase/firestore.js';
import { C } from '../utils/theme.js';

const darkCard = { width: '100%', maxWidth: 360, background: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: '26px 22px', border: '1px solid rgba(255,255,255,0.1)' };
const darkInp  = { width: '100%', padding: '13px 14px', borderRadius: 11, border: '2px solid rgba(255,255,255,0.15)', fontSize: 15, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.09)', outline: 'none', marginBottom: 14, fontFamily: 'inherit' };
const darkLbl  = { display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 };

export function ForgotPinScreen({ navigate }) {
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!name.trim()) { setErr('Syötä nimesi.'); return; }
    setBusy(true); setErr('');
    try {
      const email = nameToEmail(name);
      // Tarkista että käyttäjä on olemassa
      // Lähetetään PIN-reset sähköpostilla (Firebase hoitaa)
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (e) {
      setErr('Käyttäjää ei löydy tai virhe lähetyksessä.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${C.navy}, #243B55, #1a3a5c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      <div style={darkCard}>
        <button onClick={() => navigate('login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 26, cursor: 'pointer', marginBottom: 12, padding: 0, fontWeight: 300 }}>‹</button>
        {!sent ? (
          <>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 900, marginBottom: 8 }}>PIN unohtunut</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6, marginBottom: 22 }}>
              Syötä nimesi — lähetämme PIN-palautuslinkin sähköpostiisi.
            </div>
            <label style={darkLbl}>NIMI</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Etunimi Sukunimi"
              onKeyDown={e => e.key === 'Enter' && send()} style={darkInp} disabled={busy} />
            {err && <div style={{ background: 'rgba(217,79,79,0.22)', borderRadius: 9, padding: '9px 12px', color: '#ffa0a0', fontSize: 13, marginBottom: 12 }}>{err}</div>}
            <button onClick={send} disabled={busy} style={{ width: '100%', background: C.orange, color: '#fff', border: 'none', borderRadius: 13, padding: 14, fontSize: 15, fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {busy ? '⏳  Lähetetään...' : '📱  Lähetä palautuslinkki'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Palautuslinkki lähetetty!</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
              Tarkista sähköpostisi ja seuraa linkkiä PIN:n palauttamiseksi.
            </div>
            <button onClick={() => navigate('login')} style={{ width: '100%', background: 'transparent', color: C.steel, border: `1.5px solid ${C.steel}`, borderRadius: 13, padding: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Takaisin kirjautumiseen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Change PIN ─────────────────────────────────────────────────────────────────
export function ChangePinScreen({ navigate, params }) {
  const { userId, forced } = params;
  const [p1,   setP1]  = useState('');
  const [p2,   setP2]  = useState('');
  const [err,  setErr] = useState('');
  const [busy, setBusy]= useState(false);

  const save = async () => {
    if (p1.length < 6) { setErr('PIN täytyy olla vähintään 6 merkkiä.'); return; }
    if (p1 !== p2)     { setErr('PIN-koodit eivät täsmää.'); return; }
    setBusy(true); setErr('');
    try {
      await changePIN(p1);
      await updateUserProfile(userId, { mustChangePIN: false });
      const profile = await getUserProfile(userId);
      navigate(profile.role === 'admin' ? 'adminHome' : 'driverHome', { userId });
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') {
        setErr('Kirjaudu uudelleen sisään ennen PIN:n vaihtoa.');
      } else {
        setErr('PIN:n vaihto epäonnistui. Yritä uudelleen.');
      }
      setBusy(false);
    }
  };

  const pinInp = { ...darkInp, fontSize: 24, letterSpacing: '0.35em', textAlign: 'center' };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${C.navy}, #243B55, #1a3a5c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      <div style={darkCard}>
        {!forced && (
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 26, cursor: 'pointer', marginBottom: 12, padding: 0 }}>‹</button>
        )}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🔐</div>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{forced ? 'Aseta uusi PIN' : 'Vaihda PIN-koodi'}</div>
          {forced && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>Turvallisuussyistä PIN täytyy vaihtaa ennen jatkamista.</div>}
        </div>
        <label style={darkLbl}>UUSI PIN</label>
        <input type="password" value={p1} onChange={e => setP1(e.target.value)} placeholder="••••" style={pinInp} disabled={busy} />
        <label style={darkLbl}>VAHVISTA PIN</label>
        <input type="password" value={p2} onChange={e => setP2(e.target.value)} placeholder="••••"
          onKeyDown={e => e.key === 'Enter' && save()} style={pinInp} disabled={busy} />
        {err && <div style={{ background: 'rgba(217,79,79,0.22)', borderRadius: 9, padding: '9px 12px', color: '#ffa0a0', fontSize: 13, marginBottom: 12 }}>{err}</div>}
        <button onClick={save} disabled={busy} style={{ width: '100%', background: C.orange, color: '#fff', border: 'none', borderRadius: 13, padding: 14, fontSize: 15, fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          {busy ? '⏳  Tallennetaan...' : '✅  Tallenna uusi PIN'}
        </button>
      </div>
    </div>
  );
}

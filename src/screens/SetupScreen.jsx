// src/screens/SetupScreen.jsx
// Ensiasennusnäyttö — käytetään kun Firebase Auth -tili on olemassa mutta Firestore-profiili puuttuu
// ja järjestelmässä ei ole vielä yhtään käyttäjää.
import { useState } from 'react';
import { createUserProfile } from '../firebase/firestore.js';
import { logout } from '../firebase/auth.js';
import { C } from '../utils/theme.js';
import { SpectoWordmark } from '../components/SprectoLogo.jsx';

export default function SetupScreen({ navigate, params, device }) {
  const isPhone = device?.isPhone;
  const { uid, email } = params;
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const setup = async () => {
    if (!name.trim()) { setErr('Syötä nimesi.'); return; }
    setBusy(true); setErr('');
    try {
      await createUserProfile(uid, {
        name:            name.trim(),
        role:            'admin',
        phone:           '',
        email,
        personalEmail:   email,
        mustChangePIN:   false,
        profileComplete: true,
        active:          true,
      });
      navigate('adminHome', { userId: uid, userName: name.trim(), role: 'admin' });
    } catch (e) {
      setErr('Profiilin luonti epäonnistui: ' + e.message);
      setBusy(false);
    }
  };

  const inp = {
    width: '100%', padding: '13px 14px', borderRadius: 11,
    border: '2px solid rgba(255,255,255,0.15)', fontSize: 15, fontWeight: 600,
    color: '#fff', background: 'rgba(255,255,255,0.09)', outline: 'none',
    marginBottom: 14, fontFamily: 'inherit',
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyLight} 55%, #9B1010 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isPhone ? 'flex-start' : 'center',
      padding: isPhone ? 'calc(30px + env(safe-area-inset-top)) 16px calc(18px + env(safe-area-inset-bottom))' : 22,
    }}>
      <div style={{ marginBottom: isPhone ? 28 : 40, textAlign: 'center', marginTop: isPhone ? 10 : 0 }}>
        <SpectoWordmark dark={false} size={isPhone ? 34 : 42} />
      </div>

      <div style={{
        width: '100%', maxWidth: isPhone ? 420 : 380,
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)',
        borderRadius: isPhone ? 18 : 22, padding: isPhone ? '22px 16px' : '28px 24px',
        border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔑</div>
          <div style={{ color: '#fff', fontSize: 19, fontWeight: 900, marginBottom: 6 }}>Ensiasennusvaihe</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6 }}>
            Järjestelmässä ei ole vielä käyttäjiä.<br />Luo ensimmäinen pääkäyttäjätunnus.
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Sähköposti</div>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{email}</div>
        </div>

        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>NIMI</label>
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Etunimi Sukunimi"
          onKeyDown={e => e.key === 'Enter' && setup()}
          style={inp} disabled={busy}
          autoFocus
        />

        {err && (
          <div style={{ background: 'rgba(217,79,79,0.22)', borderRadius: 9, padding: '9px 12px', color: '#ffa0a0', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
            {err}
          </div>
        )}

        <button onClick={setup} disabled={busy} style={{
          width: '100%', background: busy ? 'rgba(255,255,255,0.2)' : C.steel,
          color: '#fff', border: 'none', borderRadius: 13, padding: '14px',
          fontSize: 15, fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', boxShadow: busy ? 'none' : '0 4px 20px rgba(196,28,28,0.4)',
          transition: 'all 0.2s', marginBottom: 10,
        }}>
          {busy ? '⏳  Luodaan...' : '✅  Luo pääkäyttäjätunnus'}
        </button>

        <button onClick={() => { logout(); navigate('login', {}); }} style={{
          width: '100%', background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 8,
        }}>
          Kirjaudu ulos
        </button>
      </div>
    </div>
  );
}

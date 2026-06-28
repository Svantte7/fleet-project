// src/screens/ProfileScreen.jsx
// Profiilisivu — omat tiedot, PIN-vaihto
// forced=true → uusi käyttäjä täyttää tiedot pakollisesti ennen raportteja
import { useState, useEffect } from 'react';
import { C, fmtReg } from '../utils/theme.js';
import { Btn, Card, Field, SectionLabel } from '../components/UI.jsx';
import AppHeader from '../components/AppHeader.jsx';
import { updateUserProfile, getUserProfile } from '../firebase/firestore.js';
import { changePIN, isValidPassword } from '../firebase/auth.js';

const formatBirthDate = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length === 6) {
    const year = Number(digits.slice(4));
    const fullYear = year > 30 ? 1900 + year : 2000 + year;
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${fullYear}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
};

const isValidBirthDate = (value) => {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export default function ProfileScreen({ navigate, params, device }) {
  const { userId, userName, forced } = params;

  const [profile,   setProfile]   = useState(null);
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [address,   setAddress]   = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState('');
  const [success,   setSuccess]   = useState('');

  // PIN change state
  const [showPin, setShowPin] = useState(false);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [pinOk,  setPinOk]  = useState(false);

  useEffect(() => {
    getUserProfile(userId).then(p => {
      if (p) {
        setProfile(p);
        setPhone(p.phone || '');
        setEmail(p.personalEmail || '');
        setAddress(p.address || '');
        setBirthDate(p.birthDate || '');
      }
    });
  }, [userId]);

  const normalizedBirthDate = formatBirthDate(birthDate);
  const isComplete = phone.trim().length >= 6 && email.includes('@') && address.trim().length >= 3 && isValidBirthDate(normalizedBirthDate);

  const save = async () => {
    if (!phone.trim())            { setErr('Puhelinnumero on pakollinen.'); return; }
    if (!email.trim() || !email.includes('@')) { setErr('Syötä kelvollinen sähköpostiosoite.'); return; }
    if (!address.trim())          { setErr('Kotiosoite on pakollinen.'); return; }
    if (!birthDate.trim())        { setErr('Syntymäaika on pakollinen.'); return; }
    const formattedBirthDate = formatBirthDate(birthDate);
    if (!isValidBirthDate(formattedBirthDate)) { setErr('Syötä syntymäaika muodossa pp.kk.vvvv.'); return; }
    setBirthDate(formattedBirthDate);
    setSaving(true); setErr(''); setSuccess('');
    try {
      await updateUserProfile(userId, {
        phone:           phone.trim(),
        personalEmail:   email.trim(),
        address:         address.trim(),
        birthDate:       formattedBirthDate,
        profileComplete: true,
      });
      setSuccess('Tiedot tallennettu!');
      if (forced) {
        const dest = profile?.role === 'admin' || profile?.role === 'moderator' ? 'adminHome' : 'driverHome';
        setTimeout(() => navigate(dest, { userId, userName, role: profile?.role }), 800);
      }
    } catch (e) {
      setErr('Tallennus epäonnistui: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const savePin = async () => {
    if (!isValidPassword(p1)) { setPinErr('Salasanassa pitää olla vähintään 6 merkkiä ja yksi numero.'); return; }
    if (p1 !== p2)     { setPinErr('Salasanat eivät täsmää.'); return; }
    try {
      await changePIN(p1);
      await updateUserProfile(userId, { mustChangePIN: false });
      setPinOk(true); setPinErr(''); setP1(''); setP2('');
      setTimeout(() => { setShowPin(false); setPinOk(false); }, 1500);
    } catch (e) {
      setPinErr('Salasanan vaihto epäonnistui: ' + e.message);
    }
  };

  const pinInp = {
    width: '100%', padding: '12px 14px', borderRadius: 11,
    border: `1.5px solid ${C.border}`, fontSize: 22, fontWeight: 700,
    color: C.text, background: C.surface, outline: 'none',
    letterSpacing: '0.35em', textAlign: 'center', marginBottom: 12,
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader
        title="Profiili"
        subtitle={userName}
        onBack={forced ? undefined : () => navigate(profile?.role === 'admin' || profile?.role === 'moderator' ? 'adminHome' : 'driverHome', { userId, userName, role: profile?.role })}
        device={device}
      />

      {/* Forced banner */}
      {forced && (
        <div style={{ background: `${C.steel}15`, borderLeft: `4px solid ${C.steel}`, padding: '12px 16px', margin: device?.isPhone ? '12px 12px 0' : '14px 16px 0', borderRadius: '0 10px 10px 0' }}>
          <div style={{ fontWeight: 700, color: C.steel, fontSize: 14 }}>Täytä profiilitietosi</div>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Tiedot vaaditaan ennen raporttien tekemistä.</div>
        </div>
      )}

      <div style={{ padding: device?.isPhone ? '14px 12px' : '16px 16px', maxWidth: 520, margin: '0 auto' }}>

        {/* Personal info */}
        <SectionLabel>OMAT TIEDOT</SectionLabel>

        <Card>
          {/* Name - read only */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>NIMI</label>
            <div style={{ padding: '12px 14px', borderRadius: 11, background: `${C.bg}`, border: `1.5px solid ${C.border}`, fontSize: 15, fontWeight: 700, color: C.text }}>
              {profile?.name || userName || '—'}
            </div>
          </div>

          <Field
            label="Puhelinnumero"
            value={phone}
            onChange={setPhone}
            placeholder="040 1234567"
            noUpper
          />
          <Field
            label="Sähköpostiosoite"
            value={email}
            onChange={setEmail}
            placeholder="nimi@esimerkki.fi"
            noUpper
          />
          <Field
            label="Kotiosoite"
            value={address}
            onChange={setAddress}
            placeholder="Esimerkkikatu 1, 00100 Helsinki"
            noUpper
          />
          <Field
            label="Syntymäaika"
            value={birthDate}
            onChange={value => setBirthDate(formatBirthDate(value))}
            placeholder="01.01.1990"
            noUpper
          />

          {err && (
            <div style={{ background: 'rgba(217,79,79,0.1)', borderRadius: 9, padding: '9px 12px', color: C.danger, fontSize: 13, marginBottom: 12 }}>{err}</div>
          )}
          {success && (
            <div style={{ background: '#E8F5EC', borderRadius: 9, padding: '9px 12px', color: C.success, fontSize: 13, marginBottom: 12 }}>✓ {success}</div>
          )}

          <Btn onClick={save} full disabled={saving || !isComplete} variant={isComplete ? 'primary' : 'ghost'}>
            {saving ? '⏳ Tallennetaan...' : forced ? '✅ Tallenna ja jatka' : '💾 Tallenna tiedot'}
          </Btn>

          {forced && !isComplete && (
            <div style={{ textAlign: 'center', color: C.muted, fontSize: 11, marginTop: 8 }}>
              Täytä kaikki kentät jatkaaksesi
            </div>
          )}
        </Card>

        {/* PIN change */}
        <SectionLabel>TURVALLISUUS</SectionLabel>
        <Card>
          {!showPin ? (
            <div style={{ display: 'flex', alignItems: device?.isPhone ? 'stretch' : 'center', justifyContent: 'space-between', flexDirection: device?.isPhone ? 'column' : 'row', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>Salasana</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Vaihda kirjautumissalasana</div>
              </div>
              <Btn onClick={() => setShowPin(true)} variant="ghost" sm>Vaihda salasana</Btn>
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 800, color: C.text, fontSize: 15, marginBottom: 14 }}>Vaihda salasana</div>
              {pinOk ? (
                <div style={{ background: '#E8F5EC', borderRadius: 9, padding: '12px', textAlign: 'center', color: C.success, fontWeight: 700 }}>✓ Salasana vaihdettu!</div>
              ) : (
                <>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>UUSI SALASANA</label>
                  <input type="password" value={p1} onChange={e => setP1(e.target.value)} placeholder="••••••" style={pinInp} />
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>VAHVISTA SALASANA</label>
                  <input type="password" value={p2} onChange={e => setP2(e.target.value)} placeholder="••••••"
                    onKeyDown={e => e.key === 'Enter' && savePin()} style={pinInp} />
                  {pinErr && <div style={{ color: C.danger, fontSize: 13, marginBottom: 10 }}>{pinErr}</div>}
                  <div style={{ display: 'flex', gap: 8, flexDirection: device?.isPhone ? 'column' : 'row' }}>
                    <Btn onClick={() => { setShowPin(false); setPinErr(''); setP1(''); setP2(''); }} variant="ghost" sm>Peruuta</Btn>
                    <Btn onClick={savePin} variant="primary" sm>Tallenna salasana</Btn>
                  </div>
                </>
              )}
            </>
          )}
        </Card>

        {/* Logout */}
        {!forced && (
          <>
            <SectionLabel>TILI</SectionLabel>
            <Card>
              <div style={{ display: 'flex', alignItems: device?.isPhone ? 'stretch' : 'center', justifyContent: 'space-between', flexDirection: device?.isPhone ? 'column' : 'row', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>Kirjaudu ulos</div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Palaa kirjautumisnäkymään</div>
                </div>
                <Btn onClick={() => navigate('login')} variant="danger" sm>Kirjaudu ulos</Btn>
              </div>
            </Card>
          </>
        )}

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

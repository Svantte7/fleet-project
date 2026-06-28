// src/screens/DriverScreens.jsx
import { useState, useEffect } from 'react';
import { SIDES } from '../data/constants.js';
import { getMyInspections, getRememberedTruck, setRememberedTruck, clearRememberedTruck } from '../firebase/firestore.js';
import { C, fmtTime, fmtReg } from '../utils/theme.js';
import { Btn, Card, Field, Toggle, SectionLabel, Badge } from '../components/UI.jsx';
import AppHeader from '../components/AppHeader.jsx';

// ── Driver Home ────────────────────────────────────────────────────────────────
export function DriverHomeScreen({ navigate, params }) {
  const { userId, userName } = params;
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyInspections(userId)
      .then(setInspections)
      .finally(() => setLoading(false));
  }, [userId]);

  const firstName = userName?.split(' ')[0] ?? '';

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader title="KalustoHallinta" onRight={() => navigate('changePin', { userId, forced: false, userName })} rightLabel="PIN" />
      <div style={{ padding: '18px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontSize: 21, fontWeight: 900, color: C.text, marginBottom: 3 }}>Hei, {firstName}! 👋</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Aloita uusi kalustontarkastus</div>

        <Card onClick={() => navigate('regInput', { userId, userName })} style={{ background: `linear-gradient(135deg, ${C.navy}, #243B55)`, marginBottom: 12, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: 'rgba(232,123,53,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🚛</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Uusi tarkastus</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>Syötä rekisteritunnukset ja kuvaa kalusto</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 24 }}>›</div>
          </div>
        </Card>

        <Btn onClick={() => navigate('login')} variant="ghost" full style={{ marginBottom: 22 }}>Kirjaudu ulos</Btn>

        <SectionLabel>OMAT TARKASTUKSET</SectionLabel>

        {loading && <div style={{ textAlign: 'center', padding: 20, color: C.muted }}>Ladataan...</div>}

        {!loading && inspections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: C.muted }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <div>Ei vielä tarkastuksia</div>
          </div>
        )}

        {inspections.map(ins => (
          <Card key={ins.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.text, fontFamily: 'monospace' }}>{ins.trailerReg}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Vetoauto: <b style={{ fontFamily: 'monospace' }}>{ins.truckReg}</b></div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>
                  {ins.createdAt?.toDate ? fmtTime(ins.createdAt.toDate()) : ''}
                </div>
              </div>
              <Badge color={ins.completedAt ? C.success : C.orange} bg={ins.completedAt ? '#E8F5EC' : '#FFF3E0'}>
                {ins.completedAt ? '✓ Valmis' : '⏳ Kesken'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Reg Input ─────────────────────────────────────────────────────────────────
export function RegInputScreen({ navigate, params }) {
  const { userId, userName } = params;
  const [truck,    setTruck]    = useState('');
  const [trailer,  setTrailer]  = useState('');
  const [remember, setRemember] = useState(false);
  const [saved,    setSaved]    = useState('');

  useEffect(() => {
    getRememberedTruck(userId).then(val => {
      if (val) { setTruck(val); setRemember(true); setSaved(val); }
    });
  }, [userId]);

  const handleTruck = v => {
    const f = fmtReg(v); setTruck(f);
    if (remember && f.length >= 2) setRememberedTruck(userId, f);
    else if (remember) clearRememberedTruck(userId);
  };
  const handleRemember = v => {
    setRemember(v);
    if (v && truck.length >= 2) setRememberedTruck(userId, truck);
    else clearRememberedTruck(userId);
  };
  const valid = truck.length >= 2 && trailer.length >= 2;
  const next = () => {
    if (remember && truck.length >= 2) setRememberedTruck(userId, truck);
    navigate('photo', { userId, userName, truckReg: truck, trailerReg: trailer });
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader title="Rekisteritunnukset" onBack={() => navigate('driverHome', { userId, userName })} />
      <div style={{ padding: '22px 16px', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 19, fontWeight: 900, color: C.text, marginBottom: 3 }}>Kaluston tiedot</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Syötä rekisteritunnukset ilman väliviivaa</div>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `${C.steel}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚛</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: C.text }}>Vetoauto</div>
              <div style={{ color: C.muted, fontSize: 11 }}>esim. ABC456</div>
            </div>
            {saved && <span style={{ background: `${C.steel}18`, color: C.steel, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 7 }}>💾 MUISTETTU</span>}
          </div>
          <Field value={truck} onChange={handleTruck} placeholder="ABC456" mono />
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4 }}>
            <Toggle value={remember} onChange={handleRemember} label="Muista tämä vetoauto" sub="Esitäytetään seuraavalla kerralla" />
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `${C.orange}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚌</div>
            <div>
              <div style={{ fontWeight: 800, color: C.text }}>Perävaunu</div>
              <div style={{ color: C.muted, fontSize: 11 }}>esim. QWE123</div>
            </div>
          </div>
          <Field value={trailer} onChange={v => setTrailer(fmtReg(v))} placeholder="QWE123" mono />
        </Card>

        {valid && (
          <Card style={{ background: `${C.navy}07`, border: `1px dashed ${C.border}`, padding: '14px 16px' }}>
            <div style={{ display: 'flex', textAlign: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>VETOAUTO</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 22, color: C.steel, marginTop: 3 }}>{truck}</div>
              </div>
              <div style={{ color: C.border, fontSize: 26, display: 'flex', alignItems: 'center', padding: '0 10px' }}>+</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>PERÄVAUNU</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 22, color: C.orange, marginTop: 3 }}>{trailer}</div>
              </div>
            </div>
          </Card>
        )}

        <Btn onClick={next} full disabled={!valid}>📷 Jatka kuvaukseen →</Btn>
      </div>
    </div>
  );
}

// ── Success ────────────────────────────────────────────────────────────────────
export function SuccessScreen({ navigate, params }) {
  const { trailerReg, userId, userName } = params;
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <div style={{ width: 90, height: 90, borderRadius: 28, background: `${C.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 22 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 8, textAlign: 'center' }}>Tarkastus tallennettu!</div>
      <div style={{ color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 1.6, marginBottom: 36, maxWidth: 300 }}>
        Kuvat on tallennettu Firestoreen perävaunun <b style={{ fontFamily: 'monospace' }}>{trailerReg}</b> rekisterin mukaan.
      </div>
      <Btn onClick={() => navigate('driverHome', { userId, userName })} full>⬅ Palaa etusivulle</Btn>
    </div>
  );
}

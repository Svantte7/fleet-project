// src/screens/DriverScreens.jsx
import { useState, useEffect } from 'react';
import { DB, SIDES } from '../data/store.js';
import { C, fmtTime, fmtReg } from '../utils/theme.js';
import { Btn, Card, Field, Toggle, SectionLabel, Badge } from '../components/UI.jsx';
import AppHeader from '../components/AppHeader.jsx';

// ── Driver Home ────────────────────────────────────────────────────────────────
export function DriverHomeScreen({ navigate, params }) {
  const { userId } = params;
  const user = DB.getUser(userId);
  const [inspections, setInspections] = useState([]);

  useEffect(() => setInspections(DB.getMyInspections(userId)), [userId]);

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader
        title="KalustoHallinta"
        onRight={() => navigate('changePin', { userId, forced: false })}
        rightLabel="PIN"
      />
      <div style={{ padding: '18px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontSize: 21, fontWeight: 900, color: C.text, marginBottom: 3 }}>Hei, {user?.name.split(' ')[0]}! 👋</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Aloita uusi kalustontarkastus</div>

        {/* New inspection CTA */}
        <Card onClick={() => navigate('regInput', { userId })} style={{ background: `linear-gradient(135deg, ${C.navy}, #243B55)`, marginBottom: 12 }}>
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

        {inspections.length === 0 && (
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
                <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{fmtTime(ins.startedAt)}</div>
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
  const { userId } = params;
  const saved = DB.getRememberedTruck(userId);
  const [truck,    setTruck]    = useState(saved);
  const [trailer,  setTrailer]  = useState('');
  const [remember, setRemember] = useState(!!saved);
  const valid = truck.length >= 2 && trailer.length >= 2;

  const handleTruck = v => {
    const f = fmtReg(v); setTruck(f);
    if (remember && f.length >= 2) DB.setRememberedTruck(userId, f);
    else if (remember) DB.clearRememberedTruck(userId);
  };
  const handleRemember = v => {
    setRemember(v);
    if (v && truck.length >= 2) DB.setRememberedTruck(userId, truck);
    else DB.clearRememberedTruck(userId);
  };
  const next = () => {
    if (remember && truck.length >= 2) DB.setRememberedTruck(userId, truck);
    navigate('photo', { userId, truckReg: truck, trailerReg: trailer });
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader title="Rekisteritunnukset" onBack={() => navigate('driverHome', { userId })} />
      <div style={{ padding: '22px 16px', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 19, fontWeight: 900, color: C.text, marginBottom: 3 }}>Kaluston tiedot</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Syötä rekisteritunnukset ilman väliviivaa</div>

        {/* Truck */}
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

        {/* Trailer */}
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

        {/* Preview */}
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
  const { trailerReg, userId } = params;
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <div style={{ width: 90, height: 90, borderRadius: 28, background: `${C.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 22 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 8, textAlign: 'center' }}>Tarkastus tallennettu!</div>
      <div style={{ color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 1.6, marginBottom: 36, maxWidth: 300 }}>
        Kuvat on tallennettu perävaunun <b style={{ fontFamily: 'monospace' }}>{trailerReg}</b> rekisterin mukaan.
      </div>
      <Btn onClick={() => navigate('driverHome', { userId })} full>⬅ Palaa etusivulle</Btn>
    </div>
  );
}

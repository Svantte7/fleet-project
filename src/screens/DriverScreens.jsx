// src/screens/DriverScreens.jsx
import { useState, useEffect } from 'react';
import { SIDES } from '../data/constants.js';
import { getMyInspections, getRememberedTruck, setRememberedTruck, clearRememberedTruck } from '../firebase/firestore.js';
import { C, fmtTime, fmtReg } from '../utils/theme.js';
import { Btn, Card, Field, Toggle, SectionLabel, Badge } from '../components/UI.jsx';
import AppHeader from '../components/AppHeader.jsx';

// ── Driver Home ────────────────────────────────────────────────────────────────
export function DriverHomeScreen({ navigate, params, device }) {
  const { userId, userName } = params;
  const [inspections, setInspections] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    getMyInspections(userId)
      .then(setInspections)
      .finally(() => setLoading(false));
  }, [userId]);

  const firstName = userName?.split(' ')[0] ?? '';
  const fmtTs = (ts) => ts?.toDate ? fmtTime(ts.toDate()) : ts ? fmtTime(ts) : '';

  if (selectedInspection) {
    const ins = selectedInspection;

    return (
      <div style={{ minHeight: '100vh', background: C.bg }}>
        {lightbox && (
          <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <img src={lightbox.url} alt={lightbox.label} style={{ maxWidth: '100%', maxHeight: '82vh', borderRadius: 12, objectFit: 'contain' }} />
            {lightbox.description && (
              <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16, background: 'rgba(0,0,0,0.75)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ color: C.danger, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Kuvaus</div>
                <div style={{ color: '#fff', fontSize: 13, lineHeight: 1.5 }}>{lightbox.description}</div>
              </div>
            )}
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 18, width: 38, height: 38, borderRadius: '50%', cursor: 'pointer' }}>x</button>
          </div>
        )}

        <AppHeader
          title={ins.trailerReg}
          subtitle="Raportti"
          onBack={() => setSelectedInspection(null)}
          device={device}
        />

        <div style={{ padding: device?.isPhone ? '12px' : '16px', maxWidth: 600, margin: '0 auto' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, color: C.text, fontSize: 18, fontFamily: 'monospace' }}>{ins.trailerReg}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Vetoauto: <b style={{ fontFamily: 'monospace' }}>{ins.truckReg}</b></div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{fmtTs(ins.createdAt)}</div>
              </div>
              <Badge color={ins.completedAt ? C.success : C.orange} bg={ins.completedAt ? 'rgba(46,158,107,0.2)' : 'rgba(196,28,28,0.15)'}>
                {ins.completedAt ? 'Valmis' : 'Kesken'}
              </Badge>
            </div>
          </Card>

          <SectionLabel>PERUSKUVAT</SectionLabel>
          {ins.photos?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${device?.isPhone ? 2 : 3}, 1fr)`, gap: 7, marginBottom: 16 }}>
              {ins.photos.map(ph => (
                <div key={ph.side || ph.sideLabel} onClick={() => ph.url && setLightbox({ url: ph.url, label: ph.sideLabel })}
                  style={{ borderRadius: 9, overflow: 'hidden', position: 'relative', aspectRatio: '1', cursor: ph.url ? 'pointer' : 'default', background: C.border }}>
                  {ph.url
                    ? <img src={ph.url} alt={ph.sideLabel} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 11 }}>{ph.sideLabel}</div>
                  }
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', padding: '3px 5px' }}>
                    <div style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>{ph.sideLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>Ei tallennettuja peruskuvia.</p>
          )}

          <SectionLabel>VAURIOT / HUOMIOT</SectionLabel>
          {ins.damagePhotos?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${device?.isPhone ? 2 : 3}, 1fr)`, gap: 7, marginBottom: 12 }}>
              {ins.damagePhotos.map((ph, i) => (
                <div key={i} onClick={() => ph.url && setLightbox({ url: ph.url, label: `Vaurio ${i + 1}`, description: ins.damageDescription })}
                  style={{ borderRadius: 9, overflow: 'hidden', position: 'relative', aspectRatio: '1', cursor: ph.url ? 'pointer' : 'default', background: C.border }}>
                  {ph.url && <img src={ph.url} alt={`Vaurio ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(180,30,30,0.72)', padding: '3px 5px' }}>
                    <div style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>Vaurio {i + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>Ei vauriokuvia.</p>
          )}

          {ins.damageDescription && (
            <div style={{ background: 'rgba(217,79,79,0.07)', border: `1px solid rgba(217,79,79,0.2)`, borderRadius: 10, padding: '11px 13px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.danger, textTransform: 'uppercase', marginBottom: 4 }}>Kuvaus</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{ins.damageDescription}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader
        title="Specto"
        onRight={() => navigate('login')}
        rightLabel="Ulos"
        device={device}
      />
      <div style={{ padding: device?.isPhone ? '16px 12px' : '18px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontSize: 21, fontWeight: 900, color: C.text, marginBottom: 3 }}>Hei, {firstName}! 👋</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Aloita uusi kalustontarkastus</div>

        {/* Ajoonlähtötarkastus CTA */}
        <Card onClick={() => navigate('regInput', { userId, userName, nextScreen: 'checklist' })}
          style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, marginBottom: 10, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: 'rgba(252,165,165,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🚦</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Ajoonlähtötarkastus</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>Tarkista kalusto ennen lähtöä — 9 kohtaa</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 24 }}>›</div>
          </div>
        </Card>

        {/* Kuvaus CTA */}
        <Card onClick={() => navigate('regInput', { userId, userName, nextScreen: 'photo' })}
          style={{ marginBottom: 10, cursor: 'pointer', border: `1.5px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: `${C.steel}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>📷</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>Kuvaus</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Kuvaa kaluston kunto ennen ja jälkeen</div>
            </div>
            <div style={{ color: C.border, fontSize: 24 }}>›</div>
          </div>
        </Card>

        {/* Profile card */}
        <Card onClick={() => navigate('profile', { userId, userName })}
          style={{ marginBottom: 22, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: `${C.steel}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>Profiili</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 1 }}>Omat tiedot ja salasanan vaihto</div>
            </div>
            <div style={{ color: C.border, fontSize: 22 }}>›</div>
          </div>
        </Card>

        <SectionLabel>OMAT TARKASTUKSET</SectionLabel>

        {loading && <div style={{ textAlign: 'center', padding: 20, color: C.muted }}>Ladataan...</div>}

        {!loading && inspections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: C.muted }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <div>Ei vielä tarkastuksia</div>
          </div>
        )}

        {inspections.map(ins => {
          const dmg = ins.type === 'departure'
            ? ins.checklistItems?.some(i => i.status === 'defect' || i.status === 'notice')
            : (ins.damagePhotos?.length > 0) || !!ins.damageDescription;
          const ack = ins.damageAcknowledged;
          return (
            <Card key={ins.id} onClick={() => setSelectedInspection(ins)} style={{ cursor: 'pointer', border: dmg && !ack ? `1.5px solid rgba(196,28,28,0.35)` : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontWeight: 800, fontSize: 16, color: C.text, fontFamily: 'monospace' }}>{ins.trailerReg}</span>
                    {dmg && <span title={ack ? 'Vaurio huomioitu' : 'Vaurio ei vielä huomioitu'}>{ack ? '✅' : '⚠️'}</span>}
                  </div>
                  <div style={{ color: C.muted, fontSize: 12 }}>Vetoauto: <b style={{ fontFamily: 'monospace' }}>{ins.truckReg}</b></div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{fmtTs(ins.createdAt)}</div>
                  {ins.type === 'departure'
                    ? <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>🚦 Ajoonlähtötarkastus</div>
                    : <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{(ins.photos?.length || 0)} peruskuvaa{(ins.damagePhotos?.length || 0) > 0 ? ` · ${ins.damagePhotos.length} vauriokuvaa` : ''}</div>
                  }
                  {dmg && ack && <div style={{ color: C.success, fontSize: 11, fontWeight: 700, marginTop: 3 }}>✓ Työnjohtaja huomioinut</div>}
                  {dmg && !ack && <div style={{ color: C.danger, fontSize: 11, fontWeight: 700, marginTop: 3 }}>⚠️ Odottaa huomiointia</div>}
                </div>
                <Badge color={ins.completedAt ? C.success : C.orange} bg={ins.completedAt ? 'rgba(46,158,107,0.2)' : 'rgba(196,28,28,0.15)'}>
                  {ins.completedAt ? '✓ Valmis' : '⏳ Kesken'}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Reg Input ─────────────────────────────────────────────────────────────────
export function RegInputScreen({ navigate, params, device }) {
  const { userId, userName, nextScreen = 'photo' } = params;
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
    navigate(nextScreen, { userId, userName, truckReg: truck, trailerReg: trailer });
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader title="Rekisteritunnukset" subtitle={nextScreen === 'checklist' ? 'Ajoonlähtötarkastus' : 'Kuvaus'} onBack={() => navigate('driverHome', { userId, userName })} device={device} />
      <div style={{ padding: device?.isPhone ? '18px 12px' : '22px 16px', maxWidth: 520, margin: '0 auto' }}>
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
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `${C.steel}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚌</div>
            <div>
              <div style={{ fontWeight: 800, color: C.text }}>Perävaunu</div>
              <div style={{ color: C.muted, fontSize: 11 }}>esim. QWE123</div>
            </div>
          </div>
          <Field value={trailer} onChange={v => setTrailer(fmtReg(v))} placeholder="QWE123" mono />
        </Card>

        {valid && (
          <Card style={{ background: `${C.navy}07`, border: `1px dashed ${C.border}`, padding: '14px 16px' }}>
            <div style={{ display: 'flex', textAlign: 'center', gap: device?.isPhone ? 6 : 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>VETOAUTO</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: device?.isPhone ? 18 : 22, color: C.steel, marginTop: 3 }}>{truck}</div>
              </div>
              <div style={{ color: C.border, fontSize: 24, display: 'flex', alignItems: 'center', padding: device?.isPhone ? '0 2px' : '0 10px' }}>+</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>PERÄVAUNU</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: device?.isPhone ? 18 : 22, color: C.steel, marginTop: 3 }}>{trailer}</div>
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
export function SuccessScreen({ navigate, params, device }) {
  const { trailerReg, userId, userName } = params;
  return (
    <div style={{ minHeight: '100dvh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: device?.isPhone ? 20 : 28 }}>
      <div style={{ width: 90, height: 90, borderRadius: 28, background: `${C.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 22 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 8, textAlign: 'center' }}>Tarkastus tallennettu!</div>
      <div style={{ color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 1.6, marginBottom: 36, maxWidth: 300 }}>
        Kuvat on tallennettu perävaunun <b style={{ fontFamily: 'monospace' }}>{trailerReg}</b> rekisterin mukaan.
      </div>
      <Btn onClick={() => navigate('driverHome', { userId, userName })} full>⬅ Palaa etusivulle</Btn>
    </div>
  );
}

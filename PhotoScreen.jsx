// src/screens/PhotoScreen.jsx
import { useState, useCallback } from 'react';
import { SIDES } from '../data/constants.js';
import { saveInspection } from '../firebase/firestore.js';
import { uploadInspectionPhotos } from '../firebase/storage.js';
import { C, fmtTime } from '../utils/theme.js';
import { Btn, Card } from '../components/UI.jsx';
import AppHeader from '../components/AppHeader.jsx';
import CameraModal from '../components/CameraModal.jsx';

export default function PhotoScreen({ navigate, params }) {
  const { userId, truckReg, trailerReg, userName } = params;
  const [photos,    setPhotos]    = useState({});
  const [dmgPhotos, setDmgPhotos] = useState([]);
  const [dmgDesc,   setDmgDesc]   = useState('');
  const [camSlot,   setCamSlot]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [saveStep,  setSaveStep]  = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);

  const normalDone = Object.keys(photos).length;
  const totalDone  = normalDone + (dmgPhotos.length > 0 ? 1 : 0);
  const total      = SIDES.length + 1;
  const allDone    = normalDone === SIDES.length && dmgPhotos.length > 0;
  const pct        = Math.round((totalDone / total) * 100);

  const handlePhoto = useCallback((img) => {
    const slot = camSlot;
    setCamSlot(null);
    if (!slot) return;
    if (slot === 'damage') setDmgPhotos(p => [...p, img]);
    else setPhotos(p => ({ ...p, [slot]: img }));
  }, [camSlot]);

  const save = async () => {
    if (totalDone === 0 || saving) return;
    setSaving(true);

    try {
      // 1. Luo tarkastus Firestoreen (ilman kuva-URLeja vielä)
      setSaveStep('Luodaan tarkastus...');
      const insId = await saveInspection({
        trailerReg, truckReg, userId, userName,
        photos: SIDES.filter(s => photos[s.key]).map(s => ({
          side: s.key, sideLabel: s.label, url: null, takenAt: photos[s.key].takenAt,
        })),
        damagePhotos: dmgPhotos.map(p => ({ url: null, takenAt: p.takenAt })),
        damageDescription: dmgDesc,
        completedAt: true,
      });

      // 2. Lataa kuvat Storageen
      setSaveStep('Ladataan kuvia...');
      const photoDataUrls = {};
      SIDES.filter(s => photos[s.key]).forEach(s => { photoDataUrls[s.key] = photos[s.key].uri; });
      const dmgDataUrls = dmgPhotos.map(p => p.uri);

      const { photoURLs, damagePhotoURLs } = await uploadInspectionPhotos(insId, photoDataUrls, dmgDataUrls);

      // 3. Päivitä Firestoreen oikeat URL:t
      setSaveStep('Tallennetaan...');
      const { updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase/config.js');
      await updateDoc(doc(db, 'inspections', insId), {
        photos: SIDES.filter(s => photos[s.key]).map(s => ({
          side: s.key, sideLabel: s.label,
          url: photoURLs[s.key] || null,
          takenAt: photos[s.key].takenAt,
        })),
        damagePhotos: dmgPhotos.map((p, i) => ({
          url: damagePhotoURLs[i] || null,
          takenAt: p.takenAt,
        })),
      });

      navigate('success', { trailerReg, userId });
    } catch (err) {
      console.error('Save error:', err);
      alert('Tallentaminen epäonnistui: ' + err.message);
      setSaving(false);
      setSaveStep('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {camSlot && (
        <CameraModal sideKey={camSlot} trailerReg={trailerReg} onPhoto={handlePhoto} onClose={() => setCamSlot(null)} />
      )}

      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <img src={lightboxImg} alt="" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <button onClick={() => setLightboxImg(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 20, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <AppHeader title="Kuvaus" subtitle={trailerReg} onBack={() => navigate('regInput', { userId, truckReg, trailerReg, userName })} />

      <div style={{ background: C.surface, padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{totalDone} / {total} osiota valmiina</span>
          <span style={{ fontSize: 13, color: C.muted }}>{pct}%</span>
        </div>
        <div style={{ height: 7, background: C.border, borderRadius: 7, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${C.steel}, ${C.orange})`, borderRadius: 7, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ padding: '14px 16px', maxWidth: 600, margin: '0 auto' }}>
        {SIDES.map(side => {
          const ph = photos[side.key];
          return (
            <Card key={side.key} style={{ padding: 0, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 90, height: 90, flexShrink: 0, background: ph ? 'transparent' : `${C.navy}0A`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: ph ? 'pointer' : 'default' }}
                  onClick={() => ph && setLightboxImg(ph.uri)}>
                  {ph
                    ? <img src={ph.uri} alt={side.label} style={{ width: 90, height: 90, objectFit: 'cover' }} />
                    : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 26 }}>{side.icon}</div><div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>Ei kuvaa</div></div>
                  }
                  {ph && <div style={{ position: 'absolute', bottom: 4, right: 4, background: C.success, borderRadius: 9, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>✓</div>}
                </div>
                <div style={{ flex: 1, padding: '10px 13px' }}>
                  <div style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>{side.label}</div>
                  {ph && <div style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{fmtTime(ph.takenAt)}</div>}
                </div>
                <div style={{ paddingRight: 14 }}>
                  <Btn onClick={() => setCamSlot(side.key)} variant={ph ? 'ghost' : 'primary'} sm disabled={saving}>{ph ? '🔄' : '📷'}</Btn>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Damage card */}
        <Card style={{ border: `2px solid ${dmgPhotos.length > 0 ? `${C.danger}44` : C.border}`, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(217,79,79,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>Vauriot / huomiot</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{dmgPhotos.length} kuvaa · useita sallittu</div>
            </div>
            {dmgPhotos.length > 0 && <span style={{ background: '#E8F5EC', color: C.success, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9 }}>✓ Kuvattuna</span>}
          </div>

          {dmgPhotos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
              {dmgPhotos.map((ph, i) => (
                <div key={i} style={{ position: 'relative', width: 88, height: 88, borderRadius: 9, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setLightboxImg(ph.uri)}>
                  <img src={ph.uri} alt={`vaurio ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={e => { e.stopPropagation(); setDmgPhotos(p => p.filter((_, j) => j !== i)); }}
                    style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(217,79,79,0.92)', border: 'none', color: '#fff', borderRadius: 7, width: 22, height: 22, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <Btn onClick={() => setCamSlot('damage')} variant="danger" full sm disabled={saving}>📷  Lisää kuva vauriosta</Btn>

          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Vaurionkuvaus</label>
            <textarea value={dmgDesc} onChange={e => setDmgDesc(e.target.value)}
              placeholder="Kuvaile havaitut vauriot tai huomiot tarkasti..." rows={3}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 11, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.text, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.55, outline: 'none' }} />
          </div>
        </Card>

        {saving && (
          <div style={{ background: `${C.steel}15`, borderRadius: 11, padding: '12px 16px', marginBottom: 10, textAlign: 'center' }}>
            <div style={{ color: C.steel, fontSize: 13, fontWeight: 700 }}>⏳ {saveStep}</div>
          </div>
        )}

        <Btn onClick={save} full variant={allDone ? 'success' : 'primary'} disabled={totalDone === 0 || saving} style={{ marginBottom: 10 }}>
          {saving ? '⏳  Tallennetaan...' : allDone ? '✅  Tallenna tarkastus' : `💾  Tallenna (${totalDone}/${total} osiota)`}
        </Btn>

        {totalDone > 0 && !allDone && !saving && (
          <div style={{ textAlign: 'center', color: C.muted, fontSize: 11 }}>Voit tallentaa myös kesken tarkastuksen</div>
        )}
        <div style={{ height: 30 }} />
      </div>
    </div>
  );
}

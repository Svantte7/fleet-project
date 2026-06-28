// src/screens/ChecklistScreen.jsx
import { useState } from 'react';
import { DEPARTURE_CHECKLIST, ALL_CHECKLIST_KEYS } from '../data/checklist.js';
import { saveInspection } from '../firebase/firestore.js';
import { C } from '../utils/theme.js';
import { Btn, Card } from '../components/UI.jsx';
import AppHeader from '../components/AppHeader.jsx';

const STATUS = {
  ok:     { label: 'OK',     icon: '✓', color: '#2E9E6B', bg: 'rgba(46,158,107,0.18)' },
  notice: { label: 'Huomio', icon: '⚠️', color: '#E6A817', bg: 'rgba(230,168,23,0.18)' },
  defect: { label: 'Vika',   icon: '✗', color: '#C41C1C', bg: 'rgba(196,28,28,0.18)' },
};

function StatusBtn({ value, active, onClick }) {
  const s = STATUS[value];
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '8px 4px', borderRadius: 10, border: `2px solid ${active ? s.color : C.border}`,
      background: active ? s.bg : 'transparent', color: active ? s.color : C.muted,
      fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
      transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    }}>
      <span>{s.icon}</span> {s.label}
    </button>
  );
}

export default function ChecklistScreen({ navigate, params, device }) {
  const { userId, userName, truckReg, trailerReg } = params;

  const [statuses, setStatuses] = useState({});
  const [notes,    setNotes]    = useState({});
  const [saving,   setSaving]   = useState(false);

  const setStatus = (key, val) => setStatuses(s => ({ ...s, [key]: val }));
  const setNote   = (key, val) => setNotes(n => ({ ...n, [key]: val }));

  const checkedCount = ALL_CHECKLIST_KEYS.filter(k => statuses[k]).length;
  const total        = ALL_CHECKLIST_KEYS.length;
  const allDone      = checkedCount === total;
  const pct          = Math.round((checkedCount / total) * 100);
  const hasDefects   = Object.values(statuses).some(s => s === 'defect');

  const save = async () => {
    if (!allDone || saving) return;
    setSaving(true);
    try {
      await saveInspection({
        type:        'departure',
        userId,      userName,
        truckReg,    trailerReg,
        checklistItems: ALL_CHECKLIST_KEYS.map(key => ({
          key,
          status: statuses[key],
          note:   notes[key] || '',
        })),
        completedAt: true,
      });
      navigate('success', { trailerReg, userId, userName, type: 'departure' });
    } catch (err) {
      console.error(err);
      alert('Tallentaminen epäonnistui: ' + err.message);
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader
        title="Ajoonlähtötarkastus"
        subtitle={trailerReg}
        onBack={() => navigate('regInput', { userId, userName, nextScreen: 'checklist', truckReg, trailerReg })}
        device={device}
      />

      {/* Progress bar */}
      <div style={{ background: C.surface, padding: device?.isPhone ? '10px 12px' : '12px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{checkedCount} / {total} kohtaa tarkastettu</span>
          <span style={{ fontSize: 13, color: C.muted }}>{pct}%</span>
        </div>
        <div style={{ height: 7, background: C.border, borderRadius: 7, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: hasDefects ? `linear-gradient(90deg, ${C.steel}, #E6A817)` : `linear-gradient(90deg, ${C.steel}, #2E9E6B)`, borderRadius: 7, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ padding: device?.isPhone ? '12px 10px' : '14px 16px', maxWidth: 640, margin: '0 auto' }}>

        {DEPARTURE_CHECKLIST.map(cat => (
          <div key={cat.category} style={{ marginBottom: 24 }}>
            {/* Category header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cat.category}</span>
            </div>

            {cat.items.map(item => {
              const st = statuses[item.key];
              const needsNote = st === 'notice' || st === 'defect';
              return (
                <Card key={item.key} style={{ marginBottom: 8, border: `1.5px solid ${st ? STATUS[st].color + '55' : C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 1,
                      background: st ? STATUS[st].bg : `${C.navyLight}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, color: st ? STATUS[st].color : C.muted, fontWeight: 800,
                    }}>
                      {st ? STATUS[st].icon : '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: C.text, fontSize: 14, marginBottom: 3 }}>{item.label}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>

                  {/* Status buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {Object.keys(STATUS).map(val => (
                      <StatusBtn key={val} value={val} active={st === val} onClick={() => setStatus(item.key, val)} />
                    ))}
                  </div>

                  {/* Note field for notice/defect */}
                  {needsNote && (
                    <div style={{ marginTop: 10 }}>
                      <textarea
                        value={notes[item.key] || ''}
                        onChange={e => setNote(item.key, e.target.value)}
                        placeholder="Lisää huomio tai kuvaus viasta..."
                        rows={2}
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: 10,
                          border: `1.5px solid ${STATUS[st].color}55`,
                          fontSize: 13, color: C.text, background: C.bg,
                          resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, outline: 'none',
                        }}
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ))}

        {/* Defect summary */}
        {hasDefects && (
          <div style={{ background: 'rgba(196,28,28,0.1)', border: `1px solid rgba(196,28,28,0.3)`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ color: C.danger, fontWeight: 800, fontSize: 13, marginBottom: 4 }}>⚠️ Vikoja havaittu</div>
            <div style={{ color: C.muted, fontSize: 12 }}>Ilmoita vioista työnjohtajalle ennen lähtöä.</div>
          </div>
        )}

        <Btn
          onClick={save}
          full
          variant={allDone ? (hasDefects ? 'danger' : 'success') : 'primary'}
          disabled={!allDone || saving}
          style={{ marginBottom: 16 }}
        >
          {saving ? '⏳  Tallennetaan...' : allDone ? '✅  Tallenna tarkastus' : `📋  Tarkasta kaikki kohteet (${checkedCount}/${total})`}
        </Btn>
      </div>
    </div>
  );
}

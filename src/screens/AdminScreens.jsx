// src/screens/AdminScreens.jsx
import { useState, useEffect } from 'react';
import { SIDES } from '../data/constants.js';
import {
  getAllInspections, getByTrailer, getVisibleUsers,
  markAllSeen, getNewCount,
  deactivateUser, updateUserRole, markDamageAcknowledged,
} from '../firebase/firestore.js';
import { registerDriver, resetUserPassword } from '../firebase/auth.js';
import { C, fmtTime, fmtReg } from '../utils/theme.js';
import { Btn, Card, Field, Badge, SectionLabel } from '../components/UI.jsx';
import AppHeader from '../components/AppHeader.jsx';

const T = {
  adminTitle:    'Hallintapaneeli',
  adminGreet:    'P\u00e4\u00e4k\u00e4ytt\u00e4j\u00e4 \uD83D\uDC4B',
  adminSub:      'Kaluston hallintanäkymä',
  newReports:    (n) => `${n} uusi raportti${n > 1 ? 'a' : ''} odottaa`,
  tapToCheck:    'Napauta tarkistaaksesi',
  reports:       'Raportit',
  drivers:       'Käyttäjät',
  inspections:   'tarkastusta',
  users:         'käyttäjää',
  logout:        'Ulos',
  loading:       '...',
  trailers:      'PERÄVAUNUT',
  noResults:     'Ei tuloksia',
  basicPhotos:   'PERUSKUVAT',
  damagePhotos:  'VAURIOT / HUOMIOT',
  noDamage:      'Ei vauriokuvia tai kuvausta.',
  description:   'Kuvaus',
  ready:         'Valmis',
  pending:       'Kesken',
  userMgmt:      'Käyttäjähallinta',
  createDriver:  'Luo kuljettajatunnus',
  newDriver:     '+ Uusi',
  nameLabel:     'Nimi',
  phoneLabel:    'Puhelinnumero',
  namePlaceholder: 'Etunimi Sukunimi',
  phonePlaceholder: '040 1234567',
  cancel:        'Peruuta',
  create:        'Luo tunnus',
  created:       'Tunnus luotu!',
  createdName:   'Nimi',
  createdPhone:  'Puhelin',
  createdPin:    'Väliaikainen salasana',
  createdNote:   'Käyttäjä vaihtaa salasanan ensimmäisellä kirjautumiskerralla.',
  close:         'Sulje',
  active:        'Aktiivinen',
  deactivated:   'Deaktivoitu',
  pinChange:     'Salasanan vaihto vaaditaan',
  remove:        'Poista',
  confirmRemove: (name) => `Haluatko varmasti deaktivoida käyttäjän ${name}?`,
  searchPlaceholder: 'Hae rekisterillä...',
  inspCount:     (n) => `${n} tarkastus${n !== 1 ? 'ta' : ''}`,
  photoCount:    (n, d) => `${n} peruskuvaa${d > 0 ? ` · ${d} vauriokuvaa` : ''}`,
  damage_i:      (i) => `Vaurio ${i + 1}`,
  trailersLabel: 'PERÄVAUNUT',
  driversList:   'KÄYTTÄJÄT',
};

// Tunnistaa onko tarkastuksessa vaurioita (kuvaus- tai checklist-tarkastus)
const hasDamage = (ins) => {
  if (ins.type === 'departure') return ins.checklistItems?.some(i => i.status === 'defect' || i.status === 'notice');
  return (ins.damagePhotos?.length > 0) || !!ins.damageDescription;
};

// ── Admin Home ─────────────────────────────────────────────────────────────────
export function AdminHomeScreen({ navigate, params, device }) {
  const { userId, role } = params;
  const [newCount, setNewCount] = useState(0);
  const [totals,   setTotals]   = useState({ ins: 0, trailers: 0, users: 0 });
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getNewCount(), getAllInspections(), getVisibleUsers(role)]).then(([nc, ins, users]) => {
      setNewCount(nc);
      setTotals({
        ins:        ins.length,
        trailers:   [...new Set(ins.map(i => i.trailerReg))].length,
        users:      users.length,
        unackDmg:   ins.filter(i => hasDamage(i) && !i.damageAcknowledged).length,
      });
      setLoading(false);
    });
  }, [role]);

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader title={T.adminTitle} onRight={() => navigate('login')} rightLabel={T.logout} device={device} />
      <div style={{ padding: device?.isPhone ? '16px 12px' : '18px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontSize: 21, fontWeight: 900, color: C.text, marginBottom: 3 }}>{T.adminGreet}</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>{T.adminSub}</div>

        {newCount > 0 && (
          <Card onClick={() => navigate('adminReports', { userId, role })}
            style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, marginBottom: 14, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 26 }}>🔔</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>{T.newReports(newCount)}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 }}>{T.tapToCheck}</div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 24 }}>›</div>
            </div>
          </Card>
        )}

        {/* Tilastokortit */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Tarkastuksia', val: totals.ins,      color: C.steel },
            { label: 'Perävaunuja',  val: totals.trailers, color: C.navyLight },
            { label: 'Huomioimatta', val: totals.unackDmg, color: totals.unackDmg > 0 ? C.danger : C.success },
          ].map(s => (
            <Card key={s.label} style={{ textAlign: 'center', padding: '12px 8px', marginBottom: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{loading ? '…' : s.val}</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {[
          { icon: '📋', title: T.reports,  sub: loading ? T.loading : `${totals.ins} ${T.inspections}`,  badge: newCount || null, color: C.steel,   screen: 'adminReports' },
          { icon: '👥', title: T.drivers,  sub: loading ? T.loading : `${totals.users} ${T.users}`,      badge: null,             color: C.success, screen: 'adminUsers' },
          { icon: '👤', title: 'Profiili', sub: 'Omat tiedot ja salasanan vaihto',                       badge: null,             color: C.steel,   screen: 'profile' },
        ].map(item => (
          <Card key={item.title} onClick={() => navigate(item.screen, { userId, role })} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${item.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{item.title}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{item.sub}</div>
              </div>
              {item.badge ? <div style={{ background: C.orange, color: '#fff', borderRadius: 18, minWidth: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, padding: '0 7px' }}>{item.badge}</div> : null}
              <div style={{ color: C.border, fontSize: 22 }}>›</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Admin Reports ──────────────────────────────────────────────────────────────
export function AdminReportsScreen({ navigate, params, device }) {
  const { userId, role } = params;
  const [search,   setSearch]  = useState('');
  const [selReg,   setSelReg]  = useState(null);
  const [selIns,   setSelIns]  = useState(null);
  const [lightbox, setLightbox]= useState(null);
  const [allRegs,  setAllRegs] = useState([]);
  const [allIns,   setAllIns]  = useState([]);
  const [regIns,   setRegIns]  = useState([]);
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    markAllSeen();
    getAllInspections().then(ins => {
      setAllIns(ins);
      setAllRegs([...new Set(ins.map(i => i.trailerReg))]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selReg) getByTrailer(selReg).then(setRegIns);
  }, [selReg]);

  const filtered = allRegs.filter(r => r.includes(search.toUpperCase()));
  const fmtTs = (ts) => ts?.toDate ? fmtTime(ts.toDate()) : ts ? fmtTime(ts) : '';

  // Detail view
  if (selIns) {
    const dmg = hasDamage(selIns);
    const ack = selIns.damageAcknowledged;
    const toggleSelAck = async () => {
      const next = !ack;
      await markDamageAcknowledged(selIns.id, next);
      setSelIns(prev => ({ ...prev, damageAcknowledged: next }));
      setRegIns(prev => prev.map(i => i.id === selIns.id ? { ...i, damageAcknowledged: next } : i));
    };
    return (
      <div style={{ minHeight: '100vh', background: C.bg }}>
        {lightbox && (
          <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <img src={lightbox.url} alt={lightbox.label} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain' }} />
            {lightbox.description && (
              <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16, background: 'rgba(0,0,0,0.75)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ color: C.danger, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{T.description}</div>
                <div style={{ color: '#fff', fontSize: 13, lineHeight: 1.5 }}>{lightbox.description}</div>
              </div>
            )}
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 18, width: 38, height: 38, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          </div>
        )}
        <AppHeader title={selIns.trailerReg} subtitle="Tarkastus" onBack={() => setSelIns(null)} onHome={() => navigate('adminHome', { userId, role })} device={device} />
        <div style={{ padding: device?.isPhone ? '12px' : '16px', maxWidth: 600, margin: '0 auto' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, color: C.text, fontSize: 15 }}>👤 {selIns.userName}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>🚛 <b style={{ fontFamily: 'monospace' }}>{selIns.truckReg}</b></div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>📅 {fmtTs(selIns.createdAt)}</div>
                {selIns.type === 'departure' && <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>🚦 Ajoonlähtötarkastus</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <Badge color={selIns.completedAt ? C.success : C.orange} bg={selIns.completedAt ? 'rgba(46,158,107,0.2)' : 'rgba(196,28,28,0.15)'}>
                  {selIns.completedAt ? `✓ ${T.ready}` : `⏳ ${T.pending}`}
                </Badge>
                {dmg && (
                  <button onClick={toggleSelAck} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9,
                    border: `1.5px solid ${ack ? 'rgba(46,158,107,0.5)' : 'rgba(196,28,28,0.5)'}`,
                    background: ack ? 'rgba(46,158,107,0.12)' : 'rgba(196,28,28,0.08)',
                    color: ack ? C.success : C.danger, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid currentColor`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{ack ? '✓' : ''}</span>
                    {ack ? 'Huomioitu' : '⚠️ Merkitse huomioiduksi'}
                  </button>
                )}
              </div>
            </div>
          </Card>

          <SectionLabel>{T.basicPhotos}</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${device?.isPhone ? 2 : 3},1fr)`, gap: 7, marginBottom: 16 }}>
            {selIns.photos?.map(ph => (
              <div key={ph.side} onClick={() => ph.url && setLightbox({ url: ph.url, label: ph.sideLabel })}
                style={{ borderRadius: 9, overflow: 'hidden', position: 'relative', aspectRatio: '1', cursor: ph.url ? 'pointer' : 'default', background: C.border }}>
                {ph.url
                  ? <img src={ph.url} alt={ph.sideLabel} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${C.border}66` }}>
                      <span style={{ color: C.muted, fontSize: 11 }}>{ph.sideLabel}</span>
                    </div>
                }
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', padding: '3px 5px' }}>
                  <div style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>{ph.sideLabel}</div>
                </div>
              </div>
            ))}
          </div>

          <SectionLabel style={{ color: C.danger }}>⚠️ {T.damagePhotos}</SectionLabel>
          {(!selIns.damagePhotos?.length && !selIns.damageDescription) && (
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>{T.noDamage}</p>
          )}
          {selIns.damagePhotos?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${device?.isPhone ? 2 : 3},1fr)`, gap: 7, marginBottom: 12 }}>
              {selIns.damagePhotos.map((ph, i) => (
                <div key={i} onClick={() => setLightbox({ url: ph.url, label: T.damage_i(i), description: selIns.damageDescription })}
                  style={{ borderRadius: 9, overflow: 'hidden', position: 'relative', aspectRatio: '1', cursor: 'pointer' }}>
                  {ph.url && <img src={ph.url} alt={T.damage_i(i)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(180,30,30,0.72)', padding: '3px 5px' }}>
                    <div style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>{T.damage_i(i)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {selIns.damageDescription && (
            <div style={{ background: 'rgba(217,79,79,0.07)', border: `1px solid rgba(217,79,79,0.2)`, borderRadius: 10, padding: '11px 13px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.danger, textTransform: 'uppercase', marginBottom: 4 }}>{T.description}</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{selIns.damageDescription}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Trailer inspection list
  if (selReg) {
    const toggleAck = async (e, ins) => {
      e.stopPropagation();
      const next = !ins.damageAcknowledged;
      await markDamageAcknowledged(ins.id, next);
      setRegIns(prev => prev.map(i => i.id === ins.id ? { ...i, damageAcknowledged: next } : i));
    };
    return (
      <div style={{ minHeight: '100vh', background: C.bg }}>
        <AppHeader title={selReg} subtitle="Tarkastukset" onBack={() => setSelReg(null)} onHome={() => navigate('adminHome', { userId, role })} device={device} />
        <div style={{ padding: device?.isPhone ? '12px' : '16px', maxWidth: 600, margin: '0 auto' }}>
          {regIns.map(ins => {
            const dmg = hasDamage(ins);
            const ack = ins.damageAcknowledged;
            return (
              <Card key={ins.id} onClick={() => setSelIns(ins)} style={{ cursor: 'pointer', border: dmg && !ack ? `1.5px solid rgba(196,28,28,0.4)` : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>👤 {ins.userName}</span>
                      {dmg && <span style={{ fontSize: 14 }} title={ack ? 'Huomioitu' : 'Vaurioita – ei huomioitu'}>{ack ? '✅' : '⚠️'}</span>}
                    </div>
                    <div style={{ color: C.muted, fontSize: 12, marginTop: 1 }}>🚛 <b style={{ fontFamily: 'monospace' }}>{ins.truckReg}</b></div>
                    <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>📅 {fmtTs(ins.createdAt)}</div>
                    {ins.type !== 'departure' && <div style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>{T.photoCount(ins.photos?.length || 0, ins.damagePhotos?.length || 0)}</div>}
                    {ins.type === 'departure' && <div style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>Ajoonlähtötarkastus</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <Badge color={ins.completedAt ? C.success : C.orange} bg={ins.completedAt ? 'rgba(46,158,107,0.2)' : 'rgba(196,28,28,0.15)'}>
                      {ins.completedAt ? `✓ ${T.ready}` : `⏳ ${T.pending}`}
                    </Badge>
                    {dmg && (
                      <button onClick={e => toggleAck(e, ins)} style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8,
                        border: `1.5px solid ${ack ? 'rgba(46,158,107,0.5)' : 'rgba(196,28,28,0.4)'}`,
                        background: ack ? 'rgba(46,158,107,0.12)' : 'rgba(196,28,28,0.08)',
                        color: ack ? C.success : C.danger, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        <span style={{ width: 14, height: 14, borderRadius: 3, border: `2px solid currentColor`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>{ack ? '✓' : ''}</span>
                        Huomioitu
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Trailer list root
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader title={T.reports} onBack={() => navigate('adminHome', { userId, role })} onHome={() => navigate('adminHome', { userId, role })} device={device} />
      <div style={{ padding: device?.isPhone ? '12px' : '16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: device?.isPhone ? '1fr' : 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Tarkastuksia', val: allIns.length,  color: C.steel },
            { label: 'Perävaunuja',  val: allRegs.length, color: C.orange },
            { label: 'Kuljettajia',  val: new Set(allIns.map(i => i.userId)).size, color: C.success },
          ].map(s => (
            <Card key={s.label} style={{ textAlign: 'center', padding: '12px 8px', marginBottom: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{loading ? '...' : s.val}</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        <div style={{ position: 'relative', marginBottom: 14 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(fmtReg(e.target.value))} placeholder={T.searchPlaceholder}
            style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: 11, border: `1.5px solid ${C.border}`, fontSize: 15, color: C.text, background: C.surface, outline: 'none', fontFamily: 'monospace', letterSpacing: '0.1em' }} />
        </div>

        <SectionLabel>{T.trailersLabel}</SectionLabel>
        {loading && <div style={{ textAlign: 'center', padding: 20, color: C.muted }}>Ladataan...</div>}
        {!loading && filtered.length === 0 && <div style={{ textAlign: 'center', padding: '30px 0', color: C.muted }}>{T.noResults}</div>}
        {filtered.map(reg => {
          const ins      = allIns.filter(i => i.trailerReg === reg);
          const latest   = ins[0];
          const unackDmg = ins.filter(i => hasDamage(i) && !i.damageAcknowledged).length;
          return (
            <Card key={reg} onClick={() => setSelReg(reg)} style={{ cursor: 'pointer', border: unackDmg > 0 ? `1.5px solid rgba(196,28,28,0.35)` : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 18, color: C.text }}>{reg}</span>
                    {unackDmg > 0 && <span style={{ background: 'rgba(196,28,28,0.15)', color: C.danger, fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 18 }}>⚠️ {unackDmg}</span>}
                  </div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                    {T.inspCount(ins.length)} · {fmtTs(latest?.createdAt)}
                  </div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{latest?.userName}</div>
                </div>
                <div style={{ color: C.border, fontSize: 22 }}>›</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Admin Users ────────────────────────────────────────────────────────────────
export function AdminUsersScreen({ navigate, params, device }) {
  const { userId, role } = params;
  const [users,    setUsers]    = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newName,  setNewName]  = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole,  setNewRole]  = useState('driver');
  const [created,  setCreated]  = useState(null);
  const [err,      setErr]      = useState('');
  const [busy,     setBusy]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const refresh = () => { getVisibleUsers(role).then(u => { setUsers(u); setLoading(false); }); };
  useEffect(() => { refresh(); }, []);

  const create = async () => {
    if (!newName.trim())  { setErr('Nimi on pakollinen.');         return; }
    if (!newPhone.trim()) { setErr('Puhelinnumero on pakollinen.'); return; }
    if (!newEmail.trim() || !newEmail.includes('@')) { setErr('Sähköpostiosoite on pakollinen.'); return; }
    setBusy(true); setErr('');
    try {
      const email = newEmail.trim().toLowerCase();
      const { user: fbUser, temporaryPassword } = await registerDriver(newName, newPhone, email, newRole);
      setCreated({ name: newName, phone: newPhone, email, role: newRole, uid: fbUser.uid, password: temporaryPassword });
      setNewName(''); setNewPhone(''); setNewEmail(''); setNewRole('driver');
      refresh();
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') setErr('Sähköpostiosoite on jo käytössä.');
      else setErr('Luonti epäonnistui: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (uid, name) => {
    if (!window.confirm(T.confirmRemove(name))) return;
    await deactivateUser(uid);
    refresh();
  };

  const changeRole = async (uid, nextRole) => {
    setBusy(true); setErr('');
    try {
      await updateUserRole(uid, nextRole);
      const nextSelected = selectedUser ? { ...selectedUser, role: nextRole } : null;
      setSelectedUser(nextSelected);
      refresh();
    } catch (e) {
      setErr('Roolin muuttaminen epäonnistui: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (target) => {
    if (!window.confirm(`Resetoi käyttäjän ${target.name} salasana?`)) return;
    setBusy(true); setErr('');
    try {
      const password = await resetUserPassword(target.id, target.name);
      setCreated({ name: target.name, phone: target.phone, email: target.email || target.personalEmail, role: target.role, uid: target.id, password, reset: true });
      setShowForm(true);
      setSelectedUser(null);
      refresh();
    } catch (e) {
      setErr('Salasanan resetointi epäonnistui: ' + (e.message || e));
    } finally {
      setBusy(false);
    }
  };

  const roleLabel = (role) => role === 'admin' ? 'Pääkäyttäjä' : role === 'moderator' ? 'Moderaattori' : 'Kuljettaja';
  const roleIcon  = (role) => role === 'admin' ? 'A' : role === 'moderator' ? 'M' : 'K';
  const roleOptions = [
    { value: 'driver', label: 'Kuljettaja', color: C.steel },
    { value: 'moderator', label: 'Moderaattori', color: C.success },
    { value: 'admin', label: 'Pääkäyttäjä', color: C.orange },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader title={T.drivers} onBack={() => navigate('adminHome', { userId, role })} onHome={() => navigate('adminHome', { userId, role })} device={device} />
      <div style={{ padding: device?.isPhone ? '16px 12px' : '18px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 900, color: C.text }}>{T.userMgmt}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{users.length} {T.users}</div>
          </div>
          <Btn onClick={() => { setShowForm(true); setCreated(null); setErr(''); }} variant="orange" sm>{T.newDriver}</Btn>
        </div>

        {showForm && (
          <Card style={{ border: `2px solid ${C.orange}44`, marginBottom: 16 }}>
            {!created ? (
              <>
                <div style={{ fontWeight: 800, color: C.text, fontSize: 15, marginBottom: 14 }}>{T.createDriver}</div>
                <Field label={T.nameLabel}  value={newName}  onChange={setNewName}  placeholder={T.namePlaceholder} />
                <Field label={T.phoneLabel} value={newPhone} onChange={setNewPhone} placeholder={T.phonePlaceholder} />
                <Field label="Sähköpostiosoite" value={newEmail} onChange={setNewEmail} placeholder="nimi@yritys.fi" />

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>ROOLI</label>
                  <div style={{ display: 'grid', gridTemplateColumns: device?.isPhone ? '1fr' : 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { value: 'driver', label: 'Kuljettaja', icon: '🚛', color: C.steel },
                      { value: 'moderator', label: 'Moderaattori', icon: 'M', color: C.success },
                      { value: 'admin',  label: 'P\u00e4\u00e4k\u00e4ytt\u00e4j\u00e4', icon: '🔑', color: C.orange },
                    ].map(r => (
                      <div key={r.value} onClick={() => setNewRole(r.value)}
                        style={{
                          flex: 1, padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                          border: `2px solid ${newRole === r.value ? r.color : C.border}`,
                          background: newRole === r.value ? `${r.color}12` : C.surface,
                          display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s',
                        }}>
                        <div style={{ fontSize: 22 }}>{r.icon}</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: newRole === r.value ? r.color : C.text }}>{r.label}</div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>
                            {r.value === 'admin' ? 'Kaikki oikeudet' : r.value === 'moderator' ? 'Hallintaoikeudet' : 'Tarkastukset'}
                          </div>
                        </div>
                        {newRole === r.value && (
                          <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontSize: 10 }}>✓</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {(newRole === 'admin' || newRole === 'moderator') && (
                  <div style={{ background: `${C.orange}12`, border: `1px solid ${C.orange}44`, borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: C.orange, fontWeight: 700 }}>
                      ⚠️ {newRole === 'admin' ? 'Admin-tunnus antaa pääkäyttäjän oikeudet' : 'Moderaattorilla on samat toiminto-oikeudet kuin adminilla'}
                    </div>
                  </div>
                )}

                {err && <div style={{ background: 'rgba(217,79,79,0.1)', borderRadius: 9, padding: '9px 11px', color: C.danger, fontSize: 13, marginBottom: 11 }}>{err}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn onClick={() => { setShowForm(false); setErr(''); }} variant="ghost" sm>{T.cancel}</Btn>
                  <Btn onClick={create} variant="orange" sm disabled={busy}>{busy ? '...' : T.create}</Btn>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 800, color: C.text, fontSize: 15, marginBottom: 12 }}>✅ {T.created}</div>
                <div style={{ background: 'rgba(46,158,107,0.15)', borderRadius: 11, padding: '13px 15px', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: C.text, marginBottom: 3 }}><b>{T.createdName}:</b> {created.name}</div>
                  <div style={{ fontSize: 13, color: C.text, marginBottom: 3 }}><b>{T.createdPhone}:</b> {created.phone}</div>
                  <div style={{ fontSize: 13, color: C.text, marginBottom: 3 }}><b>Sähköposti:</b> {created.email}</div>
                  <div style={{ fontSize: 13, color: C.text, marginBottom: 3 }}><b>Rooli:</b> {roleIcon(created.role)} {roleLabel(created.role)}</div>
                  <div style={{ fontSize: 13, color: C.text }}><b>{created.reset ? 'Uusi salasana' : T.createdPin}:</b> {created.password}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{T.createdNote}</div>
                </div>
                <Btn onClick={() => { setShowForm(false); setCreated(null); }} sm>{T.close}</Btn>
              </>
            )}
          </Card>
        )}

        <SectionLabel>{T.driversList}</SectionLabel>
        {loading && <div style={{ textAlign: 'center', padding: 20, color: C.muted }}>Ladataan...</div>}

        {/* User detail modal */}
        {selectedUser && (
          <div onClick={() => setSelectedUser(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 900, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: device?.isPhone ? '0' : '0 0 20px 0' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: device?.isPhone ? '20px 20px 0 0' : '20px 20px 16px 16px', width: '100%', maxWidth: 520, maxHeight: device?.isPhone ? '88dvh' : '80vh', overflow: 'auto', paddingBottom: 'env(safe-area-inset-bottom)' }}>
              {/* Header */}
              <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, padding: '18px 20px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: selectedUser.role === 'admin' ? 'rgba(252,165,165,0.2)' : selectedUser.role === 'moderator' ? 'rgba(46,158,107,0.22)' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {roleIcon(selectedUser.role)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: 17 }}>{selectedUser.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>{roleIcon(selectedUser.role)} {roleLabel(selectedUser.role)}</div>
                </div>
                <button onClick={() => setSelectedUser(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 18, width: 34, height: 34, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
              </div>

              {/* Details */}
              <div style={{ padding: '18px 20px' }}>
                {[
                  { icon: '📞', label: 'Puhelinnumero',    val: selectedUser.phone         || '—' },
                  { icon: '📧', label: 'Sähköpostiosoite', val: selectedUser.personalEmail  || '—' },
                  { icon: '🏠', label: 'Kotiosoite',       val: selectedUser.address        || '—' },
                  { icon: '🎂', label: 'Syntymaaika',      val: selectedUser.birthDate      || '—' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 20, width: 28, flexShrink: 0, marginTop: 1 }}>{row.icon}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{row.label}</div>
                      <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{row.val}</div>
                    </div>
                  </div>
                ))}

                {/* Status */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <span style={{ background: selectedUser.active ? 'rgba(46,158,107,0.18)' : 'rgba(196,28,28,0.18)', color: selectedUser.active ? C.success : C.danger, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 18 }}>
                    {selectedUser.active ? `🟢 ${T.active}` : `🔴 ${T.deactivated}`}
                  </span>
                  <span style={{ background: selectedUser.profileComplete ? 'rgba(46,158,107,0.18)' : 'rgba(196,28,28,0.12)', color: selectedUser.profileComplete ? C.success : C.orange, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 18 }}>
                    {selectedUser.profileComplete ? '✓ Profiili valmis' : '⚠ Profiili kesken'}
                  </span>
                </div>

                {err && <div style={{ background: 'rgba(217,79,79,0.1)', borderRadius: 9, padding: '9px 11px', color: C.danger, fontSize: 13, marginBottom: 12 }}>{err}</div>}

                {(role === 'admin' || role === 'moderator') && selectedUser.id !== userId && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Rooli</div>
                    <div style={{ display: 'grid', gridTemplateColumns: device?.isPhone ? '1fr' : 'repeat(3, 1fr)', gap: 8 }}>
                      {roleOptions.map(r => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => selectedUser.role !== r.value && changeRole(selectedUser.id, r.value)}
                          disabled={busy || selectedUser.role === r.value}
                          style={{
                            border: `2px solid ${selectedUser.role === r.value ? r.color : C.border}`,
                            background: selectedUser.role === r.value ? `${r.color}14` : C.surface,
                            color: selectedUser.role === r.value ? r.color : C.text,
                            borderRadius: 11,
                            padding: '10px 8px',
                            fontWeight: 800,
                            fontSize: 12,
                            cursor: busy || selectedUser.role === r.value ? 'default' : 'pointer',
                          }}
                        >
                          {roleIcon(r.value)} {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedUser.id !== userId && selectedUser.active && (role === 'admin' || (role === 'moderator' && selectedUser.role === 'driver')) && (
                  <Btn onClick={() => resetPassword(selectedUser)} variant="ghost" full sm disabled={busy}>Resetoi salasana</Btn>
                )}
                {selectedUser.id !== userId && selectedUser.active && (
                  <Btn onClick={() => { deactivate(selectedUser.id, selectedUser.name); setSelectedUser(null); }} variant="danger" full sm>{T.remove}</Btn>
                )}
              </div>
            </div>
          </div>
        )}

        {users.map(u => (
          <Card key={u.id} onClick={() => setSelectedUser(u)} style={{ opacity: u.active ? 1 : 0.45, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: u.role === 'admin' ? `${C.orange}14` : u.role === 'moderator' ? `${C.success}14` : `${C.steel}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {roleIcon(u.role)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>{u.name}</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>📞 {u.phone || '—'}</div>
                <div style={{ color: C.muted, fontSize: 11 }}>
                  {roleIcon(u.role)} {roleLabel(u.role)} · {u.active ? `🟢 ${T.active}` : `🔴 ${T.deactivated}`}
                  {!u.profileComplete ? ' · ⚠ Profiili kesken' : ''}
                </div>
              </div>
              <div style={{ color: C.border, fontSize: 20 }}>›</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


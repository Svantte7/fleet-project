// src/screens/AdminScreens.jsx
import { useState, useEffect } from 'react';
import { SIDES } from '../data/constants.js';
import {
  getAllInspections, getByTrailer, getAllDrivers, getAllUsers,
  markAllSeen, getNewCount,
  deactivateUser,
} from '../firebase/firestore.js';
import { registerDriver } from '../firebase/auth.js';
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
  drivers:       'Kuljettajat',
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
  createdPin:    'Väliaikainen PIN',
  createdNote:   'Käyttäjä vaihtaa PIN:n ensimmäisellä kirjautumiskerralla.',
  close:         'Sulje',
  active:        'Aktiivinen',
  deactivated:   'Deaktivoitu',
  pinChange:     'PIN vaihto vaaditaan',
  remove:        'Poista',
  confirmRemove: (name) => `Haluatko varmasti deaktivoida käyttäjän ${name}?`,
  searchPlaceholder: 'Hae rekisterillä...',
  inspCount:     (n) => `${n} tarkastus${n !== 1 ? 'ta' : ''}`,
  photoCount:    (n, d) => `${n} peruskuvaa${d > 0 ? ` · ${d} vauriokuvaa` : ''}`,
  damage_i:      (i) => `Vaurio ${i + 1}`,
  trailersLabel: 'PERÄVAUNUT',
  driversList:   'KULJETTAJAT',
};

// ── Admin Home ─────────────────────────────────────────────────────────────────
export function AdminHomeScreen({ navigate, params }) {
  const { userId } = params;
  const [newCount, setNewCount] = useState(0);
  const [totals,   setTotals]   = useState({ ins: 0, trailers: 0, drivers: 0 });
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getNewCount(), getAllInspections(), getAllDrivers()]).then(([nc, ins, drvs]) => {
      setNewCount(nc);
      setTotals({
        ins:      ins.length,
        trailers: [...new Set(ins.map(i => i.trailerReg))].length,
        drivers:  drvs.length,
      });
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader title={T.adminTitle} onRight={() => navigate('login')} rightLabel={T.logout} />
      <div style={{ padding: '18px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontSize: 21, fontWeight: 900, color: C.text, marginBottom: 3 }}>{T.adminGreet}</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>{T.adminSub}</div>

        {newCount > 0 && (
          <Card onClick={() => navigate('adminReports', { userId })}
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

        {[
          { icon: '📋', title: T.reports,    sub: loading ? T.loading : `${totals.ins} ${T.inspections}`,  badge: newCount || null, color: C.steel,   screen: 'adminReports' },
          { icon: '👥', title: T.drivers,    sub: loading ? T.loading : `${totals.drivers} ${T.users}`,    badge: null,             color: C.success, screen: 'adminUsers' },
        ].map(item => (
          <Card key={item.title} onClick={() => navigate(item.screen, { userId })} style={{ cursor: 'pointer' }}>
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
export function AdminReportsScreen({ navigate, params }) {
  const { userId } = params;
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
        <AppHeader title={selIns.trailerReg} subtitle="Tarkastus" onBack={() => setSelIns(null)} onHome={() => navigate('adminHome', { userId })} />
        <div style={{ padding: '16px', maxWidth: 600, margin: '0 auto' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, color: C.text, fontSize: 15 }}>👤 {selIns.userName}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>🚛 <b style={{ fontFamily: 'monospace' }}>{selIns.truckReg}</b></div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>📅 {fmtTs(selIns.createdAt)}</div>
              </div>
              <Badge color={selIns.completedAt ? C.success : C.orange} bg={selIns.completedAt ? '#E8F5EC' : '#FFF3E0'}>
                {selIns.completedAt ? `✓ ${T.ready}` : `⏳ ${T.pending}`}
              </Badge>
            </div>
          </Card>

          <SectionLabel>{T.basicPhotos}</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: 16 }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: 12 }}>
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
    return (
      <div style={{ minHeight: '100vh', background: C.bg }}>
        <AppHeader title={selReg} subtitle="Tarkastukset" onBack={() => setSelReg(null)} onHome={() => navigate('adminHome', { userId })} />
        <div style={{ padding: '16px', maxWidth: 600, margin: '0 auto' }}>
          {regIns.map(ins => (
            <Card key={ins.id} onClick={() => setSelIns(ins)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>👤 {ins.userName}</div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>🚛 <b style={{ fontFamily: 'monospace' }}>{ins.truckReg}</b></div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>📅 {fmtTs(ins.createdAt)}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{T.photoCount(ins.photos?.length || 0, ins.damagePhotos?.length || 0)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <Badge color={ins.completedAt ? C.success : C.orange} bg={ins.completedAt ? '#E8F5EC' : '#FFF3E0'}>
                    {ins.completedAt ? `✓ ${T.ready}` : `⏳ ${T.pending}`}
                  </Badge>
                  <div style={{ color: C.border, fontSize: 20 }}>›</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Trailer list root
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader title={T.reports} onBack={() => navigate('adminHome', { userId })} onHome={() => navigate('adminHome', { userId })} />
      <div style={{ padding: '16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Tarkastuksia', val: allIns.length,  color: C.steel },
            { label: 'Perävaunuja',  val: allRegs.length, color: C.orange },
            { label: 'Kuljettajia',  val: new Set(allIns.map(i => i.userId)).size, color: C.success },
          ].map(s => (
            <Card key={s.label} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', marginBottom: 0 }}>
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
          const ins    = allIns.filter(i => i.trailerReg === reg);
          const latest = ins[0];
          return (
            <Card key={reg} onClick={() => setSelReg(reg)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 18, color: C.text }}>{reg}</div>
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
export function AdminUsersScreen({ navigate, params }) {
  const { userId } = params;
  const [users,    setUsers]    = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newName,  setNewName]  = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole,  setNewRole]  = useState('driver');
  const [created,  setCreated]  = useState(null);
  const [err,      setErr]      = useState('');
  const [busy,     setBusy]     = useState(false);
  const [loading,  setLoading]  = useState(true);

  const refresh = () => { getAllUsers().then(u => { setUsers(u); setLoading(false); }); };
  useEffect(() => { refresh(); }, []);

  const create = async () => {
    if (!newName.trim())  { setErr('Nimi on pakollinen.');         return; }
    if (!newPhone.trim()) { setErr('Puhelinnumero on pakollinen.'); return; }
    setBusy(true); setErr('');
    try {
      const fbUser = await registerDriver(newName, newPhone, newRole);
      setCreated({ name: newName, phone: newPhone, role: newRole, uid: fbUser.uid });
      setNewName(''); setNewPhone(''); setNewRole('driver');
      refresh();
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') setErr('Samanniminen kayttaja on jo olemassa.');
      else setErr('Luonti epaonnistui: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (uid, name) => {
    if (!window.confirm(T.confirmRemove(name))) return;
    await deactivateUser(uid);
    refresh();
  };

  const roleLabel = (role) => role === 'admin' ? 'Paakayttaja' : 'Kuljettaja';
  const roleIcon  = (role) => role === 'admin' ? '🔑' : '🚛';

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <AppHeader title={T.drivers} onBack={() => navigate('adminHome', { userId })} onHome={() => navigate('adminHome', { userId })} />
      <div style={{ padding: '18px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
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

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>ROOLI</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { value: 'driver', label: 'Kuljettaja', icon: '🚛', color: C.steel },
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
                            {r.value === 'admin' ? 'Kaikki oikeudet' : 'Tarkastukset'}
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

                {newRole === 'admin' && (
                  <div style={{ background: `${C.orange}12`, border: `1px solid ${C.orange}44`, borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: C.orange, fontWeight: 700 }}>
                      ⚠️ Admin-tunnus antaa kaiken paakayttajan oikeuden
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
                <div style={{ background: '#E8F5EC', borderRadius: 11, padding: '13px 15px', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: C.text, marginBottom: 3 }}><b>{T.createdName}:</b> {created.name}</div>
                  <div style={{ fontSize: 13, color: C.text, marginBottom: 3 }}><b>{T.createdPhone}:</b> {created.phone}</div>
                  <div style={{ fontSize: 13, color: C.text, marginBottom: 3 }}><b>Rooli:</b> {roleIcon(created.role)} {roleLabel(created.role)}</div>
                  <div style={{ fontSize: 13, color: C.text }}><b>{T.createdPin}:</b> 1234</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{T.createdNote}</div>
                </div>
                <Btn onClick={() => { setShowForm(false); setCreated(null); }} sm>{T.close}</Btn>
              </>
            )}
          </Card>
        )}

        <SectionLabel>{T.driversList}</SectionLabel>
        {loading && <div style={{ textAlign: 'center', padding: 20, color: C.muted }}>Ladataan...</div>}
        {users.map(u => (
          <Card key={u.id} style={{ opacity: u.active ? 1 : 0.45 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: u.role === 'admin' ? `${C.orange}14` : `${C.steel}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {u.role === 'admin' ? '🔑' : '👤'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>{u.name}</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>📞 {u.phone}</div>
                <div style={{ color: C.muted, fontSize: 11 }}>
                  {roleIcon(u.role)} {roleLabel(u.role)} · {u.active ? `🟢 ${T.active}` : `🔴 ${T.deactivated}`}
                  {u.mustChangePIN ? ` · ⚠️ ${T.pinChange}` : ''}
                </div>
              </div>
              {u.active && u.id !== userId && (
                <Btn onClick={() => deactivate(u.id, u.name)} variant="danger" sm>{T.remove}</Btn>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


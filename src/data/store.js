// src/data/store.js
// In-memory store with localStorage persistence.
// Replace with Firebase/Supabase calls when ready.

export const SIDES = [
  { key: 'front',  label: 'Keula',      icon: '⬆️' },
  { key: 'rear',   label: 'Perä',       icon: '⬇️' },
  { key: 'left',   label: 'Vasen sivu', icon: '⬅️' },
  { key: 'right',  label: 'Oikea sivu', icon: '➡️' },
];

// ── Seed / load from localStorage ─────────────────────────────────────────────
const SEED_USERS = [
  { id: '1', name: 'Mikko Virtanen',  phone: '0401234567', role: 'driver', pin: '1234', mustChangePIN: false, active: true },
  { id: '2', name: 'Sari Korhonen',   phone: '0407654321', role: 'driver', pin: '2222', mustChangePIN: false, active: true },
  { id: '3', name: 'Pääkäyttäjä',     phone: '0400000000', role: 'admin',  pin: '0000', mustChangePIN: false, active: true },
];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

let _users        = load('kh_users', SEED_USERS);
let _inspections  = load('kh_inspections', []);
const _remembered = load('kh_remembered', {});

function persist() {
  save('kh_users', _users);
  save('kh_inspections', _inspections);
  save('kh_remembered', _remembered);
}

// ── API ────────────────────────────────────────────────────────────────────────
export const DB = {
  // Users
  findUser: (name, pin) =>
    _users.find(u =>
      u.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      u.pin === pin.trim() && u.active
    ) || null,

  getUser: (id) => _users.find(u => u.id === id) || null,

  getAllDrivers: () => _users.filter(u => u.role === 'driver'),

  createUser: (name, phone) => {
    if (_users.find(u => u.name.toLowerCase() === name.trim().toLowerCase()))
      return { error: 'Samanniminen käyttäjä on jo olemassa.' };
    const nu = {
      id: String(Date.now()),
      name: name.trim(), phone: phone.trim(),
      role: 'driver', pin: '1234',
      mustChangePIN: true, active: true,
    };
    _users.push(nu);
    persist();
    console.log(`[SMS] PIN 1234 → ${phone}`);
    return { user: nu };
  },

  updatePIN: (userId, newPIN) => {
    const u = _users.find(x => x.id === userId);
    if (u) { u.pin = newPIN; u.mustChangePIN = false; persist(); }
  },

  resetPIN: (name) => {
    const u = _users.find(x => x.name.toLowerCase() === name.trim().toLowerCase());
    if (!u) return false;
    const p = String(Math.floor(1000 + Math.random() * 9000));
    u.pin = p; u.mustChangePIN = true;
    persist();
    console.log(`[SMS] Uusi PIN ${p} → ${u.phone}`);
    return true;
  },

  deactivateUser: (userId) => {
    const u = _users.find(x => x.id === userId);
    if (u) { u.active = false; persist(); }
  },

  // Inspections
  getInspections: () => [..._inspections].sort((a, b) => b.startedAt - a.startedAt),

  getMyInspections: (userId) =>
    _inspections.filter(i => i.userId === userId).sort((a, b) => b.startedAt - a.startedAt),

  getByTrailer: (reg) =>
    _inspections.filter(i => i.trailerReg === reg).sort((a, b) => b.startedAt - a.startedAt),

  getUniqueTrailers: () => [...new Set(_inspections.map(i => i.trailerReg))],

  newCount: () => _inspections.filter(i => !i.seenByAdmin).length,

  markAllSeen: () => {
    _inspections.forEach(i => { i.seenByAdmin = true; });
    persist();
  },

  saveInspection: (data) => {
    const ins = {
      id: 'INS' + Date.now(),
      ...data,
      startedAt: Date.now() - 300000,
      completedAt: Date.now(),
      seenByAdmin: false,
    };
    _inspections.unshift(ins);
    persist();
    return ins;
  },

  // Remembered truck per user
  getRememberedTruck: (userId) => _remembered[userId] || '',
  setRememberedTruck: (userId, reg) => { _remembered[userId] = reg; persist(); },
  clearRememberedTruck: (userId) => { delete _remembered[userId]; persist(); },
};

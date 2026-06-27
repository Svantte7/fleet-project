// src/data/store.js
// In-memory store – kaikki sovelluksen data on täällä.
// Tuotantoversiossa tämä korvataan Firebase/Firestorella.

export const SIDES = [
  { key: 'front',  label: 'Keula',      icon: '⬆️' },
  { key: 'rear',   label: 'Perä',       icon: '⬇️' },
  { key: 'left',   label: 'Vasen sivu', icon: '⬅️' },
  { key: 'right',  label: 'Oikea sivu', icon: '➡️' },
];

// ── Käyttäjät ──────────────────────────────────────────────────────────────────
let _users = [
  { id: '1', name: 'Mikko Virtanen',  phone: '0401234567', role: 'driver', pin: '1234', mustChangePIN: false, active: true },
  { id: '2', name: 'Sari Korhonen',   phone: '0407654321', role: 'driver', pin: '2222', mustChangePIN: false, active: true },
  { id: '3', name: 'Pääkäyttäjä',     phone: '0400000000', role: 'admin',  pin: '0000', mustChangePIN: false, active: true },
];

// ── Tarkastukset ───────────────────────────────────────────────────────────────
let _inspections = [
  {
    id: 'INS001',
    trailerReg: 'QWE123',
    truckReg: 'ABC456',
    userId: '2',
    userName: 'Sari Korhonen',
    startedAt: Date.now() - 86400000 * 2,
    completedAt: Date.now() - 86400000 * 2 + 1800000,
    seenByAdmin: true,
    photos: [
      { side: 'front', sideLabel: 'Keula',      uri: null, takenAt: Date.now() - 86400000 * 2 + 100000 },
      { side: 'rear',  sideLabel: 'Perä',        uri: null, takenAt: Date.now() - 86400000 * 2 + 200000 },
      { side: 'left',  sideLabel: 'Vasen sivu',  uri: null, takenAt: Date.now() - 86400000 * 2 + 300000 },
      { side: 'right', sideLabel: 'Oikea sivu',  uri: null, takenAt: Date.now() - 86400000 * 2 + 400000 },
    ],
    damagePhotos: [],
    damageDescription: 'Pieni naarmu oikeassa takavalossa.',
  },
];

let _nextId = 10;

// ── API ────────────────────────────────────────────────────────────────────────
export const DB = {
  // Users
  findUser: (name, pin) =>
    _users.find(u =>
      u.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      u.pin === pin.trim() &&
      u.active
    ) || null,

  getUser: (id) => _users.find(u => u.id === id) || null,

  getAllDrivers: () => _users.filter(u => u.role === 'driver'),

  createUser: (name, phone) => {
    if (_users.find(u => u.name.toLowerCase() === name.trim().toLowerCase())) {
      return { error: 'Samanniminen käyttäjä on jo olemassa.' };
    }
    const newUser = {
      id: String(++_nextId),
      name: name.trim(),
      phone: phone.trim(),
      role: 'driver',
      pin: '1234',
      mustChangePIN: true,
      active: true,
    };
    _users.push(newUser);
    console.log(`[SMS] PIN 1234 → ${phone}`);
    return { user: newUser };
  },

  updatePIN: (userId, newPIN) => {
    const u = _users.find(x => x.id === userId);
    if (u) { u.pin = newPIN; u.mustChangePIN = false; }
  },

  resetPIN: (name) => {
    const u = _users.find(x => x.name.toLowerCase() === name.trim().toLowerCase());
    if (!u) return false;
    const newPin = String(Math.floor(1000 + Math.random() * 9000));
    u.pin = newPin;
    u.mustChangePIN = true;
    console.log(`[SMS] Uusi PIN ${newPin} → ${u.phone}`);
    return true;
  },

  deactivateUser: (userId) => {
    const u = _users.find(x => x.id === userId);
    if (u) u.active = false;
  },

  // Inspections
  getInspections: () => [..._inspections].sort((a, b) => b.startedAt - a.startedAt),

  getMyInspections: (userId) =>
    _inspections.filter(i => i.userId === userId).sort((a, b) => b.startedAt - a.startedAt),

  getByTrailer: (reg) =>
    _inspections.filter(i => i.trailerReg === reg).sort((a, b) => b.startedAt - a.startedAt),

  getUniqueTrailers: () => [...new Set(_inspections.map(i => i.trailerReg))],

  newCount: () => _inspections.filter(i => !i.seenByAdmin).length,

  markAllSeen: () => _inspections.forEach(i => { i.seenByAdmin = true; }),

  saveInspection: (data) => {
    const ins = {
      id: 'INS' + (++_nextId),
      ...data,
      startedAt: Date.now() - 300000,
      completedAt: Date.now(),
      seenByAdmin: false,
    };
    _inspections.unshift(ins);
    return ins;
  },

  getRememberedTruck: (userId) => _remembered[userId] || '',
  setRememberedTruck: (userId, reg) => { _remembered[userId] = reg; },
  clearRememberedTruck: (userId) => { delete _remembered[userId]; },
};

const _remembered = {};

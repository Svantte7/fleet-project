// src/firebase/firestore.js
import {
  collection, doc,
  getDoc, getDocs, addDoc, setDoc, updateDoc,
  query, where, orderBy, serverTimestamp, onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config.js';

// ══════════════════════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════════════════════
export const createUserProfile = (uid, data) =>
  setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt:     serverTimestamp(),
    mustChangePIN: true,
    active:        true,
  });

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = (uid, data) =>
  updateDoc(doc(db, 'users', uid), data);

export const getAllDrivers = async () => {
  const q    = query(collection(db, 'users'), where('role', '==', 'driver'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllUsers = async () => {
  const q    = query(collection(db, 'users'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getVisibleUsers = async (viewerRole) => {
  const users = await getAllUsers();
  const activeUsers = users.filter(u => u.active !== false);
  return viewerRole === 'moderator'
    ? activeUsers.filter(u => u.role !== 'admin')
    : activeUsers;
};

export const deactivateUser = (uid) =>
  updateDoc(doc(db, 'users', uid), { active: false });

export const updateUserRole = (uid, role) =>
  updateDoc(doc(db, 'users', uid), { role });

// ══════════════════════════════════════════════════════════════════════════════
// INSPECTIONS
// ══════════════════════════════════════════════════════════════════════════════
export const saveInspection = async (data) => {
  const ref = await addDoc(collection(db, 'inspections'), {
    ...data,
    startedAt:   serverTimestamp(),
    completedAt: data.completedAt ? serverTimestamp() : null,
    seenByAdmin: false,
    createdAt:   serverTimestamp(),
  });
  return ref.id;
};

export const getAllInspections = async () => {
  const q    = query(collection(db, 'inspections'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getMyInspections = async (userId) => {
  const q    = query(collection(db, 'inspections'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getByTrailer = async (trailerReg) => {
  const q    = query(collection(db, 'inspections'), where('trailerReg', '==', trailerReg), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const markAllSeen = async () => {
  const q    = query(collection(db, 'inspections'), where('seenByAdmin', '==', false));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map(d => updateDoc(d.ref, { seenByAdmin: true })));
};

export const getNewCount = async () => {
  const q    = query(collection(db, 'inspections'), where('seenByAdmin', '==', false));
  const snap = await getDocs(q);
  return snap.size;
};

// Real-time listener for admin panel
export const subscribeInspections = (cb) =>
  onSnapshot(
    query(collection(db, 'inspections'), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );

// ── Remembered trucks (stored per user in their profile) ──────────────────────
export const getRememberedTruck = async (userId) => {
  const u = await getUserProfile(userId);
  return u?.rememberedTruck || '';
};

export const setRememberedTruck = (userId, reg) =>
  updateDoc(doc(db, 'users', userId), { rememberedTruck: reg });

export const clearRememberedTruck = (userId) =>
  updateDoc(doc(db, 'users', userId), { rememberedTruck: '' });

// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './config.js';
import { createUserProfile, getUserProfile } from './firestore.js';

// ── Kirjautuminen ──────────────────────────────────────────────────────────────
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// ── Rekisteröinti (admin luo kuljettajan) ─────────────────────────────────────
export const registerDriver = async (name, phone, adminPassword) => {
  // Luo Firebase Auth -käyttäjä sähköpostilla {nimi}@kalustohallinta.local
  const email    = nameToEmail(name);
  const tempPass = '1234'; // väliaikainen PIN → pakko vaihtaa
  const cred     = await createUserWithEmailAndPassword(auth, email, tempPass);
  await createUserProfile(cred.user.uid, {
    name, phone, role: 'driver',
    mustChangePIN: true, active: true, email,
  });
  return cred.user;
};

// Muunna nimi sähköpostimuotoon (yksinkertainen)
export const nameToEmail = (name) =>
  name.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '') + '@kalustohallinta.local';

// ── Salasanan vaihto (PIN = salasana) ─────────────────────────────────────────
export const changePIN = async (newPIN) => {
  if (!auth.currentUser) throw new Error('Ei kirjautunut käyttäjä');
  await updatePassword(auth.currentUser, newPIN);
};

// ── Kirjaudu ulos ─────────────────────────────────────────────────────────────
export const logout = () => signOut(auth);

// ── Auth state listener ───────────────────────────────────────────────────────
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ── Hae nykyinen käyttäjä ─────────────────────────────────────────────────────
export const getCurrentUser = () => auth.currentUser;

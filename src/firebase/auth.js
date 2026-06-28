// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './config.js';
import { createUserProfile } from './firestore.js';

export const nameToEmail = (name) =>
  name.trim().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '') + '@kalustohallinta.local';

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// role = 'driver' | 'admin'
export const registerDriver = async (name, phone, role = 'driver') => {
  const email = nameToEmail(name);
  const cred  = await createUserWithEmailAndPassword(auth, email, '1234');
  await createUserProfile(cred.user.uid, {
    name, phone, role,
    mustChangePIN: true, active: true, email,
  });
  return cred.user;
};

export const changePIN = async (newPIN) => {
  if (!auth.currentUser) throw new Error('Ei kirjautunutta kayttajaa');
  await updatePassword(auth.currentUser, newPIN);
};

export const logout = () => signOut(auth);

export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

export const getCurrentUser = () => auth.currentUser;

// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { deleteApp, initializeApp } from 'firebase/app';
import { httpsCallable } from 'firebase/functions';
import { auth, firebaseConfig, functions } from './config.js';
import { createUserProfile } from './firestore.js';

export const nameToEmail = (name) =>
  name.trim().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '') + '@specto-fleet.local';

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const normalizeLoginEmail = (value) => {
  const input = value.trim().toLowerCase();
  return input.includes('@') ? input : nameToEmail(input);
};

export const generateTemporaryPassword = (name) => {
  const cleanedName = name.trim().replace(/\s+/g, '');
  return `Spc${cleanedName}1`;
};

export const isValidPassword = (password) =>
  password.length >= 6 && /\d/.test(password);

// role = 'driver' | 'moderator' | 'admin'
export const registerDriver = async (name, phone, email, role = 'driver') => {
  const normalizedEmail = email.trim().toLowerCase();
  const temporaryPassword = generateTemporaryPassword(name);
  const secondaryApp = initializeApp(firebaseConfig, `user-create-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, normalizedEmail, temporaryPassword);
    await createUserProfile(cred.user.uid, {
      name, phone, role,
      mustChangePIN: true, active: true, email: normalizedEmail, personalEmail: normalizedEmail,
    });
    return { user: cred.user, temporaryPassword };
  } finally {
    await deleteApp(secondaryApp);
  }
};

export const changePIN = async (newPIN) => {
  if (!auth.currentUser) throw new Error('Ei kirjautunutta käyttäjää');
  await updatePassword(auth.currentUser, newPIN);
};

export const resetUserPassword = async (uid, name) => {
  const resetPassword = generateTemporaryPassword(name);
  const fn = httpsCallable(functions, 'resetUserPassword');
  await fn({ uid, resetPassword });
  return resetPassword;
};

export const logout = () => signOut(auth);

export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

export const getCurrentUser = () => auth.currentUser;

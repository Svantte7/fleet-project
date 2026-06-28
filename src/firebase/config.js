// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';
import { getStorage }    from 'firebase/storage';
import { getFunctions }  from 'firebase/functions';

export const firebaseConfig = {
  apiKey:            "AIzaSyA3DskxpxA3v7fdKVdBrTrigYglZYBvdv0",
  authDomain:        "specto-fleet.firebaseapp.com",
  projectId:         "specto-fleet",
  storageBucket:     "specto-fleet.firebasestorage.app",
  messagingSenderId: "587664879760",
  appId:             "1:587664879760:web:d672e44048fb415a572815",
};

const app = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app, "specto-fleet");
export const storage = getStorage(app);
export const functions = getFunctions(app, "europe-west1");
export default app;

// Fetch user profile — try REST first, fall back to null on any error
export const fetchUserProfileREST = async (uid, idToken) => {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/specto-fleet/databases/specto-fleet/documents/users/${uid}`;
    const res  = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.fields) return null;
    return {
      id:              uid,
      name:            json.fields.name?.stringValue            || "",
      role:            json.fields.role?.stringValue            || "driver",
      active:          json.fields.active?.booleanValue         ?? true,
      mustChangePIN:   json.fields.mustChangePIN?.booleanValue  ?? false,
      profileComplete: json.fields.profileComplete?.booleanValue ?? false,
      phone:           json.fields.phone?.stringValue           || "",
      personalEmail:   json.fields.personalEmail?.stringValue   || "",
      address:         json.fields.address?.stringValue         || "",
      birthDate:       json.fields.birthDate?.stringValue       || "",
    };
  } catch {
    return null;
  }
};

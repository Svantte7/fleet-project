// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';
import { getStorage }    from 'firebase/storage';
import { getFunctions }  from 'firebase/functions';

export const firebaseConfig = {
  apiKey:            "AIzaSyABd2vFIMDhiqea61ZdQQSgozmNRmQu_Kg",
  authDomain:        "kalustohallinta.firebaseapp.com",
  projectId:         "kalustohallinta",
  storageBucket:     "kalustohallinta.firebasestorage.app",
  messagingSenderId: "611759904739",
  appId:             "1:611759904739:web:1754bac9bf5629f3ceb2d6",
  measurementId:     "G-0F26NMF3M2",
};

const app = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app, "kalustohallinta");
export const storage = getStorage(app);
export const functions = getFunctions(app, "europe-west1");
export default app;

// Fetch user profile via REST API (avoids Firestore SDK offline bug on first load)
export const fetchUserProfileREST = async (uid, idToken) => {
  const url = `https://firestore.googleapis.com/v1/projects/kalustohallinta/databases/kalustohallinta/documents/users/${uid}`;
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
};

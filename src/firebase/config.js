import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            "AIzaSyABd2vFIMDhiqea61ZdQQSgozmNRmQu_Kg",
  authDomain:        "kalustohallinta.firebaseapp.com",
  projectId:         "kalustohallinta",
  storageBucket:     "kalustohallinta.firebasestorage.app",
  messagingSenderId: "611759904739",
  appId:             "1:611759904739:web:1754bac9bf5629f3ceb2d6",
  measurementId:     "G-0F26NMF3M2",
};

const app        = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app, "kalustohallinta");
export const storage = getStorage(app);

export const fetchUserProfileREST = async (uid, idToken) => {
  const url = `https://firestore.googleapis.com/v1/projects/kalustohallinta/databases/kalustohallinta/documents/users/${uid}`;
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.fields) return null;
  return {
    id:            uid,
    name:          json.fields.name?.stringValue || "",
    role:          json.fields.role?.stringValue || "driver",
    active:        json.fields.active?.booleanValue ?? true,
    mustChangePIN: json.fields.mustChangePIN?.booleanValue ?? false,
    phone:         json.fields.phone?.stringValue || "",
  };
};

export default app;

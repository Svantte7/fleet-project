// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';
import { getStorage }    from 'firebase/storage';

const firebaseConfig = {
  apiKey:            "AIzaSyABd2vFIMDhiqea61ZdQQSgozmNRmQu_Kg",
  authDomain:        "kalustohallinta.firebaseapp.com",
  projectId:         "kalustohallinta",
  storageBucket:     "kalustohallinta.firebasestorage.app",
  messagingSenderId: "611759904739",
  appId:             "1:611759904739:web:1754bac9bf5629f3ceb2d6",
  measurementId:     "G-0F26NMF3M2",
};

const app     = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;

// src/firebase/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, logout as fbLogout } from './auth.js';
import { getUserProfile, updateUserProfile }  from './firestore.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = lataa
  const [userProfile,  setUserProfile]  = useState(null);

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile = await getUserProfile(fbUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });
    return unsub;
  }, []);

  const refreshProfile = async () => {
    if (!firebaseUser) return;
    const p = await getUserProfile(firebaseUser.uid);
    setUserProfile(p);
  };

  const updateProfile = async (data) => {
    if (!firebaseUser) return;
    await updateUserProfile(firebaseUser.uid, data);
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const logout = async () => {
    await fbLogout();
    setFirebaseUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      user: userProfile,
      loading: firebaseUser === undefined,
      isAdmin:  userProfile?.role === 'admin' || userProfile?.role === 'moderator',
      isDriver: userProfile?.role === 'driver',
      refreshProfile,
      updateProfile,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

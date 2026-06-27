// src/App.jsx
import { useState, useCallback, useEffect } from 'react';
import { onAuthChange } from './firebase/auth.js';
import { getUserProfile } from './firebase/firestore.js';
import LoginScreen from './screens/LoginScreen.jsx';
import { ForgotPinScreen, ChangePinScreen } from './screens/ForgotPinScreen.jsx';
import { DriverHomeScreen, RegInputScreen, SuccessScreen } from './screens/DriverScreens.jsx';
import PhotoScreen from './screens/PhotoScreen.jsx';
import { AdminHomeScreen, AdminReportsScreen, AdminUsersScreen } from './screens/AdminScreens.jsx';
import { C } from './utils/theme.js';

const SCREENS = {
  login:        LoginScreen,
  forgotPin:    ForgotPinScreen,
  changePin:    ChangePinScreen,
  driverHome:   DriverHomeScreen,
  regInput:     RegInputScreen,
  photo:        PhotoScreen,
  success:      SuccessScreen,
  adminHome:    AdminHomeScreen,
  adminReports: AdminReportsScreen,
  adminUsers:   AdminUsersScreen,
};

export default function App() {
  const [screen,  setScreen]  = useState('login');
  const [params,  setParams]  = useState({});
  const [booting, setBooting] = useState(true);

  // Restore session on refresh
  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      if (fbUser && screen === 'login') {
        const profile = await getUserProfile(fbUser.uid);
        if (profile?.active) {
          setParams({ userId: fbUser.uid, userName: profile.name });
          setScreen(profile.role === 'admin' ? 'adminHome' : 'driverHome');
        }
      }
      setBooting(false);
    });
    return unsub;
  }, []);

  const navigate = useCallback((to, p = {}) => {
    setScreen(to);
    setParams(p);
    window.scrollTo(0, 0);
  }, []);

  if (booting) {
    return (
      <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🚛</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Ladataan...</div>
      </div>
    );
  }

  const Screen = SCREENS[screen] ?? LoginScreen;
  return (
    <div style={{ minHeight: '100vh' }}>
      <Screen navigate={navigate} params={params} />
    </div>
  );
}

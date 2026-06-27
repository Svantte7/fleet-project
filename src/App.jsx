// src/App.jsx
import { useState, useCallback } from 'react';
import LoginScreen from './screens/LoginScreen.jsx';
import { ForgotPinScreen, ChangePinScreen } from './screens/ForgotPinScreen.jsx';
import { DriverHomeScreen, RegInputScreen, SuccessScreen } from './screens/DriverScreens.jsx';
import PhotoScreen from './screens/PhotoScreen.jsx';
import { AdminHomeScreen, AdminReportsScreen, AdminUsersScreen } from './screens/AdminScreens.jsx';

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
  const [screen, setScreen] = useState('login');
  const [params, setParams] = useState({});

  const navigate = useCallback((to, p = {}) => {
    setScreen(to);
    setParams(p);
    window.scrollTo(0, 0);
  }, []);

  const Screen = SCREENS[screen] ?? LoginScreen;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Screen navigate={navigate} params={params} />
    </div>
  );
}

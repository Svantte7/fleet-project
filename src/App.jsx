// src/App.jsx
import { useState, useCallback, useEffect } from "react";
import { onAuthChange } from "./firebase/auth.js";
import { fetchUserProfileREST } from "./firebase/config.js";
import LoginScreen from "./screens/LoginScreen.jsx";
import { ForgotPinScreen, ChangePinScreen } from "./screens/ForgotPinScreen.jsx";
import { DriverHomeScreen, RegInputScreen, SuccessScreen } from "./screens/DriverScreens.jsx";
import PhotoScreen from "./screens/PhotoScreen.jsx";
import ChecklistScreen from "./screens/ChecklistScreen.jsx";
import SetupScreen from "./screens/SetupScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import { AdminHomeScreen, AdminReportsScreen, AdminUsersScreen } from "./screens/AdminScreens.jsx";
import { C } from "./utils/theme.js";
import { useDevice } from "./utils/device.js";

const SCREENS = {
  login:        LoginScreen,
  forgotPin:    ForgotPinScreen,
  changePin:    ChangePinScreen,
  driverHome:   DriverHomeScreen,
  regInput:     RegInputScreen,
  photo:        PhotoScreen,
  checklist:    ChecklistScreen,
  setup:        SetupScreen,
  success:      SuccessScreen,
  profile:      ProfileScreen,
  adminHome:    AdminHomeScreen,
  adminReports: AdminReportsScreen,
  adminUsers:   AdminUsersScreen,
};

export default function App() {
  const [screen,  setScreen]  = useState("login");
  const [params,  setParams]  = useState({});
  const [booting, setBooting] = useState(true);
  const device = useDevice();

  useEffect(() => {
    const timeout = setTimeout(() => { setBooting(false); setScreen("login"); }, 8000);
    const unsub = onAuthChange(async (fbUser) => {
      clearTimeout(timeout);
      try {
        if (fbUser) {
          const token   = await fbUser.getIdToken();
          const profile = await fetchUserProfileREST(fbUser.uid, token);
          if (profile && profile.active) {
            const p = { userId: fbUser.uid, userName: profile.name, role: profile.role };
            if (profile.mustChangePIN && profile.role !== "admin") {
              setParams({ ...p, forced: true });
              setScreen("changePin");
            } else if (!profile.profileComplete) {
              setParams({ ...p, forced: true });
              setScreen("profile");
            } else if (profile.role === "admin" || profile.role === "moderator") {
              setParams(p);
              setScreen("adminHome");
            } else {
              setParams(p);
              setScreen("driverHome");
            }
          } else {
            setScreen("login");
          }
        } else {
          setScreen("login");
        }
      } catch (e) {
        console.error("Auth error:", e);
        setScreen("login");
      } finally {
        setBooting(false);
      }
    });
    return () => { unsub(); clearTimeout(timeout); };
  }, []);

  const navigate = useCallback((to, p = {}) => {
    setScreen(to);
    setParams(p);
    window.scrollTo(0, 0);
  }, []);

  if (booting) {
    return (
      <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Ladataan...</div>
      </div>
    );
  }

  const Screen = SCREENS[screen] ?? LoginScreen;
  return (
    <div
      data-device={device.isPhone ? "phone" : "desktop"}
      style={{
        minHeight: "100dvh",
        width: "100%",
        overflowX: "hidden",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <Screen navigate={navigate} params={params} device={device} />
    </div>
  );
}

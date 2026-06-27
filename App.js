// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer }         from '@react-navigation/native';
import { createNativeStackNavigator }  from '@react-navigation/native-stack';
import { SafeAreaProvider }            from 'react-native-safe-area-context';
import { StatusBar }                   from 'expo-status-bar';

import LoginScreen          from './src/screens/LoginScreen';
import ForgotPinScreen      from './src/screens/ForgotPinScreen';
import ChangePinScreen      from './src/screens/ChangePinScreen';
import DriverHomeScreen     from './src/screens/DriverHomeScreen';
import RegInputScreen       from './src/screens/RegInputScreen';
import PhotoScreen          from './src/screens/PhotoScreen';
import SuccessScreen        from './src/screens/SuccessScreen';
import AdminHomeScreen      from './src/screens/AdminHomeScreen';
import AdminReportsScreen   from './src/screens/AdminReportsScreen';
import AdminUsersScreen     from './src/screens/AdminUsersScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#F0F4F8' },
          }}
        >
          <Stack.Screen name="Login"          component={LoginScreen} />
          <Stack.Screen name="ForgotPin"      component={ForgotPinScreen} />
          <Stack.Screen name="ChangePin"      component={ChangePinScreen} />
          <Stack.Screen name="DriverHome"     component={DriverHomeScreen} />
          <Stack.Screen name="RegInput"       component={RegInputScreen} />
          <Stack.Screen name="Photo"          component={PhotoScreen} />
          <Stack.Screen name="Success"        component={SuccessScreen} />
          <Stack.Screen name="AdminHome"      component={AdminHomeScreen} />
          <Stack.Screen name="AdminReports"   component={AdminReportsScreen} />
          <Stack.Screen name="AdminUsers"     component={AdminUsersScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

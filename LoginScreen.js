// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DB } from '../data/store';
import { C } from '../utils/theme';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [pin,  setPin]  = useState('');
  const [err,  setErr]  = useState('');

  const login = () => {
    const u = DB.findUser(name, pin);
    if (!u) { setErr('Virheellinen nimi tai PIN-koodi.'); return; }
    setErr('');
    if (u.mustChangePIN) {
      navigation.replace('ChangePin', { userId: u.id, forced: true });
    } else if (u.role === 'admin') {
      navigation.replace('AdminHome', { userId: u.id });
    } else {
      navigation.replace('DriverHome', { userId: u.id });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoBox}>
          <View style={styles.logoIcon}>
            <Text style={{ fontSize: 40 }}>🚛</Text>
          </View>
          <Text style={styles.logoTitle}>KALUSTONHALLINTA</Text>
          <Text style={styles.logoSub}>Kaluston tarkastus & dokumentointi</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Kirjautuminen</Text>

          <Text style={styles.fieldLabel}>NIMI</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Etunimi Sukunimi"
            placeholderTextColor="rgba(255,255,255,0.35)"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>PIN-KOODI</Text>
          <TextInput
            value={pin}
            onChangeText={setPin}
            placeholder="••••"
            placeholderTextColor="rgba(255,255,255,0.35)"
            secureTextEntry
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={login}
            style={[styles.input, styles.inputPin]}
          />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPin')} style={styles.forgotWrap}>
            <Text style={styles.forgotTxt}>PIN unohtunut?</Text>
          </TouchableOpacity>

          {!!err && (
            <View style={styles.errBox}>
              <Text style={styles.errTxt}>{err}</Text>
            </View>
          )}

          <TouchableOpacity onPress={login} style={styles.loginBtn} activeOpacity={0.82}>
            <Text style={styles.loginBtnTxt}>🔓  Kirjaudu sisään</Text>
          </TouchableOpacity>

          <Text style={styles.demoTxt}>
            Demo: Mikko / 1234 · Sari / 2222 · Pääkäyttäjä / 0000
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.navy },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 22 },

  logoBox:   { alignItems: 'center', marginBottom: 36 },
  logoIcon:  { width: 82, height: 82, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 1.5, borderColor: 'rgba(232,123,53,0.4)' },
  logoTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  logoSub:   { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },

  card:      { width: '100%', maxWidth: 360, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 18 },

  fieldLabel:{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.09)', borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)', borderRadius: 11,
    paddingVertical: 12, paddingHorizontal: 14,
    fontSize: 15, color: '#fff', fontWeight: '500', marginBottom: 14,
  },
  inputPin:  { fontSize: 24, letterSpacing: 8, textAlign: 'center', fontWeight: '700' },

  forgotWrap:{ alignItems: 'flex-end', marginTop: -6, marginBottom: 16 },
  forgotTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecorationLine: 'underline' },

  errBox:    { backgroundColor: 'rgba(217,79,79,0.2)', borderRadius: 9, padding: 10, marginBottom: 12 },
  errTxt:    { color: '#ff9a9a', fontSize: 13, textAlign: 'center' },

  loginBtn:  { backgroundColor: C.orange, borderRadius: 13, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  loginBtnTxt:{ color: '#fff', fontSize: 15, fontWeight: '800' },

  demoTxt:   { color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center' },
});

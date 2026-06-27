// src/screens/ChangePinScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DB } from '../data/store';
import { C } from '../utils/theme';

export default function ChangePinScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { userId, forced } = route.params;
  const user = DB.getUser(userId);

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [err, setErr] = useState('');

  const save = () => {
    if (p1.length < 4) { setErr('PIN täytyy olla vähintään 4 merkkiä.'); return; }
    if (p1 !== p2)     { setErr('PIN-koodit eivät täsmää.'); return; }
    DB.updatePIN(userId, p1);
    const updated = DB.getUser(userId);
    if (updated.role === 'admin') {
      navigation.replace('AdminHome', { userId });
    } else {
      navigation.replace('DriverHome', { userId });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {!forced && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backTxt}>‹</Text>
            </TouchableOpacity>
          )}

          <Text style={{ fontSize: 44, textAlign: 'center', marginBottom: 14 }}>🔐</Text>
          <Text style={styles.title}>{forced ? 'Aseta uusi PIN' : 'Vaihda PIN-koodi'}</Text>
          {forced && (
            <Text style={styles.desc}>
              Turvallisuussyistä sinun täytyy vaihtaa PIN-koodisi ennen jatkamista.
            </Text>
          )}

          <Text style={styles.lbl}>UUSI PIN</Text>
          <TextInput
            value={p1} onChangeText={setP1} secureTextEntry
            keyboardType="number-pad" placeholder="••••"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={[styles.input, styles.inputPin]}
          />

          <Text style={styles.lbl}>VAHVISTA PIN</Text>
          <TextInput
            value={p2} onChangeText={setP2} secureTextEntry
            keyboardType="number-pad" placeholder="••••"
            placeholderTextColor="rgba(255,255,255,0.35)"
            onSubmitEditing={save}
            style={[styles.input, styles.inputPin]}
          />

          {!!err && <View style={styles.err}><Text style={styles.errTxt}>{err}</Text></View>}

          <TouchableOpacity onPress={save} style={styles.btn}>
            <Text style={styles.btnTxt}>✅  Tallenna uusi PIN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.navy },
  scroll:  { flexGrow: 1, alignItems: 'center', paddingHorizontal: 22 },
  card:    { width: '100%', maxWidth: 360, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  backBtn: { marginBottom: 12 },
  backTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 28, fontWeight: '300' },
  title:   { color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  desc:    { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  lbl:     { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  input:   { backgroundColor: 'rgba(255,255,255,0.09)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 11, paddingVertical: 12, paddingHorizontal: 14, fontSize: 15, color: '#fff', marginBottom: 14 },
  inputPin:{ fontSize: 24, letterSpacing: 8, textAlign: 'center', fontWeight: '700' },
  err:     { backgroundColor: 'rgba(217,79,79,0.2)', borderRadius: 9, padding: 10, marginBottom: 12 },
  errTxt:  { color: '#ff9a9a', fontSize: 13 },
  btn:     { backgroundColor: C.orange, borderRadius: 13, paddingVertical: 14, alignItems: 'center' },
  btnTxt:  { color: '#fff', fontSize: 15, fontWeight: '800' },
});

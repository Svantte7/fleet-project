// src/screens/ForgotPinScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DB } from '../data/store';
import { C } from '../utils/theme';

export default function ForgotPinScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [sent, setSent]  = useState(false);
  const [err,  setErr]   = useState('');

  const send = () => {
    const ok = DB.resetPIN(name);
    if (!ok) { setErr('Käyttäjää ei löydy.'); return; }
    setErr(''); setSent(true);
  };

  return (
    <KeyboardAvoidingView style={[styles.root]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backTxt}>‹</Text>
          </TouchableOpacity>

          {!sent ? (
            <>
              <Text style={styles.title}>PIN unohtunut</Text>
              <Text style={styles.desc}>
                Syötä nimesi — lähetämme uuden PIN-koodin rekisteröityyn puhelinnumeroosi.
              </Text>

              <Text style={styles.lbl}>NIMI</Text>
              <TextInput
                value={name} onChangeText={setName}
                placeholder="Etunimi Sukunimi"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="words" autoCorrect={false}
                onSubmitEditing={send}
                style={styles.input}
              />

              {!!err && <View style={styles.err}><Text style={styles.errTxt}>{err}</Text></View>}

              <TouchableOpacity onPress={send} style={styles.btn}>
                <Text style={styles.btnTxt}>📱  Lähetä uusi PIN</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successBox}>
              <Text style={{ fontSize: 50, textAlign: 'center', marginBottom: 16 }}>✅</Text>
              <Text style={styles.successTitle}>PIN lähetetty!</Text>
              <Text style={styles.successDesc}>
                Uusi PIN on lähetetty puhelinnumeroosi.{'\n'}
                Kirjaudu sisään uudella PIN:llä — sovellus pyytää vaihtamaan sen.
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn2}>
                <Text style={styles.backBtn2Txt}>← Takaisin kirjautumiseen</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.navy },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 22 },
  card: {
    width: '100%', maxWidth: 360,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: { marginBottom: 16 },
  backTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 28, fontWeight: '300' },
  title:   { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 8 },
  desc:    { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 20, marginBottom: 22 },
  lbl:     { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  input:   { backgroundColor: 'rgba(255,255,255,0.09)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 11, paddingVertical: 12, paddingHorizontal: 14, fontSize: 15, color: '#fff', marginBottom: 18 },
  err:     { backgroundColor: 'rgba(217,79,79,0.2)', borderRadius: 9, padding: 10, marginBottom: 12 },
  errTxt:  { color: '#ff9a9a', fontSize: 13 },
  btn:     { backgroundColor: C.orange, borderRadius: 13, paddingVertical: 14, alignItems: 'center' },
  btnTxt:  { color: '#fff', fontSize: 15, fontWeight: '800' },
  successBox: { alignItems: 'center' },
  successTitle: { color: '#fff', fontWeight: '800', fontSize: 18, marginBottom: 10 },
  successDesc:  { color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  backBtn2:     { borderWidth: 1.5, borderColor: C.steel, borderRadius: 13, paddingVertical: 13, paddingHorizontal: 24, alignSelf: 'stretch', alignItems: 'center' },
  backBtn2Txt:  { color: C.steel, fontSize: 14, fontWeight: '700' },
});

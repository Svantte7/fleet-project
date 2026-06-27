// src/screens/RegInputScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DB } from '../data/store';
import { C, fmtReg, shadow } from '../utils/theme';
import AppHeader from '../components/AppHeader';

export default function RegInputScreen({ route, navigation }) {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();

  const saved = DB.getRememberedTruck(userId);
  const [truck,    setTruck]    = useState(saved);
  const [trailer,  setTrailer]  = useState('');
  const [remember, setRemember] = useState(!!saved);

  const handleTruck = (v) => {
    const f = fmtReg(v);
    setTruck(f);
    if (remember && f.length >= 2) DB.setRememberedTruck(userId, f);
    else if (remember) DB.clearRememberedTruck(userId);
  };

  const handleRemember = (v) => {
    setRemember(v);
    if (v && truck.length >= 2) DB.setRememberedTruck(userId, truck);
    else DB.clearRememberedTruck(userId);
  };

  const valid = truck.length >= 2 && trailer.length >= 2;

  const next = () => {
    if (remember && truck.length >= 2) DB.setRememberedTruck(userId, truck);
    navigation.navigate('Photo', { userId, truckReg: truck, trailerReg: trailer });
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="Rekisteritunnukset" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Kaluston tiedot</Text>
        <Text style={styles.sub}>Syötä rekisteritunnukset ilman väliviivaa</Text>

        {/* Truck */}
        <View style={[styles.card, shadow]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}><Text style={{ fontSize: 22 }}>🚛</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Vetoauto</Text>
              <Text style={styles.cardSub}>Rekisteritunnus (esim. ABC456)</Text>
            </View>
            {!!saved && (
              <View style={styles.savedBadge}>
                <Text style={styles.savedBadgeTxt}>💾 MUISTETTU</Text>
              </View>
            )}
          </View>

          <TextInput
            value={truck}
            onChangeText={handleTruck}
            placeholder="ABC456"
            placeholderTextColor={C.muted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            style={styles.regInput}
          />

          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Muista tämä vetoauto</Text>
              <Text style={styles.toggleSub}>Esitäytetään seuraavalla kerralla</Text>
            </View>
            <Switch
              value={remember}
              onValueChange={handleRemember}
              trackColor={{ false: C.border, true: C.steel }}
              thumbColor="#fff"
              ios_backgroundColor={C.border}
            />
          </View>
        </View>

        {/* Trailer */}
        <View style={[styles.card, shadow]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: `${C.orange}18` }]}><Text style={{ fontSize: 22 }}>🚌</Text></View>
            <View>
              <Text style={styles.cardTitle}>Perävaunu</Text>
              <Text style={styles.cardSub}>Rekisteritunnus (esim. QWE123)</Text>
            </View>
          </View>
          <TextInput
            value={trailer}
            onChangeText={v => setTrailer(fmtReg(v))}
            placeholder="QWE123"
            placeholderTextColor={C.muted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            style={styles.regInput}
          />
        </View>

        {/* Preview */}
        {valid && (
          <View style={styles.preview}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.previewLbl}>VETOAUTO</Text>
              <Text style={styles.previewReg}>{truck}</Text>
              {remember && <Text style={styles.previewRemember}>💾 muistetaan</Text>}
            </View>
            <Text style={styles.previewPlus}>+</Text>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.previewLbl}>PERÄVAUNU</Text>
              <Text style={[styles.previewReg, { color: C.orange }]}>{trailer}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={next}
          disabled={!valid}
          style={[styles.nextBtn, !valid && styles.nextBtnDisabled]}
          activeOpacity={0.82}
        >
          <Text style={styles.nextBtnTxt}>📷  Jatka kuvaukseen →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { padding: 16 },
  title:   { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 3 },
  sub:     { fontSize: 13, color: C.muted, marginBottom: 20 },

  card:      { backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 14 },
  cardHeader:{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardIconBox:{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${C.steel}18`, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: '800', color: C.text, fontSize: 15 },
  cardSub:   { color: C.muted, fontSize: 11, marginTop: 1 },
  savedBadge:{ backgroundColor: `${C.steel}18`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  savedBadgeTxt: { color: C.steel, fontSize: 10, fontWeight: '800' },

  regInput: {
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 11, paddingVertical: 13, paddingHorizontal: 14,
    fontSize: 22, fontWeight: '800', color: C.text,
    textAlign: 'center', fontFamily: 'Menlo', letterSpacing: 2,
  },

  divider:     { height: 1, backgroundColor: C.border, marginVertical: 14 },
  toggleRow:   { flexDirection: 'row', alignItems: 'center' },
  toggleLabel: { fontWeight: '700', color: C.text, fontSize: 14 },
  toggleSub:   { color: C.muted, fontSize: 11, marginTop: 2 },

  preview: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${C.navy}08`, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  previewLbl:      { color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  previewReg:      { fontFamily: 'Menlo', fontWeight: '900', fontSize: 22, color: C.steel, marginTop: 3 },
  previewRemember: { color: C.steel, fontSize: 9, marginTop: 2 },
  previewPlus:     { color: C.border, fontSize: 26, fontWeight: '300', paddingHorizontal: 10 },

  nextBtn:         { backgroundColor: C.steel, borderRadius: 13, paddingVertical: 15, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.38 },
  nextBtnTxt:      { color: '#fff', fontSize: 15, fontWeight: '800' },
});

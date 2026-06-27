// src/screens/DriverHomeScreen.js
import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { DB } from '../data/store';
import { C, fmtTime, shadow } from '../utils/theme';
import AppHeader from '../components/AppHeader';

export default function DriverHomeScreen({ route, navigation }) {
  const { userId } = route.params;
  const user = DB.getUser(userId);
  const insets = useSafeAreaInsets();
  const [inspections, setInspections] = useState([]);

  useFocusEffect(useCallback(() => {
    setInspections(DB.getMyInspections(userId));
  }, [userId]));

  const firstName = user?.name.split(' ')[0] ?? '';

  return (
    <View style={styles.root}>
      <AppHeader
        title="KalustoHallinta"
        onRight={() => navigation.navigate('ChangePin', { userId, forced: false })}
        rightLabel="PIN"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Greeting */}
        <Text style={styles.greeting}>Hei, {firstName}! 👋</Text>
        <Text style={styles.greetingSub}>Aloita uusi kalustontarkastus</Text>

        {/* New inspection CTA */}
        <TouchableOpacity
          style={styles.ctaCard}
          activeOpacity={0.82}
          onPress={() => navigation.navigate('RegInput', { userId })}
        >
          <View style={styles.ctaIconBox}>
            <Text style={{ fontSize: 30 }}>🚛</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Uusi tarkastus</Text>
            <Text style={styles.ctaSub}>Syötä rekisteritunnukset ja kuvaa kalusto</Text>
          </View>
          <View style={styles.ctaArrow}>
            <Text style={styles.ctaArrowTxt}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.logoutTxt}>Kirjaudu ulos</Text>
        </TouchableOpacity>

        {/* History */}
        <Text style={styles.sectionLbl}>OMAT TARKASTUKSET</Text>

        {inspections.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTxt}>Ei vielä tarkastuksia</Text>
          </View>
        )}

        {inspections.map(ins => (
          <View key={ins.id} style={[styles.insCard, shadow]}>
            <View style={styles.insRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.insReg}>{ins.trailerReg}</Text>
                <Text style={styles.insTruck}>Vetoauto: {ins.truckReg}</Text>
                <Text style={styles.insTime}>{fmtTime(ins.startedAt)}</Text>
              </View>
              <View style={[styles.insBadge, ins.completedAt ? styles.insBadgeDone : styles.insBadgePending]}>
                <Text style={[styles.insBadgeTxt, ins.completedAt ? styles.insBadgeTxtDone : styles.insBadgeTxtPending]}>
                  {ins.completedAt ? '✓ Valmis' : '⏳ Kesken'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { padding: 16 },

  greeting:    { fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 3 },
  greetingSub: { fontSize: 13, color: C.muted, marginBottom: 20 },

  ctaCard: {
    backgroundColor: C.navy, borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12,
    ...shadow,
  },
  ctaIconBox: { width: 52, height: 52, borderRadius: 15, backgroundColor: 'rgba(232,123,53,0.22)', alignItems: 'center', justifyContent: 'center' },
  ctaTitle:   { color: '#fff', fontWeight: '800', fontSize: 16 },
  ctaSub:     { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 },
  ctaArrow:   { paddingLeft: 4 },
  ctaArrowTxt:{ color: 'rgba(255,255,255,0.4)', fontSize: 24, fontWeight: '300' },

  logoutBtn:  { borderWidth: 1.5, borderColor: C.border, borderRadius: 11, paddingVertical: 11, alignItems: 'center', marginBottom: 22 },
  logoutTxt:  { color: C.muted, fontSize: 14, fontWeight: '600' },

  sectionLbl: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8, marginBottom: 10 },
  emptyBox:   { alignItems: 'center', paddingVertical: 30 },
  emptyIcon:  { fontSize: 36, marginBottom: 8 },
  emptyTxt:   { color: C.muted, fontSize: 14 },

  insCard:    { backgroundColor: C.surface, borderRadius: 13, padding: 14, marginBottom: 10 },
  insRow:     { flexDirection: 'row', alignItems: 'flex-start' },
  insReg:     { fontWeight: '800', fontSize: 16, color: C.text, fontFamily: 'Menlo' },
  insTruck:   { color: C.muted, fontSize: 12, marginTop: 2 },
  insTime:    { color: C.muted, fontSize: 11, marginTop: 3 },
  insBadge:       { borderRadius: 18, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  insBadgeDone:   { backgroundColor: '#E8F5EC' },
  insBadgePending:{ backgroundColor: '#FFF3E0' },
  insBadgeTxt:     { fontSize: 11, fontWeight: '700' },
  insBadgeTxtDone: { color: C.success },
  insBadgeTxtPending: { color: C.orange },
});

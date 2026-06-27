// src/screens/AdminHomeScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { DB } from '../data/store';
import { C, shadow } from '../utils/theme';
import AppHeader from '../components/AppHeader';

export default function AdminHomeScreen({ route, navigation }) {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  const [newCount, setNewCount] = useState(0);
  const [totalIns, setTotalIns] = useState(0);
  const [driverCount, setDriverCount] = useState(0);

  useFocusEffect(useCallback(() => {
    setNewCount(DB.newCount());
    setTotalIns(DB.getInspections().length);
    setDriverCount(DB.getAllDrivers().length);
  }, []));

  return (
    <View style={styles.root}>
      <AppHeader
        title="Hallintapaneeli"
        onRight={() => navigation.replace('Login')}
        rightLabel="Ulos"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        <Text style={styles.greeting}>Pääkäyttäjä 👋</Text>
        <Text style={styles.greetingSub}>Kaluston hallintanäkymä</Text>

        {/* New inspections alert */}
        {newCount > 0 && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => navigation.navigate('AdminReports', { userId })}
            activeOpacity={0.82}
          >
            <Text style={styles.alertIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{newCount} uusi raportti{newCount > 1 ? 'a' : ''} odottaa</Text>
              <Text style={styles.alertSub}>Napauta tarkistaaksesi</Text>
            </View>
            <Text style={styles.alertArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Nav cards */}
        {[
          {
            icon: '📋', title: 'Raportit', sub: `${totalIns} tarkastusta`,
            badge: newCount || null, color: C.steel,
            onPress: () => navigation.navigate('AdminReports', { userId }),
          },
          {
            icon: '👥', title: 'Kuljettajat', sub: `${driverCount} käyttäjää`,
            badge: null, color: C.success,
            onPress: () => navigation.navigate('AdminUsers', { userId }),
          },
        ].map(item => (
          <TouchableOpacity
            key={item.title}
            style={[styles.navCard, shadow]}
            onPress={item.onPress}
            activeOpacity={0.78}
          >
            <View style={[styles.navIconBox, { backgroundColor: `${item.color}14` }]}>
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.navTitle}>{item.title}</Text>
              <Text style={styles.navSub}>{item.sub}</Text>
            </View>
            {item.badge ? (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeTxt}>{item.badge}</Text>
              </View>
            ) : null}
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
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
  alertCard:   { backgroundColor: C.orange, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, ...shadow },
  alertIcon:   { fontSize: 24 },
  alertTitle:  { color: '#fff', fontWeight: '900', fontSize: 15 },
  alertSub:    { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 },
  alertArrow:  { color: 'rgba(255,255,255,0.7)', fontSize: 24, fontWeight: '300' },
  navCard:     { backgroundColor: C.surface, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  navIconBox:  { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  navTitle:    { fontWeight: '800', fontSize: 16, color: C.text },
  navSub:      { color: C.muted, fontSize: 12, marginTop: 2 },
  navBadge:    { backgroundColor: C.orange, borderRadius: 18, minWidth: 26, height: 26, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7 },
  navBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  navArrow:    { color: C.border, fontSize: 22, fontWeight: '300' },
});

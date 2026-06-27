// src/screens/AdminUsersScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { DB } from '../data/store';
import { C, shadow } from '../utils/theme';
import AppHeader from '../components/AppHeader';

export default function AdminUsersScreen({ route, navigation }) {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  const [drivers,   setDrivers]   = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [newName,   setNewName]   = useState('');
  const [newPhone,  setNewPhone]  = useState('');
  const [created,   setCreated]   = useState(null);
  const [err,       setErr]       = useState('');

  const refresh = useCallback(() => setDrivers(DB.getAllDrivers()), []);
  useFocusEffect(refresh);

  const create = () => {
    if (!newName.trim())  { setErr('Nimi on pakollinen.'); return; }
    if (!newPhone.trim()) { setErr('Puhelinnumero on pakollinen.'); return; }
    const res = DB.createUser(newName, newPhone);
    if (res.error) { setErr(res.error); return; }
    setCreated(res.user);
    setErr('');
    setNewName(''); setNewPhone('');
    refresh();
  };

  const deactivate = (uid, name) => {
    Alert.alert(
      'Poista käyttäjä',
      `Haluatko varmasti deaktivoida käyttäjän ${name}?`,
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Poista', style: 'destructive',
          onPress: () => { DB.deactivateUser(uid); refresh(); },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <AppHeader title="Kuljettajat" onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Käyttäjähallinta</Text>
            <Text style={styles.sub}>{drivers.length} kuljettajaa</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => { setShowForm(true); setCreated(null); setErr(''); }}
            activeOpacity={0.82}
          >
            <Text style={styles.addBtnTxt}>+ Uusi kuljettaja</Text>
          </TouchableOpacity>
        </View>

        {/* Create form */}
        {showForm && (
          <View style={[styles.formCard, shadow]}>
            {!created ? (
              <>
                <Text style={styles.formTitle}>Luo kuljettajatunnus</Text>

                <Text style={styles.lbl}>NIMI</Text>
                <TextInput
                  value={newName} onChangeText={setNewName}
                  placeholder="Etunimi Sukunimi" placeholderTextColor={C.muted}
                  autoCapitalize="words" autoCorrect={false}
                  style={styles.input}
                />

                <Text style={styles.lbl}>PUHELINNUMERO</Text>
                <TextInput
                  value={newPhone} onChangeText={setNewPhone}
                  placeholder="040 1234567" placeholderTextColor={C.muted}
                  keyboardType="phone-pad"
                  style={styles.input}
                />

                {!!err && <View style={styles.errBox}><Text style={styles.errTxt}>{err}</Text></View>}

                <View style={styles.formBtns}>
                  <TouchableOpacity
                    onPress={() => { setShowForm(false); setErr(''); }}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnTxt}>Peruuta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={create} style={styles.createBtn} activeOpacity={0.82}>
                    <Text style={styles.createBtnTxt}>Luo tunnus</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.formTitle}>✅ Tunnus luotu!</Text>
                <View style={styles.successBox}>
                  <Text style={styles.successRow}><Text style={styles.successKey}>Nimi: </Text>{created.name}</Text>
                  <Text style={styles.successRow}><Text style={styles.successKey}>Puhelin: </Text>{created.phone}</Text>
                  <Text style={styles.successRow}><Text style={styles.successKey}>Väliaikainen PIN: </Text>1234 (lähetetty SMS)</Text>
                  <Text style={styles.successNote}>Käyttäjä vaihtaa PIN:n ensimmäisellä kirjautumiskerralla.</Text>
                </View>
                <TouchableOpacity
                  onPress={() => { setShowForm(false); setCreated(null); }}
                  style={styles.createBtn}
                >
                  <Text style={styles.createBtnTxt}>Sulje</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Driver list */}
        <Text style={styles.sectionLbl}>KULJETTAJAT</Text>
        {drivers.map(drv => {
          const insCount = DB.getMyInspections(drv.id).length;
          return (
            <View key={drv.id} style={[styles.driverCard, shadow, !drv.active && styles.driverCardInactive]}>
              <View style={styles.driverAvatar}>
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.driverName}>{drv.name}</Text>
                <Text style={styles.driverInfo}>📞 {drv.phone}</Text>
                <Text style={styles.driverInfo}>
                  {insCount} tarkastusta
                  {' · '}{drv.active ? '🟢 Aktiivinen' : '🔴 Deaktivoitu'}
                  {drv.mustChangePIN ? ' · ⚠️ PIN vaihto' : ''}
                </Text>
              </View>
              {drv.active && (
                <TouchableOpacity
                  onPress={() => deactivate(drv.id, drv.name)}
                  style={styles.removeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.removeBtnTxt}>Poista</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { padding: 16 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  title:     { fontSize: 20, fontWeight: '900', color: C.text },
  sub:       { color: C.muted, fontSize: 12, marginTop: 2 },
  addBtn:    { backgroundColor: C.orange, borderRadius: 11, paddingVertical: 9, paddingHorizontal: 16 },
  addBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },

  formCard:  { backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1.5, borderColor: `${C.orange}44` },
  formTitle: { fontWeight: '800', color: C.text, fontSize: 16, marginBottom: 14 },
  lbl:       { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 5 },
  input:     { backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, borderRadius: 11, paddingVertical: 11, paddingHorizontal: 13, fontSize: 15, color: C.text, marginBottom: 14 },
  errBox:    { backgroundColor: 'rgba(217,79,79,0.1)', borderRadius: 9, padding: 10, marginBottom: 12 },
  errTxt:    { color: C.danger, fontSize: 13 },
  formBtns:  { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: C.steel, borderRadius: 11, paddingVertical: 11, alignItems: 'center' },
  cancelBtnTxt: { color: C.steel, fontWeight: '700', fontSize: 14 },
  createBtn: { flex: 1, backgroundColor: C.orange, borderRadius: 11, paddingVertical: 11, alignItems: 'center' },
  createBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  successBox:  { backgroundColor: '#E8F5EC', borderRadius: 11, padding: 13, marginBottom: 14 },
  successRow:  { fontSize: 13, color: C.text, marginBottom: 4 },
  successKey:  { fontWeight: '700' },
  successNote: { fontSize: 11, color: C.muted, marginTop: 6 },

  sectionLbl: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 },
  driverCard: { backgroundColor: C.surface, borderRadius: 13, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  driverCardInactive: { opacity: 0.45 },
  driverAvatar: { width: 44, height: 44, borderRadius: 13, backgroundColor: `${C.steel}14`, alignItems: 'center', justifyContent: 'center' },
  driverName:  { fontWeight: '800', color: C.text, fontSize: 14 },
  driverInfo:  { color: C.muted, fontSize: 11, marginTop: 2 },
  removeBtn:   { backgroundColor: C.danger, borderRadius: 9, paddingVertical: 7, paddingHorizontal: 12 },
  removeBtnTxt:{ color: '#fff', fontSize: 12, fontWeight: '700' },
});

// src/screens/SuccessScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../utils/theme';

export default function SuccessScreen({ route, navigation }) {
  const { trailerReg, userId } = route.params;
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.iconBox}>
        <Text style={{ fontSize: 52 }}>✅</Text>
      </View>
      <Text style={styles.title}>Tarkastus tallennettu!</Text>
      <Text style={styles.desc}>
        Kuvat on tallennettu perävaunun {trailerReg} rekisterin mukaan.{'\n'}
        Pääkäyttäjä voi tarkastella niitä hallintapaneelissa.
      </Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.replace('DriverHome', { userId })}
        activeOpacity={0.82}
      >
        <Text style={styles.btnTxt}>⬅  Palaa etusivulle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 28 },
  iconBox: { width: 92, height: 92, borderRadius: 28, backgroundColor: `${C.success}18`, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  title:   { fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 10, textAlign: 'center' },
  desc:    { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  btn:     { backgroundColor: C.steel, borderRadius: 13, paddingVertical: 15, paddingHorizontal: 40, alignItems: 'center', width: '100%' },
  btnTxt:  { color: '#fff', fontSize: 15, fontWeight: '800' },
});

// src/components/CameraModal.js
import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Linking, Platform,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { C } from '../utils/theme';

const GUIDE = {
  front:  { label: 'Keula',      hint: 'Kuvaa perävaunun keulasta', icon: '⬆️' },
  rear:   { label: 'Perä',       hint: 'Kuvaa perävaunun perästä',  icon: '⬇️' },
  left:   { label: 'Vasen sivu', hint: 'Kuvaa vasemmalta sivulta',  icon: '⬅️' },
  right:  { label: 'Oikea sivu', hint: 'Kuvaa oikealta sivulta',    icon: '➡️' },
  damage: { label: 'Vaurio',     hint: 'Kuvaa vaurio läheltä',      icon: '⚠️' },
};

const compress = async (uri) => {
  const r = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1920 } }],
    { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
  );
  return r.uri;
};

export default function CameraModal({ sideKey, trailerReg, onPhoto, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing,  setFacing]  = useState('back');
  const [flash,   setFlash]   = useState('off');
  const [busy,    setBusy]    = useState(false);
  const camRef = useRef(null);
  const guide  = GUIDE[sideKey] ?? GUIDE.front;

  // ── Permission not yet resolved ────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.orange} size="large" />
      </View>
    );
  }

  // ── Permission denied or not granted ──────────────────────────────────────
  if (!permission.granted) {
    const denied = permission.status === 'denied';
    return (
      <SafeAreaView style={styles.permScreen}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Kameran käyttöoikeus</Text>
        <Text style={styles.permDesc}>
          {denied
            ? 'Olet aiemmin kieltänyt kameran käyttöoikeuden.\n\nVoit myöntää sen Asetuksista:\nAsetukset → Tietosuoja → Kamera → KalustoHallinta'
            : 'KalustoHallinta tarvitsee kameran käyttöoikeuden perävaunun kuvaamiseen tarkastusraporttia varten.'}
        </Text>
        {denied ? (
          <TouchableOpacity style={styles.permBtn} onPress={() => Linking.openURL('app-settings:')}>
            <Text style={styles.permBtnTxt}>Avaa Asetukset</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnTxt}>Myönnä käyttöoikeus</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.permCancel} onPress={onClose}>
          <Text style={styles.permCancelTxt}>Peruuta</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Take photo ─────────────────────────────────────────────────────────────
  const shoot = useCallback(async () => {
    if (!camRef.current || busy) return;
    try {
      setBusy(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const raw = await camRef.current.takePictureAsync({ quality: 0.9, exif: false });
      const uri = await compress(raw.uri);
      onPhoto({ uri, takenAt: Date.now() });
    } catch {
      Alert.alert('Virhe', 'Kuvan ottaminen epäonnistui. Yritä uudelleen.');
    } finally {
      setBusy(false);
    }
  }, [busy, onPhoto]);

  // ── Pick from library ──────────────────────────────────────────────────────
  const pickLib = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Käyttöoikeus evätty', 'Myönnä kuvakirjaston käyttöoikeus Asetuksista.',
        [{ text: 'Peruuta', style: 'cancel' },
         { text: 'Avaa Asetukset', onPress: () => Linking.openURL('app-settings:') }]);
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.[0]) {
      const uri = await compress(res.assets[0].uri);
      onPhoto({ uri, takenAt: Date.now() });
    }
  }, [onPhoto]);

  const flashCycle = { off: 'on', on: 'auto', auto: 'off' };
  const flashIcon  = { off: '⚡️✕', on: '⚡️', auto: '⚡A' };

  return (
    <View style={styles.container}>
      <CameraView
        ref={camRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
          <Text style={styles.iconTxt}>✕</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.topLabel}>{guide.icon}  {guide.label}</Text>
          <Text style={styles.topReg}>{trailerReg}</Text>
        </View>
        <TouchableOpacity onPress={() => setFlash(f => flashCycle[f])} style={styles.iconBtn}>
          <Text style={styles.iconTxt}>{flashIcon[flash]}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Corner frame */}
      <View style={styles.frame} pointerEvents="none">
        <View style={[styles.corner, styles.cTL]} />
        <View style={[styles.corner, styles.cTR]} />
        <View style={[styles.corner, styles.cBL]} />
        <View style={[styles.corner, styles.cBR]} />
      </View>

      {/* Hint */}
      <View style={styles.hintBox} pointerEvents="none">
        <Text style={styles.hintTxt}>{guide.hint}</Text>
      </View>

      {/* Bottom bar */}
      <SafeAreaView style={styles.bottomBar}>
        <TouchableOpacity onPress={pickLib} style={styles.sideBtn}>
          <Text style={styles.sideBtnIcon}>🖼️</Text>
          <Text style={styles.sideBtnLbl}>Kirjasto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={shoot}
          disabled={busy}
          style={[styles.shutter, busy && { opacity: 0.6 }]}
          activeOpacity={0.7}
        >
          {busy
            ? <ActivityIndicator color={C.navy} />
            : <View style={styles.shutterInner} />
          }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
          style={styles.sideBtn}
        >
          <Text style={styles.sideBtnIcon}>🔄</Text>
          <Text style={styles.sideBtnLbl}>Käännä</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_W    = 3;
const cornerBase  = { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: '#fff' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },

  // Permission
  permScreen: { flex: 1, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permIcon:   { fontSize: 60, marginBottom: 20 },
  permTitle:  { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 14, textAlign: 'center' },
  permDesc:   { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  permBtn:    { backgroundColor: C.orange, borderRadius: 13, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center', marginBottom: 12 },
  permBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  permCancel: { padding: 12 },
  permCancelTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },

  // Top
  topBar:    { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 14, backgroundColor: 'rgba(0,0,0,0.52)' },
  topCenter: { alignItems: 'center', flex: 1 },
  topLabel:  { color: '#fff', fontSize: 17, fontWeight: '800' },
  topReg:    { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  iconBtn:   { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  iconTxt:   { color: '#fff', fontSize: 18 },

  // Frame corners
  frame: { position: 'absolute', top: '24%', left: '8%', right: '8%', bottom: '24%' },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: '#fff' },
  cTL: { top: 0,    left: 0,  borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W },
  cTR: { top: 0,    right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W },
  cBL: { bottom: 0, left: 0,  borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W },
  cBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W },

  // Hint
  hintBox: { position: 'absolute', bottom: '27%', left: 0, right: 0, alignItems: 'center' },
  hintTxt: { color: 'rgba(255,255,255,0.75)', fontSize: 13, backgroundColor: 'rgba(0,0,0,0.42)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },

  // Bottom
  bottomBar:   { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 24, paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.55)' },
  sideBtn:     { alignItems: 'center', width: 64 },
  sideBtnIcon: { fontSize: 28 },
  sideBtnLbl:  { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 4 },
  shutter:     { width: 78, height: 78, borderRadius: 39, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner:{ width: 62, height: 62, borderRadius: 31, backgroundColor: '#fff' },
});

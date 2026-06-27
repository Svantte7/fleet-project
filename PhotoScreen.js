// src/screens/PhotoScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  TextInput, Modal, StyleSheet, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DB, SIDES } from '../data/store';
import { C, fmtTime, shadow } from '../utils/theme';
import AppHeader from '../components/AppHeader';
import CameraModal from '../components/CameraModal';

export default function PhotoScreen({ route, navigation }) {
  const { userId, truckReg, trailerReg } = route.params;
  const insets = useSafeAreaInsets();

  const [photos,    setPhotos]    = useState({});   // {front:{uri,takenAt}, ...}
  const [dmgPhotos, setDmgPhotos] = useState([]);   // [{uri,takenAt}]
  const [dmgDesc,   setDmgDesc]   = useState('');
  const [camSlot,   setCamSlot]   = useState(null); // open camera for which slot
  const [saving,    setSaving]    = useState(false);

  const normalDone = Object.keys(photos).length;
  const totalDone  = normalDone + (dmgPhotos.length > 0 ? 1 : 0);
  const total      = SIDES.length + 1;
  const allDone    = normalDone === SIDES.length && dmgPhotos.length > 0;
  const pct        = Math.round((totalDone / total) * 100);

  const handlePhoto = useCallback((img) => {
    const slot = camSlot;
    setCamSlot(null);
    if (!slot) return;
    if (slot === 'damage') {
      setDmgPhotos(p => [...p, img]);
    } else {
      setPhotos(p => ({ ...p, [slot]: img }));
    }
  }, [camSlot]);

  const save = () => {
    setSaving(true);
    const user = DB.getUser(userId);
    setTimeout(() => {
      DB.saveInspection({
        trailerReg,
        truckReg,
        userId,
        userName: user.name,
        photos: SIDES.filter(s => photos[s.key]).map(s => ({
          side: s.key,
          sideLabel: s.label,
          uri: photos[s.key].uri,
          takenAt: photos[s.key].takenAt,
        })),
        damagePhotos: dmgPhotos,
        damageDescription: dmgDesc,
      });
      setSaving(false);
      navigation.replace('Success', { trailerReg, userId });
    }, 800);
  };

  return (
    <View style={styles.root}>
      {/* Camera modal */}
      <Modal
        visible={!!camSlot}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        {!!camSlot && (
          <CameraModal
            sideKey={camSlot}
            trailerReg={trailerReg}
            onPhoto={handlePhoto}
            onClose={() => setCamSlot(null)}
          />
        )}
      </Modal>

      <AppHeader title={`Kuvaus`} subtitle={trailerReg} onBack={() => navigation.goBack()} />

      {/* Progress */}
      <View style={styles.progressBox}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLbl}>{totalDone} / {total} osiota valmiina</Text>
          <Text style={styles.progressPct}>{pct}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Normal sides */}
        {SIDES.map(side => {
          const ph = photos[side.key];
          return (
            <TouchableOpacity
              key={side.key}
              style={[styles.sideCard, shadow]}
              onPress={() => setCamSlot(side.key)}
              activeOpacity={0.78}
            >
              {/* Thumbnail */}
              <View style={styles.thumbBox}>
                {ph ? (
                  <Image source={{ uri: ph.uri }} style={styles.thumb} />
                ) : (
                  <View style={styles.thumbEmpty}>
                    <Text style={{ fontSize: 26 }}>{side.icon}</Text>
                    <Text style={styles.thumbHint}>Ei kuvaa</Text>
                  </View>
                )}
                {ph && (
                  <View style={styles.checkBadge}>
                    <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={styles.sideInfo}>
                <Text style={styles.sideLabel}>{side.label}</Text>
                {ph && <Text style={styles.sideTime}>{fmtTime(ph.takenAt)}</Text>}
              </View>

              {/* Action */}
              <View style={[styles.actionBtn, ph && styles.actionBtnDone]}>
                <Text style={[styles.actionBtnTxt, ph && styles.actionBtnTxtDone]}>
                  {ph ? '🔄' : '📷'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Damage card */}
        <View style={[styles.dmgCard, dmgPhotos.length > 0 && styles.dmgCardActive, shadow]}>
          {/* Header */}
          <View style={styles.dmgHeader}>
            <View style={styles.dmgIconBox}>
              <Text style={{ fontSize: 20 }}>⚠️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dmgTitle}>Vauriot / huomiot</Text>
              <Text style={styles.dmgSub}>{dmgPhotos.length} kuvaa · useita sallittu</Text>
            </View>
            {dmgPhotos.length > 0 && (
              <View style={styles.dmgDoneBadge}>
                <Text style={styles.dmgDoneTxt}>✓ Kuvattuna</Text>
              </View>
            )}
          </View>

          {/* Damage photo grid */}
          {dmgPhotos.length > 0 && (
            <View style={styles.dmgGrid}>
              {dmgPhotos.map((ph, i) => (
                <View key={i} style={styles.dmgThumbWrap}>
                  <Image source={{ uri: ph.uri }} style={styles.dmgThumb} />
                  <TouchableOpacity
                    onPress={() => setDmgPhotos(p => p.filter((_, j) => j !== i))}
                    style={styles.dmgRemove}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.dmgRemoveTxt}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => setCamSlot('damage')}
            style={styles.dmgAddBtn}
            activeOpacity={0.82}
          >
            <Text style={styles.dmgAddTxt}>📷  Lisää kuva vauriosta</Text>
          </TouchableOpacity>

          {/* Description */}
          <Text style={styles.descLbl}>Vaurionkuvaus</Text>
          <TextInput
            style={styles.descInput}
            multiline
            numberOfLines={4}
            placeholder="Kuvaile havaitut vauriot tai huomiot tarkasti..."
            placeholderTextColor={C.muted}
            value={dmgDesc}
            onChangeText={setDmgDesc}
            textAlignVertical="top"
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={save}
          disabled={totalDone === 0 || saving}
          style={[
            styles.saveBtn,
            allDone && styles.saveBtnGreen,
            (totalDone === 0 || saving) && styles.saveBtnOff,
          ]}
          activeOpacity={0.82}
        >
          <Text style={styles.saveBtnTxt}>
            {saving
              ? '⏳  Tallennetaan...'
              : allDone
                ? '✅  Tallenna tarkastus'
                : `💾  Tallenna (${totalDone}/${total} osiota)`}
          </Text>
        </TouchableOpacity>

        {totalDone > 0 && !allDone && (
          <Text style={styles.saveHint}>Voit tallentaa myös kesken tarkastuksen</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  scroll:{ flex: 1 },
  content: { padding: 14 },

  progressBox: { backgroundColor: C.surface, padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  progressLbl: { fontSize: 13, fontWeight: '700', color: C.text },
  progressPct: { fontSize: 13, color: C.muted },
  track: { height: 7, backgroundColor: C.border, borderRadius: 7, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 7, backgroundColor: C.steel },

  sideCard: {
    backgroundColor: C.surface, borderRadius: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
  },
  thumbBox: {
    width: 88, height: 88, backgroundColor: `${C.navy}0A`,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  thumb:       { width: 88, height: 88, resizeMode: 'cover' },
  thumbEmpty:  { alignItems: 'center' },
  thumbHint:   { fontSize: 9, color: C.muted, marginTop: 2 },
  checkBadge:  { position: 'absolute', bottom: 4, right: 4, backgroundColor: C.success, borderRadius: 9, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },

  sideInfo:  { flex: 1, paddingHorizontal: 13 },
  sideLabel: { fontWeight: '800', color: C.text, fontSize: 14 },
  sideTime:  { color: C.muted, fontSize: 10, marginTop: 3 },

  actionBtn:     { marginRight: 14, backgroundColor: C.steel, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  actionBtnDone: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.steel },
  actionBtnTxt:  { color: '#fff', fontSize: 16 },
  actionBtnTxtDone: { color: C.steel },

  dmgCard: {
    backgroundColor: C.surface, borderRadius: 14, padding: 15,
    marginBottom: 12, borderWidth: 1.5, borderColor: C.border,
  },
  dmgCardActive: { borderColor: `${C.danger}55` },
  dmgHeader:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 },
  dmgIconBox:   { width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(217,79,79,0.1)', alignItems: 'center', justifyContent: 'center' },
  dmgTitle:     { fontWeight: '800', color: C.text, fontSize: 14 },
  dmgSub:       { color: C.muted, fontSize: 11, marginTop: 2 },
  dmgDoneBadge: { backgroundColor: '#E8F5EC', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 3 },
  dmgDoneTxt:   { color: C.success, fontSize: 10, fontWeight: '700' },

  dmgGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 },
  dmgThumbWrap: { width: 88, height: 88, borderRadius: 9, overflow: 'hidden', position: 'relative' },
  dmgThumb:     { width: '100%', height: '100%', resizeMode: 'cover' },
  dmgRemove:    { position: 'absolute', top: 3, right: 3, backgroundColor: 'rgba(217,79,79,0.92)', borderRadius: 7, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  dmgRemoveTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },

  dmgAddBtn:  { backgroundColor: C.danger, borderRadius: 11, paddingVertical: 11, alignItems: 'center', marginBottom: 13 },
  dmgAddTxt:  { color: '#fff', fontWeight: '700', fontSize: 13 },

  descLbl:    { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 },
  descInput:  { borderWidth: 1.5, borderColor: C.border, borderRadius: 11, padding: 12, fontSize: 13, color: C.text, minHeight: 88, lineHeight: 20 },

  saveBtn:     { backgroundColor: C.steel, borderRadius: 13, paddingVertical: 15, alignItems: 'center', marginBottom: 10 },
  saveBtnGreen:{ backgroundColor: C.success },
  saveBtnOff:  { opacity: 0.38 },
  saveBtnTxt:  { color: '#fff', fontSize: 15, fontWeight: '800' },
  saveHint:    { textAlign: 'center', color: C.muted, fontSize: 11 },
});

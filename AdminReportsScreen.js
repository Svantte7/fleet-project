// src/screens/AdminReportsScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  TextInput, Modal, StyleSheet, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { DB, SIDES } from '../data/store';
import { C, fmtTime, fmtReg, shadow } from '../utils/theme';
import AppHeader from '../components/AppHeader';

// ── Photo modal ────────────────────────────────────────────────────────────────
function PhotoModal({ item, onClose }) {
  if (!item) return null;
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={pmStyles.backdrop} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity style={pmStyles.card} activeOpacity={1} onPress={() => {}}>
          {item.uri && (
            <Image source={{ uri: item.uri }} style={pmStyles.img} resizeMode="cover" />
          )}
          {!item.uri && (
            <View style={pmStyles.noImg}>
              <Text style={{ color: C.muted, fontSize: 14 }}>Esimerkkikuva (URI puuttuu)</Text>
            </View>
          )}
          <View style={pmStyles.info}>
            <Text style={pmStyles.label}>{item.label}</Text>
            {!!item.description && (
              <View style={pmStyles.descBox}>
                <Text style={pmStyles.descLbl}>Vaurionkuvaus</Text>
                <Text style={pmStyles.descTxt}>{item.description}</Text>
              </View>
            )}
            {!!item.takenAt && <Text style={pmStyles.time}>{fmtTime(item.takenAt)}</Text>}
            <TouchableOpacity onPress={onClose} style={pmStyles.closeBtn}>
              <Text style={pmStyles.closeTxt}>✕  Sulje</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const pmStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card:     { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', width: '100%', maxWidth: 400 },
  img:      { width: '100%', height: 240 },
  noImg:    { width: '100%', height: 160, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  info:     { padding: 16 },
  label:    { fontWeight: '800', fontSize: 16, color: C.text, marginBottom: 8 },
  descBox:  { backgroundColor: 'rgba(217,79,79,0.07)', borderRadius: 9, padding: 11, marginBottom: 8 },
  descLbl:  { fontSize: 10, fontWeight: '700', color: C.danger, textTransform: 'uppercase', marginBottom: 4 },
  descTxt:  { fontSize: 13, color: C.text, lineHeight: 20 },
  time:     { fontSize: 11, color: C.muted, marginBottom: 12 },
  closeBtn: { borderWidth: 1.5, borderColor: C.steel, borderRadius: 11, paddingVertical: 11, alignItems: 'center' },
  closeTxt: { color: C.steel, fontWeight: '700', fontSize: 14 },
});

// ── Main screen ────────────────────────────────────────────────────────────────
export default function AdminReportsScreen({ route, navigation }) {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();

  const [search,  setSearch]  = useState('');
  const [selReg,  setSelReg]  = useState(null);   // selected trailer reg
  const [selIns,  setSelIns]  = useState(null);   // selected inspection
  const [modal,   setModal]   = useState(null);
  const [allRegs, setAllRegs] = useState([]);
  const [regIns,  setRegIns]  = useState([]);

  useFocusEffect(useCallback(() => {
    DB.markAllSeen();
    setAllRegs(DB.getUniqueTrailers());
  }, []));

  useEffect(() => {
    if (selReg) setRegIns(DB.getByTrailer(selReg));
  }, [selReg]);

  const filtered = allRegs.filter(r => r.includes(search.toUpperCase()));

  // ── Inspection detail ────────────────────────────────────────────────────
  if (selIns) {
    return (
      <View style={styles.root}>
        <PhotoModal item={modal} onClose={() => setModal(null)} />
        <AppHeader
          title={selIns.trailerReg}
          subtitle="Tarkastus"
          onBack={() => setSelIns(null)}
        />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        >
          {/* Meta */}
          <View style={[styles.card, shadow]}>
            <View style={styles.insMetaRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.insMetaName}>👤 {selIns.userName}</Text>
                <Text style={styles.insMetaInfo}>🚛 {selIns.truckReg}</Text>
                <Text style={styles.insMetaTime}>📅 {fmtTime(selIns.startedAt)}</Text>
              </View>
              <View style={[styles.badge, selIns.completedAt ? styles.badgeDone : styles.badgePend]}>
                <Text style={[styles.badgeTxt, selIns.completedAt ? styles.badgeTxtDone : styles.badgeTxtPend]}>
                  {selIns.completedAt ? '✓ Valmis' : '⏳ Kesken'}
                </Text>
              </View>
            </View>
          </View>

          {/* Normal photos */}
          <Text style={styles.sectionLbl}>PERUSKUVAT</Text>
          <View style={styles.photoGrid}>
            {selIns.photos.map(ph => (
              <TouchableOpacity
                key={ph.side}
                onPress={() => setModal({ uri: ph.uri, label: ph.sideLabel, takenAt: ph.takenAt })}
                style={styles.photoCell}
              >
                {ph.uri ? (
                  <Image source={{ uri: ph.uri }} style={styles.photoCellImg} />
                ) : (
                  <View style={[styles.photoCellImg, styles.photoCellEmpty]}>
                    <Text style={{ color: C.muted, fontSize: 11 }}>{ph.sideLabel}</Text>
                  </View>
                )}
                <View style={styles.photoCellLabel}>
                  <Text style={styles.photoCellLabelTxt}>{ph.sideLabel}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {SIDES.filter(s => !selIns.photos.find(p => p.side === s.key)).map(s => (
              <View key={s.key} style={[styles.photoCell, styles.photoCellMissing]}>
                <Text style={{ fontSize: 18 }}>{s.icon}</Text>
                <Text style={styles.photoCellMissingTxt}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Damage */}
          <Text style={[styles.sectionLbl, { color: C.danger }]}>⚠️  VAURIOT / HUOMIOT</Text>
          {selIns.damagePhotos.length === 0 && !selIns.damageDescription && (
            <Text style={styles.noData}>Ei vauriokuvia tai kuvausta.</Text>
          )}
          {selIns.damagePhotos.length > 0 && (
            <View style={styles.photoGrid}>
              {selIns.damagePhotos.map((ph, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setModal({ uri: ph.uri, label: `Vaurio ${i + 1}`, takenAt: ph.takenAt, description: selIns.damageDescription })}
                  style={styles.photoCell}
                >
                  {ph.uri ? (
                    <Image source={{ uri: ph.uri }} style={styles.photoCellImg} />
                  ) : (
                    <View style={[styles.photoCellImg, styles.photoCellEmpty]}>
                      <Text style={{ color: C.muted, fontSize: 11 }}>Vaurio {i + 1}</Text>
                    </View>
                  )}
                  <View style={[styles.photoCellLabel, { backgroundColor: 'rgba(180,30,30,0.7)' }]}>
                    <Text style={styles.photoCellLabelTxt}>Vaurio {i + 1}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {!!selIns.damageDescription && (
            <View style={styles.descBox}>
              <Text style={styles.descLbl}>Kuvaus</Text>
              <Text style={styles.descTxt}>{selIns.damageDescription}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── Inspection list for trailer ────────────────────────────────────────────
  if (selReg) {
    return (
      <View style={styles.root}>
        <AppHeader title={selReg} subtitle="Perävaunun tarkastukset" onBack={() => setSelReg(null)} />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
          {regIns.map(ins => (
            <TouchableOpacity
              key={ins.id}
              style={[styles.card, shadow]}
              onPress={() => setSelIns(ins)}
              activeOpacity={0.78}
            >
              <View style={styles.insMetaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.insMetaName}>👤 {ins.userName}</Text>
                  <Text style={styles.insMetaInfo}>🚛 {ins.truckReg}</Text>
                  <Text style={styles.insMetaTime}>📅 {fmtTime(ins.startedAt)}</Text>
                  <Text style={styles.insMetaCount}>
                    {ins.photos.length} peruskuvaa
                    {ins.damagePhotos.length > 0 ? ` · ${ins.damagePhotos.length} vauriokuvaa` : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <View style={[styles.badge, ins.completedAt ? styles.badgeDone : styles.badgePend]}>
                    <Text style={[styles.badgeTxt, ins.completedAt ? styles.badgeTxtDone : styles.badgeTxtPend]}>
                      {ins.completedAt ? '✓ Valmis' : '⏳ Kesken'}
                    </Text>
                  </View>
                  <Text style={{ color: C.border, fontSize: 20 }}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Trailer list ───────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <AppHeader title="Raportit" onBack={() => navigation.goBack()} />

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Tarkastuksia', val: DB.getInspections().length, color: C.steel },
          { label: 'Perävaunuja',  val: allRegs.length,             color: C.orange },
          { label: 'Kuljettajia',  val: new Set(DB.getInspections().map(i => i.userId)).size, color: C.success },
        ].map(s => (
          <View key={s.label} style={[styles.statCard, shadow]}>
            <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
            <Text style={styles.statLbl}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={v => setSearch(fmtReg(v))}
          placeholder="Hae rekisterillä..."
          placeholderTextColor={C.muted}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.searchInput}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: C.muted, fontSize: 18, paddingHorizontal: 8 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={r => r}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTxt}>Ei tuloksia</Text>
          </View>
        }
        renderItem={({ item: reg }) => {
          const ins    = DB.getByTrailer(reg);
          const latest = ins[0];
          return (
            <TouchableOpacity
              style={[styles.card, shadow]}
              onPress={() => setSelReg(reg)}
              activeOpacity={0.78}
            >
              <View style={styles.insMetaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trailerReg}>{reg}</Text>
                  <Text style={styles.insMetaInfo}>
                    {ins.length} tarkastus{ins.length !== 1 ? 'ta' : ''} · {fmtTime(latest.startedAt)}
                  </Text>
                  <Text style={styles.insMetaTime}>{latest.userName}</Text>
                </View>
                <Text style={{ color: C.border, fontSize: 22, fontWeight: '300' }}>›</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  content: { padding: 14 },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  statCard: { flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center' },
  statVal:  { fontSize: 24, fontWeight: '900' },
  statLbl:  { fontSize: 10, color: C.muted, fontWeight: '700', marginTop: 2 },

  searchBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, marginHorizontal: 14, borderRadius: 11, paddingHorizontal: 12, marginBottom: 2, borderWidth: 1, borderColor: C.border },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 15, color: C.text, fontFamily: 'Menlo', letterSpacing: 1 },

  card:        { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10 },
  insMetaRow:  { flexDirection: 'row', alignItems: 'flex-start' },
  insMetaName: { fontWeight: '800', color: C.text, fontSize: 14 },
  insMetaInfo: { color: C.muted, fontSize: 12, marginTop: 2 },
  insMetaTime: { color: C.muted, fontSize: 11, marginTop: 2 },
  insMetaCount:{ color: C.muted, fontSize: 11, marginTop: 2 },
  trailerReg:  { fontFamily: 'Menlo', fontWeight: '900', fontSize: 18, color: C.text },

  badge:        { borderRadius: 18, paddingHorizontal: 10, paddingVertical: 3 },
  badgeDone:    { backgroundColor: '#E8F5EC' },
  badgePend:    { backgroundColor: '#FFF3E0' },
  badgeTxt:     { fontSize: 11, fontWeight: '700' },
  badgeTxtDone: { color: C.success },
  badgeTxtPend: { color: C.orange },

  sectionLbl: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginTop: 6, marginBottom: 10 },
  photoGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  photoCell:  { width: '30%', aspectRatio: 1, borderRadius: 9, overflow: 'hidden', position: 'relative' },
  photoCellImg:   { width: '100%', height: '100%', resizeMode: 'cover' },
  photoCellEmpty: { backgroundColor: C.border, alignItems: 'center', justifyContent: 'center' },
  photoCellLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', padding: 4 },
  photoCellLabelTxt: { color: '#fff', fontSize: 8, fontWeight: '700' },
  photoCellMissing:  { backgroundColor: `${C.border}66`, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.border, borderStyle: 'dashed' },
  photoCellMissingTxt: { fontSize: 8, color: C.muted, marginTop: 3 },

  descBox: { backgroundColor: 'rgba(217,79,79,0.07)', borderRadius: 10, padding: 12, marginBottom: 14 },
  descLbl: { fontSize: 10, fontWeight: '700', color: C.danger, textTransform: 'uppercase', marginBottom: 5 },
  descTxt: { fontSize: 13, color: C.text, lineHeight: 20 },
  noData:  { color: C.muted, fontSize: 13, marginBottom: 14 },

  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon:{ fontSize: 36, marginBottom: 10 },
  emptyTxt: { color: C.muted, fontSize: 14 },
});

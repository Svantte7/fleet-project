// src/components/AppHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../utils/theme';

export default function AppHeader({ title, subtitle, onBack, rightLabel, onRight }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.side} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.side} />
        )}

        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        {onRight ? (
          <TouchableOpacity onPress={onRight} style={styles.side} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.side} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.navy,
    paddingBottom: 12,
    paddingHorizontal: 10,
  },
  row:    { flexDirection: 'row', alignItems: 'center' },
  side:   { width: 52, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
  back:   { color: '#fff', fontSize: 30, fontWeight: '300', marginTop: -2 },
  title:  { color: '#fff', fontSize: 16, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 1 },
  rightLabel: { color: C.orange, fontSize: 14, fontWeight: '700' },
});

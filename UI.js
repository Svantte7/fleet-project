// src/components/UI.js
import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Switch, Platform,
} from 'react-native';
import { C, shadow } from '../utils/theme';

// ── Button ─────────────────────────────────────────────────────────────────────
export function Btn({ label, onPress, variant = 'primary', disabled = false, loading = false, style }) {
  const bg = {
    primary: C.steel,
    orange:  C.orange,
    danger:  C.danger,
    success: C.success,
    ghost:   'transparent',
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.78}
      style={[
        styles.btn,
        { backgroundColor: bg },
        variant === 'ghost' && styles.btnGhost,
        (disabled || loading) && styles.btnDisabled,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'ghost' ? C.steel : '#fff'} size="small" />
        : <Text style={[styles.btnText, variant === 'ghost' && styles.btnTextGhost]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────
export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}
        style={[styles.card, shadow, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, shadow, style]}>{children}</View>;
}

// ── Field ──────────────────────────────────────────────────────────────────────
export function Field({ label, value, onChangeText, placeholder, secureTextEntry,
  keyboardType, mono, autoCapitalize = 'words', style }) {
  return (
    <View style={[styles.fieldWrap, style]}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={[styles.fieldInput, mono && styles.fieldMono]}
      />
    </View>
  );
}

// ── Section label ──────────────────────────────────────────────────────────────
export function SectionLabel({ text }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

// ── Toggle row ─────────────────────────────────────────────────────────────────
export function ToggleRow({ label, sub, value, onChange }) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sub && <Text style={styles.toggleSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: C.border, true: C.steel }}
        thumbColor="#fff"
        ios_backgroundColor={C.border}
      />
    </View>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
export function Empty({ icon, text }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────────
export function Badge({ label, color, bg }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 13, paddingVertical: 14, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5, borderColor: C.steel,
  },
  btnDisabled: { opacity: 0.4 },
  btnText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnTextGhost:{ color: C.steel },

  card: {
    backgroundColor: C.surface, borderRadius: 14,
    padding: 16, marginBottom: 12,
  },

  fieldWrap:   { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 5,
  },
  fieldInput: {
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 11, paddingVertical: 12, paddingHorizontal: 14,
    fontSize: 15, color: C.text, fontWeight: '500',
  },
  fieldMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1.5, textAlign: 'center', fontSize: 18, fontWeight: '700',
  },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 0.7,
    marginBottom: 10, marginTop: 4,
  },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 12, paddingBottom: 4,
  },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: C.text },
  toggleSub:   { fontSize: 11, color: C.muted, marginTop: 1 },

  empty:     { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: C.muted, fontSize: 14 },

  badge: { borderRadius: 18, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

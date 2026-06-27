// src/utils/theme.js
import { Platform } from 'react-native';

export const C = {
  navy:        '#1B2B3B',
  navyLight:   '#243B55',
  steel:       '#2D6A9F',
  steelLight:  '#3D80BF',
  orange:      '#E87B35',
  orangeLight: '#F5993A',
  bg:          '#F0F4F8',
  surface:     '#FFFFFF',
  border:      '#D0D9E2',
  muted:       '#6B7C8E',
  text:        '#1A2535',
  success:     '#2E9E6B',
  danger:      '#D94F4F',
};

export const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export const fmtTime = (d) =>
  new Date(d).toLocaleString('fi-FI', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const fmtReg = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const shadow = {
  shadowColor: '#1B2B3B',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

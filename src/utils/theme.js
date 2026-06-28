// src/utils/theme.js
export const C = {
  // Specto brand palette
  navy:        '#4B0000',   // very dark red (replaces navy)
  navyLight:   '#7B0000',   // dark maroon
  steel:       '#C41C1C',   // primary red
  steelLight:  '#D93030',   // lighter red
  orange:      '#C41C1C',   // CTA (same as primary)
  orangeLight: '#E02E2E',
  accent:      '#FCA5A5',   // light pink accent

  bg:      '#F8F7F4',   // warm off-white
  surface: '#FFFFFF',
  border:  '#FEE2E2',   // light red-tinted border
  muted:   '#9CA3AF',
  text:    '#2D0000',   // very dark red-tinted text

  success: '#2E9E6B',
  danger:  '#C41C1C',
};

export const fmtTime = (d) =>
  new Date(d).toLocaleString('fi-FI', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const fmtReg = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '');

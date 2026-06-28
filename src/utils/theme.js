// src/utils/theme.js
export const C = {
  // Specto brand palette — dark navy matching landing page
  navy:        '#0D1B2A',   // dark navy (background)
  navyLight:   '#1E3A5F',   // steel blue (header gradient)
  steel:       '#C41C1C',   // primary red CTA
  steelLight:  '#D93030',
  orange:      '#C41C1C',
  orangeLight: '#E02E2E',
  accent:      '#FCA5A5',   // light pink accent

  bg:      '#0D1B2A',   // dark navy
  surface: '#162236',   // card surface
  border:  'rgba(255,255,255,0.10)',
  muted:   '#8B9BB4',
  text:    '#F0EAE4',   // warm near-white

  success: '#2E9E6B',
  danger:  '#C41C1C',
};

export const fmtTime = (d) =>
  new Date(d).toLocaleString('fi-FI', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const fmtReg = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '');

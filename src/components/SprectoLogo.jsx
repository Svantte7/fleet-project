// src/components/SpectoLogo.jsx
// Inline SVG logo component extracted from specto_logo.svg

export function SpectoMark({ size = 48 }) {
  const s = size / 48;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <circle cx="48" cy="48" r="44" fill="#C41C1C"/>
      <circle cx="48" cy="48" r="33" fill="white"/>
      <circle cx="48" cy="48" r="25" fill="#C41C1C"/>
      <path d="M 31,48 C 37,36 59,36 65,48 C 59,60 37,60 31,48 Z" fill="white"/>
      <circle cx="48" cy="48" r="5" fill="#4B0000"/>
      <circle cx="51" cy="45" r="2" fill="white" opacity="0.8"/>
    </svg>
  );
}

export function SpectoMarkReversed({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <circle cx="48" cy="48" r="44" fill="white"/>
      <circle cx="48" cy="48" r="33" fill="#7B0000"/>
      <circle cx="48" cy="48" r="25" fill="white"/>
      <path d="M 31,48 C 37,36 59,36 65,48 C 59,60 37,60 31,48 Z" fill="#7B0000"/>
      <circle cx="48" cy="48" r="5" fill="white"/>
      <circle cx="51" cy="45" r="2" fill="#FCA5A5" opacity="0.85"/>
    </svg>
  );
}

export function SpectoWordmark({ dark = false, size = 36 }) {
  const color = dark ? '#7B0000' : 'white';
  const sub   = dark ? '#9CA3AF' : '#FCA5A5';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {dark ? <SpectoMark size={size} /> : <SpectoMarkReversed size={size} />}
      <div>
        <div style={{ fontWeight: 900, fontSize: size * 0.78, color, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Specto
        </div>
        <div style={{ fontSize: size * 0.28, letterSpacing: '0.18em', color: sub, textTransform: 'uppercase', marginTop: 2 }}>
          fleet inspection
        </div>
      </div>
    </div>
  );
}

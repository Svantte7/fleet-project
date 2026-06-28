// src/components/CameraModal.jsx
// Uses browser MediaDevices API (getUserMedia) — works in Chrome, Safari, Firefox.
// iOS Safari requires HTTPS or localhost.
import { useRef, useState, useEffect, useCallback } from 'react';
import { C } from '../utils/theme.js';

const GUIDE = {
  front:  { label: 'Keula',      hint: 'Kuvaa perävaunun keulasta', icon: '⬆️' },
  rear:   { label: 'Perä',       hint: 'Kuvaa perävaunun perästä',  icon: '⬇️' },
  left:   { label: 'Vasen sivu', hint: 'Kuvaa vasemmalta sivulta',  icon: '⬅️' },
  right:  { label: 'Oikea sivu', hint: 'Kuvaa oikealta sivulta',    icon: '➡️' },
  damage: { label: 'Vaurio',     hint: 'Kuvaa vaurio läheltä',      icon: '⚠️' },
};

export default function CameraModal({ sideKey, trailerReg, onPhoto, onClose, device }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const guide       = GUIDE[sideKey] ?? GUIDE.front;

  const [facingMode, setFacingMode]   = useState('environment'); // 'environment' = rear, 'user' = front
  const [torchOn,    setTorchOn]      = useState(false);
  const [status,     setStatus]       = useState('requesting'); // requesting | active | denied | error
  const [busy,       setBusy]         = useState(false);

  // ── Start camera stream ──────────────────────────────────────────────────────
  const startStream = useCallback(async (facing) => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStatus('requesting');
    try {
      const constraints = {
        video: {
          facingMode: { ideal: facing },
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('active');
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied');
      } else {
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    startStream(facingMode);
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [facingMode, startStream]);

  // ── Torch toggle ────────────────────────────────────────────────────────────
  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(t => !t);
    } catch { /* torch not supported */ }
  };

  // ── Take photo ───────────────────────────────────────────────────────────────
  const shoot = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || busy) return;
    setBusy(true);
    try {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onPhoto({ uri: dataUrl, takenAt: Date.now() });
    } finally {
      setBusy(false);
    }
  }, [busy, onPhoto]);

  // ── Pick from file (fallback / library) ─────────────────────────────────────
  const pickFile = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => onPhoto({ uri: ev.target.result, takenAt: Date.now() });
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  const overlay = {
    position: 'fixed', inset: 0, background: '#000', zIndex: 1000,
    display: 'flex', flexDirection: 'column',
  };

  if (status === 'denied') {
    return (
      <div style={overlay}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: C.navy }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>📷</div>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 12, textAlign: 'center' }}>Kameran käyttöoikeus evätty</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
            Salli kameran käyttö selaimen asetuksista tai osoitepalkin lukko-ikonista, ja lataa sivu uudelleen.
          </div>
          <button onClick={pickFile} style={{ background: C.orange, color: '#fff', border: 'none', borderRadius: 13, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12, width: '100%' }}>
            📁  Valitse kuva tiedostoista
          </button>
          <button onClick={onClose} style={{ background: 'none', border: `1.5px solid rgba(255,255,255,0.3)`, color: 'rgba(255,255,255,0.6)', borderRadius: 13, padding: '12px 28px', fontSize: 14, cursor: 'pointer', width: '100%' }}>
            Peruuta
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={overlay}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: C.navy }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>⚠️</div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Kamera ei ole käytettävissä</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
            Kameraa ei löydy tai se on jo käytössä toisessa sovelluksessa.
          </div>
          <button onClick={pickFile} style={{ background: C.orange, color: '#fff', border: 'none', borderRadius: 13, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12, width: '100%' }}>
            📁  Valitse kuva tiedostoista
          </button>
          <button onClick={onClose} style={{ background: 'none', border: `1.5px solid rgba(255,255,255,0.3)`, color: 'rgba(255,255,255,0.6)', borderRadius: 13, padding: '12px 28px', fontSize: 14, cursor: 'pointer', width: '100%' }}>
            Peruuta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Loading overlay */}
      {status === 'requesting' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: '#fff', fontSize: 40 }}>📷</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Käynnistetään kameraa...</div>
        </div>
      )}

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.55)',
        padding: device?.isPhone ? 'calc(10px + env(safe-area-inset-top)) 12px 10px' : '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>✕</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{guide.icon}  {guide.label}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2, fontFamily: 'monospace' }}>{trailerReg}</div>
        </div>
        <button onClick={toggleTorch} style={{ background: 'none', border: 'none', color: torchOn ? C.orange : '#fff', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}>
          {torchOn ? '⚡️' : '⚡️✕'}
        </button>
      </div>

      {/* Corner frame guides */}
      <div style={{ position: 'absolute', top: '24%', left: '8%', right: '8%', bottom: '24%', pointerEvents: 'none' }}>
        {[
          { top: 0, left: 0, borderTop: '3px solid #fff', borderLeft: '3px solid #fff' },
          { top: 0, right: 0, borderTop: '3px solid #fff', borderRight: '3px solid #fff' },
          { bottom: 0, left: 0, borderBottom: '3px solid #fff', borderLeft: '3px solid #fff' },
          { bottom: 0, right: 0, borderBottom: '3px solid #fff', borderRight: '3px solid #fff' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
        ))}
      </div>

      {/* Hint */}
      <div style={{ position: 'absolute', bottom: '28%', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <span style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.8)', fontSize: 13, padding: '5px 14px', borderRadius: 20 }}>{guide.hint}</span>
      </div>

      {/* Bottom controls */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.6)',
        padding: device?.isPhone ? '16px 18px calc(18px + env(safe-area-inset-bottom))' : '20px 24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      }}>
        {/* File picker */}
        <button onClick={pickFile} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: 28 }}>🖼️</div>
          <div style={{ fontSize: 10, marginTop: 4, color: 'rgba(255,255,255,0.7)' }}>Tiedosto</div>
        </button>

        {/* Shutter */}
        <button
          onClick={shoot}
          disabled={busy || status !== 'active'}
          style={{
            width: device?.isPhone ? 72 : 76, height: device?.isPhone ? 72 : 76, borderRadius: '50%',
            background: busy ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.25)',
            border: '4px solid #fff', cursor: busy ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: busy ? 'rgba(255,255,255,0.5)' : '#fff' }} />
        </button>

        {/* Flip camera */}
        <button
          onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'center' }}
        >
          <div style={{ fontSize: 28 }}>🔄</div>
          <div style={{ fontSize: 10, marginTop: 4, color: 'rgba(255,255,255,0.7)' }}>Käännä</div>
        </button>
      </div>
    </div>
  );
}

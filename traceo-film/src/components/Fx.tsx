import React from 'react';
import {Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, EASE, IN, OUT, POPPINS, fmtNum, ip, sp} from '../theme';

// ---------- Son ponctuel ----------
export type SfxName =
  | 'whoosh' | 'swish' | 'click' | 'tick' | 'pop' | 'impact' | 'riser' | 'success' | 'paper' | 'marker' | 'ring';
export const Sfx: React.FC<{at: number; name: SfxName; volume?: number}> = ({at, name, volume = 0.6}) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none" name={`sfx ${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

// ---------- Faux curseur ----------
// Déplacement en courbe, ralentit avant le clic, ripple orange au clic.
export const Cursor: React.FC<{
  keys: Array<{f: number; x: number; y: number}>;
  clicks?: number[];
  size?: number; // taille à l'écran compensée par le zoom caméra
  appear?: number;
  disappear?: number;
}> = ({keys, clicks = [], size = 1, appear, disappear}) => {
  const frame = useCurrentFrame();
  let x = keys[0].x, y = keys[0].y;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (frame > a.f) {
      const t = ip(frame, [a.f, b.f], [0, 1], EASE);
      const bend = Math.sin(Math.PI * t) * 0.18; // arc perpendiculaire
      x = a.x + (b.x - a.x) * t - (b.y - a.y) * bend;
      y = a.y + (b.y - a.y) * t + (b.x - a.x) * bend;
    }
  }
  const op = (appear == null ? 1 : ip(frame, [appear, appear + 6], [0, 1], OUT)) * (disappear == null ? 1 : ip(frame, [disappear, disappear + 6], [1, 0], IN));
  let press = 1;
  for (const c of clicks) {
    const p = ip(frame, [c - 2, c + 6], [0, 1], (t) => t);
    if (p > 0 && p < 1) press = 1 - 0.18 * Math.sin(Math.PI * p);
  }
  return (
    <>
      {clicks.map((c) => {
        const p = ip(frame, [c, c + 16], [0, 1], OUT);
        if (frame < c || p >= 1) return null;
        return (
          <div
            key={c}
            style={{
              position: 'absolute',
              left: x - 46 * size * p,
              top: y - 46 * size * p,
              width: 92 * size * p,
              height: 92 * size * p,
              borderRadius: '50%',
              border: `${3 * size}px solid ${C.orange}`,
              background: 'rgba(242,107,29,0.18)',
              opacity: 1 - p,
            }}
          />
        );
      })}
      <svg
        width={30 * size}
        height={38 * size}
        viewBox="0 0 30 38"
        style={{position: 'absolute', left: x - 3 * size, top: y - 2 * size, opacity: op, transform: `scale(${press})`, transformOrigin: '3px 2px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))'}}
      >
        <path d="M3 2 L3 30 L10 23.5 L15 35 L20 33 L15 21.5 L25 21.5 Z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </>
  );
};

// ---------- Carte flottante avec compteur ----------
export const Counter: React.FC<{
  start: number;
  value: number;
  decimals?: number;
  suffix?: string;
  dur?: number;
}> = ({start, value, decimals = 2, suffix = '', dur = 36}) => {
  const frame = useCurrentFrame();
  const v = ip(frame, [start, start + dur], [0, value], OUT);
  return (
    <span style={{fontVariantNumeric: 'tabular-nums'}}>
      {fmtNum(v, decimals)}
      {suffix}
    </span>
  );
};
export const counterTicks = (start: number, dur = 36, every = 3) =>
  Array.from({length: Math.floor(dur / every)}, (_, i) => <Sfx key={i} at={start + i * every} name="tick" volume={0.18} />);

export const Callout: React.FC<{
  x: number;
  y: number;
  start: number;
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  end?: number;
  accent?: string;
  width?: number;
  size?: number;
}> = ({x, y, start, label, value, decimals = 2, suffix = '', end, accent = C.orange, width = 520, size = 84}) => {
  const frame = useCurrentFrame();
  const k = sp(frame, start, {damping: 15, stiffness: 120});
  const out = end == null ? 0 : ip(frame, [end, end + 10], [0, 1], IN);
  if (frame < start) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        padding: '28px 36px 32px',
        borderRadius: 24,
        background: '#fff',
        boxShadow: '0 30px 70px rgba(0,0,0,0.35)',
        transform: `translateY(${(1 - k) * 60 - out * 40}px) scale(${0.9 + 0.1 * k})`,
        opacity: Math.min(1, k * 1.5) * (1 - out),
        fontFamily: POPPINS,
        borderLeft: `8px solid ${accent}`,
      }}
    >
      <div style={{fontSize: 22, fontWeight: 600, color: C.grey, textTransform: 'uppercase', letterSpacing: '0.08em'}}>{label}</div>
      <div style={{fontSize: size, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 6}}>
        <Counter start={start + 4} value={value} decimals={decimals} suffix={suffix} />
      </div>
    </div>
  );
};

// ---------- Badge permanent sur les plans d'interface ----------
export const DemoBadge: React.FC<{start?: number; dark?: boolean; right?: number; bottom?: number}> = ({start = 0, dark = true, right = 80, bottom = 56}) => {
  const frame = useCurrentFrame();
  const a = ip(frame, [start + 6, start + 18], [0, 1], OUT);
  return (
    <div
      style={{
        position: 'absolute',
        right,
        bottom,
        fontFamily: POPPINS,
        fontSize: 18,
        fontWeight: 600,
        color: dark ? 'rgba(255,255,255,0.7)' : C.grey,
        padding: '8px 16px',
        borderRadius: 999,
        border: `1px solid ${dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'}`,
        background: dark ? 'rgba(20,22,27,0.82)' : 'rgba(255,255,255,0.6)',
        opacity: a,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span style={{width: 8, height: 8, borderRadius: 4, background: C.orange}} />
      Mode démo · données fictives
    </div>
  );
};

// ---------- Logo officiel (PNG fourni par le site), construit à partir de ses propres calques ----------
export const LogoIcon: React.FC<{size: number; build?: {base: number; bar: number; diag: number; dot: number}; style?: React.CSSProperties}> = ({
  size,
  build,
  style,
}) => {
  const b = build ?? {base: 1, bar: 1, diag: 1, dot: 1};
  const L = (src: string, st: React.CSSProperties) => (
    <Img src={staticFile(`logo/${src}`)} style={{position: 'absolute', inset: 0, width: size, height: size, ...st}} />
  );
  const full = b.base >= 1 && b.bar >= 1 && b.diag >= 1 && b.dot >= 1;
  return (
    <div style={{position: 'relative', width: size, height: size, ...style}}>
      {full ? (
        L('traceo-logo.png', {})
      ) : (
        <>
          {L('part-base.png', {transform: `scale(${b.base})`, opacity: Math.min(1, b.base * 2)})}
          {/* la barre se dessine de gauche à droite */}
          {L('part-bar.png', {clipPath: `inset(0 ${(1 - b.bar) * 100}% 0 0)`})}
          {/* la diagonale tombe */}
          {L('part-diag.png', {transform: `translate(${(1 - b.diag) * size * 0.12}px, ${-(1 - b.diag) * size * 0.45}px)`, opacity: Math.min(1, b.diag * 3), clipPath: 'inset(0 0 0 0 round 22%)'})}
          {/* le point « pop » */}
          {L('part-dot.png', {transform: `scale(${b.dot})`, transformOrigin: `${(176 / 263) * 100}% ${(182 / 263) * 100}%`})}
        </>
      )}
    </div>
  );
};

export const Wordmark: React.FC<{size: number; color?: string; sub?: boolean; reveal?: number; subOpacity?: number}> = ({
  size,
  color = '#fff',
  sub = true,
  reveal = 1,
  subOpacity = 1,
}) => {
  const letters = 'Tracéo'.split('');
  return (
    <div style={{fontFamily: POPPINS, color}}>
      <div style={{fontSize: size, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, display: 'flex'}}>
        {letters.map((l, i) => {
          const p = Math.max(0, Math.min(1, reveal * letters.length - i));
          const e = OUT(p);
          return (
            <span key={i} style={{display: 'inline-block', opacity: e, transform: `translateY(${(1 - e) * size * 0.35}px)`, filter: `blur(${(1 - e) * 8}px)`}}>
              {l}
            </span>
          );
        })}
      </div>
      {sub ? (
        <div style={{display: 'flex', alignItems: 'center', gap: size * 0.12, marginTop: size * 0.12, opacity: subOpacity}}>
          <span style={{width: size * 0.28, height: Math.max(3, size * 0.045), background: C.orange, borderRadius: 4}} />
          <span style={{fontSize: size * 0.2, fontWeight: 600, letterSpacing: '0.18em', color: color === '#fff' ? 'rgba(255,255,255,0.75)' : C.grey}}>BY NODEVA</span>
        </div>
      ) : null}
    </div>
  );
};

// ---------- Téléphone 3D ----------
export const Phone: React.FC<{
  src: string;
  srcH: number; // hauteur CSS de la capture (390 de large)
  scroll?: number;
  w?: number;
  ry?: number;
  rx?: number;
  children?: React.ReactNode;
  next?: {src: string; srcH: number; opacity: number};
}> = ({src, srcH, scroll = 0, w = 420, ry = 0, rx = 0, children, next}) => {
  const h = w * (844 / 390);
  const bez = w * 0.05;
  const s = (w - bez * 2) / 390;
  return (
    <div style={{width: w, height: h, transform: `perspective(1800px) rotateY(${ry}deg) rotateX(${rx}deg)`, transformStyle: 'preserve-3d'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: w * 0.16,
          background: 'linear-gradient(145deg, #2a2d34, #0c0d10)',
          boxShadow: `0 50px 90px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.12), ${-ry * 0.6}px 0 0 #050506`,
        }}
      />
      <div style={{position: 'absolute', left: bez, top: bez, width: w - bez * 2, height: h - bez * 2, borderRadius: w * 0.12, overflow: 'hidden', background: '#F5F6F8'}}>
        <div style={{position: 'absolute', left: 0, top: -scroll * s, width: 390, height: srcH, transform: `scale(${s})`, transformOrigin: '0 0'}}>
          <Img src={staticFile(`captures/${src}.png`)} style={{width: 390, height: srcH}} />
          {children}
        </div>
        {next && next.opacity > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: next.opacity}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 390, height: next.srcH, transform: `scale(${s})`, transformOrigin: '0 0'}}>
              <Img src={staticFile(`captures/${next.src}.png`)} style={{width: 390, height: next.srcH}} />
            </div>
          </div>
        ) : null}
        {/* reflet */}
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${110 + ry}deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0) 60%)`}} />
      </div>
      {/* îlot caméra */}
      <div style={{position: 'absolute', left: w / 2 - w * 0.14, top: bez + w * 0.03, width: w * 0.28, height: w * 0.075, borderRadius: 99, background: '#000'}} />
    </div>
  );
};

export const ease = {EASE, OUT, IN};

import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import caps from '../captures.json';
import {C, EASE, IN, OUT, ip, sp} from '../theme';

export type Rect = {x: number; y: number; w: number; h: number};
export type Cam = {x: number; y: number; zoom: number};
type CapName = keyof typeof caps;

export const capSize = (name: string) => (caps as Record<string, {w: number; h: number}>)[name];
export const capSrc = (name: string) => staticFile(`captures/${name}.png`);

// Interpole une caméra entre des clés {f, x, y, zoom}, avec easing de caméra
export const camAt = (frame: number, keys: Array<{f: number} & Cam>, easing = EASE): Cam => {
  if (frame <= keys[0].f) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    if (frame <= keys[i].f) {
      const a = keys[i - 1], b = keys[i];
      const t = ip(frame, [a.f, b.f], [0, 1], easing);
      // le zoom s'interpole en log pour une vitesse perçue constante
      const z = Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * t);
      return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, zoom: z};
    }
  }
  return keys[keys.length - 1];
};

// Capture posée sur un plan 3D, vue par une caméra virtuelle.
// Les enfants sont dessinés dans le repère de la capture (px CSS) et suivent donc la caméra.
export const Screen: React.FC<{
  name: CapName | string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  cam: Cam;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
  opacity?: number;
  radius?: number;
  overlay?: {name: string; opacity: number}; // fondu vers un autre état de la même page
  children?: React.ReactNode;
}> = ({name, cx, cy, w, h, cam, rx = 0, ry = 0, rz = 0, scale = 1, opacity = 1, radius = 22, overlay, children}) => {
  const size = capSize(name);
  const s = (w / 1920) * cam.zoom;
  const tx = w / 2 - cam.x * s;
  const ty = h / 2 - cam.y * s;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        transform: `perspective(2000px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,
        transformStyle: 'preserve-3d',
        opacity,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          overflow: 'hidden',
          background: C.appBg,
          boxShadow: '0 40px 90px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.25)',
          outline: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 1920,
            height: size.h,
            transformOrigin: '0 0',
            transform: `translate(${tx}px, ${ty}px) scale(${s})`,
          }}
        >
          <Img src={capSrc(name)} style={{width: 1920, height: size.h, display: 'block'}} />
          {overlay && overlay.opacity > 0 ? (
            <Img
              src={capSrc(overlay.name)}
              style={{position: 'absolute', left: 0, top: 0, width: 1920, height: capSize(overlay.name).h, opacity: overlay.opacity}}
            />
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
};

// Redressement 3D « face caméra » + push-in lent sur toute la durée du plan
export const useScreenIntro = (frame: number, dur: number, from = {rx: 12, ry: -18}, delay = 0) => {
  const k = sp(frame, delay);
  return {
    rx: from.rx * (1 - k),
    ry: from.ry * (1 - k),
    scale: (0.86 + 0.14 * k) * ip(frame, [0, dur], [1, 1.04], (t) => t),
    opacity: ip(frame, [delay, delay + 8], [0, 1], OUT),
  };
};

// Assombrit tout sauf une zone, contour orange qui se dessine (stroke-dashoffset)
export const Spotlight: React.FC<{rect: Rect; start: number; end?: number; pad?: number; dim?: number; stroke?: number; color?: string}> = ({
  rect,
  start,
  end,
  pad = 10,
  dim = 0.55,
  stroke = 3,
  color = C.orange,
}) => {
  const frame = useCurrentFrame();
  const a = ip(frame, [start, start + 12], [0, 1], OUT) * (end == null ? 1 : ip(frame, [end, end + 10], [1, 0], IN));
  if (a <= 0) return null;
  const draw = ip(frame, [start + 4, start + 26], [0, 1], EASE);
  const x = rect.x - pad, y = rect.y - pad, w = rect.w + pad * 2, h = rect.h + pad * 2;
  const r = 14;
  const per = 2 * (w + h);
  return (
    <svg style={{position: 'absolute', left: -4000, top: -4000, width: 10000, height: 10000, overflow: 'visible'}} viewBox="-4000 -4000 10000 10000">
      <defs>
        <mask id={`m${start}`}>
          <rect x={-4000} y={-4000} width={10000} height={10000} fill="white" />
          <rect x={x} y={y} width={w} height={h} rx={r} fill="black" />
        </mask>
      </defs>
      <rect x={-4000} y={-4000} width={10000} height={10000} fill={`rgba(0,0,0,${dim})`} mask={`url(#m${start})`} opacity={a} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={per}
        strokeDashoffset={per * (1 - draw)}
        opacity={a}
        style={{filter: `drop-shadow(0 0 ${8}px rgba(242,107,29,0.7))`}}
      />
    </svg>
  );
};

// Une zone de la capture qui « saute » (rebond de bouton, arrivée en cascade)
export const Pop: React.FC<{
  name: string;
  rect: Rect;
  at: number;
  mode?: 'bounce' | 'enter';
  cover?: string; // couleur qui masque la zone d'origine avant l'arrivée
}> = ({name, rect, at, mode = 'bounce', cover}) => {
  const frame = useCurrentFrame();
  const size = capSize(name);
  let transform = '';
  let opacity = 1;
  if (mode === 'bounce') {
    const p = ip(frame, [at, at + 10], [0, 1], (t) => t);
    const k = Math.sin(Math.PI * p) * (1 - p * 0.3);
    transform = `scale(${1 - 0.07 * k})`;
  } else {
      const k = sp(frame, at, {damping: 14, stiffness: 120});
    transform = `translateY(${40 * (1 - k)}px) scale(${0.9 + 0.1 * k})`;
    opacity = ip(frame, [at, at + 6], [0, 1], OUT);
  }
  return (
    <>
      {cover && mode === 'enter' && frame >= at ? (
        <div style={{position: 'absolute', left: rect.x - 4, top: rect.y - 4, width: rect.w + 8, height: rect.h + 8, background: cover}} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          overflow: 'hidden',
          borderRadius: 12,
          transform,
          opacity,
          boxShadow: mode === 'enter' ? `0 ${12 * opacity}px 30px rgba(0,0,0,${0.12 * opacity})` : undefined,
        }}
      >
        <Img src={capSrc(name)} style={{position: 'absolute', left: -rect.x, top: -rect.y, width: 1920, height: size.h}} />
      </div>
    </>
  );
};

import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame, useVideoConfig} from 'remotion';
import extra from '../boxes-extra.json';
import {Backdrop} from '../components/Backdrop';
import {LogoIcon, Phone, Sfx, Wordmark} from '../components/Fx';
import {Kinetic} from '../components/Kinetic';
import {capSize, capSrc} from '../components/Screen';
import {C, EASE, IN, OUT, POPPINS, ip, sp} from '../theme';

// Appui au doigt (ripple orange) dans le repère de la capture mobile
const Tap: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const frame = useCurrentFrame();
  const p = ip(frame, [at, at + 16], [0, 1], OUT);
  if (frame < at - 6 || p >= 1) return null;
  const pre = ip(frame, [at - 6, at], [0, 1], OUT);
  return (
    <>
      <div style={{position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: 'rgba(26,29,35,0.25)', opacity: frame < at ? pre : 1 - p, transform: `scale(${frame < at ? 0.6 + 0.4 * pre : 1})`}} />
      {frame >= at ? (
        <div style={{position: 'absolute', left: x - 50 * p, top: y - 50 * p, width: 100 * p, height: 100 * p, borderRadius: '50%', border: `3px solid ${C.orange}`, opacity: 1 - p}} />
      ) : null}
    </>
  );
};

// Signature au doigt qui se dessine dans le cadre « Signature transporteur »
const Signature: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const c = extra.signature_canvas;
  const p = ip(frame, [at, at + 34], [0, 1], EASE);
  const d =
    'M 30 120 C 45 60, 70 50, 72 95 C 74 140, 52 150, 60 112 C 70 70, 105 60, 112 104 C 116 130, 104 140, 118 118 C 132 96, 140 92, 150 112 C 158 128, 166 126, 176 104 C 184 88, 196 90, 198 108 C 200 124, 214 126, 230 104 C 240 92, 256 96, 280 92';
  return (
    <svg style={{position: 'absolute', left: c.x, top: c.y, overflow: 'visible'}} width={c.w} height={c.h} viewBox={`0 0 ${310} ${192}`}>
      <path d={d} fill="none" stroke="#1A1D23" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};

// =====================================================================
// 9 — Appli chauffeur
// =====================================================================
export const S09Chauffeur: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const T = {tapBsd: 46, sig: 70, valider: 112, tournee: 124, photo: 168};
  // tour complet sur lui-même à l'entrée, puis léger balancement
  const spin = ip(frame, [0, 44], [-380, -16], OUT);
  const sway = Math.sin(frame / 34) * 5;
  const ry = frame < 44 ? spin : -16 + sway * ip(frame, [44, 70], [0, 1], EASE);
  const phoneW = portrait ? 520 : 400;
  // écrans successifs
  let src = 'chauffeur-1-accueil', srcH = 844, scroll = 0;
  let next: {src: string; srcH: number; opacity: number} | undefined;
  if (frame >= T.tapBsd + 6) {
    src = 'chauffeur-5-bsd-detail'; srcH = capSize(src).h; scroll = ip(frame, [T.tapBsd + 14, T.sig - 4], [0, srcH - 844], EASE);
  }
  if (frame >= T.tournee) {
    next = undefined; src = 'chauffeur-2-tournee'; srcH = capSize(src).h; scroll = 0;
  }
  const fadeIn = (at: number) => ip(frame, [at, at + 8], [0, 1], OUT);
  const fresh = frame >= T.tournee ? fadeIn(T.tournee) : frame >= T.tapBsd + 6 ? fadeIn(T.tapBsd + 6) : 1;
  const k = sp(frame, 0, {damping: 16, stiffness: 80});
  const back = Math.cos((ry * Math.PI) / 180) < 0;
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: portrait ? 0.5 : 0.7, y: portrait ? 0.62 : 0.5, size: 0.8, opacity: 0.3}} />
      <div style={{position: 'absolute', left: portrait ? 80 : 150, right: portrait ? 80 : undefined, top: portrait ? 230 : 330, width: portrait ? undefined : 760}}>
        <Kinetic text="Le chauffeur valide tout depuis son téléphone." keywords={['téléphone.']} start={8} exit={196} size={portrait ? 76 : 80} align={portrait ? 'center' : 'left'} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: (portrait ? width / 2 : 1340) - phoneW / 2,
          top: (portrait ? height * 0.6 : 540) - (phoneW * 844) / 390 / 2,
          transform: `translateY(${(1 - k) * 200}px) scale(${0.9 + 0.1 * k})`,
          opacity: Math.min(1, k * 2),
        }}
      >
        {back ? (
          <div style={{width: phoneW, height: (phoneW * 844) / 390, transform: `perspective(1800px) rotateY(${ry + 180}deg)`}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: phoneW * 0.16, background: 'linear-gradient(145deg,#2a2d34,#0c0d10)', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.12)'}} />
            <div style={{position: 'absolute', left: phoneW / 2 - 50, top: phoneW, opacity: 0.9}}>
              <LogoIcon size={100} />
            </div>
          </div>
        ) : (
          <Phone src={src} srcH={srcH} scroll={scroll} w={phoneW} ry={ry} next={next}>
            <div style={{position: 'absolute', inset: 0, background: '#F5F6F8', opacity: 1 - fresh}} />
            {frame < T.tapBsd + 6 ? <Tap x={195} y={291} at={T.tapBsd} /> : null}
            {frame >= T.tapBsd + 6 && frame < T.tournee ? (
              <>
                <Signature at={T.sig} />
                <Tap x={195} y={extra.signature_page_h - 86} at={T.valider} />
              </>
            ) : null}
            {frame >= T.tournee ? <Tap x={128} y={384} at={T.photo} /> : null}
          </Phone>
        )}
      </div>
      <Sfx at={2} name="whoosh" volume={0.45} />
      <Sfx at={T.tapBsd} name="click" volume={0.6} />
      <Sfx at={T.sig} name="marker" volume={0.35} />
      <Sfx at={T.sig + 14} name="marker" volume={0.3} />
      <Sfx at={T.valider} name="click" volume={0.6} />
      <Sfx at={T.valider + 4} name="success" volume={0.45} />
      <Sfx at={T.photo} name="click" volume={0.7} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 10 — Mosaïque des autres écrans, reliés entre eux
// =====================================================================
const TILES: Array<[string, string]> = [
  ['flotte', 'Flotte'],
  ['consommation', 'Consommation'],
  ['administratif', 'Administratif'],
  ['sous-traitance', 'Sous-traitance'],
  ['relances', 'Relances'],
  ['bennes', 'Bennes'],
  ['portail', 'Portail client'],
  ['analyse-ia', 'Analyse IA'],
  ['comptabilite', 'Compta & drive'],
];
export const S10Mosaique: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames: D} = useVideoConfig();
  const portrait = height > width;
  const tw = 560, th = 315, gap = 44;
  const gw = tw * 3 + gap * 2, gh = th * 3 + gap * 2;
  const glide = ip(frame, [0, D], [-70, 70], (t) => t);
  const dive = Math.exp(ip(frame, [D - 40, D], [0, Math.log(7)], IN));
  const fit = portrait ? 0.56 : 0.7;
  const centers = TILES.map((_, i) => ({x: (i % 3) * (tw + gap) + tw / 2, y: Math.floor(i / 3) * (th + gap) + th / 2}));
  const links = [
    [0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5], [3, 6], [6, 7], [7, 8], [5, 8], [4, 7], [1, 4],
  ];
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: 0.55, size: 1.1, opacity: 0.22}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 2400}}>
        <div
          style={{
            width: gw,
            height: gh,
            position: 'relative',
            transform: `translateY(${portrait ? 120 : 50}px) scale(${fit * dive}) rotateX(${22 * (1 - ip(frame, [D - 40, D], [0, 1], IN))}deg) rotateZ(-7deg) translateX(${glide}px)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width={gw} height={gh}>
            {links.map(([a, b], i) => {
              const p = ip(frame, [64 + i * 3, 84 + i * 3], [0, 1], EASE);
              return (
                <line
                  key={i}
                  x1={centers[a].x}
                  y1={centers[a].y}
                  x2={centers[a].x + (centers[b].x - centers[a].x) * p}
                  y2={centers[a].y + (centers[b].y - centers[a].y) * p}
                  stroke={C.orange}
                  strokeWidth={6}
                  strokeLinecap="round"
                  opacity={p > 0 ? 0.9 : 0}
                  style={{filter: 'drop-shadow(0 0 10px rgba(242,107,29,0.8))'}}
                />
              );
            })}
          </svg>
          {TILES.map(([name, label], i) => {
            const row = Math.floor(i / 3), col = i % 3;
            const k = sp(frame, 6 + (row + col) * 5, {damping: 15, stiffness: 110});
            const lit = ip(frame, [70 + i * 3, 80 + i * 3], [0, 1], OUT);
            return (
              <div
                key={name}
                style={{
                  position: 'absolute',
                  left: col * (tw + gap),
                  top: row * (th + gap),
                  width: tw,
                  height: th,
                  borderRadius: 18,
                  overflow: 'hidden',
                  background: C.appBg,
                  transform: `translateZ(${(1 - k) * -400}px) scale(${0.85 + 0.15 * k})`,
                  opacity: Math.min(1, k * 1.4),
                  boxShadow: `0 30px 60px rgba(0,0,0,0.45), 0 0 0 ${3 * lit}px ${C.orange}`,
                }}
              >
                <Img src={capSrc(name)} style={{width: tw, height: (capSize(name).h * tw) / 1920}} />
                <div
                  style={{
                    position: 'absolute',
                    left: 16,
                    bottom: 16,
                    padding: '8px 16px',
                    borderRadius: 999,
                    background: C.night,
                    color: '#fff',
                    fontFamily: POPPINS,
                    fontWeight: 600,
                    fontSize: 22,
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
          {centers.map((c, i) => {
            const p = ip(frame, [66 + i * 3, 76 + i * 3], [0, 1], OUT);
            return p > 0 ? (
              <div key={i} style={{position: 'absolute', left: c.x - 12, top: c.y - 12, width: 24, height: 24, borderRadius: 12, background: C.orange, transform: `scale(${p})`, boxShadow: '0 0 0 6px rgba(242,107,29,0.3)'}} />
            ) : null;
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,22,27,0.95) 0%, rgba(20,22,27,0) 26%)'}} />
      <div style={{position: 'absolute', left: 100, right: 100, top: portrait ? 230 : 60}}>
        <Kinetic text="Flotte, conformité, sous-traitance, relances… tout est relié." keywords={['relié.']} start={10} exit={D - 46} size={portrait ? 68 : 52} align="center" stagger={3} />
      </div>
      <AbsoluteFill style={{background: C.night, opacity: ip(frame, [D - 14, D], [0, 1], IN)}} />
      <Sfx at={4} name="whoosh" volume={0.4} />
      {Array.from({length: 5}, (_, i) => (
        <Sfx key={i} at={8 + i * 5} name="pop" volume={0.18} />
      ))}
      <Sfx at={64} name="swish" volume={0.4} />
      <Sfx at={D - 44} name="riser" volume={0.45} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 11 — Bénéfices (sans aucun chiffre inventé)
// =====================================================================
const BENEFITS: Array<{text: string; kw: string[]}> = [
  {text: 'Moins d’admin.', kw: ['admin.']},
  {text: 'Plus de marge.', kw: ['marge.']},
  {text: 'Zéro document perdu.', kw: ['Zéro']},
];
export const S11Benefices: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const seg = 70;
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: 0.5, size: 0.9, opacity: 0.3}} />
      {BENEFITS.map((b, i) => {
        const s0 = i * seg;
        if (frame < s0 - 2 || frame > s0 + seg + 2) return null;
        const bar = ip(frame, [s0 + 10, s0 + 28], [0, 1], EASE) * ip(frame, [s0 + seg - 12, s0 + seg - 2], [1, 0], IN);
        return (
          <AbsoluteFill key={i} style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <div style={{fontFamily: POPPINS, fontWeight: 600, fontSize: 28, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.55)', marginBottom: 24, opacity: ip(frame, [s0 + 2, s0 + 12], [0, 1], OUT) * ip(frame, [s0 + seg - 10, s0 + seg - 2], [1, 0], IN)}}>
              0{i + 1}
            </div>
            <Kinetic text={b.text} keywords={b.kw} start={s0 + 2} exit={s0 + seg - 12} size={portrait ? 120 : 150} align="center" stagger={5} maxWidth={portrait ? 900 : 1600} />
            <div style={{marginTop: 36, height: 10, width: 360 * bar, borderRadius: 5, background: C.orange}} />
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{background: C.night, opacity: ip(frame, [0, 8], [1, 0], OUT)}} />
      {BENEFITS.map((_, i) => (
        <Sfx key={i} at={i * seg + 2} name="whoosh" volume={0.4} />
      ))}
    </AbsoluteFill>
  );
};

// =====================================================================
// 12 — Packshot final
// =====================================================================
export const S12Packshot: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames: D} = useVideoConfig();
  const portrait = height > width;
  const k = sp(frame, 4, {damping: 12, stiffness: 120});
  const words = ['Gérer.', 'Suivre.', 'Optimiser.'];
  const cta = sp(frame, 92, {damping: 14, stiffness: 120});
  return (
    <AbsoluteFill>
      <Backdrop variant="paper" halo={{x: 0.5, y: 0.42, size: 0.8, opacity: 0.16}} grain={0.035} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', transform: `scale(${ip(frame, [0, D], [1, 1.04], (t) => t)})`}}>
        <div style={{display: 'flex', alignItems: 'center', flexDirection: portrait ? 'column' : 'row', gap: portrait ? 30 : 40, transform: `scale(${0.85 + 0.15 * k})`, opacity: Math.min(1, k * 2)}}>
          <LogoIcon size={portrait ? 220 : 180} />
          <Wordmark size={portrait ? 140 : 130} color={C.ink} reveal={ip(frame, [10, 34], [0, 1], (t) => t)} subOpacity={ip(frame, [30, 42], [0, 1], OUT)} />
        </div>
        <div style={{display: 'flex', gap: 26, marginTop: 70, fontFamily: POPPINS, fontWeight: 600, fontSize: portrait ? 64 : 58, color: C.ink, flexDirection: portrait ? 'column' : 'row', alignItems: 'center'}}>
          {words.map((w, i) => {
            const p = ip(frame, [48 + i * 8, 64 + i * 8], [0, 1], OUT);
            return (
              <span key={w} style={{opacity: p, transform: `translateY(${(1 - p) * 40}px)`, filter: `blur(${(1 - p) * 8}px)`}}>
                {w.slice(0, -1)}
                <span style={{color: C.orange}}>.</span>
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 60,
            padding: '22px 44px',
            borderRadius: 999,
            background: C.orange,
            color: '#fff',
            fontFamily: POPPINS,
            fontWeight: 600,
            fontSize: portrait ? 36 : 34,
            transform: `scale(${0.8 + 0.2 * cta})`,
            opacity: Math.min(1, cta * 2),
            boxShadow: '0 20px 40px rgba(242,107,29,0.35)',
            textAlign: 'center',
          }}
        >
          Demandez votre démo : contact@nodeva.fr
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: C.night, opacity: ip(frame, [D - 24, D], [0, 1], EASE)}} />
      <Sfx at={4} name="impact" volume={0.7} />
      <Sfx at={48} name="swish" volume={0.3} />
      <Sfx at={92} name="pop" volume={0.45} />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {Backdrop} from '../components/Backdrop';
import {LogoIcon, Sfx} from '../components/Fx';
import {Kinetic} from '../components/Kinetic';
import {PILE, PhoneCard} from '../components/PaperCards';
import {C, EASE, IN, OUT, ip, sp} from '../theme';

// arrivées des cartes (scène 2)
const ARRIVE = [24, 100, 150, 200];
const FROM = [
  {x: 2400, y: -300, r: -60},
  {x: 2300, y: 1300, r: 70},
  {x: 900, y: 1500, r: -40},
  {x: 2500, y: 500, r: 90},
];

// trait orange qui barre la carte
const Strike: React.FC<{w: number; h: number; at: number}> = ({w, h, at}) => {
  const frame = useCurrentFrame();
  const p = ip(frame, [at, at + 10], [0, 1], EASE);
  if (p <= 0) return null;
  const len = Math.hypot(w, h * 0.5) + 40;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={w} height={h}>
      <path
        d={`M ${-20} ${h * 0.68} L ${w + 20} ${h * 0.3}`}
        stroke={C.orange}
        strokeWidth={16}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
        style={{filter: 'drop-shadow(0 4px 10px rgba(242,107,29,0.45))'}}
      />
    </svg>
  );
};

export const Pile: React.FC<{mode: 'arrive' | 'still' | 'suck'; suckStart?: number; target?: {x: number; y: number}}> = ({mode, suckStart = 0, target}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {PILE.map((c, i) => {
        let x: number = c.x, y: number = c.y, r: number = c.r, s = 1, op = 1;
        if (mode === 'arrive') {
          const k = sp(frame, ARRIVE[i], {damping: 16, stiffness: 110});
          x = FROM[i].x + (c.x - FROM[i].x) * k;
          y = FROM[i].y + (c.y - FROM[i].y) * k;
          r = FROM[i].r + (c.r - FROM[i].r) * k;
          op = frame >= ARRIVE[i] ? 1 : 0;
        }
        if (mode === 'suck' && target) {
          const d = suckStart + i * 6;
          const t = ip(frame, [d, d + 26], [0, 1], IN);
          x = c.x + (target.x - c.x) * t;
          y = c.y + (target.y - c.y) * t;
          r = c.r + 220 * t * (i % 2 ? 1 : -1);
          s = 1 - t;
          op = t >= 1 ? 0 : 1;
        }
        const strikeAt = mode === 'arrive' ? ARRIVE[i] + 24 : -100;
        return (
          <div
            key={c.key}
            style={{
              position: 'absolute',
              left: x - c.w / 2,
              top: y - c.h / 2,
              width: c.w,
              height: c.h,
              transform: `rotate(${r}deg) scale(${s})`,
              opacity: op,
              filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.45))',
            }}
          >
            {c.key === 'phone' ? <PhoneCard ringT={mode === 'arrive' ? frame - ARRIVE[3] : 0} /> : c.el}
            <Strike w={c.w} h={c.h} at={strikeAt} />
          </div>
        );
      })}
    </>
  );
};

// Plateau 1920×1080 : tel quel en 16:9 ; en vertical ou en carré, la pile est recentrée sous le texte
const FOCUS = {x: 1440, y: 600};
const useStage = () => {
  const {width, height} = useVideoConfig();
  if (width / height > 1.5) return {landscape: true, portrait: false, transform: `scale(${width / 1920})`};
  const portrait = height > width;
  const k = portrait ? 1.12 : 0.78;
  const to = portrait ? {x: 540, y: 1180} : {x: 540, y: 650};
  return {landscape: false, portrait, transform: `translate(${to.x - FOCUS.x * k}px, ${to.y - FOCUS.y * k}px) scale(${k})`};
};
const TextBlock: React.FC<{landscape: boolean; portrait: boolean; children: React.ReactNode}> = ({landscape, portrait, children}) => (
  <div style={landscape ? {position: 'absolute', left: 130, top: 330, width: 900} : {position: 'absolute', left: 80, right: 80, top: portrait ? 260 : 70}}>{children}</div>
);

// 2 — Le problème
export const S02Probleme: React.FC = () => {
  const st = useStage();
  const size = st.landscape ? 80 : st.portrait ? 78 : 56;
  const lines = (
    <>
      <Kinetic text="Des BSD partout." start={14} exit={282} keywords={['BSD']} size={size} />
      <Kinetic text="Des tickets perdus." start={92} exit={284} keywords={['perdus.']} size={size} style={{marginTop: size * 0.22}} />
      <Kinetic text="Des voyages oubliés." start={172} exit={286} keywords={['oubliés.']} size={size} style={{marginTop: size * 0.22}} />
    </>
  );
  return (
    <AbsoluteFill>
      <Backdrop halo={st.landscape ? {x: 0.72, y: 0.5, size: 0.8, opacity: 0.2} : {x: 0.5, y: 0.62, size: 1.1, opacity: 0.22}} />
      <AbsoluteFill style={{transform: st.transform, transformOrigin: '0 0', width: 1920, height: 1080}}>
        <CameraMotionBlur samples={4} shutterAngle={160}>
          <AbsoluteFill>
            <Pile mode="arrive" />
          </AbsoluteFill>
        </CameraMotionBlur>
        {st.landscape ? <TextBlock landscape portrait={false}>{lines}</TextBlock> : null}
      </AbsoluteFill>
      {!st.landscape ? <TextBlock landscape={false} portrait={st.portrait}>{lines}</TextBlock> : null}
      {[0, 1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <Sfx at={ARRIVE[i] - 4} name="whoosh" volume={0.35} />
          <Sfx at={ARRIVE[i] + 6} name="paper" volume={0.45} />
          <Sfx at={ARRIVE[i] + 24} name="marker" volume={0.5} />
        </React.Fragment>
      ))}
      <Sfx at={ARRIVE[3] + 2} name="ring" volume={0.3} />
    </AbsoluteFill>
  );
};

// 3 — Transition : les cartes sont aspirées dans l'icône, puis on traverse l'icône
export const S03Aspiration: React.FC = () => {
  const frame = useCurrentFrame();
  const st = useStage();
  const target = st.landscape ? {x: 960, y: 610} : FOCUS;
  const iconK = sp(frame, 26, {damping: 11, stiffness: 160});
  const zoom = Math.exp(ip(frame, [128, 196], [0, Math.log(60)], IN));
  const iconSize = 150;
  const question = (
    <div style={st.landscape ? {position: 'absolute', left: 0, right: 0, top: 170} : {position: 'absolute', left: 80, right: 80, top: st.portrait ? 300 : 80}}>
      <div style={{opacity: ip(frame, [120, 136], [1, 0], IN)}}>
        <Kinetic text="Et si tout tenait dans un seul outil ?" start={8} keywords={['seul', 'outil']} size={st.landscape ? 78 : st.portrait ? 84 : 58} align="center" />
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: st.portrait ? 0.62 : 0.56, size: st.landscape ? 0.6 : 1, opacity: 0.18 + 0.2 * ip(frame, [40, 110], [0, 1], EASE)}} />
      <AbsoluteFill style={{transform: st.transform, transformOrigin: '0 0', width: 1920, height: 1080}}>
        <CameraMotionBlur samples={4} shutterAngle={180}>
          <AbsoluteFill>
            <Pile mode="suck" suckStart={44} target={target} />
            <div
              style={{
                position: 'absolute',
                left: target.x - iconSize / 2,
                top: target.y - iconSize / 2,
                transform: `scale(${iconK * zoom * (1 + 0.12 * Math.sin(ip(frame, [70, 100], [0, Math.PI], EASE)))})`,
                transformOrigin: `${(176 / 263) * 100}% ${(150 / 263) * 100}%`,
              }}
            >
              <LogoIcon size={iconSize} />
            </div>
          </AbsoluteFill>
        </CameraMotionBlur>
        {st.landscape ? question : null}
      </AbsoluteFill>
      {!st.landscape ? question : null}
      {/* on finit dans l'orange de l'icône */}
      <AbsoluteFill style={{background: C.orange, opacity: ip(frame, [186, 198], [0, 1], OUT)}} />
      <Sfx at={26} name="pop" volume={0.5} />
      <Sfx at={44} name="whoosh" volume={0.5} />
      <Sfx at={60} name="whoosh" volume={0.3} />
      <Sfx at={84} name="impact" volume={0.35} />
      <Sfx at={150} name="riser" volume={0.55} />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {LogoIcon, Sfx, Wordmark} from '../components/Fx';
import {Kinetic} from '../components/Kinetic';
import {Screen} from '../components/Screen';
import {C, EASE, IN, OUT, POPPINS, ip, sp} from '../theme';

// Accroche des shorts : une question en typo cinétique, l'icône Tracéo en signature
export const Hook: React.FC<{text?: string; keywords?: string[]}> = ({text = 'Votre argent vous échappe ?', keywords = []}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames: D} = useVideoConfig();
  const portrait = height > width;
  const k = sp(frame, 2, {damping: 12, stiffness: 160});
  const punch = 1 + 0.04 * Math.exp(-frame / 6);
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: 0.5, size: 1, opacity: 0.35}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50, padding: '0 80px', transform: `scale(${punch})`}}>
        <LogoIcon size={portrait ? 130 : 110} style={{transform: `scale(${k})`}} />
        <Kinetic text={text} keywords={keywords} start={2} exit={D - 10} size={portrait ? 110 : 96} align="center" stagger={3} lineHeight={1.08} />
      </AbsoluteFill>
      <Sfx at={0} name="impact" volume={0.55} />
    </AbsoluteFill>
  );
};

// Bumper YouTube 6 s : l'icône se construit, le mot apparaît, la signature tombe
export const Bumper: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: D, width, height} = useVideoConfig();
  const portrait = height > width;
  const build = {
    base: sp(frame, 2, {damping: 12, stiffness: 160}),
    bar: ip(frame, [8, 20], [0, 1], EASE),
    diag: sp(frame, 14, {damping: 13, stiffness: 180}),
    dot: sp(frame, 22, {damping: 7, stiffness: 240}),
  };
  const open = ip(frame, [30, 48], [0, 1], EASE);
  const words = ['Gérer.', 'Suivre.', 'Optimiser.'];
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: 0.45, size: 0.8, opacity: 0.3}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 56}}>
        <div style={{display: 'flex', alignItems: 'center', flexDirection: portrait ? 'column' : 'row'}}>
          <LogoIcon size={170} build={build} />
          <div style={{width: portrait ? 'auto' : 440 * open, marginLeft: portrait ? 0 : 36 * open, marginTop: portrait ? 36 : 0}}>
            {open > 0 ? <Wordmark size={128} reveal={ip(frame, [34, 60], [0, 1], (t) => t)} subOpacity={ip(frame, [56, 68], [0, 1], OUT)} /> : null}
          </div>
        </div>
        <div style={{display: 'flex', gap: 26, fontFamily: POPPINS, fontWeight: 600, fontSize: 60, color: '#fff'}}>
          {words.map((w, i) => {
            const p = ip(frame, [78 + i * 10, 94 + i * 10], [0, 1], OUT);
            return (
              <span key={w} style={{opacity: p, transform: `translateY(${(1 - p) * 40}px)`, filter: `blur(${(1 - p) * 8}px)`}}>
                {w.slice(0, -1)}
                <span style={{color: C.orange}}>.</span>
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: C.night, opacity: ip(frame, [D - 10, D], [0, 1], IN)}} />
      <Sfx at={2} name="pop" volume={0.5} />
      <Sfx at={20} name="impact" volume={0.8} />
      <Sfx at={78} name="swish" volume={0.4} />
    </AbsoluteFill>
  );
};

// Miniature YouTube 1280×720 : le Radar en 3D + la question
export const Thumbnail: React.FC = () => (
  <AbsoluteFill>
    <Backdrop halo={{x: 0.72, y: 0.5, size: 1.1, opacity: 0.45}} grain={0.03} />
    <Screen name="radar" cx={880} cy={390} w={660} h={420} cam={{x: 880, y: 430, zoom: 1.5}} rx={6} ry={-16} rz={2} />
    <div style={{position: 'absolute', left: 64, top: 70, width: 560, fontFamily: POPPINS, fontWeight: 800, fontSize: 84, lineHeight: 1.02, letterSpacing: '-0.03em', color: '#fff'}}>
      Votre <span style={{color: C.orange}}>argent</span> vous échappe ?
    </div>
    <div style={{position: 'absolute', left: 64, bottom: 60, display: 'flex', alignItems: 'center', gap: 18}}>
      <LogoIcon size={78} />
      <Wordmark size={54} />
    </div>
  </AbsoluteFill>
);

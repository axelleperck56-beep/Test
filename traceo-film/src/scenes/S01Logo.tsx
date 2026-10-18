import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {LogoIcon, Sfx, Wordmark} from '../components/Fx';
import {EASE, OUT, ip, sp} from '../theme';

// 1 — L'icône se construit (fond, barre qui se dessine, diagonale qui tombe, point qui « pop »),
//     puis « Tracéo » apparaît lettre par lettre.
export const S01Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const portrait = height > width;
  const icon = portrait ? 230 : 210;
  const build = {
    base: sp(frame, 6, {damping: 12, stiffness: 140}),
    bar: ip(frame, [18, 34], [0, 1], EASE),
    diag: sp(frame, 28, {damping: 13, stiffness: 160}),
    dot: sp(frame, 42, {damping: 7, stiffness: 220}),
  };
  // l'icône glisse pour laisser la place au mot
  const open = ip(frame, [56, 82], [0, 1], EASE);
  const wmW = portrait ? 0 : 520;
  const reveal = ip(frame, [62, 96], [0, 1], (t) => t);
  const push = ip(frame, [0, durationInFrames], [1, 1.06], (t) => t);
  const pulse = 1 + 0.06 * Math.exp(-Math.max(0, frame - 44) / 6) * (frame >= 44 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: 0.5, size: 0.75, opacity: 0.22 + 0.25 * ip(frame, [44, 70], [1, 0], OUT) * (frame >= 44 ? 1 : 0)}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${push})`}}>
        <div style={{display: 'flex', flexDirection: portrait ? 'column' : 'row', alignItems: 'center'}}>
          <LogoIcon size={icon} build={build} style={{transform: `scale(${pulse})`}} />
          <div
            style={{
              width: portrait ? 'auto' : wmW * open,
              marginLeft: portrait ? 0 : 44 * open,
              marginTop: portrait ? 50 * open : 0,
              height: portrait ? 230 * open : 'auto',
              overflow: 'visible',
              display: 'flex',
              justifyContent: 'flex-start',
            }}
          >
            {open > 0 ? <Wordmark size={portrait ? 150 : 150} reveal={reveal} subOpacity={ip(frame, [90, 104], [0, 1], OUT)} /> : null}
          </div>
        </div>
      </AbsoluteFill>
      <Sfx at={6} name="pop" volume={0.5} />
      <Sfx at={17} name="swish" volume={0.5} />
      <Sfx at={30} name="swish" volume={0.35} />
      <Sfx at={42} name="impact" volume={0.85} />
      <Sfx at={60} name="whoosh" volume={0.35} />
    </AbsoluteFill>
  );
};

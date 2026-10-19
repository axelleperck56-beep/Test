import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import fiche from '../boxes-fiche.json';
import {Backdrop} from '../components/Backdrop';
import {Callout, Cursor, DemoBadge, Sfx, counterTicks} from '../components/Fx';
import {Rect, Screen, Spotlight, camAt, useScreenIntro} from '../components/Screen';
import {EASE, ip} from '../theme';
import {Title, calloutPos, useLayout} from './UiScenes';

// Ordre des 8 vues du camion (capturées avec « Tourner à droite », 45° par 45°)
const ANGLES = ['000', '315', '270', '225', '180', '135', '090', '045', '000'];

// =====================================================================
// 6b — Fiche véhicule : le camion tourne, la benne s'ouvre, la jauge de charge
// =====================================================================
export const S06bFiche: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const L = useLayout();
  const intro = useScreenIntro(frame, D, {rx: 10, ry: 16}, 2);
  const plus = fiche.plus;
  const pop = fiche.popover as Rect;
  const gauge = fiche.gauge as Rect;
  const T = {spin: 14, step: 11, click: 122, open: 128, gauge: 186, count: 196};
  // plateau tournant : chaque vue tient quelques images puis fond vers la suivante
  const pos = Math.max(0, Math.min(ANGLES.length - 1, (frame - T.spin) / T.step));
  const i = Math.floor(pos);
  const blend = EASE(Math.min(1, Math.max(0, (pos - i - 0.55) / 0.45)));
  const spinning = frame < T.open;
  const base = spinning ? `fiche-rot-${ANGLES[i]}` : 'fiche-rot-000';
  const overlay = spinning
    ? {name: `fiche-rot-${ANGLES[Math.min(i + 1, ANGLES.length - 1)]}`, opacity: blend}
    : {name: 'fiche-benne', opacity: ip(frame, [T.open, T.open + 8], [0, 1], EASE)};
  const cam = camAt(frame, [
    {f: 0, x: 900, y: 420, zoom: 1.35},
    {f: T.spin + 60, x: 900, y: 410, zoom: 1.5},
    {f: T.click - 8, x: 880, y: 400, zoom: 1.55},
    {f: T.open + 20, x: pop.x + pop.w / 2 + 160, y: pop.y + pop.h / 2, zoom: 1.75},
    {f: T.gauge - 8, x: pop.x + pop.w / 2 + 170, y: pop.y + pop.h / 2, zoom: 1.78},
    {f: T.gauge + 14, x: gauge.x + gauge.w / 2 - 120, y: gauge.y + gauge.h / 2 - 40, zoom: 1.85},
    {f: D, x: gauge.x + gauge.w / 2 - 130, y: gauge.y + gauge.h / 2 - 40, zoom: 1.9},
  ]);
  const s = cam.zoom * L.zm * (L.sw / 1920);
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: 0.6, size: 1.0, opacity: 0.25}} />
      <Title text="Chaque camion, sa benne et sa charge." keywords={['benne', 'charge.']} exit={D - 14} />
      <Screen name={base} cx={L.scx} cy={L.scy} w={L.sw} h={L.sh} cam={cam} zoomMul={L.zm} {...intro} overlay={overlay}>
        <Spotlight rect={pop} start={T.open + 12} end={T.gauge - 6} pad={4} />
        <Spotlight rect={{x: gauge.x, y: gauge.y, w: gauge.w, h: 250}} start={T.gauge + 10} pad={4} />
        <Cursor
          keys={[
            {f: T.click - 30, x: plus.x + 220, y: plus.y + 160},
            {f: T.click - 2, x: plus.x + 20, y: plus.y + 20},
            {f: T.open + 30, x: plus.x + 40, y: plus.y + 60},
          ]}
          clicks={[T.click]}
          size={1 / s}
          appear={T.click - 30}
          disappear={T.open + 24}
        />
      </Screen>
      <Callout {...calloutPos(L, {x: 150, y: 700})} start={T.count} label="Taux de charge" value={97} decimals={0} suffix=" %" width={420} />
      <DemoBadge right={L.W - (L.scx + L.sw / 2) + 22} bottom={L.H - (L.scy + L.sh / 2) + 22} />
      <Sfx at={T.spin} name="whoosh" volume={0.35} />
      <Sfx at={T.click} name="click" volume={0.7} />
      <Sfx at={T.open} name="pop" volume={0.45} />
      <Sfx at={T.gauge} name="swish" volume={0.35} />
      {counterTicks(T.count + 4)}
    </AbsoluteFill>
  );
};

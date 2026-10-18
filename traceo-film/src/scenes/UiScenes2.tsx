import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame, useVideoConfig} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import extra from '../boxes-extra.json';
import {Backdrop} from '../components/Backdrop';
import {Callout, Cursor, DemoBadge, Sfx, counterTicks} from '../components/Fx';
import {Pop, Rect, Screen, Spotlight, camAt, capSize, capSrc, useScreenIntro} from '../components/Screen';
import {C, EASE, OUT, ip} from '../theme';
import {Title, useLayout} from './UiScenes';

// Zone d'une autre capture affichée par-dessus (même page, autre état), avec fondu
const Patch: React.FC<{name: string; rect: Rect; opacity: number}> = ({name, rect, opacity}) =>
  opacity <= 0 ? null : (
    <div style={{position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h, overflow: 'hidden', opacity}}>
      <Img src={capSrc(name)} style={{position: 'absolute', left: -rect.x, top: -rect.y, width: 1920, height: capSize(name).h}} />
    </div>
  );

// =====================================================================
// 6 — Carte en direct : vue région → zoom sur un camion → la fiche s'ouvre
// =====================================================================
export const S06Carte: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const L = useLayout();
  const intro = useScreenIntro(frame, D, {rx: 10, ry: -16}, 2);
  const truck = {x: 1232, y: 706};
  const fiche = extra.fiche as Rect;
  const T = {zoom: 36, click: 104, fiche: 112, pan: 120};
  const cam = camAt(frame, [
    {f: 0, x: 960, y: 560, zoom: 1},
    {f: T.zoom, x: 950, y: 560, zoom: 1.05},
    {f: T.click - 12, x: truck.x - 40, y: truck.y - 20, zoom: 2.7},
    {f: T.pan, x: truck.x - 10, y: truck.y - 30, zoom: 2.75},
    {f: T.pan + 40, x: fiche.x + fiche.w / 2 - 60, y: fiche.y + fiche.h / 2 + 10, zoom: 1.95},
    {f: D, x: fiche.x + fiche.w / 2 - 70, y: fiche.y + fiche.h / 2 + 10, zoom: 2.02},
  ]);
  const s = cam.zoom * (L.sw / 1920);
  const ficheOn = ip(frame, [T.fiche, T.fiche + 8], [0, 1], OUT);
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: 0.6, size: 1.0, opacity: 0.25}} />
      <Title text="Vos camions en temps réel." keywords={['temps', 'réel.']} exit={D - 14} />
      <CameraMotionBlur samples={5} shutterAngle={150}>
        <AbsoluteFill>
          <Screen name="carte" cx={L.scx} cy={L.scy} w={L.sw} h={L.sh} cam={cam} {...intro} overlay={{name: 'carte-fiche', opacity: ficheOn}}>
            {/* pulsation sur le camion visé */}
            {[0, 1].map((i) => {
              const p = ((frame - 60 + i * 15) % 30) / 30;
              return frame > 60 && frame < T.fiche + 30 ? (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: truck.x - 50 * p,
                    top: truck.y - 50 * p,
                    width: 100 * p,
                    height: 100 * p,
                    borderRadius: '50%',
                    border: `${2 / s}px solid ${C.orange}`,
                    opacity: 1 - p,
                  }}
                />
              ) : null;
            })}
            <Spotlight rect={fiche} start={T.pan + 34} pad={4} stroke={2} />
            <Cursor
              keys={[
                {f: T.click - 34, x: truck.x - 160, y: truck.y + 120},
                {f: T.click - 2, x: truck.x, y: truck.y},
                {f: T.pan + 20, x: truck.x + 10, y: truck.y + 10},
              ]}
              clicks={[T.click]}
              size={1 / s}
              appear={T.click - 34}
              disappear={T.pan + 16}
            />
          </Screen>
        </AbsoluteFill>
      </CameraMotionBlur>
      <DemoBadge right={L.W - (L.scx + L.sw / 2) + 22} bottom={L.H - (L.scy + L.sh / 2) + 22} />
      <Sfx at={T.zoom + 4} name="whoosh" volume={0.4} />
      <Sfx at={T.click} name="click" volume={0.8} />
      <Sfx at={T.fiche} name="pop" volume={0.45} />
      <Sfx at={T.pan + 2} name="swish" volume={0.35} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 7 — Rentabilité : ligne rouge en spotlight, marge moyenne, onglets
// =====================================================================
export const S07Rentabilite: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const L = useLayout();
  const intro = useScreenIntro(frame, D, {rx: 12, ry: 16}, 2);
  const row: Rect = {x: 292, y: 474, w: 1592, h: 48};
  const marge: Rect = {x: 1628, y: 184, w: 258, h: 74};
  const tabs = {voyage: {x: 334, y: 338}, client: {x: 426, y: 338}, camion: {x: 517, y: 338}};
  const T = {row: 30, marge: 104, count: 116, tab1: 168, tab2: 204};
  const cam = camAt(frame, [
    {f: 0, x: 960, y: 560, zoom: 1},
    {f: T.row, x: 1000, y: 520, zoom: 1.12},
    {f: T.row + 22, x: 1060, y: 520, zoom: 1.3},
    {f: T.marge - 6, x: 1060, y: 510, zoom: 1.32},
    {f: T.marge + 16, x: 1500, y: 300, zoom: 1.7},
    {f: T.tab1 - 22, x: 1480, y: 300, zoom: 1.72},
    {f: T.tab1 - 4, x: 820, y: 560, zoom: 1.15},
    {f: D, x: 820, y: 560, zoom: 1.2},
  ]);
  const s = cam.zoom * (L.sw / 1920);
  const t1 = ip(frame, [T.tab1 + 2, T.tab1 + 10], [0, 1], EASE);
  const t2 = ip(frame, [T.tab2 + 2, T.tab2 + 10], [0, 1], EASE);
  const name = t2 > 0 ? 'rentabilite-2' : 'rentabilite-1';
  const overlay = t2 > 0 ? {name: 'rentabilite-3', opacity: t2} : {name: 'rentabilite-2', opacity: t1};
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: 0.6, size: 1.0, opacity: 0.25}} />
      <Title text="La vraie marge de chaque voyage." keywords={['marge']} exit={D - 14} />
      <Screen name={name} cx={L.scx} cy={L.scy} w={L.sw} h={L.sh} cam={cam} {...intro} overlay={overlay}>
        <Spotlight rect={row} start={T.row + 14} end={T.marge - 8} color={C.red} pad={4} />
        <Spotlight rect={marge} start={T.marge + 14} end={T.tab1 - 22} pad={6} />
        <Cursor
          keys={[
            {f: T.tab1 - 22, x: 700, y: 520},
            {f: T.tab1 - 2, x: tabs.client.x, y: tabs.client.y},
            {f: T.tab2 - 2, x: tabs.camion.x, y: tabs.camion.y},
            {f: D, x: tabs.camion.x + 30, y: tabs.camion.y + 60},
          ]}
          clicks={[T.tab1, T.tab2]}
          size={1 / s}
          appear={T.tab1 - 22}
        />
      </Screen>
      <Callout x={L.portrait ? 80 : 150} y={L.portrait ? L.scy + L.sh / 2 + 40 : 700} start={T.count} end={T.tab1 - 16} label="Marge moyenne du mois" value={15.1} decimals={1} suffix=" %" width={480} />
      <DemoBadge right={L.W - (L.scx + L.sw / 2) + 22} bottom={L.H - (L.scy + L.sh / 2) + 22} />
      <Sfx at={T.row} name="swish" volume={0.35} />
      <Sfx at={T.marge + 4} name="swish" volume={0.35} />
      {counterTicks(T.count + 4)}
      <Sfx at={T.tab1} name="click" volume={0.7} />
      <Sfx at={T.tab2} name="click" volume={0.7} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 8 — Du chantier à la facture : un voyage passe « Prêt à facturer », puis on génère
// =====================================================================
const StatusPill: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const p = ip(frame, [at, at + 10], [0, 1], EASE);
  const check = ip(frame, [at + 6, at + 16], [0, 1], OUT);
  const pop = 1 + 0.12 * Math.sin(Math.PI * ip(frame, [at + 4, at + 14], [0, 1], (t) => t));
  const w = 84 + (112 - 84) * p;
  const mix = (a: number[], b: number[]) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * p)).join(',')})`;
  return (
    <>
      <div style={{position: 'absolute', left: 1180, top: 683, width: 210, height: 44, background: '#fff'}} />
      <div
        style={{
          position: 'absolute',
          left: 1185,
          top: 688,
          width: w,
          height: 22,
          borderRadius: 11,
          background: mix([255, 243, 224], [232, 247, 238]),
          color: mix([194, 120, 3], [22, 163, 74]),
          fontFamily: 'Inter, sans-serif',
          fontSize: 12.5,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          paddingLeft: 9,
          transform: `scale(${pop})`,
          transformOrigin: '20% 50%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {p < 0.5 ? (
          <span style={{width: 6, height: 6, borderRadius: 3, background: 'currentColor'}} />
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1.5 5.2 L4 7.6 L8.6 2.4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeDasharray="12" strokeDashoffset={12 * (1 - check)} />
          </svg>
        )}
        <span style={{opacity: Math.abs(p - 0.5) * 2}}>{p < 0.5 ? 'À vérifier' : 'Prêt à facturer'}</span>
      </div>
    </>
  );
};

export const S08Facturation: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const L = useLayout();
  const intro = useScreenIntro(frame, D, {rx: 12, ry: -16}, 2);
  const T = {rows: 18, pill: 58, c1: 96, c2: 108, c3: 120, gen: 160};
  const checks = [533, 590, 647];
  const gen: Rect = {x: 1688, y: 366, w: 187, h: 36};
  const cam = camAt(frame, [
    {f: 0, x: 960, y: 560, zoom: 1},
    {f: T.rows, x: 960, y: 560, zoom: 1.04},
    {f: T.rows + 24, x: 1000, y: 620, zoom: 1.5},
    {f: T.c1 - 14, x: 1000, y: 620, zoom: 1.52},
    {f: T.c1 - 2, x: 760, y: 600, zoom: 1.6},
    {f: T.c3 + 8, x: 760, y: 590, zoom: 1.62},
    {f: T.gen - 8, x: 1500, y: 440, zoom: 1.8},
    {f: D, x: 1500, y: 440, zoom: 1.86},
  ]);
  const s = cam.zoom * (L.sw / 1920);
  const genOn = ip(frame, [T.c3, T.c3 + 6], [0, 1], OUT);
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: 0.6, size: 1.0, opacity: 0.25}} />
      <Title text="Du chantier à la facture, sans ressaisie." keywords={['facture,', 'ressaisie.']} exit={D - 14} />
      <Screen name="comptabilite-prets" cx={L.scx} cy={L.scy} w={L.sw} h={L.sh} cam={cam} {...intro}>
        <Spotlight rect={{x: 288, y: 680, w: 1600, h: 58}} start={T.rows + 18} end={T.pill + 26} pad={2} />
        <StatusPill at={T.pill} />
        {checks.map((y, i) => (
          <Patch key={i} name="comptabilite-selection" rect={{x: 290, y: y - 14, w: 30, h: 28}} opacity={ip(frame, [[T.c1, T.c2, T.c3][i], [T.c1, T.c2, T.c3][i] + 3], [0, 1], OUT)} />
        ))}
        <Patch name="comptabilite-selection" rect={gen} opacity={genOn} />
        {frame >= T.gen ? <Pop name="comptabilite-selection" rect={gen} at={T.gen} /> : null}
        <Spotlight rect={gen} start={T.gen + 4} pad={6} />
        <Cursor
          keys={[
            {f: T.c1 - 16, x: 520, y: 760},
            {f: T.c1 - 1, x: 305, y: checks[0]},
            {f: T.c2 - 1, x: 305, y: checks[1]},
            {f: T.c3 - 1, x: 305, y: checks[2]},
            {f: T.gen - 2, x: gen.x + gen.w / 2, y: gen.y + gen.h / 2},
            {f: D, x: gen.x + gen.w / 2 + 20, y: gen.y + gen.h / 2 + 40},
          ]}
          clicks={[T.c1, T.c2, T.c3, T.gen]}
          size={1 / s}
          appear={T.c1 - 16}
        />
      </Screen>
      <DemoBadge right={L.W - (L.scx + L.sw / 2) + 22} bottom={L.H - (L.scy + L.sh / 2) + 22} />
      <Sfx at={T.rows + 2} name="swish" volume={0.35} />
      <Sfx at={T.pill + 6} name="success" volume={0.5} />
      {[T.c1, T.c2, T.c3, T.gen].map((f) => (
        <Sfx key={f} at={f} name="click" volume={0.7} />
      ))}
      <Sfx at={T.gen + 6} name="success" volume={0.5} />
    </AbsoluteFill>
  );
};

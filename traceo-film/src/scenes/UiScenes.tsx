import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame, useVideoConfig} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import boxes from '../boxes.json';
import extra from '../boxes-extra.json';
import {Backdrop} from '../components/Backdrop';
import {Callout, Cursor, DemoBadge, Sfx, counterTicks} from '../components/Fx';
import {Kinetic} from '../components/Kinetic';
import {Pop, Rect, Screen, Spotlight, camAt, capSize, capSrc, useScreenIntro} from '../components/Screen';
import {C, EASE, IN, OUT, POPPINS, ip} from '../theme';

// Mise en page commune des plans d'interface : titre en haut, écran 3D dessous.
const useLayout = () => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const square = width === height;
  // zm : facteur de zoom caméra pour cadrer la même zone dans une fenêtre plus étroite
  if (portrait) return {portrait, square, W: width, H: height, sw: 980, sh: 1120, scx: width / 2, scy: 1000, titleTop: 250, titleSize: 64, zm: 1.2};
  if (square) return {portrait, square, W: width, H: height, sw: 1000, sh: 640, scx: width / 2, scy: 556, titleTop: 92, titleSize: 50, zm: 1.15};
  return {portrait, square, W: width, H: height, sw: 1440, sh: 810, scx: width / 2, scy: 594, titleTop: 70, titleSize: 58, zm: 1};
};

// position des cartes flottantes (compteurs) selon le format
const calloutPos = (L: ReturnType<typeof useLayout>, landscape: {x: number; y: number}) =>
  L.portrait ? {x: 70, y: L.scy + L.sh / 2 - 250} : L.square ? {x: 50, y: L.scy + L.sh / 2 - 210} : landscape;

const Title: React.FC<{text: string; keywords: string[]; start?: number; exit?: number}> = ({text, keywords, start = 6, exit}) => {
  const L = useLayout();
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: L.titleTop}}>
      <Kinetic text={text} keywords={keywords} start={start} exit={exit} size={L.titleSize} align="center" />
    </div>
  );
};

const B = boxes as Record<string, Record<string, Rect | null>>;
const r = (page: string, key: string, pad = 0): Rect => {
  const b = B[page][key]!;
  return {x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2};
};
const center = (b: Rect) => ({x: b.x + b.w / 2, y: b.y + b.h / 2});

// Fondu d'entrée depuis l'orange du zoom-through
const OrangeOut: React.FC<{dur?: number}> = ({dur = 10}) => {
  const frame = useCurrentFrame();
  const a = ip(frame, [0, dur], [1, 0], OUT);
  return a > 0 ? <AbsoluteFill style={{background: C.orange, opacity: a}} /> : null;
};

// =====================================================================
// 4 — Tableau de bord
// =====================================================================
export const S04Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const L = useLayout();
  const intro = useScreenIntro(frame, D, {rx: 14, ry: -18}, 4);
  const today = r('dashboard', 'today');
  const kpis = r('dashboard', 'kpis');
  const cam = camAt(frame, [
    {f: 0, x: 960, y: 540, zoom: 1},
    {f: 70, x: 960, y: 520, zoom: 1.06},
    {f: 100, ...center(kpis), zoom: 1.15},
    {f: 140, ...center(kpis), zoom: 1.18},
    {f: 172, x: today.x + today.w / 2 + 120, y: today.y + 250, zoom: 1.55},
    {f: 240, x: today.x + today.w / 2 + 110, y: today.y + 260, zoom: 1.62},
  ]);
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: 0.62, size: 1.0, opacity: 0.25}} />
      <Title text="Votre journée, en un coup d’œil." keywords={['journée,']} exit={D - 14} />
      <Screen name="dashboard" cx={L.scx} cy={L.scy} w={L.sw} h={L.sh} cam={cam} zoomMul={L.zm} {...intro}>
        <Spotlight rect={{x: kpis.x, y: kpis.y, w: kpis.w, h: kpis.h}} start={96} end={146} />
        <Spotlight rect={{x: today.x, y: today.y, w: today.w, h: 430}} start={176} />
      </Screen>
      <DemoBadge right={L.W - (L.scx + L.sw / 2) + 22} bottom={L.H - (L.scy + L.sh / 2) + 22} />
      <OrangeOut />
      <Sfx at={2} name="whoosh" volume={0.4} />
      <Sfx at={92} name="swish" volume={0.35} />
      <Sfx at={166} name="swish" volume={0.4} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 5 — Radar des fuites d'argent
// =====================================================================
export const S05Radar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const L = useLayout();
  const intro = useScreenIntro(frame, D, {rx: 12, ry: 18}, 2);
  const total = r('radar', 'total');
  const alert1 = r('radar', 'alert1');
  const tabs = {x: 1694, y: 634, w: 200, h: 40};
  const verify: Rect = {x: 1656, y: alert1.y + alert1.h - 62, w: 216, h: 40};
  const kpi = (i: number): Rect => ({x: 288 + 404 * i, y: 488, w: 388, h: 126});
  const T = {
    total: 34, count: 52, kpi: 112, alert: 158, click: 196, slide: 206, tabs: 240,
  };
  const cam = camAt(frame, [
    {f: 0, x: 960, y: 560, zoom: 1},
    {f: T.total, x: 960, y: 560, zoom: 1.04},
    {f: T.total + 22, x: 900, y: total.y + 90, zoom: 1.32},
    {f: T.kpi - 8, x: 900, y: total.y + 110, zoom: 1.34},
    {f: T.kpi + 10, x: 1088, y: 560, zoom: 1.2},
    {f: T.alert - 14, x: 1088, y: 600, zoom: 1.22},
    {f: T.alert + 6, x: 1090, y: alert1.y + 70, zoom: 1.28},
    {f: T.click - 16, x: 1120, y: alert1.y + 80, zoom: 1.3},
    {f: T.click - 2, x: 1440, y: alert1.y + 120, zoom: 1.62},
    {f: T.slide + 4, x: 1440, y: alert1.y + 110, zoom: 1.64},
    {f: T.tabs, x: 1440, y: 720, zoom: 1.6},
    {f: D, x: 1440, y: 720, zoom: 1.66},
  ]);
  const s = cam.zoom * L.zm * (L.sw / 1920);
  // l'alerte traitée quitte la liste et file vers l'onglet « Traitées »
  const fly = ip(frame, [T.slide, T.slide + 22], [0, 1], IN);
  const after = ip(frame, [T.slide + 4, T.slide + 16], [0, 1], EASE);
  const {x: callX, y: callY} = calloutPos(L, {x: 1240, y: 700});
  return (
    <AbsoluteFill>
      <Backdrop halo={{x: 0.5, y: 0.6, size: 1.0, opacity: 0.25}} />
      <Title text="Le Radar vous montre l’argent qui vous échappe." keywords={['Radar', 'l’argent']} exit={D - 14} />
      <Screen name="radar" cx={L.scx} cy={L.scy} w={L.sw} h={L.sh} cam={cam} zoomMul={L.zm} {...intro} overlay={{name: 'radar-apres', opacity: after}}>
        <Spotlight rect={total} start={T.total + 10} end={T.kpi - 10} />
        {[0, 1, 2, 3].map((i) => (
          <Pop key={i} name="radar" rect={kpi(i)} at={T.kpi + i * 6} mode="enter" cover={C.appBg} />
        ))}
        {/* carte d'alerte qui s'envole vers « Traitées » */}
        {frame >= T.slide && fly < 1 ? (
          <>
            <div style={{position: 'absolute', left: alert1.x, top: alert1.y, width: alert1.w, height: alert1.h, background: C.appBg, opacity: 1 - after}} />
            <div
              style={{
                position: 'absolute',
                left: alert1.x,
                top: alert1.y,
                width: alert1.w,
                height: alert1.h,
                overflow: 'hidden',
                borderRadius: 12,
                transformOrigin: '100% 0%',
                transform: `translate(${(tabs.x + tabs.w - alert1.x - alert1.w) * fly}px, ${(tabs.y - alert1.y) * fly}px) scale(${1 - 0.9 * fly})`,
                opacity: 1 - fly * 0.6,
                boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              }}
            >
              <Img src={capSrc('radar')} style={{position: 'absolute', left: -alert1.x, top: -alert1.y, width: 1920, height: capSize('radar').h}} />
            </div>
          </>
        ) : null}
        {frame < T.slide ? <Pop name="radar" rect={verify} at={T.click} /> : null}
        <Spotlight rect={tabs} start={T.tabs} pad={6} />
        <Cursor
          keys={[
            {f: T.alert + 6, x: 1300, y: alert1.y + 260},
            {f: T.click - 2, x: verify.x + 120, y: verify.y + 24},
            {f: T.slide + 30, x: verify.x + 120, y: verify.y + 24},
            {f: T.tabs + 10, x: tabs.x + 150, y: tabs.y + 34},
          ]}
          clicks={[T.click]}
          size={1 / s}
          appear={T.alert + 4}
        />
      </Screen>
      <Callout x={callX} y={callY} start={T.count} end={T.kpi - 6} label="Total à récupérer ou à vérifier" value={3230.39} suffix=" €" width={560} />
      <DemoBadge right={L.W - (L.scx + L.sw / 2) + 22} bottom={L.H - (L.scy + L.sh / 2) + 22} />
      <Sfx at={0} name="swish" volume={0.4} />
      <Sfx at={T.total + 2} name="swish" volume={0.35} />
      {counterTicks(T.count + 4)}
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} at={T.kpi + i * 6} name="pop" volume={0.35} />
      ))}
      <Sfx at={T.click} name="click" volume={0.8} />
      <Sfx at={T.slide} name="whoosh" volume={0.4} />
      <Sfx at={T.tabs + 4} name="success" volume={0.45} />
    </AbsoluteFill>
  );
};

export {useLayout, Title, r, center, OrangeOut, B, calloutPos};
export const _unused = {CameraMotionBlur, POPPINS, extra};

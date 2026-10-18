import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import cutsJson from './cuts.json';
import {diagonalWipe} from './components/transitions';
import {Sfx} from './components/Fx';
import {Captions, TimedWord} from './components/Captions';
import {S01Logo} from './scenes/S01Logo';
import {S02Probleme, S03Aspiration} from './scenes/S02S03Probleme';
import {S04Dashboard, S05Radar} from './scenes/UiScenes';
import {S06Carte, S07Rentabilite, S08Facturation} from './scenes/UiScenes2';
import {S09Chauffeur, S10Mosaique, S11Benefices, S12Packshot} from './scenes/EndScenes';
import {Hook} from './scenes/Extras';
import {VOICE, voiceFrames} from './voice';
import {FPS} from './theme';

// Registre des scènes (= précompositions)
export const SCENE_COMPONENTS: Record<string, React.FC<any>> = {
  S01: S01Logo, S02: S02Probleme, S03: S03Aspiration, S04: S04Dashboard, S05: S05Radar, S06: S06Carte,
  S07: S07Rentabilite, S08: S08Facturation, S09: S09Chauffeur, S10: S10Mosaique, S11: S11Benefices, S12: S12Packshot, HOOK: Hook,
};
export const SCENE_TITLES: Record<string, string> = {
  S01: 'Logo', S02: 'Le problème', S03: 'Aspiration / zoom-through', S04: 'Tableau de bord', S05: 'Radar', S06: 'Carte en direct',
  S07: 'Rentabilité', S08: 'BSD + clôture', S09: 'Appli chauffeur', S10: 'Mosaïque', S11: 'Bénéfices', S12: 'Packshot', HOOK: 'Accroche',
};

type Item = {s: string; v?: string; min?: number; text?: string; kw?: string[]};
type Tr = [string, number?];
type CutDef = {w: number; h: number; captions: boolean; file: string; items: Item[]; tr: Tr[]};
const J = cutsJson as unknown as {lead: number; tail: number; base: Record<string, number>; voiceLead: Record<string, number>; cuts: Record<string, any>};

export const getCut = (id: string): CutDef => {
  const c = J.cuts[id];
  return c.same ? {...J.cuts[c.same], ...c, same: undefined} : c;
};
export const CUT_IDS = Object.keys(J.cuts);

const lead = (it: Item) => J.voiceLead[it.s] ?? J.lead;
// Durée d'une scène : celle du storyboard, allongée si la voix est plus longue
export const itemDur = (it: Item) => Math.max(it.min ?? J.base[it.s], voiceFrames(it.v) ? lead(it) + voiceFrames(it.v) + J.tail : 0);
const trDur = (t?: Tr) => (t && t[0] !== 'cut' ? (t[1] as number) : 0);

export const cutTimeline = (cut: CutDef) => {
  let t = 0;
  return cut.items.map((it, i) => {
    const start = t;
    const dur = itemDur(it);
    t += dur - trDur(cut.tr[i]);
    return {it, start, dur};
  });
};
export const cutDuration = (cut: CutDef) => {
  const tl = cutTimeline(cut);
  const last = tl[tl.length - 1];
  return last.start + last.dur;
};

// Mots de la voix off placés sur la timeline du montage (en images)
export const cutWords = (cut: CutDef): TimedWord[] =>
  cutTimeline(cut).flatMap(({it, start}) =>
    it.v && VOICE[it.v]
      ? VOICE[it.v].words.map((w) => ({...w, f0: Math.round(start + lead(it) + w.s * FPS), f1: Math.round(start + lead(it) + w.e * FPS)}))
      : [],
  );

const presentation = (t: Tr) => (t[0] === 'wipe' ? diagonalWipe() : t[0] === 'slide' ? slide({direction: 'from-right'}) : fade());

export const Cut: React.FC<{cutId: string}> = ({cutId}) => {
  const cut = getCut(cutId);
  const tl = cutTimeline(cut);
  return (
    <AbsoluteFill style={{background: '#14161B'}}>
      <TransitionSeries>
        {cut.items.map((it, i) => {
          const tr = cut.tr[i];
          const Comp = SCENE_COMPONENTS[it.s];
          return (
            <React.Fragment key={i}>
              <TransitionSeries.Sequence durationInFrames={itemDur(it)} name={`${it.s} ${SCENE_TITLES[it.s]}`}>
                <Comp text={it.text} keywords={it.kw} />
              </TransitionSeries.Sequence>
              {tr && tr[0] !== 'cut' ? (
                <TransitionSeries.Transition timing={linearTiming({durationInFrames: tr[1] as number})} presentation={presentation(tr) as never} />
              ) : null}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
      {/* voix off */}
      {tl.map(({it, start}, i) =>
        it.v && VOICE[it.v] ? (
          <Sequence key={`v${i}`} from={start + lead(it)} layout="none" name={`voix ${it.v}`}>
            <Audio src={staticFile(`voice/${it.v}.mp3`)} volume={1} />
          </Sequence>
        ) : null,
      )}
      {/* whoosh sur les transitions */}
      {cut.tr.map((tr, i) => (tr[0] === 'wipe' || tr[0] === 'slide' ? <Sfx key={i} at={tl[i + 1].start - 3} name="swish" volume={0.5} /> : null))}
      {cut.captions ? <Captions words={cutWords(cut)} /> : null}
    </AbsoluteFill>
  );
};

// compat : planche storyboard et Root
export const SCENES = Object.keys(SCENE_COMPONENTS)
  .filter((k) => k !== 'HOOK')
  .map((id) => ({id, title: SCENE_TITLES[id], dur: J.base[id], C: SCENE_COMPONENTS[id]}));
export const Master: React.FC = () => <Cut cutId="Master" />;
export const masterDuration = () => cutDuration(getCut('Master'));

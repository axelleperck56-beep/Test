import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {diagonalWipe} from './components/transitions';
import {Sfx} from './components/Fx';
import {S01Logo} from './scenes/S01Logo';
import {S02Probleme, S03Aspiration} from './scenes/S02S03Probleme';
import {S04Dashboard, S05Radar} from './scenes/UiScenes';
import {S06Carte, S07Rentabilite, S08Facturation} from './scenes/UiScenes2';
import {S09Chauffeur, S10Mosaique, S11Benefices, S12Packshot} from './scenes/EndScenes';

// Durées indicatives du storyboard (30 i/s). À recaler sur la voix off réelle.
export const SCENES = [
  {id: 'S01', title: 'Logo', dur: 150, C: S01Logo},
  {id: 'S02', title: 'Le problème', dur: 300, C: S02Probleme},
  {id: 'S03', title: 'Aspiration / zoom-through', dur: 210, C: S03Aspiration},
  {id: 'S04', title: 'Tableau de bord', dur: 240, C: S04Dashboard},
  {id: 'S05', title: 'Radar', dur: 300, C: S05Radar},
  {id: 'S06', title: 'Carte en direct', dur: 240, C: S06Carte},
  {id: 'S07', title: 'Rentabilité', dur: 240, C: S07Rentabilite},
  {id: 'S08', title: 'BSD + clôture', dur: 210, C: S08Facturation},
  {id: 'S09', title: 'Appli chauffeur', dur: 210, C: S09Chauffeur},
  {id: 'S10', title: 'Mosaïque', dur: 210, C: S10Mosaique},
  {id: 'S11', title: 'Bénéfices', dur: 210, C: S11Benefices},
  {id: 'S12', title: 'Packshot', dur: 240, C: S12Packshot},
] as const;

type Tr = {kind: 'cut'} | {kind: 'wipe' | 'slide' | 'fade'; dur: number};
// transition APRÈS chaque scène
export const TRANSITIONS: Tr[] = [
  {kind: 'wipe', dur: 8}, // 1 → 2
  {kind: 'cut'}, // 2 → 3 (même pile de cartes, raccord invisible)
  {kind: 'cut'}, // 3 → 4 (zoom-through dans l'icône, on ressort dans l'orange)
  {kind: 'wipe', dur: 8}, // 4 → 5
  {kind: 'slide', dur: 12}, // 5 → 6
  {kind: 'wipe', dur: 8}, // 6 → 7
  {kind: 'wipe', dur: 8}, // 7 → 8
  {kind: 'slide', dur: 12}, // 8 → 9
  {kind: 'wipe', dur: 8}, // 9 → 10
  {kind: 'cut'}, // 10 → 11 (plongée dans la mosaïque)
  {kind: 'fade', dur: 15}, // 11 → 12 (seul fondu : le plan final)
];

export const masterDuration = () =>
  SCENES.reduce((a, s) => a + s.dur, 0) - TRANSITIONS.reduce((a, t) => a + (t.kind === 'cut' ? 0 : t.dur), 0);

// début de chaque scène dans le master
export const sceneStarts = () => {
  const out: number[] = [];
  let t = 0;
  SCENES.forEach((s, i) => {
    out.push(t);
    const tr = TRANSITIONS[i];
    t += s.dur - (tr && tr.kind !== 'cut' ? tr.dur : 0);
  });
  return out;
};

export const Master: React.FC = () => {
  const starts = sceneStarts();
  return (
    <AbsoluteFill style={{background: '#14161B'}}>
      <TransitionSeries>
        {SCENES.map((s, i) => {
          const tr = TRANSITIONS[i];
          const Comp = s.C;
          return (
            <React.Fragment key={s.id}>
              <TransitionSeries.Sequence durationInFrames={s.dur} name={`${s.id} ${s.title}`}>
                <Comp />
              </TransitionSeries.Sequence>
              {tr && tr.kind !== 'cut' ? (
                <TransitionSeries.Transition
                  timing={linearTiming({durationInFrames: tr.dur})}
                  presentation={(tr.kind === 'wipe' ? diagonalWipe() : tr.kind === 'slide' ? slide({direction: 'from-right'}) : fade()) as never}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
      {/* whoosh sur les transitions */}
      {TRANSITIONS.map((tr, i) =>
        tr.kind === 'wipe' || tr.kind === 'slide' ? <Sfx key={i} at={starts[i + 1] - 3} name="swish" volume={0.5} /> : null,
      )}
    </AbsoluteFill>
  );
};

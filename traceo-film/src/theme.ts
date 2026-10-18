import {continueRender, delayRender, Easing, interpolate, spring, staticFile} from 'remotion';

// Poppins embarquée dans public/fonts (licence OFL) : aucun appel réseau au rendu
export const POPPINS = 'Poppins';
if (typeof document !== 'undefined') {
  const handle = delayRender('Poppins');
  Promise.all(
    ([['Regular', '400'], ['SemiBold', '600'], ['ExtraBold', '800']] as const).map(([file, weight]) => {
      const face = new FontFace(POPPINS, `url(${staticFile(`fonts/Poppins-${file}.ttf`)}) format('truetype')`, {weight});
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle));
}

// Charte Tracéo
export const C = {
  orange: '#F26B1D',
  night: '#14161B',
  ink: '#1A1D23',
  paper: '#F6F4F1',
  grey: '#5B606B',
  green: '#22C55E',
  red: '#EF4444',
  appBg: '#F5F6F8', // fond des pages de l'appli (relevé sur les captures)
};

export const FPS = 30;

// Courbes façon Graph Editor
export const EASE = Easing.bezier(0.65, 0, 0.35, 1); // caméra
export const OUT = Easing.bezier(0.16, 1, 0.3, 1); // entrées
export const IN = Easing.bezier(0.7, 0, 0.84, 0); // sorties

export const ip = (
  f: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = EASE,
) => interpolate(f, input, output, {easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// Ressort par défaut du brief (écrans 3D qui se redressent)
export const SCREEN_SPRING = {damping: 18, stiffness: 90, mass: 1};
export const sp = (frame: number, delay = 0, config: Partial<typeof SCREEN_SPRING> = SCREEN_SPRING) =>
  spring({frame: frame - delay, fps: FPS, config});

// Format français : espace insécable pour les milliers, virgule décimale
export const fmtNum = (v: number, decimals = 2) =>
  new Intl.NumberFormat('fr-FR', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})
    .format(v)
    .replace(/[  ]/g, ' ');

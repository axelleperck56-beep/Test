import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import {C, EASE} from '../theme';

type WipeProps = {color?: string; angle?: number};

// Wipe diagonal : une bande orange balaie l'écran et découvre le plan suivant
const DiagonalWipe: React.FC<TransitionPresentationComponentProps<WipeProps>> = ({children, presentationDirection, presentationProgress, passedProps}) => {
  const p = EASE(presentationProgress);
  const color = passedProps.color ?? C.orange;
  if (presentationDirection === 'exiting') return <AbsoluteFill>{children}</AbsoluteFill>;
  // e = bord gauche (en bas) de la bande, en % de largeur ; la diagonale décale le haut de 30 %
  const b = 22;
  const e = -60 + p * 190;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: `polygon(-200% 0%, ${e + 30}% 0%, ${e}% 100%, -200% 100%)`}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: color, clipPath: `polygon(${e + 30}% 0%, ${e + 30 + b}% 0%, ${e + b}% 100%, ${e}% 100%)`}} />
    </AbsoluteFill>
  );
};

export const diagonalWipe = (props: WipeProps = {}): TransitionPresentation<WipeProps> => ({component: DiagonalWipe, props});

import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, IN, OUT, POPPINS, ip} from '../theme';

const norm = (w: string) => w.toLowerCase().replace(/[.,!?…:;«»"]/g, '');

// Titre qui arrive mot par mot (translateY 40 + opacité + flou qui disparaît),
// mots-clés en orange, sortie rapide vers le haut.
export const Kinetic: React.FC<{
  text: string;
  start?: number;
  exit?: number; // image de début de sortie
  keywords?: string[];
  size?: number;
  weight?: 400 | 600 | 800;
  color?: string;
  align?: 'left' | 'center' | 'right';
  stagger?: number;
  lineHeight?: number;
  maxWidth?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  start = 0,
  exit,
  keywords = [],
  size = 72,
  weight = 800,
  color = '#fff',
  align = 'left',
  stagger = 4,
  lineHeight = 1.12,
  maxWidth,
  style,
}) => {
  const frame = useCurrentFrame();
  const kw = keywords.map(norm);
  const words = text.split(' ');
  return (
    <div
      style={{
        fontFamily: POPPINS,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing: weight === 800 ? '-0.02em' : '-0.005em',
        color,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        columnGap: size * 0.26,
        maxWidth,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const d = start + i * stagger;
        const p = ip(frame, [d, d + 16], [0, 1], OUT);
        const e = exit == null ? 0 : ip(frame, [exit + i * 1.5, exit + i * 1.5 + 9], [0, 1], IN);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${40 * (1 - p) - 60 * e}px)`,
              opacity: p * (1 - e),
              filter: `blur(${10 * (1 - p) + 6 * e}px)`,
              color: kw.includes(norm(w)) ? C.orange : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

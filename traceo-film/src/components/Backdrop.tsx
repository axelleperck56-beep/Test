import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../theme';

// Fond de plan : nuit ou papier, halo orange flou, vignettage et grain (4 %)
export const Backdrop: React.FC<{
  variant?: 'night' | 'paper';
  halo?: {x: number; y: number; size: number; opacity?: number};
  grain?: number;
}> = ({variant = 'night', halo, grain = 0.04}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const night = variant === 'night';
  const h = halo ?? {x: 0.5, y: 0.45, size: 0.9, opacity: night ? 0.32 : 0.12};
  const seed = Math.floor(frame / 2); // grain à 15 i/s, comme de la pellicule
  return (
    <AbsoluteFill style={{background: night ? C.night : C.paper, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: h.x * width - (h.size * width) / 2,
          top: h.y * height - (h.size * width) / 2,
          width: h.size * width,
          height: h.size * width,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.orange} 0%, rgba(242,107,29,0) 62%)`,
          opacity: h.opacity ?? (night ? 0.32 : 0.12),
          filter: 'blur(60px)',
        }}
      />
      <AbsoluteFill
        style={{
          background: night
            ? 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'
            : 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(60,40,20,0.10) 100%)',
        }}
      />
      <Grain opacity={grain} seed={seed} />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{opacity?: number; seed?: number}> = ({opacity = 0.04, seed}) => {
  const frame = useCurrentFrame();
  const s = seed ?? Math.floor(frame / 2);
  const ox = Math.floor(random(`gx${s}`) * 200);
  const oy = Math.floor(random(`gy${s}`) * 200);
  return (
    <AbsoluteFill style={{opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id={`grain${s}`} x="0" y="0">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={s % 97} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect x={-ox} y={-oy} width="120%" height="120%" filter={`url(#grain${s})`} />
      </svg>
    </AbsoluteFill>
  );
};

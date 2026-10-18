import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FPS, POPPINS} from '../theme';
import type {Word} from '../voice';

export type TimedWord = Word & {f0: number; f1: number};

// Découpe en sous-titres de 2 lignes max (~34 caractères par ligne), coupés aux ponctuations fortes
export const chunkWords = (words: TimedWord[], maxChars = 34) => {
  const chunks: TimedWord[][][] = [];
  let lines: TimedWord[][] = [[]];
  let len = 0;
  const flush = () => {
    if (lines[0].length) chunks.push(lines.filter((l) => l.length));
    lines = [[]];
    len = 0;
  };
  words.forEach((w, i) => {
    const add = w.w.length + (len ? 1 : 0);
    if (len + add > maxChars) {
      if (lines.length === 2) flush();
      else {
        lines.push([]);
        len = 0;
      }
    }
    lines[lines.length - 1].push(w);
    len += w.w.length + (len ? 1 : 0);
    const gap = i + 1 < words.length ? words[i + 1].f0 - w.f1 : 99;
    if (/[.?!…]$/.test(w.w) || gap > FPS * 0.5) flush();
  });
  flush();
  return chunks;
};

// Sous-titres incrustés « karaoké » : mot en cours en orange, fond semi-transparent, bas d'écran
export const Captions: React.FC<{words: TimedWord[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const square = width === height;
  const chunks = chunkWords(words, portrait ? 24 : square ? 28 : 38);
  const cur = chunks.find((c) => {
    const all = c.flat();
    return frame >= all[0].f0 - 3 && frame <= all[all.length - 1].f1 + 8;
  });
  if (!cur) return null;
  const size = portrait ? 58 : square ? 44 : 46;
  const bottom = portrait ? 270 : square ? 90 : 72;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: bottom, pointerEvents: 'none'}}>
      <div
        style={{
          fontFamily: POPPINS,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.25,
          color: '#fff',
          textAlign: 'center',
          background: 'rgba(20,22,27,0.72)',
          borderRadius: 18,
          padding: `${size * 0.22}px ${size * 0.5}px`,
          maxWidth: portrait ? 940 : square ? 960 : 1500,
        }}
      >
        {cur.map((line, li) => (
          <div key={li}>
            {line.map((w, wi) => {
              const active = frame >= w.f0 && frame <= w.f1 + 2;
              const said = frame > w.f1;
              return (
                <span key={wi} style={{color: active ? C.orange : said ? '#fff' : 'rgba(255,255,255,0.78)'}}>
                  {(wi ? ' ' : '') + w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

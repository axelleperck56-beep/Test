import React from 'react';
import {C, POPPINS} from '../theme';

// Les 4 « cartes du problème » : BSD papier, ticket de pesée, tableur, téléphone qui sonne.
// Illustrations neutres (aucune marque réelle), dessinées en CSS.

const line = (w: string, o = 0.12, h = 10) => (
  <div style={{height: h, width: w, background: `rgba(26,29,35,${o})`, borderRadius: 4, marginTop: 12}} />
);

export const BsdCard: React.FC = () => (
  <div style={{width: 340, height: 440, background: '#FBF8F1', borderRadius: 10, padding: 28, fontFamily: POPPINS, color: C.ink, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)'}}>
    <div style={{fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: C.grey}}>BORDEREAU DE SUIVI DES DÉCHETS</div>
    <div style={{fontSize: 64, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 6}}>BSD</div>
    {line('90%')}
    {line('70%')}
    {line('82%')}
    <div style={{display: 'flex', gap: 12, marginTop: 22}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{flex: 1, height: 54, border: '2px dashed rgba(26,29,35,0.2)', borderRadius: 6}} />
      ))}
    </div>
    {line('60%')}
    {line('76%')}
    <div style={{marginTop: 26, height: 70, border: '2px solid rgba(26,29,35,0.18)', borderRadius: 8, position: 'relative'}}>
      <div style={{position: 'absolute', left: 12, top: 8, fontSize: 12, color: C.grey, fontWeight: 600}}>Signature</div>
    </div>
  </div>
);

export const TicketCard: React.FC = () => {
  const zig = Array.from({length: 13}, (_, i) => `${100 - (i / 12) * 100}% ${i % 2 ? 100 : 95}%`).join(',');
  return (
    <div
      style={{
        width: 250,
        height: 420,
        background: '#FFFFFF',
        padding: '26px 24px',
        fontFamily: 'ui-monospace, monospace',
        color: C.ink,
        clipPath: `polygon(0 0, 100% 0, 100% 95%, ${zig})`,
      }}
    >
      <div style={{fontFamily: POPPINS, fontWeight: 800, fontSize: 22, textAlign: 'center'}}>TICKET DE PESÉE</div>
      <div style={{borderTop: '2px dashed rgba(0,0,0,0.25)', margin: '14px 0'}} />
      {['BRUT', 'TARE', 'NET'].map((k) => (
        <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, marginTop: 14, fontWeight: 700}}>
          <span>{k}</span>
          <span style={{color: 'rgba(0,0,0,0.25)'}}>_____ kg</span>
        </div>
      ))}
      <div style={{borderTop: '2px dashed rgba(0,0,0,0.25)', margin: '18px 0'}} />
      {line('100%', 0.1, 8)}
      {line('80%', 0.1, 8)}
      {line('92%', 0.1, 8)}
      <div style={{display: 'flex', gap: 3, marginTop: 22, height: 50}}>
        {Array.from({length: 34}, (_, i) => (
          <div key={i} style={{width: (i * 7) % 3 === 0 ? 4 : 2, background: C.ink, opacity: 0.8}} />
        ))}
      </div>
    </div>
  );
};

export const SheetCard: React.FC = () => (
  <div style={{width: 430, height: 300, background: '#fff', borderRadius: 10, overflow: 'hidden', fontFamily: POPPINS, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)'}}>
    <div style={{height: 38, background: '#E9ECEF', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 15, fontWeight: 600, color: C.grey}}>
      suivi_voyages_v7_FINAL(2)
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '40px repeat(4, 1fr)'}}>
      {Array.from({length: 7 * 5}, (_, i) => {
        const r = Math.floor(i / 5), c = i % 5;
        const head = r === 0 || c === 0;
        const err = r === 4 && c === 3;
        return (
          <div
            key={i}
            style={{
              height: 36,
              borderRight: '1px solid #E3E6EA',
              borderBottom: '1px solid #E3E6EA',
              background: head ? '#F3F4F6' : err ? 'rgba(239,68,68,0.10)' : '#fff',
              fontSize: 14,
              fontWeight: head ? 600 : 400,
              color: err ? C.red : C.grey,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {r === 0 && c > 0 ? 'ABCD'[c - 1] : c === 0 && r > 0 ? r : err ? '#REF!' : ''}
            {!head && !err ? <div style={{width: '60%', height: 7, background: 'rgba(26,29,35,0.12)', borderRadius: 3}} /> : null}
          </div>
        );
      })}
    </div>
  </div>
);

export const PhoneCard: React.FC<{ringT?: number}> = ({ringT = 0}) => {
  const shake = Math.sin(ringT * 2.2) * 4 * (Math.sin(ringT * 0.4) > 0 ? 1 : 0);
  return (
    <div style={{width: 210, height: 420, borderRadius: 36, background: '#1E2026', padding: 12, transform: `rotate(${shake}deg)`, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.12)'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 26, background: 'linear-gradient(180deg,#2B2F38,#16181D)', fontFamily: POPPINS, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 70}}>
        <div style={{fontSize: 14, opacity: 0.6}}>Appel entrant…</div>
        <div style={{fontSize: 22, fontWeight: 600, marginTop: 8}}>Chantier</div>
        <div style={{width: 70, height: 70, borderRadius: 35, background: 'rgba(255,255,255,0.12)', marginTop: 30}} />
        <div style={{display: 'flex', gap: 46, marginTop: 'auto', marginBottom: 46}}>
          <div style={{width: 54, height: 54, borderRadius: 27, background: C.red}} />
          <div style={{width: 54, height: 54, borderRadius: 27, background: C.green}} />
        </div>
      </div>
    </div>
  );
};

// Positions finales de la pile (centre de chaque carte, rotation)
export const PILE = [
  {key: 'bsd', x: 1290, y: 520, r: -8, el: <BsdCard />, w: 340, h: 440},
  {key: 'ticket', x: 1560, y: 470, r: 11, el: <TicketCard />, w: 250, h: 420},
  {key: 'sheet', x: 1340, y: 720, r: 5, el: <SheetCard />, w: 430, h: 300},
  {key: 'phone', x: 1620, y: 690, r: -14, el: null as React.ReactNode, w: 210, h: 420},
] as const;

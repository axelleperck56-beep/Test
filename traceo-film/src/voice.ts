import voice from './voice.json';
import {FPS} from './theme';

export type Word = {w: string; s: number; e: number};
export type Line = {text: string; dur: number; words: Word[]};

// Voix off générée par scripts/voice.py (vide tant qu'aucune voix n'est fournie)
export const VOICE = voice as Record<string, Line>;
export const hasVoice = (key?: string) => !!key && !!VOICE[key];
export const voiceFrames = (key?: string) => (key && VOICE[key] ? Math.ceil(VOICE[key].dur * FPS) : 0);

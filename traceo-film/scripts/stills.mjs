// Rend des images fixes : node scripts/stills.mjs <dossier> <Compo:frame> [<Compo:frame> ...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, ...jobs] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const cache = {};
for (const job of jobs) {
  const [id, frame] = job.split(':');
  cache[id] ??= await selectComposition({serveUrl, id, browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', chromiumOptions: {gl: 'swangle'}});
  const output = path.join(outDir, `${id}-${String(frame).padStart(4, '0')}.png`);
  await renderStill({composition: cache[id], serveUrl, output, frame: Number(frame), browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', chromiumOptions: {gl: 'swangle'}});
  console.log('ok', output);
}

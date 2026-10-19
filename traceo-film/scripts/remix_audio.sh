#!/usr/bin/env bash
# Régénère seulement la piste son (voix + musique + bruitages) depuis Remotion et la recolle sur la vidéo existante.
#   bash scripts/remix_audio.sh [Master ShortRadar ...]   (sans argument : tout)
set -euo pipefail
cd "$(dirname "$0")/.."
ALL=(Master Reel916 Carre11 ShortRadar ShortChauffeur ShortCarte Bumper6s)
IDS=("${@:-${ALL[@]}}")
declare -A FILE=(
  [Master]="Traceo-film-16x9.mp4 Traceo-film-16x9-soustitres.mp4" [Reel916]=Traceo-reel-9x16.mp4 [Carre11]=Traceo-carre-1x1.mp4
  [ShortRadar]=Traceo-short-radar.mp4 [ShortChauffeur]=Traceo-short-chauffeur.mp4 [ShortCarte]=Traceo-short-carte.mp4
  [Bumper6s]=Traceo-bumper-6s.mp4
)
mkdir -p out/tmp
for id in "${IDS[@]}"; do
  echo "== son $id"
  npx remotion render src/index.ts "$id" "out/tmp/$id.wav" --codec=wav --log=error 2>&1 | grep -v -i "memory\|cgroup\|docker\|lower amount" || true
  for f in ${FILE[$id]}; do
    ffmpeg -y -loglevel error -i "out/$f" -i "out/tmp/$id.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "out/tmp/$f"
    mv "out/tmp/$f" "out/$f"
    python3 scripts/loudness.py "out/$f"
  done
done
python3 scripts/check.py

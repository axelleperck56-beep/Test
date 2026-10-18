#!/usr/bin/env bash
# Rend tous les livrables dans out/, normalise l'audio à -14 LUFS et vérifie chaque fichier.
#   bash scripts/render_all.sh [Master Reel916 ...]   (sans argument : tout)
set -euo pipefail
cd "$(dirname "$0")/.."
ALL=(Master MasterSousTitres Reel916 Carre11 ShortRadar ShortChauffeur ShortCarte Bumper6s)
IDS=("${@:-${ALL[@]}}")
declare -A FILE=(
  [Master]=Traceo-film-16x9.mp4 [MasterSousTitres]=Traceo-film-16x9-soustitres.mp4 [Reel916]=Traceo-reel-9x16.mp4
  [Carre11]=Traceo-carre-1x1.mp4 [ShortRadar]=Traceo-short-radar.mp4 [ShortChauffeur]=Traceo-short-chauffeur.mp4
  [ShortCarte]=Traceo-short-carte.mp4 [Bumper6s]=Traceo-bumper-6s.mp4
)
mkdir -p out/tmp
for id in "${IDS[@]}"; do
  f=${FILE[$id]}
  echo "== $id → out/$f"
  npx remotion render src/index.ts "$id" "out/tmp/$f" --crf=18 --audio-codec=aac --log=error 2>&1 | grep -v -i "memory\|cgroup\|docker\|lower amount" || true
  # audio : AAC 48 kHz, loudness -14 LUFS, crête -1,5 dBTP ; vidéo copiée telle quelle
  ffmpeg -y -loglevel error -i "out/tmp/$f" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 256k -movflags +faststart "out/$f"
  rm -f "out/tmp/$f"
done
npx remotion still src/index.ts MiniatureYouTube out/Traceo-miniature-youtube.png --log=error 2>&1 | grep -v -i "memory\|cgroup\|docker\|lower amount" || true
python3 scripts/srt.py Master
python3 scripts/check.py

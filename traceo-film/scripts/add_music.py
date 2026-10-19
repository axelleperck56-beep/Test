"""Mixe la musique de fond (public/music/<cut>.wav) dans les vidéos déjà rendues, sans refaire le rendu image.

  python3 scripts/add_music.py             -> src/music.json (gains utilisés par le montage Remotion)
  python3 scripts/add_music.py --postmix   -> mixe aussi la musique dans les out/*.mp4 déjà rendus (sans musique)

La musique est calée à MUSIC_LUFS (bien sous la voix à -14 LUFS), puis loudness.py ramène le mix à -14 LUFS.
"""
import pathlib, re, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT, MUSIC = ROOT / "out", ROOT / "public" / "music"
FILES = {
    "Master": "Traceo-film-16x9.mp4", "MasterSousTitres": "Traceo-film-16x9-soustitres.mp4", "Reel916": "Traceo-reel-9x16.mp4",
    "Carre11": "Traceo-carre-1x1.mp4", "ShortRadar": "Traceo-short-radar.mp4", "ShortChauffeur": "Traceo-short-chauffeur.mp4",
    "ShortCarte": "Traceo-short-carte.mp4", "Bumper6s": "Traceo-bumper-6s.mp4",
}
MUSIC_LUFS = {"Bumper6s": -19.0}  # sans voix : la musique porte le bumper
DEFAULT_LUFS = -24.5


def lufs(path):
    r = subprocess.run(["ffmpeg", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])


import json
gains = {}
for cid, wav in ((c, MUSIC / f"{c}.wav") for c in FILES):
    if wav.exists():
        gains[cid] = round(MUSIC_LUFS.get(cid, DEFAULT_LUFS) - lufs(wav), 2)
# mêmes gains pour le montage Remotion (src/music.json), qui joue la musique dans les prochains rendus
(ROOT / "src" / "music.json").write_text(json.dumps(gains, indent=1))
POSTMIX = "--postmix" in __import__("sys").argv
for cid, name in FILES.items():
    if not POSTMIX:
        break
    video, wav = OUT / name, MUSIC / f"{cid}.wav"
    if not video.exists() or not wav.exists():
        print("absent :", name); continue
    gain = MUSIC_LUFS.get(cid, DEFAULT_LUFS) - lufs(wav)
    tmp = video.with_suffix(".mix.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-i", str(wav), "-filter_complex",
                    f"[1:a]volume={gain:.2f}dB[m];[0:a][m]amix=inputs=2:normalize=0:duration=first[a]",
                    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
                    "-movflags", "+faststart", str(tmp)], check=True)
    tmp.replace(video)
    print(f"{name}: musique {gain:+.1f} dB")

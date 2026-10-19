"""Normalisation loudness en deux passes (mesure, puis correction linéaire) : -14 LUFS, crête -1,5 dBTP.

  python3 scripts/loudness.py            -> toutes les vidéos de out/
"""
import json, pathlib, re, subprocess, sys

OUT = pathlib.Path(__file__).resolve().parent.parent / "out"
TARGET = "I=-14:TP=-1.5:LRA=11"

files = [pathlib.Path(a) for a in sys.argv[1:]] or sorted(OUT.glob("Traceo-*.mp4"))
for f in files:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(f), "-af", f"loudnorm={TARGET}:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr).group(0))
    af = (f"loudnorm={TARGET}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    tmp = f.with_suffix(".tmp.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(f), "-c:v", "copy", "-af", af, "-ar", "48000",
                    "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", str(tmp)], check=True)
    tmp.replace(f)
    print(f"{f.name}: {m['input_i']} → -14 LUFS")

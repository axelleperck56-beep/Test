"""Vérifie chaque livrable : durée, résolution, présence du son, loudness, pas d'écran noir."""
import json, pathlib, re, subprocess

OUT = pathlib.Path(__file__).resolve().parent.parent / "out"


def probe(f):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate", "-of", "json", str(f)], capture_output=True, text=True)
    return json.loads(r.stdout)


rows = []
for f in sorted(OUT.glob("Traceo-*.mp4")):
    p = probe(f)
    v = next(s for s in p["streams"] if s["codec_type"] == "video")
    has_audio = any(s["codec_type"] == "audio" for s in p["streams"])
    lufs = "-"
    if has_audio:
        r = subprocess.run(["ffmpeg", "-i", str(f), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
        m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
        lufs = m[-1] if m else "?"
    r = subprocess.run(["ffmpeg", "-i", str(f), "-vf", "blackdetect=d=0.5:pix_th=0.05", "-an", "-f", "null", "-"], capture_output=True, text=True)
    blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", r.stderr)
    dur = float(p["format"]["duration"])
    # le fondu final vers le noir est voulu : on ne signale que les noirs qui ne touchent pas la fin
    bad = [b for b in blacks if float(b[1]) < dur - 0.2]
    rows.append(f"{f.name:38s} {v['width']}x{v['height']} {v['r_frame_rate']:>5s} {dur:6.1f}s  son={'oui' if has_audio else 'NON'}  {lufs} LUFS  noir={'OK' if not bad else bad}")
for x in sorted(OUT.glob("*.png")) + sorted(OUT.glob("*.srt")):
    rows.append(f"{x.name:38s} {x.stat().st_size // 1024} Ko")
report = "\n".join(rows)
(OUT / "verification.txt").write_text(report + "\n")
print(report)

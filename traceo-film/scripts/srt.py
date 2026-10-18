"""Sous-titres .srt calés sur la voix, avec le même minutage que le montage Remotion (src/Master.tsx).

  python3 scripts/srt.py [Master]  -> out/Traceo-film.srt
"""
import json, math, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FPS = 30
J = json.loads((ROOT / "src/cuts.json").read_text())
V = json.loads((ROOT / "src/voice.json").read_text())


def cut(cid):
    c = J["cuts"][cid]
    return {**J["cuts"][c["same"]], **c} if "same" in c else c


def lead(it): return J["voiceLead"].get(it["s"], J["lead"])
def vframes(k): return math.ceil(V[k]["dur"] * FPS) if k in V else 0
def dur(it): return max(it.get("min", J["base"][it["s"]]), lead(it) + vframes(it["v"]) + J["tail"] if vframes(it.get("v")) else 0)


def words(c):
    t, out = 0, []
    for i, it in enumerate(c["items"]):
        if it.get("v") in V:
            out += [{**w, "f0": round(t + lead(it) + w["s"] * FPS), "f1": round(t + lead(it) + w["e"] * FPS)} for w in V[it["v"]]["words"]]
        tr = c["tr"][i] if i < len(c["tr"]) else ["cut"]
        t += dur(it) - (tr[1] if tr[0] != "cut" else 0)
    return out


def chunks(ws, max_chars=42):
    """Même découpage que le composant Captions : 2 lignes max, coupure aux ponctuations fortes."""
    res, lines, ln = [], [[]], 0
    def flush():
        nonlocal lines, ln
        if lines[0]: res.append([l for l in lines if l])
        lines, ln = [[]], 0
    for i, w in enumerate(ws):
        add = len(w["w"]) + (1 if ln else 0)
        if ln + add > max_chars:
            if len(lines) == 2: flush()
            else: lines.append([]); ln = 0
        lines[-1].append(w); ln += len(w["w"]) + (1 if ln else 0)
        gap = ws[i + 1]["f0"] - w["f1"] if i + 1 < len(ws) else 99
        if re.search(r"[.?!…]$", w["w"]) or gap > FPS * 0.5: flush()
    flush()
    return res


def ts(f):
    ms = round(f / FPS * 1000)
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


if __name__ == "__main__":
    cid = sys.argv[1] if len(sys.argv) > 1 else "Master"
    out = ROOT / "out" / ("Traceo-film.srt" if cid == "Master" else f"Traceo-{cid}.srt")
    blocks = []
    for n, ch in enumerate(chunks(words(cut(cid))), 1):
        flat = [w for l in ch for w in l]
        blocks.append(f"{n}\n{ts(flat[0]['f0'])} --> {ts(flat[-1]['f1'] + 8)}\n" + "\n".join(" ".join(w["w"] for w in l) for l in ch) + "\n")
    out.write_text("\n".join(blocks), encoding="utf-8")
    print(out, len(blocks), "sous-titres")

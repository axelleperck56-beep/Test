"""Musique de fond originale (synthétisée, libre de droits), calée sur chaque montage.

  python3 scripts/music.py            -> public/music/<cut>.wav pour chaque montage de src/cuts.json + Bumper6s

Style corporate/tech chaleureux, 120 BPM, Fa majeur (Fa – Do – Rém – Si♭).
- partie « problème » retenue (nappe + arpège), le groove démarre quand Tracéo apparaît ;
- montée avant le packshot, accord final tenu sur le logo ;
- ducking : la musique baisse d'environ 10 dB pendant que la voix parle (minutage mot à mot).
"""
import math, pathlib, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import srt  # même minutage que le montage Remotion

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "music"
SR, FPS, BPM = 48000, 30, 120
BEAT = 60 / BPM
BAR = 4 * BEAT
CHORDS = [  # basse, accord (notes MIDI)
    (41, [65, 69, 72, 76]),  # Fa maj7
    (36, [64, 67, 72, 74]),  # Do add9
    (38, [62, 65, 69, 72]),  # Ré m7
    (34, [62, 65, 70, 74]),  # Si♭ add9
]
rng = np.random.default_rng(11)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
lp = lambda x, f, o=2: sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f, o=2: sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
tt = lambda d: np.arange(int(d * SR)) / SR


def place(buf, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(buf): return
    sig = sig[: len(buf) - i]
    l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    buf[i:i + len(sig), 0] += sig * gain * l
    buf[i:i + len(sig), 1] += sig * gain * r


def pad(notes, d, bright):
    t = tt(d); s = np.zeros_like(t)
    for m in notes:
        for det in (-0.07, 0.0, 0.07):
            f = hz(m + det)
            s += 2 * ((f * t + rng.random()) % 1) - 1
    s = lp(s / (len(notes) * 3), bright)
    a = np.minimum(t / 0.6, 1) * np.minimum((d - t) / 0.5, 1)
    return s * np.clip(a, 0, 1)


def pluck(m, d=0.45):
    t = tt(d); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * (2 * ((f * t) % 1) - 1)
    return lp(s * np.exp(-t * 7), 4200) * np.minimum(t / 0.004, 1)


def bass(m, d):
    t = tt(d); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return s * np.minimum(t / 0.01, 1) * np.exp(-t * 2.2)


def kick():
    t = tt(0.35); f = 48 + 90 * np.exp(-t * 30)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 1.4)


def hat(d=0.05):
    t = tt(d); return hp(rng.normal(0, 1, len(t)), 8000) * np.exp(-t * 80)


def clap():
    t = tt(0.2); n = sosfilt(butter(2, [1000, 3500], "band", fs=SR, output="sos"), rng.normal(0, 1, len(t)))
    return n * np.exp(-t * 22) * 0.6


def riser(d):
    t = tt(d); x = rng.normal(0, 1, len(t)); out = np.zeros_like(x)
    for k in range(0, len(x), 2048):
        fc = 400 * (9000 / 400) ** (k / len(x))
        out[k:k + 2048] = sosfilt(butter(2, [fc * 0.6, min(fc * 1.6, SR / 2 - 100)], "band", fs=SR, output="sos"), x[k:k + 2048])
    return out * (t / d) ** 2


def compose(D, groove, end, speech):
    """D : durée (s) ; groove : début du groove ; end : début du packshot (accord final) ; speech : [(t0, t1)]."""
    n = int((D + 1.5) * SR)
    mel = np.zeros((n, 2)); drums = np.zeros((n, 2))
    bars = int(D / BAR) + 2
    for b in range(bars):
        t0 = b * BAR
        if t0 >= end: break
        root, ch = CHORDS[b % 4]
        on = t0 >= groove - 1e-6
        place(mel, pad(ch, BAR + 0.3, 1400 if not on else 2200), t0, 0.22 if not on else 0.26)
        # arpège en croches, motif montant/descendant
        order = [0, 1, 2, 3, 2, 1, 2, 3] if b % 2 == 0 else [0, 2, 1, 3, 2, 3, 1, 2]
        for k, idx in enumerate(order):
            tk = t0 + k * BEAT / 2
            if tk >= end - 0.05: break
            vel = 0.20 if not on else 0.24
            place(mel, pluck(ch[idx] + 12), tk, vel * (1.0 if k % 2 == 0 else 0.75), pan=(-0.4 if k % 2 else 0.4))
            place(mel, pluck(ch[idx] + 12) * 0.35, tk + 3 * BEAT / 4, vel, pan=(0.5 if k % 2 else -0.5))  # écho
        if on:
            for k in range(4):
                tk = t0 + k * BEAT
                if tk >= end - BEAT / 2: break
                place(drums, kick(), tk, 0.55)
                place(mel, bass(root, BEAT * 0.9), tk, 0.42)
                place(drums, hat(), tk + BEAT / 2, 0.12, pan=0.3)
                if k in (1, 3): place(drums, clap(), tk, 0.22, pan=-0.2)
    # montée puis accord final tenu
    rd = min(2.0, max(0.6, end - groove - 0.1))
    place(mel, riser(rd), max(0, end - rd), 0.10)
    tail = D - end + 1.5
    root, ch = CHORDS[0]
    place(mel, pad(ch + [ch[0] + 12], tail, 2600), end, 0.34)
    place(mel, bass(root, tail) * np.exp(-tt(tail) * 0.3), end, 0.5)
    place(drums, kick() * 1.3, end, 0.6)
    mix = mel + drums
    # pompage léger sur les temps du groove
    pump = np.ones(n)
    for b in range(bars * 4):
        tk = b * BEAT
        if groove <= tk < end:
            i = int(tk * SR); L = int(0.25 * SR)
            pump[i:i + L] = np.minimum(pump[i:i + L], (1 - 0.35 * np.exp(-np.arange(L) / SR * 14))[: max(0, n - i)][:len(pump[i:i + L])])
    mix *= pump[:, None]
    # ducking sous la voix
    g = np.ones(n)
    for a, b in speech:
        g[int(a * SR):int(b * SR)] = 0.32
    k = int(0.18 * SR)
    g = np.convolve(g, np.ones(k) / k, mode="same")
    mix *= g[:, None]
    # fondu final et nettoyage
    fade = np.ones(n); fi = int((D - 0.6) * SR); fade[fi:] = np.linspace(1, 0, n - fi)
    mix *= fade[:, None]
    mix = np.stack([hp(mix[:, c], 35) for c in range(2)], 1)
    mix = np.tanh(mix * 1.2) / 1.2
    return mix[: int(D * SR)]


def timeline(cid):
    c = srt.cut(cid); t, starts = 0, []
    for i, it in enumerate(c["items"]):
        starts.append((it["s"], t / FPS))
        tr = c["tr"][i] if i < len(c["tr"]) else ["cut"]
        t += srt.dur(it) - (tr[1] if tr[0] != "cut" else 0)
    last = c["items"][-1]
    total = (t + (c["tr"][-1][1] if len(c["tr"]) >= len(c["items"]) and c["tr"][-1][0] != "cut" else 0)) / FPS
    total = starts[-1][1] + srt.dur(last) / FPS
    return c, starts, total


def speech_spans(c):
    ws = srt.words(c); spans = []
    for w in ws:
        a, b = w["f0"] / FPS - 0.12, w["f1"] / FPS + 0.25
        if spans and a - spans[-1][1] < 0.45: spans[-1][1] = b
        else: spans.append([a, b])
    return spans


def write(path, x):
    x = x / max(1e-9, np.max(np.abs(x))) * 0.7
    pcm = (x * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for cid in srt.J["cuts"]:
        c, starts, D = timeline(cid)
        names = [s for s, _ in starts]
        # le groove démarre avec le produit (scène 4) ou juste après l'accroche des shorts
        groove = dict(starts).get("S04", starts[1][1] if len(starts) > 1 else 0)
        groove = math.ceil(groove / BEAT - 0.25) * BEAT
        end = dict(starts).get("S12", D - 5)
        write(OUT / f"{cid}.wav", compose(D, groove, end, speech_spans(c)))
        print(f"{cid:18s} {D:5.1f}s  groove {groove:4.1f}s  final {end:4.1f}s")
    write(OUT / "Bumper6s.wav", compose(6.0, 0.0, 0.67, []))
    print("Bumper6s            6.0s")

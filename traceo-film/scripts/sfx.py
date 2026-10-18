"""Bruitages synthétisés (numpy/scipy), libres de droits : public/sfx/*.wav (48 kHz stéréo)."""
import pathlib, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)
tt = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)


def verb(x, amt=.25, dur=1.2):
    t = tt(dur); ir = rng.normal(0, 1, len(t)) * np.exp(-t * 4); ir = lp(ir, 5000)
    w = np.pad(fftconvolve(x, ir), (0, 1))[: len(x) + len(t)] * .02
    y = np.concatenate([x, np.zeros(len(t))]) + w * amt
    return y


def save(name, x, width=0.0):
    x = x / (np.max(np.abs(x)) + 1e-9) * .9
    d = int(.004 * SR * width)
    l, r = x, np.concatenate([np.zeros(d), x[: len(x) - d]]) if d else x
    pcm = (np.stack([l, r], 1) * 32767).astype("<i2")
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def sweep_noise(d, lo, hi, rise=True):
    t = tt(d); x = rng.normal(0, 1, len(t)); out = np.zeros_like(x); seg = 1024
    for k in range(0, len(x), seg):
        u = k / len(x); u = u if rise else 1 - u
        fc = lo * (hi / lo) ** u
        out[k:k + seg] = bp(x[max(0, k - 2048):k + seg], fc * .6, min(fc * 1.7, SR / 2 - 200))[-len(x[k:k + seg]):]
    return out


# whoosh de transition : monte puis retombe (pic à 60 %)
t = tt(.55); env = np.where(t < .33, (t / .33) ** 2, np.exp(-(t - .33) * 14))
save("whoosh", verb(sweep_noise(.55, 300, 7000) * env, .3), 1)
# whoosh court (wipe 8 images)
t = tt(.3); env = np.sin(np.pi * t / .3) ** 2
save("swish", sweep_noise(.3, 800, 9000) * env, 1)
# clic souris
t = tt(.05); c = hp(rng.normal(0, 1, len(t)), 2500) * np.exp(-t * 300) + np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 200) * .5
save("click", c)
# tick de compteur
t = tt(.03); save("tick", np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 260))
# pop (apparition de carte)
t = tt(.14); f = 900 * np.exp(-t * 28) + 260
save("pop", verb(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30), .2))
# impact grave (logo)
t = tt(2.4); f = 32 + 80 * np.exp(-t * 7)
boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.3)
noise = lp(rng.normal(0, 1, len(t)), 2200) * np.exp(-t * 10) * .45
save("impact", verb(np.tanh((boom + noise) * 1.8), .5), .5)
# riser (avant zoom-through)
t = tt(1.2); f = 120 * 2 ** (t / 1.2 * 3); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
save("riser", lp(saw, 3500) * (t / 1.2) ** 2 * .4 + sweep_noise(1.2, 200, 8000) * (t / 1.2) ** 2.5, 1)
# succès (check vert)
t = tt(.6); s = sum(np.sin(2 * np.pi * f0 * t) * a * np.exp(-t * 7) for f0, a in ((1046.5, 1), (1568, .6)))
s2 = np.zeros_like(s); k = int(.07 * SR); s2[k:] = s[:-k]
save("success", verb(s * .6 + s2, .3))
# froissement papier (cartes du problème)
t = tt(.35); save("paper", bp(rng.normal(0, 1, len(t)), 1500, 6000) * np.exp(-t * 9) * (1 + .6 * np.sin(t * 180)))
# trait de feutre (barré orange)
t = tt(.25); save("marker", bp(rng.normal(0, 1, len(t)), 2500, 7000) * np.sin(np.pi * t / .25) ** .5 * .6)
# sonnerie de téléphone
t = tt(1.0); ring = (np.sin(2 * np.pi * 1400 * t) + np.sin(2 * np.pi * 1750 * t)) * (np.sin(2 * np.pi * 20 * t) > 0) * ((t % .5) < .35)
save("ring", ring * .5)
print(sorted(p.name for p in OUT.iterdir()))

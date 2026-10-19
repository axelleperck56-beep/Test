"""Voix off du film et des shorts.

Deux sources possibles :
  A) API ElevenLabs (recommandé : minutage mot à mot exact)
       ELEVENLABS_API_KEY=...  [ELEVENLABS_VOICE="Marine"]  python3 scripts/voice.py api
     La voix est cherchée par son nom dans votre bibliothèque ElevenLabs (ou ELEVENLABS_VOICE_ID).
  B) MP3 déjà exportés depuis ElevenLabs, un fichier par réplique, nommés comme les clés de LINES
       (assets/voix/S02.mp3, assets/voix/S03.mp3, …)          python3 scripts/voice.py files
     ou un seul assets/voix/voix-off.mp3 avec un silence entre les répliques :
                                                              python3 scripts/voice.py single
     Dans ces deux cas, le minutage des mots est estimé à partir de la longueur des mots.

Sortie : public/voice/<clé>.mp3 + src/voice.json (durées et mots horodatés).
"""
import base64, json, os, pathlib, re, subprocess, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "voice"
JSON_OUT = ROOT / "src" / "voice.json"
ASSETS = ROOT / "assets" / "voix"

# Texte de la voix off (brief), découpé par scène. Les shorts ont leurs propres accroches (H*).
LINES = {
    "S02": "Des BSD partout. Des tickets de pesée perdus. Des voyages terminés… mais jamais facturés.",
    "S03": "Et si tout tenait dans un seul outil ?",
    "S04": "Voici Tracéo. Votre journée, en un coup d’œil : les tâches, les camions, les documents.",
    "S05": "Le Radar vous montre l’argent qui vous échappe : voyages non facturés, kilomètres à vide, attentes, surconsommation.",
    "S06": "Suivez vos camions en temps réel, sur la carte.",
    "S06B": "Chaque camion, sa benne et sa charge, sur une seule fiche.",
    "S07": "Connaissez la vraie marge de chaque voyage, de chaque client, de chaque camion.",
    "S08": "Du chantier à la facture, sans ressaisie.",
    "S09": "Et vos chauffeurs valident tout depuis leur téléphone.",
    "S10": "Flotte, conformité, sous-traitance, relances : tout est relié.",
    "S12": "Tracéo. Gérer. Suivre. Optimiser. Demandez votre démo.",
    # accroches des shorts / TikTok
    "H_RADAR": "Votre argent vous échappe ? Le Radar de Tracéo vous montre où.",
    "H_CHAUFFEUR": "Fini les BSD papier dans la cabine.",
    "H_CARTE": "Où sont vos camions, là, maintenant ?",
    "CTA_SHORT": "Tracéo. Demandez votre démo.",
}
# Prononciation (seulement pour la synthèse, pas pour les sous-titres)
SAY = [(r"\bBSD\b", "bé-ès-dé")]


def say(text):
    for a, b in SAY:
        text = re.sub(a, b, text)
    return text


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    return float(r.stdout.strip())


def words_from_text(text, dur, lead=0.05, tail=0.1):
    """Minutage estimé : proportionnel au nombre de caractères, pauses sur la ponctuation."""
    toks = text.split()
    weights = [len(t) + (6 if re.search(r"[.?!…:]$", t) else 3 if t.endswith(",") else 1) for t in toks]
    total = sum(weights); span = max(0.1, dur - lead - tail); t = lead; out = []
    for tok, w in zip(toks, weights):
        d = span * w / total
        out.append({"w": tok, "s": round(t, 3), "e": round(t + d * 0.9, 3)}); t += d
    return out


def words_from_alignment(text, al):
    """Regroupe l'alignement caractère par caractère d'ElevenLabs en mots (sur le texte prononcé)."""
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    spoken = "".join(chars)
    toks = []
    i = 0
    for m in re.finditer(r"\S+", spoken):
        toks.append({"s": st[m.start()], "e": en[m.end() - 1]})
    shown = text.split()
    if len(shown) == len(toks):
        return [{"w": w, "s": round(t["s"], 3), "e": round(t["e"], 3)} for w, t in zip(shown, toks)]
    # le texte prononcé diffère (prononciation) : on garde le début/fin réels et on répartit
    return words_from_text(text, toks[-1]["e"] + 0.1, lead=toks[0]["s"])


def api_get(url, key):
    req = urllib.request.Request(url, headers={"xi-api-key": key})
    return json.loads(urllib.request.urlopen(req, timeout=60).read())


def run_api():
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("ELEVENLABS_API_KEY manquante (à ajouter dans les variables de l'environnement).")
    vid = os.environ.get("ELEVENLABS_VOICE_ID")
    if not vid:
        name = os.environ.get("ELEVENLABS_VOICE", "Marine").lower()
        voices = api_get("https://api.elevenlabs.io/v1/voices", key)["voices"]
        match = [v for v in voices if name in v["name"].lower()]
        if not match:
            sys.exit("Voix introuvable dans la bibliothèque : " + ", ".join(v["name"] for v in voices))
        vid = match[0]["voice_id"]
        print("voix :", match[0]["name"], vid)
    data = {}
    keys = list(LINES)
    only = sys.argv[2:]  # ex. : voice.py api S06B -> ne régénère que ces répliques
    for i, k in enumerate(keys):
        if only and k not in only:
            continue
        body = {
            "text": say(LINES[k]),
            "model_id": os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2"),
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True},
            # contexte pour une intonation continue entre les répliques du film
            "previous_text": say(LINES[keys[i - 1]]) if i and k.startswith("S") else None,
            "next_text": say(LINES[keys[i + 1]]) if i + 1 < len(keys) and k.startswith("S") and keys[i + 1].startswith("S") else None,
        }
        body = {a: b for a, b in body.items() if b is not None}
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128",
                                     data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json"})
        res = json.loads(urllib.request.urlopen(req, timeout=120).read())
        mp3 = OUT / f"{k}.mp3"; mp3.write_bytes(base64.b64decode(res["audio_base64"]))
        words = words_from_alignment(LINES[k], res["alignment"])
        data[k] = {"text": LINES[k], "dur": round(duration(mp3), 3), "words": words}
        print("ok", k, data[k]["dur"], "s")
    return data


def run_files():
    data = {}
    for k, text in LINES.items():
        src = ASSETS / f"{k}.mp3"
        if not src.exists():
            print("absent :", src.name); continue
        dst = OUT / f"{k}.mp3"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse", str(dst)], check=True)
        d = duration(dst); data[k] = {"text": text, "dur": round(d, 3), "words": words_from_text(text, d)}
        print("ok", k, data[k]["dur"], "s")
    return data


def run_single():
    src = ASSETS / "voix-off.mp3"
    film = [k for k in LINES if k.startswith("S")]
    r = subprocess.run(["ffmpeg", "-i", str(src), "-af", "silencedetect=noise=-40dB:d=0.45", "-f", "null", "-"], capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    total = duration(src)
    # segments parlés entre les silences ; on garde les plus longs silences comme coupures de répliques
    gaps = sorted(zip(starts, ends), key=lambda g: g[0] - g[1])[: len(film) - 1]
    cuts = sorted(gaps)
    bounds = [0.0] + [((a + b) / 2) for a, b in cuts] + [total]
    if len(bounds) - 1 != len(film):
        sys.exit(f"{len(bounds) - 1} segments trouvés pour {len(film)} répliques : exportez plutôt un fichier par réplique.")
    data = {}
    for k, a, b in zip(film, bounds, bounds[1:]):
        dst = OUT / f"{k}.mp3"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(a), "-to", str(b), "-i", str(src), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse", str(dst)], check=True)
        d = duration(dst); data[k] = {"text": LINES[k], "dur": round(d, 3), "words": words_from_text(LINES[k], d)}
        print("ok", k, data[k]["dur"], "s")
    return data


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    mode = sys.argv[1] if len(sys.argv) > 1 else "api"
    data = {"api": run_api, "files": run_files, "single": run_single}[mode]()
    if JSON_OUT.exists() and len(sys.argv) > 2:
        data = {**json.loads(JSON_OUT.read_text()), **data}
    JSON_OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1))
    print("→", JSON_OUT, len(data), "répliques")

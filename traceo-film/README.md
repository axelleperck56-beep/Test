# Film Tracéo (Remotion)

Film de présentation de Tracéo by NODEVA et ses déclinaisons, montés en code avec Remotion.
Toutes les données à l'écran viennent de la démo publique (mode « Transports Démo Nord », données fictives).

## Livrables (`out/`)

| Fichier | Format | Contenu |
|---|---|---|
| `Traceo-film-16x9.mp4` | 1920×1080 | Master, ~90 s |
| `Traceo-film-16x9-soustitres.mp4` | 1920×1080 | Master avec sous-titres karaoké |
| `Traceo-reel-9x16.mp4` | 1080×1920 | Reel / TikTok / Shorts, scènes 1-2-3-4-6-12 |
| `Traceo-carre-1x1.mp4` | 1080×1080 | LinkedIn / Facebook |
| `Traceo-short-radar.mp4` | 1080×1920 | Short « Votre argent vous échappe ? » |
| `Traceo-short-chauffeur.mp4` | 1080×1920 | Short « Fini les BSD papier dans la cabine. » |
| `Traceo-short-carte.mp4` | 1080×1920 | Short « Où sont vos camions, là, maintenant ? » |
| `Traceo-bumper-6s.mp4` | 1920×1080 | Bumper YouTube |
| `Traceo-film.srt` | — | Sous-titres du master |
| `Traceo-miniature-youtube.png` | 1280×720 | Miniature |
| `storyboard.png` | — | Planche contact, 1 image par scène |

## Voix off (ElevenLabs, voix « Marine »)

Les répliques sont dans `scripts/voice.py` (dictionnaire `LINES`). Deux façons de les fournir :

1. **API** : ajouter `ELEVENLABS_API_KEY` dans les variables de l'environnement, puis
   `python3 scripts/voice.py api` (la voix est cherchée par son nom, « Marine », dans la bibliothèque du compte).
2. **Fichiers exportés depuis ElevenLabs** : un MP3 par réplique dans `assets/voix/`, nommé comme sa clé
   (`S02.mp3`, `S03.mp3`, …, `H_RADAR.mp3`, `CTA_SHORT.mp3`), puis `python3 scripts/voice.py files`.

Les scènes s'allongent automatiquement si une réplique est plus longue que le plan prévu.

## Commandes

```bash
npm install
python3 scripts/capture.py          # captures de la démo (Playwright)
python3 scripts/sfx.py              # bruitages synthétisés
bash scripts/render_all.sh          # tous les livrables + audio à -14 LUFS + vérification (out/verification.txt)
npx remotion studio src/index.ts    # prévisualisation interactive
```

Le montage de chaque déclinaison (scènes, transitions, durées) se règle dans `src/cuts.json`.

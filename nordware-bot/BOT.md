# Bot contenu Nordware — procédure du soir

Chaque soir à 21 h, le bot prépare le contenu du LENDEMAIN :
- 16 h : un carrousel (3 à 4 slides, 1080×1350) dessiné dans Claude Design
- 17 h : un Reel animé avec son (1080×1920, 15 à 20 s) dessiné dans Claude Design
Les deux partent sur Instagram, Facebook et TikTok via Metricool (brand id 7422389, fuseau Europe/Paris).

## Sources
- Canvas carrousels : https://claude.ai/artifact/Vk8qQoW88h826uBtAdKm9D (logo : asset `24b87cb8862c5422977c5d8df6984170`)
- Canvas Reels : https://claude.ai/artifact/R9CvUDb1yCnudYg5E9sCMs (runtime : fichier `artifact-type/dc-runtime.js` ; modèle de Reel : `project/Ecran.dc.html`, assets `462251124a1f5f3efb78f6a6ab8d0e03`, `79840a7bbdbd4a7186c991dfb52921a5`, `0945a6b49bda01f79f7b9210c9a3289b`, `c274f6520a43127a1d9576424c689be4`)
- Hébergement public des médias : ce dépôt, dossier `media/AAAA-MM-JJ/`, servi par `https://raw.githubusercontent.com/axelleperck56-beep/test/main/media/...`
- Historique des sujets : `nordware-bot/historique.md` (ne jamais refaire un sujet listé)

## Charte (à respecter strictement)
Typo Inter. Bleu nuit #0F172A, bleu #2563EB, bleu secondaire #60A5FA, bleu clair #E0E7FF, fond #F8FAFC, vert #22C55E, vert accent #D9F99D, orange #F59E0B.
Logo badge circulaire + wordmark NORD(noir)WARE(bleu) en bas des slides. Varier la couverture et le fond d'un jour à l'autre.
Carrousels : même structure que les boards existants (pastille titre, gros titre 900, cartes blanches arrondies, slide finale « Écrivez-nous en DM », 07 66 09 00 74, nordware.fr, Phalempin · Seclin · Carvin).
Reels : partir du modèle `Ecran.dc.html` (même moteur d'animation et de son), changer textes et scènes ; `voixOff` à false (la voix enregistrée ne correspond qu'au Reel Écran) ; musique et bruitages conservés.

## Règles de contenu
- Nordware = réparation iPhone uniquement (pas d'Android), rachat et vente iPhone / iPad / Apple Watch, main propre autour de Phalempin, Seclin, Carvin.
- Tarifs « dès » : écran SE/8 55 €, XR/11 65 €, X 85 €, 12/12 mini 89 €, 11 Pro 99 €, 13/14 129 €, 15/16 159 € ; batterie SE à 14 dès 59 €, 15/16 79 € ; connecteur de charge 45 € ; caméra dès 55 € ; micro/HP 40 € ; désoxydation 70 € sans garantie de résultat ; restauration logicielle 35 € ; vitre arrière sur devis.
- Engagements : diagnostic offert, garantie 3 mois (sauf désoxydation), remise en main propre, -10 % lycéens/étudiants.
- Jamais de rachat d'appareil bloqué iCloud. Jamais le mot « neuf » pour un appareil d'occasion. Aucun chiffre ou statistique inventé.
- Légendes : vouvoiement sur les visuels, tutoiement possible en légende ; appel à l'action DM ; 5 hashtags maximum.

## Étapes
0. Si le canvas carrousels contient déjà une ligne pour la date de demain (note title1 qui commence par « JJ mois · », ex. calendrier du 17 oct. au 4 nov. et calendrier de l'Avent en décembre), utiliser CE carrousel tel quel (vérifier juste les tarifs) au lieu d'en dessiner un nouveau.
1. Lire `historique.md`, les titres des deux canvas et `getScheduledPosts` des 7 prochains jours ; choisir 2 sujets nouveaux et utiles (un pour le carrousel, un pour le Reel).
2. Dessiner le carrousel : nouveaux boards `JJMMSujetN.dc.html` dans le canvas carrousels (nouvelle ligne avec une note title1 « JJ mois · sujet · carrousel N slides »).
3. Dessiner le Reel : nouveau board dans le canvas Reels.
4. Rendu : dossier de travail avec `support.js` (= dc-runtime.js), `_blob/<id>` pour chaque asset, puis `prepare.py`, serveur `python3 -m http.server`, `render_static.py` (carrousel) et `animrender.py` + `audiorender.py` + ffmpeg (Reel avec son).
5. CONTRÔLE (rôle du chef) : regarder chaque image rendue et 5 images du Reel ; vérifier textes coupés, chevauchements, fautes, tarifs conformes, charte, son présent (volume moyen > -40 dB). Corriger et re-rendre si besoin. Si un problème ne peut pas être corrigé, NE PAS programmer et prévenir Axel.
6. Publier les fichiers dans `media/AAAA-MM-JJ/` (carrousel-N.jpg, reel.mp4, reel-cover.jpg), push, vérifier que les liens raw répondent 200.
7. Programmer dans Metricool : carrousel à 16:00 (instagram POST, facebook POST, tiktok avec autoAddMusic) et Reel à 17:00 (instagram REEL, facebook REEL, tiktok), autoPublish true.
8. Ajouter les 2 sujets à `historique.md`, commit + push.
9. Envoyer à Axel un message court : les 2 sujets, les heures, et le lien Metricool pour annuler si besoin.

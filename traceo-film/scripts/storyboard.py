"""Planche contact : 1 image par scène + minutage et texte à l'écran -> out/storyboard.png"""
import glob, pathlib
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
F = lambda w, s: ImageFont.truetype(str(ROOT / f"public/fonts/Poppins-{w}.ttf"), s)
# (titre, minutage master, texte à l'écran)
INFO = [
    ("Logo", "0:00", "Tracéo — by NODEVA"),
    ("Le problème", "0:04", "Des BSD partout. Des tickets perdus. Des voyages oubliés."),
    ("Zoom-through", "0:14", "Et si tout tenait dans un seul outil ?"),
    ("Tableau de bord", "0:21", "Votre journée, en un coup d’œil."),
    ("Radar", "0:29", "Le Radar vous montre l’argent qui vous échappe."),
    ("Carte en direct", "0:39", "Vos camions en temps réel."),
    ("Rentabilité", "0:46", "La vraie marge de chaque voyage."),
    ("BSD + clôture", "0:54", "Du chantier à la facture, sans ressaisie."),
    ("Appli chauffeur", "1:01", "Le chauffeur valide tout depuis son téléphone."),
    ("Mosaïque", "1:07", "Flotte, conformité, sous-traitance, relances… tout est relié."),
    ("Bénéfices", "1:14", "Moins d’admin. · Plus de marge. · Zéro document perdu."),
    ("Packshot", "1:21", "Gérer. Suivre. Optimiser. — contact@nodeva.fr"),
]
frames = sorted(glob.glob(str(ROOT / "out/storyboard-frames/*.png")))
assert len(frames) == 12, len(frames)
TW, TH, CAP, M = 760, 428, 116, 40
cols, rows = 4, 3
W = cols * TW + (cols + 1) * M
H = 190 + rows * (TH + CAP) + (rows + 1) * M
sheet = Image.new("RGB", (W, H), "#14161B")
d = ImageDraw.Draw(sheet)
d.text((M, 50), "Tracéo — film de présentation · storyboard", font=F("ExtraBold", 54), fill="#FFFFFF")
d.text((M, 122), "Master 16:9 · 1920×1080 · 30 i/s · ~90 s · images extraites du rendu Remotion (données de démo fictives)", font=F("Regular", 26), fill="#9AA0AA")


def wrap(text, font, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= width: cur = t
        else: lines.append(cur); cur = w
    return lines + [cur]


for i, f in enumerate(frames):
    c, r = i % cols, i // cols
    x = M + c * (TW + M); y = 190 + M + r * (TH + CAP + M)
    im = Image.open(f).convert("RGB").resize((TW, TH), Image.LANCZOS)
    sheet.paste(im, (x, y))
    title, tc, txt = INFO[i]
    d.rounded_rectangle((x, y + TH + 12, x + 64, y + TH + 50), 8, fill="#F26B1D")
    d.text((x + 32, y + TH + 31), f"{i + 1:02d}", font=F("ExtraBold", 22), fill="#FFFFFF", anchor="mm")
    d.text((x + 80, y + TH + 14), title, font=F("SemiBold", 26), fill="#FFFFFF")
    d.text((x + TW, y + TH + 16), tc, font=F("SemiBold", 22), fill="#9AA0AA", anchor="ra")
    for k, line in enumerate(wrap(txt, F("Regular", 21), TW)[:2]):
        d.text((x, y + TH + 60 + k * 27), line, font=F("Regular", 21), fill="#C9CDD4")
out = ROOT / "out/storyboard.png"
sheet.save(out, optimize=True)
print(out, sheet.size)

# Prépare un dossier de rendu : copie les .dc.html (sans le lien support.js remplacé par le runtime local),
# expose window.__comp pour l'audio, et coupe le bouton son.
# usage: python3 prepare.py <dossier_rendu> <fichier.dc.html> ...
import sys, os, re, shutil
dst = sys.argv[1]; os.makedirs(dst, exist_ok=True)
for src in sys.argv[2:]:
    h = open(src).read()
    h = h.replace("componentDidMount() {", "componentDidMount() {\n    window.__comp = this;", 1)
    h = re.sub(r'"boutonSon":\{"editor":"boolean","default":true', '"boutonSon":{"editor":"boolean","default":false', h)
    open(os.path.join(dst, os.path.basename(src).replace(".dc.html", ".html")), "w").write(h)
    print("prêt", os.path.basename(src))

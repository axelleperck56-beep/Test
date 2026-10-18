"""Relève la position (px CSS, fenêtre 1920 de large) des éléments mis en avant dans le film :
zooms caméra et spotlights visent ainsi les vraies zones des captures.

  python3 scripts/boxes.py  -> src/boxes.json
"""
import json, pathlib
from playwright.sync_api import sync_playwright

BASE = "https://xn--traco-esa.fr"
OUT = pathlib.Path(__file__).resolve().parent.parent / "src" / "boxes.json"

# carte englobante la plus proche (bloc arrondi avec bordure) autour d'un texte
CARD_JS = """([txt, sel]) => {
  const all = [...document.querySelectorAll(sel || 'body *')].filter(e => e.children.length === 0 && e.textContent.trim().includes(txt));
  if (!all.length) return null;
  let el = all[0];
  if (!sel) { let p = el; while (p && p !== document.body) { const cs = getComputedStyle(p);
      if (cs.borderTopWidth !== '0px' && parseFloat(cs.borderRadius) >= 8 && p.getBoundingClientRect().width > 120) { el = p; break; } p = p.parentElement; } }
  const r = el.getBoundingClientRect();
  return {x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height};
}"""


def box(pg, txt, card=True):
    return pg.evaluate(CARD_JS, [txt, None if card else "body *"])


def main():
    res = {}
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        pg = b.new_page(viewport={"width": 1920, "height": 1080}, locale="fr-FR")
        pg.goto(BASE + "/", wait_until="networkidle")
        pg.get_by_text("Voir la démo").first.click(); pg.wait_for_url("**/dashboard")

        def page(path, items):
            pg.goto(BASE + path, wait_until="networkidle"); pg.wait_for_timeout(2000)
            res[path.strip("/")] = {k: (box(pg, t, c) if isinstance(t, str) else t(pg)) for k, (t, c) in items.items()}

        page("/dashboard", {
            "today": ("À traiter aujourd'hui", True), "radar": ("Voir le radar", True),
            "kpis": (lambda q: q.evaluate("""() => { const r = document.querySelector('main').querySelectorAll('[class*=grid]')[0].getBoundingClientRect(); return {x:r.x,y:r.y+scrollY,w:r.width,h:r.height}; }"""), None),
            "live": ("Camions en direct", True),
        })
        page("/radar", {
            "total": ("Total à récupérer", True), "kpi1": ("Voyages non facturés", True),
            "kpi4": ("Surconsommation", True), "verify": ("Marquer comme vérifié", False),
            "alert1": ("terminé le 13/10", True), "tabs": ("Ouvertes (", False),
        })
        page("/rentabilite", {
            "summary": ("Rentabilité du mois", True), "marge": ("15,1", False),
            "tabs": ("Par voyage", False), "rowneg": ("-13,77", False),
        })
        page("/comptabilite", {"tab": ("Prêts à facturer", False)})
        pg.get_by_role("button", name="Prêts à facturer").first.click(); pg.wait_for_timeout(1200)
        res["comptabilite-prets"] = {
            "generate": box(pg, "Générer les factures", False), "check": box(pg, "À vérifier", False),
            "ready": box(pg, "Prêt à facturer", False),
        }
        page("/carte", {"truck": ("GH-482-KT", False), "alerts": ("Alertes du jour", True)})
        b.close()
    OUT.write_text(json.dumps(res, indent=1, ensure_ascii=False))
    print(json.dumps(res, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()

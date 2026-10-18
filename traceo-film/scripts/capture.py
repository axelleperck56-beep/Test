"""Captures de la démo publique Tracéo (mode « Transports Démo Nord »).

  python3 scripts/capture.py [desktop] [mobile] [video]
      -> public/captures/*.png, public/captures/video/*.webm  (sans argument : tout)

Fenêtre 1920×1080, deviceScaleFactor 2, captures pleine page.
"""
import pathlib, shutil, sys
from playwright.sync_api import sync_playwright

BASE = "https://xn--traco-esa.fr"  # fleetglow-connect.lovable.app redirige ici
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "captures"
VID = OUT / "video"
CHROME = "/opt/pw-browsers/chromium"

# masque les toasts et toute barre d'outils d'éditeur éventuelle
HIDE_CSS = """
[data-sonner-toaster], [data-radix-toast-viewport], ol[class*=toast],
#lovable-badge, [id^=lovable], a[href*="lovable.dev"] { display:none !important; }
"""

PAGES = [
    ("dashboard", "/dashboard"), ("radar", "/radar"), ("rentabilite", "/rentabilite"),
    ("bsd", "/bsd"), ("tournees", "/tournees"), ("flotte", "/flotte"),
    ("consommation", "/consommation"), ("administratif", "/administratif"),
    ("sous-traitance", "/sous-traitance"), ("relances", "/relances"),
    ("bennes", "/bennes"), ("remorques", "/remorques"), ("portail", "/portail"),
    ("analyse-ia", "/analyse-ia"), ("parametres", "/parametres"),
    ("chauffeurs", "/chauffeurs"), ("devis", "/devis"),
]
missing = []


def enter_demo(pg):
    pg.goto(BASE + "/", wait_until="networkidle")
    pg.get_by_text("Voir la démo").first.click()
    pg.wait_for_url("**/dashboard", timeout=30000)
    pg.add_style_tag(content=HIDE_CSS)


def goto(pg, path, wait=2200):
    pg.goto(BASE + path, wait_until="networkidle")
    pg.add_style_tag(content=HIDE_CSS)
    pg.wait_for_timeout(wait)


def shot(pg, name, full=True):
    pg.screenshot(path=str(OUT / f"{name}.png"), full_page=full)
    print("ok", name, flush=True)


def click_text(pg, text, exact=True):
    loc = pg.get_by_role("button", name=text, exact=exact)
    if loc.count() == 0:
        loc = pg.get_by_text(text, exact=exact)
    loc.first.click()
    pg.wait_for_timeout(1200)


def main(parts):
    OUT.mkdir(parents=True, exist_ok=True)
    VID.mkdir(exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROME)
        if "desktop" in parts: desktop(b)
        if "mobile" in parts: mobile(b)
        if "extras" in parts: extras(b)
        if "video" in parts: videos(b)
        b.close()
    print("MISSING:", missing)


def desktop(b):
    if True:
        ctx = b.new_context(viewport={"width": 1920, "height": 1080}, device_scale_factor=2, locale="fr-FR")
        pg = ctx.new_page()
        enter_demo(pg)

        # --- écrans pleine page ---
        for name, path in PAGES:
            try:
                goto(pg, path)
                if "/login" in pg.url or pg.url.rstrip("/") == BASE:
                    missing.append(name); continue
                shot(pg, name)
            except Exception as e:
                missing.append(f"{name} ({e.__class__.__name__})")

        # --- rentabilité : 3 onglets ---
        goto(pg, "/rentabilite")
        for i, tab in enumerate(["Par voyage", "Par client", "Par camion"]):
            click_text(pg, tab); shot(pg, f"rentabilite-{i + 1}")

        # --- compta : onglet « Prêts à facturer » ---
        goto(pg, "/comptabilite")
        shot(pg, "comptabilite")
        click_text(pg, "Prêts à facturer"); shot(pg, "comptabilite-prets")

        # --- carte : vue région + fiche camion ---
        goto(pg, "/carte", 5000)
        shot(pg, "carte", full=False)
        try:
            pg.get_by_text("GH-482-KT").first.click(force=True)
            pg.wait_for_timeout(2500)
            shot(pg, "carte-fiche", full=False)
        except Exception as e:
            missing.append(f"carte-fiche ({e.__class__.__name__})")

        # --- paramètres : bloc Coûts ---
        goto(pg, "/parametres")
        try:
            pg.get_by_text("Coûts", exact=True).first.scroll_into_view_if_needed()
            pg.wait_for_timeout(600)
            shot(pg, "parametres-couts", full=False)
        except Exception as e:
            missing.append(f"parametres-couts ({e.__class__.__name__})")
        ctx.close()


def mobile(b):
    if True:
        # --- appli chauffeur (mobile 390×844), code PIN de démo affiché à l'écran ---
        m = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=3,
                          is_mobile=True, has_touch=True, locale="fr-FR")
        mp = m.new_page()
        mp.goto(BASE + "/chauffeur", wait_until="networkidle"); mp.add_style_tag(content=HIDE_CSS)
        mp.wait_for_timeout(1500)
        shot(mp, "chauffeur-0-login")
        for d in "1234":
            mp.get_by_role("button", name=d, exact=True).first.click(); mp.wait_for_timeout(150)
        mp.wait_for_timeout(2500); mp.add_style_tag(content=HIDE_CSS)
        shot(mp, "chauffeur-1-accueil")
        for i, (label, name) in enumerate([("Ma tournée", "tournee"), ("BSD à signer", "bsd"), ("Mes documents", "documents")]):
            try:
                mp.get_by_text(label, exact=False).first.click(); mp.wait_for_timeout(2000)
                mp.add_style_tag(content=HIDE_CSS); shot(mp, f"chauffeur-{i + 2}-{name}")
                print(name, ":", mp.inner_text("body")[:300].replace("\n", " | "))
                mp.get_by_text("Retour").first.click(); mp.wait_for_timeout(1500)
            except Exception as e:
                missing.append(f"chauffeur {name} ({e.__class__.__name__})")
        # détail BSD : ticket d'exemple + signature tracée au doigt
        try:
            mp.get_by_text("BSD à signer").first.click(); mp.wait_for_timeout(1500)
            mp.locator("text=/^\\d{4}-\\d{5}$/").first.click(); mp.wait_for_timeout(1800)
            mp.add_style_tag(content=HIDE_CSS); shot(mp, "chauffeur-5-bsd-detail")
            mp.get_by_text("Essayer avec un ticket d'exemple").first.click(); mp.wait_for_timeout(2500)
            cv = mp.locator("canvas").first; cv.scroll_into_view_if_needed(); mp.wait_for_timeout(500)
            bx = cv.bounding_box()
            import math
            pts = [(bx["x"] + bx["width"] * (.12 + .76 * k / 60),
                    bx["y"] + bx["height"] * (.55 + .25 * math.sin(k / 60 * 9) * math.exp(-k / 90))) for k in range(61)]
            mp.mouse.move(*pts[0]); mp.mouse.down()
            for pt in pts[1:]: mp.mouse.move(*pt, steps=2)
            mp.mouse.up(); mp.wait_for_timeout(800)
            shot(mp, "chauffeur-6-signature")
        except Exception as e:
            missing.append(f"chauffeur signature ({e.__class__.__name__}: {e})")
        m.close()


def extras(b):
    """États « après action » réels + positions utiles au montage (boxes-extra.json)."""
    import json
    info = {}
    ctx = b.new_context(viewport={"width": 1920, "height": 1080}, device_scale_factor=2, locale="fr-FR")
    pg = ctx.new_page(); enter_demo(pg)
    goto(pg, "/radar")
    pg.get_by_role("button", name="Marquer comme vérifié").first.click(); pg.wait_for_timeout(1800)
    shot(pg, "radar-apres")
    goto(pg, "/comptabilite"); click_text(pg, "Prêts à facturer")
    boxes = pg.locator("main input[type=checkbox], main button[role=checkbox]")
    n = boxes.count()
    for i in range(1, min(n, 5)):
        try: boxes.nth(i).click(); pg.wait_for_timeout(250)
        except Exception: pass
    pg.wait_for_timeout(800); shot(pg, "comptabilite-selection")
    info["checkboxes"] = [boxes.nth(i).bounding_box() for i in range(n)]
    goto(pg, "/carte", 5000)
    pg.get_by_text("GH-482-KT").first.click(force=True); pg.wait_for_timeout(2500)
    info["fiche"] = pg.evaluate("""() => { const t=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('Appeler'));
        let p=t; while(p && p.getBoundingClientRect().height<250) p=p.parentElement; const r=p.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; }""")
    ctx.close()
    m = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True, has_touch=True, locale="fr-FR")
    mp = m.new_page(); mp.goto(BASE + "/chauffeur", wait_until="networkidle")
    for d in "1234":
        mp.get_by_role("button", name=d, exact=True).first.click(); mp.wait_for_timeout(150)
    mp.wait_for_timeout(2500)
    mp.get_by_text("BSD à signer").first.click(); mp.wait_for_timeout(1500)
    mp.locator("text=/^\\d{4}-\\d{5}$/").first.click(); mp.wait_for_timeout(1800)
    mp.add_style_tag(content=HIDE_CSS)
    mp.get_by_text("Essayer avec un ticket d'exemple").first.click(); mp.wait_for_timeout(1200)
    mp.get_by_text("Ticket correct").first.click(); mp.wait_for_timeout(2500)
    mp.add_style_tag(content=HIDE_CSS)
    shot(mp, "chauffeur-6-signature")
    info["signature_canvas"] = mp.evaluate("() => { const r=document.querySelector('canvas').getBoundingClientRect(); return {x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:r.height}; }")
    info["signature_page_h"] = mp.evaluate("document.documentElement.scrollHeight")
    m.close()
    (OUT.parent.parent / "src" / "boxes-extra.json").write_text(json.dumps(info, indent=1))
    print(json.dumps(info))


def videos(b):
    if True:
        # --- vidéos d'écran ---
        def rec(name, fn):
            # screencast DevTools : chaque image horodatée, puis ffmpeg (concat à durées variables)
            c = b.new_context(viewport={"width": 1920, "height": 1080}, device_scale_factor=1, locale="fr-FR")
            q = c.new_page(); enter_demo(q)
            frames, d = [], VID / name
            shutil.rmtree(d, ignore_errors=True); d.mkdir()
            cdp = c.new_cdp_session(q)

            def on_frame(ev):
                i = len(frames); f = d / f"{i:05d}.jpg"
                f.write_bytes(__import__("base64").b64decode(ev["data"]))
                frames.append((f, ev["metadata"]["timestamp"]))
                cdp.send("Page.screencastFrameAck", {"sessionId": ev["sessionId"]})
            cdp.on("Page.screencastFrame", on_frame)
            cdp.send("Page.startScreencast", {"format": "jpeg", "quality": 92, "maxWidth": 1920, "maxHeight": 1080, "everyNthFrame": 1})
            fn(q); q.wait_for_timeout(1200)
            cdp.send("Page.stopScreencast"); c.close()
            lst = d / "list.txt"
            with lst.open("w") as fh:
                for k, (f, ts) in enumerate(frames):
                    dur = (frames[k + 1][1] - ts) if k + 1 < len(frames) else 0.5
                    fh.write(f"file '{f.name}'\nduration {max(dur, 0.001):.4f}\n")
                fh.write(f"file '{frames[-1][0].name}'\n")
            __import__("subprocess").run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                            "-vf", "fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0xF6F4F1,format=yuv420p",
                            "-c:v", "libx264", "-crf", "16", str(VID / f"{name}.mp4")], check=True)
            shutil.rmtree(d)
            print("ok video", name, len(frames), "images", flush=True)

        def radar(q):
            goto(q, "/radar", 2500)
            btn = q.get_by_role("button", name="Marquer comme vérifié").first
            btn.scroll_into_view_if_needed(); q.wait_for_timeout(800)
            box = btn.bounding_box()
            q.mouse.move(box["x"] - 300, box["y"] - 200); q.mouse.move(box["x"] + 40, box["y"] + 15, steps=25)
            q.wait_for_timeout(400); btn.click(); q.wait_for_timeout(1800)
            click_text(q, "Traitées (1)", exact=False); q.wait_for_timeout(1500)

        def renta(q):
            goto(q, "/rentabilite", 2500)
            for tab in ["Par client", "Par camion", "Par voyage"]:
                click_text(q, tab); q.wait_for_timeout(1300)

        def carte(q):
            goto(q, "/carte", 5000)
            q.mouse.move(900, 600)
            q.mouse.move(1110, 620)  # amas de camions entre Lens et Douai
            for _ in range(3):
                q.mouse.wheel(0, -250); q.wait_for_timeout(450)
            q.wait_for_timeout(1500)

        for name, fn in (("radar-verifie", radar), ("rentabilite-onglets", renta), ("carte-zoom", carte)):
            try:
                rec(name, fn)
            except Exception as e:
                missing.append(f"video {name} ({e})")


if __name__ == "__main__":
    main(sys.argv[1:] or ["desktop", "mobile", "extras", "video"])

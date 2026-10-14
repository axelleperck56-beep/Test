# Rend des artboards statiques (.dc.html) en JPG via le runtime Claude Design.
# usage: python3 render_static.py <base_url> <out_dir> <w> <h> Fichier1.html Fichier2.html ...
import sys, os
from playwright.sync_api import sync_playwright
base, out, w, h = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]); names = sys.argv[5:]
os.makedirs(out, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": w, "height": h})
    for i, n in enumerate(names, 1):
        pg.goto(f"{base}/{n}"); pg.wait_for_timeout(2000)
        pg.screenshot(path=f"{out}/carrousel-{i}.jpg", type="jpeg", quality=92, clip={"x":0,"y":0,"width":w,"height":h})
        print("ok", n)
    b.close()

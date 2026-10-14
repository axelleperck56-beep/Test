import sys, subprocess, os
from playwright.sync_api import sync_playwright
url, out, dur = sys.argv[1], sys.argv[2], float(sys.argv[3]); fps=30
INIT = """
(()=>{ let now=0; const cbs=new Map(); let id=0;
 performance.now=()=>now; Date.now=()=>1.7e12+now;
 window.requestAnimationFrame=(cb)=>{id++; cbs.set(id,cb); return id;};
 window.cancelAnimationFrame=(i)=>cbs.delete(i);
 window.__step=(ms)=>{ now+=ms; const l=[...cbs.values()]; cbs.clear(); l.forEach(cb=>{try{cb(now)}catch(e){}}); };
})();"""
os.makedirs("frames", exist_ok=True)
for f in os.listdir("frames"): os.remove("frames/"+f)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1080,"height":1920})
    pg.add_init_script(INIT); pg.goto(url); pg.wait_for_timeout(2500)
    pg.evaluate("window.__step(16)")
    for i in range(int(dur*fps)):
        pg.evaluate(f"window.__step({1000/fps})")
        pg.screenshot(path=f"frames/f{i:05d}.jpg", type="jpeg", quality=92)
    b.close()
subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate",str(fps),"-i","frames/f%05d.jpg","-f","lavfi","-t",str(dur),"-i","anullsrc=r=44100:cl=stereo","-c:v","libx264","-pix_fmt","yuv420p","-crf","20","-c:a","aac","-shortest","-movflags","+faststart",out],check=True)

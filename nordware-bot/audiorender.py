import sys, base64
from playwright.sync_api import sync_playwright
url, out = sys.argv[1], sys.argv[2]
JS = r"""
async () => {
  const c = window.__comp; const total = c.timeline().total; const sr = 44100;
  const off = new OfflineAudioContext(2, Math.ceil(sr*(total+0.5)), sr);
  window.__ct = 0;
  const ctx = new Proxy(off, {get(t,k){ if(k==='currentTime') return window.__ct; const v=t[k]; return typeof v==='function'? v.bind(t): v; }});
  c._ctx = ctx;
  c._comp = off.createDynamicsCompressor(); c._comp.threshold.value=-14; c._comp.ratio.value=4;
  c._master = off.createGain(); c._master.gain.value = Math.max(0,Math.min(100,c.props.volume==null?70:c.props.volume))/100;
  c._master.connect(c._comp); c._comp.connect(off.destination);
  const len = sr; c._noise = off.createBuffer(1,len,sr); const ch=c._noise.getChannelData(0); for(let i=0;i<len;i++) ch[i]=Math.random()*2-1;
  c._voice = [];
  try {
    const src = c.loadVoice.toString().match(/fetch\('([^']+)'\)/);
    if (src) { const data = await (await fetch(src[1])).json();
      const arr = data.voix || [];
      for (let i=0;i<arr.length;i++){ const bin=atob(arr[i]); const buf=new Uint8Array(bin.length); for(let k=0;k<bin.length;k++) buf[k]=bin.charCodeAt(k);
        try { c._voice[i] = await off.decodeAudioData(buf.buffer); } catch(e){} } }
  } catch(e) {}
  c._cueKey = null;
  for (const cue of c.cues()) { window.__ct = cue.time; try { c.play(cue.fn, cue.arg); } catch(e){} }
  const ab = await off.startRendering();
  const n = ab.length, L = ab.getChannelData(0), R = ab.numberOfChannels>1? ab.getChannelData(1): L;
  const bytes = new Uint8Array(44 + n*4); const dv = new DataView(bytes.buffer);
  const w=(o,s)=>{for(let i=0;i<s.length;i++) dv.setUint8(o+i,s.charCodeAt(i));};
  w(0,'RIFF'); dv.setUint32(4,36+n*4,true); w(8,'WAVE'); w(12,'fmt '); dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,2,true);
  dv.setUint32(24,sr,true); dv.setUint32(28,sr*4,true); dv.setUint16(32,4,true); dv.setUint16(34,16,true); w(36,'data'); dv.setUint32(40,n*4,true);
  for (let i=0;i<n;i++){ dv.setInt16(44+i*4, Math.max(-1,Math.min(1,L[i]))*32767, true); dv.setInt16(46+i*4, Math.max(-1,Math.min(1,R[i]))*32767, true); }
  let s=''; const CH=0x8000; for(let i=0;i<bytes.length;i+=CH) s+=String.fromCharCode.apply(null, bytes.subarray(i,i+CH));
  return {b64: btoa(s), total, voices: c._voice.filter(Boolean).length, cues: c.cues().length};
}
"""
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    pg.goto(url); pg.wait_for_timeout(2500)
    r = pg.evaluate(JS)
    open(out,"wb").write(base64.b64decode(r["b64"]))
    print("total", r["total"], "voices", r["voices"], "cues", r["cues"])
    b.close()

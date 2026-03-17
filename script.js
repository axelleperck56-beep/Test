/* =============================================
   La France dit Non — 2003
   Interactions & Animations
   ============================================= */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     FALLBACK IMAGE LOADER
     Essaie plusieurs URLs pour chaque image
  ───────────────────────────────────── */
  const IMAGE_FALLBACKS = {
    'chirac-img': [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Jacques_Chirac.jpg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Jacques_Chirac_2005.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/c/c4/Jacques_Chirac_%282005%29.jpg',
    ],
    'villepin-img': [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Dominique_de_Villepin_(2).jpg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Dominique_de_Villepin.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/a/a0/Dominique_de_Villepin_%282%29.jpg',
    ],
    'powell-img': [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Colin_Powell_presents_evidence_to_the_UN_Security_Council.jpg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Colin_Powell.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/a/a9/Colin_Powell_presents_evidence_to_the_UN_Security_Council.jpg',
    ],
    'freedom-img': [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Freedom_fries.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/f/f5/Freedom_fries.jpg',
    ],
    'rumsfeld-img': [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Donald_Rumsfeld_2002.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/b/b8/Donald_Rumsfeld_2002.jpg',
    ],
  };

  function initImageFallbacks() {
    Object.entries(IMAGE_FALLBACKS).forEach(([id, urls]) => {
      const img = document.getElementById(id);
      if (!img) return;
      let attempt = 0;
      img.src = urls[0];
      img.onerror = function () {
        attempt++;
        if (attempt < urls.length) {
          img.src = urls[attempt];
        } else {
          img.style.display = 'none';
          if (img.parentElement) img.parentElement.classList.add('no-photo');
        }
      };
    });
  }

  /* ─────────────────────────────────────
     PARTICULES HERO
  ───────────────────────────────────── */
  (function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    const container = document.getElementById('particles');
    if (!container) return;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = container.offsetWidth;
      H = canvas.height = container.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Couleurs drapeau français
    const COLORS = ['rgba(0,35,149,', 'rgba(255,255,255,', 'rgba(237,41,57,'];

    function Particle() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 2 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle());

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  })();


  /* ─────────────────────────────────────
     PROGRESS BAR & DOTS
  ───────────────────────────────────── */
  const progressBar   = document.getElementById('progress-bar');
  const dots          = document.querySelectorAll('#chapter-nav .dot');
  const chapters      = document.querySelectorAll('.chapter');
  const chNum         = document.getElementById('ch-num');
  const chTitleEl     = document.getElementById('ch-title-display');
  let currentChapter  = null;

  function updateProgress() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (total > 0 ? scrolled / total * 100 : 0) + '%';
  }

  function detectChapter() {
    const mid = window.scrollY + window.innerHeight * 0.42;
    chapters.forEach(ch => {
      const top = ch.offsetTop, bot = top + ch.offsetHeight;
      if (mid >= top && mid < bot && currentChapter !== ch) {
        currentChapter = ch;
        if (chNum)    chNum.textContent    = ch.dataset.num  || '01';
        if (chTitleEl) chTitleEl.textContent = ch.dataset.name || '';
        dots.forEach(d => d.classList.toggle('active', d.getAttribute('href') === `#${ch.id}`));
        ch.classList.add('revealed');
        triggerChapterEffects(ch);
      }
    });
  }

  function triggerChapterEffects(ch) {
    // Animated counters
    ch.querySelectorAll('.counter-num[data-target]').forEach(el => {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      const target = parseInt(el.dataset.target);
      if (target === 0) { el.textContent = '0'; return; }
      let start = 0;
      const duration = 1800;
      const step = timestamp => {
        if (!start) start = timestamp;
        const pct = Math.min((timestamp - start) / duration, 1);
        const val = Math.floor(pct * target);
        el.textContent = target >= 1000 ? val.toLocaleString('fr-FR') : val;
        if (pct < 1) requestAnimationFrame(step);
        else el.textContent = target >= 1000 ? target.toLocaleString('fr-FR') : target;
      };
      requestAnimationFrame(step);
    });

    // UN vote simulation
    if (ch.id === 'ch-division') animateVote();

    // Typewriter
    if (ch.id === 'ch-discours') startTypewriter();
  }


  /* ─────────────────────────────────────
     UN VOTE SIMULATION
  ───────────────────────────────────── */
  const VOTE_DATA = [
    { flag: '🇫🇷', label: 'France',     cls: 'against' },
    { flag: '🇩🇪', label: 'Allemagne',  cls: 'against' },
    { flag: '🇷🇺', label: 'Russie',     cls: 'against' },
    { flag: '🇨🇳', label: 'Chine',      cls: 'against' },
    { flag: '🇸🇾', label: 'Syrie',      cls: 'against' },
    { flag: '🇵🇰', label: 'Pakistan',   cls: 'against' },
    { flag: '🇺🇸', label: 'États-Unis', cls: 'for'     },
    { flag: '🇬🇧', label: 'R.-Uni',     cls: 'for'     },
    { flag: '🇪🇸', label: 'Espagne',    cls: 'for'     },
    { flag: '🇧🇬', label: 'Bulgarie',   cls: 'for'     },
    { flag: '🇲🇽', label: 'Mexique',    cls: 'abstain' },
    { flag: '🇨🇱', label: 'Chili',      cls: 'abstain' },
    { flag: '🇨🇲', label: 'Cameroun',   cls: 'abstain' },
    { flag: '🇬🇳', label: 'Guinée',     cls: 'abstain' },
    { flag: '🇦🇴', label: 'Angola',     cls: 'abstain' },
  ];

  let voteAnimated = false;
  function animateVote() {
    if (voteAnimated) return;
    voteAnimated = true;
    const grid = document.getElementById('vote-grid');
    if (!grid) return;
    grid.innerHTML = '';
    VOTE_DATA.forEach((v, i) => {
      const el = document.createElement('div');
      el.className = `vote-seat ${v.cls}`;
      el.textContent = v.flag;
      el.setAttribute('data-country', v.label);
      el.title = v.label;
      grid.appendChild(el);
      setTimeout(() => el.classList.add('visible'), 200 + i * 120);
    });
  }


  /* ─────────────────────────────────────
     TYPEWRITER — citation Villepin
  ───────────────────────────────────── */
  const VILLEPIN_QUOTES = [
    "Rien ne justifie aujourd'hui d'envisager une action militaire qui pourrait remettre en cause la stabilité de la région…",
    "…fractures dont se nourrit le terrorisme.",
    "L'Irak ne présente pas, en ce moment, une menace telle qu'elle justifie une guerre immédiate.",
    "Dans ce temple de l'Organisation des Nations unies, nous sommes les gardiens d'un idéal, les gardiens d'une conscience.",
  ];
  let twDone = false;

  function startTypewriter() {
    if (twDone) return;
    twDone = true;
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    let qi = 0, ci = 0;
    const fullText = VILLEPIN_QUOTES[qi];

    function typeChar() {
      if (!el) return;
      el.textContent = fullText.slice(0, ci);
      ci++;
      if (ci <= fullText.length) {
        setTimeout(typeChar, 28 + Math.random() * 20);
      } else {
        // Pause, then show next quote
        if (qi < VILLEPIN_QUOTES.length - 1) {
          setTimeout(() => {
            qi++; ci = 0;
            el.textContent = '';
            setTimeout(typeChar, 100);
          }, 2200);
        }
      }
    }
    setTimeout(typeChar, 600);
  }


  /* ─────────────────────────────────────
     SCROLL HANDLER
  ───────────────────────────────────── */
  function onScroll() {
    updateProgress();
    detectChapter();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─────────────────────────────────────
     KEYBOARD NAV
  ───────────────────────────────────── */
  document.addEventListener('keydown', e => {
    if (!['ArrowDown','ArrowUp','PageDown','PageUp','ArrowRight','ArrowLeft'].includes(e.key)) return;
    const isNext = ['ArrowDown','PageDown','ArrowRight'].includes(e.key);
    const arr = Array.from(chapters);
    const idx = arr.indexOf(currentChapter);
    if (idx === -1) return;
    const target = arr[isNext ? idx + 1 : idx - 1];
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ─────────────────────────────────────
     SMOOTH ANCHORS
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ─────────────────────────────────────
     INTERSECTION OBSERVER (reveal)
  ───────────────────────────────────── */
  // Marque les country-cards pour animation seulement si JS tourne bien
  document.querySelectorAll('.country-card').forEach(c => c.classList.add('animate-in'));

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          triggerChapterEffects(entry.target);
        }
      });
    // Threshold bas pour mobile
    }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });
    chapters.forEach(ch => obs.observe(ch));
  }

  /* ─────────────────────────────────────
     INIT
  ───────────────────────────────────── */
  window.addEventListener('load', () => {
    onScroll();
    initImageFallbacks();
    if (chapters[0]) {
      chapters[0].classList.add('revealed');
      triggerChapterEffects(chapters[0]);
    }
  });

})();

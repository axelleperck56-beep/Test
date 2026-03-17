/* =========================================
   L'IRAK — Diaporama / Présentation Orale
   JavaScript
   ========================================= */

(function () {
  'use strict';

  const progressBar     = document.getElementById('progress-bar');
  const dots            = document.querySelectorAll('#chapter-nav .dot');
  const chapters        = document.querySelectorAll('.chapter');
  const chNum           = document.getElementById('ch-num');
  const chTitleDisplay  = document.getElementById('ch-title-display');

  /* ─────────────────────────────────────
     1. SCROLL PROGRESS BAR
  ───────────────────────────────────── */
  function updateProgress() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? (scrolled / total) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ─────────────────────────────────────
     2. ACTIVE CHAPTER DETECTION
  ───────────────────────────────────── */
  let currentChapter = null;

  function detectActiveChapter() {
    const viewMid = window.scrollY + window.innerHeight * 0.4;

    chapters.forEach((ch) => {
      const top    = ch.offsetTop;
      const bottom = top + ch.offsetHeight;

      if (viewMid >= top && viewMid < bottom) {
        if (currentChapter === ch) return;
        currentChapter = ch;

        // Update indicator
        const num   = ch.dataset.num   || '01';
        const name  = ch.dataset.name  || '';
        if (chNum)          chNum.textContent         = num;
        if (chTitleDisplay) chTitleDisplay.textContent = name;

        // Update dots
        const id = ch.id;
        dots.forEach(dot => {
          dot.classList.toggle('active', dot.getAttribute('href') === `#${id}`);
        });

        // Reveal animation
        ch.classList.add('revealed');

        // Parallax background
        const bg = ch.querySelector('.chapter-bg');
        if (bg) bg.style.transform = '';
      }
    });
  }

  /* ─────────────────────────────────────
     3. PARALLAX on scroll
  ───────────────────────────────────── */
  function updateParallax() {
    chapters.forEach((ch) => {
      const bg = ch.querySelector('.chapter-bg');
      if (!bg) return;
      const rect = ch.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const ratio = rect.top / window.innerHeight;
      bg.style.transform = `translateY(${ratio * 30}px)`;
    });
  }

  /* ─────────────────────────────────────
     4. SMOOTH ANCHOR SCROLLING
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ─────────────────────────────────────
     5. KEYBOARD NAVIGATION
  ───────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' &&
        e.key !== 'PageDown'  && e.key !== 'PageUp'  &&
        e.key !== 'ArrowRight'&& e.key !== 'ArrowLeft') return;

    const isNext = ['ArrowDown', 'PageDown', 'ArrowRight'].includes(e.key);
    const chArr  = Array.from(chapters);
    const idx    = chArr.indexOf(currentChapter);
    if (idx === -1) return;

    const target = isNext ? chArr[idx + 1] : chArr[idx - 1];
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ─────────────────────────────────────
     6. MAIN SCROLL HANDLER
  ───────────────────────────────────── */
  function onScroll() {
    updateProgress();
    detectActiveChapter();
    updateParallax();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─────────────────────────────────────
     7. INIT on load
  ───────────────────────────────────── */
  window.addEventListener('load', () => {
    onScroll();
    // Reveal first chapter immediately
    if (chapters[0]) chapters[0].classList.add('revealed');
  });

  /* ─────────────────────────────────────
     8. IntersectionObserver — reveal chapters
        (backup / fallback)
  ───────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.15 });

    chapters.forEach(ch => revealObs.observe(ch));
  }

})();

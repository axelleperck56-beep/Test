/* =========================================
   IRAK – EXPOSÉ ORAL
   JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll effect ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.borderBottomColor = 'rgba(200,168,75,0.3)';
    } else {
      navbar.style.borderBottomColor = 'rgba(200,168,75,0.2)';
    }
  }, { passive: true });

  /* ── Mobile nav toggle ── */
  const toggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Intersection Observer for fade-in animations ── */
  const fadeTargets = document.querySelectorAll(
    '.timeline-content, .card-dark, .war-block, .chaos-item, ' +
    '.geo-card, .stat-big, .conclusion-point, .origin-step, ' +
    '.today-card, .rival, .reason-block, .chrono-item, .crime-item'
  );

  fadeTargets.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings slightly
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 60 * (Array.from(entry.target.parentElement?.children || []).indexOf(entry.target)));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  fadeTargets.forEach(el => observer.observe(el));

  /* ── Active nav link on scroll ── */
  const sections = document.querySelectorAll('section[id], div[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${id}`
            ? 'var(--primary)'
            : 'rgba(255,255,255,0.75)';
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ── Counter animation for big stats ── */
  function animateCounter(el) {
    const raw = el.textContent.trim();
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num === 0) return;

    const suffix = raw.replace(/[0-9.]/g, '');
    const duration = 1800;
    const steps = 60;
    const increment = num / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, num);
      const display = Number.isInteger(num) ? Math.round(current) : current.toFixed(1);
      el.textContent = display + suffix;
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-big-num, .stat-num').forEach(el => {
    statObserver.observe(el);
  });

});

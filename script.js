/* =========================================
   MENUISERIE CONAN — JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar scroll effect ---- */
  const header = document.getElementById('header');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
      backToTop.classList.add('visible');
    } else {
      header.classList.remove('scrolled');
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

  /* ---- Back to top ---- */
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---- Mobile burger menu ---- */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('nav-links');

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  function setActiveNav() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    navItems.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = '#cc0000';
      }
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });

  /* ---- Smooth anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- Animated counters ---- */
  const statItems = document.querySelectorAll('.stat-item');
  let countersStarted = false;

  function animateCounter(el, target, duration = 1800) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(start);
      }
    }, 16);
  }

  function startCounters() {
    if (countersStarted) return;
    const statsEl = document.querySelector('.stats');
    if (!statsEl) return;
    const rect = statsEl.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      countersStarted = true;
      const targets = [20, 500, 100, 50];
      const ids = ['stat-1', 'stat-2', 'stat-3', 'stat-4'];
      ids.forEach((id, i) => {
        animateCounter(document.getElementById(id), targets[i]);
      });
    }
  }
  window.addEventListener('scroll', startCounters, { passive: true });
  startCounters();

  /* ---- Scroll Reveal ---- */
  const revealEls = document.querySelectorAll(
    '.service-card, .gallery-item, .stat-item, .contact-card, ' +
    '.temoignage-card, .value-item, .apropos-content > *, .footer-brand, ' +
    '.footer-nav, .footer-services, .footer-contact, .section-header'
  );
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    const delay = (i % 4) * 0.1;
    el.style.transitionDelay = `${delay}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach(el => observer.observe(el));

  /* ---- Gallery filter ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      galleryItems.forEach((item, idx) => {
        const cat = item.dataset.cat;
        const show = filter === 'all' || cat === filter;

        if (show) {
          item.classList.remove('hidden');
          item.classList.add('fade-in');
          // reset large class based on position
          if (visibleCount === 1 && filter === 'all') {
            item.classList.add('large');
          } else {
            item.classList.remove('large');
          }
          visibleCount++;
          setTimeout(() => item.classList.remove('fade-in'), 500);
        } else {
          item.classList.add('hidden');
          item.classList.remove('large');
        }
      });
    });
  });

  /* ---- Testimonials Slider ---- */
  const track = document.getElementById('track');
  const dotsContainer = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (track) {
    const cards = track.querySelectorAll('.temoignage-card');
    let currentSlide = 0;
    let slidesPerView = getSlidesPerView();
    const totalSlides = cards.length;
    const maxSlide = Math.ceil(totalSlides / slidesPerView) - 1;

    function getSlidesPerView() {
      if (window.innerWidth <= 480) return 1;
      if (window.innerWidth <= 900) return 2;
      return 3;
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      const count = Math.ceil(totalSlides / slidesPerView);
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      document.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function goTo(index) {
      const max = Math.ceil(totalSlides / slidesPerView) - 1;
      currentSlide = Math.max(0, Math.min(index, max));
      const cardWidth = cards[0].offsetWidth + 28; // gap
      track.style.transform = `translateX(-${currentSlide * slidesPerView * cardWidth}px)`;
      updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(currentSlide - 1));
    nextBtn.addEventListener('click', () => goTo(currentSlide + 1));

    // Auto-play
    let autoplay = setInterval(() => {
      const max = Math.ceil(totalSlides / slidesPerView) - 1;
      goTo(currentSlide >= max ? 0 : currentSlide + 1);
    }, 5000);

    track.closest('.temoignages-slider').addEventListener('mouseenter', () => clearInterval(autoplay));
    track.closest('.temoignages-slider').addEventListener('mouseleave', () => {
      autoplay = setInterval(() => {
        const max = Math.ceil(totalSlides / slidesPerView) - 1;
        goTo(currentSlide >= max ? 0 : currentSlide + 1);
      }, 5000);
    });

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? currentSlide + 1 : currentSlide - 1);
    });

    // Resize
    window.addEventListener('resize', () => {
      slidesPerView = getSlidesPerView();
      currentSlide = 0;
      buildDots();
      goTo(0);
    });

    buildDots();
    goTo(0);
  }

  /* ---- Contact Form Validation ---- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    const fields = {
      prenom:  { required: true, minLen: 2, label: 'Prénom' },
      nom:     { required: true, minLen: 2, label: 'Nom' },
      email:   { required: true, type: 'email', label: 'Email' },
      service: { required: true, label: 'Service' },
      message: { required: true, minLen: 20, label: 'Message' },
    };

    function showError(id, msg) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add('error');
      const errSpan = el.parentElement.querySelector('.form-error');
      if (errSpan) errSpan.textContent = msg;
    }

    function clearError(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('error');
      const errSpan = el.parentElement.querySelector('.form-error');
      if (errSpan) errSpan.textContent = '';
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateField(id) {
      const config = fields[id];
      if (!config) return true;
      const el = document.getElementById(id);
      if (!el) return true;
      const val = el.value.trim();

      if (config.required && !val) {
        showError(id, `Le champ "${config.label}" est obligatoire.`);
        return false;
      }
      if (config.minLen && val.length < config.minLen) {
        showError(id, `Au moins ${config.minLen} caractères requis.`);
        return false;
      }
      if (config.type === 'email' && !validateEmail(val)) {
        showError(id, 'Adresse email invalide.');
        return false;
      }
      clearError(id);
      return true;
    }

    // Live validation on blur
    Object.keys(fields).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('blur', () => validateField(id));
        el.addEventListener('input', () => {
          if (el.classList.contains('error')) validateField(id);
        });
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      Object.keys(fields).forEach(id => {
        if (!validateField(id)) valid = false;
      });

      // RGPD check
      const rgpd = document.getElementById('rgpd');
      const rgpdError = rgpd ? rgpd.closest('.form-group').querySelector('.form-error') : null;
      if (rgpd && !rgpd.checked) {
        if (rgpdError) rgpdError.textContent = 'Veuillez accepter la politique de confidentialité.';
        valid = false;
      } else if (rgpdError) {
        rgpdError.textContent = '';
      }

      if (!valid) return;

      // Simulate sending
      const btnText = form.querySelector('.btn-text');
      const btnLoader = form.querySelector('.btn-loader');
      const submitBtn = form.querySelector('[type="submit"]');

      btnText.style.display = 'none';
      btnLoader.style.display = 'inline';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.style.display = 'none';
        formSuccess.style.display = 'block';
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1800);
    });
  }

  /* ---- Parallax on hero ---- */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroContent.style.transform = `translateY(${y * 0.25}px)`;
      heroContent.style.opacity = 1 - y / 600;
    }, { passive: true });
  }

  /* ---- Wood cursor glow effect (subtle) ---- */
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(204,0,0,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: left 0.1s ease, top 0.1s ease;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });

  /* ---- Typing effect in hero ---- */
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) {
    heroTitle.style.opacity = '0';
    setTimeout(() => {
      heroTitle.style.transition = 'opacity 1s ease';
      heroTitle.style.opacity = '1';
    }, 300);
  }

  console.log('%cMenuiserie Conan', 'color:#cc0000;font-size:2rem;font-weight:900;font-family:Montserrat,sans-serif');
  console.log('%cSite réalisé avec passion · Phalempin, Nord', 'color:#aaa;font-size:0.9rem');
});

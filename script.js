/* =============================================
   AXELLE PERCK – Portfolio Web Designer
   JavaScript Interactions
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll behaviour ----
  const header = document.getElementById('header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Mobile hamburger menu ----
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  // ---- Back to top ----
  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Scroll reveal (data-aos) ----
  const aosObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        aosObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-aos]').forEach(el => aosObserver.observe(el));

  // ---- Skill bars animation ----
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach(bar => {
          bar.classList.add('animate');
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const skillsSection = document.querySelector('.about-skills');
  if (skillsSection) skillObserver.observe(skillsSection);

  // ---- Portfolio filter ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      portfolioItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.opacity = '0';
        item.style.transform = 'translateY(16px)';

        setTimeout(() => {
          item.style.display = show ? '' : 'none';
          if (show) {
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            });
          }
        }, 150);
      });
    });
  });

  // ---- FAQ accordion ----
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
      });

      if (!isOpen) item.classList.add('open');
    });
  });

  // ---- Contact form ----
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const btnSpan = btn.querySelector('span');
      const originalText = btnSpan.textContent;

      btn.disabled = true;
      btnSpan.textContent = 'Envoi en cours…';
      btn.style.opacity = '.7';

      // Simulate sending (replace with real API call)
      setTimeout(() => {
        form.style.display = 'none';
        successMsg.style.display = 'block';
      }, 1400);
    });
  }

  // ---- Animated counters in hero ----
  const counters = document.querySelectorAll('.stat-number');
  let countersStarted = false;

  const startCounters = () => {
    if (countersStarted) return;
    countersStarted = true;

    counters.forEach(counter => {
      const text = counter.textContent.trim();
      const match = text.match(/^(\d+)/);
      if (!match) return;

      const target = parseInt(match[1]);
      const suffix = text.slice(match[0].length);
      let current = 0;
      const step = Math.ceil(target / 50);
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        counter.textContent = current + suffix;
        if (current >= target) clearInterval(interval);
      }, 30);
    });
  };

  // Start counters when hero stats are visible
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const counterObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        startCounters();
        counterObserver.disconnect();
      }
    }, { threshold: 0.5 });
    counterObserver.observe(heroStats);
  }

  // ---- Pricing card portfolio items transition ----
  portfolioItems.forEach(item => {
    item.style.transition = 'opacity .3s ease, transform .3s ease';
  });

  // ---- Active nav link on scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navA = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navA.forEach(a => {
          a.style.fontWeight = a.getAttribute('href') === id ? '700' : '500';
        });
      }
    });
  }, { threshold: 0.4, rootMargin: '-64px 0px -40% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

});

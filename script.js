/* =============================================
   NÉBULA – Portfolio Web Designer
   JavaScript + Animations 3D
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

  // ---- Scroll reveal 3D (data-aos) ----
  const aosObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
        aosObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-aos]').forEach(el => aosObserver.observe(el));

  // ---- Skill bars animation ----
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach(bar => bar.classList.add('animate'));
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const skillsSection = document.querySelector('.about-skills');
  if (skillsSection) skillObserver.observe(skillsSection);

  // ---- Portfolio filter ----
  const filterBtns    = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      portfolioItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.opacity = '0';
        item.style.transform = 'translateY(16px) rotateX(8deg)';
        setTimeout(() => {
          item.style.display = show ? '' : 'none';
          if (show) requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) rotateX(0)';
          });
        }, 150);
      });
    });
  });

  // ---- FAQ accordion ----
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
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
      btn.disabled = true;
      btnSpan.textContent = 'Envoi en cours…';
      btn.style.opacity = '.7';
      setTimeout(() => {
        form.style.display = 'none';
        successMsg.style.display = 'block';
      }, 1400);
    });
  }

  // ---- Animated counters ----
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
      const step = Math.ceil(target / 60);
      const iv = setInterval(() => {
        current = Math.min(current + step, target);
        counter.textContent = current + suffix;
        if (current >= target) clearInterval(iv);
      }, 25);
    });
  };
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { startCounters(); }
    }, { threshold: 0.5 }).observe(heroStats);
  }

  portfolioItems.forEach(item => {
    item.style.transition = 'opacity .35s ease, transform .35s ease';
  });

  // ============================================
  //  ANIMATIONS 3D
  // ============================================

  // -- 1. Tilt 3D au survol des cartes (mouse tracking) --
  const tiltTargets = document.querySelectorAll(
    '.service-card, .portfolio-item, .pricing-card, .testimonial-card, .process-step'
  );

  tiltTargets.forEach(card => {
    card.style.transition = 'transform .15s ease, box-shadow .15s ease';

    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const x     = e.clientX - rect.left;
      const y     = e.clientY - rect.top;
      const cx    = rect.width  / 2;
      const cy    = rect.height / 2;
      const rotX  = ((y - cy) / cy) * -10;   // max ±10°
      const rotY  = ((x - cx) / cx) *  10;
      const depth = 1 + Math.abs(rotX + rotY) / 40;

      card.style.transform  = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${depth},${depth},${depth})`;
      card.style.boxShadow  = `${-rotY * 1.5}px ${rotX * 1.5}px 40px rgba(29,110,245,.18)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      card.style.boxShadow  = '';
      card.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1), box-shadow .5s ease';
      setTimeout(() => { card.style.transition = 'transform .15s ease, box-shadow .15s ease'; }, 500);
    });
  });

  // -- 2. Particules 3D flottantes dans le hero --
  const hero = document.querySelector('.hero');
  if (hero) {
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-particles';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    hero.querySelector('.hero-bg').appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    const resize = () => {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COUNT = 60;
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        z: Math.random() * 600 + 100,       // depth
        vx: (Math.random() - .5) * .4,
        vy: (Math.random() - .5) * .4,
        vz: (Math.random() - .5) * .8,
        r: Math.random() * 2 + .5,
      });
    }

    const FOV = 400;
    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        if (p.z < 50 || p.z > 700) p.vz *= -1;

        // Perspective projection
        const scale = FOV / (FOV + p.z);
        const sx = p.x * scale + (W / 2) * (1 - scale);
        const sy = p.y * scale + (H / 2) * (1 - scale);
        const alpha = (1 - p.z / 700) * .7;
        const radius = p.r * scale * 2;

        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(radius, .3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${alpha})`;
        ctx.fill();
      });

      // Draw connections between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 90) {
            const alpha = (1 - dist / 90) * .15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(147,197,253,${alpha})`;
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
      }
      frame = requestAnimationFrame(animate);
    };
    animate();

    // Pause when not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else animate();
    });
  }

  // -- 3. Parallaxe 3D au scroll sur le hero --
  const heroContent = document.querySelector('.hero-content');
  const heroVisual  = document.querySelector('.hero-visual');
  const heroBg      = document.querySelector('.hero-bg');

  if (heroContent) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        const slow = y * 0.25;
        const fast = y * 0.45;
        heroContent.style.transform = `translate3d(0, ${slow}px, 0)`;
        if (heroVisual) heroVisual.style.transform = `translate3d(0, ${fast * .6}px, 0)`;
        if (heroBg)     heroBg.style.transform     = `translate3d(0, ${slow * .4}px, 0)`;
      }
    }, { passive: true });
  }

  // -- 4. Rotation 3D des icônes de services au survol --
  document.querySelectorAll('.service-icon, .step-icon, .value-icon, .contact-icon').forEach(icon => {
    icon.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1)';
    icon.addEventListener('mouseenter', () => {
      icon.style.transform = 'perspective(200px) rotateY(180deg) scale(1.1)';
    });
    icon.addEventListener('mouseleave', () => {
      icon.style.transform = 'perspective(200px) rotateY(0deg) scale(1)';
    });
  });

  // -- 5. Scroll reveal avec effet 3D rotatif --
  const reveal3dObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        setTimeout(() => {
          el.style.opacity    = '1';
          el.style.transform  = 'perspective(1000px) rotateX(0deg) translateY(0)';
        }, i * 80);
        reveal3dObserver.unobserve(el);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.section-title, .section-tag, .section-subtitle').forEach(el => {
    el.style.cssText += 'opacity:0; transform:perspective(1000px) rotateX(20deg) translateY(20px); transition: opacity .8s ease, transform .8s cubic-bezier(.23,1,.32,1);';
    reveal3dObserver.observe(el);
  });

  // -- 6. Effet magnétique 3D sur les boutons CTA --
  document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `perspective(300px) translate3d(${x * .2}px, ${y * .2}px, 8px) rotateX(${-y * .05}deg) rotateY(${x * .05}deg)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform .4s cubic-bezier(.23,1,.32,1), background .25s, box-shadow .25s';
      setTimeout(() => btn.style.transition = '', 400);
    });
  });

  // -- 7. Formes géométriques 3D flottantes dans page-header --
  const pageHeader = document.querySelector('.page-header');
  if (pageHeader) {
    const shapes = [
      { size: 60, x: '10%',  y: '20%', delay: 0,    speed: 8  },
      { size: 40, x: '80%',  y: '15%', delay: 1.5,  speed: 10 },
      { size: 80, x: '90%',  y: '60%', delay: 0.8,  speed: 12 },
      { size: 30, x: '15%',  y: '70%', delay: 2,    speed: 7  },
      { size: 50, x: '50%',  y: '80%', delay: 0.4,  speed: 9  },
    ];
    shapes.forEach(s => {
      const el = document.createElement('div');
      el.className = 'ph-shape';
      el.style.cssText = `
        position:absolute; width:${s.size}px; height:${s.size}px;
        left:${s.x}; top:${s.y};
        border:1.5px solid rgba(255,255,255,.12);
        border-radius:${Math.random() > .5 ? '50%' : '12px'};
        animation: floatShape ${s.speed}s ease-in-out ${s.delay}s infinite alternate;
        pointer-events:none; z-index:0;
        backdrop-filter:blur(2px);
        background:rgba(255,255,255,.03);
      `;
      pageHeader.appendChild(el);
    });
  }

  // -- 8. Effet 3D "flip" sur les cartes de témoignages --
  document.querySelectorAll('.testimonial-card').forEach(card => {
    card.style.transition = 'transform .4s cubic-bezier(.23,1,.32,1), box-shadow .4s ease';
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'perspective(600px) rotateY(-4deg) rotateX(3deg) translateZ(12px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateY(0) rotateX(0) translateZ(0)';
    });
  });

  // -- 9. Cube 3D rotatif dans le hero (decoration) --
  const heroVis = document.querySelector('.hero-visual');
  if (heroVis) {
    const cube = document.createElement('div');
    cube.className = 'deco-cube';
    cube.innerHTML = `
      <div class="cube-inner">
        <div class="cube-face front"></div>
        <div class="cube-face back"></div>
        <div class="cube-face left"></div>
        <div class="cube-face right"></div>
        <div class="cube-face top"></div>
        <div class="cube-face bottom"></div>
      </div>
    `;
    heroVis.appendChild(cube);
  }

  // -- 10. Curseur lumineux 3D (glow follow) --
  const cursor = document.createElement('div');
  cursor.className = 'cursor-glow';
  document.body.appendChild(cursor);
  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const animateCursor = () => {
    curX += (mouseX - curX) * .08;
    curY += (mouseY - curY) * .08;
    cursor.style.transform = `translate(${curX - 150}px, ${curY - 150}px)`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();

  // Hide cursor glow on touch devices
  window.addEventListener('touchstart', () => cursor.style.display = 'none', { once: true });

  // ---- Active nav on scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navA     = document.querySelectorAll('.nav-links a[href^="#"]');
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navA.forEach(a => {
          a.style.fontWeight = a.getAttribute('href') === id ? '700' : '500';
        });
      }
    });
  }, { threshold: 0.4, rootMargin: '-64px 0px -40% 0px' }).observe(
    ...([...sections].length ? [...sections] : [document.body])
  );

});

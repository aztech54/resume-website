/* =============================================
   ANTONIO MACIAS LUPERCIO — RESUME WEBSITE
   main.js · All interactions & animations
   ============================================= */

'use strict';

/* =============================================
   HERO CANVAS — Floating Earthy Orbs
   ============================================= */
class HeroCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.orbs   = [];
    this.raf    = null;

    this.resize();
    this.spawnOrbs();
    this.tick();

    window.addEventListener('resize', () => {
      this.resize();
      // Redistribute orbs after resize
      this.orbs.forEach(o => {
        o.x = Math.random() * this.canvas.width;
        o.y = Math.random() * this.canvas.height;
      });
    });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width  = this.canvas.offsetWidth  * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.w = this.canvas.offsetWidth;
    this.h = this.canvas.offsetHeight;
  }

  spawnOrbs() {
    // Soft PNW earthy palette — muted greens, warm browns, creams
    const palette = [
      'rgba(90,  122, 90,  0.13)',  // forest green
      'rgba(109, 143, 109, 0.09)',  // mid green
      'rgba(139, 115, 85,  0.10)',  // warm brown
      'rgba(181, 154, 122, 0.08)',  // light tan
      'rgba(90,  122, 90,  0.06)',  // soft green
      'rgba(110, 95,  78,  0.07)',  // earthy brown
    ];
    for (let i = 0; i < 9; i++) {
      this.orbs.push({
        x:     Math.random() * this.w,
        y:     Math.random() * this.h,
        r:     90 + Math.random() * 220,
        dx:    (Math.random() - 0.5) * 0.28,
        dy:    (Math.random() - 0.5) * 0.28,
        color: palette[Math.floor(Math.random() * palette.length)],
        phase: Math.random() * Math.PI * 2,
        amp:   6 + Math.random() * 10,
        freq:  0.0004 + Math.random() * 0.0003,
      });
    }
  }

  draw(ts) {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    this.orbs.forEach(o => {
      // Gentle sine-wave drift layered on top of linear movement
      const ox = o.x + Math.sin(ts * o.freq + o.phase) * o.amp;
      const oy = o.y + Math.cos(ts * o.freq + o.phase) * o.amp;

      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
      g.addColorStop(0, o.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // Slow linear drift
      o.x += o.dx;
      o.y += o.dy;

      // Wrap-around
      if (o.x < -o.r)      o.x = w + o.r;
      if (o.x > w + o.r)   o.x = -o.r;
      if (o.y < -o.r)      o.y = h + o.r;
      if (o.y > h + o.r)   o.y = -o.r;
    });
  }

  tick(ts = 0) {
    this.draw(ts);
    this.raf = requestAnimationFrame(t => this.tick(t));
  }
}

/* =============================================
   TYPING ANIMATION
   ============================================= */
class Typer {
  constructor(el, strings, opts = {}) {
    this.el       = el;
    this.strings  = strings;
    this.typeMs   = opts.typeMs   || 88;
    this.deleteMs = opts.deleteMs || 48;
    this.pauseMs  = opts.pauseMs  || 1800;
    this.gapMs    = opts.gapMs    || 420;

    this.idx     = 0;
    this.charIdx = 0;
    this.deleting = false;
    this._run();
  }

  _run() {
    const str = this.strings[this.idx];

    if (!this.deleting) {
      this.el.textContent = str.slice(0, this.charIdx + 1);
      this.charIdx++;
      if (this.charIdx === str.length) {
        this.deleting = true;
        setTimeout(() => this._run(), this.pauseMs);
        return;
      }
    } else {
      this.el.textContent = str.slice(0, this.charIdx - 1);
      this.charIdx--;
      if (this.charIdx === 0) {
        this.deleting = false;
        this.idx = (this.idx + 1) % this.strings.length;
        setTimeout(() => this._run(), this.gapMs);
        return;
      }
    }

    const speed = this.deleting ? this.deleteMs : this.typeMs;
    setTimeout(() => this._run(), speed);
  }
}

/* =============================================
   SCROLL REVEAL (IntersectionObserver)
   ============================================= */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything
    els.forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => io.observe(el));
}

/* =============================================
   SKILL BAR ANIMATION
   ============================================= */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.width + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });

  bars.forEach(b => io.observe(b));
}

/* =============================================
   STICKY NAV — glass effect on scroll
   ============================================= */
function initNavbar() {
  const nav = document.getElementById('navbar');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 28);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load
}

/* =============================================
   ACTIVE NAV LINK — highlight current section
   ============================================= */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(s => io.observe(s));
}

/* =============================================
   MOBILE MENU TOGGLE
   ============================================= */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);

    // Animate hamburger → X
    const spans = toggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelectorAll('span').forEach(s => {
        s.style.transform = ''; s.style.opacity = '';
      });
    });
  });
}

/* =============================================
   SMOOTH HOVER TILT on Project Cards (subtle)
   ============================================= */
function initCardTilt() {
  const cards = document.querySelectorAll('.project-card, .stat-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-5px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* =============================================
   FOOTER YEAR (keep it current)
   ============================================= */
function updateYear() {
  const el = document.querySelector('.footer-sub');
  if (el) {
    // No dynamic year needed — already static 2025 in HTML
  }
}

/* =============================================
   INIT — wire everything together
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {

  // Hero canvas orbs
  const canvas = document.getElementById('heroCanvas');
  if (canvas) new HeroCanvas(canvas);

  // Typing animation — delay to let hero CSS animations finish
  const typingEl = document.getElementById('typingText');
  if (typingEl) {
    setTimeout(() => {
      new Typer(typingEl, [
        'IT Graduate',
        'Network Specialist',
        'System Administrator',
        'Security Enthusiast',
        'Helpdesk Technician',
      ]);
    }, 1400);
  }

  // Scroll-driven effects
  initScrollReveal();
  initSkillBars();

  // Navigation
  initNavbar();
  initActiveNav();
  initMobileMenu();

  // Subtle card tilt
  initCardTilt();

});

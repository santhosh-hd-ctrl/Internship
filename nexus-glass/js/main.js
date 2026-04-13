'use strict';

/* ---- NAV SCROLL SHADOW ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ---- HAMBURGER ---- */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  const [s1, s2, s3] = hamburger.querySelectorAll('span');
  if (open) {
    s1.style.transform = 'translateY(7px) rotate(45deg)';
    s2.style.opacity   = '0';
    s3.style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    s1.style.transform = s3.style.transform = '';
    s2.style.opacity = '';
  }
});

mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = s.style.opacity = ''; });
  });
});

/* ---- SCROLL REVEAL ---- */
document.querySelectorAll(
  '.feat-card, .testi-card, .price-card, .glass-stat, .section__header, .contact__info, .contact__form'
).forEach(el => el.classList.add('reveal'));

new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const idx = [...entry.target.parentElement.children].indexOf(entry.target);
    entry.target.style.transitionDelay = `${idx * 90}ms`;
    entry.target.classList.add('visible');
  });
}, { threshold: 0.1 }).observe || (() => {})();

// Use individual observe calls
const ro = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const idx = [...entry.target.parentElement.children].indexOf(entry.target);
    entry.target.style.transitionDelay = `${idx * 90}ms`;
    entry.target.classList.add('visible');
    ro.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

/* ---- ACTIVE NAV LINK ---- */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__links a');

new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(l => l.classList.remove('active'));
    const active = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
    if (active) active.classList.add('active');
  });
}, { threshold: 0.45 }).observe ? (() => {
  const so = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    });
  }, { threshold: 0.45 });
  sections.forEach(s => so.observe(s));
})() : null;

/* ---- CONTACT FORM ---- */
const form    = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');

form.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;

  form.querySelectorAll('[required]').forEach(el => {
    el.style.borderColor = '';
    if (!el.value.trim() || (el.type === 'email' && !el.value.includes('@'))) {
      el.style.borderColor = '#f000b8';
      el.style.boxShadow   = '0 0 0 3px rgba(240,0,184,.15)';
      valid = false;
    }
  });

  if (!valid) return;

  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;
  btn.style.opacity = '.7';

  setTimeout(() => {
    btn.textContent = '✓ Message sent!';
    btn.style.opacity = '1';
    btn.style.background = 'linear-gradient(135deg, #00ffb2, #00c896)';
    success.classList.add('show');
    form.reset();
    setTimeout(() => {
      btn.textContent = 'Send message';
      btn.style.background = '';
      btn.disabled = false;
      success.classList.remove('show');
    }, 4000);
  }, 1300);
});

form.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('input', () => { el.style.borderColor = ''; el.style.boxShadow = ''; });
});

/* ---- SMOOTH SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ---- CURSOR GLOW (desktop only) ---- */
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed; width:400px; height:400px; border-radius:50%;
    background:radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%);
    pointer-events:none; z-index:9999; transform:translate(-50%,-50%);
    transition:left .12s ease, top .12s ease;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
}

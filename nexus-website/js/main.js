/* ============================================================
   NEXUS — main.js
   Handles: sticky nav, mobile menu, scroll reveal, form submit
   ============================================================ */

'use strict';

// ---------- NAV: sticky + scroll shadow ----------
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ---------- NAV: mobile hamburger ----------
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);

  // Animate the three bars
  const spans = hamburger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }
});

// Close mobile menu when a link inside it is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity   = '';
    });
  });
});

// ---------- SCROLL REVEAL ----------
const revealEls = document.querySelectorAll(
  '.feat-card, .testi-card, .price-card, .stat-card, .contact__info, .contact__form, .section__header'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings a little
      const siblings = [...entry.target.parentElement.children];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 80}ms`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// ---------- ACTIVE NAV LINK on scroll ----------
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ---------- CONTACT FORM ----------
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Basic validation
  const inputs = contactForm.querySelectorAll('[required]');
  let valid = true;

  inputs.forEach(input => {
    input.style.borderColor = '';
    if (!input.value.trim()) {
      input.style.borderColor = '#E24B4A';
      valid = false;
    }
    if (input.type === 'email' && input.value && !input.value.includes('@')) {
      input.style.borderColor = '#E24B4A';
      valid = false;
    }
  });

  if (!valid) return;

  // Simulate submission
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.textContent = 'Message sent ✓';
    submitBtn.style.background = '#0F6E56';
    formSuccess.classList.add('show');
    contactForm.reset();

    setTimeout(() => {
      submitBtn.textContent = 'Send message';
      submitBtn.style.background = '';
      submitBtn.disabled = false;
      formSuccess.classList.remove('show');
    }, 4000);
  }, 1200);
});

// Reset field border color on input
contactForm.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('input', () => { el.style.borderColor = ''; });
});

// ---------- SMOOTH SCROLL (fallback for older browsers) ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

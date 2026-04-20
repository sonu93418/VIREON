/* ============================================================
   VIREON SAFETY INSTITUTE — MAIN JAVASCRIPT
   ============================================================ */

'use strict';

/* ── DOM Ready ── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initTestimonialsSlider();
  initForms();
  initSmoothScroll();
  initTickerDuplicate();
  initCounterAnimations();
  showPopupOnDelay();
});

/* ================================================================
   NAVBAR
   ================================================================ */
function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky scroll effect
  const onScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Update active nav link based on scroll
  function updateActiveLink() {
    const sections = ['home', 'programs', 'placements', 'leadership', 'contact'];
    const scrollY  = window.scrollY + 100;

    let current = 'home';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) current = id;
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }
}

/* ================================================================
   MOBILE MENU
   ================================================================ */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  let   isOpen     = false;

  hamburger.addEventListener('click', () => {
    isOpen = !isOpen;
    hamburger.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', false);
  mobileMenu.setAttribute('aria-hidden', true);
  document.body.style.overflow = '';
}

/* ================================================================
   SMOOTH SCROLL
   ================================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '#!') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ================================================================
   SCROLL ANIMATIONS (Intersection Observer)
   ================================================================ */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });
}

/* ================================================================
   COUNTER ANIMATIONS
   ================================================================ */
function initCounterAnimations() {
  const counters = document.querySelectorAll('.ps-num, .hero-stat-num');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => observer.observe(c));

  function animateCounter(el) {
    const text     = el.textContent.trim();
    const hasPlus  = text.includes('+');
    const hasPct   = text.includes('%');
    const hasInf   = text.includes('∞');
    if (hasInf) return;

    const rawNum   = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (isNaN(rawNum)) return;

    const suffix   = el.querySelector('span');
    const suffixTxt = suffix ? suffix.textContent : '';
    const parent   = el.cloneNode(true);

    let start    = 0;
    const end    = rawNum;
    const dur    = 1600;
    const step   = 16;
    const steps  = Math.floor(dur / step);
    let   count  = 0;

    const timer = setInterval(() => {
      count++;
      const val = Math.round(easeOut(count / steps) * end);
      // rewrite text node only (not span)
      const textNode = el.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = val;
      } else {
        el.childNodes[0].textContent = val;
      }
      if (count >= steps) {
        clearInterval(timer);
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          textNode.textContent = end;
        }
      }
    }, step);
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
}

/* ================================================================
   TESTIMONIALS SLIDER
   ================================================================ */
function initTestimonialsSlider() {
  const track    = document.getElementById('testimonials-track');
  const dotsWrap = document.getElementById('tnav-dots');
  const prevBtn  = document.getElementById('tprev');
  const nextBtn  = document.getElementById('tnext');

  if (!track) return;

  const cards        = track.querySelectorAll('.testimonial-card');
  const total        = cards.length;
  let   current      = 0;
  let   autoTimer    = null;
  let   perView      = getPerView();

  // Build dots
  const numSlides = total - perView + 1;
  for (let i = 0; i < Math.max(numSlides, 1); i++) {
    const dot = document.createElement('span');
    dot.className = 'tnav-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  function getPerView() {
    return window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  }

  function updateCardWidths() {
    perView = getPerView();
    const gapPx = 24;
    const containerW = track.parentElement.offsetWidth;
    const cardW = (containerW - gapPx * (perView - 1)) / perView;
    cards.forEach(c => { c.style.minWidth = cardW + 'px'; });
  }

  function goTo(idx) {
    const maxIdx = Math.max(0, total - perView);
    current = Math.min(Math.max(idx, 0), maxIdx);
    const cardW = cards[0].offsetWidth + 24; // +gap
    track.style.transform = `translateX(-${current * cardW}px)`;

    // Update dots
    dotsWrap.querySelectorAll('.tnav-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  nextBtn.addEventListener('click', () => { next(); resetAuto(); });

  function startAuto() {
    autoTimer = setInterval(() => { goTo((current + 1) % (total - perView + 1)); }, 4500);
  }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetAuto(); }
  });

  window.addEventListener('resize', () => {
    updateCardWidths();
    goTo(0);
    clearInterval(autoTimer);
    dotsWrap.innerHTML = '';
    const ns = total - getPerView() + 1;
    for (let i = 0; i < Math.max(ns, 1); i++) {
      const dot = document.createElement('span');
      dot.className = 'tnav-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
    startAuto();
  });

  updateCardWidths();
  goTo(0);
  startAuto();
}

/* ================================================================
   FAQ ACCORDION
   ================================================================ */
function toggleFaq(questionEl) {
  const item   = questionEl.closest('.faq-item');
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-question').setAttribute('aria-expanded', false);
  });

  // Open clicked if was closed
  if (!isOpen) {
    item.classList.add('open');
    questionEl.setAttribute('aria-expanded', true);
  }
}

/* ================================================================
   POPUP (ADMISSION FORM)
   ================================================================ */
function openPopup() {
  const overlay = document.getElementById('popup-overlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', false);
  document.body.style.overflow = 'hidden';

  // Focus first input
  setTimeout(() => {
    const firstInput = overlay.querySelector('.form-input');
    if (firstInput) firstInput.focus();
  }, 300);
}

function closePopup() {
  const overlay = document.getElementById('popup-overlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', true);
  document.body.style.overflow = '';
}

// Close on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('popup-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });
  }

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closePopup(); closeMobileMenu(); }
  });
});

// Show popup after delay (lead gen)
function showPopupOnDelay() {
  const shown = sessionStorage.getItem('vsi_popup_shown');
  if (!shown) {
    setTimeout(() => {
      openPopup();
      sessionStorage.setItem('vsi_popup_shown', '1');
    }, 15000); // 15s delay
  }
}

/* ================================================================
   FORMS
   ================================================================ */
function initForms() {
  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => handleFormSubmit(e, 'contact'));
  }

  // Popup form
  const popupForm = document.getElementById('popup-form');
  if (popupForm) {
    popupForm.addEventListener('submit', (e) => handleFormSubmit(e, 'popup'));
  }
}

function handleFormSubmit(e, type) {
  e.preventDefault();
  const form       = e.target;
  const nameInput  = form.querySelector('[name="name"]');
  const phoneInput = form.querySelector('[name="phone"]');

  // Validation
  const name  = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const errorId = type + '-form-error';
  const successId = type + '-form-success';
  const errorEl   = document.getElementById(errorId);
  const successEl = document.getElementById(successId);

  if (!name || !phone || phone.length < 10) {
    if (errorEl) { errorEl.style.display = 'block'; }
    if (successEl) successEl.classList.remove('show');
    setTimeout(() => { if (errorEl) errorEl.style.display = 'none'; }, 4000);
    return;
  }

  // Simulate submission
  const submitBtn = form.querySelector('[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled   = true;
    submitBtn.textContent = '⏳ Submitting...';
  }

  setTimeout(() => {
    // Reset form
    form.reset();

    // Show success
    if (successEl) successEl.classList.add('show');
    if (errorEl)   errorEl.style.display = 'none';

    if (submitBtn) {
      submitBtn.disabled    = false;
      submitBtn.textContent = '🚀 Submit Application';
    }

    // If popup — close after success
    if (type === 'popup') {
      setTimeout(closePopup, 2500);
    }

    // WA redirect (optional)
    const course   = form.querySelector('[name="course"]') ? form.querySelector('[name="course"]').value : '';
    const waMsg    = encodeURIComponent(
      `Hello Vireon Safety Institute 🙏\n\nI'm ${name} and I'm interested in the ${course || 'safety course'}.\nMy contact: ${phone}\nPlease guide me with the admission process.`
    );
    // Build link silently — don't auto-open, just log
    const waLink  = `https://wa.me/918227894630?text=${waMsg}`;
    console.info('[VSI] Form submitted. WA ready:', waLink);

  }, 1200);
}

/* ================================================================
   TICKER — ensure seamless loop by doubling content
   ================================================================ */
function initTickerDuplicate() {
  const inner = document.getElementById('ticker-inner');
  if (!inner) return;
  // Already duplicated in HTML. Just ensure animation is set.
}

/* ================================================================
   FLOATING BTN PULSE
   ================================================================ */
(function addFabPulse() {
  const waBtn = document.getElementById('fab-whatsapp');
  if (!waBtn) return;
  waBtn.style.animation = 'none';
  let pulse = true;
  setInterval(() => {
    waBtn.style.boxShadow = pulse
      ? '0 0 0 6px rgba(37,211,102,0.25), 0 8px 24px rgba(0,0,0,0.25)'
      : '0 8px 24px rgba(0,0,0,0.25)';
    pulse = !pulse;
  }, 1800);
})();

/* ================================================================
   SCROLL-TO-TOP on logo click
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[href="#home"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      closeMobileMenu();
    });
  });
});

/* ================================================================
   EXPOSE GLOBALS (for inline onclick handlers)
   ================================================================ */
window.openPopup      = openPopup;
window.closePopup     = closePopup;
window.toggleFaq      = toggleFaq;
window.closeMobileMenu = closeMobileMenu;

/* ================================================================
   COURSE TABS
   ================================================================ */
function switchCourseTab(category) {
  // Deactivate all tabs
  document.querySelectorAll('.course-tab').forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-selected', 'false');
  });
  // Deactivate all panels
  document.querySelectorAll('.course-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // Activate selected tab + panel
  const activeTab   = document.getElementById('tab-' + category);
  const activePanel = document.getElementById('panel-' + category);

  if (activeTab)   { activeTab.classList.add('active');   activeTab.setAttribute('aria-selected', 'true'); }
  if (activePanel) { activePanel.classList.add('active'); }
}

window.switchCourseTab = switchCourseTab;

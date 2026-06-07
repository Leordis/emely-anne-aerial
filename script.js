/* ======================================================
   EMILY ANNE — LANDING PAGE JAVASCRIPT
   Clean, performant, accessible
   ====================================================== */

'use strict';

// ===== UTILITIES =====
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initTestimonials();
  initFAQ();
  initForm();
  initStickyBooking();
  initSmoothScroll();
  initParallax();
  initHeroVideo();
});

/* ====================================================
   NAVIGATION
   ==================================================== */
function initNav() {
  const nav = $('#nav');
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  let lastScroll = 0;

  // Scrolled state
  const handleScroll = () => {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile toggle
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.contains('mobile-open');
    links.classList.toggle('mobile-open', !isOpen);
    toggle.classList.toggle('active', !isOpen);
    toggle.setAttribute('aria-expanded', (!isOpen).toString());
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  // Close on link click
  $$('.nav__link', links).forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('mobile-open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (links.classList.contains('mobile-open') &&
      !nav.contains(e.target)) {
      links.classList.remove('mobile-open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Active section highlight
  const sections = $$('section[id]');
  const navItems = $$('.nav__link:not(.nav__link--cta)');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(item => {
          item.style.color = '';
          const href = item.getAttribute('href');
          if (href && href.slice(1) === entry.target.id) {
            item.style.color = 'var(--white)';
          }
        });
      }
    });
  }, { threshold: 0.4, rootMargin: '-72px 0px 0px 0px' });

  sections.forEach(s => sectionObserver.observe(s));
}

/* ====================================================
   SCROLL REVEAL
   ==================================================== */
function initReveal() {
  const elements = $$('.reveal');

  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));

  // Trigger hero elements immediately
  $$('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 180);
  });
}

/* ====================================================
   TESTIMONIALS CAROUSEL
   ==================================================== */
function initTestimonials() {
  const track = $('#testTrack');
  const prevBtn = $('#testPrev');
  const nextBtn = $('#testNext');
  const dotsContainer = $('#testDots');

  if (!track) return;

  const cards = $$('.test-card', track);
  let current = 0;
  let autoplayTimer;
  let isDesktop = window.innerWidth >= 900;
  let visibleCount = isDesktop ? 2 : 1;

  // Create dots
  const totalDots = isDesktop ? Math.ceil(cards.length / 2) : cards.length;

  function createDots() {
    dotsContainer.innerHTML = '';
    const count = window.innerWidth >= 900 ? Math.ceil(cards.length / 2) : cards.length;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'test-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots(idx) {
    $$('.test-dot', dotsContainer).forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
      dot.setAttribute('aria-selected', (i === idx).toString());
    });
  }

  function goTo(idx) {
    const dots = $$('.test-dot', dotsContainer);
    const maxIdx = dots.length - 1;
    current = Math.max(0, Math.min(idx, maxIdx));
    const cardWidth = window.innerWidth >= 900
      ? track.offsetWidth / 2 + 12
      : track.offsetWidth;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots(current);
  }

  function next() {
    const dots = $$('.test-dot', dotsContainer);
    goTo(current + 1 > dots.length - 1 ? 0 : current + 1);
  }

  function prev() {
    const dots = $$('.test-dot', dotsContainer);
    goTo(current - 1 < 0 ? dots.length - 1 : current - 1);
  }

  function startAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  createDots();
  prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
  nextBtn.addEventListener('click', () => { next(); startAutoplay(); });

  track.parentElement.addEventListener('mouseenter', stopAutoplay);
  track.parentElement.addEventListener('mouseleave', startAutoplay);

  startAutoplay();

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      startAutoplay();
    }
  }, { passive: true });

  // Keyboard
  track.parentElement.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
    if (e.key === 'ArrowRight') { next(); startAutoplay(); }
  });

  // Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      createDots();
      goTo(0);
    }, 200);
  });
}

/* ====================================================
   FAQ ACCORDION
   ==================================================== */
function initFAQ() {
  $$('.faq-item').forEach(item => {
    const btn = $('.faq-q', item);
    const answer = $('.faq-a', item);

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      $$('.faq-q[aria-expanded="true"]').forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherAnswer = otherBtn.nextElementSibling;
          if (otherAnswer) otherAnswer.hidden = true;
        }
      });

      // Toggle this one
      btn.setAttribute('aria-expanded', (!isExpanded).toString());
      answer.hidden = isExpanded;

      // Smooth scroll if needed
      if (!isExpanded) {
        setTimeout(() => {
          const itemTop = item.getBoundingClientRect().top + window.scrollY;
          const navHeight = 72;
          if (itemTop < window.scrollY + navHeight) {
            window.scrollTo({ top: itemTop - navHeight - 20, behavior: 'smooth' });
          }
        }, 50);
      }
    });
  });
}

/* ====================================================
   BOOKING FORM
   ==================================================== */
function initForm() {
  const form = $('#bookingForm');
  const success = $('#formSuccess');

  if (!form) return;

  // Required fields
  const required = $$('[required]', form);

  function showError(field) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
  }

  function clearError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
  }

  required.forEach(field => {
    field.addEventListener('blur', () => {
      if (!field.value.trim()) {
        showError(field);
      } else {
        clearError(field);
      }
    });

    field.addEventListener('input', () => {
      if (field.value.trim()) clearError(field);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    required.forEach(field => {
      if (!field.value.trim()) {
        showError(field);
        valid = false;
      }
    });

    // Email validation
    const emailField = $('#email', form);
    if (emailField && emailField.value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailField.value)) {
        showError(emailField);
        valid = false;
      }
    }

    if (!valid) {
      // Scroll to first error
      const firstError = $('.error', form);
      if (firstError) {
        const top = firstError.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      return;
    }

    // Simulate submission (replace with actual backend/FormSpree/Netlify Forms)
    const submitBtn = $('button[type="submit"]', form);
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Replace this timeout with actual fetch() to your form endpoint
    setTimeout(() => {
      form.hidden = true;
      if (success) {
        success.removeAttribute('hidden');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 1200);
  });
}

/* ====================================================
   STICKY BOOKING CTA (mobile)
   ==================================================== */
function initStickyBooking() {
  const stickyCta = $('#stickyCta');
  if (!stickyCta) return;

  const hero = $('#hero');
  const bookingSection = $('#booking');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target === hero) {
        if (!entry.isIntersecting) {
          stickyCta.classList.add('visible');
          stickyCta.removeAttribute('aria-hidden');
        } else {
          stickyCta.classList.remove('visible');
          stickyCta.setAttribute('aria-hidden', 'true');
        }
      }

      if (entry.target === bookingSection) {
        if (entry.isIntersecting) {
          stickyCta.classList.remove('visible');
          stickyCta.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }, { threshold: 0.1 });

  if (hero) observer.observe(hero);
  if (bookingSection) observer.observe(bookingSection);
}

/* ====================================================
   SMOOTH SCROLL
   ==================================================== */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();
      const navHeight = 72;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}

/* ====================================================
   PARALLAX (subtle, performance-conscious)
   ==================================================== */
function initParallax() {
  // Skip if reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroContent = $('.hero__content');
  if (!heroContent) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroHeight = document.getElementById('hero')?.offsetHeight || 0;

        if (scrollY < heroHeight) {
          const offset = scrollY * 0.25;
          heroContent.style.transform = `translateY(${offset}px)`;
          heroContent.style.opacity = 1 - (scrollY / (heroHeight * 0.7));
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ====================================================
   HERO VIDEO FALLBACK
   ==================================================== */
function initHeroVideo() {
  const video = $('.hero__video');
  const fallback = $('.hero__image-fallback');
  if (!video || !fallback) return;

  // Force muted, playsinline, and autoplay properties in JS for mobile Safari/Chrome compatibility
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');

  const sources = $$('source', video);
  const hasSrc = video.src || sources.some(s => s.src);

  if (!hasSrc) {
    video.style.display = 'none';
    fallback.style.zIndex = '0';
    return;
  }

  // Smoothly fade in video once it actually starts playing to avoid visual flashing
  const handleVideoPlaying = () => {
    video.classList.add('is-loaded');
  };

  if (video.readyState >= 3 || (!video.paused && !video.seeking)) {
    handleVideoPlaying();
  } else {
    video.addEventListener('playing', handleVideoPlaying, { once: true });
    video.addEventListener('loadeddata', handleVideoPlaying, { once: true });
  }

  // Handle video error gracefully (only hide if all sources failed)
  video.addEventListener('error', () => {
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      console.warn("Hero video failed to load: all sources exhausted.");
      video.style.display = 'none';
      fallback.style.zIndex = '0';
    }
  });

  // Safe play function with interaction fallback
  const playVideo = () => {
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Hero video autoplay prevented. Will play on first user interaction.", error);

        const playOnInteraction = () => {
          video.muted = true;
          video.play().then(() => {
            cleanupInteraction();
          }).catch(err => {
            console.log("Interactive play attempt failed:", err);
          });
        };

        const cleanupInteraction = () => {
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
          document.removeEventListener('keydown', playOnInteraction);
          window.removeEventListener('scroll', playOnInteraction);
        };

        document.addEventListener('click', playOnInteraction, { once: true, passive: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true, passive: true });
        document.addEventListener('keydown', playOnInteraction, { once: true, passive: true });
        window.addEventListener('scroll', playOnInteraction, { once: true, passive: true });
      });
    }
  };

  // Try to play immediately
  playVideo();

  // Pause video when not in viewport, play when returned (battery/performance)
  // We track the first observer run to avoid pausing on load if layout isn't settled
  let isFirstRun = true;
  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        playVideo();
      } else {
        if (!isFirstRun && !video.paused) {
          video.pause();
        }
      }
      isFirstRun = false;
    });
  }, { threshold: 0.1 });

  videoObserver.observe(video.closest('.hero') || video);
}

/* ====================================================
   GALLERY — Lightbox (simple)
   ==================================================== */
(function initGallery() {
  const items = $$('.gallery-item__inner');
  if (!items.length) return;

  // Create lightbox
  const lightbox = document.createElement('div');
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image lightbox');
  lightbox.innerHTML = `
    <div class="lb-overlay"></div>
    <button class="lb-close" aria-label="Close lightbox">✕</button>
    <div class="lb-img-wrap"><div class="lb-img"></div></div>
  `;
  lightbox.style.cssText = `
    position:fixed;inset:0;z-index:9999;display:none;
    align-items:center;justify-content:center;
  `;

  const overlay = lightbox.querySelector('.lb-overlay');
  const closeBtn = lightbox.querySelector('.lb-close');
  const imgEl = lightbox.querySelector('.lb-img');

  overlay.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,0.92);backdrop-filter:blur(8px);`;
  closeBtn.style.cssText = `
    position:absolute;top:24px;right:24px;z-index:1;background:none;border:none;
    color:var(--gold);font-size:24px;cursor:pointer;width:44px;height:44px;
    display:flex;align-items:center;justify-content:center;
    border:1px solid rgba(201,169,110,0.3);border-radius:50%;transition:all 0.2s;
    font-family:var(--font-sans);
  `;
  imgEl.style.cssText = `
    position:relative;z-index:1;max-width:90vw;max-height:90vh;
    width:80vmin;height:80vmin;background-size:contain;background-repeat:no-repeat;
    background-position:center;border:1px solid rgba(201,169,110,0.1);
  `;

  document.body.appendChild(lightbox);

  function openLightbox(bg) {
    imgEl.style.backgroundImage = bg;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  items.forEach(item => {
    item.style.cursor = 'zoom-in';
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', item.getAttribute('aria-label') || 'View image');

    const open = () => openLightbox(item.style.backgroundImage);
    item.addEventListener('click', open);
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  overlay.addEventListener('click', closeLightbox);
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') closeLightbox();
  });
})();

/* ====================================================
   PERFORMANCE CARD CURSOR GLOW (desktop only)
   ==================================================== */
(function initCardGlow() {
  if (window.matchMedia('(hover: none)').matches) return;

  $$('.perf-card, .priv-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--glow-x', `${x}%`);
      card.style.setProperty('--glow-y', `${y}%`);
    });
  });
})();

/* ====================================================
   NUMBERS COUNTER ANIMATION
   ==================================================== */
(function initCounters() {
  const stats = $$('.test-stat__number');
  if (!stats.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const text = el.textContent;
      const num = parseFloat(text);
      const suffix = text.replace(/[\d.]/g, '');

      if (isNaN(num)) return;

      const duration = 1800;
      const start = performance.now();
      const startVal = 0;

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = startVal + (num - startVal) * eased;
        el.textContent = (num % 1 !== 0 ? current.toFixed(1) : Math.floor(current)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => observer.observe(stat));
})();

/* ====================================================
   ANNOUNCE FORM SUBMISSION TO SCREEN READERS
   ==================================================== */
(function initAnnouncer() {
  const announcer = document.createElement('div');
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.className = 'sr-only';
  announcer.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
  document.body.appendChild(announcer);

  window.announce = (msg) => {
    announcer.textContent = '';
    requestAnimationFrame(() => { announcer.textContent = msg; });
  };
})();

/* ====================================================
   CUSTOM VIDEO PLAYER (Showcase)
   ==================================================== */
(function initCustomVideoPlayer() {
  const container = document.querySelector('.video-player');
  const video = document.getElementById('showcaseVideo');

  if (!container || !video) return;

  container.addEventListener('click', () => {
    if (video.paused) {
      video.play().then(() => {
        container.classList.add('is-playing');
        video.setAttribute('controls', 'true');
      }).catch(err => {
        console.error("Error playing showcase video:", err);
      });
    }
  });

  video.addEventListener('ended', () => {
    container.classList.remove('is-playing');
    video.removeAttribute('controls');
    video.load();
  });
})();

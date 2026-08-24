/* KeepCounsel — interactions */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero load-in sequence (runs once, on load, not scroll-gated) ---------- */
  var loadEls = Array.prototype.slice.call(document.querySelectorAll('[data-load]'));
  if (loadEls.length) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        loadEls.forEach(function (el) { el.classList.add('is-loaded'); });
      });
    });
  }

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector('.site-header');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 12);
    var backTop = document.querySelector('.back-to-top');
    if (backTop) backTop.classList.toggle('is-visible', y > 700);
    lastY = y;
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      mobileNav.classList.toggle('is-open', !open);
      document.body.style.overflow = !open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720 && mobileNav.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a, .mobile-nav a'));
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Smooth anchor scroll with header offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = (header ? header.offsetHeight : 0) + 14;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window && !prefersReduced) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el, i) {
      var group = el.closest('[data-reveal-group]');
      if (group) el.style.setProperty('--i', (i % 6));
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    if (prefersReduced) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var start = 0;
    var duration = 1400;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = start + (target - start) * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.faq-a').style.maxHeight = null;
          openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('is-open', !isOpen);
      q.setAttribute('aria-expanded', String(!isOpen));
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
    });
  });

  /* ---------- Pricing tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.pricing-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.pricing-panel'));
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(function (p) { p.classList.remove('is-active'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      var target = document.getElementById(tab.getAttribute('data-tab'));
      if (target) target.classList.add('is-active');
    });
  });

  /* ---------- Testimonial carousel ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.testi-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.testi-dot'));
  var current = 0;
  var testiTimer;
  function showSlide(idx) {
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
    current = idx;
  }
  function nextSlide() { showSlide((current + 1) % slides.length); }
  function startTesti() {
    if (prefersReduced || slides.length < 2) return;
    testiTimer = setInterval(nextSlide, 6500);
  }
  function stopTesti() { clearInterval(testiTimer); }
  if (slides.length) {
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { showSlide(i); stopTesti(); startTesti(); });
    });
    var testiWrap = document.querySelector('.testi-wrap');
    if (testiWrap) {
      testiWrap.addEventListener('mouseenter', stopTesti);
      testiWrap.addEventListener('mouseleave', startTesti);
    }
    startTesti();
  }

  /* ---------- Hero parallax blobs (subtle, disabled on reduced motion / touch) ---------- */
  var blobs = Array.prototype.slice.call(document.querySelectorAll('.deco-blob'));
  if (blobs.length && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', function (e) {
      var xRatio = e.clientX / window.innerWidth - 0.5;
      var yRatio = e.clientY / window.innerHeight - 0.5;
      blobs.forEach(function (b, i) {
        var depth = (i + 1) * 8;
        b.style.transform = 'translate(' + (xRatio * depth) + 'px, ' + (yRatio * depth) + 'px)';
      });
    }, { passive: true });
  }

  /* ---------- AI Contract Review dropzone (client-side preview only — no upload occurs here; see markup comment) ---------- */
  var dropzone = document.querySelector('.dropzone');
  if (dropzone) {
    var fileInput = dropzone.querySelector('input[type="file"]');
    var fileDisplay = document.querySelector('.dropzone-file');
    var fileNameEl = document.querySelector('.dropzone-file .fname');
    function showFile(file) {
      if (!file) return;
      var kb = Math.round(file.size / 1024);
      fileNameEl.textContent = file.name + ' (' + kb + ' KB)';
      fileDisplay.classList.add('is-visible');
    }
    dropzone.addEventListener('click', function (e) {
      if (e.target.closest('.dropzone-file')) return;
      fileInput.click();
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) showFile(fileInput.files[0]);
    });
    ['dragover', 'dragenter'].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.add('is-dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.remove('is-dragover'); });
    });
    dropzone.addEventListener('drop', function (e) {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) showFile(e.dataTransfer.files[0]);
    });
    var clearBtn = document.querySelector('.dropzone-file button');
    if (clearBtn) {
      clearBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        fileInput.value = '';
        fileDisplay.classList.remove('is-visible');
      });
    }
  }

  /* ---------- Lead capture form (static demo) ---------- */
  var leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = leadForm.querySelector('button[type="submit"]');
      var foot = leadForm.querySelector('.lead-form-foot');
      leadForm.querySelectorAll('input').forEach(function (i) { i.disabled = true; });
      btn.textContent = 'Thanks — this is a demo';
      btn.disabled = true;
      if (foot) foot.textContent = 'Wire this up to a real email tool so the checklist actually sends.';
    });
  }

  /* ---------- Back to top ---------- */
  var backTopBtn = document.querySelector('.back-to-top');
  if (backTopBtn) {
    backTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

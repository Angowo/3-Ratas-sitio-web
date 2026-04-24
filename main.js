// main.js - nav, smooth scroll, hover, per-carousel init, video handling
document.addEventListener('DOMContentLoaded', () => {
  // NAV / TOPBAR
  const navToggleButtons = document.querySelectorAll('.nav-toggle');
  const mainNav = document.querySelector('#mainNav');
  const siteHeader = document.querySelector('.site-header');
  const topbar = document.querySelector('.topbar');
  const headerInner = document.querySelector('.topbar .header-inner');
  const returnLinks = document.querySelectorAll('.return-top, a[href="#top"]');

  navToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const nav = document.querySelector('#mainNav');
      if (!nav) return;
      nav.classList.toggle('open');
      btn.classList.toggle('open');
    });
  });

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.closest && target.closest('#mainNav') && target.tagName === 'A') {
      if (mainNav) mainNav.classList.remove('open');
      document.querySelectorAll('.nav-toggle').forEach(b => b.classList.remove('open'));
    }
  });

  returnLinks.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // TOPBAR show on scroll
  const showHeaderOn = 140;
  let lastKnownScroll = 0;
  let ticking = false;

  function handleHeader(scrollY) {
    if (!siteHeader || !topbar) return;
    if (scrollY > showHeaderOn) {
      if (!siteHeader.classList.contains('scrolled')) {
        siteHeader.classList.add('scrolled');
        const h = headerInner ? headerInner.getBoundingClientRect().height : 64;
        document.body.style.paddingTop = `${h}px`;
      }
    } else {
      if (siteHeader.classList.contains('scrolled')) {
        siteHeader.classList.remove('scrolled');
        document.body.style.paddingTop = '';
      }
    }
  }

  function onScroll() {
    lastKnownScroll = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleHeader(lastKnownScroll);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  handleHeader(window.scrollY);

  // Hover/focus microinteractions
  const interactiveSelectors = ['.service', '.slide-card', '.team-block'];
  interactiveSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.addEventListener('pointerenter', () => el.classList.add('is-hovered'));
      el.addEventListener('pointerleave', () => el.classList.remove('is-hovered'));
      el.addEventListener('focusin', () => el.classList.add('is-hovered'));
      el.addEventListener('focusout', () => el.classList.remove('is-hovered'));
    });
  });

  // Initialize each carousel section independently
  document.querySelectorAll('.carousel-section').forEach((carouselSection) => {
    const slidesContainer = carouselSection.querySelector('.slides');
    const slides = carouselSection.querySelectorAll('.slide');
    let prevBtn = carouselSection.querySelector('.carousel-prev');
    let nextBtn = carouselSection.querySelector('.carousel-next');
    let dotsContainer = carouselSection.querySelector('.dots');

    if (!slidesContainer || slides.length === 0) return;

    let currentIndex = 0;
    const total = slides.length;

    // create dots container if missing
    if (!dotsContainer) {
      dotsContainer = document.createElement('div');
      dotsContainer.className = 'dots';
      carouselSection.appendChild(dotsContainer);
    } else {
      dotsContainer.innerHTML = '';
    }

    // create dots
    for (let i = 0; i < total; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dot' + (i === 0 ? ' active' : '');
      btn.addEventListener('click', () => {
        currentIndex = i;
        update();
      });
      dotsContainer.appendChild(btn);
    }

    // fallback for older class names
    if (!prevBtn) prevBtn = carouselSection.querySelector('.carousel-btn.btn-prev');
    if (!nextBtn) nextBtn = carouselSection.querySelector('.carousel-btn.btn-next');

    function update() {
      slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
      if (prevBtn) prevBtn.style.display = '';
      if (nextBtn) nextBtn.style.display = '';
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % total;
        update();
      });
      nextBtn.style.display = '';
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + total) % total;
        update();
      });
      prevBtn.style.display = '';
    }

    // touch swipe
    let startX = null;
    slidesContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    slidesContainer.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) currentIndex = Math.min(total - 1, currentIndex + 1);
        else currentIndex = Math.max(0, currentIndex - 1);
        update();
      }
      startX = null;
    });

    // keyboard navigation when focus inside section
    carouselSection.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % total;
        update();
      } else if (e.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + total) % total;
        update();
      }
    });

    update();
  });

  // Video handling (delegated)
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('.work-link[data-video]');
    if (!link) return;
    e.preventDefault();
    const card = link.closest('.slide-card');
    if (!card) return;
    const videoContainer = card.querySelector('.video-container');
    const iframe = videoContainer ? videoContainer.querySelector('iframe') : null;
    if (!iframe) return;

    // stop other iframes
    document.querySelectorAll('.video-container iframe').forEach(f => {
      if (f !== iframe) {
        f.src = '';
        const c = f.closest('.video-container');
        if (c) c.style.display = 'none';
        const otherCard = c ? c.closest('.slide-card') : null;
        if (otherCard) {
          const img = otherCard.querySelector('.slide-img');
          if (img) img.style.display = '';
        }
      }
    });

    const base = link.dataset.video;
    iframe.src = base + (base.includes('?') ? '&autoplay=1' : '?autoplay=1');
    videoContainer.style.display = 'block';
    const img = card.querySelector('.slide-img');
    if (img) img.style.display = 'none';
  });

  // click outside video to stop playback
  document.addEventListener('click', (e) => {
    const isWorkLink = e.target.closest && e.target.closest('.work-link[data-video]');
    const isInsideVideo = e.target.closest && e.target.closest('.video-container, .slide-card');
    if (!isWorkLink && !isInsideVideo) {
      document.querySelectorAll('.video-container iframe').forEach(iframe => {
        if (iframe.src) iframe.src = '';
        const container = iframe.closest('.video-container');
        if (container) container.style.display = 'none';
        const card = container ? container.closest('.slide-card') : null;
        if (card) {
          const img = card.querySelector('.slide-img');
          if (img) img.style.display = '';
        }
      });
    }
  }, true);
});

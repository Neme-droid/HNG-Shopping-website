/* TerraVerde — interactivity */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* Mobile navigation */
  const toggle = $('.nav-toggle');
  const navList = $('.nav-list');
  const setNav = (open) => {
    if (!toggle || !navList) return;
    toggle.classList.toggle('active', open);
    navList.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle?.addEventListener('click', () => setNav(!navList.classList.contains('active')));
  $$('.nav-list a').forEach(a => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });
  document.addEventListener('click', e => {
    if (navList?.classList.contains('active') && !e.target.closest('.nav-menu')) setNav(false);
  });

  /* Header shadow on scroll */
  const header = $('.site-header');
  const onScroll = () => header?.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Active nav link while scrolling */
  const links = $$('.nav-list a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.classList.toggle('current', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* Scroll reveal (staggered) */
  const revealTargets = $$(
    '.section-header, .category-card, .product-card, .value-card, .testimonial-slide, .newsletter-form'
  );
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(el => el.classList.add('reveal', 'in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => {
      const siblings = [...el.parentElement.children];
      el.style.setProperty('--i', siblings.indexOf(el) % 4);
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* Product filter */
  const filterBtns = $$('.filter-btn');
  const cards = $$('.product-card');
  filterBtns.forEach(btn => {
    btn.setAttribute('aria-pressed', btn.classList.contains('active'));
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filterBtns.forEach(b => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on);
      });
      let n = 0;
      cards.forEach(card => {
        const show = f === 'all' || card.dataset.category === f;
        card.hidden = !show;
        card.classList.remove('filter-in');
        if (show) {
          card.classList.add('in'); // make sure it is visible even if not yet revealed
          card.style.setProperty('--d', `${n++ * 60}ms`);
          void card.offsetWidth; // restart animation
          card.classList.add('filter-in');
        }
      });
    });
  });

  /* Cart: counter, persistence, toast */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('tv-cart')) || {}; } catch { return {}; } },
    set(v) { try { localStorage.setItem('tv-cart', JSON.stringify(v)); } catch { /* private mode */ } }
  };
  let cart = store.get();
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);

  const cartLink = document.createElement('a');
  cartLink.href = '#featured';
  cartLink.className = 'cart-link';
  cartLink.setAttribute('aria-label', 'Cart');
  cartLink.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11h10.2L20 8H6.2"/><circle cx="9" cy="19.5" r="1.2"/><circle cx="17" cy="19.5" r="1.2"/></svg><span class="cart-count" aria-live="polite">0</span>';
  const cta = $('.header-container > .cta-button');
  cta ? cta.before(cartLink) : $('.header-container')?.append(cartLink);
  const badge = $('.cart-count', cartLink);
  const renderCart = (bump) => {
    const n = count();
    badge.textContent = n;
    cartLink.setAttribute('aria-label', `Cart, ${n} item${n === 1 ? '' : 's'}`);
    cartLink.classList.toggle('has-items', n > 0);
    if (bump) { cartLink.classList.remove('bump'); void cartLink.offsetWidth; cartLink.classList.add('bump'); }
  };
  renderCart(false);

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.append(toast);
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  $$('.product-button').forEach(btn => {
    const label = btn.textContent;
    btn.addEventListener('click', () => {
      const name = btn.closest('.product-card')?.querySelector('.product-name')?.textContent.trim() || 'Item';
      cart[name] = (cart[name] || 0) + 1;
      store.set(cart);
      renderCart(true);
      showToast(`Added ${name} to your cart`);
      btn.textContent = 'Added ✓';
      btn.classList.add('added');
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { btn.textContent = label; btn.classList.remove('added'); }, 1400);
    });
  });

  /* Category links: filter featured products to that category */
  $$('.category-card .category-link').forEach(link => {
    link.addEventListener('click', () => {
      const cat = $('.category-name', link.closest('.category-card'))?.textContent.trim().toLowerCase();
      $(`.filter-btn[data-filter="${cat}"]`)?.click();
    });
  });

  /* Testimonial slider: arrows + drag */
  const slider = $('.testimonials-slider');
  if (slider) {
    const controls = document.createElement('div');
    controls.className = 'slider-controls';
    controls.innerHTML =
      '<button type="button" class="slider-btn" data-dir="-1" aria-label="Previous testimonial">←</button>' +
      '<button type="button" class="slider-btn" data-dir="1" aria-label="Next testimonial">→</button>';
    slider.after(controls);
    controls.addEventListener('click', e => {
      const b = e.target.closest('.slider-btn');
      if (!b) return;
      const step = ($('.testimonial-slide', slider)?.offsetWidth || 300) + 32;
      slider.scrollBy({ left: step * Number(b.dataset.dir), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    let down = false, startX = 0, startScroll = 0;
    slider.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      down = true; startX = e.clientX; startScroll = slider.scrollLeft;
      slider.classList.add('dragging');
    });
    addEventListener('pointermove', e => { if (down) slider.scrollLeft = startScroll - (e.clientX - startX); });
    addEventListener('pointerup', () => { down = false; slider.classList.remove('dragging'); });
  }

  /* Newsletter form */
  const form = $('#newsletter-form');
  const msg = $('#form-message');
  if (form && msg) {
    const input = $('#newsletter-email');
    const submit = $('button[type="submit"]', form);
    const say = (text, type) => { msg.textContent = text; msg.className = 'form-message ' + type; msg.id = 'form-message'; };
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        say('Please enter a valid email address.', 'error');
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      submit.disabled = true;
      submit.textContent = 'Subscribing…';
      // TODO: replace with a real request to your email provider.
      setTimeout(() => {
        say(`Thanks! Your 10% code is on its way to ${email}.`, 'success');
        form.reset();
        submit.disabled = false;
        submit.textContent = 'Subscribe and save 10%';
      }, 700);
    });
    input.addEventListener('input', () => { if (msg.classList.contains('error')) say('', ''); });
  }
})();
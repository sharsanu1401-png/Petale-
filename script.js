/* ============================================================
   Pétale Skin Co. — script.js
   Vanilla JavaScript for all interactive features
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- LOADER ---- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 1200);
  });

  /* ---- CUSTOM CURSOR ---- */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth follower with requestAnimationFrame
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Cursor grow on interactive elements
  const interactables = document.querySelectorAll('a, button, .product-card, .gallery-item');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });

  // Hide cursor on mobile
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  /* ---- NAVBAR STICKY & SCROLL ---- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
      backToTop.classList.add('visible');
    } else {
      navbar.classList.remove('scrolled');
      backToTop.classList.remove('visible');
    }
    revealOnScroll();
  });

  /* ---- SMOOTH SCROLL NAV LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Close mobile menu
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---- MOBILE HAMBURGER ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  /* ---- DARK / LIGHT THEME TOGGLE ---- */
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon   = document.getElementById('theme-icon');
  const body        = document.body;

  // Persist theme
  const savedTheme = localStorage.getItem('petale-theme');
  if (savedTheme === 'dark') applyDark();

  function applyDark() {
    body.classList.replace('light-theme', 'dark-theme');
    themeIcon.className = 'fas fa-sun';
  }
  function applyLight() {
    body.classList.replace('dark-theme', 'light-theme');
    themeIcon.className = 'fas fa-moon';
  }

  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
      applyLight();
      localStorage.setItem('petale-theme', 'light');
    } else {
      applyDark();
      localStorage.setItem('petale-theme', 'dark');
    }
  });

  /* ---- CART SYSTEM ---- */
  let cart = JSON.parse(localStorage.getItem('petale-cart') || '[]');

  const cartBtn     = document.getElementById('cart-btn');
  const cartPopup   = document.getElementById('cart-popup');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose   = document.getElementById('cart-close');
  const cartItems   = document.getElementById('cart-items');
  const cartTotal   = document.getElementById('cart-total');
  const cartFooter  = document.getElementById('cart-footer');
  const cartBadge   = document.getElementById('cart-badge');

  function openCart() {
    cartPopup.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartPopup.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  function saveCart() { localStorage.setItem('petale-cart', JSON.stringify(cart)); }

  function renderCart() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    cartBadge.textContent = cart.reduce((s, i) => s + i.qty, 0);

    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="cart-empty">Your bag is empty.<br/>Add a kit to begin your ritual.</p>';
      cartFooter.style.display = 'none';
    } else {
      cartItems.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
          </div>
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <button class="cart-item-remove" data-action="dec" data-idx="${idx}" aria-label="Decrease quantity">−</button>
            <span style="font-size:0.9rem;font-weight:600">${item.qty}</span>
            <button class="cart-item-remove" data-action="inc" data-idx="${idx}" aria-label="Increase quantity">+</button>
            <button class="cart-item-remove" data-action="rem" data-idx="${idx}" aria-label="Remove item" style="color:#999">✕</button>
          </div>
        </div>`).join('');
      cartTotal.textContent = `Total: ₹${total.toLocaleString('en-IN')}`;
      cartFooter.style.display = 'block';
    }

    // Bind cart item buttons
    cartItems.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx);
        if (btn.dataset.action === 'inc') cart[i].qty++;
        else if (btn.dataset.action === 'dec') { cart[i].qty--; if (cart[i].qty < 1) cart.splice(i,1); }
        else cart.splice(i, 1);
        saveCart(); renderCart();
      });
    });
  }

  // Add to cart buttons
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const name  = btn.dataset.name;
      const price = parseInt(btn.dataset.price);
      const existing = cart.find(i => i.name === name);
      if (existing) existing.qty++;
      else cart.push({ name, price, qty: 1 });
      saveCart(); renderCart();
      openCart();

      // Button feedback animation
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check" style="position:relative;z-index:1"></i> Added!';
      btn.style.background = 'var(--sage)';
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 1500);
    });
  });

  renderCart();

  /* ---- TESTIMONIAL SLIDER ---- */
  const slider     = document.getElementById('testimonial-slider');
  const dotsWrap   = document.getElementById('slider-dots');
  const prevBtn    = document.getElementById('slider-prev');
  const nextBtn    = document.getElementById('slider-next');
  const cards      = slider.querySelectorAll('.testimonial-card');
  let currentSlide = 0;
  let autoSlide;

  function getVisible() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function buildDots() {
    const visible = getVisible();
    const total   = Math.ceil(cards.length / visible);
    dotsWrap.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === currentSlide ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(idx) {
    const visible = getVisible();
    const total   = Math.ceil(cards.length / visible);
    currentSlide  = ((idx % total) + total) % total;
    const offset  = currentSlide * (100 / visible * visible);
    slider.style.transform = `translateX(-${currentSlide * (100 / visible) * visible}%)`;

    // Update card widths
    cards.forEach(c => c.style.flex = `0 0 calc(${100 / visible}% - 1rem)`);

    // Shift by currentSlide sets
    const cardWidth = cards[0].offsetWidth + 24;
    slider.style.transform = `translateX(-${currentSlide * cardWidth * visible}px)`;
    dotsWrap.querySelectorAll('.dot').forEach((d,i) => d.classList.toggle('active', i === currentSlide));
  }

  function goNext() { goTo(currentSlide + 1); }
  function goPrev() { goTo(currentSlide - 1); }

  prevBtn.addEventListener('click', () => { goPrev(); resetAuto(); });
  nextBtn.addEventListener('click', () => { goNext(); resetAuto(); });

  function startAuto() { autoSlide = setInterval(goNext, 4000); }
  function resetAuto()  { clearInterval(autoSlide); startAuto(); }

  // Init slider
  function initSlider() {
    const visible = getVisible();
    cards.forEach(c => c.style.flex = `0 0 calc(${100 / visible}% - 1rem)`);
    buildDots();
    goTo(0);
  }

  initSlider();
  startAuto();
  window.addEventListener('resize', initSlider);

  // Touch/swipe for slider
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); resetAuto(); }
  });

  /* ---- SCROLL REVEAL ---- */
  function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    reveals.forEach(el => {
      const top = el.getBoundingClientRect().top;
      if (top < window.innerHeight - 80) el.classList.add('visible');
    });
  }
  revealOnScroll(); // Run once on load

  /* ---- NEWSLETTER FORM ---- */
  const nlForm   = document.getElementById('newsletter-form');
  const nlSubmit = document.getElementById('nl-submit');

  nlForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('nl-email').value.trim();
    if (!email || !email.includes('@')) {
      shakeElement(nlForm);
      return;
    }
    // Animate button
    nlSubmit.innerHTML = '<span class="btn-text">Joining...</span>';
    nlSubmit.disabled  = true;
    setTimeout(() => {
      nlSubmit.innerHTML = '<span class="btn-text">You\'re in! ✿</span>';
      nlForm.reset();
      setTimeout(() => {
        nlSubmit.innerHTML = '<span class="btn-text">Join the Circle</span><span class="btn-icon"><i class="fas fa-paper-plane"></i></span>';
        nlSubmit.disabled  = false;
      }, 3000);
    }, 1500);
  });

  function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => el.style.animation = '', 400);
  }

  // Shake keyframe injection
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `@keyframes shake {
    0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)}
    60%{transform:translateX(-5px)} 80%{transform:translateX(5px)}
  }`;
  document.head.appendChild(shakeStyle);

  /* ---- PARALLAX HERO ---- */
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroImg.style.transform = `translateY(${scrollY * 0.08}px)`;
      }
    });
  }

  /* ---- BACK TO TOP ---- */
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---- ACTIVE NAV LINK ON SCROLL ---- */
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + navbar.offsetHeight + 40;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) link.classList.toggle('active-link', scrollY >= top && scrollY < top + height);
    });
  });

  // Active link style injection
  const activeLinkStyle = document.createElement('style');
  activeLinkStyle.textContent = `.active-link { color: var(--blush) !important; } .active-link::after { width: 100% !important; }`;
  document.head.appendChild(activeLinkStyle);

  /* ---- GALLERY HOVER EFFECTS ---- */
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.zIndex = '2';
      item.style.boxShadow = 'var(--shadow-hover)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.zIndex = '';
      item.style.boxShadow = '';
    });
  });

  /* ---- KEYBOARD NAV FOR CART ---- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && cartPopup.classList.contains('open')) closeCart();
  });

  /* ---- PAGE TRANSITION ---- */
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  setTimeout(() => { document.body.style.opacity = '1'; }, 100);

});

/* ========== CHATBOT WIDGET ========== */
(function () {
  const chatFab   = document.getElementById('chat-fab');
  const chatPanel = document.getElementById('chat-panel');
  const chatClose = document.getElementById('chat-panel-close');
  const openIcon  = chatFab.querySelector('.open-icon');
  const closeIcon = chatFab.querySelector('.close-icon');

  function openChat() {
    chatPanel.classList.add('open');
    chatPanel.setAttribute('aria-hidden', 'false');
    openIcon.style.display  = 'none';
    closeIcon.style.display = 'flex';
    chatFab.querySelector('.chat-fab-pulse').style.animation = 'none';
  }

  function closeChat() {
    chatPanel.classList.remove('open');
    chatPanel.setAttribute('aria-hidden', 'true');
    openIcon.style.display  = 'flex';
    closeIcon.style.display = 'none';
    chatFab.querySelector('.chat-fab-pulse').style.animation = '';
  }

  chatFab.addEventListener('click', () => {
    chatPanel.classList.contains('open') ? closeChat() : openChat();
  });

  chatClose.addEventListener('click', closeChat);

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && chatPanel.classList.contains('open')) closeChat();
  });
}());

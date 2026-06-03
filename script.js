'use strict';
let currentPage = 'home';
let carFocusIdx = 0;
let cartItems   = [];

function navigateTo(pageId) {
  if (pageId === currentPage) return;
  const curtain = document.getElementById('curtain');
  curtain.className = 'in';

  setTimeout(() => {
    document.querySelector('.page.active').classList.remove('active');
    document.getElementById('page-' + pageId).classList.add('active');
    currentPage = pageId;
    window.scrollTo({ top: 0 });

    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === pageId);
    });

    curtain.className = 'out';
    setTimeout(() => curtain.className = '', 320);

    if (pageId === 'home')    initHome();
    if (pageId === 'catalog') initCatalog();
    if (pageId === 'parts')   initParts();
  }, 300);
}

document.addEventListener('click', function(e) {
  const el = e.target.closest('[data-page]');
  if (el) { e.preventDefault(); navigateTo(el.dataset.page); }
});

function initHome() {
  animateCounters();
  revealCards('.cat-card');
}

function animateCounters() {
  document.querySelectorAll('.stat-n').forEach(el => {
    const target = parseInt(el.dataset.to);
    let cur = 0;
    const step = Math.ceil(target / 50);
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur.toLocaleString('ru');
      if (cur >= target) clearInterval(t);
    }, 20);
  });
}

function revealCards(selector) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    setTimeout(() => {
      el.style.transition = 'opacity .4s, transform .4s';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, i * 70);
  });
}

function initCatalog() {
  revealCards('.card');
  carFocusIdx = 0;
  updateCarFocus();
  bindCarFilters();
}

function bindCarFilters() {
  document.querySelectorAll('#car-filters .filter').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#car-filters .filter').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const f = this.dataset.f;

      document.querySelectorAll('#cars-grid .card').forEach((card, i) => {
        const tags = card.dataset.tag || '';
        const show = f === 'all' || tags.includes(f);
        card.classList.toggle('hidden', !show);
        if (show) {
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity .35s';
            card.style.opacity = '1';
          }, i * 50);
        }
      });

      carFocusIdx = 0;
      updateCarFocus();
    });
  });
}

function getVisibleCards() {
  return Array.from(document.querySelectorAll('#cars-grid .card:not(.hidden)'));
}

function updateCarFocus(idx) {
  if (idx !== undefined) carFocusIdx = idx;
  getVisibleCards().forEach((c, i) => c.classList.toggle('focused', i === carFocusIdx));
}

function initParts() {
  revealCards('.part-card');
  bindPartsFilters();
  updateCartBar();
}

function bindPartsFilters() {
  document.querySelectorAll('#parts-filters .filter').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#parts-filters .filter').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filterParts();
    });
  });

  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', function() {
      const name = this.dataset.name;
      cartItems.push(name);
      updateCartBar();

      this.textContent = '✓ Добавлено';
      this.classList.add('added');
      const b = this;
      setTimeout(() => {
        b.textContent = 'В корзину';
        b.classList.remove('added');
      }, 1800);

      showToast(name + ' добавлен в корзину');
    });
  });

  document.getElementById('cart-clear').addEventListener('click', () => {
    cartItems = [];
    updateCartBar();
    showToast('Корзина очищена');
  });
}

function filterParts() {
  const f = document.querySelector('#parts-filters .filter.active').dataset.f;
  const q = (document.getElementById('parts-search').value || '').toLowerCase();

  document.querySelectorAll('.part-card').forEach(card => {
    const matchCat  = f === 'all' || card.dataset.cat === f;
    const matchText = !q || card.dataset.name.includes(q) ||
                      card.querySelector('.part-name').textContent.toLowerCase().includes(q);
    card.classList.toggle('hidden', !(matchCat && matchText));
  });
}

function updateCartBar() {
  const bar = document.getElementById('cart-bar');
  document.getElementById('cart-label').textContent = 'Корзина: ' + cartItems.length + ' товар' + endingRu(cartItems.length);
  bar.classList.toggle('show', cartItems.length > 0);
}

function endingRu(n) {
  if (n % 10 === 1 && n % 100 !== 11) return '';
  if (n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)) return 'а';
  return 'ов';
}

document.addEventListener('mousemove', function(e) {
  if (currentPage !== 'home') return;
  const img = document.getElementById('hero-img');
  if (!img) return;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  img.style.transform = `translate(${dx * -10}px, ${dy * 5}px)`;
});

document.addEventListener('mousedown', function(e) {
  const btn = e.target.closest('.btn-red, .btn-cart, .btn-sm, .filter');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const span = document.createElement('span');
  Object.assign(span.style, {
    position: 'absolute',
    left: (e.clientX - rect.left - size / 2) + 'px',
    top:  (e.clientY - rect.top  - size / 2) + 'px',
    width: size + 'px', height: size + 'px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    transform: 'scale(0)',
    animation: 'ripple .45s ease forwards',
    pointerEvents: 'none',
  });
  if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(span);
  setTimeout(() => span.remove(), 460);
});

document.addEventListener('keydown', function(e) {
  if (e.key === '1') navigateTo('home');
  if (e.key === '2') navigateTo('catalog');
  if (e.key === '3') navigateTo('parts');

  if (currentPage === 'catalog') {
    const cards = getVisibleCards();
    if (!cards.length) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      carFocusIdx = (carFocusIdx + 1) % cards.length;
      updateCarFocus();
      cards[carFocusIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      carFocusIdx = (carFocusIdx - 1 + cards.length) % cards.length;
      updateCarFocus();
      cards[carFocusIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (e.key === 'Enter') {
      const card = cards[carFocusIdx];
      if (card) {
        const name = card.querySelector('.card-name').textContent;
        const mark = card.querySelector('.card-mark').textContent;
        showToast(mark + ' ' + name + ' — заявка отправлена');
        card.style.transition = 'box-shadow .1s';
        card.style.boxShadow = '0 0 0 1px var(--red)';
        setTimeout(() => card.style.boxShadow = '', 600);
      }
    }
  }

  if (currentPage === 'parts') {
    const search = document.getElementById('parts-search');
    if (e.key === 'Escape') {
      search.value = '';
      filterParts();
      showToast('Поиск сброшен');
    }
    if (e.key !== 'Escape' && !['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Tab'].includes(e.key)) {
      if (document.activeElement !== search) {
        search.focus();
      }
    }
  }
});

document.getElementById('parts-search').addEventListener('input', filterParts);

function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();

  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', bottom: '28px', left: '50%',
    transform: 'translateX(-50%) translateY(12px)',
    background: '#222', color: '#e8e8e8',
    border: '1px solid rgba(255,255,255,.1)',
    padding: '12px 24px', fontSize: '.78rem',
    letterSpacing: '1px', zIndex: '9999',
    opacity: '0', transition: 'opacity .25s, transform .25s',
    whiteSpace: 'nowrap', fontFamily: "'Inter',sans-serif",
    borderLeft: '2px solid #c0392b',
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
  }));
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(8px)';
    setTimeout(() => t.remove(), 280);
  }, 2800);
}

window.addEventListener('scroll', function() {
  document.getElementById('header').style.borderBottomColor =
    window.scrollY > 40 ? 'rgba(192,57,43,.3)' : 'rgba(255,255,255,.08)';
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => initHome());

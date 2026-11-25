// VECTOR Basket · aisle list — zero dependencies.
// <section class="ab" data-assets="assets/"></section> becomes the whole app: home and the "Saturday shop" list.
// "By aisle" shows three aisle headers, then the rows leave the list one by one, top to bottom,
// and land under their aisle (FLIP); the store plan lights the aisle each time a row lands.
;(() => {
  'use strict';

  const svg = (d, o = {}) => `<svg width="${o.s || 18}" height="${o.s || 18}" viewBox="0 0 24 24" fill="none" stroke="${o.c || 'currentColor'}" stroke-width="${o.w || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const P = {
    home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
    lists: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
    recipes: '<path d="M5 4h11l3 3v13H5z"/><path d="M9 10h7M9 14h7"/>',
    pantry: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 10h16M9 6.5h2M9 14h2"/>',
    stores: '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M10 20v-6h4v6"/>',
    deals: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    history: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    household: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 0 1 0 6M18 14c2 .8 3 2.8 3 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
    sort: '<path d="M4 5h6M4 12h10M4 19h16"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    taco: '<path d="M3 15a9 9 0 0 1 18 0zM3 15h18M8 11v1M12 9v1M16 11v1"/>',
    pill: '<rect x="4" y="9" width="16" height="10" rx="5"/><path d="M12 9v10M9 5h6"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7"/>',
    cup: '<path d="M6 8h12l-1.5 12h-9zM5 8h14M9 4h6l1 4H8z"/>',
    bun: '<path d="M4 14c0-4 3.6-7 8-7s8 3 8 7zM4 14h16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
  };
  const NAV = [['home', 'Home'], ['lists', 'Lists'], ['recipes', 'Recipes'], ['pantry', 'Pantry'], ['stores', 'Stores'], ['deals', 'Deals'], ['history', 'History'], ['household', 'Household']];
  const DEPTS = [
    { name: 'Produce', tag: 'Produce', aisle: 1, tint: '#9CCB7E', bg: '#17221A' },
    { name: 'Bakery', tag: 'Bakery', aisle: 4, tint: '#E3BC74', bg: '#251F14' },
    { name: 'Dairy & eggs', tag: 'Dairy', aisle: 7, tint: '#93BDEB', bg: '#141D29' },
  ];
  // the order they were added; d — department
  const ITEMS = [
    { name: 'Whole milk', sub: '1 L · glass bottle', d: 2, img: 'milk', price: '$1.89', by: 'teo' },
    { name: 'Vine tomatoes', sub: '500 g', d: 0, img: 'tomatoes', price: '$3.40', by: 'nora' },
    { name: 'Sourdough loaf', sub: '800 g · sliced', d: 1, img: 'sourdough', price: '$5.20', by: 'nora' },
    { name: 'Basil', sub: '1 bunch · for the pasta', d: 0, glyph: 'leaf', price: '$1.60', by: 'mila' },
    { name: 'Free-range eggs', sub: '10 pcs', d: 2, img: 'eggs', price: '$4.10', by: 'teo' },
    { name: 'Avocados', sub: '3 pcs · ripe', d: 0, img: 'avocados', price: '$4.50', by: 'nora' },
    { name: 'Greek yogurt', sub: '500 g · plain', d: 2, glyph: 'cup', price: '$2.95', by: 'mila' },
    { name: 'Burger buns', sub: '6 pcs', d: 1, glyph: 'bun', price: '$2.80', by: 'teo' },
  ];
  const ROW = 50, HEAD = 36, GAP = 8;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.65,0,.35,1)', OUT = 'cubic-bezier(.16,1,.3,1)';

  // k = null: the order they were added. k = 0..8: items[0..k) sit under their aisle, items[k..] wait below.
  function layout(k) {
    if (k === null) return { rows: ITEMS.map((_, i) => i * ROW), heads: [0, 0, 0], counts: [0, 0, 0] };
    const rows = [], heads = [], counts = [0, 0, 0];
    let y = 0;
    DEPTS.forEach((_, d) => {
      heads.push(y); y += HEAD;
      ITEMS.forEach((it, i) => { if (i < k && it.d === d) { rows[i] = y; y += ROW; counts[d]++; } });
      y += GAP;
    });
    ITEMS.forEach((_, i) => { if (i >= k) { rows[i] = y; y += ROW; } });
    return { rows, heads, counts };
  }

  class AisleApp {
    constructor(root) {
      this.root = root;
      const A = root.dataset.assets || 'assets/';
      const img = (n, cls = 'ab-ph', alt = '') => `<img class="${cls}" src="${A}${n}.jpg" alt="${alt}">`;
      const av = (n, alt = '') => img(n, 'ab-av', alt);
      const faces = `<span class="ab-faces">${av('nora')}${av('teo')}${av('mila')}</span>`;
      const store = (sub, body) => `
        <section class="ab-card ab-store">${img('store', 'ab-ph', 'Fresh produce aisle at Fernhill Market')}
          <div><div class="ab-sec-h"><h2>Fernhill Market</h2><span class="ab-mint" style="font-size:12.5px">Open · until 22:00</span></div>
          <div class="ab-small">${sub}</div>${body}</div>
        </section>`;
      const who = `
        <section class="ab-card ab-box">
          <div class="ab-sec-h"><h2>Who is shopping</h2><span class="ab-muted" style="font-size:12.5px">Sat 10:00</span></div>
          <div class="ab-person">${av('nora')}<div>Nora · added 3 items</div><span class="ab-mint">Going</span></div>
          <div class="ab-person">${av('teo')}<div>Teo · added 3 items</div><span class="ab-mint">Going</span></div>
          <div class="ab-person">${av('mila')}<div>Mila · added 2 items</div><span>At home</span></div>
        </section>`;
      const busy = [30, 22, 26, 48, 70, 88, 76, 60, 80, 54, 34];
      root.innerHTML = `
<nav class="ab-side" aria-label="Main">
  <div class="ab-logo"><svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 9h18l-2 12H6z" fill="none" stroke="#4CC9A6" stroke-width="2" stroke-linejoin="round"/><path d="M9 9l4-6 4 6" fill="none" stroke="#EDEAE3" stroke-width="2" stroke-linejoin="round"/></svg><b>VECTOR</b><span>Basket</span></div>
  ${NAV.map(([k, t]) => `<a class="ab-nav" href="#" data-nav="${k}">${svg(P[k])}${t}${k === 'lists' ? '<span class="ab-count">3</span>' : ''}</a>`).join('')}
  <div class="ab-side-foot">
    <div class="ab-budget"><div style="font-size:12.5px" class="ab-muted">November groceries</div><div class="ab-num" style="font-size:14px;font-weight:600;margin-top:2px">$412 of $520</div><div class="ab-bar"><span style="width:79%"></span></div></div>
    <div class="ab-me">${av('nora')}<div><div style="font-size:13.5px;font-weight:600">Nora Lind</div><div style="font-size:12px" class="ab-muted">Lind household</div></div></div>
  </div>
</nav>
<div class="ab-col">
  <header class="ab-top">
    <label class="ab-search">${svg(P.search, { s: 16, w: 2 })}<span class="ab-sr">Search</span><input type="search" placeholder="Search items, recipes, stores"></label>
    <div class="ab-top-r">
      <button class="ab-ghost" type="button">${svg(P.plus, { s: 16, w: 2 })}New list</button>
      <button class="ab-ib" type="button" aria-label="Notifications">${svg(P.bell, { s: 19 })}<i></i></button>
      ${av('nora', 'Nora Lind')}
    </div>
  </header>
  <div class="ab-views">
    <div class="ab-view ab-home" data-view="home">
      <main class="ab-home-main">
        <div><h1 class="ab-h1">Good morning, Nora</h1><p class="ab-sub">Saturday · 3 lists to shop · Fernhill Market opens at 8:00</p></div>
        <section aria-label="Your lists">
          <div class="ab-sec-h m"><h2>Your lists</h2><a class="ab-link" href="#">All lists</a></div>
          <div class="ab-lists">
            <a class="ab-card ab-list-card" href="#" data-open aria-label="Open Saturday shop">
              <div class="ab-shots">${img('tomatoes')}${img('avocados')}${img('sourdough')}${img('eggs')}<span class="ab-num">+4</span></div>
              <div class="ab-sec-h" style="align-items:center"><div><div style="font-size:16px;font-weight:600">Saturday shop</div><div class="ab-num ab-small">8 items · about $26.44 · Fernhill, Sat 10:00</div></div>${faces}</div>
              <div class="ab-chips">${DEPTS.map((d, i) => `<span class="ab-chip" style="background:${d.bg};color:${d.tint}">${d.tag} ${layout(8).counts[i]}</span>`).join('')}<span style="margin-left:auto">Teo added milk · 2 h</span></div>
            </a>
            <div style="flex:1;display:flex;flex-direction:column;gap:16px">
              <a class="ab-card ab-mini" href="#"><span style="background:#251F14;color:#E3BC74">${svg(P.taco, { s: 22 })}</span><span style="flex:1"><span class="ab-t">Taco night</span><span class="ab-m">5 items · Friday · Teo</span></span>${av('teo')}</a>
              <a class="ab-card ab-mini" href="#"><span style="background:#1F1A26;color:#C9A3E6">${svg(P.pill, { s: 22 })}</span><span style="flex:1"><span class="ab-t">Pharmacy run</span><span class="ab-m">3 items · next week · Nora</span></span>${av('nora')}</a>
            </div>
          </div>
        </section>
        <section aria-label="Deals">
          <div class="ab-sec-h m"><h2>Deals at Fernhill this week</h2><a class="ab-link" href="#">See 24 deals</a></div>
          <div class="ab-deals">
            <div class="ab-card ab-deal">${img('avocados')}<span><span class="ab-t">Avocados</span><span class="ab-m ab-num">$1.50 each · <span class="ab-mint">−20%</span></span><em>On your list</em></span></div>
            <div class="ab-card ab-deal">${img('sourdough')}<span><span class="ab-t">Sourdough</span><span class="ab-m ab-num">2 for $9.00</span><em>On your list</em></span></div>
            <div class="ab-card ab-deal">${img('milk')}<span><span class="ab-t">Farm milk</span><span class="ab-m ab-num">$1.89 · glass bottle</span><em>On your list</em></span></div>
          </div>
        </section>
        <section class="ab-card ab-trips ab-num" aria-label="Recent trips">
          <div class="ab-trip"><h2>Recent trips</h2><span style="flex:none;width:auto;font-size:12.5px">November</span></div>
          <div class="ab-trip"><span>Sat, Nov 16</span><span>Fernhill Market</span><span>14 items</span><span>$48.20</span></div>
          <div class="ab-trip"><span>Wed, Nov 13</span><span>Corner Bakery, Rye St</span><span>3 items</span><span>$11.40</span></div>
          <div class="ab-trip"><span>Sat, Nov 9</span><span>Fernhill Market</span><span>19 items</span><span>$63.75</span></div>
          <div class="ab-trip"><span>Sat, Nov 2</span><span>Fernhill Market</span><span>11 items</span><span>$37.10</span></div>
        </section>
      </main>
      <aside class="ab-aside" aria-label="Store and household">
        ${store('Elm St 14 · 0.6 km · your usual store', `
          <div style="font-size:12.5px;color:var(--ab-text-2);margin-top:14px">Least busy today: 10–11 am</div>
          <div class="ab-busy">${busy.map((h, i) => `<span class="${i === 1 || i === 2 ? 'on' : ''}" style="height:${h}%"></span>`).join('')}</div>
          <div class="ab-route" style="margin-top:6px;font-size:11.5px;color:var(--ab-faint)"><span>8 am</span><span>1 pm</span><span>6 pm</span></div>`)}
        <section class="ab-card ab-box">
          <div class="ab-sec-h"><h2>Household</h2><span class="ab-muted" style="font-size:12.5px">3 people</span></div>
          <div class="ab-person">${av('teo')}<div>Teo added Whole milk</div><span>2 h</span></div>
          <div class="ab-person">${av('mila')}<div>Mila added Basil</div><span>5 h</span></div>
          <div class="ab-person">${av('nora')}<div>You shared Saturday shop</div><span>1 d</span></div>
        </section>
        <section class="ab-card ab-box ab-low">
          <div class="ab-sec-h"><h2>Running low</h2><a class="ab-link" href="#" style="font-size:12.5px">Add all</a></div>
          ${[['Olive oil', 15], ['Basmati rice', 30], ['Coffee beans', 20]].map(([t, p]) => `<div><div class="ab-low-row"><span>${t}</span><span class="ab-num ab-muted">${p}%</span></div><div class="ab-bar"><span style="width:${p}%"></span></div></div>`).join('')}
        </section>
      </aside>
    </div>

    <div class="ab-view ab-list" data-view="list">
      <main class="ab-list-main">
        <div class="ab-crumbs"><a href="#" data-back>Lists</a><i>/</i><b>Saturday shop</b></div>
        <div class="ab-head">
          <div><h1 class="ab-h1">Saturday shop</h1><div class="ab-shared">${faces}<span>Shared with Teo and Mila · Fernhill Market, Elm St · Sat 10:00</span></div></div>
          <div style="display:flex;gap:8px"><button class="ab-pr" type="button">${svg(P.share, { s: 15, w: 2 })}Share</button><button class="ab-pr go" type="button">Start shopping</button></div>
        </div>
        <section class="ab-card ab-sheet" aria-label="Saturday shop items">
          <div class="ab-sheet-h">
            <div class="ab-status" role="status"><span class="ab-tick">${svg(P.check, { s: 13, w: 3, c: '#06140F' })}</span><b class="ab-num" data-count></b><span class="ab-muted" data-count-sub></span></div>
            <div class="ab-segs" role="group" aria-label="Order">
              <button class="ab-seg" type="button" data-mode="added" aria-pressed="true">As added</button>
              <button class="ab-seg" type="button" data-mode="aisle" aria-pressed="false">${svg(P.sort, { s: 15, w: 2 })}By aisle</button>
            </div>
          </div>
          <div class="ab-rows">
            ${DEPTS.map((d, i) => `<div class="ab-gh" data-head="${i}"><i style="background:${d.tint}"></i><b>${d.name}</b><span class="ab-muted">Aisle ${d.aisle}</span><hr><span class="ab-num ab-muted">${layout(8).counts[i]} items</span></div>`).join('')}
            ${ITEMS.map(it => { const d = DEPTS[it.d]; return `
            <div class="ab-row" data-row>
              <span class="ab-chk"></span>
              ${it.img ? img(it.img) : `<span class="ab-glyph" style="background:${d.bg};color:${d.tint}">${svg(P[it.glyph], { s: 20 })}</span>`}
              <span class="ab-name"><b>${it.name}</b><small>${it.sub}</small></span>
              <span class="ab-tag" style="background:${d.bg};color:${d.tint}"><i></i>${d.tag} · ${d.aisle}</span>
              <span class="ab-price ab-num">${it.price}</span>
              ${av(it.by)}
            </div>`; }).join('')}
          </div>
          <div class="ab-addline">${svg(P.plus, { s: 16, w: 2 })}Add an item, or paste a recipe</div>
          <div class="ab-often">Often bought with this list<div>${['Lemons', 'Parmesan', 'Olive oil', 'Coffee beans'].map(t => `<button class="ab-pr" type="button">+ ${t}</button>`).join('')}</div></div>
        </section>
      </main>
      <aside class="ab-aside" aria-label="Store and trip">
        ${store('Elm St 14 · 0.6 km · 9 aisles', `
          <div class="ab-plan" aria-label="Store plan">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<div class="ab-aisle" data-aisle="${n}"><b class="ab-num"></b><span class="ab-num">${n}</span></div>`).join('')}</div>
          <div class="ab-route"><span>Entrance</span><span data-route></span></div>`)}
        ${who}
        <section class="ab-card ab-sum ab-num">
          <div><span class="ab-muted">Estimated total</span><b>$26.44</b></div>
          <div><span class="ab-muted">Deals applied</span><span class="ab-mint">Avocados −20%</span></div>
          <div><span class="ab-muted">Bag</span><span>Bring your own · 2 bags</span></div>
        </section>
        <section class="ab-card ab-recipe">${img('tomatoes')}<span><span class="ab-t">Tomato basil pasta</span><span class="ab-m">Sunday dinner · 3 items from this list</span><em>Recipe by Mila</em></span></section>
      </aside>
    </div>
  </div>
</div>`;
      this.views = [...root.querySelectorAll('.ab-view')];
      this.navs = [...root.querySelectorAll('.ab-nav')];
      this.rows = [...root.querySelectorAll('[data-row]')];
      this.heads = [...root.querySelectorAll('[data-head]')];
      this.segs = [...root.querySelectorAll('.ab-seg')];
      this.cells = DEPTS.map(d => root.querySelector(`[data-aisle="${d.aisle}"]`));
      this.count = root.querySelector('[data-count]');
      this.countSub = root.querySelector('[data-count-sub]');
      this.route = root.querySelector('[data-route]');
      this.timers = new Set();
      const on = (sel, fn) => root.querySelector(sel).addEventListener('click', e => { e.preventDefault(); fn(); });
      on('[data-open]', () => this.go('list'));
      on('[data-back]', () => this.go('home'));
      on('[data-nav="home"]', () => this.go('home'));
      on('[data-nav="lists"]', () => this.go('list'));
      on('[data-mode="aisle"]', () => this.sortByAisle());
      on('[data-mode="added"]', () => this.showAdded());
      this.reset();
    }

    go(view, quiet = false) {
      if (quiet) this.root.classList.add('is-instant');
      this.root.dataset.view = view;
      this.views.forEach(v => v.classList.toggle('is-on', v.dataset.view === view));
      this.navs.forEach(n => n.classList.toggle('is-on', n.dataset.nav === (view === 'list' ? 'lists' : 'home')));
      if (quiet) requestAnimationFrame(() => requestAnimationFrame(() => this.root.classList.remove('is-instant')));
    }

    later(fn, ms) { const id = setTimeout(() => { this.timers.delete(id); fn(); }, ms); this.timers.add(id); }

    stop() {
      this.timers.forEach(clearTimeout); this.timers.clear();
      this.root.querySelectorAll('.ab-row, .ab-gh, .ab-aisle b').forEach(el => el.getAnimations().forEach(a => a.cancel()));
      this.rows.forEach(r => r.classList.remove('is-lift'));
    }

    // FLIP every row and header to layout k. The flying row lifts off the list (shadow, slight shift right)
    // and travels on top; the rows it passes slide the other way, dimmed so they read as background.
    place(k, ms, flying = -1) {
      const L = layout(k);
      this.rows.forEach((el, i) => {
        const y0 = this.y[i], y1 = L.rows[i];
        this.y[i] = y1;
        el.style.transform = `translateY(${y1}px)`;
        if (!ms) return;
        if (i === flying) {
          const dy = y1 - y0;
          el.classList.add('is-lift');
          el.animate([
            { transform: `translate(0,${y0}px)`, easing: OUT },
            { transform: `translate(14px,${y0 + dy * .1}px) scale(1.02)`, offset: .22, easing: EASE },
            { transform: `translate(14px,${y1 - dy * .04}px) scale(1.02)`, offset: .78, easing: OUT },
            { transform: `translate(0,${y1}px)` },
          ], { duration: ms });
          this.later(() => el.classList.remove('is-lift'), ms * .86);
        } else if (y0 !== y1) {
          const dim = flying >= 0 ? .35 : 1;
          el.animate([{ transform: `translateY(${y0}px)`, opacity: 1 }, { opacity: dim, offset: .5 }, { transform: `translateY(${y1}px)`, opacity: 1 }], { duration: ms, easing: EASE });
        }
      });
      const show = k !== null;
      this.heads.forEach((el, j) => {
        const y0 = this.hy[j], y1 = L.heads[j], was = el.style.opacity === '1';
        this.hy[j] = y1;
        el.style.transform = `translateY(${y1}px)`;
        el.style.opacity = show ? 1 : 0;
        if (!ms) return;
        // a header fades in only once the rows have slid out from under it
        if (show && !was) el.animate([{ transform: `translateY(${y1 - 10}px)`, opacity: 0 }, { transform: `translateY(${y1}px)`, opacity: 1 }], { duration: ms * .8, easing: OUT, delay: ms * .45 + j * 60, fill: 'backwards' });
        else if (y0 !== y1 || show !== was) el.animate([{ transform: `translateY(${y0}px)`, opacity: was ? 1 : 0 }, { opacity: flying >= 0 ? .35 : (was && show ? 1 : .5), offset: .5 }, { transform: `translateY(${y1}px)`, opacity: show ? 1 : 0 }], { duration: ms, easing: EASE });
      });
    }

    // the store plan: the aisle shows how many items wait there
    setAisle(d, n, pop) {
      const cell = this.cells[d], b = cell.firstElementChild, t = DEPTS[d].tint;
      cell.classList.toggle('is-hit', n > 0);
      b.textContent = n || '';
      b.style.background = n ? t : '';
      b.style.borderColor = n ? t : '';
      if (pop && !REDUCED) b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }], { duration: 320, easing: OUT });
    }

    setStatus(placed, done) {
      this.root.dataset.done = done;
      this.count.textContent = placed === null ? '8 items' : `${placed} of 8 items in place`;
      this.countSub.textContent = placed === null ? 'in the order they were added' : done ? '3 aisles · route 1 → 4 → 7' : 'sorting by aisle…';
      this.route.textContent = done ? 'Aisles 1 → 4 → 7 · about 12 min' : 'Checkout';
    }

    setMode(mode) {
      this.root.dataset.mode = mode;
      this.segs.forEach(s => s.setAttribute('aria-pressed', s.dataset.mode === mode));
    }

    // one click sorts the whole list: headers first, then each row in the order it was added
    sortByAisle() {
      if (this.root.dataset.mode === 'aisle') return;
      this.stop();
      this.setMode('aisle');
      this.setStatus(0, false);
      if (REDUCED) { this.place(ITEMS.length, 0); return this.land(ITEMS.length); }
      this.place(0, 380);
      let t = 640;
      ITEMS.forEach((_, i) => {
        const dist = Math.abs(layout(i).rows[i] - layout(i + 1).rows[i]);
        const ms = Math.round(230 + Math.min(dist, 240) * .35);
        this.later(() => this.place(i + 1, ms, i), t);
        this.later(() => this.land(i + 1, true), t + ms * .8);
        t += ms;                              // the next row lifts as this one lands
      });
    }

    // k rows are in place: the counter, the aisle counts on the plan and, at 8 of 8, the route
    land(k, pop = false) {
      const counts = layout(k).counts;
      DEPTS.forEach((d, j) => this.setAisle(j, counts[j], pop && ITEMS[k - 1].d === j));
      this.setStatus(k, k === ITEMS.length);
    }

    showAdded(ms = 380) {
      this.stop();
      this.setMode('added');
      this.setStatus(null, false);
      DEPTS.forEach((_, j) => this.setAisle(j, 0));
      this.place(null, REDUCED ? 0 : ms);
    }

    reset() {
      this.stop();
      this.y = this.y || ITEMS.map(() => 0);
      this.hy = this.hy || [0, 0, 0];
      this.showAdded(0);
      this.go('home', true);
    }
  }

  document.querySelectorAll('.ab').forEach(el => { el.aisleApp = new AisleApp(el); });
})();

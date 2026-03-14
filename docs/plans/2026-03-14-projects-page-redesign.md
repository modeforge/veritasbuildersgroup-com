# Projects Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign `projects.html` to feature a smart hero image slider, job-type filter pills, grouped multi-photo projects in the lightbox, and engagement-based slide ordering via localStorage.

**Architecture:** All logic is vanilla JS inside the single `projects.html` file — no build step, no libraries. Project data moves from hardcoded HTML to a JS `PROJECTS` array; cards are generated from that data. The hero slider reads a scored ordering of projects computed on page load from localStorage click counts + recency + randomness. The lightbox is extended to support multiple before/after photo pairs per project with prev/next navigation.

**Tech Stack:** Vanilla HTML/CSS/JS, localStorage for click tracking, no dependencies.

---

## Groupings (from Haiku image analysis)

| Project ID | Display Name | Type | Location | Photos |
|---|---|---|---|---|
| `kitchen-monticello` | Kitchen Remodel | Kitchen Remodel | Monticello, FL | [{before: kitchen-before, after: kitchen-after}] |
| `kitchen-jc` | Kitchen Remodel | Kitchen Remodel | Jefferson County, FL | [{before: jc-kitchen-before, after: jc-kitchen-after}] |
| `kitchen-mc` | Kitchen Remodel | Kitchen Remodel | Madison County, FL | [{before: mc-kitchen-before, after: mc-kitchen-after}] |
| `bath-tallahassee` | Bathroom Remodel | Bathroom Remodel | Tallahassee, FL | [{before: lc-bath1-before, after: lc-bath1-after}, {before: lc-bath2-before, after: lc-bath2-after}] |
| `bath-jc` | Bathroom Remodel | Bathroom Remodel | Jefferson County, FL | [{before: jc-bath-before, after: jc-bath-after}] |
| `porch-jc` | Porch Rebuild | Deck & Porch | Jefferson County, FL | [{before: jc-porch-before, after: jc-porch-after}, {before: jc-porch2-before, after: jc-porch2-after}] |
| `deck-tallahassee` | Deck Replacement | Deck & Porch | Tallahassee, FL | [{before: lc-deck-before, after: lc-deck-after}] |
| `deck-jc` | New Deck & Entry | Deck & Porch | Jefferson County, FL | [{after: jc-deck}] (no before) |

---

## Task 1: Define PROJECTS data array + replace hardcoded card HTML

**Files:**
- Modify: `projects.html` — JS `<script>` block and the `.projects-grid` HTML

**Step 1: Replace the hardcoded `.projects-grid` contents with an empty div**

In the HTML, change:
```html
<div class="projects-grid">
  <!-- all those hardcoded project-card divs -->
</div>
```
to:
```html
<div class="projects-grid" id="projectsGrid"></div>
```

**Step 2: Add the PROJECTS array at the top of the `<script>` block**

```js
const PROJECTS = [
  {
    id: 'kitchen-monticello',
    type: 'Kitchen Remodel',
    location: 'Monticello, FL',
    addedDate: '2026-03-12',
    photos: [
      { before: '/public/images/kitchen-before.jpg', after: '/public/images/kitchen-after.jpg' }
    ]
  },
  {
    id: 'kitchen-jc',
    type: 'Kitchen Remodel',
    location: 'Jefferson County, FL',
    addedDate: '2026-03-13',
    photos: [
      { before: '/public/images/jc-kitchen-before.jpg', after: '/public/images/jc-kitchen-after.jpg' }
    ]
  },
  {
    id: 'kitchen-mc',
    type: 'Kitchen Remodel',
    location: 'Madison County, FL',
    addedDate: '2026-03-13',
    photos: [
      { before: '/public/images/mc-kitchen-before.jpg', after: '/public/images/mc-kitchen-after.jpg' }
    ]
  },
  {
    id: 'bath-tallahassee',
    type: 'Bathroom Remodel',
    location: 'Tallahassee, FL',
    addedDate: '2026-03-13',
    photos: [
      { before: '/public/images/lc-bath1-before.jpg', after: '/public/images/lc-bath1-after.jpg' },
      { before: '/public/images/lc-bath2-before.jpg', after: '/public/images/lc-bath2-after.jpg' }
    ]
  },
  {
    id: 'bath-jc',
    type: 'Bathroom Remodel',
    location: 'Jefferson County, FL',
    addedDate: '2026-03-13',
    photos: [
      { before: '/public/images/jc-bath-before.jpg', after: '/public/images/jc-bath-after.jpg' }
    ]
  },
  {
    id: 'porch-jc',
    type: 'Deck & Porch',
    location: 'Jefferson County, FL',
    addedDate: '2026-03-13',
    photos: [
      { before: '/public/images/jc-porch-before.jpg', after: '/public/images/jc-porch-after.jpg' },
      { before: '/public/images/jc-porch2-before.jpg', after: '/public/images/jc-porch2-after.jpg' }
    ]
  },
  {
    id: 'deck-tallahassee',
    type: 'Deck & Porch',
    location: 'Tallahassee, FL',
    addedDate: '2026-03-13',
    photos: [
      { before: '/public/images/lc-deck-before.jpg', after: '/public/images/lc-deck-after.jpg' }
    ]
  },
  {
    id: 'deck-jc',
    type: 'Deck & Porch',
    location: 'Jefferson County, FL',
    addedDate: '2026-03-13',
    photos: [
      { after: '/public/images/jc-deck.jpg' }
    ]
  }
];
```

**Step 3: Add card rendering function**

```js
function renderCards(filter = 'All') {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  PROJECTS.forEach(p => {
    if (filter !== 'All' && p.type !== filter) return;
    const thumb = p.photos[0].after;
    const hasMultiple = p.photos.length > 1;
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = p.id;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${p.type}, ${p.location} — click to view`);
    card.innerHTML = `
      <img src="${thumb}" alt="${p.type} — ${p.location}" />
      ${hasMultiple ? `<div class="card-photo-count">${p.photos.length} photos</div>` : ''}
      <div class="card-overlay">
        <p class="card-type">${p.type}</p>
        <p class="card-location">${p.location}</p>
      </div>`;
    card.addEventListener('click', () => openLightbox(p.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(p.id); }
    });
    grid.appendChild(card);
  });
}
```

**Step 4: Call `renderCards()` on DOMContentLoaded**

```js
document.addEventListener('DOMContentLoaded', () => {
  renderCards();
  // ... other init calls
});
```

**Step 5: Add CSS for the photo-count badge**

```css
.card-photo-count {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(26,26,26,0.82);
  color: var(--white);
  font-family: 'Oswald', sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 0.3rem 0.6rem;
  z-index: 2;
}
```

**Step 6: Verify in browser**

Open `projects.html` in browser. Should see 8 cards rendered from JS data, identical appearance to before. Multi-photo cards (bath-tallahassee, porch-jc) should show "2 photos" badge.

**Step 7: Commit**

```bash
git add projects.html
git commit -m "refactor: render project cards from JS data array"
```

---

## Task 2: Filter pills

**Files:**
- Modify: `projects.html` — add filter pill HTML above grid, CSS, and JS filter logic

**Step 1: Add filter HTML between `.page-header` and `.projects-section`**

```html
<div class="filter-bar">
  <button class="filter-pill active" data-filter="All">All</button>
  <button class="filter-pill" data-filter="Kitchen Remodel">Kitchen</button>
  <button class="filter-pill" data-filter="Bathroom Remodel">Bathroom</button>
  <button class="filter-pill" data-filter="Deck & Porch">Deck & Porch</button>
</div>
```

**Step 2: Add CSS**

```css
.filter-bar {
  background: var(--gray-100);
  padding: 2rem 5rem 0;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-pill {
  font-family: 'Oswald', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0.5rem 1.25rem;
  border: 1.5px solid var(--gray-600);
  background: none;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-pill:hover {
  border-color: var(--red);
  color: var(--red);
}

.filter-pill.active {
  background: var(--red);
  border-color: var(--red);
  color: var(--white);
}
```

**Step 3: Add filter JS**

```js
document.querySelectorAll('.filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCards(btn.dataset.filter);
    // Re-wire lightbox after re-render happens inside renderCards
  });
});
```

**Step 4: Verify in browser**

Click each filter pill. Grid should update. "All" shows 8 cards. "Kitchen" shows 3. "Bathroom" shows 2. "Deck & Porch" shows 3. Active pill should be red-filled.

**Step 5: Commit**

```bash
git add projects.html
git commit -m "feat: add job-type filter pills to projects grid"
```

---

## Task 3: Multi-photo lightbox (prev/next between pairs)

**Files:**
- Modify: `projects.html` — lightbox HTML, CSS, and `openLightbox` JS

**Step 1: Update `openLightbox` to accept a project ID and track photo index**

Replace the existing `openLightbox(card)` function signature and internals:

```js
let currentProject = null;
let currentPhotoIndex = 0;

function openLightbox(projectId, photoIndex = 0) {
  currentProject = PROJECTS.find(p => p.id === projectId);
  currentPhotoIndex = photoIndex;

  // Track click in localStorage
  const key = 'clicks_' + projectId;
  const count = parseInt(localStorage.getItem(key) || '0', 10);
  localStorage.setItem(key, count + 1);

  lbMetaType.textContent = currentProject.type;
  lbMetaLoc.textContent  = currentProject.location;

  showPhotoAtIndex(currentPhotoIndex);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function showPhotoAtIndex(index) {
  const photo = currentProject.photos[index];
  const total = currentProject.photos.length;

  // Update counter
  lbPhotoCounter.textContent = total > 1 ? `${index + 1} / ${total}` : '';
  lbPrevBtn.style.display = total > 1 ? '' : 'none';
  lbNextBtn.style.display = total > 1 ? '' : 'none';

  if (photo.before && photo.after) {
    lbAfterImg.src  = photo.after;
    lbBeforeImg.src = photo.before;
    setSliderPosition(50);
    lbSlider.style.display = '';
    lbSingle.style.display = 'none';
  } else {
    lbSingleImg.src = photo.after || photo.before;
    lbSlider.style.display = 'none';
    lbSingle.style.display = '';
  }
}
```

**Step 2: Add prev/next buttons and photo counter to lightbox HTML**

Inside `.lightbox-inner`, after `.lightbox-close`:

```html
<div class="lb-nav">
  <button class="lb-prev" id="lbPrev">&#8592;</button>
  <span class="lb-photo-counter" id="lbPhotoCounter"></span>
  <button class="lb-next" id="lbNext">&#8594;</button>
</div>
```

**Step 3: Add CSS for lightbox nav**

```css
.lb-nav {
  position: absolute;
  top: -2.5rem;
  left: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.lb-prev, .lb-next {
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
  color: var(--gray-300);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.1rem 0.4rem;
  transition: color 0.2s;
  line-height: 1;
}

.lb-prev:hover, .lb-next:hover { color: var(--white); }

.lb-photo-counter {
  font-family: 'Oswald', sans-serif;
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.15em;
  color: var(--gray-600);
  min-width: 3rem;
  text-align: center;
}
```

**Step 4: Wire prev/next JS**

```js
const lbPrevBtn     = document.getElementById('lbPrev');
const lbNextBtn     = document.getElementById('lbNext');
const lbPhotoCounter = document.getElementById('lbPhotoCounter');

lbPrevBtn.addEventListener('click', () => {
  if (!currentProject) return;
  currentPhotoIndex = (currentPhotoIndex - 1 + currentProject.photos.length) % currentProject.photos.length;
  showPhotoAtIndex(currentPhotoIndex);
});

lbNextBtn.addEventListener('click', () => {
  if (!currentProject) return;
  currentPhotoIndex = (currentPhotoIndex + 1) % currentProject.photos.length;
  showPhotoAtIndex(currentPhotoIndex);
});

// Also wire left/right keyboard arrows (add to existing keydown handler)
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft')  lbPrevBtn.click();
  if (e.key === 'ArrowRight') lbNextBtn.click();
});
```

**Step 5: Verify in browser**

Open the Tallahassee Bathroom card. Lightbox should show "1 / 2" counter and prev/next arrows. Clicking next should show the second bathroom pair. Left/right keyboard arrows should navigate. Single-photo cards should show no counter or arrows.

**Step 6: Commit**

```bash
git add projects.html
git commit -m "feat: multi-photo lightbox with prev/next navigation"
```

---

## Task 4: Hero slider — HTML structure + CSS

**Files:**
- Modify: `projects.html` — add hero section HTML between `<nav>` and `.page-header`, add CSS

**Step 1: Add hero slider HTML**

Place directly after the closing `</nav>` tag:

```html
<!-- HERO SLIDER -->
<section class="hero-slider" id="heroSlider" aria-label="Featured projects">
  <div class="hero-slides" id="heroSlides"></div>

  <button class="hero-arrow hero-arrow-prev" id="heroPrev" aria-label="Previous slide">&#8592;</button>
  <button class="hero-arrow hero-arrow-next" id="heroNext" aria-label="Next slide">&#8594;</button>

  <div class="hero-dots" id="heroDots"></div>
</section>
```

**Step 2: Add CSS**

```css
/* ── HERO SLIDER ── */
.hero-slider {
  position: relative;
  width: 100%;
  height: 58vh;
  min-height: 320px;
  overflow: hidden;
  background: var(--gray-900);
  margin-top: 64px; /* nav height */
}

.hero-slides {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.6s ease;
  background-size: cover;
  background-position: center;
}

.hero-slide.active { opacity: 1; }

.hero-slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(26,26,26,0.82) 0%, rgba(26,26,26,0.1) 60%);
}

.hero-slide-content {
  position: absolute;
  bottom: 4rem;
  left: 5rem;
}

.hero-slide-type {
  font-family: 'Oswald', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--red-light);
  margin-bottom: 0.6rem;
}

.hero-slide-location {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(1.6rem, 3vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--white);
  line-height: 1.05;
  margin-bottom: 1.25rem;
}

.hero-slide-cta {
  font-family: 'Oswald', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--white);
  background: var(--red);
  border: none;
  padding: 0.65rem 1.4rem;
  cursor: pointer;
  transition: background 0.2s;
}

.hero-slide-cta:hover { background: var(--red-dark); }

.hero-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(26,26,26,0.5);
  color: var(--white);
  border: none;
  font-size: 1.4rem;
  width: 2.8rem;
  height: 2.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}

.hero-arrow:hover { background: rgba(26,26,26,0.85); }
.hero-arrow-prev { left: 1.5rem; }
.hero-arrow-next { right: 1.5rem; }

.hero-dots {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.hero-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}

.hero-dot.active { background: var(--white); }

/* Reduce page-header top padding since hero is now above it */
.page-header {
  padding-top: 5rem !important;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-slider { height: 52vw; min-height: 240px; }
  .hero-slide-content { bottom: 2.5rem; left: 1.5rem; }
  .hero-slide-location { font-size: 1.4rem; }
}
```

**Step 3: Verify structure in browser**

The hero section should appear as a tall dark band between nav and the page header. No slides yet (will be populated by JS in next task).

**Step 4: Commit**

```bash
git add projects.html
git commit -m "feat: hero slider HTML structure and CSS"
```

---

## Task 5: Hero slider JS — scoring, rendering, auto-advance

**Files:**
- Modify: `projects.html` — add hero slider JS functions

**Step 1: Add scoring function**

```js
function computeHeroOrder() {
  const now = Date.now();
  const MS_PER_DAY = 86400000;
  const RECENCY_WINDOW = 60; // days

  return [...PROJECTS]
    .map(p => {
      const clicks    = parseInt(localStorage.getItem('clicks_' + p.id) || '0', 10);
      const daysOld   = (now - new Date(p.addedDate).getTime()) / MS_PER_DAY;
      const random    = Math.random();
      const recency   = daysOld < RECENCY_WINDOW ? ((RECENCY_WINDOW - daysOld) / RECENCY_WINDOW) * 1.5 : 0;
      const clickScore = clicks > 0 ? Math.sqrt(clicks) * 0.4 : 1.2; // unclicked gets boost
      const score     = random + recency + clickScore;
      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score);
}
```

**Step 2: Add hero rendering function**

```js
let heroProjects = [];
let heroIndex = 0;
let heroTimer = null;

function buildHeroSlider() {
  heroProjects = computeHeroOrder();

  const slidesEl = document.getElementById('heroSlides');
  const dotsEl   = document.getElementById('heroDots');
  slidesEl.innerHTML = '';
  dotsEl.innerHTML   = '';

  heroProjects.forEach((p, i) => {
    const thumb = p.photos[0].after;

    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
    slide.style.backgroundImage = `url('${thumb}')`;
    slide.innerHTML = `
      <div class="hero-slide-overlay"></div>
      <div class="hero-slide-content">
        <p class="hero-slide-type">${p.type}</p>
        <p class="hero-slide-location">${p.location}</p>
        <button class="hero-slide-cta" data-id="${p.id}">View Project →</button>
      </div>`;
    slidesEl.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToHeroSlide(i));
    dotsEl.appendChild(dot);
  });

  // Wire CTA buttons
  slidesEl.querySelectorAll('.hero-slide-cta').forEach(btn => {
    btn.addEventListener('click', () => openLightbox(btn.dataset.id));
  });

  startHeroTimer();
}

function goToHeroSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  slides[heroIndex].classList.remove('active');
  dots[heroIndex].classList.remove('active');
  heroIndex = (index + heroProjects.length) % heroProjects.length;
  slides[heroIndex].classList.add('active');
  dots[heroIndex].classList.add('active');
}

function startHeroTimer() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => goToHeroSlide(heroIndex + 1), 4000);
}

// Pause on hover
document.getElementById('heroSlider').addEventListener('mouseenter', () => clearInterval(heroTimer));
document.getElementById('heroSlider').addEventListener('mouseleave', startHeroTimer);

// Arrow buttons
document.getElementById('heroPrev').addEventListener('click', () => {
  goToHeroSlide(heroIndex - 1);
  startHeroTimer(); // reset timer on manual nav
});
document.getElementById('heroNext').addEventListener('click', () => {
  goToHeroSlide(heroIndex + 1);
  startHeroTimer();
});
```

**Step 3: Call `buildHeroSlider()` inside DOMContentLoaded**

```js
document.addEventListener('DOMContentLoaded', () => {
  buildHeroSlider();
  renderCards();
  // filter pills init...
});
```

**Step 4: Verify in browser**

- Hero slider should show 8 slides cycling every 4 seconds with crossfade.
- Hovering the slider pauses it. Moving mouse away resumes.
- Prev/next arrows and dots should work.
- Clicking "View Project →" on a slide should open the lightbox for that project.
- Reload multiple times — slide order should vary slightly each time due to random component.
- Open a project a few times, then reload — that project should tend to appear earlier in the slider.

**Step 5: Commit**

```bash
git add projects.html
git commit -m "feat: hero slider with smart engagement-based ordering"
```

---

## Task 6: Final cleanup + responsive polish

**Files:**
- Modify: `projects.html` — responsive breakpoints for new elements

**Step 1: Verify mobile (375px)**

Use browser devtools to resize to 375px. Check:
- Hero slider fills width, content readable
- Filter pills wrap cleanly
- Grid goes to 1 column (or 2 col) — check existing breakpoints still apply
- Lightbox prev/next arrows don't overlap with close button

**Step 2: Fix any mobile issues found**

Add to the `@media (max-width: 640px)` block if needed:
```css
.filter-bar { padding: 1.5rem 1.5rem 0; }
.hero-arrow { width: 2.2rem; height: 2.2rem; font-size: 1.1rem; }
```

**Step 3: Verify existing slider drag fix still works**

Open the Jefferson County Kitchen card. Drag the before/after slider — should move cleanly without image dragging.

**Step 4: Final commit + push**

```bash
git add projects.html
git commit -m "polish: responsive fixes for hero slider and filter pills"
git push origin main
```
